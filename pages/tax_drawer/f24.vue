<template>
    <div class="flex flex-col flex-grow">
        <h1 class="view-title">F24 analisi & statistiche</h1>
        <Transition name="fade" appear mode="out-in">
            <div v-if="f24Fetching" class="flex justify-center w-full">
                <div class="flex items-center flex-row gap-2">
                    <icon class="size-6" name="line-md:loading-twotone-loop"></icon>
                    <p class="">Recuperando i dati</p>
                </div>
            </div>
            <div v-else-if="f24Stats.count > 0" class="py-2 flex w-full flex-col gap-4">
                <div>
                    <DateFilterDropdown
                        id="invoices_date_filter"
                        @timespan-change="updateTimespan"
                        :initial-filter="defaultDateFilter.id"
                    ></DateFilterDropdown>
                    <div class="flex flex-row items-center justify-center gap-4">
                        <DittaSearchBar class="flex-1" @ditta-selected="dittaSelected"></DittaSearchBar>
                        <button @click="() => dittaSelected(undefined)" v-if="selectedDitta" class="secondary-button">
                            Tutte le ditte
                        </button>
                    </div>
                </div>
                <h2 class="text-center">Panoramica</h2>
                <Ditta class="w-full flex flex-col items-center justify-center" :ditta-model="selectedDitta"></Ditta>

                <p class="text-center text-accent font-bold">
                    {{ `Dal ${ts.from.toLocaleDateString()} al ${ts.to.toLocaleDateString()}` }}
                </p>

                <TaxDrawerF24PaginatedBarcharts :stats="f24Stats"></TaxDrawerF24PaginatedBarcharts>
                <TaxDrawerF24DocumentsTable :f24-documents="f24Documents"></TaxDrawerF24DocumentsTable>
            </div>
            <div v-else>
                <Tip
                    >Al momento non sono stati trovati dati relativi agli F24 per le ditte abilitate su AdeMentally</Tip
                >
            </div>
        </Transition>
    </div>
</template>

<script lang="ts" setup>
import DateFilter from "~/src/date_filter";
import Timespan from "~/src/timespan";

const defaultDateFilter = DateFilter.filters.ThisYear;

const ts = ref<Timespan>(defaultDateFilter.getTimespan());
const f24 = useF24();
const { f24Fetch, f24ComputeStats } = f24;
const { f24Fetching, f24Documents } = storeToRefs(f24);
const f24Stats = ref<F24Statistics>(<F24Statistics>{});
const selectedDitta = ref<any | undefined>(undefined);

function updateTimespan(t: Timespan) {
    if (t.from.toISOString() !== ts.value.from.toISOString() || t.to.toISOString() !== ts.value.to.toISOString()) {
        ts.value = t;
        setTimeout(() => (f24Stats.value = f24ComputeStats({ dittaId: parseInt(selectedDitta.value?.id), timespan: ts.value })), 0);
    }
}
function dittaSelected(ditta: any | undefined) {
    selectedDitta.value = ditta;
    console.log(ditta?.id);
    f24Stats.value = f24ComputeStats({ dittaId: parseInt(ditta?.id), timespan: ts.value });
}

onMounted(async () => {
    console.log("fetching");
    await f24Fetch({});
    console.log("fetched");
    f24Stats.value = f24ComputeStats({ timespan: ts.value });
});
</script>

<style></style>
