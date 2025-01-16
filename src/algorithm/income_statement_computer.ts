import l from "lodash";
import { percentage } from "../common/math";
import Timespan from "../timespan";
import * as stringUtils from "~/src/common/string";
import { IncomeStatementAnalytics, IncomeStatementSectionData } from "../types/income_statement_types";
import { invoicesComputeRevenueCostStats, invoicesComputeRevenueCostStatsComparison } from "./invoice_computer";

const f24GetCostsInTimespan = ({
    documents,
    categories,
    timespan,
}: {
    documents: any[];
    categories: string[];
    timespan: Timespan;
}): any => {
    let map: any = {};
    categories.forEach((c) => (map[c] = 0));
    for (const doc of documents) {
        if (!timespan.fits(doc.application_date)) continue;
        for (const aggregationKey in doc.aggregations) {
            if (!categories.includes(aggregationKey)) continue;
            map[aggregationKey] += doc.aggregations[aggregationKey].balance_amount;
        }
    }
    return map;
};

function aggregateUserProvidedCategoriesData(elements: any[]): Aggregation<string>[] {
    let categories: any = {};
    for (const model of elements) {
        if (!stringUtils.isNullOrEmpty(model["category"])) {
            const cat = stringUtils.capitalize(model["category"])!;
            let v = categories[cat] ?? { key: cat, elements: [] };
            v.elements.push(model);
            categories[cat] = v;
        } else {
            const category = "Non classificate";
            let v = categories[category] ?? { key: category, elements: [] };
            v.elements.push(model);
            categories[category] = v;
        }
    }
    return Object.values(categories);
}

function getF24CategoriesData(documents: any[], first: Timespan, second: Timespan, focus_timespan?: Timespan) {
    const taxesCategories = ["versamenti reddito", "ires", "irap"];
    const firstData = f24GetCostsInTimespan({
        documents: documents,
        categories: taxesCategories,
        timespan: first,
    });
    const secondData = f24GetCostsInTimespan({
        documents: documents,
        categories: taxesCategories,
        timespan: second,
    });
    const focusData = f24GetCostsInTimespan({
        documents: documents,
        categories: taxesCategories,
        timespan: focus_timespan ?? Timespan.yearToDate(),
    });
    let map: any = {};
    for (const cat of taxesCategories) {
        if (firstData[cat] == 0 && secondData[cat] == 0 && focusData[cat] == 0) continue;
        map[cat] = { first: firstData[cat], second: secondData[cat], focus: focusData[cat] };
    }
    return map;
}


function getIncomeStatementSectionData(
    title: string,
    data: {
        labels: string[];
        invoices: InvoiceRevenueCostCategoriesComparison;
        f24: { categories: any; firstPeriodSum: number; secondPeriodSum: number; focusPeriodSum?:number };
        focused_column?: boolean;
        focused_value?: InvoiceRevenueCostStatistics;
    }[]
): IncomeStatementSectionData {
    const allRevenueCategories = l.uniq(
        data
            .map((d) => d.invoices.categories.filter((c) => c.firstRevenue > 0 || c.secondRevenue > 0))
            .reduce((a, b) => a.concat(b.map((i) => i.category)), <string[]>[])
    );
    let allCostsCategories = l.uniq(
        data
            .map((d) => d.invoices.categories.filter((c) => c.firstCosts > 0 || c.secondCosts > 0))
            .reduce((a, b) => a.concat(b.map((i) => i.category)), <string[]>[])
    );
    const requiredCostCategories = ['Costi fissi e variabili cumulativi','Costo del lavoro', 'Altri costi operativi'];
    let missingCostsCategories = requiredCostCategories?.filter((i: any) => {
        return allCostsCategories.indexOf(i)===-1;
      });
    
    // allCostsCategories.push(...missingCostsCategories)
    allCostsCategories = ['Costi fissi e variabili cumulativi','Costo del lavoro', 'Altri costi operativi'];

    let allITDACategories = l.uniq(
        data
            .map((d) => d.invoices.categories.filter((c) => c.firstItda > 0 || c.secondItda > 0))
            .reduce((a, b) => a.concat(b.map((i) => i.category)), <string[]>[])
    );
    const requiredITDACategories = ['Oneri finanziari e bancari (+/-)', 'Ammortamenti, svalutazioni e altri accantonamenti'];
    let missingITDACategories = requiredITDACategories?.filter((i: any) => {
        return allITDACategories.indexOf(i)===-1;
      });
  
    // allITDACategories.push(...missingITDACategories)
    allITDACategories = ['Oneri finanziari e bancari (+/-)', 'Ammortamenti, svalutazioni e altri accantonamenti'];


    const allF24Categories = l.uniq(
        data.map((d) => Object.keys(d.f24.categories)).reduce((a, b) => a.concat(b), <string[]>[])
    );

    return {
        title: title,
        headers: data.reduce((acc, val) => acc.concat(val.labels), <string[]>[]),
        recap: {
            revenues: data.reduce((acc, val) => {
                if (val.focused_column==true) {
                return acc.concat([
                    { val: val.focused_value?.revenue ?? 0, type: "currency", category: "revenue" },
                    { val: val.invoices.second.revenue, type: "currency", category: "revenue" },
                    { val: val.invoices.first.revenue, type: "currency", category: "revenue" },
                    {
                        val: percentage(val.invoices.first.revenue, val.invoices.second.revenue),
                        type: "percentage",
                        category: "revenue",
                    },
                ]);
                }
                else{ return acc.concat([
                    { val: val.invoices.second.revenue, type: "currency", category: "revenue" },
                    { val: val.invoices.first.revenue, type: "currency", category: "revenue" },
                    {
                        val: percentage(val.invoices.first.revenue, val.invoices.second.revenue),
                        type: "percentage",
                        category: "revenue",
                    },
                ]);
                }
            }, <ValueCell[]>[]),
            costs: data.reduce((acc, val) => {
                const first_cost = val.invoices.first.costs;
                const second_cost = val.invoices.second.costs;
                if (val.focused_column==true) {
                return acc.concat([
                    { val: val.focused_value?.costs ?? 0, type: "currency", category: "cost" },
                    { val: second_cost, type: "currency", category: "cost" },
                    { val: first_cost, type: "currency", category: "cost" },
                    {
                        val: percentage(first_cost, second_cost),
                        type: "percentage",
                        category: "cost",
                    },
                ]);
                }
                else { return acc.concat([
                    { val: second_cost, type: "currency", category: "cost" },
                    { val: first_cost, type: "currency", category: "cost" },
                    {
                        val: percentage(first_cost, second_cost),
                        type: "percentage",
                        category: "cost",
                    },
                ]);
                }
            }, <ValueCell[]>[]),
            preTaxMargin: data.reduce((acc, val) => {
                const first_tax_margin = val.invoices.first.margin;
                const second_tax_margin = val.invoices.second.margin;
                if (val.focused_column==true) {
                return acc.concat([
                    { val: val.focused_value?.margin ?? 0, type: "currency", category: "revenue" },
                    { val: second_tax_margin, type: "currency", category: "revenue" },
                    { val: first_tax_margin, type: "currency", category: "revenue" },
                    {
                        val: percentage(first_tax_margin, second_tax_margin),
                        type: "percentage",
                        category: "revenue",
                    },
                ]);
                }
                else {return acc.concat([
                    { val: second_tax_margin, type: "currency", category: "revenue" },
                    { val: first_tax_margin, type: "currency", category: "revenue" },
                    {
                        val: percentage(first_tax_margin, second_tax_margin),
                        type: "percentage",
                        category: "revenue",
                    },
                ]);
                }
            }, <ValueCell[]>[]),
            ebitda: data.reduce((acc, val) => {
                const first_ebitda = val.invoices.first.ebitda;
                const second_ebitda = val.invoices.second.ebitda;
                if (val.focused_column==true) {
                return acc.concat([
                    { val: val.focused_value?.ebitda ?? 0, type: "currency", category: "cost" },
                    { val: second_ebitda, type: "currency", category: "cost" },
                    { val: first_ebitda, type: "currency", category: "cost" },
                    {
                        val: percentage(first_ebitda, second_ebitda),
                        type: "percentage",
                        category: "cost",
                    },
                ]);
                }
                else {return acc.concat([
                    { val: second_ebitda, type: "currency", category: "cost" },
                    { val: first_ebitda, type: "currency", category: "cost" },
                    {
                        val: percentage(first_ebitda, second_ebitda),
                        type: "percentage",
                        category: "cost",
                    },
                ]);
                }
            }, <ValueCell[]>[]),
            itda: data.reduce((acc, val) => {
                const first_itda = val.invoices.first.itda;
                const second_itda = val.invoices.second.itda;
                if (val.focused_column==true) {
                return acc.concat([
                    { val: val.focused_value?.itda ?? 0, type: "currency", category: "cost" },
                    { val: second_itda, type: "currency", category: "cost" },
                    { val: first_itda, type: "currency", category: "cost" },
                    {
                        val: percentage(first_itda, second_itda),
                        type: "percentage",
                        category: "cost",
                    },
                ]);
                }
                else {return acc.concat([
                    { val: second_itda, type: "currency", category: "cost" },
                    { val: first_itda, type: "currency", category: "cost" },
                    {
                        val: percentage(first_itda, second_itda),
                        type: "percentage",
                        category: "cost",
                    },
                ]);
                }
            }, <ValueCell[]>[]),
            tax: data.reduce((acc, val) => {
                const first_tax = val.invoices.first.tax;
                const second_tax = val.invoices.second.tax;
                let first_prefix = ''
                let second_prefix = ''
                let focus_prefix = ''
                if (val.invoices.first.is_income_tax_balance_paid!==true){
                    first_prefix = "*";
                    }
                if (val.invoices.second.is_income_tax_balance_paid!==true){
                    second_prefix = "*";
                    }
                
                if (val.focused_column==true) {
                    if (val.focused_value?.is_income_tax_balance_paid!==true){
                        focus_prefix = "*";
                       }
                    return acc.concat([
                        { val: val.focused_value?.tax ?? 0, type: "currency", category: "cost", prefix: focus_prefix },
                        { val: second_tax, type: "currency", category: "cost", prefix: second_prefix },
                        { val: first_tax, type: "currency", category: "cost", prefix: first_prefix },
                        {
                            val: percentage(first_tax, second_tax),
                            type: "percentage",
                            category: "cost",
                        },
                    ]);
                }
                else {return acc.concat([
                    { val: second_tax, type: "currency", category: "cost", prefix: second_prefix },
                    { val: first_tax, type: "currency", category: "cost", prefix: first_prefix },
                    {
                        val: percentage(first_tax, second_tax),
                        type: "percentage",
                        category: "cost",
                    },
                ]);
                }
            }, <ValueCell[]>[]),
            last_year_income_tax_balance: data.reduce((acc, val) => {
                const first_ = val.invoices.first.last_year_income_tax_balance;
                const second_ = val.invoices.second.last_year_income_tax_balance;
                if (val.focused_column==true) {
                return acc.concat([
                    { val: val.focused_value?.last_year_income_tax_balance ?? 0, type: "currency", category: "cost" },
                    { val: second_, type: "currency", category: "cost" },
                    { val: first_, type: "currency", category: "cost" },
                    {
                        val: percentage(first_, second_),
                        type: "percentage",
                        category: "cost",
                    },
                ]);
                }
                else {return acc.concat([
                    { val: second_, type: "currency", category: "cost" },
                    { val: first_, type: "currency", category: "cost" },
                    {
                        val: percentage(first_, second_),
                        type: "percentage",
                        category: "cost",
                    },
                ]);
                }
            }, <ValueCell[]>[]),
            utile_netto: data.reduce((acc, val) => {
                let focused_ebitda = val.focused_value?.ebitda ?? 0
                let focused_itda = val.focused_value?.itda ?? 0
                let focused_tax = val.focused_value?.tax ?? 0
                let focused_utile_netto =  focused_ebitda - focused_itda - focused_tax;
                const first_utile_netto = val.invoices.first.ebitda - val.invoices.first.itda - val.invoices.first.tax;
                const second_utile_netto = val.invoices.second.ebitda - val.invoices.second.itda - val.invoices.second.tax;
                if (val.focused_column==true) {
                return acc.concat([
                    { val: focused_utile_netto, type: "currency", category: "cost" },
                    { val: second_utile_netto, type: "currency", category: "cost" },
                    { val: first_utile_netto, type: "currency", category: "cost" },
                    {
                        val: percentage(first_utile_netto, second_utile_netto),
                        type: "percentage",
                        category: "cost",
                    },
                ]);
                }
                else { return acc.concat([
                    { val: second_utile_netto, type: "currency", category: "cost" },
                    { val: first_utile_netto, type: "currency", category: "cost" },
                    {
                        val: percentage(first_utile_netto, second_utile_netto),
                        type: "percentage",
                        category: "cost",
                    },
                ]);
                }
            }, <ValueCell[]>[]),
            isUserProvideIncomeStatement: missingITDACategories.length > 0 ? false : missingCostsCategories.length > 0 ? false : true,
            margin: data.reduce((acc, val) => {
                const focus_invoice_margin = val.focused_value ? val.focused_value.margin : 0;
                const focus_f24 = val.f24.focusPeriodSum ? val.f24.focusPeriodSum : 0;
                const focused_calculated_margin = focus_invoice_margin - focus_f24;
                const first_margin = val.invoices.first.margin - val.f24.firstPeriodSum;
                const second_margin = val.invoices.second.margin - val.f24.secondPeriodSum;
                if (val.focused_column==true) {
                return acc.concat([
                    { val: focused_calculated_margin, type: "currency", category: "revenue" },
                    { val: second_margin, type: "currency", category: "revenue" },
                    { val: first_margin, type: "currency", category: "revenue" },
                    {
                        val: percentage(first_margin, second_margin),
                        type: "percentage",
                        category: "revenue",
                    },
                ]);
                }
                else {return acc.concat([
                    { val: second_margin, type: "currency", category: "revenue" },
                    { val: first_margin, type: "currency", category: "revenue" },
                    {
                        val: percentage(first_margin, second_margin),
                        type: "percentage",
                        category: "revenue",
                    },
                ]);
                }
            }, <ValueCell[]>[]),
        },
        revenueCategories: allRevenueCategories.map((cat) => {
            return {
                key: cat,
                elements: data.reduce((acc, entry) => {
                    const focusRev = entry.focused_value?.categories.find((c1) => cat === c1.key)?.revenue ?? 0;
                    const firstRev = entry.invoices.first.categories.find((c1) => cat === c1.key)?.revenue ?? 0;
                    const secondRev = entry.invoices.second.categories.find((c1) => cat === c1.key)?.revenue ?? 0;
                    if (entry.focused_column==true) {
                    return acc.concat([
                        { val: focusRev, type: "currency" },
                        { val: secondRev, type: "currency" },
                        { val: firstRev, type: "currency" },
                        { val: percentage(firstRev, secondRev), type: "percentage", category: "revenue" },
                    ]);
                    }
                    else { return acc.concat([
                        { val: secondRev, type: "currency" },
                        { val: firstRev, type: "currency" },
                        { val: percentage(firstRev, secondRev), type: "percentage", category: "revenue" },
                    ]);
                    }
                }, <ValueCell[]>[]),
            };
        }),
        costsCategories: allCostsCategories.map((cat) => {
            return {
                key: cat,
                elements: Object.entries(data).reduce((acc, entry) => {
                    const focusCost = entry[1].focused_value?.categories.find((c1) => cat === c1.key)?.costs ?? 'N.P';
                    const firstCost = entry[1].invoices.first.categories.find((c1) => cat === c1.key)?.costs ?? 'N.P';
                    const secondCost = entry[1].invoices.second.categories.find((c1) => cat === c1.key)?.costs ?? 'N.P';
                    if (entry[1].focused_column==true) {
                    return acc.concat([
                        { val: focusCost, type: "currency" },
                        { val: secondCost, type: "currency" },
                        { val: firstCost, type: "currency" },
                        { val: percentage(firstCost, secondCost), type: "percentage", category: "cost" },
                    ]);
                    }
                    else {return acc.concat([
                        { val: secondCost, type: "currency" },
                        { val: firstCost, type: "currency" },
                        { val: percentage(firstCost, secondCost), type: "percentage", category: "cost" },
                    ]);
                    }
                }, <ValueCell[]>[]),
            };
        }),
        userDefinedcostsCategories: allF24Categories.map((cat) => {
            return {
                key: "user_defined_costs", elements: <ValueCell[]>[]}}),
        
        userDefinedITDACategories: allITDACategories.map((cat) => {
            return {
                key: cat,
                elements: Object.entries(data).reduce((acc, entry) => {
                    let required_cat =  requiredITDACategories.indexOf(cat);
                    let focusITDA = entry[1].focused_value?.categories.find((c1) => cat === c1.key)?.itda ??  'N.P';
                    focusITDA = focusITDA === 'N.P' ? required_cat === -1 ? 0 : focusITDA : focusITDA;
                    let firstITDA = entry[1].invoices.first.categories.find((c1) => cat === c1.key)?.itda ?? 'N.P';
                    firstITDA = firstITDA === 'N.P' ? required_cat === -1 ? 0 : firstITDA : firstITDA;
                    let secondITDA = entry[1].invoices.second.categories.find((c1) => cat === c1.key)?.itda ?? 'N.P';
                    secondITDA = secondITDA === 'N.P' ? required_cat === -1 ? 0 : secondITDA : secondITDA;
                    if (entry[1].focused_column==true) {
                    return acc.concat([
                        { val: focusITDA, type: "currency" },
                        { val: secondITDA, type: "currency" },
                        { val: firstITDA, type: "currency" },
                        { val: percentage(firstITDA, secondITDA), type: "percentage", category: "cost" },
                    ]);
                    }
                    else { return acc.concat([
                        { val: secondITDA, type: "currency" },
                        { val: firstITDA, type: "currency" },
                        { val: percentage(firstITDA, secondITDA), type: "percentage", category: "cost" },
                    ]);
                    }
                }, <ValueCell[]>[]),
            };
        }),

        f24Categories: allF24Categories.map((cat) => {
            return {
                key: cat,
                elements: data.reduce((acc, entry) => {
                    const focusF24 = entry.f24.categories[cat]?.focus ?? 0;
                    const firstF24 = entry.f24.categories[cat]?.first ?? 0;
                    const secondF24 = entry.f24.categories[cat]?.second ?? 0;
                    if (entry.focused_column==true) {
                    return acc.concat([
                        { val: focusF24, type: "currency" },
                        { val: secondF24, type: "currency" },
                        { val: firstF24, type: "currency" },
                        { val: percentage(firstF24, secondF24), type: "percentage", category: "cost" },
                    ]);
                    }
                    else { return acc.concat([
                        { val: secondF24, type: "currency" },
                        { val: firstF24, type: "currency" },
                        { val: percentage(firstF24, secondF24), type: "percentage", category: "cost" },
                    ]);
                    }

                }, <ValueCell[]>[]),
            };
        }),
    };
}

export function computeIncomeStatementAnalytics({
    invoices,
    f24s,
    fees,
    userProvidedData,
    dittaId,
    focustimespan,
}: {
    invoices: any[];
    f24s: any[];
    fees: any[];
    userProvidedData?: any[];
    dittaId?: string;
    focustimespan?: Timespan;
}): IncomeStatementAnalytics {
    let now = new Date();
    let last_fiscal_year = now.getFullYear() - 1;
    let previous_last_fiscal_year = last_fiscal_year - 1;
    let start = performance.now();
    if (dittaId !== undefined) {
        f24s = f24s.filter((f) => f.ditta_id == dittaId);
        invoices = invoices.filter((f) => f.ditta_id == dittaId);
        fees = fees.filter((f) => f.ditta_id == dittaId);
    }
    
    let periods = invoicesComputeRevenueCostStats({
        invoices: invoices,
        fees: fees,
        f24s: f24s,
        userProvidedData: userProvidedData ?? [],
        timespans: [
            Timespan.previous12Months(),
            Timespan.last12Months(),

            Timespan.yearToDateLastYear(),
            Timespan.yearToDate(),

            Timespan.thisQuarterToDateLastYear(),
            Timespan.thisQuarterToDate(),

            Timespan.previousLastQuarter(),
            Timespan.lastQuarter(),

            Timespan.previouslastFiscalYear(),
            Timespan.lastFiscalYear(),
            

            focustimespan ?? Timespan.yearToDate(),
        ],
    });
    const ytdF24 = getF24CategoriesData(f24s, periods[2].timespan, periods[3].timespan, periods[10].timespan);
    const months12F24 = getF24CategoriesData(f24s, periods[0].timespan, periods[1].timespan);
    const lastfiscalF24 = getF24CategoriesData(f24s, periods[8].timespan, periods[9].timespan);
    const quarterToDateF24 = getF24CategoriesData(f24s, periods[4].timespan, periods[5].timespan);
    const quarterF24 = getF24CategoriesData(f24s, periods[6].timespan, periods[7].timespan);
   
    return <IncomeStatementAnalytics>{
        yearly: getIncomeStatementSectionData("Analisi annuale", [
            
            {
                labels: ["Periodo di riferimento","Year to date", "Last year to date", "Variazione YTD"],
                invoices: invoicesComputeRevenueCostStatsComparison({
                    first: periods[2],
                    second: periods[3],
                }),
                f24: {
                    categories: ytdF24,
                    firstPeriodSum: l.sumBy(Object.entries(ytdF24), (e) => (e[1] as any).first),
                    secondPeriodSum: l.sumBy(Object.entries(ytdF24), (e) => (e[1] as any).second),
                    focusPeriodSum: l.sumBy(Object.entries(ytdF24), (e) => (e[1] as any).focus),
                },
                focused_column: true,
                focused_value: periods[10],
            },
            {
                labels: ["Ultimi 12 mesi", "12 mesi precedenti", "Variazione 12 mesi"],
                invoices: invoicesComputeRevenueCostStatsComparison({
                    first: periods[0],
                    second: periods[1],
                }),
                f24: {
                    categories: months12F24,
                    firstPeriodSum: l.sumBy(Object.entries(months12F24), (e) => (e[1] as any).first),
                    secondPeriodSum: l.sumBy(Object.entries(months12F24), (e) => (e[1] as any).second),
                },
            },
            {
                labels: ["anno fiscale precedente " + last_fiscal_year, "anno fiscale antecedente "+previous_last_fiscal_year, "Variazione ultimi due anni fiscali"],
                invoices: invoicesComputeRevenueCostStatsComparison({
                    first: periods[8],
                    second: periods[9],
                }),
                f24: {
                    categories: lastfiscalF24,
                    firstPeriodSum: l.sumBy(Object.entries(lastfiscalF24), (e) => (e[1] as any).first),
                    secondPeriodSum: l.sumBy(Object.entries(lastfiscalF24), (e) => (e[1] as any).second),
                },
            },
        ]),
        // quarterly: getIncomeStatementSectionData("Analisi trimestrale", [
        //     {
        //         labels: ["Questo trimestre ad oggi", "Questo trimestre ad oggi scorso anno", "Variazione"],
        //         invoices: invoicesComputeRevenueCostStatsComparison({
        //             first: periods[4],
        //             second: periods[5],
        //         }),
        //         f24: {
        //             categories: quarterToDateF24,
        //             firstPeriodSum: l.sumBy(Object.entries(quarterToDateF24), (e) => (e[1] as any).first),
        //             secondPeriodSum: l.sumBy(Object.entries(quarterToDateF24), (e) => (e[1] as any).second),
        //         },
        //     },
        //     {
        //         labels: ["Scorso trimestre", "Trimestre precedente", "Variazione"],
        //         invoices: invoicesComputeRevenueCostStatsComparison({
        //             first: periods[6],
        //             second: periods[7],
        //         }),
        //         f24: {
        //             categories: quarterF24,
        //             firstPeriodSum: l.sumBy(Object.entries(quarterF24), (e) => (e[1] as any).first),
        //             secondPeriodSum: l.sumBy(Object.entries(quarterF24), (e) => (e[1] as any).second),
        //         },
        //     },
        // ]),
    };

    let end = performance.now();
    console.log(`income statement aggregations computed in ${(end - start).toFixed(2)} ms`);
}
