<template>
    <div v-if="stats" class="w-full flex flex-col items-stretch justify-start gap-2">
        <h2 class="text-center">Statistiche fatture</h2>
        <div class="flex flex-row items-center gap-8">
            <DateFilterDropdown
                id="invoices_date_filter"
                class="self-start"
                @timespan-change="(t) => updateTimespan(t)"
                :initial-filter="defaultDateFilter.id"
            ></DateFilterDropdown>
            <p>
                Ditta selezionata:
                <span class="font-bold text-accent">{{
                    stats.dittas.find((d) => d.ditta_id === filteringData.dittaId)?.ditta_registered_name ?? "Tutte"
                }}</span
                >, collaboratore selezionato:
                <span class="font-bold text-accent">{{ filteringData.collaborator ?? "Tutti" }}</span>
            </p>
        </div>
        <div class="flex flex-row w-full items-start gap-4">
            <div class="flex-initial flex flex-col items-stretch gap-2 pt-12 max-w-[30rem] justify-end">
                <div class="flex flex-row items-center gap-2">
                    <div class="card">
                        <p class="title">Numero Attive (Files XML)</p>
                        <span class="content">{{ stats.actives }}</span>
                    </div>
                    <div class="card">
                        <p class="title">Percentuale Attive</p>
                        <span class="content">{{ stats.activesPercentage?.toFixed(2) }} % </span>
                    </div>
                </div>
                <div class="flex flex-row items-center gap-2">
                    <div class="card">
                        <p class="title">Numero Passive (Files XML)</p>
                        <span class="content">{{ stats.passives }}</span>
                    </div>
                    <div class="card">
                        <p class="title">Percentuale Passive</p>
                        <span class="content">{{ stats.passivePercentage?.toFixed(2) }} % </span>
                    </div>
                </div>
                <div class="flex flex-row items-center gap-2">
                    <div class="card">
                        <p class="title">Fatture caricate in memoria</p>
                        <span class="content">{{ stats.actives + stats.passives }}</span>
                    </div>
                    <div class="card">
                        <p class="title">Ditte estratte</p>
                        <span class="content">{{ stats.dittas.length }} </span>
                    </div>
                </div>
                <p>
                    Ditta selezionata:
                    <span class="font-bold text-accent">{{
                        stats.dittas.find((d) => d.ditta_id === filteringData.dittaId)?.ditta_registered_name ?? "Tutte"
                    }}</span>
                </p>
                <p>
                    Collaboratore selezionato:
                    <span class="font-bold text-accent">{{ filteringData.collaborator ?? "Tutti" }}</span>
                </p>
            </div>

            <PaginatedTable
                class="flex-1"
                title="dittas_stats"
                :elements="stats.dittas"
                :sorted-headers="[
                { title: 'Numero ditta', key: (val: any) => val.ditta_numero },
                { title: 'Nome ditta', key: (val: any) => val.ditta_registered_name },
                { title: 'Numero fatture', key: (val: any) => val.actives + val.passives },
                { title: 'Numero attive', key: (val: any) => val.actives },
                { title: 'Numero passive', key: (val: any) => val.passives },
                { title: 'Data ultima fattura', key: (val: any) => val.lastDoc.invoice_date },
                { title: 'Data ultimo download', key: (val: any) => val.lastDownload.downloaded_at },
            ]"
                header-color=""
                :downloadable="false"
                :show-tip="false"
                :table-classes="['conto-table']"
                :headers="[
                    'Numero ditta',
                    'Nome ditta',
                    'Numero fatture',
                    'Numero attive',
                    'Numero passive',
                    'Data ultima fattura',
                    'Data ultimo download',
                ]"
                :page-size="10"
                :row-classes="(e: any) => {
                    return e.ditta_id === filteringData.dittaId ? ['justified-row', 'text-accent', 'font-bold', 'cursor-pointer'] : filteringData.collaborator && e.collaborator !== filteringData.collaborator ? ['opacity-50'] : ['cursor-pointer'];
                }"
                :elem-classes="(i: number) => i >= 5 ? ['text-center'] : []"
                @row-clicked="(e: any) => updateDittaFiltering(e)"
                :row-mapper="(d: any) => [d.ditta_numero, d.ditta_registered_name, d.actives + d.passives, d.actives, d.passives, d.lastDoc.invoice_date.toLocaleDateString(), d.lastDownload.downloaded_at.toLocaleDateString()]"
            >
            </PaginatedTable>
            <PaginatedTable
                class="min-w-[16rem]"
                title="dittas_stats"
                :elements="stats.collaborators"
                :downloadable="false"
                :show-tip="false"
                :headers="['Collaboratore']"
                :page-size="10"
                :table-classes="['conto-table']"
                :row-classes="(e: string) => e === filteringData.collaborator ? ['text-accent', 'font-bold', 'cursor-pointer'] : ['cursor-pointer']"
                @row-clicked="updateAppointedCollaboratorFiltering"
                :row-mapper="(d: string) => [d]"
            >
            </PaginatedTable>
        </div>
        <h3 class="text-start">Fatture ordinate per data documento</h3>
        <apexchart
            width="100%"
            :height="bp.greaterOrEqual('lg') ? '300px' : '150px'"
            :options="chartOptions(stats.dateAggregation).value"
            :series="chartData(stats.dateAggregation).value"
        ></apexchart>
        <h3 class="text-start">Fatture ordinate per data lettura file e stoccaggio dati in memoria</h3>
        <apexchart
            width="100%"
            :height="bp.greaterOrEqual('lg') ? '300px' : '150px'"
            :options="chartOptions(stats.parsedAggregation).value"
            :series="chartData(stats.parsedAggregation).value"
        ></apexchart>
        <h3 class="text-start">Fatture ordinate per data scarico dal cassetto fiscale</h3>
        <apexchart
            width="100%"
            :height="bp.greaterOrEqual('lg') ? '300px' : '150px'"
            :options="chartOptions(stats.downloadAggregation).value"
            :series="chartData(stats.downloadAggregation).value"
        ></apexchart>
    </div>
    <div v-else class="flex justify-center w-full">
        <div class="flex items-center flex-row gap-2">
            <icon class="size-6" name="line-md:loading-twotone-loop"></icon>
        </div>
    </div>
</template>

<script lang="ts" setup>
interface FilteringData {
    collaborator: string | undefined;
    dittaId: string | undefined;
}

import { Aggregation } from "#imports";
import { breakpointsTailwind } from "@vueuse/core";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import DateFilter from "~/src/date_filter";
import Timespan from "~/src/timespan";
import { InvoiceProcessStatistics } from "~/src/types/process_statistics_types";

const defaultDateFilter = DateFilter.filters.Last30Days;
const bp = useBreakpoints(breakpointsTailwind);
const chart = useChartOptions();
const processStatistics = useProcessStatisticsStore();
const stats = ref<InvoiceProcessStatistics>();
const timespan = ref<Timespan>(defaultDateFilter.getTimespan());
const filteringData = ref<FilteringData>({
    collaborator: undefined,
    dittaId: undefined,
});
onMounted(() => {
    updateStats();
});
watch(filteringData, updateStats, { deep: true });

function updateStats() {
    setTimeout(() => {
        stats.value = processStatistics.computeInvoiceStatistics({
            timespan: timespan.value,
            filters: filteringData.value,
        });
    }, 0);
}
function updateDittaFiltering(ditta: any) {
    if (ditta.ditta_id === filteringData.value.dittaId) {
        filteringData.value.dittaId = undefined;
        filteringData.value.collaborator = undefined;
    } else {
        filteringData.value.dittaId = ditta.ditta_id;
        filteringData.value.collaborator = ditta.collaborator;
    }
}
function updateAppointedCollaboratorFiltering(collaborator: string) {
    if (collaborator === filteringData.value.collaborator) {
        filteringData.value.collaborator = undefined;
    } else {
        filteringData.value.collaborator = collaborator;
    }
}
function updateTimespan(t: Timespan) {
    if (timespan.value.toLabel() != t.toLabel()) {
        timespan.value = t;
        setTimeout(updateStats, 0);
    }
}

const chartOptions = (aggregation: Aggregation<Timespan>[]) =>
    computed(() => {
        return chart.getOptions("line", (config) => {
            switch (stats.value?.grouping.id) {
                case "daily":
                    config.labels = aggregation.map((e) => format(e.key.from, "do MMM", { locale: it }));
                    break;
                case "weekly":
                    config.labels = aggregation.map((e) => format(e.key.from, "do MMM", { locale: it }));
                    break;
                case "monthly":
                    config.labels = aggregation.map((e) => format(e.key.from, "MMM yy", { locale: it }));
                    break;
                case "quarterly":
                    config.labels = aggregation.map((e) => format(e.key.from, "QQQ yy", { locale: it }));
                    break;
                default:
                    break;
            }
            config.chart.stacked = true;
            config.tooltip.shared = true;
            config.tooltip.intersect = false;
            config.xaxis.labels.show = true;
            config.dataLabels.enabled = false;
            config.markers.size = 6;
            config.xaxis.labels.rotate = 0;
            config.xaxis.labels.style.fontSize = "12px";
            return config;
        });
    });

const chartData = (aggregation: Aggregation<Timespan>[]) =>
    computed(() => {
        return [
            {
                name: "Fatture attive",
                type: "bar",
                data: aggregation.map((i) => i.elements.filter((i) => i.type === "Emesse").length),
            },
            {
                name: "Fatture passive",
                type: "bar",
                data: aggregation.map((i) => i.elements.filter((i) => i.type === "Ricevute").length),
            },
            {
                name: "Fatture",
                type: "line",
                color: "#1FADAD",
                data: aggregation.map((i) => i.elements.length),
            },
        ];
    });
</script>

<style lang="css" scoped>
.card {
    @apply relative bg-surface grow rounded-xl flex flex-col items-center px-4 py-2 border-[1.5px] border-outline;

    .content {
        @apply text-3xl font-bold mt-4;
    }

    .title {
        @apply text-sm font-light text-center;
    }

    .iconify {
        @apply size-10 my-2;
    }
}

.conto-table {
    --header-height: 6rem;
    @apply outline-none border-none !important;

    th {
        @apply border-t-0 border-l-0 border-r-0 border-b-[2px] border-outline bg-surface h-[var(--header-height)] !important;

        td {
            @apply h-[var(--header-height)] !important;
        }

        div {
            @apply flex flex-col h-full items-center justify-center;

            p {
                @apply text-center;
            }
        }
    }

    td {
        @apply outline-none border-[1px] !important;
    }

    tr {
        @apply outline-none !important;
    }

    tbody tr:hover {
        @apply bg-outline/60 !important;
    }

    tbody tr {
        background-color: var(--bg) !important;
    }
}

table tr:last-child td:first-child {
    @apply rounded-bl-xl;
}

table tr:last-child td:last-child {
    @apply rounded-br-xl;
}

table th:first-child {
    @apply rounded-tl-xl border-t-0;
}

table th:last-child {
    @apply rounded-tr-xl;
}
</style>
