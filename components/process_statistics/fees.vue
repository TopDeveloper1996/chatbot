<template>
    <div v-if="stats" class="w-full flex flex-col items-stretch justify-start gap-2">
        <h2 class="text-center">Statistiche corrispettivi</h2>
        <div class="flex flex-row items-center gap-8">
            <DateFilterDropdown
                id="fees_date_filter"
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
            <div class="flex-initial flex flex-col pt-12 items-stretch gap-2 max-w-[30rem]">
                <div class="flex flex-row items-center gap-2">
                    <div class="card">
                        <p class="title">Numero Corrispettivi</p>
                        <span class="content">{{ stats.count }}</span>
                    </div>
                    <div class="card">
                        <p class="title">Ditte estratte</p>
                        <span class="content">{{ stats.dittas.length }}</span>
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
                            {title:'Numero ditta',key:(val:any)=>val.ditta_numero},
                            {title:'Nome ditta',key:(val:any)=>val.ditta_registered_name},
                            {title:'Numero corrispettivi',key:(val:any)=>val.count},
                            {title:'Data ultimo corrispettivo',key:(val:any)=>val.lastDoc.fee_date},
                            {title: 'Data ultimo download',key:(val:any)=>val.lastDownload.created_at},
                        ]"
                header-color=""
                :downloadable="false"
                :show-tip="false"
                :table-classes="['conto-table']"
                :headers="[
                    'Numero ditta',
                    'Nome ditta',
                    'Numero corrispettivi',
                    'Data ultimo corrispettivo',
                    'Data ultimo download',
                ]"
                :page-size="10"
                :row-classes="(e: any) => {
                    return e.ditta_id === filteringData.dittaId ? ['justified-row', 'text-accent', 'font-bold', 'cursor-pointer'] : filteringData.collaborator && e.collaborator !== filteringData.collaborator ? ['opacity-50'] : ['cursor-pointer'];
                }"
                :elem-classes="(i: number) =>i>=5?['text-center'] : []"
                @row-clicked="(e: any) =>  updateDittaFiltering(e)"
                :row-mapper="(d: any) => [d.ditta_numero, d.ditta_registered_name ,d.count, d.lastDoc.fee_date.toLocaleDateString(), d.lastDownload.created_at.toLocaleDateString()]"
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
                :row-classes="(e:string)=>e === filteringData.collaborator ? ['text-accent','font-bold','cursor-pointer']:['cursor-pointer']"
                @row-clicked="updateAppointedCollaboratorFiltering"
                :row-mapper="(d: string) => [ d]"
            >
            </PaginatedTable>
        </div>
        <h3 class="text-start">Corrispettivi ordinati per data documento</h3>
        <apexchart
            class="flex-1 max-w-[100%]"
            width="100%"
            :height="bp.greaterOrEqual('lg') ? '300px' : '150px'"
            :options="chartOptions(stats.dateAggregation).value"
            :series="chartData(stats.dateAggregation).value"
        ></apexchart>
        <h3 class="text-start">Corrispettivi ordinati per data lettura file e stoccaggio dati in memoria</h3>
        <apexchart
            class="flex-1 max-w-[100%]"
            width="100%"
            :height="bp.greaterOrEqual('lg') ? '300px' : '150px'"
            :options="chartOptions(stats.parsedAggregation).value"
            :series="chartData(stats.parsedAggregation).value"
        ></apexchart>
        <h3 class="text-start">Corrispettivi ordinati per data scarico dal cassetto fiscale</h3>
        <apexchart
            class="flex-1 max-w-[100%]"
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
import { FeesProcessStatistics } from "~/src/types/process_statistics_types";

const defaultDateFilter = DateFilter.filters.Last30Days;
const bp = useBreakpoints(breakpointsTailwind);
const chart = useChartOptions();
const processStatistics = useProcessStatisticsStore();
const stats = ref<FeesProcessStatistics>();
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
        stats.value = processStatistics.computeFeesStatistics({
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
                name: "Corrispettivi",
                type: "bar",
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
            @apply h-[var(--header-height)]  !important;
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
