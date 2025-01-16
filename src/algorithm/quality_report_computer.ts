import l from "lodash";
import { QualityReport } from "../types/quality_report_types";

const TOTAL_AMOUNT = "total_amount";
const TOTAL_WITHOUT_IVA = "total_without_iva";
const TOTAL_IVA = "total_iva";

const getIvaCalculation = (docs: any) => {
    return {
        count: docs.length,
        sumWithoutVat: l.sumBy(docs, TOTAL_WITHOUT_IVA),
        vat: l.sumBy(docs, TOTAL_IVA),
        totalSum: l.sumBy(docs, TOTAL_AMOUNT),
        lastElement: docs.length <= 0 ? null : docs[docs.length - 1],
        firstElement: docs.length <= 0 ? null : docs[0],
    };
}

export function computeQualityReport({
    invoices,
    fees,
    f24s,
}: {
    invoices: any[];
    f24s: any[];
    fees: any[];
}): QualityReport {
    const taxesCategories = ["versamenti reddito", "ires", "irap", "inps", "tasse locali", "tasse regionali", "iva"];
    const f24Costs = f24GetCostsInTimespan({
        documents: f24s,
        categories: taxesCategories,
    });
    const actives = l.orderBy(
        l.filter(invoices, (i) => i.type === "attiva"),
        ["emission_date", "invoice_id"]
    );
    const passives = l.orderBy(
        l.filter(invoices, (i) => i.type === "passiva"),
        ["emission_date", "invoice_id"]
    );
    const report: QualityReport = {
        actives: getIvaCalculation(actives),
        passives: getIvaCalculation(passives),
        fees: getIvaCalculation(fees),
        f24: {
            taxesSum: f24Costs.irap + f24Costs["tasse regionali"] + f24Costs["tasse locali"],
            inpsSum: f24Costs.inps,
            vatSum: f24Costs.iva,
            count: f24s.length,
        },
    };

    return report;
}

const f24GetCostsInTimespan = ({ documents, categories }: { documents: any[]; categories: string[] }): any => {
    let map: any = {};
    categories.forEach((c) => (map[c] = 0));
    for (const doc of documents) {
        for (const aggregationKey in doc.aggregations) {
            if (!categories.includes(aggregationKey)) continue;
            map[aggregationKey] += doc.aggregations[aggregationKey].balance_amount;
        }
    }
    return map;
};
