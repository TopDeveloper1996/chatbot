import axios, { isAxiosError } from "axios";
import { EventHandlerRequest, H3Event } from "h3";
import { error, success } from "~/server/src/response";

const config = useRuntimeConfig();

async function generateDittaReport(event: H3Event<EventHandlerRequest>, dittaId: number, customerId:number): Promise<Object> {
    let hasError = false;
    try {
        let result = await axios.post(config.public.ditta_report_url + "generate_report", {
            dittaId,
            customerId
        });
    } catch (ex: any) {
        if (isAxiosError(ex)) {
            console.error(`error sending general ditta report emails: ${ex.response?.data}`);
        }
        hasError = true;
    }
    if (hasError) {
        return error(event, 400, "error general ditta report emails");
    }
    return success(event, 200, "general ditta report emails sent");
}

export default defineEventHandler(async (event) => {
    try {
        if (event.method === "POST") {
            const model = await readBody(event);
            // console.log(`POST model: ${JSON.stringify(model, undefined, "  ")}`);
            return await generateDittaReport(event, model.dittaId, model.customerId);
        }
    } catch (ex: any) {
        console.error(ex);
        throw createError({
            statusCode: 422,
            message: ex.toString(),
        });
    }
});
