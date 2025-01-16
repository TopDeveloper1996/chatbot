import { error, success } from "~/server/src/response";
import ParserDatabase from "../src/db/parser_db";

export default defineEventHandler(async (event) => {
    try {
        const query = getQuery(event);
        const ditta = query.ditta_id?.toString();
        const period_year = query.period_year ? parseInt(query.period_year?.toString()) : new Date().getFullYear();
        const period_month = query.period_month ? parseInt(query.period_month?.toString()) : new Date().getMonth() + 1;
        
        let db = await ParserDatabase.get();
        let res = await Promise.resolve(
            db`
            SELECT detail.income_statement_type, detail.category, detail.income_statement_value, main.period_year, main.period_month 
            FROM ditta_income_statement_main main
            JOIN ditta_income_statement_detail detail
            ON main.id = detail.income_statement_main_id
            AND main.data_source = 'user'
            AND main.ditta_id = ${ditta!} 
            order by main.period_year desc, main.period_month desc
            `
        );
        let income_statements = res;
        return success(event, 200, { income_statements:income_statements});
    } catch (ex: any) {
        console.error(ex);
        throw createError({
            statusCode: 422,
            message: ex.toString(),
        });
    }
});
