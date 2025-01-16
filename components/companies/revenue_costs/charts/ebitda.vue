<template>
    <div v-if="isUserProvideDataYTD || isUserProvideDataLYTD">
        <div class="divider"></div>
        <h4 class="text-xl font-bold">EBITDA</h4>
        <Tip>
            <p>
                Sposta il cursore sul grafico per vedere i dettagli. Le fatture sono raggruppate
                <span class="text-accent font-bold">{{
                    stringUtils.capitalize(stats.intervalAggregation.toString())
                }}</span>
            </p>
        </Tip>
        <div class="text-gray-400">
                <span class="text-blue-400 p-2">Da</span> 
                <span>{{ props.stats.timespan.from.toLocaleDateString() }}
                </span>
                    <span class="text-blue-400 p-2">a</span> 
                <span>
                    {{ props.stats.timespan.to.toLocaleDateString() }}</span
                >
            </div>
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
import { it } from "date-fns/locale";
import l from "lodash";
import * as stringUtils from "~/src/common/string";

const bp = useBreakpoints(breakpointsTailwind);
const chartOptions = useChartOptions();
const props = defineProps<{ stats: InvoicesStatistics , dittaStatsSeriesytd: DittaSummaryOverAllChart, dittaStatsSerieslytd: DittaSummaryOverAllChart}>();
const isUserProvideDataYTD = computed(() => {
    return props.dittaStatsSeriesytd.isUserProvideData.filter((f) => f == true).length > 0 ? true : false;
});

const isUserProvideDataLYTD = computed(() => {
    return props.dittaStatsSerieslytd.isUserProvideData.filter((f) => f == true).length > 0 ? true : false;
});


const options = computed(() => {
    return chartOptions.getOptions("line", (config) => {
        switch (props.stats.intervalAggregation.id) {
            case "daily":
                config.labels = props.stats.invoicesByTimespan.map((e) => format(e.key.from, "do MMM", { locale: it }));
                break;
            case "weekly":
                config.labels = props.stats.invoicesByTimespan.map((e) => format(e.key.from, "do MMM", { locale: it }));
                break;
            case "monthly":
                config.labels = props.stats.invoicesByTimespan.map((e) => format(e.key.from, "MMM yy", { locale: it }));
                break;
            case "quarterly":
                config.labels = props.stats.invoicesByTimespan.map((e) => format(e.key.from, "QQQ yy", { locale: it }));
                break;
            default:
                break;
        }

        config.xaxis.labels.rotate = 0;
        config.xaxis.labels.show = true;
        config.xaxis.labels.offsetX = 3;
        config.xaxis.labels.style.fontSize = "14px";
        config.dataLabels.enabled = false;
        config.markers = {
            size: 5,
        };
        let bounds = {
            
            timespan: timespant.value,
        };

        config.yaxis = [
         
            {
                opposite: true,
                min: bounds.timespan.min,
                max: bounds.timespan.max,
                labels: {
                    style: { fontFamily: "Poppins", fontSize: "16px" },
                    formatter: (val: any, opts: any) =>
                        `${val.toLocaleString(undefined, { maximumFractionDigits: 1 })} €`,
                },
            },
        ];
        return config;
    });
});
const timespant = computed(() => {
   
   return {
           min: l.min([...props.dittaStatsSeriesytd.ebitda, ...props.dittaStatsSerieslytd.ebitda, 0]),
           max: l.max([...props.dittaStatsSeriesytd.ebitda, ...props.dittaStatsSerieslytd.ebitda]),
       }
   

});

const data = computed(() => {
       return [
            {
                name: "Anno corrente",
                data: props.dittaStatsSeriesytd.ebitda,
                type: "line",
                color: "#76419F",
            },
            {
                name: "Anno precedente",
                data: props.dittaStatsSerieslytd.ebitda,
                type: "line",
                color: "#1AA1E0",
            },
        ];
    
});

const emit = defineEmits<{ (e: 'ebitda_chart-org-completed', result: any): void }>();

watch(() => props, (newValue) => {
        const bounds = getMaxMin([...props.dittaStatsSeriesytd.ebitda, ...props.dittaStatsSerieslytd.ebitda ], 0.1);
        const result = {
            name: "EBITDA",
            type: "line",
            x_axis: options.value.labels,
            y_axis_range: [bounds.min, bounds.max],
            period: [props.stats.timespan.from.toLocaleDateString(), props.stats.timespan.to.toLocaleDateString()],
            anno_corrente: props.dittaStatsSeriesytd.ebitda,
            anno_precedente: props.dittaStatsSerieslytd.ebitda,
        };
        emit('ebitda_chart-org-completed', result);
}, { immediate: true });

</script>

<style></style>
