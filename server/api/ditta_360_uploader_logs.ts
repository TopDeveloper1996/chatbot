import { error, success } from "~/server/src/response";
import ScraperDatabase from "../src/db/scraper_db";
import { EventHandlerRequest, H3Event } from "h3";

async function insert_new_upload_log(event: H3Event<EventHandlerRequest>): Promise<Object> {
    try {
        const query = getQuery(event);
        const dittaId = query.dittaId?.toString();
        const customerId = query.customerId?.toString();
        const file_name = query.fileName?.toString();
        const file_path = query.filePath?.toString();
        const file_type = query.fileType?.toString();
        const file_size = query.fileSize?.toString();
        let db = await ScraperDatabase.get();
        let res = await Promise.resolve(
            db`
            INSERT INTO 
                ditta_360_file_upload_logs 
            (cpa_id, ditta_id, file_name, file_path, file_type, file_size, processing_status, upload_timestamp)
            VALUES 
            (${customerId!}, ${dittaId!}, ${file_name!}, ${file_path!}, ${file_type!}, ${file_size!}, 'PROCESSING', ${new Date()})
            RETURNING id
            `
        );
        if (res){
        let upload_id = res[0].id;
        return success(event, 200, { id: upload_id });
        }
        else {
            throw createError({
                statusCode: 500,
                message: "failed to create uploaded tracker log",
            });
        }
    } catch (ex: any) {
        console.error(ex);
        throw createError({
            statusCode: 422,
            message: ex.toString(),
        });
    }
};

export default defineEventHandler(async (event) => {
    try {
        if (event.method === "POST") {
            return await insert_new_upload_log(event);
        } 
    } catch (ex: any) {
        console.error(ex);
        throw createError({
            statusCode: 422,
            message: ex.toString(),
        });
    }
});
