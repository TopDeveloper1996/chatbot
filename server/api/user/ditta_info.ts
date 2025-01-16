import AnalyticsDatabase, { Database } from "~/server/src/db/analytics_db";
import { success } from "~/server/src/response";

export default defineEventHandler(async (event) => {
    //let db = await ScraperDatabase.get();
    const params = getQuery(event);
    const customer = params.customer_id?.toString();
    //const ditta = params.ditta_id?.toString();
    try {
        let endpoint = await AnalyticsDatabase.getDb(Database.ditta);
        let r = await endpoint.collection(customer!).find({}).toArray();
        return success(event, 200, r);
    } catch (ex: any) {
        console.error(ex);
        throw createError({
            statusCode: 422,
            message: ex.toString(),
        });
    }
});
