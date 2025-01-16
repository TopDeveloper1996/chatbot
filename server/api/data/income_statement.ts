import l from "lodash";
import { error, success } from "~/server/src/response";
import { fetchF24, fetchInvoices } from "~/server/src/tools/fetcher";
import { computeIncomeStatementAnalytics } from "~/src/algorithm/income_statement_computer";
import DateBuilder from "~/src/date_builder";

export default defineEventHandler(async (event) => {
    try {
        assertMethod(event, ["POST"]);
        const body = await readBody(event);
        const dittaIds = l.uniq<any>(body.dittaIds);
        const customerId = body.customerId?.toString();
        const maxDate = new Date();
        const minDate = new DateBuilder().withDate({ year: maxDate.getFullYear() - 3 }).get();
        let start = performance.now();
        const data = await Promise.all([
            fetchInvoices({ customerId: customerId, dittaIds: dittaIds, from: minDate, to: maxDate }),
            fetchF24({ customerId: customerId, dittaIds: dittaIds, from: minDate, to: maxDate }),
        ]);
        console.log(`income_statement [fetch] completed in ${(performance.now() - start).toFixed(3)} ms`);
        start = performance.now();
        const analytics: any = {};
        for (const dittaEntry of data[0]) {
            const f24Entry = data[1].find((e) => e.dittaId === dittaEntry.dittaId);
            const dittaAnalytics = computeIncomeStatementAnalytics({
                invoices: dittaEntry.elements,
                f24s: f24Entry?.elements ?? [],
                fees: []
            });
            analytics[dittaEntry.dittaId] = dittaAnalytics;
        }
        console.log(`income_statement [compute] completed in ${(performance.now() - start).toFixed(3)} ms`);
        return success(event, 200, analytics);
    } catch (ex) {
        console.error(ex);
        return error(event, 403, "error retrieving data, exception in server. Check that request is correct.");
    }
});
