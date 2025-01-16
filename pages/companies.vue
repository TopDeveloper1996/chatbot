<template>
    <div class="w-left flex flex-col flex-grow py-2 flex h-full px-2 md:pl-6 md:ml-[4.5rem] mt-[var(--h-navbar-height)] md:mt-0">
        <div class="sticky top-0 bg-gray-900 z-20 p-4">
            <div class="flex justify-between items-center mb-4">
                <h1 class="text-2xl font-bold">Ditte 360</h1>
                <div class="absolute top-4 right-4">
                    <h3>{{ cpa.getDisplayData.name }}</h3>
                </div>
            </div>

            <DittaSearchBar @ditta-selected="selectDitta" :selectedDitta="cpa.dittas.selected"></DittaSearchBar>
        </div>
        <div class="flex-1 overflow-y-auto">
            <div id ='ditta_360_all' v-if="cpa.dittas.selected !== null" class="pb-8 gap-12">
                <!-- <Ditta :ditta-model="cpa.dittas.selected"></Ditta> -->

                <Transition name="fade" appear mode="out-in">
                    <div v-if="computing" class="flex justify-center w-full">
                        <div class="flex items-center flex-row gap-2">
                            <icon class="size-6" name="line-md:loading-twotone-loop"></icon>
                            <p class="">Recuperando i dati</p>
                        </div>
                    </div>
                    

                    <div v-else class="py-2 flex w-full flex-col gap-8">
                        <div class="p-4 flex items-center justify-between">
                            <div class="flex items-center space-x-3"></div>
                            <div class="flex items-center space-x-2">
                                <button class="bg-[#6972fa] hover:bg-[#5c64e6] text-white font-semibold py-2 px-4 rounded-lg flex items-center"
                                    @click="() => ditta360reportComments.toggle(true, { title: `Aggiungi commenti al Report: ${cpa.dittas.selected.registered_name} ` })">
                                    <icon name="material-symbols:edit" class="size-8"></icon>
                                </button>
                            
                                <button
                                    @click="sendDittaReport()"
                                    v-if="config.public.ditta_email_report_url"
                                    :disabled="dittaReportSending"
                                    class="bg-[#6972fa] hover:bg-[#5c64e6] text-white font-semibold py-2 px-4 rounded-lg flex items-center">
                                    <icon v-if="!dittaReportSending" name="material-symbols:stacked-email" class="size-8"/>
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
                        <CompaniesSummary :ditta-id="invoicesSelectedDittaId" @summary-org-completed="handle_summary"></CompaniesSummary>
                        <!-- <CompaniesRevenueCostsPeriodsAnalysis></CompaniesRevenueCostsPeriodsAnalysis> -->
                        <!-- <CompaniesRevenueCostsTables
                        first-period-label="YTD"
                        second-period-label="LYTD"
                        :comparison-stats="comparison"
                    ></CompaniesRevenueCostsTables> -->
                        <!-- <div class="px-2 py-4 bg-blue-600/15 rounded-xl">
                        <WatchScreenSize>
                            <CompaniesRevenueCostsChartsComparison
                                :comparison-stats="comparison"
                            ></CompaniesRevenueCostsChartsComparison>
                            <div class="divider"></div>
                            <CompaniesRevenueCostsChartsCategories
                                :comparison-stats="comparison"
                            ></CompaniesRevenueCostsChartsCategories>
                        </WatchScreenSize>
                    </div> -->
                        <div class="divider"></div>
                        <div class="px-2 py-4 rounded-xl">
                            <div class="flex justify-between items-center p-4 bg-customBlue text-white">
                                <div>
                                    <span class="text-xl font-semibold p-2">Panoramica fatture</span>
                                    <span class="text-accent text-xl font-bold">
                                        <b>{{ invoicesStats.count }}</b> fatture
                                    </span>
                                </div>
                                <DateFilterDropdown
                                    id="invoices_date_filter"
                                    @timespan-change="updateTimespan"
                                    :initial-filter="defaultDateFilter.id"
                                ></DateFilterDropdown>
                            </div>
                            <WatchScreenSize>
                                <div class="px-2 py-4 rounded-xl border">
                                    <CompaniesRevenueCostsChartsTrend :stats="invoicesStats" :dittastats="dittaStatsSeries" @trend_chart-org-completed="handle_trend_chart">
                                    </CompaniesRevenueCostsChartsTrend>
                                    <div class="divider"></div>
                                    
                                    <div class="border-[2px] my-4 p-4 rounded-xl border-outline">
                                        <CompaniesRevenueCostsChartsCashFlowProjection :stats="futureInvoicesStats" @cash_flow_projection_chart-org-completed="handle_cash_flow_projection_chart">
                                        </CompaniesRevenueCostsChartsCashFlowProjection>
                                        <CompaniesRevenueCostsPaymentStatusTables :stats="invoicesStats">
                                        </CompaniesRevenueCostsPaymentStatusTables>
                                    </div>
                                    
                                    <div class="divider"></div>
                                    <CompaniesRevenueCostsChartsRicavi :stats="invoicesStats" :dittaStatsSeriesytd="dittaStatsSeriesytd" :dittaStatsSerieslytd="dittaStatsSerieslytd" @focus_ricavi_chart-org-completed="handle_focus_ricavi_chart">
                                    </CompaniesRevenueCostsChartsRicavi>
                                    <div class="divider"></div>
                                    <CompaniesRevenueCostsChartsCost :stats="invoicesStats" :dittaStatsSeriesytd="dittaStatsSeriesytd" :dittaStatsSerieslytd="dittaStatsSerieslytd" @focus_costi_chart-org-completed="handle_focus_costi_chart">
                                    </CompaniesRevenueCostsChartsCost>
                                    
                                    <CompaniesRevenueCostsChartsEbitda :stats="invoicesStats" :dittaStatsSeriesytd="dittaStatsSeriesytd" :dittaStatsSerieslytd="dittaStatsSerieslytd" @ebitda_chart-org-completed="handle_ebitda_chart">
                                    </CompaniesRevenueCostsChartsEbitda>
                                    
                                    <CompaniesRevenueCostsChartsUtileDiPeriodo :stats="invoicesStats" :dittaStatsSeriesytd="dittaStatsSeriesytd" :dittaStatsSerieslytd="dittaStatsSerieslytd" @utile_di_periodo_chart-org-completed="handle_utile_di_periodo_chart">
                                    </CompaniesRevenueCostsChartsUtileDiPeriodo>
                                    <div class="divider"></div>
                                    <CompaniesRevenueCostsChartsSeasonality 
                                        @analisi_stagionalita_per_anno_fiscale_chart-org-completed="handle_analisi_stagionalita_per_anno_fiscale_chart"
                                        @analisi_stagionalita_per_ultimi_12_mesi_chart-org-completed="handle_analisi_stagionalita_per_ultimi_12_mesi_chart"
                                    ></CompaniesRevenueCostsChartsSeasonality>
                                    <div class="divider"></div>
                                    <!-- <CompaniesCategories :stats="invoicesStats"></CompaniesCategories> -->
                                </div>
                            </WatchScreenSize>
                        </div>

                        <div class="divider"></div>
                        <div class="px-2 py-4 rounded-xl border">
                            <CompaniesIncomeStatement
                                @income_statement-org-completed="handle_income_statement"
                                @ditta-page-updated="onDittaUpdate"
                            ></CompaniesIncomeStatement>
                        </div>
                    </div>
                </Transition>
            </div>
        </div>
    </div>
    <ModalSheet height="90%" :controller="ditta360reportComments">
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
                    placeholder="Inserisci il sommario..." v-model="dittaTextSummaryandFinalComment.ditta_report_summary"></textarea>
            </div>

            <div class="mb-6">
                <label class="block text-sm font-medium mb-2" for="final-comment">Commento finale (opzionale)</label>
                <textarea id="final-comment" rows="20" class="w-full bg-gray-800 rounded p-2 text-sm"
                    placeholder="Inserisci il commento finale..."

                    v-model="dittaTextSummaryandFinalComment.ditta_report_final_comment"></textarea>
            </div>

            <div class="text-right">
                <button class="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded"
                    @click="() => saveDitta360ReportComments()">
                    Salva
                </button>
            </div>
        </div>
    </ModalSheet>
</template>

<script lang="ts" setup>
import DateFilter from "~/src/date_filter";
import Timespan from "~/src/timespan";
import l from "lodash";
import { DittaSummaryOverAllChart, 
    DittaSummaryChart, 
    DittaTextSummaryFinalComment, 
} from "~/src/types/analytics_types";

const ditta360reportComments = useModalSheet();
const config = useRuntimeConfig();
const defaultDateFilter = DateFilter.filters.ThisYear;
const { $notifications } = useNuxtApp();
const cpa = useCpa();
const dittaTextSummaryandFinalComment = ref<DittaTextSummaryFinalComment>(<DittaTextSummaryFinalComment>{});
const ditta360 = useDitta360Store();
const { income_statement, focusPeriodLabel, ditta360SelectedDittaId, ditta360SelectedCpaID } = storeToRefs(ditta360);
const { getDitta360ReportConfig, saveDitta360ReportConfig } = ditta360;
const timespan = ref<Timespan>(defaultDateFilter.getTimespan());
const futureTimespan = ref<Timespan>(Timespan.last8MonthsToFuture4months()); // 8 months ago to 4 months in the future
const invoicesStats = ref<InvoicesStatistics>(<InvoicesStatistics>{});
const dittaStatsSeries = ref<DittaSummaryOverAllChart>(<DittaSummaryOverAllChart>{});
const dittaStatsSeriesytd = ref<DittaSummaryOverAllChart>(<DittaSummaryOverAllChart>{});
const dittaStatsSerieslytd = ref<DittaSummaryOverAllChart>(<DittaSummaryOverAllChart>{});
const futureInvoicesStats = ref<InvoicesStatistics>(<InvoicesStatistics>{});
const computing = ref<boolean>(true);

const endpoints = useEndpoints();
const { api } = useApi();
const fees = useFees();
const f24 = useF24();
const invoices = useInvoices();
const { invoicesSelectedDittaId } = storeToRefs(invoices);
const { invoicesFetch, invoicesComputeStats } = invoices;
const userProvidedData = useUserProvidedDataStore();
const { userProvidedDataFetch } = userProvidedData;
const dittaReportSending = ref<boolean>(false);
const dittaReportDownloading = ref<boolean>(false);

const report_data = ref<any>({
    company_info: {},
    summary_metrics: "",
    charts: [],
    situazione_debitoria_e_creditizia: {},
    andamento_economico: {},
    analisi_stagionalita: {},
    conte_economico: {}
});

watch(() => cpa.dittas.selected, (newValue) => {
  const company_info = {
    "name": newValue?.registered_name,
    "Business process type": newValue?.business_process_type,
    "good or service distribution": newValue?.good_or_service_distribution,
    "process inputs": newValue?.process_inputs,
    "business process output": newValue?.business_process_output,
    "customers description": newValue?.customers_description,
    "ateco code": newValue?.ateco_code,
    "ateco description": newValue?.ateco_description,
    "rea number": newValue?.rea_code
  };
  report_data.value.company_info = company_info;
}, { immediate: true });

const handle_summary = (result: any) => {
    report_data.value.summary_metrics = result;
}

const handle_trend_chart = (result: any) => {
    report_data.value.charts = [...report_data.value.charts, result]
}

const handle_cash_flow_projection_chart = (result: any) => {
    report_data.value.charts = [...report_data.value.charts, result]
}

const handle_focus_ricavi_chart = (result: any) => {
    report_data.value.charts = [...report_data.value.charts, result]
}

const handle_focus_costi_chart = (result: any) => {
    report_data.value.charts = [...report_data.value.charts, result]
}

const handle_ebitda_chart = (result: any) => {
    report_data.value.charts = [...report_data.value.charts, result]
}

const handle_utile_di_periodo_chart = (result: any) => {
    report_data.value.charts = [...report_data.value.charts, result]
}

const handle_analisi_stagionalita_per_anno_fiscale_chart = (result: any) => {
    report_data.value.analisi_stagionalita.per_anno_fiscale = result
}

const handle_analisi_stagionalita_per_ultimi_12_mesi_chart = (result: any) => {
    report_data.value.analisi_stagionalita.per_ultimi_12_mesi = result
}

const handle_income_statement = (result: any) => {
    report_data.value.conte_economico = result
}

const download_extracted_data = () => {
    const jsonString = JSON.stringify(report_data.value, null, 2); // Pretty print with indentation
    const blob = new Blob([jsonString], { type: 'application/json' });
    
    // Create a link element
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = "Ditte360_export.json";

    // Append to the document and trigger download
    document.body.appendChild(link);
    link.click();
    
    // Clean up and remove the link
    document.body.removeChild(link);
}

function updateTimespan(t: Timespan) {
    if (timespan.value.toLabel() != t.toLabel()) {
        timespan.value = t;
        setTimeout(async () => (invoicesStats.value = await invoicesComputeStats({ timespan: timespan.value })), 0);
    }
}

onMounted(async () => {
    if (!cpa.dittas.selected) {
        // let sel = cpa.dittas.list.find((e: any) => e["id"] == 4571);
        let sel = null;
        if (cpa.dittas.input_ditta){
            sel = cpa.dittas.list.find((e: any) => e["id"] == Number(cpa.dittas.input_ditta));
        }
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
async function computeDittaStatsSeries({activetimespan=Timespan.yearToDate()}:{activetimespan?: Timespan}) {
   
    const ditta_f24s = f24.f24Documents.filter((f) => f.ditta_id == cpa.dittas.selected.id);
    const ditta_invoices = invoices.invoicesDocuments.filter((f) => f.ditta_id == cpa.dittas.selected.id);
    const ditta_fees = fees.feesDocuments.filter((f) => f.ditta_id == cpa.dittas.selected.id);
    
    const statsSeries = <DittaSummaryOverAllChart>{
        ricavi: [],
        costi: [], // costi_fissi_variabili + costi_operativi
        margine_lordo: [],
        ebitda: [], // ricavi - costi
        itda: [],
        profitto_netto: [], // ricavi - costi - itda
        costi_fissi_variabili: [],
        costi_operativi: [],
        year: [],
        month: [],
        isUserProvideData: [],
    };
    
    Timespan.getMonthlyIntervals(activetimespan).map((i) => {
     
      
        const filteredF24s = ditta_f24s.filter((f) => i.fits(f.application_date));
        const filteredInvoices = ditta_invoices.filter((a) => i.fits(a.emission_date));
        const filteredfees = ditta_fees.filter((fe) => i.fits(fe.detection_date));
        const filteredUserProvideData = userProvidedData.income_statements.filter(
        (a: any) =>
          a.period_month === i.from.getMonth() + 1 &&
          a.period_year === i.from.getFullYear()
      );
      
       
   
      const summary = computeDittaSummary({ 
        invoices : filteredInvoices,
        fees: filteredfees,
        f24s: filteredF24s,
        userProvidedData: filteredUserProvideData,
        timespan: i});
      
      statsSeries.ricavi.push(summary.ricavi);
      statsSeries.costi.push(summary.costi);
      statsSeries.margine_lordo.push(summary.margine_lordo);
      statsSeries.ebitda.push(summary.ebitda);
      statsSeries.itda.push(summary.itda);
      statsSeries.profitto_netto.push(summary.profitto_netto);
      statsSeries.costi_fissi_variabili.push(summary.costi_fissi_variabili);
      statsSeries.costi_operativi.push(summary.costi_operativi);
      statsSeries.year.push(summary.year);
      statsSeries.month.push(summary.month);
      statsSeries.isUserProvideData.push(summary.isUserProvideData);
    });
    return statsSeries;
  };

  function computeDittaSummary({
    invoices,
    fees,
    f24s,
    userProvidedData,
    timespan,
}: {
    invoices: any[];
    fees: any[];
    f24s: any[];
    userProvidedData: any[];
    timespan: Timespan;
}) {

    let stats = <DittaSummaryChart>{ 
        ricavi: 0,
        costi: 0, // costi_fissi_variabili + costi_operativi
        margine_lordo: 0,
        ebitda: 0, // ricavi - costi
        itda: 0,
        profitto_netto: 0, // ricavi - costi - itda
        costi_fissi_variabili: 0,
        costi_operativi: 0,
        year: 0,
        month: 0,
        isUserProvideData: userProvidedData.length > 0 ? true : false};
    const taxesCategories = ["versamenti reddito", "ires", "irap", "tasse locali", "tasse regionali"];
    let taxes = 0

    
    
    for (const f24 of f24s?? []) {
        for (const aggregationKey in f24.aggregations) {
            if (!taxesCategories.includes(aggregationKey)) continue;
            taxes += f24.aggregations[aggregationKey].balance_amount;
        }
    }
    
    let focusUserProvideDataCost = userProvidedData.filter((f) => f.income_statement_type == 'cost');
    let focusUserProvideDataITDA = userProvidedData.filter((f) => f.income_statement_type == 'itda');
    
    
    let user_provided_cost = 0;
    let user_provided_itda = 0;
    for (const user_cost of focusUserProvideDataCost?? []) { 
        user_provided_cost += Number(user_cost["income_statement_value"]);
        
    }
    for (const user_itdas of focusUserProvideDataITDA ?? []) { 
        user_provided_itda += Number(user_itdas["income_statement_value"]);
        
    }
    const total_fees=l.sumBy(fees, "total_without_iva");  
    
    
    stats.ricavi = l.sumBy(
        invoices.filter((e) => e.type === "attiva"),
        "total_without_iva"
    );
    let production_cost = l.sumBy(
        invoices.filter((e) => e.type === "passiva"),
        "total_without_iva"
    );
    
    stats.ricavi+= total_fees;
    stats.costi_fissi_variabili = production_cost;
    stats.margine_lordo = stats.ricavi - stats.costi_fissi_variabili;
    stats.costi_operativi = user_provided_cost;
    stats.costi = production_cost + user_provided_cost;
    
    stats.ebitda = stats.ricavi - stats.costi;
    stats.itda = user_provided_itda;
    stats.profitto_netto = stats.ricavi - stats.costi - stats.itda - taxes;
    stats.year = timespan.from.getFullYear();
    stats.month = timespan.from.getMonth() + 1;

  
return stats;
};

const saveDitta360ReportComments = async () => {
    await saveDitta360ReportConfig({ ditta360_report_config: dittaTextSummaryandFinalComment.value });
    ditta360reportComments.toggle(false);
    $notifications.add({
        message: "Commenti salvati",
        icon: "material-symbols:check",
        timeout: 5000 // milliseconds
    });
}

async function updateStats() {
    try {
        ditta360SelectedDittaId.value = cpa.dittas.selected.id;
        ditta360SelectedCpaID.value = cpa.dittas.selected.cpa_id;
        await Promise.all([invoicesFetch({ dittaId: cpa.dittas.selected.id }), fees.feesFetch({}), f24.f24Fetch({}), userProvidedDataFetch({dittaId: cpa.dittas.selected.id, ignoreCache: true})]);
        invoicesStats.value = await invoicesComputeStats({ timespan: timespan.value });
        futureInvoicesStats.value = await invoicesComputeStats({ timespan: futureTimespan.value });
        dittaStatsSeries.value = await computeDittaStatsSeries({activetimespan:timespan.value});
        dittaStatsSeriesytd.value = await computeDittaStatsSeries({activetimespan:Timespan.yearToDate()});
        dittaStatsSerieslytd.value = await computeDittaStatsSeries({activetimespan:Timespan.yearToDateLastYear()});
        dittaTextSummaryandFinalComment.value = await getDitta360ReportConfig({});
        
      
    } catch (ex) {
        console.error("error computing stats");
    }
}

async function selectDitta(ditta: any) {
    computing.value = true;
    cpa.dittas.selected = ditta;
    if (ditta["id"] !== invoicesSelectedDittaId.value) {
        await updateStats();
    }
    computing.value = false;
}

async function onDittaUpdate() {
    console.log('refresh full ditta 360 page data');
    computing.value = true;
    await updateStats();
    computing.value = false;
}



async function sendDittaReport() {
    const ditta = cpa.dittas.selected;
    console.log(`sending email to ditta: ${JSON.stringify(ditta)}`);
    dittaReportSending.value = ditta.id;
    // console.log(income_statement.value);
    // console.log(focusPeriodLabel.value);
    const notificationId = $notifications.add({
        message: "invio rapporto in corso",
        icon: "material-symbols:check",
        timeout: 10000 // milliseconds
    });
   
    await api(endpoints.ditta_360_Report, {
        method: "POST",
        body: {
            dittaId: ditta.id, customerId: cpa.getData.id, income_statement: income_statement.value, focusPeriodLabel: focusPeriodLabel.value
        },
        onResponse: async ({ request, response, options }) => {
            if (response.ok) {
                $notifications.remove(notificationId);
                console.log(`email sent to ditta: ${JSON.stringify(response._data)}`);
            } else {
                console.log(`problem with sending emails: ${JSON.stringify(response._data)}`);
            }
            dittaReportSending.value = false;
            setTimeout(() => {
                $notifications.remove(notificationId);
            }, 5000);
            
        },
        onResponseError({ request, response, options }) {
            console.log(`error sending emails: ${JSON.stringify(response._data)}`);
        },
    });
};

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
