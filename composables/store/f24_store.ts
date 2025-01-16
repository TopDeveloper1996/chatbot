import { parse } from "date-fns";
import { aggregateDocumentsInTimespan } from "~/src/common/aggregator";
import { stringToF24Category } from "~/src/common/string";
import Timespan from "~/src/timespan";
import { F24Category, F24CategoryAnalytics, F24Statistics } from "~/src/types/f24_store_types";

export const useF24 = defineStore("f24", () => {
    const f24Documents = ref<any[]>([]);
    const f24Fetching = ref<boolean>(false);
    const hasCache = ref<boolean>(false);
    const endpoints = useEndpoints();
    let fetchPromise: Promise<any> | undefined = undefined;
    const { api } = useApi();

    function $reset() {
        f24Fetching.value = true;
        hasCache.value = false;
        f24Documents.value = [];
    }

    const f24GetCostsInTimespan = ({
        timespan,
        categories,
        dittaId,
    }: {
        timespan: Timespan;
        categories: F24Category[];
        dittaId?: string;
    }): any => {
        let map: any = {};
        categories.forEach((c) => (map[c] = 0));
        for (const doc of f24Documents.value) {
            if (dittaId !== undefined && doc.ditta_id != dittaId) continue;
            for (const aggregationKey in doc.aggregations) {
                if (!timespan.fits(doc.application_date)) continue;
                let category = stringToF24Category(aggregationKey);
                if (category === undefined || (categories !== undefined && !categories.includes(category))) continue;
                map[category] += doc.aggregations[aggregationKey].balance_amount;
            }
        }
        return map;
    };

    const f24ComputeDocumentsStats = ({
        documents,
        timespan,
    }: {
        documents: any[];
        timespan?: Timespan;
    }): F24Statistics => {
        documents.sort((a, b) => b["application_date"].getTime() - a["application_date"].getTime());

        // let startDate = documents.length > 0 ? documents[documents.length - 1]["application_date"] : undefined;
        // let endDate = documents.length > 0 ? documents[0]["application_date"] : undefined;
        timespan ??= Timespan.all();
        let { intervalAggregation, documentsByInterval } = aggregateDocumentsInTimespan({
            elements: documents,
            key: "application_date",
            timespan: timespan,
        });
        let catSet: Set<string> = new Set();
        let timespanElements: { timespan: Timespan; elements: any[]; categories: F24CategoryAnalytics[] }[] = [];
        for (const timespanEl of documentsByInterval) {
            let categories: any = {};
            for (const documentModel of timespanEl.elements) {
                for (const aggregationKey in documentModel.aggregations) {
                    let aggregation = documentModel.aggregations[aggregationKey];
                    let category = stringToF24Category(aggregationKey);
                    if (category === undefined) continue;
                    let v =
                        categories[aggregationKey] ??
                        <F24CategoryAnalytics>{
                            key: category,
                            elements: [],
                            credit: 0,
                            debit: 0,
                            balance: 0,
                        };
                    v.elements.push(documentModel);
                    v.credit += aggregation.credit_amount;
                    v.debit += aggregation.debit_amount;
                    v.balance += aggregation.balance_amount;
                    catSet.add(aggregationKey);
                    categories[aggregationKey] = v;
                }
            }
            timespanElements.push({
                timespan: timespanEl.key,
                elements: timespanEl.elements,
                categories: Object.values<F24CategoryAnalytics>(categories),
            });
        }

        return {
            intervalAggregation: intervalAggregation,
            categoriesKeys: [...catSet.values()],
            documentsByTimespan: timespanElements,
            count: f24Documents.value.length,
            timespan: Timespan.all(),
        };
    };

    const f24ComputeStats = ({
        dittaId = undefined,
        timespan = Timespan.all(),
    }: {
        dittaId?: number;
        timespan?: Timespan;
    }): F24Statistics => {
        const documents = f24Documents.value.filter((i) => {
            return (!dittaId || i.ditta_id == dittaId) && timespan.fits(i["application_date"]);
        });
        return f24ComputeDocumentsStats({ documents, timespan });
    };

    const f24Fetch = async ({ ignoreCache = false }: { ignoreCache?: boolean }) => {
        if (f24Fetching.value && fetchPromise !== undefined) {
            await fetchPromise;
            return;
        }
        if (!ignoreCache && hasCache.value) return;
        f24Fetching.value = true;
        const cpa = useCpa();
        fetchPromise = api(endpoints.f24, {
            method: "POST",
            query: { customer_id: cpa.getData.id },
            body: {},
            onResponse({ request, response, options }) {
                if (response.ok) {
                    f24Documents.value = response._data.data
                        .map((_: any, i: number, array: any[]) => {
                            array[i]["application_date"] = parse(
                                array[i]["application_date"],
                                "dd-MM-yyyy",
                                new Date()
                            );
                            return array[i];
                        })
                        .sort((a: any, b: any) => b["application_date"].getTime() - a["application_date"].getTime());
                } else {
                    console.log(`problem with fetching f24s: ${JSON.stringify(response._data)}`);
                }

                f24Fetching.value = false;
                hasCache.value = true;
            },
            onResponseError({ request, response, options }) {
                console.log(`error fetching f24s: ${JSON.stringify(response._data)}`);
            },
        });
        await fetchPromise;
    };
    return {
        $reset,
        f24Documents,
        f24Fetch,
        f24GetCostsInTimespan,
        f24Fetching,
        f24ComputeStats,
        f24ComputeDocumentsStats,
    };
});
