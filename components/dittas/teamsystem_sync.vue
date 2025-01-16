<template>
    <div class="flex flex-col">
        <div class="flex flex-col justify-center w-full">
            <table class="conto-table select-none">
                <thead>
                    <tr>
                        <th>Numero ditta</th>
                        <th>Nome</th>
                        <th>Sync period</th>
                        <th>Azione</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(ditta, dittaIndex) in props.dittas" :key="dittaIndex">
                        <td>{{ ditta.ditta_number }}</td>
                        <td>{{ stringUtils.wordCapitalize(ditta.registered_name) }}</td>
                        <td>

                            <StyledMonthsrangePicker
                                :value="ditta.sync_months"
                                @change="(e) => (ditta.sync_months = e)"
                            ></StyledMonthsrangePicker>
                        </td>
                        <td>
                                    <button
                                        @click="() => props.dittas.splice(dittaIndex, 1)"
                                        class="secondary-button"
                                    >
                                        Remove
                                    </button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
            <div class="mt-8 w-full flex flex-col items-center justify-center gap-4">
                <div class="flex flex-row gap-16 justify-center">
                    <button :disabled="!canSubmit || fetching" @click="submit" class="primary-button">
                        <p>Conferma</p>
                        <icon name="material-symbols:check-circle-outline-rounded" class="size-6"></icon>
                    </button>
                </div>
                <Transition name="fade" appear mode="out-in">
                    <div v-if="fetching" class="flex justify-center w-full">
                        <div class="flex items-center flex-row gap-2">
                            <icon class="size-6" name="line-md:loading-twotone-loop"></icon>
                            <p class="">Aggiungendo la ditta</p>
                        </div>
                    </div>
                    <div v-else-if="updateSuccess !== undefined">
                        <p :class="{ 'text-green-500': updateSuccess, 'text-red-600': !updateSuccess }">
                            {{ updateSuccess ? "Ditta inserita" : "Inserimento fallito" }}
                        </p>
                    </div></Transition
                >
        </div>
    </div>
</template>

<script lang="ts" setup>
import * as stringUtils from "~/src/common/string";
import { formatDate } from "~/src/common/dates";
const endpoints = useEndpoints();
const { api } = useApi();
const cpa = useCpa();
const fetching = ref(false);
const updateSuccess = ref<boolean | undefined>(undefined);
const props = defineProps<{ dittas: any[]; }>();
const emit = defineEmits<{ (e: "dittaSyncStarted", model: any): void }>();


function isFilled(val: string) {
    return val !== undefined && val !== null && val.toString().length > 0;
}

const canSubmit = computed(() => {
    return props.dittas.every((e) => isFilled(e.sync_months));
});

function submit() {
    props.dittas.forEach((ditta) => {
        const startDate = ditta.sync_months.from;
        const endDate = ditta.sync_months.to
        api(endpoints.teamSystem, {
            method: "POST",
            query: { customer_id: cpa.getData.id,
                    ditta_id: ditta.id,
                    start_date: formatDate(startDate, "ddMMyyyy"),
                    end_date: formatDate(endDate, "ddMMyyyy"),
                    operation: "start_ts_async"
                    },
            });
    });
    emit("dittaSyncStarted", {});
};

</script>
