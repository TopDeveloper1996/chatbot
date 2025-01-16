<template>
    <div class="flex flex-col">
        <h2 class="text-center mb-2">Ricerca avanzata dati F24</h2>
        <h4 class="text-center">
            In questa sezione puoi ricercare sia dati a livello di documento F24 sia a livello di singolo tributo
        </h4>
        <div class="mt-4 w-full flex flex-row items-center justify-center">
            <Toggle
                v-model="byTribute"
                :first="{
                    label: 'Aggrega per documento',
                    tooltip: 'Ogni riga della tabella è associata ad un documento',
                }"
                :second="{
                    label: 'Aggrega per tributo',
                    tooltip: 'Ogni riga della tabella è associata ad un singolo tributo',
                }"
            ></Toggle>
        </div>

        <div class="flex flex-row items-center justify-center gap-4">
            <div class="flex flex-row flex-1 items-center gap-4">
                <DittaSearchBar class="flex-1" @ditta-selected="dittaSelected"></DittaSearchBar>

                <button @click="resetFilters" v-if="filterData.ditta" class="secondary-button">
                    <icon name="material-symbols:delete-outline-rounded" class="size-6"></icon>
                    <p>Tutte</p>
                </button>
            </div>
            <div class="flex flex-row justify-end items-center gap-4">
                <DropdownMenu
                    v-if="byTribute"
                    id="invoice_iva_nature_dropdown"
                    class="min-w-[6rem] h-[3rem]"
                    @change="(e) => (filterData.tribute = e.toLocaleLowerCase())"
                    close-on-click
                    :label="filterData.tribute.toLocaleUpperCase('it') ?? undefined"
                    :items="['Tutte', ...Object.values(F24Category).map((c) => c.toLocaleUpperCase('it') ?? '')]"
                ></DropdownMenu>
                <!-- <p class="italic text-center text-[0.7rem]">Tributo causale</p> -->
                <DateFilterDropdown @timespan-change="updateTimespan" id="table-filter"></DateFilterDropdown>
            </div>
        </div>
        <div v-if="byTribute" class="w-full sm:w-[75%] lg:w-[75%] flex flex-row gap-4">
            <input
                class="flex-1"
                v-model="queryTribute"
                @keyup.enter="() => (filterData.tributeQuery = queryTribute)"
                title="tributo causale"
                placeholder="Cerca per tributo causale"
            />
            <button @click="() => (filterData.tributeQuery = queryTribute)" class="primary-button">
                <p>Cerca</p>
                <icon name="material-symbols:search-rounded" class="size-6"></icon></button
            ><button @click="clearSearchTerm" class="secondary-button">
                <p>Tutti</p>
                <icon name="material-symbols:delete-outline-rounded" class="size-6"></icon>
            </button>
        </div>
        <div class="flex justify-end mt-4">
            <button @click="downloadSheet" class="secondary-button">
                <p>Scarica</p>
                <icon name="material-symbols:cloud-download-rounded" class="size-6"></icon>
            </button>
        </div>
        <Ditta class="" :ditta-model="filterData.ditta"></Ditta>
        <p class="text-center text-accent font-bold">
            {{ `Dal ${timespan.from.toLocaleDateString()} al ${timespan.to.toLocaleDateString()}` }}
        </p>
        <PaginatedTable
            title="documenti_f24"
            :downloadable="false"
            :elements="tableRows({}).value"
            :headers="tableHeaders"
            :page-size="12"
            :header-color="byTribute ? '#1FAD7E' : undefined"
            @row-clicked="(e: any) =>   focusDocuments(e)"
            :row-classes="(e: any) => !byTribute ? ['cursor-pointer']:[]"
            :row-mapper="tableRowMapper"
        ></PaginatedTable>
        <div class="flex justify-end">
            <button @click="downloadSheet" class="secondary-button">
                <p>Scarica</p>
                <icon name="material-symbols:cloud-download-rounded" class="size-6"></icon>
            </button>
        </div>
        <ModalSheet height="85%" :controller="detailsController">
            <div class="flex flex-col w-full gap-10 p-4">
                <div class="flex flex-row gap-4 justify-evenly w-full flex-wrap">
                    <span
                        v-if="cpa.dittas.getDittaData(focusedDocument.ditta_id)"
                        class="flex flex-col gap-2 items-center"
                    >
                        <icon name="material-symbols:person-rounded" class="size-8 text-accent"></icon>
                        <p>
                            {{
                                stringUtils.wordCapitalize(
                                    cpa.dittas.getDittaData(focusedDocument.ditta_id).registered_name
                                )
                            }}
                        </p>
                    </span>
                    <span v-if="focusedDocument.application_date" class="flex flex-row gap-2 items-center">
                        <icon name="material-symbols:calendar-add-on-rounded" class="size-8 text-accent"></icon>
                        <p class="font-bold">
                            {{ focusedDocument.application_date?.toLocaleDateString() }}
                        </p>
                    </span>
                    <span
                        v-if="focusedDocument.office_code && focusedDocument.office_code !== 'assente'"
                        class="flex flex-row gap-2 items-center"
                    >
                        <icon name="ep:office-building" class="size-8 text-accent"></icon>
                        <p class="font-bold">
                            {{ focusedDocument.office_code }}
                        </p> </span
                    ><span v-if="focusedDocument.act_code" class="flex flex-row gap-2 items-center">
                        <icon name="material-symbols:contract-edit-rounded" class="size-8 text-accent"></icon>
                        <p class="font-bold">
                            {{ focusedDocument.act_code }}
                        </p>
                    </span>
                </div>
                <div class="items-start flex flex-col gap-2">
                    <span v-if="focusedDocument.office_code && focusedDocument.office_code !== 'assente'">
                        <p>
                            Codice ufficio:
                            <span class="font-bold text-accent">{{ focusedDocument.office_code }}</span>
                        </p> </span
                    ><span v-if="focusedDocument.act_code">
                        <p>
                            Codice atto:
                            <span class="font-bold text-accent">{{ focusedDocument.act_code }}</span>
                        </p>
                    </span>
                </div>
                <div class="items-center flex flex-col w-full">
                    <h2>Sezioni</h2>
                    <div
                        class="w-full text-start"
                        v-for="([k, v], index) in Object.entries((focusedDocument.sections ?? []) as any[])"
                    >
                        <h3>{{ stringUtils.wordCapitalize(k.toString()) }}</h3>

                        <div class="items-start flex flex-col gap-2">
                            <span>
                                <p>
                                    Debito:
                                    <span class="font-bold text-accent">{{ v.section_debit?.toLocaleString() }} €</span>
                                </p> </span
                            ><span>
                                <p>
                                    Credito:
                                    <span class="font-bold text-accent"
                                        >{{ v.section_credit?.toLocaleString() }} €</span
                                    >
                                </p> </span
                            ><span>
                                <p>
                                    Saldo:
                                    <span class="font-bold text-accent"
                                        >{{ v.section_balance?.toLocaleString() }} €</span
                                    >
                                </p>
                            </span>
                        </div>
                        <ScrollableTable>
                            <table>
                                <thead>
                                    <tr>
                                        <th>Codice</th>
                                        <th>Tributo causale</th>
                                        <th>Elementi identificativi</th>
                                        <th>Importo a credito</th>
                                        <th>Importo a debito</th>
                                        <th>Saldo</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="e in v.elements">
                                        <td>{{ e.code }}</td>
                                        <td>{{ e.causal_tax?.toLocaleUpperCase() }}</td>
                                        <td>{{ e.identification_elements }}</td>
                                        <td>{{ e.credit_amount?.toLocaleString() }} €</td>
                                        <td>{{ e.debit_amount?.toLocaleString() }} €</td>
                                        <td>{{ (e.debit_amount - e.credit_amount)?.toLocaleString() }} €</td>
                                    </tr>
                                </tbody>
                            </table>
                        </ScrollableTable>
                        <div class="h-[2.5rem]"></div>
                    </div>
                </div>
            </div>
        </ModalSheet>
    </div>
</template>

<script lang="ts" setup>
import l from "lodash";
// import { utils, writeFileXLSX } from "xlsx";
import * as stringUtils from "~/src/common/string";
import Timespan from "~/src/timespan";
const byTribute = ref<boolean>(false);
const cpa = useCpa();
const mappings = useF24Mappings();
const detailsController = useModalSheet();
const focusedDocument = ref<any>({});
const timespan = ref<Timespan>(Timespan.all());
const fileSaver = useFileDownloader();
let queryTribute = "";
const defaultFilters: { ditta: any | undefined; tribute: string; tributeQuery: string } = {
    ditta: undefined,
    tribute: "tutte",
    tributeQuery: "",
};
const filterData = ref<{ ditta: any | undefined; tribute: string; tributeQuery: string }>(l.cloneDeep(defaultFilters));

const props = defineProps<{ f24Documents: any[] }>();


const clearSearchTerm = () => {
    queryTribute = '';
    resetFilters();
};

watch(byTribute, resetFilters);
function updateTimespan(t: Timespan) {
    if (
        t.from.toISOString() !== timespan.value.from.toISOString() ||
        t.to.toISOString() !== timespan.value.to.toISOString()
    ) {
        timespan.value = t;
    }
}
const tableHeaders = computed(() => {
    if (byTribute.value) {
        return [
            "Data applicazione",
            "Ditta",
            "Codice ufficio",
            "Codice atto",
            "Sezione",
            "Codice",
            "Tributo causale",
            "Elementi identificativi",
            "Importo a debito",
            "Importo a credito",
            "Saldo",
        ];
    }
    return ["Data applicazione", "Ditta", "Codice ufficio", "Codice atto", "Saldo", "Elementi sezioni"];
});
const tableRowMapper = computed(() => (v: any) => {
    if (byTribute.value) {
        return [
            v.application_date?.toLocaleDateString(),
            stringUtils.wordCapitalize(cpa.dittas.getDittaData(v.ditta_id)?.registered_name) ??
                `Ditta non registrata, id: ${v.ditta_id}`,
            v.office_code,
            v.act_code,
            stringUtils.wordCapitalize(v.section),
            v.code,
            v.causal_tax,
            v.identification_elements,
            v.debit_amount?.toLocaleString() + " €",
            v.credit_amount?.toLocaleString() + " €",
            (v.debit_amount - v.credit_amount)?.toLocaleString() + " €",
        ];
    }
    return [
        v.application_date?.toLocaleDateString(),
        stringUtils.wordCapitalize(cpa.dittas.getDittaData(v.ditta_id)?.registered_name) ??
            `Ditta non registrata, id: ${v.ditta_id}`,
        v.office_code,
        v.act_code,
        v.balance?.toLocaleString() + " €",
        v.sections_elements,
    ];
});
const filteredList = computed(() => {
    return props.f24Documents.filter((d) => {
        let valid = true;
        if (filterData.value.ditta) {
            valid = valid && d.ditta_id == filterData.value.ditta.id;
        }
        if (timespan.value) {
            valid = valid && timespan.value.fits(d.application_date);
        }

        return valid;
    });
});
const tableRows = ({
    singleTributes = undefined,
    ignoreFilters = false,
}: {
    singleTributes?: boolean | undefined;
    ignoreFilters?: boolean;
}) =>
    computed(() => {
        let elements = ignoreFilters ?? false ? props.f24Documents : filteredList.value;
        let tribute = singleTributes ?? byTribute.value;
        let res: any[] = [];
        if (tribute) {
            for (const doc of elements) {
                for (const sectionKey in doc.sections) {
                    for (const sectionEl of doc.sections[sectionKey].elements) {
                        let rowElem = { ...doc };
                        rowElem.section = sectionKey;
                        rowElem.credit_amount = sectionEl.credit_amount;
                        rowElem.code = sectionEl.code;
                        rowElem.causal_tax = sectionEl.causal_tax;
                        rowElem.identification_elements = sectionEl.identification_elements;
                        rowElem.debit_amount = sectionEl.debit_amount;
                        res.push(rowElem);
                    }
                }
            }
        } else {
            res = elements;
        }
        if (!ignoreFilters) {
            const tributeQueryTerms = filterData.value.tributeQuery
                .split(stringUtils.OR_SEARCH_SEPARATOR)
                .filter((e) => e.length > 0)
                .map((e) => e.toLocaleLowerCase());
            console.log({tributeQueryTerms})
            res = res.filter((d) => {
                let valid = true;
                if (filterData.value.tribute !== "tutte") {
                    if (tribute) {
                        let m = mappings.getMappedCategory(d.section, d.causal_tax);
                        valid = valid && m !== undefined && m == filterData.value.tribute.toLocaleLowerCase();
                    } else {
                        let m = d.aggregations[filterData.value.tribute];
                        valid = valid && m && (m.credit_amount !== 0 || m.debit_amount !== 0);
                    }
                }
                if (byTribute.value) {
                    if (tributeQueryTerms.length > 0) {
                        valid = valid && tributeQueryTerms.some(e => d.causal_tax?.includes(e));
                        // valid = valid && d.causal_tax?.includes(filterData.value.tributeQuery.toLocaleLowerCase());
                    }
                }
                return valid;
            });
        }

        return res;
    });

function dittaSelected(ditta: any) {
    filterData.value.ditta = ditta;
}

function focusDocuments(e: any) {
    if (byTribute.value) return;
    focusedDocument.value = e;
    detailsController.toggle(true);
}

function resetFilters() {
    let current = filterData.value;
    filterData.value = l.cloneDeep(defaultFilters);
    filterData.value.ditta = current.ditta;
}

async function downloadSheet() {
    const fieldRemapping = [
        { key: "application_date", remappedKey: "Data applicazione" },
        {
            key: "ditta_id",
            remappedKey: "Ditta",
            mapper: (v: any, key: string) =>
                cpa.dittas.getDittaData(v[key])?.registered_name ?? `Ditta non registrata, id: ${v[key]}`,
        },
        { key: "office_code", remappedKey: "Codice ufficio" },
        { key: "act_code", remappedKey: "Codice atto" },
        {
            key: "section",
            remappedKey: "Sezione",
            mapper: (v: any, key: string) => stringUtils.wordCapitalize(v[key]),
        },
        { key: "code", remappedKey: "Codice" },
        { key: "causal_tax", remappedKey: "Tributo causale" },
        { key: "identification_elements", remappedKey: "Elementi identificativi" },
        { key: "debit_amount", remappedKey: "Importo a debito" },
        { key: "credit_amount", remappedKey: "Importo a credito" },
        {
            key: "balance_amount",
            remappedKey: "Saldo",
            mapper: (v: any, key: string) => v.debit_amount - v.credit_amount,
        },
    ];
    let elems = tableRows({ singleTributes: true }).value.map((e) =>
        Object.fromEntries(fieldRemapping.map((f) => [f.remappedKey ?? f.key, f.mapper?.(e, f.key) ?? e[f.key]]))
    );
    if (elems.length <= 0) return;

    let sheetName =
        (filterData.value.ditta?.registered_name ?? "all_ditta") + "_" + (filterData.value.tribute ?? "all_causal");
    sheetName = sheetName
        .split(" ")
        .map((e: string) => e.trim().replace(/\.|'/g, "").toLocaleLowerCase())
        .join("_");

    let csvData = `${fieldRemapping.map((f) => f.remappedKey).join(",")}\n`;
    elems.forEach(
        (doc) =>
            (csvData += `${Object.values(doc)
                .map((r) => r?.toString()?.replace(/,/g, "."))
                .join(",")}\n`)
    );
    var blob = new Blob([csvData], { type: "text/csv;charset=utf-8" });
    fileSaver.download(blob, sheetName);
}
</script>

<style></style>
