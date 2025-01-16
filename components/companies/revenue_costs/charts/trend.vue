<template>
    <div id="overall_chart">
        <h4 class="text-xl font-bold">Andamento costi e ricavi nel periodo selezionato</h4>
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
const props = defineProps<{ stats: InvoicesStatistics , dittastats: DittaSummaryOverAllChart}>();

const isUserProvideData = computed(() => {
    return props.dittastats.isUserProvideData.filter((f) => f == true).length > 0 ? true : false;
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
        config.xaxis.labels.offsetX = 3;
        config.xaxis.labels.show = true;
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
    if (isUserProvideData.value===true){
        
    return {
                min: l.min([...props.dittastats.ricavi, ...props.dittastats.costi, ...props.dittastats.ebitda, ...props.dittastats.profitto_netto, 0]),
                max: l.max([...props.dittastats.ricavi, ...props.dittastats.costi, ...props.dittastats.ebitda, ...props.dittastats.profitto_netto]),
            }
        }
    else{
        return {
                min: l.min([...props.dittastats.ricavi, ...props.dittastats.costi, ...props.dittastats.margine_lordo, 0]),
                max: l.max([...props.dittastats.ricavi, ...props.dittastats.costi, ...props.dittastats.margine_lordo]),
            }
        
    }
});

const data = computed(() => {
    if (isUserProvideData.value===true)
    {
    return [
      
        {
            name: "Ricavi",
            data: props.dittastats.ricavi,
            type: "line",
            color: "#76419F",
        },
        {
            name: "Costi",
            data: props.dittastats.costi,
            type: "line",
            color: "#1AA1E0",
        },
        
        {
            name: "EBTIDA",
            data: props.dittastats.ebitda,
            type: "line",
            color: "#5264CF",   
        },
        {
            name: "Utile di periodo",
            data: props.dittastats.profitto_netto,
            type: "line",
            color: "#D2D2D2",
        },
    ];}
    else{
        return [
            {
                name: "Ricavi",
                data: props.dittastats.ricavi,
                type: "line",
                color: "#76419F",
            },
            {
                name: "Costi",
                data: props.dittastats.costi,
                type: "line",
                color: "#1AA1E0",
            },
            {
                name: "Margine Lordo",
                data: props.dittastats.margine_lordo,
                type: "line",
                color: "#5264CF",
            },
            
        ];
    }
});

const emit = defineEmits<{ (e: 'trend_chart-org-completed', result: any): void }>();

watch(() => props, (newValue) => {
    if (isUserProvideData){
        const bounds = getMaxMin([...props.dittastats.ricavi, ...props.dittastats.costi, ...props.dittastats.ebitda, ...props.dittastats.profitto_netto ], 0.1);
        const result = {
            name: "Andamento costi e ricavi nel periodo selezionato",
            type: "line",
            x_axis: options.value.labels,
            y_axis_range: [bounds.min, bounds.max],
            period: [props.stats.timespan.from.toLocaleDateString(), props.stats.timespan.to.toLocaleDateString()],
            ricavi: props.dittastats.ricavi,
            costi: props.dittastats.costi,
            ebitda: props.dittastats.ebitda,
            margine_lordo: null,
            profitto_netto: props.dittastats.profitto_netto
        };
        emit('trend_chart-org-completed', result);
    }else {
        const bounds = getMaxMin([...props.dittastats.ricavi, ...props.dittastats.costi, ...props.dittastats.margine_lordo], 0.1);
        const result = {
            name: "Andamento costi e ricavi nel periodo selezionato",
            type: "line",
            x_axis: options.value.labels,
            y_axis_range: [bounds.min, bounds.max],
            period: [props.stats.timespan.from.toLocaleDateString(), props.stats.timespan.to.toLocaleDateString()],
            ricavi: props.dittastats.ricavi,
            costi: props.dittastats.costi,
            margine_lordo: props.dittastats.margine_lordo,
            profitto_netto: null
        };
        emit('trend_chart-org-completed', result);
    }
    
}, { immediate: true });

</script>

<style></style>
