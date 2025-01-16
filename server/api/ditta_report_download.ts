import axios, { isAxiosError } from "axios";
import { EventHandlerRequest, H3Event } from "h3";
import { error, success } from "~/server/src/response";
import UserDatabase from "../src/db/user_db";
const config = useRuntimeConfig();


async function generateDittaPDFReport(event: H3Event<EventHandlerRequest>, dittaId: number, customerId:number, data:any = {}): Promise<Object> {
    let hasError = false;
    try {
        const response = await axios.post(config.public.ditta_pdf_report_url, {
            dittaId,
            customerId,
            data,
        }).then((response) => {
            const blob = new Blob([response.data], { type: 'application/pdf' });
            return success(event, 200, { blob });
        });
        return response;
    } catch (ex: any) {
        if (isAxiosError(ex)) {
            console.log(`error generating ditta report: ${JSON.stringify(ex.response?.status, undefined, "  ")}`);
        }
        hasError = true;
    }
    if (hasError) {
        return error(event, 400, "error downoading pdf report");
    }
    return success(event, 200, "ditta report downloaded");
}

export default defineEventHandler(async (event) => {
    const params = getQuery(event);
    try {
        if (event.method === "POST") {
            const model = await readBody(event);
            return await generateDittaPDFReport(event, model.dittaId, model.customerId, model.data ?? {});
        }
    } catch (ex: any) {
        console.error(ex);
        throw createError({
            statusCode: 422,
            message: ex.toString(),
        });
    }
});
