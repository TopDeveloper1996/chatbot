<template>
    <div ref="tableEl" class="w-full flex flex-col gap-4">
        <slot name="header"></slot>
        <p class="text-sm text-gray-400 mb-4">
            In caso di tabelle larghe, usa MAIUSC + ROTELLA MOUSE per scorrere orizzontalmente
        </p>
        <div v-if="props.showFilters" class="flex flex-col items-stretch w-full flex-wrap justify-center gap-4">
            <div class="mb-4 grid grid-cols-1 gap-4 md:grid-cols-3">
                <div
                    class="bg-[#182235] text-[#94a3b8] px-4 py-2 rounded-lg flex items-center space-x-2 border border-[#2e4a67]">
                    <div class="text-[#1a76d2] flex items-center space-x-1 focus:outline-none font-bold">Cliente o
                        fornitore</div>
                    <input class="flex-[2]" v-model="filterData.cliente_fornitore"
                        @change="(e) => {applyFilters();}"
                        placeholder="Inserisci nome cliente o fornitore" type="text" />
                </div>
                <div
                    class="bg-[#182235] text-[#94a3b8] px-4 py-2 rounded-lg flex items-center space-x-2 border border-[#2e4a67]">
                    <div class="text-[#1a76d2] flex items-center space-x-1 focus:outline-none font-bold">Numero fattura
                    </div>
                    <input class="flex-[1]" v-model="filterData.invoice_number" placeholder="Inserisci Numero fattura"
                        @change="(e) => {applyFilters();}"
                        type="text" />
                </div>
            </div>
        </div>
        <div class="mb-4 grid grid-cols-1 gap-4 md:grid-cols-3" v-if="props.showFilters">
            <div
                class="bg-[#182235] text-[#94a3b8] px-4 py-2 rounded-lg flex items-center space-x-2 border border-[#2e4a67]">
                <div class="text-[#1a76d2] flex items-center space-x-1 focus:outline-none font-bold">Causale</div>
                <input class="flex-[2]" v-model="filterData.causale" 
                    @change="(e) => {applyFilters();}" placeholder="Inserisci causale" type="text" />
            </div>
            <div
                class="bg-[#182235] text-[#94a3b8] px-4 py-2 rounded-lg flex items-center space-x-2 border border-[#2e4a67]">
                <div class="text-[#1a76d2] flex items-center space-x-1 focus:outline-none font-bold">Ricerca per
                    articolo</div>
                <input class="flex-[2]" v-model="filterData.item_description" 
                    placeholder="Ricerca per articolo" @change="(e) => {applyFilters();}"
                    type="text" />
            </div>
            <div class="mb-4 flex gap-2 w-full flex-wrap justify-around	 flex items-stretch">
                    <button class="flex items-center rounded-xl bg-blue-500 px-4 py-2 text-white"
                        @click="() => applyFilters()">
                        <svg class="mr-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                        </svg>
                        Cerca
                    </button>
                    <button class="flex items-center rounded-xl bg-gray-700 px-4 py-2 text-white"
                        @click="() => removeFilters()">
                        <svg class="mr-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                        Rimuovi
                    </button>
                </div>
        </div>
        <div class="mb-4 flex flex-wrap gap-2" v-if="props.showFilters" >
            <div class="rounded border border-gray-700 bg-gray-800 p-2">
                <button @click="() => filtersModalSheet.toggle(true, { title: 'Filtra le fatture' })" class="rounded border border-gray-700 bg-gray-800 p-2">
                    <icon name="material-symbols:filter-alt" class="text-blue-500 size-6"></icon>
                </button>
            </div>
            <div
                class="bg-[#182235] text-[#94a3b8] px-4 py-2 rounded-lg flex items-center space-x-2 border border-[#2e4a67]">
                <div class="text-[#1a76d2] flex items-center space-x-1 focus:outline-none font-bold">Tipologia</div>
                <DropdownMenu id="invoice_type_dropdown" class="min-w-[6rem]" @change="(e) => {
                        filterData.type = e.toLocaleLowerCase();
                        applyFilters();
                    }
                    " :label="stringUtils.capitalize(filterData.type) ?? ''"
                    :items="['Tutte', 'Passiva', 'Attiva']" close-on-click></DropdownMenu>
            </div>
            <div
                class="bg-[#182235] text-[#94a3b8] px-4 py-2 rounded-lg flex items-center space-x-2 border border-[#2e4a67]">
                <div class="text-[#1a76d2] flex items-center space-x-1 focus:outline-none font-bold">Documento: Tutte
                </div>
                <DropdownMenu id="invoice_doc_type_dropdown" class="min-w-[6rem]"
                    @change="(e) => {toggleSetElement(filterData.doc_type, e.toLocaleLowerCase()); applyFilters();}"
                    :label="dropDownLabel([...filterData.doc_type.values()])"
                    :selected-items="[...filterData.doc_type.values()]" :items="[
                        'Tutte',
                        ...Object.keys(invoiceMappings.getDocTypeMap.value).map((i) => i.toLocaleUpperCase()),
                    ]"></DropdownMenu>
            </div>
            <div
                class="bg-[#182235] text-[#94a3b8] px-4 py-2 rounded-lg flex items-center space-x-2 border border-[#2e4a67]">
                <div class="text-[#1a76d2] flex items-center space-x-1 focus:outline-none font-bold">Natura IVA: Tutte
                </div>
                <DropdownMenu id="invoice_iva_nature_dropdown" class="min-w-[6rem]"
                    @change="(e) => {toggleSetElement(filterData.iva_nature, e.toLocaleLowerCase()); applyFilters();}"
                    :label="dropDownLabel([...filterData.iva_nature.values()])"
                    :selected-items="[...filterData.iva_nature.values()]" :items="[
                        'Tutte',
                        ...Object.keys(invoiceMappings.getIvaNatureMap.value).map((i) => i.toLocaleUpperCase()),
                    ]"></DropdownMenu>
            </div>
            <div
                class="bg-[#182235] text-[#94a3b8] px-4 py-2 rounded-lg flex items-center space-x-2 border border-[#2e4a67]">
                <div class="text-[#1a76d2] flex items-center space-x-1 focus:outline-none font-bold">Min €</div>
                <input class="w-24 rounded border border-gray-700 bg-gray-800 p-2" type="number"
                    min="0" @change="(e) => {applyFilters();}"
                    v-model="filterData.min_amount" placeholder="Minimo" />
            </div>
            <div
                class="bg-[#182235] text-[#94a3b8] px-4 py-2 rounded-lg flex items-center space-x-2 border border-[#2e4a67]">
                <div class="text-[#1a76d2] flex items-center space-x-1 focus:outline-none font-bold">Max €</div>
                <input class="w-24 rounded border border-gray-700 bg-gray-800 p-2" min="0" type="number" @change="(e) => {applyFilters();}" 
                    v-model="filterData.max_amount" placeholder="Massimo" />
            </div>

        </div>
        <Toggle v-if="enableSingleItemsVisualization" v-model="byElements" :first="{
                label: 'Fatture',
                tooltip: 'Ogni riga della tabella è associata ad una fattura',
            }" :second="{
                label: 'Singoli articoli',
                tooltip: 'Ogni riga della tabella è associata ad ogni singolo articolo di una fattura',
            }"></Toggle>
        <div v-if="byElements" class="flex flex-col gap-4 flex-wrap">
            <div class="flex flex-row items-stretch gap-2">
                <div class="flex-1 bg-[#182235] text-[#94a3b8] px-4 py-2 rounded-lg flex items-center space-x-2 border border-[#2e4a67]">
                    <div class="text-[#1a76d2] flex items-center space-x-1 focus:outline-none font-bold">Descrizione articolo</div>
                    <input class="w-full rounded border border-gray-700 bg-gray-800 p-2" type="text"
                        @change="(e) => {applyFilters();}"
                        v-model="filterData.item_description" placeholder="Descrizione articolo" />
                </div>
                <button v-if="filterData.item_description !== undefined && filterData.item_description.length > 0"
                    @click="() => (filterData.item_description = undefined)" class="secondary-button">
                    Cancella
                </button>
            </div>
            <div class="flex flex-row gap-4">
                <div class="bg-[#182235] text-[#94a3b8] px-4 py-2 rounded-lg flex items-center space-x-2 border border-[#2e4a67]">
                    <div class="text-[#1a76d2] flex items-center space-x-1 focus:outline-none font-bold">Min articolo €</div>
                    <input class="w-24 rounded border border-gray-700 bg-gray-800 p-2" type="number"
                        min="0" @change="(e) => {applyFilters();}"
                        v-model="filterData.item_min_amount" placeholder="Minimo" />
                </div>
                <div class="bg-[#182235] text-[#94a3b8] px-4 py-2 rounded-lg flex items-center space-x-2 border border-[#2e4a67]">
                    <div class="text-[#1a76d2] flex items-center space-x-1 focus:outline-none font-bold">Max articolo €</div>
                    <input class="w-24 rounded border border-gray-700 bg-gray-800 p-2" type="number"
                        min="0" @change="(e) => {applyFilters();}"
                        v-model="filterData.item_max_amount" placeholder="Massimo" />
                </div>
            </div>
        </div>

        <PaginatedTable :title="byElements ? 'elementi_fatture' : 'fatture'" :elements="tableElements({}).value"
            :page-size="20" :headers="tableHeaders" :row-mapper="tableRowsMapper" :header-color="headerColorComputer"
            @row-clicked="(e) => focusInvoice(e)" :row-classes="
                (val) => [
                    byElements ? 'cursor-default' : 'cursor-pointer',
                    val['type'] === 'attiva' ? 'bg-active/25' : 'bg-passive/25',
                ]
            " :downloadable-row-mapper="tableDownloadableRows" :downloadable-headers="tableDownloadableHeaders"
            :show-tip="showTip" :bottom-download="bottomDownload">
        </PaginatedTable>
    </div>
    <ModalSheet height="100%" :controller="filtersModalSheet">
        <div class="flex flex-col w-full gap-6">
            <input v-model="filterData.cliente_fornitore" placeholder="Cliente fornitore" type="text" />
            <div class="flex flex-row flex-wrap w-full justify-center gap-4">
                <div class="text-center gap-2 flex flex-col">
                    <p>Importo €</p>
                    <div class="flex flex-row gap-4">
                        <div>
                            <input class="w-[8rem] text-center" v-model="filterData.min_amount" placeholder="Minimo"
                                type="number" />
                            <p class="label">Importo min €</p>
                        </div>
                        <div>
                            <input class="w-[8rem] text-center" v-model="filterData.max_amount" placeholder="Massimo"
                                type="number" />
                            <p class="label">Importo max €</p>
                        </div>
                    </div>
                </div>
                <div class="text-center gap-2 flex flex-col">
                    <p>Numero articoli</p>
                    <div class="flex flex-row gap-4">
                        <div>
                            <input class="w-[8rem] text-center" v-model="filterData.articles_count_min"
                                placeholder="Minimo" type="number" />
                            <p class="label">Numero min</p>
                        </div>
                        <div>
                            <input class="w-[8rem] text-center" v-model="filterData.articles_count_max"
                                placeholder="Massimo" type="number" />
                            <p class="label">Numero max</p>
                        </div>
                    </div>
                </div>
            </div>
            <div class="flex flex-col gap-2 w-full items-center">
                <p>Tipo fattura</p>
                <ul class="flex flex-row gap-4 flex-wrap w-full justify-center">
                    <li v-for="i in ['Tutte', 'Passiva', 'Attiva']">
                        <button @click="() => (filterData.type = i.toLocaleLowerCase())" :class="{
                                'bg-accent': filterData.type === i.toLocaleLowerCase(),
                                'hover:bg-text/25': filterData.type !== i.toLocaleLowerCase(),
                                'bg-surface': filterData.type !== i.toLocaleLowerCase(),
                            }" class="px-4 py-2 rounded-xl">
                            {{ i }}
                        </button>
                    </li>
                </ul>
            </div>
            <div class="flex flex-col gap-2 w-full items-center">
                <p>Tipo documento</p>
                <ul class="flex flex-row flex-wrap gap-4 w-full justify-center">
                    <li v-for="i in [
                            'Tutte',
                            ...Object.keys(invoiceMappings.getDocTypeMap.value).map((i) => i.toLocaleUpperCase()),
                        ]">
                        <button @click="() => toggleSetElement(filterData.doc_type, i.toLocaleLowerCase())" :class="
                                filterData.doc_type.has(i.toLocaleLowerCase())
                                    ? ['bg-accent']
                                    : ['hover:bg-text/25', 'bg-surface']
                            " class="px-4 py-2 rounded-xl">
                            {{ i }}
                        </button>
                    </li>
                </ul>
            </div>
            <div class="flex flex-col gap-2 w-full items-center">
                <p>Natura IVA</p>
                <ul class="flex flex-row flex-wrap gap-4 w-full justify-center">
                    <li v-for="i in [
                            'Tutte',
                            ...Object.keys(invoiceMappings.getIvaNatureMap.value).map((i) => i.toLocaleUpperCase()),
                        ]">
                        <button @click="() => toggleSetElement(filterData.iva_nature, i.toLocaleLowerCase())" :class="
                                filterData.iva_nature.has(i.toLocaleLowerCase())
                                    ? ['bg-accent']
                                    : ['hover:bg-text/25', 'bg-surface']
                            " class="px-4 py-2 rounded-xl">
                            {{ i }}
                        </button>
                    </li>
                </ul>
            </div>
            <div class="flex flex-col gap-2 w-full items-center">
                <p>Ritenuta</p>
                <ul class="flex flex-row flex-wrap gap-4 w-full justify-center">
                    <li v-for="i in [
                            'Tutte',
                            ...Object.keys(invoiceMappings.getRtMap.value).map((i) => i.toLocaleUpperCase()),
                        ]">
                        <button @click="() => toggleSetElement(filterData.rts, i.toLocaleLowerCase())" :class="
                                filterData.rts.has(i.toLocaleLowerCase())
                                    ? ['bg-accent']
                                    : ['hover:bg-text/25', 'bg-surface']
                            " class="px-4 py-2 rounded-xl">
                            {{ i }}
                        </button>
                    </li>
                </ul>
            </div>
            <div class="mt-8 flex flex-row justify-center items-center gap-8">
                <button @click="() => applyFilters()" class="primary-button min-w-[8rem]">
                    <icon name="material-symbols:check-circle-outline-rounded" class="size-6"></icon>
                    <p>Applica</p>
                </button>
                <button @click="() => removeFilters()" class="secondary-button min-w-[8rem]">
                    <icon name="material-symbols:delete-outline-rounded" class="size-6"></icon>
                    <p>Elimina</p>
                </button>
            </div>
        </div>
    </ModalSheet>
    <ModalSheet height="100%" :controller="detailsModalSheet">
        <div class="font-roboto">
            <div class="p-6 rounded-lg text-white">
                <div class="flex items-center mb-4 space-x-2">
                    <div class="flex items-center space-x-2">
                        <div class="text-green-400 text-lg">●</div>
                        <div class="text-lg font-semibold">
                            Fattura {{ stringUtils.capitalize(focusData.invoice.type) }}
                        </div>
                    </div>
                    <div class="flex items-center space-x-6">
                        <div class="flex items-center space-x-2">
                            <icon name="material-symbols:calendar-add-on" class="text-blue-500 size-8" />
                            <span>{{ focusData.invoice.emission_date?.toLocaleDateString() }}</span>
                        </div>
                        <div class="flex items-center space-x-2">
                            <icon name="material-symbols:lab-profile-outline-sharp" class="text-blue-500 size-8" />
                            <span>Documento n° {{ focusData.invoice.invoice_number }}</span>
                        </div>
                    </div>
                </div>
                <div class="p-4 rounded-md border mb-4">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center space-x-2">
                            <span class="font-semibold">Cliente</span>
                        </div>
                        <div class="flex items-center space-x-2">
                            <icon name="material-symbols:code-rounded" class="size-8 text-accent"></icon>
                            <span class="font-semibold">{{ focusData.invoice.cliente_fornitore_id }}</span>
                        </div>
                        <div class="flex items-center space-x-2">
                            <icon name="material-symbols:person-rounded" class="size-8 text-accent"></icon>
                            <span class="font-semibold">{{ focusData.invoice.cliente_fornitore_registered_name }}</span>
                        </div>
                        <div class="space-x-2">
                            <span class="text-lg text-blue-400">VAT</span>
                            <span>{{ focusData.invoice.cliente_fornitore_vat_id_code }}</span>
                        </div>
                        <div class="flex items-center space-x-2" v-if="cpa.dittas.selected && cpa.dittas.selected">
                            <icon name="material-symbols:location-on" class="text-blue-500 size-8" />
                            <span>{{ cpa.dittas.selected.address }} ,{{ cpa.dittas.selected.postal_code }}
                                {{ cpa.dittas.selected.comune }} {{ cpa.dittas.selected.province }}</span>
                        </div>
                    </div>
                </div>
                <div class="p-4 rounded-md border mb-4">
                    <div class="flex items-center justify-between">
                        <div>
                            <div class="text-base text-gray-400">Totale</div>
                            <div class="text-3xl font-bold text-blue-400">
                                {{ focusData.invoice.total_amount?.toLocaleString() }} €
                            </div>
                        </div>
                        <div>
                            <div class="text-base text-gray-400">Tipo documento:</div>
                            <div class="text-blue-400">
                                {{ invoiceMappings.getReadableDocType(focusData.invoice.document_type) }}
                            </div>
                        </div>
                        <div>
                            <div class="text-base text-gray-400">IVA Totale:</div>
                            <div class="text-blue-400">{{ focusData.invoice.total_iva?.toLocaleString() }} €</div>
                        </div>
                        <div v-if="focusData.invoice.causal">
                            <div class="text-base text-gray-400">Causale:</div>
                            <div class="text-blue-400">{{ focusData.invoice.causal }}</div>
                        </div>
                        <div v-if="focusData.invoice.ateco_code">
                            <div class="text-base text-gray-400">Ateco:</div>
                            <div class="text-blue-400">
                                {{ `${focusData.invoice.ateco_code} - ${focusData.invoice.ateco_description ?? ""}` }}
                            </div>
                        </div>
                    </div>
                </div>
                <div>
                    <h2 class="text-xl font-semibold mb-2">Articoli</h2>
                    <div class="rounded-md mb-4">
                        <table class="w-full text-left text-sm">
                            <thead>
                                <tr class="border-b border-gray-600">
                                    <th class="pb-2">Descrizione</th>
                                    <th class="pb-2">Codice conto</th>
                                    <th class="pb-2">Descrizione conto</th>
                                    <th class="pb-2">Quantità</th>
                                    <th class="pb-2">Prezzo unitario</th>
                                    <th class="pb-2">Prezzo totale</th>
                                    <th class="pb-2">IVA</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="e in focusData.invoice.items">
                                    <td>
                                        {{ stringUtils.capitalize(e.description) }}
                                    </td>
                                    <td>{{ e.conto_code }}</td>
                                    <td>{{ stringUtils.capitalize(e.conto_description ?? "") }}</td>
                                    <td>{{ e.quantity }}</td>
                                    <td>{{ e.price?.toLocaleString() }} €</td>
                                    <td>{{ e.total?.toLocaleString() }} €</td>
                                    <td>{{ e.iva ? e.iva + "%" : "" }}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </ModalSheet>
</template>

<script lang="ts" setup>
import l from "lodash";
import { watchDebounced } from "@vueuse/core";
import { useInvoiceMappings } from "~/composables/invoice/invoice_mappings";
import * as stringUtils from "~/src/common/string";
const cpa = useCpa();

const props = withDefaults(
    defineProps<{
        invoices: any[];
        bottomDownload: boolean;
        headerColor?: string;
        enableSingleItemsVisualization?: boolean;
        showFilters?: boolean;
        showTip?: boolean;
        invoice_type?: string;
    }>(),
    {
        enableSingleItemsVisualization: false,
        bottomDownload: true,
        showFilters: true,
        showTip: true,
        invoice_type: 'active',
    }
);
const filtersModalSheet = useModalSheet();
const detailsModalSheet = useModalSheet();
const byElements = ref<boolean>(false);
const filteredInvoices = ref<any[]>(props.invoices);
const headerColorComputer = computed(() => {
    if (props.headerColor) {
        return props.headerColor;
    }
    return byElements.value ? "#1FAD7E" : undefined;
});
const defaultFilters = {
    cliente_fornitore: undefined,
    invoice_number: undefined,
    causale: undefined,
    type: "tutte",
    doc_type: new Set(["tutte"]),
    iva_nature: new Set(["tutte"]),
    rts: new Set(["tutte"]),
    item_description: undefined,
    min_amount: undefined,
    max_amount: undefined,
    item_min_amount: undefined,
    item_max_amount: undefined,
    articles_count_min: undefined,
    articles_count_max: undefined,
};

const filterData = ref<{
    cliente_fornitore: string | undefined;
    invoice_number: string | undefined;
    causale: string | undefined;
    type: string;
    doc_type: Set<string>;
    iva_nature: Set<string>;
    rts: Set<string>;
    item_description: string | undefined;
    min_amount: number | undefined;
    max_amount: number | undefined;
    item_min_amount: number | undefined;
    item_max_amount: number | undefined;
    articles_count_min: number | undefined;
    articles_count_max: number | undefined;
}>(l.cloneDeep(defaultFilters));

const invoiceMappings = useInvoiceMappings();
const tableEl = ref<HTMLElement | null>(null);
const focusData = ref<{ invoice: any; title: string }>({ invoice: {}, title: "" });
const hasFilters = computed(() => {
    return !l.isEqualWith(filterData.value, defaultFilters);
});

const tableRowsMapper = computed(
    () => (e: any) =>
        byElements.value
            ? [
                  e["cliente_fornitore_registered_name"] ?? e["cliente_fornitore_id"],
                  e["invoice_number"],
                  stringUtils.capitalize(e["type"]),
                  invoiceMappings.getReadableDocType(e["document_type"]),
                  e["emission_date"]?.toLocaleDateString("pt-PT"),
                  e["receive_date"]?.toLocaleDateString("pt-PT"),
                  e["payment_date"]?.toLocaleDateString("pt-PT"),
                  stringUtils.capitalize(e["item_description"]),
                  e["item_iva"],
                  e["item_price"]?.toLocaleString(),
                  e["item_quantity"],
                  e["unit_measure"],
                  e["item_total_amount"]?.toLocaleString(),
              ]
            : [
                  e["cliente_fornitore_registered_name"] ?? e["cliente_fornitore_id"],
                  e["invoice_number"],
                  stringUtils.capitalize(e["type"]),
                  invoiceMappings.getReadableDocType(e["document_type"]),
                  e["invoice_transaction_nature"]?.map((n: any) => n?.toLocaleUpperCase()).join(", "),
                  e["withholding_type"].join(","),
                  e["emission_date"]?.toLocaleDateString("pt-PT"),
                  e["receive_date"]?.toLocaleDateString("pt-PT"),
                  e["payment_date"]?.toLocaleDateString("pt-PT"),
                  e["total_amount"]?.toLocaleString(),
                  e["items"]?.length,
              ]
);

const tableElements = ({
    singleItems = undefined,
    ignoreFilters = false,
}: {
    singleItems?: boolean | undefined;
    ignoreFilters?: boolean;
}) =>
    computed(() => {
        let elements = ignoreFilters ?? false ? props.invoices : filteredInvoices.value;
        let byElement = singleItems ?? byElements.value;
        let res: any[] = [];
        if (byElement) {
            for (const doc of elements) {
                for (const item of doc.items) {
                    let rowElem = { ...doc };
                    rowElem.item_description = item.description;
                    rowElem.item_iva = item.iva;
                    rowElem.item_quantity = item.quantity;
                    rowElem.item_price = item.price;
                    rowElem.unit_measure = item.unit_measure;
                    rowElem.item_total_amount = item.total;
                    if (
                        (filterData.value.item_min_amount &&
                            rowElem.item_total_amount < filterData.value.item_min_amount) ||
                        (filterData.value.item_max_amount &&
                            rowElem.item_total_amount > filterData.value.item_max_amount)
                    ) {
                        continue;
                    }

                    if (
                        filterData.value.item_description !== undefined &&
                        !(rowElem.item_description as string)
                            .toLocaleLowerCase()
                            .includes(filterData.value.item_description.toLocaleLowerCase())
                    ) {
                        continue;
                        // rowElem.elastic_match = stringUtils.similarity(
                        //     rowElem.item_description ?? "",
                        //     filterData.value.item_description!
                        // );
                    } else {
                        rowElem.elastic_match = 0;
                    }

                    res.push(rowElem);
                }
            }
            // if (filterData.value.item_description !== undefined && filterData.value.item_description.length > 0) {
            //     res = l.takeWhile(l.orderBy(res, "elastic_match", "desc"), (e) => e.elastic_match > 0.5);
            // }
        } else {
            res = elements;
        }
        return res;
    });

const tableHeaders = computed(() =>
    byElements.value
        ? [
              props.invoice_type === "active" ? "Cliente fornitore" : "Fornitore",
              "Numero fattura",
              "Tipo",
              "Tipo Documento",
              "Data emissione",
              "Data ricezione",
              "Data pagamento",
              "Descrizione",
              "IVA",
              "Prezzo €",
              "Quantità",
              "Unità di misura",
              "Totale €",
          ]
        : [
              props.invoice_type === "active" ? "Cliente fornitore" : "Fornitore",
              "Numero fattura",
              "Tipo",
              "Tipo Documento",
              "Natura IVA",
              "Ritenuta",
              "Data emissione",
              "Data ricezione",
              "Data pagamento",
              "Totale €",
              "Numero articoli",
          ]
);

const tableDownloadableRows = computed(() => (e: any) => {
    return byElements.value
        ? [
              e["cliente_fornitore_registered_name"] ?? e["cliente_fornitore_id"],
              e["ateco_code"],
              e["ateco_description"],
              e["cliente_fornitore_vat_id_code"],
              e["cliente_fornitore_fiscal_code"],
              e["invoice_number"],
              stringUtils.capitalize(e["type"]),
              invoiceMappings.getReadableDocType(e["document_type"]),
              e["emission_date"]?.toLocaleDateString("pt-PT"),
              e["receive_date"]?.toLocaleDateString("pt-PT"),
              e["payment_date"]?.toLocaleDateString("pt-PT"),
              stringUtils.capitalize(e["item_description"]),
              e["item_iva"],
              e["item_price"]?.toLocaleString(),
              e["item_quantity"],
              e["item_total_amount"]?.toLocaleString(),
          ]
        : [
              e["cliente_fornitore_registered_name"] ?? e["cliente_fornitore_id"],
              e["ateco_code"],
              e["ateco_description"],
              e["cliente_fornitore_vat_id_code"],
              e["cliente_fornitore_fiscal_code"],
              e["invoice_number"],
              stringUtils.capitalize(e["type"]),
              invoiceMappings.getReadableDocType(e["document_type"]),
              e["invoice_transaction_nature"]?.map((n: any) => n?.toLocaleUpperCase()).join(", "),
              e["withholding_type"].join(","),
              e["emission_date"]?.toLocaleDateString("pt-PT"),
              e["receive_date"]?.toLocaleDateString("pt-PT"),
              e["payment_date"]?.toLocaleDateString("pt-PT"),
              e["total_amount"]?.toLocaleString(),
              e["items"]?.length,
          ];
});
const tableDownloadableHeaders = computed(() =>
    byElements.value
        ? [
              props.invoice_type === "active" ? "Cliente fornitore" : "Fornitore",
              "Codice Ateco",
              "Descrizione Ateco",
              "VAT",
              "Codice Fiscale",
              "Numero fattura",
              "Tipo",
              "Tipo Documento",
              "Data emissione",
              "Data ricezione",
              "Data pagamento",
              "Descrizione",
              "IVA",
              "Prezzo",
              "Quantità",
              "Totale",
          ]
        : [
              props.invoice_type === "active" ? "Cliente fornitore" : "Fornitore",
              "Codice Ateco",
              "Descrizione Ateco",
              "VAT",
              "Codice Fiscale",
              "Numero fattura",
              "Tipo",
              "Tipo Documento",
              "Natura IVA",
              "Ritenuta",
              "Data emissione",
              "Data ricezione",
              "Data pagamento",
              "Totale",
              "Numero articoli",
          ]
);

function focusInvoice(invoice: any) {
    if (byElements.value) {
        return;
    }
    focusData.value = { invoice: invoice, title: "Dettagli" };
    detailsModalSheet.toggle(true, <ModalSheetProps>{ title: focusData.value.title });
}

function focusTopTable() {
    return // TODO: fix this on FF
    setTimeout(() => {
        if (tableEl.value === null) return;
        tableEl.value.scrollIntoView({ behavior: "smooth" });
    }, 100);
}

watch(
    () => props.invoices,
    () => applyFilters(false)
);
watchDebounced(
    filterData,
  () => { console.log("filter changed") ;  applyFilters();},
  { debounce: 100, maxWait: 100 },
);

function toggleSetElement(set: Set<string>, elem: string) {
    if (set.has(elem)) {
        set.delete(elem);
    } else {
        set.add(elem);
        if (elem !== "tutte") {
            set.delete("tutte");
        } else {
            set.clear();
        }
    }
    if (set.size <= 0) {
        set.add("tutte");
    }
}

function dropDownLabel(elems: string[]) {
    return elems.length > 1 ? elems.length.toString() : elems[0] === "tutte" ? "Tutte" : elems[0].toLocaleUpperCase();
}

function removeFilters(focus: boolean = true) {
    filteredInvoices.value = props.invoices.sort((a, b) => b["emission_date"] - a["emission_date"]);
    filterData.value = l.cloneDeep(defaultFilters);
    if (focus) focusTopTable();
}

function applyFilters(focus: boolean = true) {
    filtersModalSheet.toggle(false);

    let invoices = props.invoices;
    invoices = invoices.filter((i) => {
        let condition: boolean = true;
        if (!stringUtils.isNullOrEmpty(filterData.value.cliente_fornitore)) {
            condition =
                condition &&
                i["cliente_fornitore_registered_name"]
                    ?.toLowerCase()
                    ?.includes(filterData.value.cliente_fornitore?.toLowerCase()?.trim());
        }
        if (!stringUtils.isNullOrEmpty(filterData.value.causale)) {
            condition =
                condition &&
                i["causal"]
                    ?.toLowerCase()
                    ?.includes(filterData.value.causale?.toLowerCase()?.trim());
        }

        if (!stringUtils.isNullOrEmpty(filterData.value.invoice_number)) {
            condition =
                condition &&
                i["invoice_number"]?.toLowerCase()?.includes(filterData.value.invoice_number?.toLowerCase()?.trim());
        }
        if (!stringUtils.isNullOrEmpty(filterData.value.type) && filterData.value.type !== "tutte") {
            condition = condition && i["type"]?.toLowerCase() === filterData.value.type.toLowerCase();
        }
        if (!filterData.value.doc_type.has("tutte")) {
            condition = condition && filterData.value.doc_type.has(i["document_type"]?.toLowerCase());
        }
        if (!filterData.value.iva_nature.has("tutte")) {
            condition =
                condition &&
                l.xor(
                    [...filterData.value.iva_nature.values()],
                    (i["invoice_transaction_nature"] ?? []).map((n: any) => n.toLocaleLowerCase())
                ).length === 0;
        }
        if (!filterData.value.rts.has("tutte")) {
            let interesct = false;
            for (const rt of filterData.value.rts) {
                if (i["withholding_type"]?.map((w: any) => w.toLocaleLowerCase()).includes(rt.toLocaleLowerCase())) {
                    interesct = true;
                    break;
                }
            }
            condition = condition && interesct;
        }
        if (filterData.value.min_amount !== undefined && filterData.value.min_amount.toString().length > 0) {
            condition = condition && i["total_amount"] >= filterData.value.min_amount;
        }
        if (filterData.value.max_amount !== undefined && filterData.value.max_amount.toString().length > 0) {
            condition = condition && i["total_amount"] <= filterData.value.max_amount;
        }
        if (
            filterData.value.articles_count_min !== undefined &&
            filterData.value.articles_count_min.toString().length > 0
        ) {
            condition = condition && i["items"]?.length >= filterData.value.articles_count_min;
        }
        if (
            filterData.value.articles_count_max !== undefined &&
            filterData.value.articles_count_max.toString().length > 0
        ) {
            condition = condition && i["items"]?.length <= filterData.value.articles_count_max;
        }
        return condition;
    });

    invoices.sort((a, b) => b["emission_date"] - a["emission_date"]);
    filteredInvoices.value = invoices;
    if (focus) focusTopTable();
}
</script>

<style lang="css" scoped>
.label {
    @apply italic text-center text-text/75 text-[0.725rem];
}
</style>
