<template>
    <Datepicker
        :max-date="new Date()"
        v-model="dates"
        dark
        :enable-time-picker="false"
        :range="{ partialRange: false }"
    ></Datepicker>
</template>

<script lang="ts" setup>
import Datepicker from "@vuepic/vue-datepicker";
import "@vuepic/vue-datepicker/dist/main.css";
import Timespan from "~/src/timespan";

const dates = ref<Date[]>([]);
const props = defineProps<{ initialTimespan?: Timespan | undefined }>();

const emit = defineEmits<{ (e: "change", timespan: Timespan): void }>();
onMounted(() => {
    if (props.initialTimespan !== undefined) {
        dates.value = [props.initialTimespan.from, props.initialTimespan.to];
    }
});

watch(dates, () => {
    if (dates.value === null) {
        emit("change", Timespan.today());
    } else {
        emit("change", new Timespan(dates.value[0], dates.value[1]));
    }
});
</script>

<style lang="css">
.dp__pointer {
    @apply h-full m-0;
}
.dp__input_wrap {
    @apply h-full w-full !important;
}
.dp__theme_dark {
    --dp-background-color: theme("colors.background");
    --dp-text-color: theme("colors.text");
    --dp-hover-color: theme("colors.surface");
    --dp-hover-text-color: theme("colors.text");
    --dp-hover-icon-color: theme("colors.text");
    --dp-primary-color: theme("colors.accent");
    --dp-primary-disabled-color: #61a8ea;
    --dp-primary-text-color: theme("colors.text");
    --dp-secondary-color: #a9a9a9;
    --dp-border-color: theme("colors.outline");
    --dp-menu-border-color: theme("colors.outline");
    --dp-border-color-hover: theme("colors.accent");
    --dp-disabled-color: #737373;
    --dp-disabled-color-text: #d0d0d0;
    --dp-scroll-bar-background: theme("colors.background");
    --dp-scroll-bar-color: #484848;
    --dp-success-color: #00701a;
    --dp-success-color-disabled: #428f59;
    --dp-icon-color: #959595;
    --dp-danger-color: #e53935;
    --dp-marker-color: #e53935;
    --dp-tooltip-color: #3e3e3e;
    --dp-highlight-color: theme("colors.accent");
    --dp-range-between-dates-background-color: var(--dp-hover-color, #484848);
    --dp-range-between-dates-text-color: var(--dp-hover-text-color, #fff);
    --dp-range-between-border-color: var(--dp-hover-color, #fff);
    --dp-border-radius: 10px;
    --dp-cell-padding: 6px;
    --dp-action-buttons-padding: 4px 12px;
    --dp-row-margin: 8px 4px;
    --dp-font-family: "Poppins";
    --dp-button-height: 40px;
    --dp-cell-size: 40px;
    --dp-common-padding: 8px;
    @apply flex flex-col items-stretch w-full flex-grow;
}
</style>
