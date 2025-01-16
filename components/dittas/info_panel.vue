<template>
    <div class="flex flex-col">
        <Info
            >La funazionalità di modifica ditte è in fase di test,
            <span class="font-bold"
                >in caso di problemi riscontrati mandare una mail al supporto al più presto!</span
            ></Info
        >
        <div
            class="mb-8 flex flex-row gap-4 items-center w-full text-xl text-[#AD1F4E] justify-center"
            v-if="!dittaModel.is_delega_exist"
        >
            <icon name="material-symbols:error-circle-rounded" class="size-12"></icon>
            <p class="font-bold">
                Questa ditta ha uno o più problemi: delega non valida, download mancante, partita IVA non valida,
                incaricato delegato non valido, manca il codice segreto
            </p>
        </div>
        <div class="flex flex-row gap-4 items-center mb-4">
            <icon name="material-symbols:bolt-rounded" class="size-8 text-accent"></icon>
            <p class="text-xl">Esecuzioni</p>
        </div>
        <table class="conto-table flex-1 h-min min-w-[12rem]">
            <thead>
                <tr>
                    <th>Funzionalità</th>
                    <th>Data</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td class="font-bold">Esecuzione Scraper</td>
                    <td class="font-bold" :class="getExecutionDateColor(defaultDittaModel.executions?.scraper)">
                        {{ nullableDateField(defaultDittaModel.executions?.scraper) }}
                    </td>
                </tr>
                <tr>
                    <td>Fatture attive</td>
                    <td class="font-bold" :class="getExecutionDateColor(defaultDittaModel.executions?.active)">
                        {{ nullableDateField(defaultDittaModel.executions?.active) }}
                    </td>
                </tr>
                <tr>
                    <td>Fatture passive</td>
                    <td class="font-bold" :class="getExecutionDateColor(defaultDittaModel.executions?.passive)">
                        {{ nullableDateField(defaultDittaModel.executions?.passive) }}
                    </td>
                </tr>
                <tr>
                    <td>Corrispettivi</td>
                    <td class="font-bold" :class="getExecutionDateColor(defaultDittaModel.executions?.corrispettivi)">
                        {{ nullableDateField(defaultDittaModel.executions?.corrispettivi) }}
                    </td>
                </tr>
                <tr>
                    <td class="font-bold">Esecuzione Cassetto Fiscale</td>
                    <td class="font-bold" :class="getExecutionDateColor(defaultDittaModel.executions?.scraper)">
                        {{ nullableDateField(defaultDittaModel.executions?.f24) }}
                    </td>
                </tr>
                <tr>
                    <td>F24</td>
                    <td class="font-bold" :class="getExecutionDateColor(defaultDittaModel.executions?.f24)">
                        {{ nullableDateField(defaultDittaModel.executions?.f24) }}
                    </td>
                </tr>
            </tbody>
        </table>
    </div>

    <div class="flex flex-row gap-4 items-center mt-6 mb-4">
        <icon name="material-symbols:edit-rounded" class="size-8 text-accent"></icon>
        <div>
            <p class="text-xl">Dettagli ditta</p>
            <p class="font-light">
                Modifica i campi per cambiare i dati, clicca il bottone conferma in basse per confermare i cambiamenti
            </p>
        </div>
    </div>
    <div class="flex flex-col justify-center w-full gap-4 grid gap-4 grid-cols-2">
        <InputField label="Partita IVA"
            ><input v-model="editedDittaModel.vat_id" placeholder="Partita IVA" type="text"
        /></InputField>
        <InputField label="Codice Fiscale"
            ><input v-model="editedDittaModel.codice_fiscale" placeholder="Codice fiscale" type="text"
        /></InputField>
        <InputField label="Nome registrato"
            ><input v-model="editedDittaModel.registered_name" placeholder="Nome registrato" type="text"
        /></InputField>
        <InputField label="Numero ditta"
            ><input v-model="editedDittaModel.ditta_number" placeholder="Numero ditta" type="number"
        /></InputField>
        <InputField label="Collaboratore incaricato"
            ><input v-model="editedDittaModel.appointed_collaborator" placeholder="Nome" type="text"
        /></InputField>
        <InputField label="Codice ATECO">
                <input v-model="editedDittaModel.ateco_code" placeholder="Codice ATECO" type="text" />
            </InputField>
        <InputField label="Descrizione Codice ATECO">
            <input v-model="editedDittaModel.ateco_description" placeholder="Descrizione Codice ATECO" type="text" />
        </InputField>
        <InputField label="Input di Processo">
            <input v-model="editedDittaModel.process_inputs" placeholder="Cosa consuma per produrre" type="text" />
        </InputField>
        <InputField label="Tipologia di processo produttivo">
            <input v-model="editedDittaModel.business_process_type" placeholder="Come produce" type="text" />
        </InputField>
        <InputField label="Tipo di output, beni o servizio prodotto">
            <input v-model="editedDittaModel.business_process_output" placeholder="cosa produce" type="text" />
        </InputField>
        <InputField label="Distribuzione">
            <input v-model="editedDittaModel.good_or_service_distribution " placeholder="commercio al dettaglio , commercio all’ ingrosso, vendita diretta" type="text" />
        </InputField>
        <InputField label="Descrizione clienti">
            <input v-model="editedDittaModel.customers_description" placeholder="Chi sono i clienti" type="text" />
        </InputField>
    </div>
    <div class="flex flex-col w-full gap-4 p-10">
        <div class="flex flex-row justify-evenly">
            <InputField label="Tipologia Contabilita" class="items-center">
                    <DropdownMenu id="accounting_type" class="min-w-[6rem]"
                            :label="dittaMappings.getAccountingTypeMap.value[editedDittaModel.accounting_type] ?? 'Seleziona valore corretto'"
                            @change="(e) => editedDittaModel.accounting_type = [e.toLocaleLowerCase()]" 
                            :items="[
                                ...Object.keys(dittaMappings.getAccountingTypeMap.value).map((i) =>
                                    i
                                ),
                            ]"
                            :itemsFormatter="(e: any) => dittaMappings.getAccountingTypeMap.value[e]"
                            close-on-click
                            ></DropdownMenu>
                </InputField>
                <InputField label="Integrazione Teamsystem" class="items-center">
                    <DropdownMenu id="teamsystemdropdown" class="min-w-[6rem]"
                            :label="settingsMappings.getTeamSystemFrequencyMap.value[editedDittaModel.vista_teamsystem_frequency] ?? 'Seleziona valore corretto'" 
                            @change="(e) => editedDittaModel.vista_teamsystem_frequency = [e.toLocaleLowerCase()]" 
                            :items="[
                                ...Object.keys(settingsMappings.getTeamSystemFrequencyMap.value).map((i) =>
                                    i
                                ),
                            ]"
                            :itemsFormatter="(e: any) => settingsMappings.getTeamSystemFrequencyMap.value[e]"
                            close-on-click
                            ></DropdownMenu>
                </InputField>
            <InputField label="Tipo di accesso" class="items-center"
                ><DropdownMenu
                    class="w-full"
                    id="access_type_dropdown"
                    :label="accessTypeToString(editedDittaModel.access_type) ?? 'Assente'"
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
            <InputField label="Profilo entratel" class="items-center"
                ><DropdownMenu
                    class="w-full"
                    id="entratel_dropdown"
                    :label="`${editedDittaModel.profile_data?.codice_entratel} (${editedDittaModel.profile_data?.enabled_profile_type})`"
                    close-on-click
                    :items="profiles"
                    :items-formatter="(e:any) => `${e.codice_entratel} (${e.enabled_profile_type})`"
                    @change="(e) => (editedDittaModel.profile_data = e)"
                ></DropdownMenu
            ></InputField>
            <InputField label="Intermediario società" class="items-center"
                ><DropdownMenu
                    class="w-full"
                    id="intermediario_dropdown"
                    :label="editedDittaModel.collaborator_data?.fiscal_code ?? 'Assente'"
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
                <button :disabled="fetching || !canSubmit" @click="cancel" class="secondary-button">
                    Ripristina valori
                </button>
            </div>
            <div class="divider"></div>
            <button
                @click="() => deleteModalSheetConfirm.toggle(true, { title: 'Cancella ditta' })"
                class="primary-button delete-button"
            >
                <p>Elimina ditta</p>
                <icon name="material-symbols:delete-rounded" class="size-6"></icon>
            </button>
            <Transition name="fade" appear mode="out-in">
                <div v-if="fetching" class="flex justify-center w-full">
                    <div class="flex items-center flex-row gap-2">
                        <icon class="size-6" name="line-md:loading-twotone-loop"></icon>
                        <p class="">Aggiornando i dati</p>
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
    <ModalSheet :controller="deleteModalSheetConfirm" height="50%">
        <div class="flex flex-col gap-4 items-center">
            <h1>Sei sicuro di voler cancellare la ditta?</h1>
            <div class="flex flex-row justify-center items-center gap-8">
                <button @click="deleteDitta" class="primary-button delete-button">Cancella</button>
                <button @click="() => deleteModalSheetConfirm.toggle(false)" class="secondary-button">Annulla</button>
            </div>
        </div>
    </ModalSheet>
</template>

<script lang="ts" setup>
import l from "lodash";
import * as stringUtils from "~/src/common/string";
import { useSettingsMappings } from "~/composables/settings/settings_mappings";
import {useDittaMappings} from "~/composables/ditta/ditta_mappings";


const settingsMappings = useSettingsMappings();
const dittaMappings = useDittaMappings();

const deleteModalSheetConfirm = useModalSheet();
const endpoints = useEndpoints();
const { api } = useApi();
const cpa = useCpa();
const fetching = ref(false);
const updateSuccess = ref<boolean | undefined>(undefined);
const props = defineProps<{ dittaModel: any; collaborators: any[]; profiles: any[] }>();
const defaultDittaModel = ref<any>(l.cloneDeep(props.dittaModel));
const editedDittaModel = ref<any>(l.cloneDeep(props.dittaModel));
const emit = defineEmits<{ (e: "dittaEdited", model: any): void; (e: "dittaDeleted", id: string): void }>();

function nullableDateField(field: string | undefined | Date): string {
    if (!field) return "";
    try {
        return new Date(field).toLocaleString();
    } catch (e) {
        return "";
    }
}

function deleteDitta() {
    updateSuccess.value = undefined;
    fetching.value = true;
    api(endpoints.userDittas, {
        method: "DELETE",
        query: { customer_id: cpa.getData.id },
        body: {
            scraper_api_token: cpa.scraperApiAccess,
            dittas: [
                {
                    id: defaultDittaModel.value.id,
                },
            ],
        },
        onResponse: async ({ request, response, options }) => {
            if (response.ok) {
                updateSuccess.value = true;
                defaultDittaModel.value = l.cloneDeep(editedDittaModel.value);
                emit("dittaDeleted", defaultDittaModel.value.id);
                console.log(`ditta delete submitted`);
            } else {
                updateSuccess.value = false;
                console.log(`problem with fetching ditta execution details: ${JSON.stringify(response._data)}`);
            }
            fetching.value = false;
        },
        onResponseError({ request, response, options }) {
            fetching.value = false;
            updateSuccess.value = false;
            console.log(`error fetching ditta execution details: ${JSON.stringify(response._data)}`);
        },
    });
    deleteModalSheetConfirm.toggle(false);
}

function isFilled(val: string) {
    return val !== undefined && val !== null && val.toString().length > 0;
}
const canSubmit = computed(() => {
    return (
        [
            editedDittaModel.value.ditta_number,
            editedDittaModel.value.registered_name,
            editedDittaModel.value.vat_id,
            editedDittaModel.value.codice_fiscale,
            editedDittaModel.value.access_type,
            editedDittaModel.value.ateco_code,
            editedDittaModel.value.accounting_type,
            editedDittaModel.value.vista_teamsystem_frequency,
        ].every((e) => isFilled(e))
        
    );
});

// (![
//             "appointed_collaborator",
//             "ditta_number",
//             "registered_name",
//             "vat_id",
//             "codice_fiscale",
//             "access_type",
//         ].every((e) => editedDittaModel.value[e] === defaultDittaModel.value[e]) ||
//             editedDittaModel.value.profile_data?.id !== defaultDittaModel.value.profile_data?.id ||
//             editedDittaModel.value.collaborator_data?.id !== defaultDittaModel.value.collaborator_data?.id)

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
            dittas: [
                {
                    id: defaultDittaModel.value.id,
                    cpa: Number.parseInt(cpa.getData.id),
                    appointing_subject: Number.parseInt(editedDittaModel.value.collaborator_data?.id),
                    vat_id: editedDittaModel.value.vat_id,
                    codice_fiscale: editedDittaModel.value.codice_fiscale,
                    registered_name: editedDittaModel.value.registered_name,
                    ditta_number: Number.parseInt(editedDittaModel.value.ditta_number),
                    access_type: editedDittaModel.value.access_type,
                    enabled_profile: Number.parseInt(editedDittaModel.value.profile_data?.id),
                    appointed_collaborator: editedDittaModel.value.appointed_collaborator,
                    ateco_code: editedDittaModel.value.ateco_code,
                    accounting_type: Array.isArray(editedDittaModel.value.accounting_type) ? editedDittaModel.value.accounting_type[0] : editedDittaModel.value.accounting_type,
                    vista_teamsystem_frequency: Array.isArray(editedDittaModel.value.vista_teamsystem_frequency) ? editedDittaModel.value.vista_teamsystem_frequency[0] : editedDittaModel.value.vista_teamsystem_frequency,
                    ateco_description: editedDittaModel.value.ateco_description,
                    process_inputs: editedDittaModel.value.process_inputs,
                    business_process_type: editedDittaModel.value.business_process_type,
                    business_process_output: editedDittaModel.value.business_process_output,
                    good_or_service_distribution: editedDittaModel.value.good_or_service_distribution,
                    customers_description: editedDittaModel.value.customers_description,
                },
            ],
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
            fetching.value = false;
            updateSuccess.value = false;
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
function getExecutionDateColor(date: Date | undefined | null) {
    if (!date) return "text-red-600";

    let now = Date.now();
    let diff = now - date.getTime();
    if (diff < 2 * 86400 * 1000) {
        return "text-green-600";
    }
    if (diff < 5 * 86400 * 1000) {
        return "text-yellow-600";
    }
    if (diff < 7 * 86400 * 1000) {
        return "text-orange-600";
    }
    return "text-red-600";
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

.delete-button {
    @apply bg-red-800 border-red-800 !important;
}
</style>
