import axios, { isAxiosError } from "axios";
import { EventHandlerRequest, H3Event } from "h3";
import { error, success } from "~/server/src/response";
const config = useRuntimeConfig();


async function processUploadedData(event: H3Event<EventHandlerRequest>): Promise<Object> {
    let hasError = false;
    try {
        // const url = config.public.ditta_360_upload_excel_processor_url
        const url = 'https://customer-upload-data-processor.azurewebsites.net/api/process-upload'
        const query = getQuery(event);
        const uploadedId = query.uploadedId?.toString();
        const process_response = await axios.post(`${url}/${uploadedId}`).then((response) => {
            return success(event, 200, { res:response.data });
        });
        return process_response;
    } catch (ex: any) {
        if (isAxiosError(ex)) {
            console.log(`error accessing Excel processor API: ${JSON.stringify(ex.response?.status, undefined, "  ")}`);
        }
        hasError = true;
    }
    if (hasError) {
        return error(event, 400, "error accessing Excel processor API");
    }
    return success(event, 200, "unknown status on accessing Excel processor API");
}

export default defineEventHandler(async (event) => {
    try {
        if (event.method === "POST") {
            return await processUploadedData(event);
        }
    } catch (ex: any) {
        console.error(ex);
        throw createError({
            statusCode: 422,
            message: ex.toString(),
        });
    }
});
