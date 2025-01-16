<template>
    <div v-if="mounted" class="my-4 flex items-center space-x-4 relative flex-grow">
                <div class="w-full h-[60px]">
                    <div
                        class="bg-[#182235] text-[#94a3b8] w-[800px] px-4 py-2 rounded-full flex items-center space-x-2 border border-[#2e4a67]">
                        <button class="text-[#1a76d2] flex items-center space-x-1 focus:outline-none">
                            <icon name="material-symbols:search"></icon>
                            <span class="text-[#1a76d2] font-semibold">Cerca</span>
                        </button>
                        <input v-model="dittaQuery" type="text" placeholder="Inserisci nome ditta o id"
                            class="bg-transparent text-[#94a3b8] focus:outline-none w-full placeholder-[#94a3b8]">
                    </div>
                    <Transition name="join" appear mode="out-in">
                        <div v-if="dittaQuery.length > 0" :style="{ '--y-tr': '-25px' }" class="relative z-50 bg-[#182235] text-[#94a3b8] w-[800px] flex gap-2 flex-col py-4">
                            <div class="suggestion-entry" @click="(ev: any) => selectDitta(d)" v-for="d in elasticMatches"
                                :data-obj="d">
                                {{ `${d["id"]} ${stringUtils.wordCapitalize(d["registered_name"])}` }}
                            </div>
                        </div>
                    </Transition>
                </div>
                <div class="text-right text-sm whitespace-nowrap">
                    <span class="block font-semibold">{{ props.selectedDitta?.registered_name }}</span>
                    <span class="text-wrap text-gray-400 ml-2">{{ props.selectedDitta?.ateco_code }} - {{
                        props.selectedDitta?.ateco_description }} </span> <br />
                    <span class="text-gray-400 ml-2">{{ props.selectedDitta?.rea_code }}</span> <br />
                </div>
    </div>
</template>

<script lang="ts" setup>
import * as stringUtils from "~/src/common/string";

const cpa = useCpa();
const mounted = useMounted();
const dittaQuery = ref("");
const elasticMatches = computed(() => cpa.dittas.elasticSearch(dittaQuery.value));
const selectedDitta = defineModel<any>();
const props = defineProps<{ selectedDitta?: any }>();

const emit = defineEmits<{ (e: "dittaSelected", model: any): void }>();

async function selectDitta(ditta: any) {
    selectedDitta.value = ditta;
    dittaQuery.value = "";
    emit("dittaSelected", selectedDitta.value);
}
</script>

<style lang="css" scoped>
.suggestion-entry {
    @apply bg-surface hover:bg-outline/100 cursor-pointer px-4 py-2 rounded-xl;
}
</style>
