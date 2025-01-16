import { error, success } from "~/server/src/response";
import ScraperDatabase from "../src/db/scraper_db";

export default defineEventHandler(async (event) => {
    try {
        const query = getQuery(event);
        const customerId = query.customer_id?.toString();
        let db = await ScraperDatabase.get();
        const last48h = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(); // 48h
        let res = await Promise.resolve(
            db`
            SELECT 
                updated_at,
                created_at,
                ditta_id, 
                report_start_date, 
                report_end_date, 
                status, 
                job_id, 
                task_id 
            FROM 
                teamsystem_report_scraper_queue 
            WHERE 
                cpa_id = ${customerId!} 
                and created_at > ${last48h}
            order by 
                created_at desc
            `
        );
        return success(event, 200, { teamsystemQueue: res});
    } catch (ex: any) {
        console.error(ex);
        throw createError({
            statusCode: 422,
            message: ex.toString(),
        });
    }
});
