<template>
    <div  class="w-full flex-col flex items-center gap-4">
        <div class="flex flex-row flex-wrap w-full items-center justify-center gap-4">
            <div class="card">
                <p class="title">Ricavi</p>
                <span class="content">{{
                    stringUtils.toShortCurrencyString(props.stats.ricavi_totale_valore_della_produzione)
                }}</span>
            </div>
            <div class="card">
                <p class="title">Costi fissi</p>
                <span class="content">{{stringUtils.toShortCurrencyString(props.stats.costi_fissi) }} </span>
            </div>
            <div class="card">
                <p class="title">Costi variabili</p>
                <span class="content">{{ stringUtils.toShortCurrencyString(props.stats.costi_variabili)}}</span>
            </div>
            <div class="card">
                <p class="title">EBITDA</p>
                <span class="content">{{
                    stringUtils.toShortCurrencyString(props.stats.ebitda)
                }}</span>
            </div>
            <div class="card">
                <p class="title">Utile del periodo</p>
                <span class="content">{{
                    stringUtils.toShortCurrencyString(props.stats.utile_del_periodo)
                }}</span>
            </div>
        </div>
        <div class="flex flex-row flex-wrap w-full items-center justify-center gap-4">
            <div class="card">
                <p class="title">Crediti</p>
                <span class="content">{{
                    stringUtils.toShortCurrencyString(props.stats.crediti)
                }}</span>
            </div>
            <div class="card">
                <p class="title">Indebitamento</p>
                <span class="content">{{
                    stringUtils.toShortCurrencyString(props.stats.indebitamento_netto_complessivo)
                }}</span>
            </div>
            <div class="card">
                <p class="title">Durata media del credito</p>
                <span class="content">{{ stringUtils.roundNumber(props.stats.durata_media_del_credito,3) }} giorni </span>
            </div>
            <div class="card">
                <p class="title">Break-even point</p>
                <span class="content">{{ stringUtils.toShortCurrencyString(props.stats.break_even_point)}}</span>
            </div>
        </div>
    </div>
</template>
    




<script lang="ts" setup>
import { result } from "lodash";
import * as stringUtils from "~/src/common/string";
const props = defineProps<{ stats: TeamSystemSummary }>();

const emit = defineEmits<{(e: 'summary-org-completed', result: any): void}>();
const performCalculation = (value: TeamSystemSummary): any => {
  return {
    "valuta": "Eu",
    "Ricavi": value.ricavi_totale_valore_della_produzione ,
    "Costi fissi": value.costi_fissi ,
    "Costi variabili": value.costi_variabili ,
    "EBITDA": value.ebitda ,
    "Utile del periodo": value.utile_del_periodo ,
    "Crediti": value.crediti ,
    "Indevitamento": value.indebitamento_netto_complessivo ,
    "Durata media del credito": value.durata_media_del_credito,
    "Break-even point": value.break_even_point 
  };
};

watch(() => props.stats, (newValue) => {
  const result = performCalculation(newValue);
  emit('summary-org-completed', result);
}, { immediate: true });

</script>

<style lang="css" scoped>
.card {
    @apply flex-grow relative bg-surface rounded-xl flex flex-col items-center px-8 pt-10 pb-2 self-stretch border-[1.5px] border-outline;
    .content {
        @apply text-3xl font-bold mt-4;
    }
    .title {
        @apply text-sm font-light;
    }
    .iconify {
        @apply size-10 my-2;
    }
}
</style>