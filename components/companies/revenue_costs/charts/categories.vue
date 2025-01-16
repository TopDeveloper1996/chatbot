<template>
    <div class="flex flex-col items-center">
        <div class="text-center flex items-center flex-col">
            <h2 class="text-center">Costi e ricavi per categoria</h2>
        </div>
        <div class="flex flex-col gap-2 items-stretch w-full">
            <p class="text-center">
                Comparazione <span class="text-accent font-bold">ultimi 12 mesi</span> con
                <span class="text-accent font-bold">i 12 mesi precedenti</span>
            </p>

            <div class="flex flex-wrap flex-row w-full">
                <apexchart
                    class="flex-1 max-w-[100%]"
                    width="100%"
                    :height="Math.max(activeCategories.length * height, 300)"
                    :options="activeOptions"
                    :series="activeData"
                ></apexchart>
                <apexchart
                    class="flex-1 max-w-[100%]"
                    width="100%"
                    :height="Math.max(passiveCategories.length * height, 300)"
                    :options="passiveOptions"
                    :series="passiveData"
                ></apexchart>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { InvoiceRevenueCostCategoriesComparison } from "~/src/types/invoice_store_types";
const chartOptions = useChartOptions();
const props = defineProps<{ comparisonStats: InvoiceRevenueCostCategoriesComparison }>();

const height = 100;

const activeCategories = computed(() =>
    props.comparisonStats.categories.filter((c) => c.firstRevenue > 0 || c.secondRevenue > 0)
);
const passiveCategories = computed(() =>
    props.comparisonStats.categories.filter((c) => c.firstCosts > 0 || c.secondCosts > 0)
);

const activeData = computed(() => {
    let colors = ["#1FADAD", "#1FAD4E"];
    return [
        {
            name: `${props.comparisonStats.first.timespan.toLabel()}`,
            data: activeCategories.value.map((c) => c?.firstRevenue ?? 0),
            color: colors[0],
            type: "bar",
        },
        {
            name: `${props.comparisonStats.second.timespan.toLabel()}`,
            data: activeCategories.value.map((c) => c?.secondRevenue ?? 0),
            color: colors[1],
            type: "bar",
        },
    ];
});
const passiveData = computed(() => {
    let colors = ["#DC29DC", "#AD1F4E"];
    return [
        {
            name: `${props.comparisonStats.first.timespan.toLabel()}`,
            data: passiveCategories.value.map((c) => c?.firstCosts ?? 0),
            color: colors[0],
            type: "bar",
        },
        {
            name: `${props.comparisonStats.second.timespan.toLabel()}`,
            data: passiveCategories.value.map((c) => c?.secondCosts ?? 0),
            color: colors[1],
            type: "bar",
        },
    ];
});

const activeOptions = computed(() => {
    return chartOptions.getOptions("bar", (config) => {
        config.xaxis.categories = props.comparisonStats.categories
            .filter((c) => c.firstRevenue > 0 || c.secondRevenue > 0)
            .map((c) => c.category);
        config.title.text = "Ricavi";
        config.title.style.fontSize = "18px";
        config.xaxis.labels.show = true;
        config.dataLabels.enabled = false;
        config.plotOptions.bar.horizontal = true;
        config.xaxis.labels.style.fontSize = "14px";
        config.tooltip.y.formatter = (val: any, opts: any) =>
            `${val.toLocaleString(undefined, { maximumFractionDigits: 1 })} €`;
        config.xaxis.labels.formatter = (val: any, opts: any) =>
            `${val.toLocaleString(undefined, { maximumFractionDigits: 1 })} €`;
        return config;
    });
});
const passiveOptions = computed(() => {
    return chartOptions.getOptions("bar", (config) => {
        config.xaxis.categories = props.comparisonStats.categories
            .filter((c) => c.firstCosts > 0 || c.secondCosts > 0)
            .map((c) => c.category);
        config.title.text = "Costi";
        config.title.style.fontSize = "18px";
        config.xaxis.labels.show = true;
        config.dataLabels.enabled = false;
        config.plotOptions.bar.horizontal = true;
        config.xaxis.labels.style.fontSize = "14px";
        config.tooltip.y.formatter = (val: any, opts: any) =>
            `${val.toLocaleString(undefined, { maximumFractionDigits: 1 })} €`;
        config.xaxis.labels.formatter = (val: any, opts: any) =>
            `${val.toLocaleString(undefined, { maximumFractionDigits: 1 })} €`;
        return config;
    });
});
</script>

<style></style>
