<template>
    <div class="flex flex-col items-start">
        <div class="flex flex-row items-center gap-4 w-full text-nowrap h-[4rem]">
            <icon class="size-8" name="material-symbols:calendar-clock-rounded"></icon>
            <div>
                <DropdownMenu
                    :id="props.id"
                    class="w-[12rem] h-[3rem]"
                    :label="currentFilter.toString()"
                    @change="filterChanged"
                    :items="filtersElements"
                    close-on-click
                ></DropdownMenu>
            </div>
            <StyledDaterangePicker
                :key="dateRangeKey"
                class="h-[3rem]"
                @change="dateRangeChange"
                :initial-timespan="customTimespan"
                v-show="isCustomPeriod"
            ></StyledDaterangePicker>
        </div>
    </div>
</template>

<script lang="ts" setup>
import DateFilter from "~/src/date_filter";
import Timespan from "~/src/timespan";
const customFilter = new DateFilter("custom", "Personalizzato", (now) => customTimespan.value);
const filters = [...Object.values(DateFilter.filters), customFilter];
const customTimespan = ref<Timespan>(Timespan.thisYear());
const isCustomPeriod = ref(false);
const currentFilter = ref(DateFilter.filters.All);
const filtersElements = ref<any[]>([]);
const dateRangeKey = ref(0);
const props = defineProps<{
    id: string;
    initialFilter?: string;
}>();

const emit = defineEmits<{ (e: "timespanChange", value: Timespan): void }>();

onMounted(() => {
    for (const f of filters) {
        filtersElements.value.push(f);
    }
    const match = Object.entries(filters).find((f) => f[1].id === props.initialFilter);
    if (match) {
        currentFilter.value = match[1];
    }
    // if (filterModel.value) {
    //     currentFilter.value = filterModel.value;
    //     if (filterModel.value.id == filters.Custom.id) {
    //         isCustomPeriod.value = true;
    //         customTimespan.value = filterModel.value.getTimespan();
    //         dateRangeKey.value %= 2;
    //     }
    //     emit("timespanChange", currentFilter.value.getTimespan());
    // }
});

function filterChanged(val: any) {
    isCustomPeriod.value = val.id == customFilter.id;
    currentFilter.value = val;
    emit("timespanChange", currentFilter.value.getTimespan());
}

function dateRangeChange(ts: Timespan) {
    customTimespan.value = ts;
    emit("timespanChange", currentFilter.value.getTimespan());
}
</script>

<style></style>
