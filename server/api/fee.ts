import AnalyticsDatabase, { Database } from "../src/db/analytics_db";
import { success } from "../src/response";

export default defineEventHandler(async (event) => {
    try {
        const body = await readBody(event);
        const query = getQuery(event);
        const customer = query.customer_id?.toString();
        let endpoint = await AnalyticsDatabase.getDb(Database.fee);
        let r = await endpoint.collection(customer!).find(body).toArray();
        return success(event, 200, r);
    } catch (ex: any) {
        throw createError({
            statusCode: 422,
            message: ex.toString(),
        });
    }
});
