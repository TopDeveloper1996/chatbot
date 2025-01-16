<template>
    <div class="flex flex-col gap-8 items-center border-[2px] border-outline p-4 rounded-xl">
        <div class="w-full">
            <h3 class="text-center">Analisi Stagionalita per anno fiscale</h3>
            <p class="text-center">
                La seguente analisi prende in considerazione i ricavi ed i costi degli anni
                <span class="font-bold text-accent"
                    >{{ yearlyTimespans.map((t) => t.from.getFullYear().toString()).join(", ") }}
                </span>
            </p>
            <div class="flex flex-row justify-stretch mt-8 gap-6">
                <div class="flex-1 flex flex-col items-center justify-around">
                    <div class="w-full" v-for="(data, i) in yearlyStatistics">
                        <apexchart
                            :id="i.toString()"
                            type="line"
                            class="w-full"
                            height="300px"
                            :options="
                                options(
                                    data,
                                    data.stats.invoicesByTimespan.map((e) =>
                                        stringUtils.capitalize(format(e.key.to, 'LLL', { locale: it }))
                                    )
                                )
                            "
                            :series="chartData(data)"
                        ></apexchart>
                    </div>
                </div>
                <div class="flex-1 flex flex-col items-center justify-around">
                    <ScrollableTable :enable-tip="false">
                        <DownloadableTable
                            title="seasonality_years_revenue"
                            :bottom-download="false"
                            :headers="months"
                            :mapper="(data) => l.range(1, 12).map((i) => data.stats.actives.sumByTimespan[i - 1] ?? 0)"
                            :elements="yearlyStatistics"
                        >
                            <table class="conto-table">
                                <thead>
                                    <tr>
                                        <th>Ricavi</th>
                                        <th class="font-bold" v-for="i in 12">{{}}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="data in yearlyStatistics">
                                        <td class="font-bold">{{ data.label }}</td>
                                        <td class="text-sm" v-for="i in 12">
                                            {{
                                                stringUtils.toCurrencyString(
                                                    data.stats.actives.sumByTimespan[i - 1] ?? 0
                                                )
                                            }}
                                        </td>
                                    </tr>
                                </tbody>
                            </table></DownloadableTable
                        >
                    </ScrollableTable>
                    <ScrollableTable :enable-tip="false">
                        <DownloadableTable
                            title="seasonality_years_costs"
                            :bottom-download="false"
                            :headers="months"
                            :mapper="(data) => l.range(1, 12).map((i) => data.stats.passives.sumByTimespan[i - 1] ?? 0)"
                            :elements="yearlyStatistics"
                        >
                            <table class="conto-table">
                                <thead>
                                    <tr>
                                        <th>Costi</th>
                                        <th class="font-bold" v-for="i in 12">
                                            {{
                                                format(new Date(new Date().getFullYear(), i - 1), "MMM", { locale: it })
                                            }}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="data in yearlyStatistics">
                                        <td class="font-bold">{{ data.label }}</td>
                                        <td class="text-sm" v-for="i in 12">
                                            {{
                                                stringUtils.toCurrencyString(
                                                    data.stats.passives.sumByTimespan[i - 1] ?? 0
                                                )
                                            }}
                                        </td>
                                    </tr>
                                </tbody>
                            </table></DownloadableTable
                        >
                    </ScrollableTable>
                    <ScrollableTable :enable-tip="false">
                        <DownloadableTable
                            title="seasonality_years_profit"
                            :bottom-download="false"
                            :headers="months"
                            :mapper="(data) => l.range(1, 12).map((i) => getProfitTrend(data)[i - 1] ?? 0)"
                            :elements="yearlyStatistics"
                        >
                            <table class="conto-table">
                                <thead>
                                    <tr>
                                        <th>Profitto</th>
                                        <th class="font-bold" v-for="i in 12">
                                            {{
                                                format(new Date(new Date().getFullYear(), i - 1), "MMM", { locale: it })
                                            }}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="data in yearlyStatistics">
                                        <td class="font-bold">{{ data.label }}</td>
                                        <td class="text-sm" v-for="i in 12">
                                            {{ stringUtils.toCurrencyString(getProfitTrend(data)[i - 1]) ?? 0 }}
                                        </td>
                                    </tr>
                                </tbody>
                            </table></DownloadableTable
                        >
                    </ScrollableTable>
                </div>
            </div>
        </div>
        <div class="w-full">
            <h3 class="text-center">Analisi Stagionalita per Ultimi 12 Mesi</h3>
            <p class="text-center">
                La seguente analisi prende in considerazione
                <span class="font-bold text-accent">gli ultimi 12 mesi con i 12 mesi precedenti </span>
            </p>
            <div class="flex flex-row justify-stretch mt-8 gap-6">
                <div class="flex-1 flex flex-col items-center justify-around">
                    <div class="w-full" v-for="(data, i) in fiscalStatistics">
                        <apexchart
                            :id="i.toString()"
                            type="line"
                            class="w-full"
                            height="300px"
                            :options="
                                options(
                                    data,
                                    data.stats.invoicesByTimespan.map((e) =>
                                        stringUtils.capitalize(format(e.key.from, 'LLL yy', { locale: it }))
                                    )
                                )
                            "
                            :series="chartData(data)"
                        ></apexchart>
                    </div>
                </div>
                <div class="flex-1 flex flex-col items-center justify-around">
                    <ScrollableTable :enable-tip="false">
                        <DownloadableTable
                            title="seasonality_fiscal_revenue"
                            :bottom-download="false"
                            :headers="months"
                            :mapper="(data) => l.range(1, 12).map((i) => data.stats.actives.sumByTimespan[i - 1] ?? 0)"
                            :elements="fiscalStatistics"
                        >
                            <table class="conto-table">
                                <thead>
                                    <tr>
                                        <th>Ricavi</th>
                                        <th class="font-bold" v-for="i in 12">
                                            {{
                                                format(
                                                    new Date(new Date().getFullYear(), new Date().getMonth() + i - 1),
                                                    "MMM",
                                                    { locale: it }
                                                )
                                            }}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="data in fiscalStatistics">
                                        <td class="font-bold">{{ data.label }}</td>
                                        <td class="text-sm" v-for="i in 12">
                                            {{
                                                stringUtils.toCurrencyString(
                                                    data.stats.actives.sumByTimespan[i - 1] ?? 0
                                                )
                                            }}
                                        </td>
                                    </tr>
                                </tbody>
                            </table></DownloadableTable
                        >
                    </ScrollableTable>
                    <ScrollableTable :enable-tip="false">
                        <DownloadableTable
                            title="seasonality_fiscal_costs"
                            :bottom-download="false"
                            :headers="months"
                            :mapper="(data) => l.range(1, 12).map((i) => data.stats.passives.sumByTimespan[i - 1] ?? 0)"
                            :elements="fiscalStatistics"
                        >
                            <table class="conto-table">
                                <thead>
                                    <tr>
                                        <th>Costi</th>
                                        <th class="font-bold" v-for="i in 12">
                                            {{
                                                format(
                                                    new Date(new Date().getFullYear(), new Date().getMonth() + i - 1),
                                                    "MMM",
                                                    { locale: it }
                                                )
                                            }}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="data in fiscalStatistics">
                                        <td class="font-bold">{{ data.label }}</td>
                                        <td class="text-sm" v-for="i in 12">
                                            {{
                                                stringUtils.toCurrencyString(
                                                    data.stats.passives.sumByTimespan[i - 1] ?? 0
                                                )
                                            }}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </DownloadableTable>
                    </ScrollableTable>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { format } from "date-fns";
import { it } from "date-fns/locale";
import l from "lodash";
import * as stringUtils from "~/src/common/string";
import Timespan from "~/src/timespan";

interface SeasonalityData {
    stats: InvoicesStatistics;
    label: string;
}

const yearlyTimespans = [Timespan.lastYear(), Timespan.pastYear(2), Timespan.pastYear(3)];
const fiscalTimespans = [Timespan.lastNMonths(11), Timespan.previousNMonths(11)];

const chartOptions = useChartOptions();
const { invoicesComputeStats } = useInvoices();

const yearlyStatistics = ref<SeasonalityData[]>([]);
const fiscalStatistics = ref<SeasonalityData[]>([]);

onMounted(updateStats);

function getProfitTrend(data: SeasonalityData) {
    return l
        .zip(data.stats.actives.sumByTimespan, data.stats.passives.sumByTimespan)
        .map((el) => (el[0] ?? 0) - (el[1] ?? 0));
}

const months = l
    .range(1, 12)
    .map((i) => format(new Date(new Date().getFullYear(), new Date().getMonth() + i - 1), "MMM", { locale: it }));

async function updateStats() {
    const stats = await Promise.all([
        Promise.all(yearlyTimespans.map((t) => invoicesComputeStats({ timespan: t, grouping: "monthly" }))),
        Promise.all(fiscalTimespans.map((t) => invoicesComputeStats({ timespan: t, grouping: "monthly" }))),
    ]);
    yearlyStatistics.value = stats[0].map((s) => ({ stats: s, label: s.timespan.from.getFullYear().toString() }));
    const thisYear = new Date().getFullYear();
    fiscalStatistics.value = stats[1].map((s) => ({
        stats: s,
        label: s.timespan.from.getFullYear() === thisYear - 1 ? "Ultimi 12 mesi" : "12 mesi precedenti",
    }));
}

function chartData(stats: SeasonalityData) {
    return [
        {
            name: "Ricavi",
            data: stats.stats.actives.sumByTimespan,
            color: "#1FADAD",
        },
        {
            name: "Costi",
            data: stats.stats.passives.sumByTimespan,
            color: "#AD1F7E",
        },
        {
            name: "Primo margine",
            data: l
                .zip(stats.stats.actives.sumByTimespan, stats.stats.passives.sumByTimespan)
                .map((el: any) => (el[0] ?? 0) - (el[1] ?? 0)),
            color: "#1FAD1F",
        },
    ];
}

function options(data: SeasonalityData, labels: (string | null | undefined)[]) {
    return computed(() =>
        chartOptions.getOptions("line", (config) => {
            config.labels = labels;
            config.xaxis.labels.rotate = 0;
            config.xaxis.labels.offsetX = 3;
            config.title.text = data.label;
            config.xaxis.labels.show = true;
            config.legend.show = false;
            config.chart.toolbar.show = true;
            config.xaxis.labels.style.fontSize = "16px";
            config.dataLabels.enabled = false;
            config.chart.events = {};
            let bounds = {
                min: l.min([
                    l.min(data.stats.passives.sumByTimespan),
                    l.min(data.stats.actives.sumByTimespan),
                    l.min(
                        l
                            .zip(data.stats.actives.sumByTimespan, data.stats.passives.sumByTimespan)
                            .map((el: any) => (el[0] ?? 0) - (el[1] ?? 0))
                    ),
                ]),
                max: l.max([
                    l.max(data.stats.passives.sumByTimespan),
                    l.max(data.stats.actives.sumByTimespan),
                    l.max(
                        l
                            .zip(data.stats.actives.sumByTimespan, data.stats.passives.sumByTimespan)
                            .map((el: any) => (el[0] ?? 0) - (el[1] ?? 0))
                    ),
                ]),
            };

            config.yaxis = [
                {
                    min: bounds.min,
                    max: bounds.max,
                    labels: {
                        style: { fontFamily: "Poppins", fontSize: "16px" },
                        formatter: (val: any, opts: any) =>
                            `${val.toLocaleString(undefined, { maximumFractionDigits: 1 })} €`,
                    },
                },
            ];
            return config;
        })
    ).value;
}

const emit = defineEmits<{ 
    (e: 'analisi_stagionalita_per_anno_fiscale_chart-org-completed', result: any): void
    (e: 'analisi_stagionalita_per_ultimi_12_mesi_chart-org-completed', result: any): void
 }>();
const result_1 = ref<any>([])
watch(() => yearlyStatistics.value, (newValue) => {
    for(let i=0; i < yearlyStatistics.value.length; i++){
        const chat_data = chartData(yearlyStatistics.value[i])
        const bounds = getMaxMin([...chat_data[0].data, ...chat_data[1].data, ...chat_data[2].data ], 0.1);
        const chat_chip = {
            name: yearlyStatistics.value[i].label,
            type: "line",
            x_axis: yearlyStatistics.value[i].stats.invoicesByTimespan.map((e) =>stringUtils.capitalize(format(e.key.to, 'LLL', { locale: it }))),
            y_axis_range: [bounds.min, bounds.max],
            ricavi: chat_data[0].data,
            costi: chat_data[1].data,
            primo_margine: chat_data[2].data
        }
        result_1.value = [...result_1.value, chat_chip]
    }
    emit('analisi_stagionalita_per_anno_fiscale_chart-org-completed', result_1);
}, { immediate: true });

const result_2 = ref<any>([])
watch(() => fiscalStatistics.value, (newValue) => {
    for(let i=0; i < fiscalStatistics.value.length; i++){
        const chat_data = chartData(fiscalStatistics.value[i])
        const bounds = getMaxMin([...chat_data[0].data, ...chat_data[1].data, ...chat_data[2].data ], 0.1);
        const chat_chip = {
            name: fiscalStatistics.value[i].label,
            type: "line",
            x_axis: fiscalStatistics.value[i].stats.invoicesByTimespan.map((e) =>stringUtils.capitalize(format(e.key.to, 'LLL', { locale: it }))),
            y_axis_range: [bounds.min, bounds.max],
            ricavi: chat_data[0].data,
            costi: chat_data[1].data,
            primo_margine: chat_data[2].data
        }
        result_2.value = [...result_2.value, chat_chip]
    }
    emit('analisi_stagionalita_per_ultimi_12_mesi_chart-org-completed', result_2);
}, { immediate: true });
</script>

<style lang="css" scoped>
.conto-table {
    @apply outline-none border-none !important;

    th {
        @apply border-t-0 border-l-0 border-r-0 border-b-[2px] border-outline bg-surface !important;
    }

    td {
        @apply outline-none border-none !important;
    }

    tr {
        @apply outline-none !important;
    }
}
</style>
