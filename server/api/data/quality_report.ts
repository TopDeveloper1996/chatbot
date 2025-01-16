import l from "lodash";
import { error, success } from "~/server/src/response";
import { fetchF24, fetchFees, fetchInvoices } from "~/server/src/tools/fetcher";
import { computeQualityReport } from "~/src/algorithm/quality_report_computer";
import Timespan from "~/src/timespan";
import { QualityReport } from "~/src/types/quality_report_types";

export default defineEventHandler(async (event) => {
    try {
        assertMethod(event, ["POST"]);
        const body = await readBody(event);
        const dittaIds = l.uniq<any>(body.dittaIds);
        const customerId = body.customerId?.toString();

        const timespan = new Timespan(new Date(body.period.from * 1000), new Date(body.period.to * 1000));

        let start = performance.now();
        const [invoices, f24, fees] = await Promise.all([
            fetchInvoices({ customerId: customerId, dittaIds: dittaIds, from: timespan.from, to: timespan.to }),
            fetchF24({ customerId: customerId, dittaIds: dittaIds, from: timespan.from, to: timespan.to }),
            fetchFees({ customerId: customerId, dittaIds: dittaIds, from: timespan.from, to: timespan.to }),
        ]);
        console.log(`quality_report [fetch] completed in ${(performance.now() - start).toFixed(3)} ms`);
        start = performance.now();

        const analytics: { [key: string]: QualityReport } = {};
        for (const invoice of invoices) {
            const f24Entry = f24.find((e) => e.dittaId === invoice.dittaId)?.elements ?? [];
            const feesEntry = fees.find((e) => e.dittaId === invoice.dittaId)?.elements ?? [];

            analytics[invoice.dittaId] = computeQualityReport({
                invoices: invoice.elements,
                f24s: f24Entry,
                fees: feesEntry,
            });
        }
        console.log(`quality_report [compute] completed in ${(performance.now() - start).toFixed(3)} ms`);
        return success(event, 200, analytics);
    } catch (ex) {
        console.error(ex);
        return error(event, 403, "error retrieving data, exception in server. Check that request is correct.");
    }
});
