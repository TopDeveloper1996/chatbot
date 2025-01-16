import { error, success } from "~/server/src/response";
import ScraperDatabase from "../src/db/scraper_db";

export default defineEventHandler(async (event) => {
    try {
        const query = getQuery(event);
        const customer = query.customer_id?.toString();
        let db = await ScraperDatabase.get();
        let res = await Promise.all([
            db`
            SELECT i.*, d.ditta_number, d.registered_name, d.appointed_collaborator FROM invoices i JOIN ditta d on d.id = i.ditta_id WHERE i.cpa_id = ${customer!}
            `,
            db`
            SELECT i.*, d.ditta_number, d.registered_name, d.appointed_collaborator FROM fees i JOIN ditta d on d.id = i.ditta_id WHERE i.cpa_id = ${customer!}
            `,
            db`
            SELECT i.*, d.ditta_number, d.registered_name, d.appointed_collaborator FROM cf_versamenti i JOIN ditta d on d.id = i.ditta_id WHERE i.cpa_id = ${customer!}
            `,
        ]);
        let invoicesRes = res[0];
        let feesRes = res[1];
        let f24Res = res[2];
        return success(event, 200, { invoices: invoicesRes, fees: feesRes, f24: f24Res });
    } catch (ex: any) {
        console.error(ex);
        throw createError({
            statusCode: 422,
            message: ex.toString(),
        });
    }
});
