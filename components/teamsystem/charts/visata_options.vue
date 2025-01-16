<template>
    <div class="flex justify-between items-center mb-4">
        <h2 class="text-lg font-bold">{{ props.title }}</h2>
        <div class="flex space-x-2 z-20">
            <slot></slot>
            <div
                class="bg-[#182235] text-[#94a3b8] px-4 py-2 rounded-lg flex items-center space-x-2 border border-[#2e4a67]">
                <div class="text-[#1a76d2] flex items-center space-x-1 focus:outline-none font-bold">Vista
                </div>
                <DropdownMenu :id="`${props.id}_vista`" class="min-w-[6rem]"
                    @change="(e) => { changeAggregationMode(e); }"
                    :label="getOptionValue(aggrigationMode)"
                    :selected-items="[getOptionValue(aggrigationMode)]"
                    :closeOnClick="true"
                    :items="[
                        ...Object.keys(teamSystemMapping.getAggregationModeMap.value).map((i) => getOptionValue(i)),
                    ]"></DropdownMenu>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { useTeamSystemMappings } from "~/composables/teamsystem/teamsystem_mappings";
const teamSystemMapping = useTeamSystemMappings();

const props = defineProps<{ onOptionChange: (e: any) => void; title: string; id: string;mode: string }>();

const aggrigationMode = ref<string>(props.mode ?? "monthly");

const getOptionValue = (value: string) => {
    return teamSystemMapping.getAggregationModeMap.value[value];
};

const changeAggregationMode = (e: any) => {
    const selectedValue = Object.keys(teamSystemMapping.getAggregationModeMap.value).find((key) => teamSystemMapping.getAggregationModeMap.value[key] === e);
    if(selectedValue){
        aggrigationMode.value = selectedValue
        props.onOptionChange(aggrigationMode.value)
    }
};

</script>

<style></style>
