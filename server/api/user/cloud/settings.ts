import ScraperDatabase from "~/server/src/db/scraper_db";
import { success } from "~/server/src/response";

export default defineEventHandler(async (event) => {
    try {
        assertMethod(event, "GET");
        const params = getQuery(event);
        const customer = params.customer_id?.toString();
        let scraper = await ScraperDatabase.get();
        let getRes = await scraper`
            SELECT * FROM cpa_cloud_migration_configuration c
            JOIN cpa_cloud_storage_option o on c.drive_option_id = o.id
            WHERE c.cpa_id = ${customer!} 
            ORDER BY c.updated_at DESC LIMIT 1`;
        return success(event, 200, getRes[0]);
    } catch (ex: any) {
        console.error(ex);
        throw createError({
            statusCode: 422,
            message: ex.toString(),
        });
    }
});
