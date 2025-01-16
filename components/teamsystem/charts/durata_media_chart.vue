<template>
    <div class="bg-[#232b46] p-4 rounded-md mb-4">
        <TeamsystemChartsVisataOptions :onOptionChange="(e) => changeAggregationMode(e)" 
            :title="`Durata media dei crediti`"
            :mode="props.mode"
            :id="`durata_media_dei_crediti`">
            <div
                class="bg-[#182235] text-[#94a3b8] px-4 py-2 rounded-lg flex items-center space-x-2 border border-[#2e4a67]">
                <div class="max-w-[200px]  flex items-center space-x-2">
                    <div class="flex items-center bg-[#192038] rounded-lg py-2 px-3">
                        <span class="text-[#00a8ff] font-semibold mr-2">IVA Media</span>
                        <div class="relative">
                            <input type="number"  v-model="durata_media_dei_crediti_iva" min="0" max="100" step="0.01" :readonly="readonly_iva"
                                class="text-[#8a93ad] w-full pl-4 pr-10 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Enter value">
                            <span class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-500">%</span>
                            </div>
                    </div>
                    <button class="bg-[#00c2ff] hover:bg-[#00a8e6] p-2 rounded-lg"
                        @click="readonly_iva = !readonly_iva">
                    >
                        <icon name="material-symbols:edit" class="fa-solid fa-pen text-[#192038]"/>
                    </button>
                </div>
            </div>
        </TeamsystemChartsVisataOptions>
        <apexchart
            class="w-full max-w-[100%] min-w-[250px] lg:min-w-[400px]"
            width="100%"
            :height="bp.greaterOrEqual('md').value ? '500px' : '350px'"
            :options="options"
            :series="data"
        ></apexchart>
    </div>
</template>

<script lang="ts" setup>
import { breakpointsTailwind } from "@vueuse/core";
import { format } from "date-fns";
import Timespan from "~/src/timespan";
import { it } from "date-fns/locale";
import l from "lodash";
import * as stringUtils from "~/src/common/string";
import { TeamSystemLastYearCurrentYearChart } from "~/src/types/teamsystem_types";
import { getMaxMin } from "~/src/common/math";
const readonly_iva = ref<boolean>(true);
const durata_media_dei_crediti_iva = ref<number>(10.00);

const bp = useBreakpoints(breakpointsTailwind);
const chartOptions = useChartOptions();
const props = defineProps<{ chartsData: TeamSystemLastYearCurrentYearChart , currentYear:Timespan , lastYear:Timespan, mode:string}>();

const aggrigationMode = ref<string>(props.mode);
const emit = defineEmits<{ 
    (e: "ivaChanged", model: any): void
    (e: 'durata_media_del_crediti_chart-org-completed', result: any): void
 }>();

watch(() => durata_media_dei_crediti_iva.value, (value) => {
    emit("ivaChanged", value);
});

const changeAggregationMode = (e: any) => {
    aggrigationMode.value = e;
};
const quartertlyData = convertToQuarterly(props.chartsData.durata_media_del_credito.ytd_values);
const lastQuartertlyData = convertToQuarterly(props.chartsData.durata_media_del_credito.lytd_values);
const categories = computed(() => {
    return aggrigationMode.value === "monthly" ? Timespan.getMonthlyIntervals(props.currentYear).map((d) => format(d.from, "MMM yy", { locale: it })) : Timespan.getQuarterlyIntervals(props.currentYear).map((d)  => "Q " + format(d.from, "QQ", { locale: it }));
});
const ytdSeries = computed(() => {
    return aggrigationMode.value === "monthly" ? props.chartsData.durata_media_del_credito.ytd_values : quartertlyData;
});

const lytdSeries = computed(() => {
    return aggrigationMode.value === "monthly" ? props.chartsData.durata_media_del_credito.lytd_values : lastQuartertlyData;
});

const data = computed(() => {
    return [
        {
            name: "Anno corrente",
            data: ytdSeries.value,
            type: "line",
            color: "#76419F",
        },
        {
            name: "Anno precedente",
            data:  lytdSeries.value,
            type: "line",
            color: "#1AA1E0",
        },
    ];
});

const options = computed(() => {
    return chartOptions.getOptions("line", (config) => {
        config.chart.stacked = true;
        config.tooltip.shared = true;
        config.tooltip.intersect = false;
        config.xaxis.labels.show = true;
        config.dataLabels.enabled = false;
        config.markers.size = 6;
        config.xaxis.labels.rotate = 0;
        config.stroke= {show: true, width: 2, lineCap: 'butt'};
        config.xaxis.labels.style.fontSize = "16px";
        config.labels = `${props.currentYear.from} - ${props.currentYear.to}`;
        config.xaxis.categories = categories.value;
        config.markers = {
            size: 5,
            showNullDataPoints: true
        };
        const bounds = getMaxMin([...ytdSeries.value,...lytdSeries.value], 0.1);
        config.yaxis = [
                {
                    min: bounds.min,
                    max: bounds.max,
                    labels: {
                        style: { fontFamily: "Poppins", fontSize: "16px" },
                        formatter: (val: any, opts: any) =>
                            `${val.toLocaleString(undefined, { maximumFractionDigits: 1 })} giorni`,
                    },
                    opposite : true
                },
            ];
        return config;
    });
});

watch(() => props, (newValue) => {
    const bounds = getMaxMin([...props.chartsData.durata_media_del_credito.ytd_values, ...props.chartsData.durata_media_del_credito.lytd_values], 0.1);
    const result = {
        name: "Durata media dei crediti",
        type: "line",
        x_axis: Timespan.getMonthlyIntervals(props.currentYear).map((d) => format(d.from, "MMM yy", { locale: it })),
        y_axis_range: [bounds.min, bounds.max],
        "Anno corrente": props.chartsData.durata_media_del_credito.ytd_values,
        "Anno precedente": props.chartsData.durata_media_del_credito.lytd_values
    };
    emit('durata_media_del_crediti_chart-org-completed', result);
}, { immediate: true });
</script>

<style></style>
