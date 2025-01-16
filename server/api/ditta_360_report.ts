import axios, { isAxiosError } from "axios";
import { EventHandlerRequest, H3Event } from "h3";
import { error, success } from "~/server/src/response";
import UserDatabase from "../src/db/user_db";
const config = useRuntimeConfig();

async function updateDitta360Report(event: H3Event<EventHandlerRequest>, reportBody: any): Promise<Object> {
    try {
        const query = getQuery(event);
        const ditta_id = reportBody.ditta_id?.toString();
        const cpa_id = reportBody.cpa_id ? parseInt(reportBody.cpa_id?.toString()) : null;
        const ditta_360_report_summary = reportBody.ditta_report_summary?.toString();
        const ditta_360_report_final_comment = reportBody.ditta_report_final_comment?.toString();
        let db = await UserDatabase.get();
        let res = await Promise.resolve(
            db`
            UPDATE ditta SET ditta_360_report_final_comment = ${ditta_360_report_final_comment!}, ditta_360_report_summary = ${ditta_360_report_summary!} WHERE _ditta_id = ${ditta_id!} and customer_id = ${cpa_id!};
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


async function getDitta360Report(event: H3Event<EventHandlerRequest>): Promise<Object> {
    try {
        const query = getQuery(event);
        const ditta_id = query.ditta_id?.toString();
        const cpa_id = query.cpa_id ? parseInt(query.cpa_id?.toString()) : null;
        let db = await UserDatabase.get();
        let res = await Promise.resolve(
            db`
            SELECT ditta_360_report_summary, ditta_360_report_final_comment FROM ditta WHERE _ditta_id = ${ditta_id!} and customer_id = ${cpa_id!};
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


async function sendDitta360Report(event: H3Event<EventHandlerRequest>, dittaId: number, customerId:number, income_statement: any = {}, focusPeriodLabel: string): Promise<Object> {
    let hasError = false;
    try {
        const data : any = {};
        if (focusPeriodLabel !== "") {
            data["focus_period_label"] = focusPeriodLabel ;
        }
        if (income_statement) {
            data["income_statement"] = income_statement;
        }
        await axios.post(config.public.ditta_email_report_url, {
            dittaId,
            customerId,
            data,

        });
    } catch (ex: any) {
        if (isAxiosError(ex)) {
            console.log(`error generating ditta360 report: ${JSON.stringify(ex.response?.status, undefined, "  ")}`);
            console.error(`error sending email for ditta360 report: ${JSON.stringify(ex.response?.data, undefined, "  ")}`);
        }
        hasError = true;
    }
    if (hasError) {
        return error(event, 400, "error sending email for ditta360 report");
    }
    return success(event, 200, "ditta360 report sent");
}

export default defineEventHandler(async (event) => {
    const params = getQuery(event);
    try {
        if (event.method === "POST") {
            const model = await readBody(event);
            return await sendDitta360Report(event, model.dittaId, model.customerId, model.income_statement ?? {}, model.focusPeriodLabel ?? "");
        }
        else if (event.method === "GET") {
            return await getDitta360Report(event);
        } 
        else if (event.method === "PATCH") {
            const model = await readBody(event);
            return await updateDitta360Report(event, model);
        } 
    } catch (ex: any) {
        console.error(ex);
        throw createError({
            statusCode: 422,
            message: ex.toString(),
        });
    }
});
