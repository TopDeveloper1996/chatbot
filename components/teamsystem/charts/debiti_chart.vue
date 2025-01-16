<template>
     <div class="bg-[#232b46] p-4 rounded-md mb-4">
        <span class="block text-lg mb-2">Debiti</span>
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
import * as stringUtils from "~/src/common/string";

const bp = useBreakpoints(breakpointsTailwind);
const chartOptions = useChartOptions();
const props = defineProps<{ chartsData: TeamSystemLastYearCurrentYearChart , currentYear:Timespan , lastYear:Timespan, mode:string}>();


const aggrigationMode = ref<string>(props.mode);
const changeAggregationMode = (e: any) => {
    aggrigationMode.value = e;
};


const quartertlyData = convertToQuarterly(props.chartsData.debiti_sum.ytd_values);
const lastQuartertlyData = convertToQuarterly(props.chartsData.debiti_sum.lytd_values);
const ytdSeries = computed(() => {
    return aggrigationMode.value === "monthly" ? props.chartsData.debiti_sum.ytd_values : quartertlyData;
});

const lytdSeries = computed(() => {
    return aggrigationMode.value === "monthly" ? props.chartsData.debiti_sum.lytd_values : lastQuartertlyData;
});

const data = computed(() => {
    return [
        {
            name: "Anno corrente",
            data: props.chartsData.debiti_sum.ytd_values,
            type: "bar",
            color: "#76419F",
            group: 'actual',
        },
        {
            name: "Anno precedente",
            data:  props.chartsData.debiti_sum.lytd_values,
            type: "bar",
            color: "#1AA1E0",
            group: 'precedente',
        },
    ];
});


const options = computed(() => {
    return chartOptions.getOptions("bar", (config) => {
        config.chart.stacked = true;
        config.tooltip.shared = true;
        config.tooltip.intersect = false;
        config.xaxis.labels.show = true;
        //config.dataLabels.enabled = false;
        config.markers.size = 6;
        config.xaxis.labels.rotate = 0;
        config.xaxis.labels.style.fontSize = "16px";
        config.labels = `${props.currentYear.from} - ${props.currentYear.to}`;
        config.xaxis.categories = Timespan.getMonthlyIntervals(props.currentYear).map((d) => format(d.from, "MMM yy", { locale: it }));
        config.plotOptions = {
            bar: {
                horizontal: false,
                columnWidth: '55%',
                endingShape: 'rounded'
            },
        };
        config.dataLabels = {
            enabled: true,
            formatter: (val: number) => {
                return stringUtils.toCurrencyString(val)
            },
        };
        config.markers = {
            size: 5,
        };
        config.stroke={
          show: true,
          width: 2,
          colors: ['transparent']
        };
        config.yaxis = [
            {
                labels: {
                    style: { fontFamily: "Poppins", fontSize: "16px" },
                    formatter: (val: any, opts: any) =>
                        val ? `${val.toLocaleString(undefined, { maximumFractionDigits: 1 })} €` : "",
                },
                opposite: true
            },
        ];
        return config;
    });
});
const emit = defineEmits<{ (e: 'debiti_chart-org-completed', result: any): void }>();

watch(() => props, (newValue) => {
    const bounds = getMaxMin([...props.chartsData.debiti_sum.ytd_values, ...props.chartsData.debiti_sum.lytd_values], 0.1);
    const result = {
        name: "Debiti",
        type: "line",
        x_axis: Timespan.getMonthlyIntervals(props.currentYear).map((d) => format(d.from, "MMM yy", { locale: it })),
        y_axis_range: [bounds.min, bounds.max],
        "Anno corrente": props.chartsData.debiti_sum.ytd_values,
        "Anno precedente": props.chartsData.debiti_sum.lytd_values
    };
    emit('debiti_chart-org-completed', result);
}, { immediate: true });
</script>

<style></style>
