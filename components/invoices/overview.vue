<template>
    <div class="w-full flex flex-col gap-4">
        <div class="flex flex-row gap-8 items-center">
            <h2 class="text-center m-0">Panoramica</h2>
            <p class="text-accent text-center text-xl">
                <b>{{ stats.count }}</b> fatture
            </p>
        </div>
        <div class="border-text/50 p-4 rounded-xl border-[1.5px]">
            <div class="flex flex-row gap-8 items-center">
                <h2 class="text-center m-0">Storico fatture</h2>
                <p>
                    Sposta il cursore sul grafico per vedere i dettagli. Le fatture sono raggruppate
                    <span class="text-accent font-bold mx-4 text-lg">{{
                        stringUtils.capitalize(stats.intervalAggregation.toString())
                    }}</span>
                </p>
            </div>
            <div class="flex flex-col items-center gap-8">
                <div class="w-full flex flex-wrap">
                    <apexchart
                        class="flex-1 max-w-[100%]"
                        width="100%"
                        :height="bp.greaterOrEqual('lg') ? '400px' : '200px'"
                        :options="
                            chartOptions.getOptions('bar', (config) => {
                                config.xaxis.labels.show = true;
                                switch (stats.intervalAggregation.id) {
                                    case 'daily':
                                        config.labels = stats.invoicesByTimespan.map((e) =>
                                            format(e.key.from, 'do MMM', { locale: it })
                                        );
                                        break;
                                    case 'weekly':
                                        config.labels = stats.invoicesByTimespan.map((e) =>
                                            format(e.key.from, 'do MMM', { locale: it })
                                        );
                                        break;
                                    case 'monthly':
                                        config.labels = stats.invoicesByTimespan.map((e) =>
                                            format(e.key.from, 'MMM yy', { locale: it })
                                        );
                                        break;
                                    case 'quarterly':
                                        config.labels = stats.invoicesByTimespan.map((e) =>
                                            format(e.key.from, 'QQQ yy', { locale: it })
                                        );
                                        break;
                                    default:
                                        break;
                                }

                                config.xaxis.labels.rotate = 0;
                                config.xaxis.labels.style.fontSize = '14px';
                                config.colors = [theme.colors.passive, theme.colors.active];
                                return config;
                            })
                        "
                        :series="invoiceByDateChartData"
                    ></apexchart>
                </div>
                <div class="w-full flex flex-wrap">
                    <apexchart
                        class="flex-1 max-w-[100%]"
                        width="100%"
                        height="200px"
                        :options="
                    chartOptions.getOptions('bar', (config) => {
                        config.labels=['Tipo fatture'];
                        config.plotOptions.bar.horizontal = true;
                        config.chart.stacked = true;
                        config.chart.stackType = '100%';
                        config.xaxis.labels.show = false;
                        config.yaxis.labels.show = false;
                        config.grid.show = false;
                        config.xaxis.axisBorder.show = false;
                        config.yaxis.axisBorder.show = false;
                        config.dataLabels.formatter = (val: any, opts: any) => {
                            console.log(opts.w.globals.seriesNames[opts.seriesIndex]);
                            return `${opts.w.globals.seriesNames[opts.seriesIndex]} (${opts.w.globals.series[opts.seriesIndex]}) - ${val.toLocaleString(undefined, { maximumFractionDigits: 2 })}%`
                        }
                        config.colors = [theme.colors.passive, theme.colors.active];
                        return config;
                    })
                "
                        :series="typeChartData"
                    ></apexchart>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { theme } from "#tailwind-config";
import { breakpointsTailwind } from "@vueuse/core";
import { format, formatDate } from "date-fns";
import { it } from "date-fns/locale";
import { Options } from "~/server/src/config/config";
const bp = useBreakpoints(breakpointsTailwind);

import * as stringUtils from "~/src/common/string";
const chartOptions = useChartOptions();
const props = defineProps<{ stats: Ref<InvoicesStatistics> | InvoicesStatistics }>();

const stats = computed(() => {
    return (props.stats as Ref<InvoicesStatistics>).value || props.stats;
});

const invoiceByDateChartData = computed(() => {
    return [{ name: "Fatture", data: stats.value.invoicesByTimespan.map((i) => i.elements.length) }];
});

const typeChartData = computed(() => {
    return [
        {
            name: "Passive",
            data: [stats.value.passives.invoicesCount],
        },
        {
            name: "Attive",
            data: [stats.value.actives.invoicesCount],
        },
    ];
});
</script>

<style></style>
