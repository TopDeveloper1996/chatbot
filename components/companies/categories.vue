<template>
    <div class="flex flex-col items-center w-full gap-4">
        <div class="text-center flex items-center flex-col">
            <h3 class="text-center">Categorie</h3>
            <Tip><p>I grafici mostrano la distribuzione delle fatture per categoria</p></Tip>
        </div>
        <WatchScreenSize class="flex flex-col gap-8">
            <div class="w-full flex flex-row justify-evenly flex-wrap gap-8">
                <div class="flex flex-col items-center">
                    <h3>Dettaglio ricavi</h3>
                    <div class="w-full max-w-[100%] min-w-[250px] lg:min-w-[400px]">
                        <apexchart
                            v-if="stats.actives.categories.length > 0"
                            width="100%"
                            :height="bp.greaterOrEqual('lg').value ? '400px' : '250px'"
                            :options="pieOptions(stats.actives.categories)"
                            :series="stats.actives.categories.map((c) => c.elements.length)"
                        ></apexchart>
                        <div v-else class="flex flex-col items-center justify-center gap-6 text-accent">
                            <p>Dati in fase di trasferimento</p>
                            <icon class="size-12" name="tabler:arrows-transfer-down"></icon>
                        </div>
                    </div>
                </div>
                <div class="flex flex-col items-center">
                    <h3>Dettaglio costi</h3>
                    <div class="w-full max-w-[100%]">
                        <apexchart
                            v-if="stats.passives.categories.length > 0"
                            class="w-full max-w-[100%] min-w-[250px] lg:min-w-[400px]"
                            width="100%"
                            :height="bp.greaterOrEqual('lg').value ? '400px' : '250px'"
                            :options="pieOptions(stats.passives.categories)"
                            :series="stats.passives.categories.map((c) => c.elements.length)"
                        ></apexchart>
                        <div v-else class="flex flex-col items-center justify-center gap-6 text-accent">
                            <p>Dati in fase di trasferimento</p>
                            <icon class="size-12" name="tabler:arrows-transfer-down"></icon>
                        </div>
                    </div>
                </div>
            </div>
        </WatchScreenSize>
        <div class="flex flex-row w-full flex-wrap gap-4 justify-center items-start">
            <div class="flex-1">
                <table class="flex-1 h-min min-w-[12rem]">
                    <thead>
                        <tr class="break-words">
                            <th>Categoria</th>
                            <th>Ricavi</th>
                            <th>Percentuale ricavi</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr
                            v-for="e in stats.actives.categories?.toSorted(
                                (a, b) =>
                                    l.sumBy(b.elements, (inv) => inv['total_amount']) -
                                    l.sumBy(a.elements, (inv) => inv['total_amount'])
                            ) ?? []"
                        >
                            <td>
                                {{ e.key }}
                            </td>
                            <td>{{ l.sumBy(e.elements, (inv) => inv["total_amount"]).toLocaleString() }} €</td>
                            <td>
                                {{
                                    (
                                        (100 * l.sumBy(e.elements, (inv) => inv["total_amount"])) /
                                        l.sumBy(stats.actives.elements, (inv) => inv["total_amount"])
                                    ).toLocaleString()
                                }}%
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div class="flex-1">
                <table class="flex-1 h-min min-w-[12rem]">
                    <thead>
                        <tr class="break-words">
                            <th>Categoria</th>
                            <th>Costi</th>
                            <th>Percentuale costi</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr
                            v-for="e in stats.passives.categories?.toSorted(
                                (a, b) =>
                                    l.sumBy(b.elements, (inv) => inv['total_amount']) -
                                    l.sumBy(a.elements, (inv) => inv['total_amount'])
                            )"
                        >
                            <td>
                                {{ e.key }}
                            </td>
                            <td>{{ l.sumBy(e.elements, (inv) => inv["total_amount"]).toLocaleString() }} €</td>
                            <td>
                                {{
                                    (
                                        (100 * l.sumBy(e.elements, (inv) => inv["total_amount"])) /
                                        l.sumBy(stats.passives.elements, (inv) => inv["total_amount"])
                                    ).toLocaleString()
                                }}%
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { breakpointsTailwind } from "@vueuse/core";
import l from "lodash";

import * as stringUtils from "~/src/common/string";
const bp = useBreakpoints(breakpointsTailwind);
const chartOptions = useChartOptions();
const props = defineProps<{ stats: Ref<InvoicesStatistics> | InvoicesStatistics }>();

const stats = computed(() => {
    return (props.stats as Ref<InvoicesStatistics>).value || props.stats;
});

function pieOptions(series: any[]) {
    return chartOptions.getOptions("donut", (config) => {
        config.labels = series.map((s) => s.key);
        config.legend.customLegendItems = series
            .sort((a, b) => b.elements.length - a.elements.length)
            .slice(0, 3)
            .map((c) => c.key);
        const sum = l.sumBy(series, (c) => c.elements.length);
        config.legend.formatter = (seriesName: any, opts: any) =>
            `${((100 * opts.w.globals.series[opts.seriesIndex]) / sum).toFixed(0)}% ${seriesName}`;
        config.legend.show = true;
        return config;
    });
}
function stackedBarOptions(series: any[]) {
    return chartOptions.getOptions("bar", (config) => {
        // config.labels = stats.value.invoicesByTimespan.map((e, i) =>
        //     i === 0
        //         ? e.timespan.from.toLocaleDateString()
        //         : i === stats.value.invoicesByTimespan.length - 1
        //         ? e.timespan.to.toLocaleDateString()
        //         : ""
        // );
        config.xaxis.labels.rotate = 0;
        config.xaxis.labels.style.fontSize = "14px";
        config.chart.stacked = true;
        config.chart.stackType = "100%";
        // config.legend.customLegendItems = series
        //     .sort((a, b) => b.elements.length - a.elements.length)
        //     .slice(0, 3)
        //     .map((c) => c.key);
        // config.legend.formatter = (seriesName: any, opts: any) =>
        //     `${((100 * opts.w.globals.series[opts.seriesIndex]) / l.sumBy(series, (c) => c.elements.length)).toFixed(
        //         0
        //     )}% ${seriesName}`;
        config.legend.show = true;
        return config;
    });
}
</script>

<style></style>
