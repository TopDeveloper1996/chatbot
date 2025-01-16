<template>
    <div v-if="mounted" class="w-full flex flex-col flex-wrap">
        <div class="text-center flex items-center flex-col">
            <h2 class="text-center">Costi, ricavi e margine</h2>
        </div>
        <p class="text-center">
            Comparazione <span class="text-accent font-bold">ultimi 12 mesi</span> con
            <span class="text-accent font-bold">i 12 mesi precedenti</span>
        </p>
        <apexchart
            class="flex-1 max-w-[100%]"
            width="100%"
            :height="bp.greaterOrEqual('lg') ? '600px' : '300px'"
            :options="options"
            :series="data"
        ></apexchart>
    </div>
</template>

<script lang="ts" setup>
import { breakpointsTailwind } from "@vueuse/core";
import { InvoiceRevenueCostCategoriesComparison } from "~/src/types/invoice_store_types";

const chartOptions = useChartOptions();
const bp = useBreakpoints(breakpointsTailwind);
const mounted = useMounted();
const props = defineProps<{ comparisonStats: InvoiceRevenueCostCategoriesComparison }>();

const options = computed(() => {
    return chartOptions.getOptions("bar", (config) => {
        config.xaxis.categories = ["Ricavi", "Costi", "Margine netto"];
        config.plotOptions.bar.horizontal = true;
        config.dataLabels.enabled = true;
        config.dataLabels.formatter = (val: any, opts: any) => `${val.toLocaleString()} €`;
        config.xaxis.labels.formatter = (val: any, opts: any) => `${val.toLocaleString()} €`;
        config.tooltip.y.formatter = (val: any, opts: any) =>
            `${val.toLocaleString(undefined, { maximumFractionDigits: 1 })} €`;
        return config;
    });
});

const data = computed(() => {
    return [
        {
            name: props.comparisonStats.first.timespan.toLabel(),
            data: [
                props.comparisonStats.first.revenue,
                props.comparisonStats.first.costs,
                props.comparisonStats.first.margin,
            ],
            color: "#1F7EAD",
            type: "bar",
        },
        {
            name: props.comparisonStats.second.timespan.toLabel(),
            data: [
                props.comparisonStats.second.revenue,
                props.comparisonStats.first.revenue,
                props.comparisonStats.second.margin,
            ],
            color: "#7E1FAD",
            type: "bar",
        },
    ];
});
</script>

<style></style>
