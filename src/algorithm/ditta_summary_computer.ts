import l from "lodash";
import { variation } from "../common/math";
import Timespan from "../timespan";

function computePeriod({
    invoices,
    fees,
    f24s,
    userDefinedCosts,
    userDefinedITDA,
}: {
    invoices: any[];
    f24s: any[];
    fees: any[];
    userDefinedCosts: any[];
    userDefinedITDA: any[];
}): DittaPeriodSummaryAnalytics {
    const revenue = { total: 0, fees: l.sumBy(fees, "total_without_iva"), fees_iva:l.sumBy(fees, "total_iva"), invoices: 0 ,invoices_iva: 0 };
    const ebitda= 0;
    const costs = { total: 0, invoices: 0, taxes: 0 , invoices_iva: 0};
    const clientIds: Set<string> = new Set();
    let isUserProvideData = false;
    let user_provided_costs = 0;
    let user_provided_itdas = 0;
    for (const invoice of invoices) {
        if (invoice["type"] === "attiva") {
            revenue.invoices += invoice["total_without_iva"];
            revenue.invoices_iva += invoice["total_iva"]
            clientIds.add(invoice["cliente_fornitore_id"]);
        } else if (invoice["type"] === "passiva") {
            costs.invoices += invoice["total_without_iva"];
            costs.invoices_iva += invoice["total_iva"]
        }
    }
    for (const user_cost of userDefinedCosts) { 
        user_provided_costs += Number(user_cost["income_statement_value"]);
        isUserProvideData = true;
    }
    for (const user_itdas of userDefinedITDA) { 
        user_provided_itdas += Number(user_itdas["income_statement_value"]);
        isUserProvideData = true;
    }
    const taxesCategories = ["versamenti reddito", "ires", "irap", "tasse locali", "tasse regionali"];
    for (const f24 of f24s) {
        for (const aggregationKey in f24.aggregations) {
            if (!taxesCategories.includes(aggregationKey)) continue;
            costs.taxes += f24.aggregations[aggregationKey].balance_amount;
        }
    }
  
    revenue.total = revenue.fees + revenue.invoices;
    costs.total = costs.invoices  + user_provided_costs;
    
    return {
        revenue: revenue,
        costs: costs,
        isUserProvideData: isUserProvideData,
        ebitda: revenue.total - costs.total,
        profit: revenue.total - costs.total - user_provided_itdas - costs.taxes,
        profitRatio: (revenue.total - costs.total - user_provided_itdas - costs.taxes) / revenue.total,
        activeClientIds: [...clientIds],
    };
}

export function computeDittaSummaryAnalytics({
    invoices,
    f24s,
    fees,
    userDefinedCosts,
    userDefinedITDA,
    firstPeriod,
    secondPeriod,
}: {
    invoices: any[];
    f24s: any[];
    fees: any[];
    userDefinedCosts: any[];
    userDefinedITDA: any[];
    firstPeriod: Timespan;
    secondPeriod: Timespan;
    
}): DittaSummaryAnalytics {
    const firstPeriodData = computePeriod({
        invoices: invoices.filter((i) => firstPeriod.fits(i["emission_date"])),
        f24s: f24s.filter((i) => firstPeriod.fits(i["application_date"])),
        fees: fees.filter((i) => firstPeriod.fits(i["detection_date"])),
        userDefinedCosts: userDefinedCosts.filter((i: any) => {
            const balance_period = new Date(i.period_year, i.period_month - 1, 2);
            return firstPeriod.fits(balance_period)
          }),
        userDefinedITDA: userDefinedITDA.filter((i: any) => {
            const balance_period = new Date(i.period_year, i.period_month - 1, 2);
            return firstPeriod.fits(balance_period)
          }),
    });
    const secondPeriodData = computePeriod({
        invoices: invoices.filter((i) => secondPeriod.fits(i["emission_date"])),
        f24s: f24s.filter((i) => secondPeriod.fits(i["application_date"])),
        fees: fees.filter((i) => secondPeriod.fits(i["detection_date"])),
        userDefinedCosts: userDefinedCosts.filter((i: any) => {
            const balance_period = new Date(i.period_year, i.period_month - 1, 2);
            return secondPeriod.fits(balance_period)
          }),
        userDefinedITDA: userDefinedITDA.filter((i: any) => {
            const balance_period = new Date(i.period_year, i.period_month - 1, 2);
            return secondPeriod.fits(balance_period)
          }),
    });
    return {
        firstPeriod: firstPeriodData,
        secondPeriod: secondPeriodData,
        variations: {
            revenue: {
                total: variation(firstPeriodData.revenue.total, secondPeriodData.revenue.total),
                invoices: variation(firstPeriodData.revenue.invoices, secondPeriodData.revenue.invoices),
                fees: variation(firstPeriodData.revenue.fees, secondPeriodData.revenue.fees),
            },
            costs: {
                total: variation(firstPeriodData.costs.total, secondPeriodData.costs.total),
                invoices: variation(firstPeriodData.costs.invoices, secondPeriodData.costs.invoices),
                taxes: variation(firstPeriodData.costs.taxes, secondPeriodData.costs.taxes),
            },
            ebitda: variation(firstPeriodData.ebitda, secondPeriodData.ebitda),
            profit: variation(firstPeriodData.profit, secondPeriodData.profit),
        },
        growth: variation(firstPeriodData.revenue.total, secondPeriodData.revenue.total),
        inactiveClients: l.difference([...firstPeriodData.activeClientIds], [...secondPeriodData.activeClientIds]),
        newClients: l.difference([...secondPeriodData.activeClientIds], [...firstPeriodData.activeClientIds]),
    };
}
