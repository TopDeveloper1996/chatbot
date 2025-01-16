<template>
    <div class="flex flex-col gap-4 items-center">
        <WatchScreenSize>
            <div class="flex flex-col items-center">
                <DropdownMenu
                    id="bar_chart_category"
                    class="text-xl"
                    max-height="40rem"
                    :label="barChartsMapping[index].title"
                    :items="barChartsMapping.map((b) => b.title)"
                    close-on-click
                    @change="onDropdownSelection"
                ></DropdownMenu>
                <div class="w-full flex flex-wrap">
                    <apexchart
                        class="flex-1 max-w-[100%]"
                        width="100%"
                        :height="chartHeight"
                        :options="barChartOptions"
                        :series="barChartData(barChartsMapping[index].category)"
                    ></apexchart>
                </div>
            </div>
        </WatchScreenSize>
    </div>
</template>

<script lang="ts" setup>
import { F24Category } from "#imports";
import { breakpointsTailwind } from "@vueuse/core";

const barChartsMapping: { category: F24Category; title: string }[] = [
    { category: F24Category.fissi_inps, title: "Fissi INPS" },
    { category: F24Category.inps, title: "INPS" },
    { category: F24Category.inail, title: "INAIL" },
    { category: F24Category.iva, title: "Versamenti IVA" },
    { category: F24Category.versamenti_reddito, title: "Versamenti Reddito" },
    { category: F24Category.irap, title: "Versamenti IRAP" },
    { category: F24Category.ritenuta, title: "Versamenti Ritenuta d'acconto" },
    { category: F24Category.diritto_camerale, title: "Diritto camerale" },
    { category: F24Category.tasse_locali, title: "Tasse locali" },
    { category: F24Category.tasse_regionali, title: "Tasse regionali" },
];
const bp = useBreakpoints(breakpointsTailwind);
const chartOptions = useChartOptions();

const index = ref(0);

const chartHeight = computed(() => (bp.greaterOrEqual("lg") ? "300px" : "200px"));
const props = defineProps<{ stats: F24Statistics }>();

function onDropdownSelection(title: string, i: number) {
    index.value = i;
}

const barChartOptions = computed(() => {
    return chartOptions.getOptions("line", (config) => {
        config.xaxis.labels.show = false;
        config.labels = props.stats.documentsByTimespan.map((e, i) => e.timespan.toLabel());
        config.dataLabels.enabled = false;
        config.yaxis = {
            labels: {
                formatter: (val: any, opts: any) => `${val.toLocaleString()} €`,
            },
        };
        config.xaxis.labels.rotate = 0;
        config.xaxis.labels.style.fontSize = "14px";
        return config;
    });
});

function barChartData(category: F24Category): any {
    return [
        {
            name: "Saldo",
            data: props.stats.documentsByTimespan.map(
                (d) => d.categories.find((c) => c.key === category)?.balance ?? 0
            ),
            type: "bar",
            color: "#1F7EAD",
        },
        {
            name: "Credito",
            data: props.stats.documentsByTimespan.map((d) => d.categories.find((c) => c.key === category)?.credit ?? 0),
            type: "bar",
            color: "#AD1F1F",
        },
        {
            name: "Debito",
            data: props.stats.documentsByTimespan.map((d) => d.categories.find((c) => c.key === category)?.debit ?? 0),
            type: "bar",
            color: "#1FAD4E",
        },
    ];
}
</script>

<style></style>
