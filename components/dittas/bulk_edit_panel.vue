<template>
    <div class="flex flex-col justify-center w-full gap-4">
        <Info
            >La funazionalità di modifica ditte è in fase di test,
            <span class="font-bold"
                >in caso di problemi riscontrati mandare una mail al supporto al più presto!</span
            ></Info
        >
        <div class="flex flex-col justify-stretch items-center gap-8">
            <InputField label="Collaboratore incaricato"
                ><input v-model="editedDittaModel.appointed_collaborator" placeholder="Nome" type="text"
            /></InputField>
            <InputField label="Tipo di accesso" class="min-w-[30%] items-center"
                ><DropdownMenu
                    class="w-full"
                    id="access_type_dropdown"
                    :label="accessTypeToString(editedDittaModel.access_type) ?? 'Seleziona valore corretto'"
                    :items-formatter="(e:any) => accessTypeToString(e)??''"
                    close-on-click
                    :items="
                        editedDittaModel.profile_data?.enabled_profile_type?.toLocaleLowerCase() === 'individual'
                            ? ['ME_STESSO', 'DELEGA_DIRETTO', 'INCARICATO_DELEGATO', 'INCARICATO_DIRETTAMENTE']
                            : ['INCARICATO_DELEGATO', 'INCARICATO_DIRETTAMENTE']
                    "
                    @change="(e) => (editedDittaModel.access_type = e)"
                ></DropdownMenu
            ></InputField>
            <InputField label="Profilo entratel" class="min-w-[30%] items-center"
                ><DropdownMenu
                    class="w-full"
                    id="entratel_dropdown"
                    :label="
                        editedDittaModel.profile_data?.codice_entratel
                            ? `${editedDittaModel.profile_data?.codice_entratel} (${editedDittaModel.profile_data?.enabled_profile_type})`
                            : 'Seleziona valore corretto'
                    "
                    close-on-click
                    :items="profiles"
                    :items-formatter="(e:any) => `${e.codice_entratel} (${e.enabled_profile_type})`"
                    @change="(e) => (editedDittaModel.profile_data = e)"
                ></DropdownMenu
            ></InputField>
            <InputField label="Intermediario società" class="min-w-[30%] items-center"
                ><DropdownMenu
                    class="w-full"
                    id="intermediario_dropdown"
                    :label="editedDittaModel.collaborator_data?.fiscal_code ?? 'Seleziona valore corretto'"
                    close-on-click
                    :items="[...collaborators, undefined]"
                    :items-formatter="(e:any) => e?.fiscal_code??'Assente'"
                    @change="(e) => (editedDittaModel.collaborator_data = e)"
                ></DropdownMenu
            ></InputField>
        </div>
        <div class="mt-8 w-full flex flex-col items-center justify-center gap-4">
            <div class="flex flex-row gap-16 justify-center">
                <button :disabled="fetching || !canSubmit" @click="submit" class="primary-button">
                    <p>Conferma</p>
                    <icon name="material-symbols:check-circle-outline-rounded" class="size-6"></icon>
                </button>
                <button @click="cancel" class="secondary-button">Ripristina valori</button>
            </div>
            <Transition name="fade" appear mode="out-in">
                <div v-if="fetching" class="flex justify-center w-full">
                    <div class="flex items-center flex-row gap-2">
                        <icon class="size-6" name="line-md:loading-twotone-loop"></icon>
                        <p class="">Aggiornando i dati di {{ dittas.length }} ditte</p>
                    </div>
                </div>
                <div v-else-if="updateSuccess !== undefined">
                    <p :class="{ 'text-green-500': updateSuccess, 'text-red-600': !updateSuccess }">
                        {{ updateSuccess ? "Ditta aggiornata" : "Aggiornamento fallito" }}
                    </p>
                </div></Transition
            >
        </div>
    </div>
</template>

<script lang="ts" setup>
import l from "lodash";

import * as stringUtils from "~/src/common/string";
const updateSuccess = ref<boolean | undefined>(undefined);
const endpoints = useEndpoints();
const cpa = useCpa();
const { api } = useApi();
const props = defineProps<{ dittas: any[]; collaborators: any[]; profiles: any[] }>();
const defaultDittaModel = ref<any>({});
const editedDittaModel = ref<any>({});
const emit = defineEmits<{ (e: "dittaEdited", model: any): void }>();

const fetching = ref(false);

const canSubmit = computed(() => {
    console.log(editedDittaModel.value.access_type);
    return (
        editedDittaModel.value.access_type !== undefined &&
        (editedDittaModel.value.profile_data?.id !== defaultDittaModel.value.profile_data?.id ||
            editedDittaModel.value.collaborator_data?.id !== defaultDittaModel.value.collaborator_data?.id)
    );
});

function cancel() {
    editedDittaModel.value = l.cloneDeep(defaultDittaModel.value);
}

function submit() {
    updateSuccess.value = undefined;

    fetching.value = true;
    api(endpoints.userDittas, {
        method: "PATCH",
        query: { customer_id: cpa.getData.id },
        body: {
            scraper_api_token: cpa.scraperApiAccess,
            dittas: props.dittas.map((ditta: any) => ({
                cpa: Number.parseInt(cpa.getData.id),
                appointing_subject: Number.parseInt(editedDittaModel.value.collaborator_data?.id),
                appointed_collaborator: editedDittaModel.value.appointed_collaborator,
                vat_id: ditta.vat_id,
                codice_fiscale: ditta.codice_fiscale,
                registered_name: ditta.registered_name,
                ditta_number: Number.parseInt(ditta.ditta_number),
                access_type: editedDittaModel.value.access_type,
                enabled_profile: Number.parseInt(editedDittaModel.value.profile_data?.id),
                id: ditta.id,
            })),
        },
        onResponse: async ({ request, response, options }) => {
            if (response.ok) {
                updateSuccess.value = true;
                defaultDittaModel.value = l.cloneDeep(editedDittaModel.value);
                emit("dittaEdited", defaultDittaModel.value);
                console.log(`ditta edit submitted`);
            } else {
                updateSuccess.value = false;
                console.log(`problem with fetching ditta execution details: ${JSON.stringify(response._data)}`);
            }
            fetching.value = false;
        },
        onResponseError({ request, response, options }) {
            updateSuccess.value = false;
            fetching.value = false;
            console.log(`error fetching ditta execution details: ${JSON.stringify(response._data)}`);
        },
    });
}

function accessTypeToString(val: string | undefined): string | undefined {
    if (val === null || val === undefined || val.length <= 0) return val;
    return val
        .split("_")
        .map((e) => stringUtils.capitalize(e))
        .join(" ");
}
</script>

<style lang="css" scoped>
.conto-table {
    @apply outline-none border-none !important;

    th {
        @apply border-t-0 border-l-0 border-r-0 border-b-[2px] border-outline bg-transparent !important;
    }

    td {
        @apply outline-none border-[1px] !important;
    }

    tr {
        @apply outline-none !important;
    }
}
</style>
