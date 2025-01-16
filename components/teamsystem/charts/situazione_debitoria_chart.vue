<template>
    <div class="bg-[#232b46] p-4 rounded-md mb-4">
        <span class="block text-lg mb-2">Situazione Debitoria Netta</span>
        <span class="block text-xs mb-2">Crediti - Debiti</span>
        <apexchart class="w-full max-w-[100%] min-w-[250px] lg:min-w-[400px]" width="100%"
            :height="bp.greaterOrEqual('md').value ? '500px' : '350px'" :options="options" :series="data"></apexchart>
    </div>
</template>

<script lang="ts" setup>
import { breakpointsTailwind } from "@vueuse/core";
import { format } from "date-fns";
import Timespan from "~/src/timespan";
import { it } from "date-fns/locale";
import * as stringUtils from "~/src/common/string";
import { TeamSystemLastYearCurrentYearChart } from "~/src/types/teamsystem_types";

const bp = useBreakpoints(breakpointsTailwind);
const chartOptions = useChartOptions();
const props = defineProps<{ chartsData: TeamSystemLastYearCurrentYearChart, currentYear: Timespan, lastYear: Timespan }>();


const data = computed(() => {
    return [
        {
            name: "Anno corrente",
            data: props.chartsData.credit_debit.ytd_values,
            type: "bar",
            color: "#76419F",
            group: 'actual',
        },
        {
            name: "Anno precedente",
            data: props.chartsData.credit_debit.lytd_values,
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
                        `${val.toLocaleString(undefined, { maximumFractionDigits: 1 })} €`,
                },
                opposite: true
            },
        ];
        return config;
    });
});

const emit = defineEmits<{ (e: 'situazione_debitoria_netta_chart-org-completed', result: any): void }>();

watch(() => props, (newValue) => {
    const bounds = getMaxMin([...props.chartsData.credit_debit.ytd_values, ...props.chartsData.credit_debit.lytd_values], 0.1);
    const result = {
        name: "Situazione Debitoria Netta",
        type: "line",
        x_axis: Timespan.getMonthlyIntervals(props.currentYear).map((d) => format(d.from, "MMM yy", { locale: it })),
        y_axis_range: [bounds.min, bounds.max],
        "Anno corrente": props.chartsData.credit_debit.ytd_values,
        "Anno precedente": props.chartsData.credit_debit.lytd_values
    };
    emit('situazione_debitoria_netta_chart-org-completed', result);
}, { immediate: true });
</script>

<style></style>
