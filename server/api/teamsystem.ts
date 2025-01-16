import { error, success } from "~/server/src/response";
import { EventHandlerRequest, H3Event } from "h3";
import ParserDatabase from "../src/db/parser_db";
import axios from "axios";
import { log_level, log_type } from "~/server/src/log_detail";
const config = useRuntimeConfig();

const notification_email_receivers = config.notification_email_receivers;
const sendLogsToMonitorServer = async (customer_ID, ditta_id, log_type, log_level, service, message) => {
    return;
    console.log("send email")
      const postData = {
        customer_id: customer_ID,
        ditta_id : ditta_id,
        log_type : log_type,
        log_level : log_level,
        service: service,
        ipaddress: 'https://adementally.azurewebsites.net/teamsystem',
        message : message
      };

      try {
        const response = await axios.post(
          "http://localhost:7072/api/monitor_adementally_system",
          postData
        );

        const isSuccess = response.data === "success";
        console.log("logging server connected : ")

      } catch (ex: any) {
        if (ex.code === "ECONNREFUSED" || ex.code === "ENOTFOUND") {
          throw new Error("Server is down");
        }
        console.error(
          `Download is failed, Try again`
        );
      }
    }
async function getAccounts(event: H3Event<EventHandlerRequest>) : Promise<any> {
    let customer_id_temp ;
    let ditta_id_temp ;
    try {
        const query = getQuery(event);
        const customerId = query.customer_id?.toString();
        const ditta = query.ditta_id?.toString();
        let db = await ParserDatabase.get();
        let res = await Promise.resolve(
            db`
            SELECT opening_balance_amount, balance_amount , balance_date, account,from_date, to_date,period_year, period_month, updated_at FROM ditta_account_balance WHERE ditta_id = ${ditta!} and customer_id = ${customerId!} order by from_date desc
            `
        );
        let accounts = res;
        await sendLogsToMonitorServer(customer_id_temp = customerId, ditta_id_temp = ditta, log_type.Backend_Response, log_level.info, "backend-service", " The server is responded"); 
        return success(event, 200, { accounts:accounts});
    } catch (ex: any) {
        console.error(ex);
        await sendLogsToMonitorServer(customer_id_temp, ditta_id_temp, log_type.Backend_Response, log_level.error, "backend-service", " The server is not responding"); 
        const emailData = {
            receiver: notification_email_receivers,
            subject: `System status for Customer ${customer_id_temp}`,
            htmlMessage: `<p>The API server is not responding:</p>adementally.mongocluster.cosmos.azure.com`,
            plainMessage:"The server is not responding",
        };
        await axios.post('/api/send_email', emailData);
        throw createError({
            statusCode: 422,
            message: ex.toString(),
        });
    }
};

const getLastAvailableBalance = async (event:any) => {
    try {
        const query = getQuery(event);
        const customerId = query.customer_id?.toString();
        const ditta = query.ditta_id?.toString();
        let db = await ParserDatabase.get();
        let res = await Promise.resolve(
            db`
            SELECT opening_balance_amount, balance_amount , balance_date, account,from_date, to_date,period_year, period_month FROM ditta_account_balance WHERE ditta_id = ${ditta!} and customer_id = ${customerId!} order by from_date desc limit 1
            `
        );
        let accounts = res;
        return { accounts:accounts};
    } catch (ex: any) {
        console.error(ex);
        throw createError({
            statusCode: 422,
            message: ex.toString(),
        });
    }
};

const startTSAsync = async (event: H3Event<EventHandlerRequest>) => {
    const query = getQuery(event);
    const customerId = query.customer_id?.toString();
    const dittaId = query.ditta_id?.toString();
    const start_date = query.start_date?.toString();
    const end_date = query.end_date?.toString();

    const options = {
        method: 'POST',
        url: config.ditta_report_robot_url,
        params: {
          cpa_id: customerId,
          ditta_id: dittaId,
          start_date: start_date,
          end_date: end_date,
        }
      };
    let customer_id_temp : any;
    let ditta_id_temp;
    try {
        axios.request(options).then(function (response) {
            sendLogsToMonitorServer(customer_id_temp = customerId, ditta_id_temp = dittaId, log_type.Azure_Request, log_level.info, "robot-service", " The robot work is requested"); 
            console.log(response.data);
          }).catch(function (error) {
            const emailData = {
                receiver: notification_email_receivers,
                subject: `System status for Customer ${customer_id_temp}`,
                htmlMessage: `<p>The robot work is not requested:</p>adementally.robot.cosmos.azure.com`,
                plainMessage:"The robot work is not requested",
            };
            axios.post('/api/send_email', emailData);
            console.error(error);
          });
    } catch (ex: any) {
        console.error(ex);
        sendLogsToMonitorServer(customer_id_temp = customerId, ditta_id_temp = dittaId, log_type.Backend_Response, log_level.warn, "robot-service", " The robot is not working"); 
        const emailData = {
            receiver: notification_email_receivers,
            subject: `System status for Customer ${customer_id_temp}`,
            htmlMessage: `<p>The robot not working:</p>adementally.robot.cosmos.azure.com`,
            plainMessage:" The robot is not working",
        };
        axios.post('/api/send_email', emailData);
        return error(event, 422, ex.toString());
    }
}


export default defineEventHandler(async (event) => {
    const query = getQuery(event);
    const operation = query.operation || "get_accounts"
    switch (operation) {
        case "start_ts_async":
            return await startTSAsync(event);
        case "last_available_balance":
            const lastAvailableBalance = await getLastAvailableBalance(event);
            return success(event, 200, lastAvailableBalance);
        case "get_accounts" :
            return await getAccounts(event);
    }
    }
);
