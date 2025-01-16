<template>
    <div class="w-full flex flex-col items-center gap-4 rounded-xl ">
        <div
            v-for="(stat, i) in periodsComparison"
            class="w-full flex flex-col justify-stretch gap-4 p-4 rounded-xl border"
        >
            <h3 class="text-xl font-bold">{{ stat.label }}</h3>
            <div class="text-gray-400">
                <span class="text-blue-400 p-2">Da</span> 
                <span>{{ stat.first.timespan.from.toLocaleDateString() }} -
                    {{ stat.first.timespan.to.toLocaleDateString() }}
                </span>
                    <span class="text-blue-400 p-2">a</span> 
                <span>
                    {{ stat.second.timespan.from.toLocaleDateString() }}-
                    {{ stat.second.timespan.to.toLocaleDateString() }}</span
                >
            </div>
            <div class="mt-4 flex flex-wrap flex-row w-full gap-8">
                <div class="flex-1">
                    <div class="font-bold text-lg mb-4">Ricavi</div>
                    <table class="flex-1 h-min min-w-[12rem]">
                        <thead>
                            <tr>
                                <th>Categoria</th>
                                <th>{{ stat.first.timespan.toLabel() }}</th>
                                <th>{{ stat.second.timespan.toLabel() }}</th>
                                <th>Delta</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="e in getCategories(stat, 'active').value">
                                <td>{{ e.category }}</td>
                                <td>{{ e.firstRevenue.toLocaleString() }} €</td>
                                <td>{{ e.secondRevenue.toLocaleString() }} €</td>
                                <td>{{ (e.revenueDelta * 100).toLocaleString() }} %</td>
                            </tr>
                            <tr class="bg-surface">
                                <td class="font-bold">Totale</td>
                                <td class="font-bold">{{ stat.first.revenue.toLocaleString() }} €</td>
                                <td class="font-bold">{{ stat.second.revenue.toLocaleString() }} €</td>
                                <td
                                    :class="[
                                        'font-bold',
                                        stat.second.revenue / stat.first.revenue - 1 > 0
                                            ? 'text-green-500'
                                            : 'text-red-700',
                                    ]"
                                >
                                    {{ ((stat.second.revenue / stat.first.revenue - 1) * 100).toLocaleString() }}
                                    %
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <apexchart
                    class="flex-1 max-w-[100%]"
                    :height="Math.max(getCategories(stat, 'active').value.length * height, minHeght)"
                    :options="options(stat, 'active').value"
                    :series="data(stat, 'active').value"
                ></apexchart>
            </div>
            <div class="flex flex-wrap flex-row w-full gap-8">
                <div class="flex-1">
                    <h3>Costi</h3>
                    <table class="h-min min-w-[12rem]">
                        <thead>
                            <tr>
                                <th>Categoria</th>
                                <th>{{ stat.first.timespan.toLabel() }}</th>
                                <th>{{ stat.second.timespan.toLabel() }}</th>
                                <th>Delta</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="e in getCategories(stat, 'passive').value">
                                <td>{{ e.category }}</td>
                                <td>{{ e.firstCosts.toLocaleString() }} €</td>
                                <td>{{ e.secondCosts.toLocaleString() }} €</td>
                                <td>{{ (e.costsDelta * 100).toLocaleString() }} %</td>
                            </tr>
                            <tr class="bg-surface">
                                <td class="font-bold">Totale</td>
                                <td class="font-bold">{{ stat.first.costs.toLocaleString() }} €</td>
                                <td class="font-bold">{{ stat.second.costs.toLocaleString() }} €</td>
                                <td
                                    :class="[
                                        'font-bold',
                                        stat.second.costs / stat.first.costs - 1 < 0
                                            ? 'text-green-500'
                                            : 'text-red-700',
                                    ]"
                                >
                                    {{ ((stat.second.costs / stat.first.costs - 1) * 100).toLocaleString() }}
                                    %
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <apexchart
                    class="flex-1 max-w-[100%]"
                    :height="Math.max(getCategories(stat, 'passive').value.length * height, minHeght)"
                    :options="options(stat, 'passive').value"
                    :series="data(stat, 'passive').value"
                ></apexchart>
            </div>
            <apexchart
                class="w-full max-w-[100%]"
                width="100%"
                :height="bp.greaterOrEqual('lg') ? '300px' : '250px'"
                :options="summaryOptions"
                :series="summaryData(stat).value"
            ></apexchart>
            <div class="divider"></div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { breakpointsTailwind } from "@vueuse/core";
import Timespan from "~/src/timespan";
const periodsComparison = ref<InvoiceRevenueCostCategoriesComparison[]>([]);
const chartOptions = useChartOptions();
const bp = useBreakpoints(breakpointsTailwind);
const height = 80;
const minHeght = 250;
const { invoicesComputeRevenueCostStats, invoicesComputeRevenueCostStatsComparison } = useInvoices();

onMounted(() => updateStats());

async function updateStats() {
    try {
        let start = performance.now();

        let periods = invoicesComputeRevenueCostStats({
            timespans: [
                Timespan.previous12Months(),
                Timespan.last12Months(),
                Timespan.yearToDateLastYear(),
                Timespan.yearToDate(),
                Timespan.lastQuarter(),
                Timespan.lastQuarterLastYear(),
            ],
        });

        periodsComparison.value.push(
            invoicesComputeRevenueCostStatsComparison({
                first: periods[2],
                second: periods[3],
                label: "Analisi year to date",
            })
        );
        periodsComparison.value.push(
            invoicesComputeRevenueCostStatsComparison({
                first: periods[0],
                second: periods[1],
                label: "Analisi 12 mesi",
            })
        );
        periodsComparison.value.push(
            invoicesComputeRevenueCostStatsComparison({
                first: periods[4],
                second: periods[5],
                label: "Analisi ultimo trimestre",
            })
        );

        let end = performance.now();
        console.log(`companies aggregations computed in ${(end - start).toFixed(2)} ms`);
    } catch (ex) {
        console.error("error computing stats");
    }
}

const getCategories = (stats: InvoiceRevenueCostCategoriesComparison, type: "active" | "passive") =>
    computed(() =>
        type === "active"
            ? stats.categories.filter((c) => c.firstRevenue > 0 || c.secondRevenue > 0)
            : stats.categories.filter((c) => c.firstCosts > 0 || c.secondCosts > 0)
    );

const data = (stats: InvoiceRevenueCostCategoriesComparison, type: "active" | "passive") =>
    computed(() => {
        let colors = type === "active" ? ["#1FADAD", "#1FAD4E"] : ["#DC29DC", "#AD1F4E"];
        let categories = getCategories(stats, type).value;
        return [
            {
                name: `${stats.first.timespan.toLabel()}`,
                data:
                    type === "active"
                        ? categories.map((c) => c?.firstRevenue ?? 0)
                        : categories.map((c) => c?.firstCosts ?? 0),
                color: colors[0],
                type: "bar",
            },
            {
                name: `${stats.second.timespan.toLabel()}`,
                data:
                    type === "active"
                        ? categories.map((c) => c?.secondRevenue ?? 0)
                        : categories.map((c) => c?.secondCosts ?? 0),
                color: colors[1],
                type: "bar",
            },
        ];
    });

const options = (stats: InvoiceRevenueCostCategoriesComparison, type: "active" | "passive") =>
    computed(() => {
        return chartOptions.getOptions("bar", (config) => {
            config.xaxis.categories = getCategories(stats, type).value.map((c) => c.category);
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

const summaryOptions = computed(() => {
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

const summaryData = (stats: InvoiceRevenueCostCategoriesComparison) =>
    computed(() => {
        return [
            {
                name: stats.first.timespan.toLabel(),
                data: [stats.first.revenue, stats.first.costs, stats.first.margin],
                color: "#1F7EAD",
                type: "bar",
            },
            {
                name: stats.second.timespan.toLabel(),
                data: [stats.second.revenue, stats.first.revenue, stats.second.margin],
                color: "#7E1FAD",
                type: "bar",
            },
        ];
    });
</script>

<style></style>
