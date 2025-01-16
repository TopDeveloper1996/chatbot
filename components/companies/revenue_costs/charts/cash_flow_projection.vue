<template>
    <div id="cash_flow_projection">
        <h3 class="text-xl font-bold">Proiezione flusso di cassa</h3>
        <h4 class="text-xl font-bold">Estrapolato dalle scadenze pagamenti fatture</h4>
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
const props = defineProps<{ stats: InvoicesStatistics }>();

const data = computed(() => {
    return [
        // {
        //     name: "Ricavi cumulati",
        //     data: props.stats.actives.cumulativeSumByPayment,
        //     type: "line",
        //     color: "#5264CF",
        // },
        // {
        //     name: "Costi cumulati",
        //     data: props.stats.passives.cumulativeSumByPayment,
        //     type: "line",
        //     color: "#D2D2D2",
        // },
        {
            name: "Ricavi",
            data: props.stats.actives.sumByPaymentTimespan,
            type: "line",
            color: "#76419F",
        },
        {
            name: "Costi",
            data: props.stats.passives.sumByPaymentTimespan,
            type: "line",
            color: "#1AA1E0",
        },
    ];
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
        config.title.text =
            props.stats.invoicesByTimespan.length < 1
                ? ""
                : `Dal ${props.stats.invoicesByTimespan[0].key.from.toLocaleDateString()} al ${props.stats.invoicesByTimespan[
                      props.stats.invoicesByTimespan.length - 1
                  ].key.to.toLocaleDateString()}`;
        config.xaxis.labels.show = true;
        config.xaxis.labels.offsetX = 3;
        config.dataLabels.enabled = false;
        config.markers = {
            size: 5,
        };
        let bounds = {
            cumulative: {
                min: l.min([
                    ...props.stats.actives.cumulativeSumByPayment,
                    ...props.stats.passives.cumulativeSumByPayment,
                    0,
                ]),
                max: l.max([
                    ...props.stats.actives.cumulativeSumByPayment,
                    ...props.stats.passives.cumulativeSumByPayment,
                ]),
            },
            timespan: {
                min: l.min([...props.stats.actives.sumByTimespan, ...props.stats.passives.sumByTimespan, 0]),
                max: l.max([...props.stats.actives.sumByTimespan, ...props.stats.passives.sumByTimespan]),
            },
        };

        config.yaxis = [
            // {
            //     min: bounds.cumulative.min,
            //     max: bounds.cumulative.max,
            //     labels: {
            //         style: { fontFamily: "Poppins", fontSize: "16px" },
            //         formatter: (val: any, opts: any) =>
            //             `${val.toLocaleString(undefined, { maximumFractionDigits: 1 })} €`,
            //     },
            // },
            // // Introduce two dummy axis so that the mapping between the axis and the series is correct 🤔
            // {
            //     show: false,
            //     min: bounds.cumulative.min,
            //     max: bounds.cumulative.max,
            //     labels: {
            //         style: { fontFamily: "Poppins", fontSize: "16px" },
            //         formatter: (val: any, opts: any) =>
            //             `${val.toLocaleString(undefined, { maximumFractionDigits: 1 })} €`,
            //     },
            // },
            {
                show: false,
                min: bounds.timespan.min,
                max: bounds.timespan.max,
                labels: {
                    style: { fontFamily: "Poppins", fontSize: "16px" },
                    formatter: (val: any, opts: any) =>
                        `${val.toLocaleString(undefined, { maximumFractionDigits: 1 })} €`,
                },
            },
            // ==========
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

const emit = defineEmits<{ (e: 'cash_flow_projection_chart-org-completed', result: any): void }>();

watch(() => props, (newValue) => {
        const bounds = getMaxMin([...props.stats.actives.sumByPaymentTimespan, ...props.stats.passives.sumByPaymentTimespan ], 0.1);
        const result = {
            name: "Cash flow projection",
            type: "line",
            x_axis: options.value.labels,
            y_axis_range: [bounds.min, bounds.max],
            period: [props.stats.timespan.from.toLocaleDateString(), props.stats.timespan.to.toLocaleDateString()],
            ricavi: props.stats.actives.sumByPaymentTimespan,
            costi: props.stats.passives.sumByPaymentTimespan
        };
        emit('cash_flow_projection_chart-org-completed', result);
    
}, { immediate: true });

</script>

<style></style>
