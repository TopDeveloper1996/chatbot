<template>
    <div v-if="mounted"
        class="w-left flex flex-col flex-grow py-2 flex h-full px-2 md:pl-6 md:ml-[4.5rem] mt-[var(--h-navbar-height)] md:mt-0">
        <div class="sticky top-0 bg-gray-900 z-30 p-4">
            <div class="flex justify-between items-center mb-4">
                <h1 class="text-2xl font-bold">Team System Report</h1>
                <div class="absolute top-4 right-4">
                    <h3>{{ cpa.getDisplayData.name }}</h3>
                </div>
            </div>

            <DittaSearchBar @ditta-selected="selectDitta" :selectedDitta="cpa.dittas.selected"></DittaSearchBar>

        </div>
        <Transition name="fade" appear mode="out-in">
            <div v-if="computing" class="flex justify-center w-full">
                <div class="flex items-center flex-row gap-2">
                    <icon class="size-6" name="line-md:loading-twotone-loop"></icon>
                    <p class="">Recuperando i dati</p>
                </div>
            </div>
            <TeamsystemNoData 
                v-else-if="!haveData && !isRobotStarting && !isTSSyncing"
                :on-start-robot-modal="onStartRobotModal">
                </TeamsystemNoData>
            <TeamsystemFirstIntegration
                v-else-if="!haveData && (isRobotStarting || isTSSyncing)"
                >
                </TeamsystemFirstIntegration>
            <div v-else class="py-2 flex w-full flex-col gap-8">
                <div class="bg-[#172347] text-white w-[650px] py-4 px-6 rounded-lg flex items-center justify-between w-full " v-if="isRobotStarting">
                        <p class="text-base w-full">
                            {{  isRobotStartingText }}
                        </p>
                </div>
                <div class="bg-[#172347] text-white w-[650px] py-4 px-6 rounded-lg flex items-center justify-between w-full " v-if="isTSSyncing">
                        <p class="text-base w-full">
                            <icon name="ic:outline-access-time" class="text-[#F7891E] text-2xl mt-1"/>
                            Stiamo sincronizzando Ditta a TeamSystem, questo processo può richidere del tempo.
                        </p>
                </div>
                <div class="p-4 flex items-center justify-between">
                    <div class="flex items-center space-x-3">
                        <div class="flex flex-col items-stretch justify-start gap-2">
                            <DateFilterDropdown class="self-start" id="teamsystem_date_filter"
                                @timespan-change="(t) => updateTimespan(t)" :initial-filter="defaultDateFilter.id">
                            </DateFilterDropdown>
                        </div>
                        <div class="text-white  px-5 rounded-lg flex items-center justify-between w-full ">
                            <p class="bg-[#172347] py-4 px-4 rounded-lg flex items-center">
                                <icon name="material-symbols:info" class="size-6 mr-2"/>
                                Data Ultima sincronizzazione con TeamSystem è il - {{ lastSynchronizationDate }}
                            </p>
                        </div>
                    </div>
                    <div class="flex items-center space-x-2">
                        <button class="bg-[#6972fa] hover:bg-[#5c64e6] text-white font-semibold py-2 px-4 rounded-lg flex items-center"
                            @click="() => reportComments.toggle(true, { title: `Aggiungi commenti al Report: ${cpa.dittas.selected.registered_name} ` })">
                            <icon name="material-symbols:edit" class="size-8"></icon>
                        </button>
                        <button class="bg-[#6972fa] hover:bg-[#5c64e6] text-white font-semibold py-2 px-4 rounded-lg flex items-center"
                            @click="onStartRobotModal()"
                            v-if="cpa.dittas.selected">
                            <icon v-if="!tsReportDownloading" name="material-symbols:download-2" class="size-8"/>
                            <icon v-else name="line-md:loading-twotone-loop" class="size-8"/>
                        </button>
                        <button
                            @click="sendTsReport()"
                            v-if="config.public.ts_email_report_url"
                            :disabled="tsReportSending"
                            class="bg-[#6972fa] hover:bg-[#5c64e6] text-white font-semibold py-2 px-4 rounded-lg flex items-center">
                            <icon v-if="!tsReportSending" name="material-symbols:stacked-email" class="size-8"/>
                            <icon v-else name="line-md:loading-twotone-loop" class="size-8"/>
                            <span class="ml-2">Invia report</span>
                        </button>
                        <button class="bg-[#6972fa] hover:bg-[#5c64e6] text-white font-semibold py-2 px-4 rounded-lg flex items-center"
                            @click="download_extracted_data()">
                            <icon name="material-symbols:download-2" class="size-8"/>
                            <span class="ml-2">Extract data</span>
                        </button>
                        <!-- <button class="bg-[#6972fa] hover:bg-[#5c64e6] text-white font-semibold py-2 px-4 rounded-lg flex items-center"
                            @click="download_extracted_data()"
                            v-if="Number(cpa.getData.id)=== 10047">
                            <icon name="material-symbols:download-2" class="size-8"/>
                            <span class="ml-2">Extract data</span>
                        </button> -->
                    </div>
                </div>

                <template v-if="cpa.dittas.selected !== null && !computing">
                    <TeamsystemSummary :stats="teamsystemSummaryStats" @summary-org-completed="handle_summary_metrics" />
                    <TeamsystemChartsOverallChart :chartsData="teamSystemOverFocus" :timespan="ActiveTimespan" />
                    <TeamsystemChartsRicaviChart :chartsData="TeamSystemLastYearCurrentYEarChartData" @focus_ricabi_chart-org-completed="handle_focus_ricavi_chart"
                        :currentYear="lastQuartersTimespan" :lastYear="lastYearQuartersTimespan" :mode="cpa.dittas.selected?.vista_teamsystem_frequency" />
                    <TeamsystemChartsCostiVariabiliChart :chartsData="TeamSystemLastYearCurrentYEarChartData" @costi_variabili_chart-org-completed="handle_costi_variabili_chart"
                        :currentYear="lastQuartersTimespan" :lastYear="lastYearQuartersTimespan" :mode="cpa.dittas.selected?.vista_teamsystem_frequency" />
                    <TeamsystemChartsCostiFissiChart :chartsData="TeamSystemLastYearCurrentYEarChartData" @costi_fissi_chart-org-completed="handle_costi_fissi_chart"
                        :currentYear="lastQuartersTimespan" :lastYear="lastYearQuartersTimespan" :mode="cpa.dittas.selected?.vista_teamsystem_frequency" />
                    <TeamsystemChartsEbitdaChart :chartsData="TeamSystemLastYearCurrentYEarChartData" @ebitda_chart-org-completed="handle_ebitda_chart"
                        :currentYear="lastQuartersTimespan" :lastYear="lastYearQuartersTimespan" :mode="cpa.dittas.selected?.vista_teamsystem_frequency" />
                    <TeamsystemChartsUtileNettoChart :chartsData="TeamSystemLastYearCurrentYEarChartData" @utile_netto-org-completed="handle_utile_netto"
                        :currentYear="lastQuartersTimespan" :lastYear="lastYearQuartersTimespan" :mode="cpa.dittas.selected?.vista_teamsystem_frequency"  />
                    <TeamsystemChartsDurataMediaChart :chartsData="TeamSystemLastYearCurrentYEarChartData" @durata_media_del_crediti_chart-org-completed="handle_durata_media_del_crediti_chart"
                        :currentYear="lastQuartersTimespan" :lastYear="lastYearQuartersTimespan"
                        :mode="cpa.dittas.selected?.vista_teamsystem_frequency" 
                        @iva-changed="ivaUpdated" />
                    <TeamsystemChartsSituazioneDebitoriaChart :chartsData="TeamSystemLastYearCurrentYEarChartData" @situazione_debitoria_netta_chart-org-completed="handle_situazione_debitoria_netta_chart"
                    :mode="cpa.dittas.selected?.vista_teamsystem_frequency" 
                        :currentYear="lastQuartersTimespan" :lastYear="lastYearQuartersTimespan" />
                    <TeamsystemChartsDebitiChart :chartsData="TeamSystemLastYearCurrentYEarChartData" @debiti_chart-org-completed="handle_debiti_chart"
                    :mode="cpa.dittas.selected?.vista_teamsystem_frequency" 
                        :currentYear="lastQuartersTimespan" :lastYear="lastYearQuartersTimespan" />
                    <TeamsystemAndamentoEconomicoReport :chartsData="TeamSystemLastYearCurrentYEarChartData" @andamento_economico-org-completed="handle_andamento_economico"
                        :ytdData="yearToDateData" :lastYearData="lastYearData"
                        :mode="cpa.dittas.selected?.vista_teamsystem_frequency" 
                        :lastFiscalYear="lastFiscalYear"
                        :teamSystemLastAvailableDate="teamSystemLastAvailableDate"
                        :teamSystemLastAvailableDateStr="teamSystemLastAvailableDateStr"
                        :lastSynchedDate="lastSynchronizationDate"
                        :compute-simple-year-series="TSComputeSimpleYearSeries" />
                    <TeamsystemSituazioneDebitoriaCreditiziaReport @situazione_debitoria_e_creditizia-org-completed="handle_situazione_debitoria_e_creditizia"
                        :lastFiscalYear="lastFiscalYear"
                        :teamSystemLastAvailableDateStr="teamSystemLastAvailableDateStr"
                        :teamSystemLastAvailableDate="teamSystemLastAvailableDate"
                        :mode="cpa.dittas.selected?.vista_teamsystem_frequency" 
                        :ytdData="yearToDateData" :lastYearData="lastYearData"
                        :compute-ytd-data="TSComputeYearToSelectedDateData"
                        :yearToSelectedDateData="yearToSelectedDateData"
                        :chartsData="TeamSystemLastYearCurrentYEarChartData"
                        :lastSynchedDate="lastSynchronizationDate" />
                </template>
            </div>
        </Transition>
    </div>
    <ModalSheet height="90%" :controller="reportComments">
        <div class="flex flex-col w-full gap-6">
            <div class="mb-6">
                <div class="flex items-center mb-2">
                    <svg class="w-5 h-5 mr-2 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z"></path>
                        <path fill-rule="evenodd"
                            d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"
                            clip-rule="evenodd"></path>
                    </svg>
                    <p class="text-sm">Scrivi un sommario o un commento finale che verrà integrato nel report da inviare
                        al
                        cliente</p>
                </div>
            </div>

            <div class="mb-6">
                <label class="block text-sm font-medium mb-2" for="summary">Sommario (opzionale)</label>
                <textarea id="summary" rows="20" class="w-full bg-gray-800 rounded p-2 text-sm"
                    placeholder="Inserisci il sommario..." v-model="dittaReport.ts_report_summary"></textarea>
            </div>

            <div class="mb-6">
                <label class="block text-sm font-medium mb-2" for="final-comment">Commento finale (opzionale)</label>
                <textarea id="final-comment" rows="20" class="w-full bg-gray-800 rounded p-2 text-sm"
                    placeholder="Inserisci il commento finale..."

                    v-model="dittaReport.ts_report_final_comment"></textarea>
            </div>

            <div class="text-right">
                <button class="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded"
                    @click="() => saveReportComments()">
                    Salva
                </button>
            </div>
        </div>
    </ModalSheet>
    <ModalSheet :controller="modalSheet" height="100%">
        <div class="px-8">
            <DittasTeamsystemSync
                @ditta-sync-started="onStartRobot"
                :dittas="fullDittasToSync"
            ></DittasTeamsystemSync>
        </div>
    </ModalSheet>
</template>

<script lang="ts" setup>

import DateFilter from "~/src/date_filter";
import Timespan from "~/src/timespan";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { TeamSystemOverAllChart, TeamSystemSummary, TeamSystemRicaviChart, TeamSystemReport, TeamSystemLastYearCurrentYearChart } from "~/src/types/teamsystem_types";
import { result } from "lodash";
const { $notifications } = useNuxtApp();

const modalSheet = useModalSheet();
const mounted = useMounted();
const config = useRuntimeConfig();
const reportComments = useModalSheet();
const computing = ref<boolean>(true);
const teamSystemIva = ref<number>(10.00);
const focusTableData = ref<TeamSystemSummary>({});
const tableFocusTimeSpan = ref<Timespan>();
const teamsystemSummaryStats = ref<TeamSystemSummary>({});
const teamSystemOverFocus = ref<TeamSystemOverAllChart>({});
const teamSystemYTD = ref<TeamSystemOverAllChart>(<TeamSystemOverAllChart>{});
const TeamSystemLastYearCurrentYEarChartData = ref<TeamSystemLastYearCurrentYearChart>(<TeamSystemLastYearCurrentYearChart>{});
const yearToDateData = ref<TeamSystemLastYearCurrentYearChart>(<TeamSystemLastYearCurrentYearChart>{});
const yearToSelectedDateData = ref<TeamSystemLastYearCurrentYearChart>(<TeamSystemLastYearCurrentYearChart>{});
const lastYearData = ref<TeamSystemLastYearCurrentYearChart>(<TeamSystemLastYearCurrentYearChart>{});
const yearToSelecteDateTimeSpan = ref<Timespan>(new Timespan(new Date(), new Date()));

const dittaReport = ref<TeamSystemReport>(<TeamSystemReport>{});
const teamSystemLastAvailableDate = ref<Date>(new Date());
const teamSystemLastAvailableDateStr = ref<string>("");
const tsReportSending = ref<boolean>(false);
const tsReportDownloading = ref<boolean>(false);
const fullDittasToSync = ref<any[]>([]);
const isRobotStarting = ref<boolean>(false);
const isRobotStartingText = ref<string>("");
const isTSSyncing = ref<boolean>(false);
const haveData = ref<boolean>(false);
const lastQuartersTimespan = ref<Timespan>(new Timespan(new Date(), new Date()));

let robotStartingTimeoutId: any = null;

const endpoints = useEndpoints();
const { api } = useApi();
const lastFiscalYear = getLastFiscalYear();

const now = new Date();
const lastYearToday = new Date(now.getFullYear() - 1, now.getMonth(), 1);

const lastYearQuartersTimespan = Timespan.getLastFullyEndedNQuartersBounds(lastYearToday, 4);

const currentYearTimespan = new Timespan(
    new Date(`${now.getFullYear()}-01-01`),
    new Date(`${now.getFullYear()}-12-31`)
);
const lastYearTimespan = new Timespan(
    new Date(now.getFullYear() - 1, 0, 1, 0, 0, 0),
    new Date(now.getFullYear(), 0, 0, 23, 59, 59),
);

const lastTwelveMonths = new Timespan(
    new Date(`${now.getFullYear() - 1}-${now.getMonth() + 1}-01`),
    new Date(`${now.getFullYear()}-${now.getMonth()}-01`)
);
const previewTwelveMonths = new Timespan(
    new Date(`${now.getFullYear() - 2}-${now.getMonth() + 1}-01`),
    new Date(`${now.getFullYear() - 1}-${now.getMonth()}-01`)
);


const teamsystem = useTeamSystemStore();

const { teamSystemSelectedDittaId, lastSynchronizationDate } = storeToRefs(teamsystem);
const { teamsystemFetch, computeSummary, computeStatsSeries, computeLastYearCurrentYearSeries, computeSimpleYearSeries,computeSummaryMonthly, computeAllData,computeYTDSeries, getReportConfig, saveReportConfig, getHaveData, getLastAvailableDate } = teamsystem;
const cpa = useCpa();
const DEFAULT_DITTA = 147; // SABBIATURA PADANA di POLETTI MAURIZIO

const defaultDateFilter = DateFilter.filters.YearToDate;
const ActiveTimespan = ref<Timespan>(defaultDateFilter.getTimespan());

const fromYear = ref<number>(defaultDateFilter.getTimespan().from.getFullYear());
const fromMonth = ref<number>(defaultDateFilter.getTimespan().from.getMonth() + 1);
const activeFocusTimeLabel = ref<string>("");

const report_data = ref<any>({
    summary_metrics: "",
    charts: [],
    situazione_debitoria_e_creditizia: {},
    andamento_economico: {}
});

watch(() => cpa.dittas.selected, (newValue) => {
  const company_info = {
    "name": newValue?.registered_name,
    "Business process type": newValue?.business_process_type,
    "good or service distribution": newValue?.good_or_service_distribution,
    "process inputs": newValue?.process_inputs,
    "business process output": newValue?.business_process_output,
    "customers description": newValue?.customers_description,
    "ateco code": newValue?.customers_description,
    "ateco description": newValue?.ateco_description,
    "rea number": newValue?.rea_code
  };
  report_data.value.company_info = company_info;
}, { immediate: true });

const handle_focus_ricavi_chart = (result: any) => {
    report_data.value.charts = [...report_data.value.charts, result]
}

const handle_costi_variabili_chart = (result: any) => {
    report_data.value.charts = [...report_data.value.charts, result]
}

const handle_costi_fissi_chart = (result: any) => {
    report_data.value.charts = [...report_data.value.charts, result]
}

const handle_ebitda_chart = (result: any) => {
    report_data.value.charts = [...report_data.value.charts, result]
}

const handle_utile_netto = (result: any) => {
    report_data.value.charts = [...report_data.value.charts, result]
}

const handle_durata_media_del_crediti_chart = (result: any) => {
    report_data.value.charts = [...report_data.value.charts, result]
}

const handle_situazione_debitoria_netta_chart = (result: any) => {
    report_data.value.charts = [...report_data.value.charts, result]
}

const handle_debiti_chart = (result: any) => {
    report_data.value.charts = [...report_data.value.charts, result]
}

const handle_andamento_economico = (result: any) => {
    report_data.value.andamento_economico = result;
}

const handle_situazione_debitoria_e_creditizia = (result: any) => {
    report_data.value.situazione_debitoria_e_creditizia = result;
}

const handle_summary_metrics = (result: any) => {
    report_data.value.summary_metrics = result;
}

const download_extracted_data = () => {
    const jsonString = JSON.stringify(report_data.value, null, 2); // Pretty print with indentation
    const blob = new Blob([jsonString], { type: 'application/json' });
    
    // Create a link element
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = "TeamSystem_export.json";

    // Append to the document and trigger download
    document.body.appendChild(link);
    link.click();
    
    // Clean up and remove the link
    document.body.removeChild(link);
}


const categories = computed(() => {
    return cpa.dittas.selected?.vista_teamsystem_frequency === "monthly" ? Timespan.getMonthlyIntervals(lastQuartersTimespan.value).map((d) => format(d.from, "MMM", { locale: it })) : Timespan.getQuarterlyIntervals(lastQuartersTimespan.value).map((d)  => "Q " + format(d.from, "QQ", { locale: it }));
});

const TSComputeSimpleYearSeries = ({ activeTimespan , focusTimeLabel} : { activeTimespan: Timespan,focusTimeLabel:string }) : TeamSystemSummary => {
    tableFocusTimeSpan.value = activeTimespan;
    activeFocusTimeLabel.value = focusTimeLabel;
    //focusTableData.value =  computeSimpleYearSeries({ activeTimespan });
    focusTableData.value =  computeSummaryMonthly({ activeTimespan });
    return focusTableData.value;
};

const TSComputeYearToSelectedDateData= ({ activeTimespan } : { activeTimespan: Timespan }) : TeamSystemLastYearCurrentYearChart => {
    yearToSelecteDateTimeSpan.value = activeTimespan;
    yearToSelectedDateData.value = computeAllData({ focusTimespan: activeTimespan });
    return yearToSelectedDateData.value;
};

async function onStartRobotModal() {
    fullDittasToSync.value = [cpa.dittas.selected]
    modalSheet.toggle(true, { title: "Teamsystem Sincronizza" });
}

async function onStartRobot() {
    $notifications.add({
        message: "Sincronizzazione in corso",
        icon: "material-symbols:check",
        timeout: 15000 // milliseconds
    });
    isRobotStarting.value = true;
    isRobotStartingText.value = "Robot in Partenza ...";
    robotStartingTimeoutId = setTimeout(() => {
        isRobotStartingText.value  += "...";
        fetchTeamsystemeQueue();
    }, 2000);
};


async function teamsystemeRobotStarted() {
    modalSheet.toggle(false);
    $notifications.add({
        message: "Sincronizzazione in corso",
        icon: "material-symbols:check",
        timeout: 20000 // milliseconds
    });
};

async function sendTsReport() {
    const ditta = cpa.dittas.selected;
    console.log(`sending email to ditta: ${JSON.stringify(ditta)}`);
    tsReportSending.value = ditta.id;
    const notificationId = $notifications.add({
        message: "invio rapporto in corso",
        icon: "material-symbols:check",
        timeout: 10000 // milliseconds
    });
    await api(endpoints.teamSystemReport, {
        method: "POST",
        body: {
            dittaId: ditta.id, customerId: cpa.getData.id, data: {
                teamSystemYTD: teamSystemYTD.value,
                teamSystemOverFocus: teamSystemOverFocus.value,
                teamSystemLastYearCurrentYearChartData: TeamSystemLastYearCurrentYEarChartData.value,
                yearToDateData: yearToDateData.value,
                teamSystemSummaryStats: teamsystemSummaryStats.value,
                focusTableData: focusTableData.value,
                ditta: cpa.dittas.selected,
                cpa: cpa.getData,
                focusPeriod : tableFocusTimeSpan.value ? tableFocusTimeSpan.value.toITLabel() : "YTD",
                iva: teamSystemIva.value,
                dittaReport : dittaReport.value,
                categories: categories.value,
                lastFiscalYear,
                teamSystemLastAvailableDateStr : teamSystemLastAvailableDateStr.value,
                focus:activeFocusTimeLabel.value,
                mode:cpa.dittas.selected?.vista_teamsystem_frequency,

            },
        },
        onResponse: async ({ request, response, options }) => {
            if (response.ok) {
                $notifications.remove(notificationId);
                console.log(`email sent to ditta: ${JSON.stringify(response._data)}`);
            } else {
                console.log(`problem with sending emails: ${JSON.stringify(response._data)}`);
            }
            tsReportSending.value = false;
            setTimeout(() => {
                $notifications.remove(notificationId);
            }, 5000);
        },
        onResponseError({ request, response, options }) {
            console.log(`error sending emails: ${JSON.stringify(response._data)}`);
        },
    });
};

function updateTimespan(t: Timespan) {
    if (ActiveTimespan.value.toLabel() != t.toLabel()) {
        ActiveTimespan.value = t;
        fromYear.value = t.from.getFullYear();
        fromMonth.value = t.from.getMonth() + 1;
        setTimeout(updateStats, 0);
    }
};

async function ivaUpdated(value: number) {
    console.log("ivaUpdated", value);
    teamSystemIva.value = value;
    await updateStats();
}

const saveReportComments = async () => {
    await saveReportConfig({ ts_report_config: dittaReport.value });
    reportComments.toggle(false);
    $notifications.add({
        message: "Commenti salvati",
        icon: "material-symbols:check",
        timeout: 5000 // milliseconds
    });
}

onMounted(async () => {
    if (!cpa.dittas.selected) {
        let sel = cpa.dittas.list.find((e) => e["ditta_number"] == DEFAULT_DITTA);
        if (sel) {
            await selectDitta(sel);
        } else if (cpa.dittas.list.length > 0) {
            await selectDitta(cpa.dittas.list[0]);
        }
    } else {
        computing.value = true;
        await updateStats();
        computing.value = false;
    }
    document.body.style.overflowY = "scroll";
});

async function fetchTeamsystemeQueue() {
    modalSheet.toggle(false);
    try{
        await api(endpoints.teamSystemQueue, {
            method: "GET",
            query: { customer_id: cpa.getData.id,},
            onResponse: async ({ request, response, options }) => {
                if (response.ok) {
                    const dittaQueue =  response._data.data.teamsystemQueue.filter((d: any) => d.ditta_id == cpa.dittas.selected.id.toString());
                    if(dittaQueue.length > 0 && dittaQueue[0].status != "COMPLETED") {
                        isRobotStarting.value = false;
                        isTSSyncing.value = true;
                        if (robotStartingTimeoutId) {
                            clearTimeout(robotStartingTimeoutId);
                        }
                    }
                } else {
                    console.log(`problem with fetching ditta sync details: ${JSON.stringify(response._data)}`);
                }
            },
            onResponseError({ request, response, options }) {
                console.log(`error fetching ditta sync details: ${JSON.stringify(response._data)}`);
            },
        });
     } catch (ex) {
        console.error('error fetching ditta sync details', ex);
    }
}

async function selectDitta(ditta: any) {
    computing.value = true;
    cpa.dittas.selected = ditta;
    if (ditta["id"] !== teamSystemSelectedDittaId.value) {
        console.log("fetching");
        await updateStats();
        console.log("done fetching");
    }
    computing.value = false;
}


async function updateStats() {
    try {
        await fetchTeamsystemeQueue();
        await teamsystemFetch({ dittaId: cpa.dittas.selected.ditta_number, cpa_id: cpa.dittas.selected.cpa_id, timespan: ActiveTimespan.value, iva: teamSystemIva.value, ignoreCache: false });
        teamSystemLastAvailableDate.value = getLastAvailableDate();
        lastQuartersTimespan.value = Timespan.getLastFullyEndedNQuartersBounds(teamSystemLastAvailableDate.value, 4);
        const haveDataValue = getHaveData();
        haveData.value = haveDataValue;
        if (!haveDataValue) return;
        teamSystemLastAvailableDateStr.value = getDateLabel(getLastMonthDate(teamSystemLastAvailableDate.value));
        teamsystemSummaryStats.value = computeSummary({}); // YTD
        teamSystemOverFocus.value = computeStatsSeries({ timespan: ActiveTimespan.value });
        const yearToDayTimespan = new Timespan(
            new Date(now.getFullYear(),0,1, 0,0,0),
            teamSystemLastAvailableDate.value
            // new Date(now.getFullYear(),3,1, 0,0,0), // for testing purposes
        );
        teamSystemYTD.value = computeYTDSeries({ timespan: yearToDayTimespan });
        TeamSystemLastYearCurrentYEarChartData.value = computeLastYearCurrentYearSeries({});
        yearToDateData.value = computeAllData({ focusTimespan: yearToDayTimespan });
        yearToSelectedDateData.value = computeAllData({ focusTimespan: yearToDayTimespan });
        lastYearData.value = computeAllData({ focusTimespan: lastYearTimespan });
        dittaReport.value = await getReportConfig({})
    } catch (ex) {
        console.error(ex);
    }
}


</script>
<style scoped>
 textarea {
        overflow-y: scroll;
        height: 300px;
        resize: none; /* Remove this if you want the user to resize the textarea */
    }
.w-left {
    width: 97vw;
}
</style>