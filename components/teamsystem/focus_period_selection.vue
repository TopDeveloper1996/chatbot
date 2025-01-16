<template>

    <div class="w-full  bg-[#1D2231] text-white font-inter">
        <div class="w-full  mx-auto p-4">
            <!-- Header Section -->
            <div class="flex items-center justify-between mb-6">
                <div class="flex space-x-2 z-30">
                    <div
                        class="bg-[#182235] text-[#94a3b8] px-4 py-2 rounded-lg flex items-center space-x-2 border border-[#2e4a67]">
                        <div class="text-[#1a76d2] flex items-center space-x-1 focus:outline-none font-bold">Periodo di
                            riferimento
                        </div>
                        <DropdownMenu id="periodo_di_riferimento" class="min-w-[6rem]"
                            @change="(e) => { changeFocusTimeStam(e); }"
                            :label="focusTimeStamp"
                            :selected-items="[focusTimeStamp]" 
                            :items-formatter="item => item.label"
                            :items="trimestersOptions"></DropdownMenu>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
            
    
    
<script lang="ts" setup>
import * as stringUtils from "~/src/common/string";
import Timespan from "~/src/timespan";
import { TeamSystemLastYearCurrentYearChart } from "~/src/types/teamsystem_types";
const trimestersSince2020 = ref<any>([]);
const props = defineProps<{ chartsData: TeamSystemLastYearCurrentYearChart}>();

const trimestersOptions = computed(() => {
    return trimestersSince2020.value.map((e: any) => {
        return {
            label: e.label,
            value: e.label,
        }
    });
    
});

const getTrimestersSince2020 = async () => {
    const startYear = 2020;
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1; // Months are zero-indexed, so we add 1
    const trimesters = [];

    for (let year = startYear; year <= currentYear; year++) {
        for (let quarter = 1; quarter <= 4; quarter++) {
            // Calculate the quarter's end month
            const endMonth = quarter * 3;
            
            // If we're in the current year, stop adding trimesters once we've reached the current month
            if (year === currentYear && endMonth >= currentMonth) {
                break;
            }

            trimesters.push({
                year,
                quarter,
                start: `${year}-${(endMonth - 2).toString().padStart(2, "0")}`,
                end: `${year}-${endMonth.toString().padStart(2, "0")}`,
                label: `Q${quarter} ${year}`,
            });
        }
    }

    return trimesters;
};
const  focusTimeStamp  = ref<string>("");
const changeFocusTimeStam = (e: any) => {
    console.log(e);
    focusTimeStamp.value = e.label
};


onMounted(async () => {
    trimestersSince2020.value = await getTrimestersSince2020()
    focusTimeStamp.value = trimestersSince2020.value[trimestersSince2020.value.length - 1].label;
});


</script>
