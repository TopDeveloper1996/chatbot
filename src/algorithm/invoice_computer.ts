import { parse } from "date-fns";
import l from "lodash";
import * as stringUtils from "~/src/common/string";
import { aggregateDocumentsInTimespan } from "../common/aggregator";
import Timespan from "../timespan";
import DateBuilder from "~/src/date_builder";

/**Compute a comparison statistics between two revenue costs statistics objects of two different timespans */
export const invoicesComputeRevenueCostStatsComparison = ({
    first,
    second,
    label,
}: {
    first: InvoiceRevenueCostStatistics;
    second: InvoiceRevenueCostStatistics;
    label?: string;
}): InvoiceRevenueCostCategoriesComparison => {
    let stats: InvoiceRevenueCostCategoriesComparison = <InvoiceRevenueCostCategoriesComparison>{
        categories: [],
        first: first,
        second: second,
        label: label,
    };

    let categoriesKeys = l.uniqBy(l.union(first.categories, second.categories), "key").map((c) => c.key);
    for (const key of categoriesKeys) {
        let firstMatch = first.categories.find((c) => c.key === key);
        let secondMatch = second.categories.find((c) => c.key === key);
        if (!firstMatch && !secondMatch) continue;
        stats.categories.push({
            category: key,
            firstRevenue: firstMatch?.revenue ?? 0,
            firstCosts: firstMatch?.costs ?? 0,
            firstItda: firstMatch?.itda ?? 0,
            firstTax: firstMatch?.tax ?? 0,
            secondRevenue: secondMatch?.revenue ?? 0,
            secondCosts: secondMatch?.costs ?? 0,  
            secondItda: secondMatch?.itda ?? 0,  
            secondTax: secondMatch?.tax ?? 0,
            revenueDelta: (secondMatch?.revenue ?? 0) / (firstMatch?.revenue ?? 0) - 1,
            costsDelta: (secondMatch?.costs ?? 0) / (firstMatch?.costs ?? 0) - 1,
        });
    }
    return stats;
};

/**Compute revenue costs statistics for a given timespan */
export const invoicesComputeRevenueCostStats = ({
    invoices,
    fees,
    f24s,
    userProvidedData,
    timespans,
}: {
    invoices: any[];
    fees?: any[];
    f24s?: any[];
    userProvidedData?: any[];
    timespans: Timespan[];
}): InvoiceRevenueCostStatistics[] => {
    let statisticsArray: InvoiceRevenueCostStatistics[] = [];
    for (const timespan of timespans) {
        // const taxesCategories = ["versamenti reddito", "ires", "irap", "tasse locali", "tasse regionali"];
        const taxesCategories = ["versamenti reddito", "ires", "irap"];
        
        let taxes = 0
        
        let filteredInvoices = invoices.filter((i) => timespan.fits(i.emission_date));
        let filteredfees = fees?.filter((i) => timespan.fits(i.detection_date));

        const income_tax_balance_code = ["3800", "2003", "2006", "2012", "2015", "2020", "2025", "2033", "2036", "4001", "4005", "4038"]
        const income_tax_advance_payment_code = ["3812", "3813", "2010", "2011", "2013", "2014", "2018", "2019", "2041", "2042", "2031", "2032",  "2034", "2035",  "4003", "4004", "4033", "4034", "4036", "4037"]
        let last_year_income_tax_balance = 0
        let is_income_tax_balance_paid = false
        let now = new DateBuilder();
        let f24_timespan = new Timespan(timespan.from, now.get());
        let filteredF24s = f24s?.filter((i) => f24_timespan.fits(i.application_date));

        // for (const f24 of filteredF24s?? []) {
        //     for (const aggregationKey in f24.aggregations) {
        //         if (!taxesCategories.includes(aggregationKey)) continue;
        //         taxes += f24.aggregations[aggregationKey].balance_amount;
        //     }
        // }
        const filtered_tax_details=[]
        for (const doc of filteredF24s?? []) {

            for (const sectionKey in doc.sections) {
                for (const sectionEl of doc.sections[sectionKey].elements) {
                   
                    
                    if (String(sectionEl.date_to) === String(timespan.from.getFullYear())) {   
                      
                        if (income_tax_balance_code.includes(String(sectionEl.causal_tax))){
                            // console.log(sectionEl)
                            is_income_tax_balance_paid = true
                            taxes += sectionEl?.debit_amount - sectionEl?.credit_amount
                            }
                        if (income_tax_advance_payment_code.includes(String(sectionEl.causal_tax)) && timespan.fits(doc.application_date)){
                            taxes += sectionEl?.debit_amount - sectionEl?.credit_amount
                            }
                             
                    }
                    if (String(sectionEl.date_to) === String(timespan.from.getFullYear() - 1) && timespan.fits(doc.application_date)){    
                        if (income_tax_balance_code.includes(String(sectionEl.causal_tax))){
                            last_year_income_tax_balance = sectionEl.debit_amount - sectionEl.credit_amount
                            }    
                    }
                }
            }
          
        }
        
        
        let tempUserProvideData = userProvidedData?.filter((i: any) => {
            const balance_period = new Date(i.period_year, i.period_month - 1, 2);
            return timespan.fits(balance_period)
          });
        let focusUserProvideDataCost = tempUserProvideData?.filter((f) => f.income_statement_type == 'cost');
        let focusUserProvideDataRevenue = tempUserProvideData?.filter((f) => f.income_statement_type == 'revenue');
        let focusUserProvideDataITDA = tempUserProvideData?.filter((f) => f.income_statement_type == 'itda');
        
        
        let user_provided_cost = 0;
        let user_provided_itda = 0;
        for (const user_cost of focusUserProvideDataCost ?? []) { 
            user_provided_cost += Number(user_cost["income_statement_value"]);
            
        }
        for (const user_itdas of focusUserProvideDataITDA ?? []) { 
            user_provided_itda += Number(user_itdas["income_statement_value"]);
           
        }
        const total_fees=l.sumBy(filteredfees, "total_without_iva");  
        let stats = <InvoiceRevenueCostStatistics>{};
        stats.categories = [];
        
        stats.revenue = l.sumBy(
            filteredInvoices.filter((e) => e.type === "attiva"),
            "total_without_iva"
        );
        let production_cost = l.sumBy(
            filteredInvoices.filter((e) => e.type === "passiva"),
            "total_without_iva"
        );
        
        stats.revenue+= total_fees;
        stats.costs = production_cost + user_provided_cost;
        stats.ebitda = stats.revenue - stats.costs;
        stats.itda = user_provided_itda;
        stats.tax = taxes;
        stats.margin = stats.revenue - production_cost;
        stats.marginPercentage = 100 * (stats.margin / stats.revenue);
        stats.timespan = timespan;
        stats.last_year_income_tax_balance = last_year_income_tax_balance;
        stats.is_income_tax_balance_paid = is_income_tax_balance_paid;
        stats.categories.push({
            key: 'Costi fissi e variabili cumulativi',
            revenue: 0,
            costs: production_cost,
            itda: 0,
            tax: 0,
            margin: stats.revenue - production_cost,
        });
        let categories = aggregateDocumentsCategories(tempUserProvideData ?? []);
        for (const category of categories) {
            let allrevenue = category.elements.filter((e) => e.income_statement_type === "revenue");
            let allcosts = category.elements.filter((e) => e.income_statement_type === "cost");
            let allitda = category.elements.filter((e) => e.income_statement_type === "itda");
            let itda=0
            let costs=0
            let revenue = 0
            for (const user_cost of allcosts?? []) { 
                costs += Number(user_cost["income_statement_value"]);
                
            }
            for (const user_itdas of allitda ?? []) { 
                itda += Number(user_itdas["income_statement_value"]);
               
            }
            for (const user_revenue of allrevenue ?? []) { 
                revenue += Number(user_revenue["income_statement_value"]);
               
            }
            
            // let revenue = l.sumBy(
            //     category.elements.filter((e) => e.income_statement_type === "revenue"),
            //     "income_statement_value"
            // );
            // let costs = l.sumBy(
            //     category.elements.filter((e) => e.income_statement_type === "cost"),
            //     "income_statement_value"
            // );
            // let itda = l.sumBy(
            //     category.elements.filter((e) => e.income_statement_type === "itda"), "income_statement_value");
            //! Remove categories with no data
            // if (revenue <= 0 && costs <= 0 && itda <= 0) continue;
            stats.categories.push({
                key: category.key,
                revenue: revenue,
                costs: costs,
                itda: itda,
                tax: 0,
                margin: revenue - costs,
            });
        }
        
        statisticsArray.push(stats);
    }
    return statisticsArray;
};

/**
 * Given an array of documents, returns the array of aggregated documents based on their categories.
 *
 * The key used to identify the category inside each document is `category`.
 */
function aggregateDocumentsCategories(elements: any[]): Aggregation<string>[] {
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

/**Update the statistics of the current fetched invoices.
 *
 * Change the {@link Timespan} to change the time interval in which the statistics are computed.
 *
 * If provided, the {@link Grouping} parameter allows to force an aggregation interval.
 */
export const invoicesComputeStats = async ({
    invoices,
    timespan = Timespan.all(),
    grouping,
}: {
    invoices: any[];
    timespan: Timespan;
    grouping?: Grouping | undefined;
}): Promise<InvoicesStatistics> => {
    let start = performance.now();
    const documents = invoices
        .filter((i) => timespan.fits(i["emission_date"]))
        .sort((a, b) => b["emission_date"].getTime() - a["emission_date"].getTime());
    let actives = documents.filter((i) => i["type"] === "attiva").sort((a, b) => a["total_without_iva"] - b["total_without_iva"]);
    let passives = documents
        .filter((i) => i["type"] === "passiva")
        .sort((a, b) => a["total_without_iva"] - b["total_without_iva"]);

    let { intervalAggregation, documentsByInterval: invoicesByInterval } = aggregateDocumentsInTimespan({
        elements: documents,
        key: "emission_date",
        timespan: timespan,
        grouping: grouping,
    });
    const intervals = invoicesByInterval.map((e) => e.key);
    const analytics = await Promise.all([
        computeSegmentAnalytics(actives, intervals),
        computeSegmentAnalytics(passives, intervals),
    ]);
    const stats: InvoicesStatistics = {
        count: documents.length,
        timespan: timespan,
        actives: analytics[0],
        passives: analytics[1],
        intervalAggregation: intervalAggregation,
        invoicesByTimespan: invoicesByInterval,
    };

    let max = Math.max(stats.actives.cumulativeSum.length, stats.passives.cumulativeSum.length);
    stats.actives.cumulativeSum = stats.actives.cumulativeSum.concat(
        new Array(max - stats.actives.cumulativeSum.length).fill(
            stats.actives.cumulativeSum[stats.actives.cumulativeSum.length - 1]
        )
    );
    stats.passives.cumulativeSum = stats.passives.cumulativeSum.concat(
        new Array(max - stats.passives.cumulativeSum.length).fill(
            stats.passives.cumulativeSum[stats.passives.cumulativeSum.length - 1]
        )
    );

    let end = performance.now();
    console.log(`statistics computed in ${(end - start).toFixed(2)} ms`);
    return stats;
};

/**Compute analytics for a segment of invoices. Generally used for actives and passives */
async function computeSegmentAnalytics(
    filteredInvoices: any[],
    intervals: Timespan[]
): Promise<InvoicesGroupAnalytics> {
    let stats: InvoicesGroupAnalytics = {
        topCustomerSuppliers: <any[]>[],
        elements: <any[]>[],
        nature: <any[]>[],
        documentType: <any[]>[],
        invoicesCount: 0,
        metrics: <{ [key: string]: any }>{},
        categories: [],
        ateco: [],
        missingAteco: <any[]>[],
        invoicesByTimespan: [],
        cumulativeSum: [],
        sumByTimespan: [],
        sumByPaymentTimespan: [],
        cumulativeSumByPayment: [],
        causal: [],
    };
    stats.elements = filteredInvoices;
    stats.invoicesCount = filteredInvoices.length;
    stats.invoicesByTimespan = intervals.map((t) => <Aggregation<Timespan>>{ key: t, elements: <any[]>[] });
    let invoicesByDueTimespan = intervals.map((t) => <Aggregation<Timespan>>{ key: t, elements: <any[]>[] });
    const totalAmount = l.sumBy(filteredInvoices, "total_without_iva");
    stats.topCustomerSuppliers = l
        .map(l.groupBy(filteredInvoices, "cliente_fornitore_id"), (v, k) => {
            const amount = v.reduce((v, e) => (v += e["total_without_iva"]), 0);
            return <CustomerSupplier>{
                id: k,
                name: v[0]["cliente_fornitore_registered_name"],
                atecoCode: v[0]["ateco_code"],
                atecoDescription: v[0]["ateco_description"],
                amount: amount,
                percentage : (amount / totalAmount) * 100,
                elements: v,
                count: v.length,
            };
        })
        .sort((a, b) => b["amount"] - a["amount"])
        .slice(0, 10);

    // Filter out TD04 documents from the min amountss
    const minFilteredInvoices = filteredInvoices.filter((i) => i["document_type"]?.toLocaleLowerCase() != "td04");

    //#region ===== METRICS ======
    stats.metrics.min_amount = <any>{
        name: "Minimo",
        value: minFilteredInvoices.length <= 0 ? 0 : minFilteredInvoices[0]?.["total_without_iva"] ?? 0,
        elements: minFilteredInvoices.length <= 0 ? null : [minFilteredInvoices[0]],
    };
    stats.metrics.second_min_amount = <any>{
        name: "Secondo minimo",
        value:
        minFilteredInvoices.length <= 0
                ? 0
                : minFilteredInvoices[Math.min(1, minFilteredInvoices.length)]?.["total_without_iva"] ?? 0,
        elements: minFilteredInvoices.length <= 0 ? null : [minFilteredInvoices[Math.min(1, minFilteredInvoices.length)]],
    };
    stats.metrics.third_min_amount = <any>{
        name: "Terzo minimo",
        value:
        minFilteredInvoices.length <= 0
                ? 0
                : minFilteredInvoices[Math.min(2, minFilteredInvoices.length)]?.["total_without_iva"] ?? 0,
        elements: minFilteredInvoices.length <= 0 ? null : [minFilteredInvoices[Math.min(2, minFilteredInvoices.length)]],
    };
    stats.metrics.max_amount = <any>{
        name: "Massimo",
        value: minFilteredInvoices.length <= 0 ? 0 : minFilteredInvoices[minFilteredInvoices.length - 1]?.["total_without_iva"] ?? 0,
        elements: minFilteredInvoices.length <= 0 ? null : [minFilteredInvoices[minFilteredInvoices.length - 1]],
    };
    stats.metrics.second_max_amount = <any>{
        name: "Secondo massimo",
        value:
            minFilteredInvoices.length <= 0
                ? 0
                : minFilteredInvoices[Math.max(minFilteredInvoices.length - 2, 0)]?.["total_without_iva"] ?? 0,
        elements: minFilteredInvoices.length <= 0 ? null : [minFilteredInvoices[Math.max(minFilteredInvoices.length - 2, 0)]],
    };
    stats.metrics.third_max_amount = <any>{
        name: "Terzo massimo",
        value:
            minFilteredInvoices.length <= 0
                ? 0
                : minFilteredInvoices[Math.max(minFilteredInvoices.length - 3, 0)]?.["total_without_iva"] ?? 0,
        elements: minFilteredInvoices.length <= 0 ? null : [minFilteredInvoices[Math.max(minFilteredInvoices.length - 3, 0)]],
    };
    stats.metrics.mean_amount = <any>{
        name: "Medio",
        value: minFilteredInvoices.length <= 0 ? 0 : l.mean(minFilteredInvoices.map((i) => i["total_without_iva"])),
        elements: null,
    };
    stats.metrics.median_amount = <any>{
        name: "Mediano",
        value:
            minFilteredInvoices.length <= 0
                ? 0
                : minFilteredInvoices.length % 2 !== 0
                ? minFilteredInvoices[(minFilteredInvoices.length + 1) / 2]?.["total_without_iva"] ?? 0
                : l.mean([
                      minFilteredInvoices[minFilteredInvoices.length / 2]?.["total_without_iva"] ?? 0,
                      minFilteredInvoices[minFilteredInvoices.length / 2 + 1]?.["total_without_iva"] ?? 0,
                  ]),
        elements:
            minFilteredInvoices.length <= 0
                ? null
                : minFilteredInvoices.length % 2 !== 0
                ? [minFilteredInvoices[(minFilteredInvoices.length + 1) / 2]]
                : [minFilteredInvoices[minFilteredInvoices.length / 2], minFilteredInvoices[minFilteredInvoices.length / 2 + 1]],
    };
    //#endregion

    //#region ===== MULTIPLE AGGREGATION =====
    // Run aggregation in a single loop to speed up the process
    let doc_type: any = {};
    let rt_type: any = {};
    let nature: any = {};
    let categories: any = {};
    let atecos: any = {};
    let missingAtecoInvoices: any[] = [];
    let dates: any = {};
    let causal: any = {};
    for (const invoiceModel of filteredInvoices) {
        if (!stringUtils.isNullOrEmpty(invoiceModel["document_type"])) {
            let v = doc_type[invoiceModel["document_type"]] ?? { key: invoiceModel["document_type"], elements: [] };
            v.elements.push(invoiceModel);
            doc_type[invoiceModel["document_type"]] = v;
        }
        if (invoiceModel["causal"] && invoiceModel["causal"].length > 0) {
            let causalLower = invoiceModel["causal"].toLocaleLowerCase().trim() as string;

            let v = causal[causalLower] ?? {
                key: causalLower,
                elements: [],
            };
            v.elements.push(invoiceModel);
            causal[causalLower] = v;
        }
        if (invoiceModel["withholding_type"].length > 0) {
            let joined = invoiceModel["withholding_type"].join(",");
            let v = rt_type[joined] ?? { key: joined, elements: [] };
            v.elements.push(invoiceModel);
            rt_type[joined] = v;
        }
        if (invoiceModel["invoice_transaction_nature"].length > 0) {
            let joined = invoiceModel["invoice_transaction_nature"].join(", ");
            let v = nature[joined] ?? { key: joined, elements: [] };
            v.elements.push(invoiceModel);
            nature[joined] = v;
        }
        if (!stringUtils.isNullOrEmpty(invoiceModel["category"])) {
            const category = stringUtils.capitalize(invoiceModel["category"])!;
            let v = categories[category] ?? { key: category, elements: [] };
            v.elements.push(invoiceModel);
            categories[category] = v;
        } else {
            const category = "Non classificate";
            let v = categories[category] ?? { key: category, elements: [] };
            v.elements.push(invoiceModel);
            categories[category] = v;
        }
        if (
            !stringUtils.isNullOrEmpty(invoiceModel["ateco_code"]) &&
            !stringUtils.isNullOrEmpty(invoiceModel["ateco_description"])
        ) {
            let v = atecos[invoiceModel["ateco_code"]] ?? {
                key: invoiceModel["ateco_code"],
                description: invoiceModel["ateco_description"],
                elements: [],
            };
            v.elements.push(invoiceModel);
            atecos[invoiceModel["ateco_code"]] = v;
        } else {
            missingAtecoInvoices.push(invoiceModel);
        }
        if (invoiceModel["emission_date"]) {
            let dateStr = invoiceModel["emission_date"].toLocaleDateString("pt-PT");
            let v = dates[dateStr] ?? { key: parse(dateStr, "dd/MM/yyyy", new Date()), elements: [] };
            v.elements.push(invoiceModel);
            dates[dateStr] = v;
        }

        let timespan =
            stats.invoicesByTimespan.find((i) => i.key.fits(invoiceModel["emission_date"])) ??
            stats.invoicesByTimespan[stats.invoicesByTimespan.length - 1];
        if (timespan) timespan.elements.push(invoiceModel);
        timespan =
            invoicesByDueTimespan.find((i) => i.key.fits(invoiceModel["payment_date"])) ??
            invoicesByDueTimespan[invoicesByDueTimespan.length - 1];
        if (timespan) timespan.elements.push(invoiceModel);
    }
    stats.causal = Object.values(l.orderBy(causal, (e: any) => e.elements.length).slice(0, 20));
    stats.nature = nature;
    stats.documentType = [...Object.values<any>(doc_type), ...Object.values<any>(rt_type)];
    stats.categories = Object.values(categories);
    stats.ateco = Object.values(atecos);
    stats.missingAteco = missingAtecoInvoices;

    //#endregion
    let sum = 0;
    invoicesByDueTimespan.forEach((i) => {
        let s = l.sumBy(i.elements, (el: any) => el["total_without_iva"]);
        sum = sum + s;
        stats.sumByPaymentTimespan.push(s);
        stats.cumulativeSumByPayment.push(sum);
    });
    // Aggregation sums
    sum = 0;
    stats.invoicesByTimespan.forEach((i) => {
        let s = l.sumBy(i.elements, (el: any) => el["total_without_iva"]);
        sum = sum + s;
        stats.sumByTimespan.push(s);
        stats.cumulativeSum.push(sum);
    });
    return stats;
}
