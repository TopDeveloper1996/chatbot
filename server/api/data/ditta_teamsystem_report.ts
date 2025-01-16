import l from "lodash";
import { computeDittaTeamsystemAggregations } from "~/src/algorithm/ditta_teamsystem_computer";
import { fetchTeamsystemAccounts } from "~/server/src/tools/fetcher";
import { error, success } from "~/server/src/response";
import Timespan from "~/src/timespan";
import { teamsystemAggregatationMode } from "~/src/types/teamsystem_types";
import { getDateLabel, getLastMonthDate, getTheCurrentQuarterWithYear } from "~/src/common/dates";


export default defineEventHandler(async (event) => {

    try {
        assertMethod(event, ["POST"]);
        const body = await readBody(event);
        console.log(body);
        const dittaId = l.toString(body.dittaId); // dittaId database ID (not ditta number)
        const customerId = body.customerId?.toString();
        const iva = l.toInteger(body.iva) ?? 10;
        const mode = l.toString(body.mode) ?? teamsystemAggregatationMode.MONTHLY

        const timespan = body.period ? new Timespan(new Date(body.period.from * 1000), new Date(body.period.to * 1000)) : Timespan.yearToDate();

        console.log(`ditta_teamsystem_report [fetch] started dittaId: ${dittaId}, customerId: ${customerId}, timespan: ${timespan}, iva: ${iva}, mode: ${mode}`);
        let start = performance.now();
        const teamsystemAccounts = (await fetchTeamsystemAccounts({ customerId, dittaIds: [dittaId] })).find((e) => e.dittaId === dittaId);
        if (!teamsystemAccounts) {
            return error(event, 404, "ditta not found");
        }
        const teamsystemAggregatin = await computeDittaTeamsystemAggregations({
            teamsystemAccounts: teamsystemAccounts.elements,
            ActiveTimespan: timespan,
            iva,
            mode,
        });
        const lastAvailableDate = teamsystemAggregatin.lastAvailableDate;
        const lastAvailableDateStr = lastAvailableDate ? getDateLabel(getLastMonthDate(lastAvailableDate)) : "";
        const lastFiscalYear = lastAvailableDate ? lastAvailableDate.getFullYear() - 1 : new Date().getFullYear() - 1;
        const focus = mode === teamsystemAggregatationMode.MONTHLY ? getDateLabel(getLastMonthDate(lastAvailableDate)) : getTheCurrentQuarterWithYear(lastAvailableDate);
        const teamsystemData = {
            ...teamsystemAggregatin,
            teamSystemLastAvailableDateStr: lastAvailableDateStr,
            lastFiscalYear,
            focus,
            focusPeriod: timespan ? timespan.toITLabel() : "YTD",
            iva: iva,
            dittaReport: teamsystemAccounts.report,
            categories: teamsystemAggregatin.categories,
        }
        console.log(`ditta_teamsystem_report [compute] completed in ${(performance.now() - start).toFixed(3)} ms`);
        return success(event, 200, teamsystemData);
    } catch (ex) {
        console.error(ex);
        return error(event, 403, "error retrieving data, exception in server. Check that request is correct.");
    }
});
