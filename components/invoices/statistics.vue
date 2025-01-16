<template>
    <div class="w-full flex flex-col flex-wrap gap-8">
        <h2 class="text-center">Statistiche</h2>
        <div class="flex flex-row w-full flex-wrap gap-4 justify-center items-start">
            <div class="flex-1">
                <h3 class="text-center">Top 10 fornitori</h3>
                <DownloadableTable
                    title="top_10_fornitori"
                    :headers="['Fornitore ID', 'Fornitore', 'Transazioni', 'Totale €', 'Percentuale','Ateco']"
                    :mapper="
                        (e) => [
                            e.id,
                            e.name,
                            e.count,
                            e.amount?.toLocaleString(),
                            e.percentage?.toLocaleString() + '%',
                            e.atecoCode && e.atecoDescription ? e.atecoCode + ' - ' + e.atecoDescription : '',
                        ]
                    "
                    :elements="stats.passives.topCustomerSuppliers"
                >
                    <table class="flex-1 h-min min-w-[12rem] passive-table">
                        <thead>
                            <tr>
                                <th>Fornitore ID</th>
                                <th>Fornitore</th>
                                <th>Transazioni</th>
                                <th>Totale €</th>
                                <th>Percentuale</th>
                                <th>Ateco</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr
                                @click="() => focusInvoices({ title: e['name'], invoices: e.elements })"
                                :class="{ 'clickable-row': e.elements !== null }"
                                v-for="e in stats.passives.topCustomerSuppliers"
                            >
                                <td>{{ e.id }}</td>
                                <td>{{ e.name }}</td>
                                <td>{{ e.count }}</td>
                                <td>{{ e.amount?.toLocaleString() }} €</td>
                                <td>{{ e.percentage?.toLocaleString() }} %</td>
                                <td
                                    class="text-nowrap overflow-hidden text-ellipsis max-w-[24rem]"
                                    :title="
                                        e.atecoCode && e.atecoDescription
                                            ? e.atecoCode + ' - ' + e.atecoDescription
                                            : ''
                                    "
                                >
                                    {{
                                        e.atecoCode && e.atecoDescription
                                            ? e.atecoCode + " - " + e.atecoDescription
                                            : ""
                                    }}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </DownloadableTable>
            </div>
            <div class="flex-1">
                <h3 class="text-center">Top 10 clienti</h3>
                <DownloadableTable
                    title="top_10_clienti"
                    :headers="['Cliente ID', 'Cliente', 'Transazioni', 'Totale €', 'Percentuale','Ateco']"
                    :mapper="
                        (e) => [
                            e.id,
                            e.name,
                            e.count,
                            e.amount?.toLocaleString(),
                            e.percentage?.toLocaleString() + '%',
                            e.atecoCode && e.atecoDescription ? e.atecoCode + ' - ' + e.atecoDescription : '',
                        ]
                    "
                    :elements="stats.actives.topCustomerSuppliers"
                >
                    <table class="active-table flex-1 h-min min-w-[12rem]">
                        <thead>
                            <tr>
                                <th>Cliente ID</th>
                                <th>Cliente</th>
                                <th>Transazioni</th>
                                <th>Totale €</th>
                                <th>Percentuale</th>
                                <th>Ateco</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr
                                @click="() => focusInvoices({ title: e['name'], invoices: e.elements })"
                                :class="{ 'clickable-row': e.elements !== null }"
                                v-for="e in stats.actives.topCustomerSuppliers"
                            >
                                <td>{{ e.id }}</td>
                                <td>{{ e.name }}</td>
                                <td>{{ e.count }}</td>
                                <td>{{ e.amount?.toLocaleString() }} €</td>
                                <td>{{ e.percentage?.toLocaleString() }} %</td>
                                <td
                                    class="text-nowrap overflow-hidden text-ellipsis max-w-[24rem]"
                                    :title="
                                        e.atecoCode && e.atecoDescription
                                            ? e.atecoCode + ' - ' + e.atecoDescription
                                            : ''
                                    "
                                >
                                    {{
                                        e.atecoCode && e.atecoDescription
                                            ? e.atecoCode + " - " + e.atecoDescription
                                            : ""
                                    }}
                                </td>
                            </tr>
                        </tbody>
                    </table></DownloadableTable
                >
            </div>
        </div>

        <div class="w-full flex flex-col">
            <h3>Attive</h3>
            <div class="flex flex-row gap-4 flex-wrap">
                <table class="active-table stat-table">
                    <thead>
                        <tr>
                            <th>Tipo documento</th>
                            <th>Numero</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr
                            @click="
                                () =>
                                    focusInvoices({
                                        title: `Passive, ${invoiceMappings.getReadableDocType(e['key'])}`,
                                        invoices: e['elements'],
                                    })
                            "
                            v-for="e in stats.actives.documentType"
                            :class="{ 'clickable-row': e.elements !== null }"
                        >
                            <td>
                                {{ invoiceMappings.getReadableDocType(e["key"]) }}
                            </td>

                            <td>{{ e["elements"].length }}</td>
                        </tr>
                    </tbody>
                </table>

                <table class="stat-table active-table">
                    <thead>
                        <tr>
                            <th>Natura IVA</th>
                            <th>Numero</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr
                            @click="
                                () =>
                                    focusInvoices({
                                        title: `Passive, ${e['key']}`,
                                        invoices: e['elements'],
                                    })
                            "
                            :class="{ 'clickable-row': e.elements !== null }"
                            v-for="e in stats.actives.nature"
                        >
                            <td>
                                {{ e["key"]?.toLocaleUpperCase() }}
                            </td>

                            <td>{{ e["elements"].length }}</td>
                        </tr>
                    </tbody>
                </table>
                <table class="stat-table active-table">
                    <thead>
                        <tr>
                            <th>Importo</th>
                            <th>Valore</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr
                            :class="{ 'clickable-row': e.elements !== null }"
                            @click="() => focusInvoices({ title: `Attive, ${e.name}`, invoices: e['elements'] })"
                            v-for="e in Object.values(stats.actives.metrics)"
                        >
                            <td>
                                {{ e.name ?? e[0] }}
                            </td>

                            <td>{{ e.value?.toLocaleString() }} €</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
        <div class="w-full flex flex-col">
            <h3>Passive</h3>
            <div class="flex flex-row gap-4 flex-wrap">
                <table class="stat-table passive-table">
                    <thead>
                        <tr>
                            <th>Tipo documento</th>
                            <th>Numero</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr
                            @click="
                                () =>
                                    focusInvoices({
                                        title: `Attive, ${invoiceMappings.getReadableDocType(e['key'])}`,
                                        invoices: e['elements'],
                                    })
                            "
                            v-for="e of stats.passives.documentType"
                            :class="{ 'clickable-row': e.elements !== null }"
                        >
                            <td>
                                {{ invoiceMappings.getReadableDocType(e["key"]) }}
                            </td>

                            <td>{{ e["elements"].length }}</td>
                        </tr>
                    </tbody>
                </table>
                <table class="stat-table passive-table">
                    <thead>
                        <tr>
                            <th>Natura IVA</th>
                            <th>Numero</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr
                            @click="
                                () =>
                                    focusInvoices({
                                        title: `Attive, ${e['key']}`,
                                        invoices: e['elements'],
                                    })
                            "
                            :class="{ 'clickable-row': e.elements !== null }"
                            v-for="e in stats.passives.nature"
                        >
                            <td>
                                {{ e["key"]?.toLocaleUpperCase() }}
                            </td>

                            <td>{{ e["elements"].length }}</td>
                        </tr>
                    </tbody>
                </table>
                <table class="stat-table passive-table">
                    <thead>
                        <tr>
                            <th>Importo</th>
                            <th>Valore</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr
                            :class="{ 'clickable-row': e.elements !== null }"
                            @click="() => focusInvoices({ title: `Attive, ${e.name}`, invoices: e['elements'] })"
                            v-for="e in Object.values(stats.passives.metrics)"
                        >
                            <td>
                                {{ e.name ?? e[0] }}
                            </td>

                            <td>{{ e.value?.toLocaleString() }} €</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
        <div class="divider"></div>
        <WatchScreenSize class="w-full flex flex-col items-center gap-2">
            <h3 class="text-center">Distribuzione per top 20 codici Ateco</h3>
            <Tip>I seguenti grafici mostrano la distribuzione delle fatture per i top 20 codici Ateco</Tip>
            <div class="w-full flex flex-row justify-evenly flex-wrap gap-8">
                <div class="flex flex-col items-center">
                    <h3>Attive</h3>
                    <div class="w-full max-w-[100%] min-w-[300px] lg:min-w-[500px]">
                        <apexchart
                            width="100%"
                            :height="bp.greaterOrEqual('lg').value ? '500px' : '300px'"
                            :options="pieOptions(stats.actives.ateco)"
                            :series="l.orderBy(stats.actives.ateco, (e:any)=>e.elements.length, 'desc').slice(0,20).map((c) => c.elements.length)"
                        ></apexchart>
                    </div>
                </div>
                <div class="flex flex-col items-center">
                    <h3>Passive</h3>
                    <div class="w-full max-w-[100%] min-w-[300px] lg:min-w-[500px]">
                        <apexchart
                            width="100%"
                            :height="bp.greaterOrEqual('lg').value ? '500px' : '300px'"
                            :options="pieOptions(stats.passives.ateco)"
                            :series="l.orderBy(stats.passives.ateco, (e:any)=>e.elements.length, 'desc').slice(0,20).map((c) => c.elements.length)"
                        ></apexchart>
                    </div>
                </div>
            </div>
        </WatchScreenSize>
        <div class="w-full flex flex-row justify-evenly flex-wrap gap-8">
            <PaginatedTable
                title="ateco_attive"
                class="stat-table"
                :elements="[
                    ...Object.values(stats.actives.ateco),
                    { key: 'Altri', description: 'Altri o non pervenuti', elements: stats.actives.missingAteco },
                ]"
                :headers="[
                    'Codice Ateco',
                    'Descrizione Ateco',
                    'Numero fatture',
                    'Percentuale fatture',
                    'Percentuale ricavi',
                ]"
                :page-size="8"
                @row-clicked="(e: any) => focusInvoices({ title: `Attive, ${e.key}`, invoices: e['elements'] })"
                header-color="rgba(var(--active-invoices-color))"
                :row-classes="(e: any) => e.elements.length > 0 ? ['cursor-pointer','underline']:[]"
                :row-mapper="(e: any) => [e.key, e.description, e.elements.length, ((100 * e.elements.length) / stats.actives.invoicesCount).toLocaleString() + '%', (
                                (100 * l.sumBy(e.elements, (i: any) => i.total_amount)) /
                                l.sumBy(stats.actives.elements, (i) => i.total_amount)
                            ).toLocaleString() + '%']"
            ></PaginatedTable>
            <PaginatedTable
                title="ateco_passive"
                class="stat-table"
                :elements="[
                    ...Object.values(stats.passives.ateco),
                    { key: 'Altri', description: 'Altri o non pervenuti', elements: stats.passives.missingAteco },
                ]"
                :headers="[
                    'Codice Ateco',
                    'Descrizione Ateco',
                    'Numero fatture',
                    'Percentuale fatture',
                    'Percentuale costi',
                ]"
                :page-size="8"
                @row-clicked="(e: any) => focusInvoices({ title: `Passive, ${e.key}`, invoices: e['elements'] })"
                header-color="rgba(var(--passive-invoices-color))"
                :row-classes="(e: any) => e.elements.length > 0 ? ['cursor-pointer','underline']:[]"
                :row-mapper="(e: any) => [e.key, e.description, e.elements.length, ((100 * e.elements.length) / stats.passives.invoicesCount).toLocaleString() + '%', (
                                (100 * l.sumBy(e.elements, (i: any) => i.total_amount)) /
                                l.sumBy(stats.passives.elements, (i) => i.total_amount)
                            ).toLocaleString() + '%']"
            ></PaginatedTable>
        </div>
        <div class="divider"></div>
        <WatchScreenSize class="w-full flex flex-col items-center gap-2">
            <h3 class="text-center">Distribuzione per top 20 causali</h3>
            <Tip>I seguenti grafici mostrano la distribuzione delle fatture per le top 20 causali</Tip>
            <div class="w-full flex flex-row justify-evenly flex-wrap gap-8">
                <div class="flex flex-col items-center">
                    <h3>Attive</h3>
                    <div class="w-full max-w-[100%] min-w-[300px] lg:min-w-[500px]">
                        <apexchart
                            width="100%"
                            :height="bp.greaterOrEqual('lg').value ? '500px' : '300px'"
                            :options="pieOptions(stats.actives.causal)"
                            :series="stats.actives.causal.map((c) => c.elements.length)"
                        ></apexchart>
                    </div>
                </div>
                <div class="flex flex-col items-center">
                    <h3>Passive</h3>
                    <div class="w-full max-w-[100%] min-w-[300px] lg:min-w-[500px]">
                        <apexchart
                            width="100%"
                            :height="bp.greaterOrEqual('lg').value ? '500px' : '300px'"
                            :options="pieOptions(stats.passives.causal)"
                            :series="stats.passives.causal.map((c) => c.elements.length)"
                        ></apexchart>
                    </div>
                </div>
            </div>
        </WatchScreenSize>
        <div class="w-full flex flex-row justify-evenly flex-wrap gap-8">
            <PaginatedTable
                title="causale_attive"
                class="stat-table"
                :elements="Object.values(stats.actives.causal)"
                :headers="['Causale', 'Numero fatture', 'Percentuale fatture', 'Percentuale costi']"
                :page-size="8"
                @row-clicked="(e: any) => focusInvoices({ title: `Attive, ${e.key}`, invoices: e['elements'] })"
                header-color="rgba(var(--active-invoices-color))"
                :row-classes="(e: any) => e.elements.length > 0 ? ['cursor-pointer','underline']:[]"
                :row-mapper="(e: any) => [e.key, e.elements.length, ((100 * e.elements.length) / stats.actives.invoicesCount).toLocaleString() + '%', (
                                (100 * l.sumBy(e.elements, (i: any) => i.total_amount)) /
                                l.sumBy(stats.actives.elements, (i) => i.total_amount)
                            ).toLocaleString() + '%']"
            ></PaginatedTable>
            <PaginatedTable
                title="causale_passive"
                class="stat-table"
                :elements="Object.values(stats.passives.causal)"
                :headers="['Causale', 'Numero fatture', 'Percentuale fatture', 'Percentuale costi']"
                :page-size="8"
                @row-clicked="(e: any) => focusInvoices({ title: `Passive, ${e.key}`, invoices: e['elements'] })"
                header-color="rgba(var(--passive-invoices-color))"
                :row-classes="(e: any) => e.elements.length > 0 ? ['cursor-pointer','underline']:[]"
                :row-mapper="(e: any) => [e.key, e.elements.length, ((100 * e.elements.length) / stats.passives.invoicesCount).toLocaleString() + '%', (
                                (100 * l.sumBy(e.elements, (i: any) => i.total_amount)) /
                                l.sumBy(stats.passives.elements, (i) => i.total_amount)
                            ).toLocaleString() + '%']"
            ></PaginatedTable>
        </div>
    </div>
    <ModalSheet :controller="modalSheetController">
        <Transition name="fade" appear>
            <div :style="{ '--delay-tr': Math.min(focusData.invoices.length, 300) + 'ms' }">
                <InvoicesTable
                    v-if="modalSheetController.expanded.value"
                    :invoices="focusData.invoices"
                    :show-filters="true"
                    ><template #header>
                        <p v-if="focusData.invoices.length > 1" class="text-center">
                            {{ focusData.invoices.length }} fatture
                        </p>
                    </template></InvoicesTable
                >
            </div>
        </Transition>
    </ModalSheet>
</template>

<script lang="ts" setup>
import { breakpointsTailwind } from "@vueuse/core";
import l from "lodash";
import { useInvoiceMappings } from "~/composables/invoice/invoice_mappings";

import * as stringUtils from "~/src/common/string";
const bp = useBreakpoints(breakpointsTailwind);
const chartOptions = useChartOptions();
const props = defineProps<{ aggregate: Ref<InvoicesStatistics> | InvoicesStatistics }>();
const stats = computed(() => (props.aggregate as Ref<InvoicesStatistics>).value || props.aggregate);
const invoiceMappings = useInvoiceMappings();
const modalSheetController = useModalSheet();

const focusData = ref<{ invoices: any[]; title: string }>({ invoices: [], title: "" });

function focusInvoices(data: { invoices: any[]; title: string }) {
    if (data.invoices === null || data.invoices.length <= 0) return;
    focusData.value = data;
    modalSheetController.toggle(true, <ModalSheetProps>{ title: data.title });
}

function pieOptions(series: any[]) {
    return chartOptions.getOptions("donut", (config) => {
        config.labels = series.map((s) => {
            if (s.description && s.description.length > 0) {
                return stringUtils.capitalize(`${s.key} - ${s.description}`);
            }
            return stringUtils.capitalize(s.key);
        });
        let totalCount = l.sumBy(series, (c) => c.elements.length);
        config.legend.customLegendItems = series
            .sort((a, b) => b.elements.length - a.elements.length)
            .slice(0, 4)
            .map((s) => {
                if (s.description && s.description.length > 0) {
                    return `${((100 * s.elements.length) / totalCount).toFixed(1)}% ${stringUtils.capitalize(
                        s.key
                    )} - ${stringUtils.capitalize(s.description)}`;
                }
                return `${((100 * s.elements.length) / totalCount).toFixed(1)}% ${stringUtils.capitalize(s.key)}`;
            });

        config.legend.show = true;
        return config;
    });
}
</script>

<style lang="css" scoped>
.stat-table {
    @apply flex-1 h-min min-w-[16rem] !important;
}

.clickable-row {
    @apply cursor-pointer underline;
}

.active-table {
    th {
        @apply bg-[rgba(var(--active-invoices-color))] !important;
    }
}

.passive-table {
    th {
        @apply bg-[rgba(var(--passive-invoices-color))] !important;
    }
}
</style>
