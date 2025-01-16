import { parse } from "date-fns";
import l from "lodash";
import Timespan from "~/src/timespan";
export const useFees = defineStore("fees", () => {
    const feesDocuments = ref<any[]>([]);
    const feesFetching = ref<boolean>(false);
    const endpoints = useEndpoints();
    let fetchPromise: Promise<any> | undefined = undefined;
    const hasCache = ref<boolean>(false);
    const { api } = useApi();

    function $reset() {
        feesFetching.value = true;
        feesDocuments.value = [];
    }

    const filterFees = ({ dittaId, timespan }: { dittaId?: string; timespan?: Timespan }): any[] => {
        return l.filter(feesDocuments.value, (e) => {
            return (
                (dittaId === undefined || e.ditta_id == dittaId) &&
                (timespan === undefined || timespan.fits(e.detection_date))
            );
        });
    };

    const feesFetch = async ({ ignoreCache = false }: { ignoreCache?: boolean }) => {
        if (feesFetching.value && fetchPromise !== undefined) {
            await fetchPromise;
            return;
        }
        if (!ignoreCache && hasCache.value) return;
        feesFetching.value = true;
        const cpa = useCpa();
        fetchPromise = api(endpoints.fee, {
            method: "POST",
            query: { customer_id: cpa.getData.id },
            body: {},
            onResponse({ request, response, options }) {
                if (response.ok) {
                    feesDocuments.value = response._data.data
                        .map((e: any) => {
                            if (e["detection_date"]) {
                                e["detection_date"] = parse(e["detection_date"], "dd-MM-yyyy", new Date());
                            }
                            return e;
                        })
                        .sort((a: any, b: any) => b["detection_date"].getTime() - a["detection_date"].getTime());
                    hasCache.value = true;
                } else {
                    console.log(`problem with fetching fees: ${JSON.stringify(response._data)}`);
                }
            },
            onResponseError({ request, response, options }) {
                console.log(`error fetching fees: ${JSON.stringify(response._data)}`);
            },
        });
        await fetchPromise;
        feesFetching.value = false;
    };

    return {
        $reset,
        feesFetch,
        filterFees,
        feesDocuments,
        feesFetching,
    };
});
