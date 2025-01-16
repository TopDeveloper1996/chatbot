import l from "lodash";
import * as stringUtils from "~/src/common/string";
export interface Cpa {
    name: string;
    id: string;
    isDemo: boolean;
    studioName: string;
    blobContainerName?: string;
}

const CPA_ENABLED_TEAMSYSTEM = ["10047", "10014", "10046", "10028","10039","10008","10053", "10033", "10034", "10036","10043","10072","10056", "10057", "10058", "10015", "10021", "10082"];

export const useCpa = defineStore("cpa", () => {
    const endpoints = useEndpoints();
    const { api } = useApi();
    const input_ditta = ref("");
    const settingsModel = ref<any>({});
    const selectedDitta = ref<any | null>(null);
    const data = ref<Cpa>({ name: "", id: "", studioName: "", isDemo: false, blobContainerName:"" });
    const logged = ref(false);
    const cpaDittasInfo = ref<any>({});
    const isLogged = computed(() => logged.value);
    const getData = computed(() => data.value);
    const isTeamSystem = computed(() => CPA_ENABLED_TEAMSYSTEM.includes(data.value.id.toString()));
    const getDisplayData = computed(() =>
        data.value.isDemo
            ? <Cpa>{ name: "Mentally Demo", studioName: "Mentally Studio Demo", id: data.value.id, isDemo: true }
            : data.value
    );
    const scraperApiAccess = ref<string | undefined>(undefined);
    const scraperApiAccessTokenCookie = useCookie("scraper_access_token");

    const login = async ({ cpa, username, password, selected_ditta }: { cpa: Cpa; username?: string; password?: string; selected_ditta?: string }) => {
        data.value = cpa;
        // Fetch also F24 and fees so that the web app is faster and has cache of documents
        const f24 = useF24();
        const fees = useFees();
        const processStats = useProcessStatisticsStore();
        input_ditta.value = selected_ditta ?? '';
        Promise.all([
            fees.feesFetch({}).then(() => console.log("fees fetched")),
            f24.f24Fetch({}).then(() => console.log("f24 fetched")),
            processStats.processStatisticsFetch({}).then(() => console.log("process statistics fetched")),
        ]);
        await Promise.all([
            fetchDittas().then(() => console.log("dittas fetched")),
            fetchSettings().then(() => console.log("settings fetched")),
            initScraperApi(username, password).then(() => console.log("scraper API initialized")),
        ]);
        logged.value = true;
    };

    const dittasList = computed(() => cpaDittasInfo.value.dittas ?? []);
    
    

    async function initScraperApi(username?: string, password?: string) {
        if (username && password) {
            await $fetch("https://ade.mentally.ai/api/v1/token/", {
                method: "POST",
                headers: {
                    Accept: "*/*",
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email: username, password: password }),
                onResponse({ request, response, options }) {
                    if (response.ok) {
                        scraperApiAccess.value = response._data.access;
                        scraperApiAccessTokenCookie.value = scraperApiAccess.value;
                    } else {
                    }
                },
                onResponseError({ request, response, options }) {
                    console.log(`error intializing scraper API adementally session: ${JSON.stringify(response._data)}`);
                },
            });
        } else {
            scraperApiAccess.value = scraperApiAccessTokenCookie.value ?? undefined;
        }
    }
    const getSettings = (): any => {
        return l.cloneDeep(settingsModel.value);
    };

    const getDittaData = (ditta_id: number): any | undefined => {
        return dittasList.value.find((d: any) => d.id == ditta_id);
    };

    function $reset() {
        settingsModel.value = {};
        selectedDitta.value = null;
        data.value = { name: "", id: "", isDemo: false, studioName: "", blobContainerName:"" };
        logged.value = false;
        cpaDittasInfo.value = {};
    }

    const logout = () => {
        const invoices = useInvoices();
        const f24 = useF24();
        const userProvidedData=useUserProvidedDataStore();
        $reset();
        f24.$reset();
        invoices.$reset();
        userProvidedData.$reset();
    };

    const dittasElasticSearch = (query: string, amount: number = 5) => {
        let sorted = dittasList.value.toSorted(
            (a: any, b: any) =>
                stringUtils.similarity(query, `${b["id"]} ${b["registered_name"]}`) -
                stringUtils.similarity(query, `${a["id"]} ${a["registered_name"]}`)
        );
        return sorted.slice(0, amount);
    };

    async function fetchSettings() {
        try {
            await api(endpoints.settings, {
                method: "GET",
                query: { customer_id: data.value.id },
                onResponse({ request, response, options }) {
                    if (response.status == 200) {
                        settingsModel.value = response._data.data;
                    }
                },
                onResponseError({ request, response, options }) {
                    console.log("error fetching settings");
                },
            });
        } catch (_) { }
    }

    const pushSettings = async (settingsModel: any) => {
        await api(endpoints.settings, {
            method: "POST",
            query: { customer_id: data.value.id },
            body: settingsModel,
            onResponse({ request, response, options }) {
                if (response.status == 200) {
                    settingsModel.value = response._data.data;
                }
            },
            onResponseError({ request, response, options }) {
                console.log("error pushing settings");
            },
        });
    };

    function demoNameReplacer(i: number, name: string) {
        const regexpObjects = [
            { regexp: /s\.?r\.?l/gim, pattern: "SRL" },
            { regexp: /s\.?r\.?l\.?s/gim, pattern: "SRLS" },
            { regexp: /s\.?s/gim, pattern: "SS" },
            { regexp: /s\.?p\.?a/gim, pattern: "SPA" },
            { regexp: /s\.?a\.?p\.?a/gim, pattern: "SAPA" },
            { regexp: /s\.?n\.?c/gim, pattern: "SNC" },
            { regexp: /s\.?a\.?s/gim, pattern: "SAS" },
        ];
        const match = regexpObjects.find((r) => r.regexp.exec(name) !== null);
        if (match) {
            return `Ditta ${name} - ${i} (${match.pattern})`;
        }
        return `Ditta ${i}`;
    }

    const fetchDittas = async (withCounts:boolean = false ) => {
        await api(endpoints.userDittas, {
            method: "GET",
            query: { customer_id: data.value.id ,withCounts : withCounts},
            onResponse({ request, response, options }) {
                if (response.ok) {
                    cpaDittasInfo.value = response._data.data;
                    if (data.value.isDemo) {
                        cpaDittasInfo.value.dittas = cpaDittasInfo.value.dittas.map((d: any, i: number) => {
                            d.registered_name = demoNameReplacer(i, d.registered_name);
                            d.codice_fiscale = `DEMOFISCALCODE${i}`;
                            d.vat_id = `IT000000000${i}`;
                            return d;
                        });
                    }
                } else {
                    console.log(`problem with fetching dittas: ${JSON.stringify(response._data)}`);
                }
            },
            onResponseError({ request, response, options }) {
                console.log("error fetching dittas");
            },
        });
    };

    const setSettings = (newSettings: any) => {
        settingsModel.value = newSettings;
    };

    return {
        getData,
        login,
        logout,
        isLogged,
        getDisplayData,
        getSettings,
        setSettings,
        scraperApiAccess,
        pushSettings,
        isTeamSystem,

        dittas: {
            elasticSearch: dittasElasticSearch,
            fetch: fetchDittas,
            selected: selectedDitta,
            input_ditta: input_ditta,
            list: dittasList,
            info: cpaDittasInfo,
            getDittaData,
        },
    };
});
