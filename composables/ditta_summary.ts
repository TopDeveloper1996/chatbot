import { useUserProvidedDataStore } from "#imports";
import Timespan from "~/src/timespan";

export const useDittaSummary = () => {
    const invoices = useInvoices();
    const f24 = useF24();
    const fees = useFees();
    const userProvidedData = useUserProvidedDataStore();

    const computeSummary = async ({
        dittaId,
        firstPeriod,
        secondPeriod,
    }: {
        dittaId: string;
        firstPeriod: Timespan;
        secondPeriod: Timespan;
    }) => {
        const timespan = new Timespan(firstPeriod.from, secondPeriod.to);
        await Promise.all([
            invoices.invoicesFetch({ dittaId: dittaId, ignoreCache: false }),
            f24.f24Fetch({ ignoreCache: false }),
            fees.feesFetch({ ignoreCache: false }),
            userProvidedData.userProvidedDataFetch({ dittaId: dittaId, timespan: timespan, ignoreCache: false }),
        ]);
        const filteredInvoices = invoices.invoicesDocuments.filter(
            (i) => i["ditta_id"] == dittaId && timespan.fits(i["emission_date"])
        );
        const filteredF24 = f24.f24Documents.filter(
            (i) => i["ditta_id"] == dittaId && timespan.fits(i["application_date"])
        );
        const filteredFees = fees.feesDocuments.filter(
            (i) => i["ditta_id"] == dittaId && timespan.fits(i["detection_date"])
        );
        const filteredUserDefinedCosts = userProvidedData.income_statements.filter(
            (i) => i["income_statement_type"] == 'cost');
        const filteredUserDefinedITDA = userProvidedData.income_statements.filter(
                (i) => i["income_statement_type"] == 'itda');
        

        return computeDittaSummaryAnalytics({
            invoices: filteredInvoices,
            f24s: filteredF24,
            fees: filteredFees,
            userDefinedCosts: filteredUserDefinedCosts,
            userDefinedITDA: filteredUserDefinedITDA,
            firstPeriod: firstPeriod,
            secondPeriod: secondPeriod,
        });
    };
    return { computeSummary };
};
