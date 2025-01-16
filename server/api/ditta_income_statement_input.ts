import { EventHandlerRequest, H3Event } from "h3";
import { error, success } from "~/server/src/response";
import ParserDatabase from "../src/db/parser_db";


async function getDittaIncomeStatement(event: H3Event<EventHandlerRequest>,): Promise<Object> {
    try {
        assertMethod(event, ["GET"]);
        const query = getQuery(event);
        const dittaId = query.dittaId?.toString();
        const customerId = query.customerId?.toString();
        const year = query.year;
        const month = query.month;
        let start = performance.now();
        let db = await ParserDatabase.get();
        let res = await Promise.resolve(
            db`
            SELECT 
                detail.income_statement_type,
                detail.category,
                detail.sub_category,
                detail.income_statement_value,
                main.period_year,
                main.period_month 
            FROM ditta_income_statement_main main
            JOIN ditta_income_statement_detail detail
            ON main.id = detail.income_statement_main_id
            AND main.data_source = 'user'
            AND main.customer_id = ${customerId!}
            AND main.ditta_id = ${dittaId!} 
            AND main.period_year = ${year!}
            AND main.period_month = ${month!}
            `
        );
        let income_statements = res;
        console.log(`income_statement [fetch] completed in ${(performance.now() - start).toFixed(3)} ms`);
        return success(event, 200, income_statements);
    } catch (ex) {
        console.error(ex);
        return error(event, 403, "error retrieving data, exception in server. Check that request is correct.");
    }
};


async function UpdateOrCreateSingleStatement(detail: any, dittaId:number,customerId: number, main_id:number): Promise<Object> {
    try {
        let db = await ParserDatabase.get();
        // check if detail exists
        const category = detail.category || null;
        const sub_category = detail.sub_category || null;
        let res =  await Promise.resolve(
                db`
                SELECT * FROM ditta_income_statement_detail WHERE income_statement_main_id = ${main_id} AND category = ${category!} AND sub_category = ${sub_category!};
                `
            );
        let income_statement_detail = res;
        if (income_statement_detail.length === 0 && detail.income_statement_value != 0) {
            res = await Promise.resolve(
                db`
                INSERT INTO 
                    ditta_income_statement_detail 
                (income_statement_main_id, category,sub_category, income_statement_value, income_statement_type, created_at, updated_at, customer_id, ditta_id)
                VALUES 
                (${main_id}, ${category!},${sub_category}, ${detail.income_statement_value!}, ${detail.income_statement_type!}, NOW(), NOW(), ${customerId!}, ${dittaId!})
                `
            );
        } else if (detail.income_statement_value != 0) {
            const income_statement_detail_id = income_statement_detail[0].id;
            res = await Promise.resolve(
                db`
                UPDATE 
                    ditta_income_statement_detail 
                SET 
                    income_statement_value = ${detail.income_statement_value!}, 
                    income_statement_type = ${detail.income_statement_type!}, 
                    updated_at = NOW()
                WHERE 
                    id = ${income_statement_detail_id}
                `
            );
        }
        return { message: "success" };
    } catch (ex: any) {
        console.error(ex);
        throw createError({
            statusCode: 422,
            message: ex.toString(),
        });
    }

}

async function UpdateOrCreateDittaIncomeDispatcher(event: H3Event<EventHandlerRequest>, model: any): Promise<Object> {
    try {
        let db = await ParserDatabase.get();
        let res = await Promise.resolve(
            db`
            SELECT * FROM ditta_income_statement_main WHERE ditta_id = ${model.dittaId!} AND customer_id = ${model.customerId!} AND period_year = ${model.period_year!} AND period_month = ${model.period_month!};
            `
        );
        let income_statement = res;
        if (income_statement.length === 0) {
            res = await Promise.resolve(
                db`
                INSERT INTO 
                    ditta_income_statement_main 
                (ditta_id, customer_id, period_year, period_month, data_source, created_at, updated_at)
                VALUES 
                (${model.dittaId!}, ${model.customerId!}, ${model.period_year!}, ${model.period_month!}, 'user', NOW(), NOW())
                `
            );
            income_statement = res;
        }
        let main_id = income_statement[0].id;
        await Promise.all(model.details.map(async (detail: any) => {
            return await UpdateOrCreateSingleStatement(detail, model.dittaId, model.customerId, main_id);
        }));
        return success(event, 200, { message: "success" });
    } catch (ex: any) {
        console.error(ex);
        throw createError({
            statusCode: 422,
            message: ex.toString(),
        });
    }
};


async function  UpdateOrCreateDittaIncomeStatement(event: H3Event<EventHandlerRequest>, model: any): Promise<Object> {
    try {
        await Promise.all(Object.entries(model.data).map(async (monthYear: any) => {
            const monthYearSplit = monthYear[0].split("-");
            const year = monthYearSplit[0];
            const month = monthYearSplit[1];
            await UpdateOrCreateDittaIncomeDispatcher(event, {
                dittaId: model.dittaId,
                customerId: model.customerId,
                period_year: year,
                period_month: month,
                details: monthYear[1]
            });
        }));
        return success(event, 200, { message: "success" });
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
        if (event.method === "GET") {
            return await getDittaIncomeStatement(event);
        } else if (event.method === "PATCH") {
            console.log({model: await readBody(event)});
            const model = await readBody(event);
            return await UpdateOrCreateDittaIncomeStatement(event, model);
        }
    } catch (ex: any) {
        console.error(ex);
        throw createError({
            statusCode: 422,
            message: ex.toString(),
        });
    }
});
