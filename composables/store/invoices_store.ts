import { parse } from "date-fns";
import { defineStore } from "pinia";
import type DateFilter from "~/src/date_filter";

import * as invoiceComputer from "~/src/algorithm/invoice_computer";
import Timespan from "~/src/timespan";

export const useInvoices = defineStore("invoices", () => {
    const endpoints = useEndpoints();
    const { api } = useApi();

    const invoicesSelectedDittaId = ref<string>("");
    const invoicesDateFilter = ref<DateFilter | undefined>(undefined);
    const invoicesDocuments = ref<any[]>([]);
    const lastAvailableInvoiceDate = ref<Date>(new Date());
    const invoicesFetching = ref<boolean>(false);
    let fetchPromise: Promise<any> | undefined = undefined;
    const invoicesHasCache = ref<boolean>(false);

    function $reset() {
        invoicesDateFilter.value = undefined;
        invoicesFetching.value = false;
        invoicesHasCache.value = false;
        invoicesDocuments.value = [];
    }

    const invoicesComputeStats = async ({
        timespan = Timespan.all(),
        grouping,
    }: {
        timespan: Timespan;
        grouping?: Grouping | undefined;
    }): Promise<InvoicesStatistics> => {
        return invoiceComputer.invoicesComputeStats({
            invoices: invoicesDocuments.value,
            timespan: timespan,
            grouping: grouping,
        });
    };

    /**Compute revenue costs statistics for a given timespan */
    const invoicesComputeRevenueCostStats = ({
        timespans,
    }: {
        timespans: Timespan[];
    }): InvoiceRevenueCostStatistics[] => {
        return invoiceComputer.invoicesComputeRevenueCostStats({
            invoices: invoicesDocuments.value,
            timespans: timespans,
        });
    };

    const invoicesComputeRevenueCostStatsComparison = ({
        first,
        second,
        label,
    }: {
        first: InvoiceRevenueCostStatistics;
        second: InvoiceRevenueCostStatistics;
        label?: string;
    }): InvoiceRevenueCostCategoriesComparison => {
        return invoiceComputer.invoicesComputeRevenueCostStatsComparison({
            first: first,
            second: second,
            label: label,
        });
    };

    /**Fetch the invoices for the provided ditta */
    const invoicesFetch = async ({ dittaId, ignoreCache = false }: { dittaId: string; ignoreCache?: boolean }) => {
        if (invoicesFetching.value && fetchPromise !== undefined) {
            await fetchPromise;
            return;
        }
        if (!ignoreCache && dittaId === invoicesSelectedDittaId.value) return;
        invoicesFetching.value = true;
        const cpa = useCpa();
        fetchPromise = api(endpoints.invoice, {
            method: "POST",
            query: { customer_id: cpa.getData.id },
            body: {
                $expr: {
                    $eq: ["$ditta_id", { $toInt: dittaId }],
                },
            },
            onResponse: async ({ request, response, options }) => {
                if (response.ok) {
                    invoicesDocuments.value = response._data.data
                        .map((_: any, i: number, array: any[]) => {
                            array[i]["emission_date"] = parse(array[i]["emission_date"], "dd-MM-yyyy", new Date());
                            array[i]["receive_date"] = parse(array[i]["receive_date"], "dd-MM-yyyy", new Date());
                            array[i]['is_active'] = array[i]["type"] === "attiva";
                            const document_type = array[i]["document_type"]?.toLocaleLowerCase();
                            if (["td04","td08","td20","td21"].includes(document_type)) {
                                for (const item of array[i]["items"] ?? []) {
                                    item["total"] = Math.abs(item["total"]) * -1;
                                }
                                array[i]["total_amount"] = Math.abs(array[i]["total_amount"]) * -1;
                                array[i]["total_without_iva"] = Math.abs(array[i]["total_without_iva"]) * -1;
                                array[i]["total_iva"] = Math.abs(array[i]["total_iva"]) * -1;
                            }
                            else if (['td17','td18'].includes(document_type) && array[i]["is_foreign"] === true) {
                                // for active and passive invoices, ignore iva for foreign invoices
                                array[i]["total_amount"] = array[i]["total_without_iva"]; // ignore iva for foreign invoices
                                array[i]["total_iva"] = 0 ; // ignore iva for foreign invoices
                            }
                            else if (document_type === "td02") {
                                if (response._data.data.filter(v => v["invoice_number"] === array[i]["invoice_number"] && v["receive_date"] === array[i]["receive_date"] && v['_id'] != array[i]['_id']).length > 0) {
                                    array[i]["total_amount"] = 0;
                                    array[i]["total_without_iva"] = 0;
                                    array[i]["total_iva"] = 0;
                                }
                            }
                                
                            array[i]["payment_date"] =
                                array[i]["payment_date"] != undefined
                                    ? parse(array[i]["payment_date"], "dd-MM-yyyy", new Date())
                                    : array[i]["emission_date"];
                            return array[i];
                        })
                        .sort((a: any, b: any) => b["emission_date"].getTime() - a["emission_date"].getTime());

                    invoicesSelectedDittaId.value = dittaId;
                    // lastAvailableInvoiceDate.value = invoicesDocuments.value.length ? new Date(invoicesDocuments.value[0].emission_date) : new Date();
                } else {
                    console.log(`problem with fetching invoices: ${JSON.stringify(response._data)}`);
                }

                invoicesFetching.value = false;
                invoicesHasCache.value = true;
            },
            onResponseError({ request, response, options }) {
                console.log(`error fetching invoices: ${JSON.stringify(response._data)}`);
            },
        });
        await fetchPromise;
    };
    const getLastAvailableInvoiceDate = () => {
        return lastAvailableInvoiceDate.value;
      }
    return {
        $reset,
        invoicesFetch,
        invoicesSelectedDittaId,
        invoicesDocuments,
        invoicesComputeRevenueCostStats,
        invoicesComputeRevenueCostStatsComparison,
        invoicesFetching,
        invoicesHasCache,
        invoicesComputeStats,
        invoicesDateFilter,
        getLastAvailableInvoiceDate,
    };
});
