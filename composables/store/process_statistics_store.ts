import l from "lodash";
import { aggregateDocumentsInTimespanMultiple } from "~/src/common/aggregator";
import Timespan from "~/src/timespan";
import {
    F24ProcessStatistics,
    FeesProcessStatistics,
    InvoiceProcessStatistics,
} from "~/src/types/process_statistics_types";

export const useProcessStatisticsStore = defineStore("process_statistics", () => {
    const invoices = ref<any[]>([]);
    const fees = ref<any[]>([]);
    const f24 = ref<any[]>([]);
    const hasCache = ref<boolean>(false);
    const fetching = ref<boolean>(false);
    let fetchPromise: Promise<any> | undefined = undefined;
    const endpoints = useEndpoints();
    const cpa = useCpa();
    const { api } = useApi();

    const processStatisticsFetch = async ({ ignoreCache = false }: { ignoreCache?: boolean }) => {
        if (fetchPromise !== undefined) {
            console.log("awaiting existing promise");
            await fetchPromise;
            return;
        }
        try {
            if (!ignoreCache && hasCache.value) return;
            fetching.value = true;
            fetchPromise = api(endpoints.processStatistics, { query: { customer_id: cpa.getData.id } });
            const res = await fetchPromise;
            invoices.value = res.data.invoices
                .filter((c: any) => c.invoice_date != null && c.downloaded_at != null && c.parsed_at != null)
                .map((i: any) => {
                    i.invoice_date = new Date(i.invoice_date);
                    i.downloaded_at = new Date(i.downloaded_at);
                    i.parsed_at = new Date(i.parsed_at);
                    return i;
                });

            fees.value = res.data.fees
                .filter((c: any) => c.fee_date != null && c.created_at != null && c.parsed_at != null)
                .map((i: any) => {
                    i.fee_date = new Date(i.fee_date);
                    i.created_at = new Date(i.created_at);
                    i.parsed_at = new Date(i.parsed_at);
                    return i;
                });
            f24.value = res.data.f24
                .filter((c: any) => c.data_versamento != null && c.created_at != null)
                .map((i: any) => {
                    i.data_versamento = new Date(i.data_versamento);
                    i.created_at = new Date(i.created_at);
                    i.parsed_at = new Date(i.parsed_at);
                    return i;
                });
            hasCache.value = true;
        } catch (ex) {
            console.error("error fetching process statistics");
            console.error(ex);
        } finally {
            fetching.value = false;
            fetchPromise = undefined;
            return;
        }
    };
    const computeF24Statistics = ({
        timespan,
        filters,
    }: {
        timespan: Timespan;
        filters?: { collaborator: string | undefined; dittaId: string | undefined };
    }): F24ProcessStatistics => {
        const stats = <F24ProcessStatistics>{
            count: 0,
            dittas: [],
            collaborators: [],
            grouping: TimespanAggregationInterval.adaptive(timespan),
            dateAggregation: [],
            downloadAggregation: [],
            parsedAggregation: [],
        };
        const timeFiltered = f24.value.filter((i) => {
            return timespan.fits(i.data_versamento) || timespan.fits(i.created_at) || timespan.fits(i.parsed_at);
        });
        const filteredF24 = timeFiltered.filter((i) => {
            if (filters) {
                if (
                    filters.collaborator && i.appointed_collaborator &&
                    i.appointed_collaborator.toLocaleLowerCase() !== filters.collaborator.toLocaleLowerCase()
                )
                    return false;
                if (filters.dittaId && i.ditta_id !== filters.dittaId) return false;
            }
            return true;
        });
        stats.count = filteredF24.length;
        stats.collaborators = l.map(l.uniqBy(timeFiltered, "appointed_collaborator"), (e) => e.appointed_collaborator);
        stats.dittas = l.toArray(l.groupBy(timeFiltered, "ditta_id")).map((e) => {
            return {
                ditta_numero: e[0].ditta_number,
                ditta_id: e[0].ditta_id,
                collaborator: e[0].appointed_collaborator,
                ditta_registered_name: e[0].registered_name,
                count: e.length,
                lastDoc: l.maxBy(e, "data_versamento"),
                lastDownload: l.maxBy(e, "created_at"),
                lastParsed: l.maxBy(e, "parsed_at"),
            };
        });

        const aggregations = aggregateDocumentsInTimespanMultiple({
            elements: filteredF24,
            timespan: timespan,
            keys: ["data_versamento", "created_at", "parsed_at"],
        });
        stats.grouping = aggregations.intervalAggregation;
        stats.dateAggregation = aggregations.result.data_versamento;
        stats.downloadAggregation = aggregations.result.created_at;
        stats.parsedAggregation = aggregations.result.parsed_at;
        return stats;
    };

    const computeFeesStatistics = ({
        timespan,
        filters,
    }: {
        timespan: Timespan;
        filters?: { collaborator: string | undefined; dittaId: string | undefined };
    }): FeesProcessStatistics => {
        const stats = <FeesProcessStatistics>{
            count: 0,
            dittas: [],
            collaborators: [],
            grouping: TimespanAggregationInterval.adaptive(timespan),
            dateAggregation: [],
            downloadAggregation: [],
            parsedAggregation: [],
        };
        const timeFiltered = fees.value.filter((i) => {
            return timespan.fits(i.fee_date) || timespan.fits(i.created_at) || timespan.fits(i.parsed_at);
        });
        const filteredCorrispettivi = timeFiltered.filter((i) => {
            if (filters) {
                if (
                    filters.collaborator && i.appointed_collaborator &&
                    i.appointed_collaborator.toLocaleLowerCase() !== filters.collaborator.toLocaleLowerCase()
                )
                    return false;
                if (filters.dittaId && i.ditta_id !== filters.dittaId) return false;
            }
            return true;
        });
        stats.count = filteredCorrispettivi.length;
        stats.collaborators = l.map(l.uniqBy(timeFiltered, "appointed_collaborator"), (e) => e.appointed_collaborator);
        stats.dittas = l.toArray(l.groupBy(timeFiltered, "ditta_id")).map((e) => {
            return {
                ditta_numero: e[0].ditta_number,
                ditta_id: e[0].ditta_id,
                ditta_registered_name: e[0].registered_name,
                count: e.length,
                collaborator: e[0].appointed_collaborator,
                lastDoc: l.maxBy(e, "fee_date"),
                lastDownload: l.maxBy(e, "created_at"),
                lastParsed: l.maxBy(e, "parsed_at"),
            };
        });

        const aggregations = aggregateDocumentsInTimespanMultiple({
            elements: filteredCorrispettivi,
            timespan: timespan,
            keys: ["fee_date", "created_at", "parsed_at"],
        });
        stats.grouping = aggregations.intervalAggregation;
        stats.dateAggregation = aggregations.result.fee_date;
        stats.downloadAggregation = aggregations.result.created_at;
        stats.parsedAggregation = aggregations.result.parsed_at;
        return stats;
    };

    const computeInvoiceStatistics = ({
        timespan,
        filters,
    }: {
        timespan: Timespan;
        filters?: { collaborator: string | undefined; dittaId: string | undefined };
    }): InvoiceProcessStatistics => {
        const stats = <InvoiceProcessStatistics>{
            actives: 0,
            passives: 0,
            dittas: [],
            passivePercentage: 0,
            activesPercentage: 0,
            collaborators: [],
            grouping: TimespanAggregationInterval.adaptive(timespan),
            dateAggregation: [],
            downloadAggregation: [],
            parsedAggregation: [],
        };
        const timeFilteredInvoices = invoices.value.filter((i) => {
            return timespan.fits(i.invoice_date) || timespan.fits(i.downloaded_at) || timespan.fits(i.parsed_at);
        });
        const filteredInvoices = timeFilteredInvoices.filter((i) => {
            if (filters) {
                if (
                    filters.collaborator && i.appointed_collaborator &&
                    i.appointed_collaborator.toLocaleLowerCase() !== filters.collaborator.toLocaleLowerCase()
                )
                    return false;
                if (filters.dittaId && i.ditta_id !== filters.dittaId) return false;
            }
            return true;
        });

        for (const row of filteredInvoices) {
            if (row.type?.toLocaleLowerCase() === "ricevute") {
                stats.passives += 1;
            } else {
                stats.actives += 1;
            }
        }
        stats.dittas = l.toArray(l.groupBy(timeFilteredInvoices, "ditta_id")).map((e) => {
            const passives = e.filter((i: any) => i.type?.toLocaleLowerCase() === "ricevute").length;
            const actives = e.length - passives;
            return {
                ditta_numero: e[0].ditta_number,
                ditta_id: e[0].ditta_id,
                ditta_registered_name: e[0].registered_name,
                passives: passives,
                collaborator: e[0].appointed_collaborator,
                actives: actives,
                lastDoc: l.maxBy(e, "invoice_date"),
                lastDownload: l.maxBy(e, "downloaded_at"),
                lastParsed: l.maxBy(e, "parsed_at"),
            };
        });

        stats.activesPercentage = (100 * stats.actives) / (stats.actives + stats.passives);
        stats.passivePercentage = (100 * stats.passives) / (stats.actives + stats.passives);
        stats.collaborators = l.map(
            l.uniqBy(timeFilteredInvoices, "appointed_collaborator"),
            (e) => e.appointed_collaborator
        );

        const aggregations = aggregateDocumentsInTimespanMultiple({
            elements: filteredInvoices,
            timespan: timespan,
            keys: ["invoice_date", "downloaded_at", "parsed_at"],
        });

        stats.grouping = aggregations.intervalAggregation;
        stats.dateAggregation = aggregations.result.invoice_date;
        stats.downloadAggregation = aggregations.result.downloaded_at;
        stats.parsedAggregation = aggregations.result.parsed_at;
        return stats;
    };
    return {
        invoices,
        fees,
        hasCache,
        fetching,
        processStatisticsFetch,
        computeFeesStatistics,
        computeInvoiceStatistics,
        computeF24Statistics,
    };
});
