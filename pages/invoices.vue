<template>
    <div v-if="mounted" class="flex flex-col flex-grow">
        <div class="sticky top-0 bg-gray-900 z-20 p-4">
            <div class="flex justify-between items-center mb-4">
                <h1 class="text-2xl font-bold">Fatture 360</h1>
                <div class="absolute top-4 right-4">
                    <h3>{{ cpa.getDisplayData.name }}</h3>
                </div>
            </div>

            <DittaSearchBar @ditta-selected="selectDitta" :selectedDitta="cpa.dittas.selected"></DittaSearchBar>
        </div>

        <div v-if="cpa.dittas.selected !== null" class="pb-8 gap-12">
            <!-- <Ditta :ditta-model="cpa.dittas.selected"></Ditta> -->

            <Transition name="fade" appear mode="out-in">
                <div v-if="computing" class="flex justify-center w-full">
                    <div class="flex items-center flex-row gap-2">
                        <icon class="size-6" name="line-md:loading-twotone-loop"></icon>
                        <p class="">Recuperando i dati</p>
                    </div>
                </div>
                <div v-else class="py-2 flex w-full flex-col gap-8">
                    <DateFilterDropdown
                        id="invoices_date_filter"
                        @timespan-change="updateTimespan"
                        :initial-filter="defaultDateFilter.id"
                    ></DateFilterDropdown>
                    <WatchScreenSize>
                        <InvoicesOverview :stats="invoicesStats"></InvoicesOverview>
                    </WatchScreenSize>
                    <InvoicesStatistics :aggregate="invoicesStats"></InvoicesStatistics>
                    <InvoicesTable :invoices="filteredInvoices" enable-single-items-visualization
                        ><template #header>
                            <h1 class="text-2xl font-bold mb-4">Cerca tra tutte le fatture</h1>
                        </template>
                    </InvoicesTable>
                </div>
            </Transition>
        </div>
    </div>
</template>

<script lang="ts" setup>
import DateFilter from "~/src/date_filter";
import Timespan from "~/src/timespan";
const defaultDateFilter = DateFilter.filters.ThisYear;
const cpa = useCpa();
const mounted = useMounted();
const invoices = useInvoices();
const timespan = ref<Timespan>(defaultDateFilter.getTimespan());
const { invoicesSelectedDittaId, invoicesDocuments } = storeToRefs(invoices);
const { invoicesFetch, invoicesComputeStats } = invoices;
const computing = ref<boolean>(true);
const invoicesStats = ref<InvoicesStatistics>(<InvoicesStatistics>{});

const filteredInvoices = computed(() => {
    if (!timespan) return invoicesDocuments.value;
    return invoicesDocuments.value.filter((d) => timespan.value.fits(d["emission_date"]));
});

function updateTimespan(t: Timespan) {
    if (timespan.value.toLabel() != t.toLabel()) {
        timespan.value = t;
        setTimeout(
            async () =>
                (invoicesStats.value = await invoicesComputeStats({
                    timespan: timespan.value,
                })),
            0
        );
    }
}

watch(
    cpa.dittas.list,
    async () => {
        if (!cpa.dittas.selected) {
            let sel = cpa.dittas.list.find((e: any) => e["id"] == 4734);
            if (sel) {
                await selectDitta(sel);
            } else if (cpa.dittas.list.length > 0) {
                await selectDitta(cpa.dittas.list[0]);
            }
        } else {
            computing.value = true;
            await updateStats();
            computing.value = false;
        }
    },
    { immediate: true }
);

async function updateStats() {
    invoicesStats.value = await invoicesComputeStats({ timespan: timespan.value });
    document.body.style.overflowY = "scroll";
}

async function selectDitta(ditta: any) {
    computing.value = true;
    cpa.dittas.selected = ditta;
    if (ditta["id"] !== invoicesSelectedDittaId.value) {
        await invoicesFetch({ dittaId: ditta["id"] });
        await updateStats();
    }
    computing.value = false;
}
</script>

<style lang="css"></style>
