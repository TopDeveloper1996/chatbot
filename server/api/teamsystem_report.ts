import axios, { isAxiosError } from "axios";
import { EventHandlerRequest, H3Event } from "h3";
import { error, success } from "~/server/src/response";
import UserDatabase from "../src/db/user_db";
const config = useRuntimeConfig();
async function updateDittaReport(event: H3Event<EventHandlerRequest>, reportBody: any): Promise<Object> {
    try {
        const query = getQuery(event);
        const ditta_id = reportBody.ditta_id?.toString();
        const cpa_id = reportBody.cpa_id ? parseInt(reportBody.cpa_id?.toString()) : null;
        const ts_report_summary = reportBody.ts_report_summary?.toString();
        const ts_report_final_comment = reportBody.ts_report_final_comment?.toString();
        let db = await UserDatabase.get();
        let res = await Promise.resolve(
            db`
            UPDATE ditta SET ts_report_final_comment = ${ts_report_final_comment!}, ts_report_summary = ${ts_report_summary!} WHERE ditta_number = ${ditta_id!} and customer_id = ${cpa_id!};
            `
        );
        let accounts = res;
        return success(event, 200, { accounts:accounts});
        } catch (ex: any) {
            console.error(ex);
            throw createError({
                statusCode: 422,
                message: ex.toString(),
            });
        }
    };


async function getDittaReport(event: H3Event<EventHandlerRequest>): Promise<Object> {
    try {
        const query = getQuery(event);
        const ditta_id = query.ditta_id?.toString();
        const cpa_id = query.cpa_id ? parseInt(query.cpa_id?.toString()) : null;
        let db = await UserDatabase.get();
        let res = await Promise.resolve(
            db`
            SELECT ts_report_summary, ts_report_final_comment FROM ditta WHERE ditta_number = ${ditta_id!} and customer_id = ${cpa_id!};
            `
        );
        let accounts = res;
        return success(event, 200, { accounts:accounts});
        } catch (ex: any) {
            console.error(ex);
            throw createError({
                statusCode: 422,
                message: ex.toString(),
            });
        }
    };
    


async function generateTsReport(event: H3Event<EventHandlerRequest>, dittaId: number, customerId:number, data:any, mode:string): Promise<Object> {
    let hasError = false;
    try {
        await axios.post(config.public.ts_email_report_url, {
            dittaId,
            customerId,
            data,
            mode
        });
    } catch (ex: any) {
        if (isAxiosError(ex)) {
            console.log(`error generating ts report: ${JSON.stringify(ex.response?.status, undefined, "  ")}`);
            console.error(`error sending emails ditta: ${ex.response?.data}`);
        }
        hasError = true;
    }
    if (hasError) {
        return error(event, 400, "error sending emails");
    }
    return success(event, 200, "ditta report generated");
}

export default defineEventHandler(async (event) => {
    try {
        if (event.method === "GET") {
            return await getDittaReport(event);
        } else if (event.method === "PATCH") {
            const model = await readBody(event);
            return await updateDittaReport(event, model);
        } else if (event.method === "POST") {
            const model = await readBody(event);
            return await generateTsReport(event, model.dittaId, model.customerId, model.data, model.mode);
        }
    } catch (ex: any) {
        console.error(ex);
        throw createError({
            statusCode: 422,
            message: ex.toString(),
        });
    }
});
