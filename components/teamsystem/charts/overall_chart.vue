<template>
    <div>
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
import { getMaxMin } from "~/src/common/math";

const bp = useBreakpoints(breakpointsTailwind);
const chartOptions = useChartOptions();
const props = defineProps<{ chartsData: TeamSystemOverAllChart , timespan:Timespan}>();

const removeEmpty = (data: number[]) => {
    return data.filter((d) => d !== 0);
};

const data = computed(() => {
    return [
        {
            name: "Ricavi",
            data: removeEmpty(props.chartsData.ricavi),
            type: "line",
            color: "#76419F",
        },
        {
            name: "Costi variabili",
            data: removeEmpty(props.chartsData.costi_variabili),
            type: "line",
            color: "#1AA1E0",
        },
        {
            name: "Costi fissi",
            data: removeEmpty(props.chartsData.costi_fissi),
            type: "line",
            color: "#1AA1E0",
        },
        {
            name: "EBITDA",
            data: removeEmpty(props.chartsData.ebitda),
            type: "line",
            color: "#5264CF",
        },
        {
            name: "Utile del periodo",
            data: removeEmpty(props.chartsData.utile_del_periodo),
            type: "line",
            color: "#D2D2D2",
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
        config.labels = `${props.chartsData.year} - ${props.chartsData.month}`;
        config.xaxis.categories = Timespan.getMonthlyIntervals(props.timespan).filter(d => d).map((d) => format(d.from, "MMM yy", { locale: it }));
        config.markers = {
            size: 5,
        };
        const bounds = getMaxMin([...props.chartsData.ricavi,...props.chartsData.costi,...props.chartsData.ebitda,...props.chartsData.utile_del_periodo], 0.1);
        config.yaxis = [
                {
                    min: bounds.min,
                    max: bounds.max,
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
</script>

<style></style>
