<template>
     <div class="bg-[#232b46] p-4 rounded-md mb-4">
        <TeamsystemChartsVisataOptions :onOptionChange="(e) => changeAggregationMode(e)" 
            :mode="props.mode"
            :title="`Focus costi fissi`"
            :id="`focus_costi_fissi`" />
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
import { TeamSystemLastYearCurrentYearChart } from "~/src/types/teamsystem_types";
import { getMaxMin } from "~/src/common/math";

const bp = useBreakpoints(breakpointsTailwind);
const chartOptions = useChartOptions();
const props = defineProps<{ chartsData: TeamSystemLastYearCurrentYearChart , currentYear:Timespan , lastYear:Timespan, mode:string}>();


const aggrigationMode = ref<string>(props.mode);
const changeAggregationMode = (e: any) => {
    aggrigationMode.value = e;
};


const quartertlyData = convertToQuarterly(props.chartsData.costi_fissi.ytd_values);
const lastQuartertlyData = convertToQuarterly(props.chartsData.costi_fissi.lytd_values);
const categories = computed(() => {
    return aggrigationMode.value === "monthly" ? Timespan.getMonthlyIntervals(props.currentYear).map((d) => format(d.from, "MMM yy", { locale: it })) : Timespan.getQuarterlyIntervals(props.currentYear).map((d)  => "Q " + format(d.from, "QQ", { locale: it }));
});
const ytdSeries = computed(() => {
    return aggrigationMode.value === "monthly" ? props.chartsData.costi_fissi.ytd_values : quartertlyData;
});

const lytdSeries = computed(() => {
    return aggrigationMode.value === "monthly" ? props.chartsData.costi_fissi.lytd_values : lastQuartertlyData;
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
        config.xaxis.labels.style.fontSize = "16px";
        config.labels = `${props.currentYear.from} - ${props.currentYear.to}`;
        config.xaxis.categories = categories.value;
        config.markers = {
            size: 5,
        };
        let bounds = getMaxMin([...ytdSeries.value,...lytdSeries.value], 0.1);
        config.yaxis = [
                {
                    min: bounds.min,
                    max: bounds.max,
                    labels: {
                        style: { fontFamily: "Poppins", fontSize: "16px" },
                        formatter: (val: any, opts: any) =>
                            `${val.toLocaleString(undefined, { maximumFractionDigits: 1 })} €`,
                    },
                    opposite : true
                },
            ];
        return config;
    });
});

const emit = defineEmits<{ (e: 'costi_fissi_chart-org-completed', result: any): void }>();

watch(() => props, (newValue) => {
    const bounds = getMaxMin([...props.chartsData.costi_fissi.ytd_values, ...props.chartsData.costi_fissi.lytd_values], 0.1);
    const result = {
        name: "Focus costi fissi",
        type: "line",
        x_axis: Timespan.getMonthlyIntervals(props.currentYear).map((d) => format(d.from, "MMM yy", { locale: it })),
        y_axis_range: [bounds.min, bounds.max],
        "Anno corrente": props.chartsData.costi_fissi.ytd_values,
        "Anno precedente": props.chartsData.costi_fissi.lytd_values
    };
    emit('costi_fissi_chart-org-completed', result);
}, { immediate: true });
</script>

<style></style>
