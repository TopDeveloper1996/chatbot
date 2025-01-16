<template>
    <div v-if="mounted" class="flex flex-col flex-grow h-screen mb-8">
        <h1 class="view-title">Statistiche di processo</h1>
        <Transition name="fade" appear mode="out-in">
            <div v-if="processStats.fetching" class="flex justify-center w-full">
                <div class="flex items-center flex-row gap-2">
                    <icon class="size-6" name="line-md:loading-twotone-loop"></icon>
                    <p class="">Recuperando i dati</p>
                </div>
            </div>
            <div v-else class="py-2 flex w-full flex-col gap-8">
                <ProcessStatisticsInvoices></ProcessStatisticsInvoices>
                <ProcessStatisticsFees></ProcessStatisticsFees>
                <ProcessStatisticsF24></ProcessStatisticsF24>
            </div>
        </Transition>
    </div>
</template>

<script lang="ts" setup>
const mounted = useMounted();
const processStats = useProcessStatisticsStore();

onMounted(async () => {
    await processStats.processStatisticsFetch({});
    document.body.style.overflowY = "scroll";
});
</script>

<style lang="css"></style>
