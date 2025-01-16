<template>
    <div class="flex flex-col">
        <Info
            >La funazionalità di inserimento ditta è in fase di test,
            <span class="font-bold"
                >in caso di problemi riscontrati mandare una mail al supporto al più presto!</span
            ></Info
        >
        <div class="flex flex-col justify-center w-full grid gap-4 grid-cols-2">
            <InputField label="Partita IVA"
                ><input v-model="dittaModel.vat_id" placeholder="Partita IVA" type="text"
            /></InputField>
            <InputField label="Codice Fiscale"
                ><input v-model="dittaModel.codice_fiscale" placeholder="Codice fiscale" type="text"
            /></InputField>
            <InputField label="Nome registrato"
                ><input v-model="dittaModel.registered_name" placeholder="Nome registrato" type="text"
            /></InputField>
            <InputField label="Numero ditta"
                ><input v-model="dittaModel.ditta_number" placeholder="Numero ditta" type="number" /></InputField
            ><InputField label="Collaboratore incaricato"
                ><input v-model="dittaModel.appointed_collaborator" placeholder="Nome" type="text"
            /></InputField>
            <InputField label="Codice ATECO">
                <input v-model="dittaModel.ateco_code" placeholder="Codice ATECO" type="text" />
            </InputField>
            <InputField label="Descrizione Codice ATECO">
                <input v-model="dittaModel.ateco_description" placeholder="Descrizione Codice ATECO" type="text" />
            </InputField>
            <InputField label="Input di Processo">
                <input v-model="dittaModel.process_inputs" placeholder="Cosa consuma per produrre" type="text" />
            </InputField>
            <InputField label="Tipologia di processo produttivo">
                <input v-model="dittaModel.business_process_type" placeholder="Come produce" type="text" />
            </InputField>
            <InputField label="Tipo di output, beni o servizio prodotto">
                <input v-model="dittaModel.business_process_output" placeholder="cosa produce" type="text" />
            </InputField>
            <InputField label="Distribuzione">
                <input v-model="dittaModel.good_or_service_distribution " placeholder="commercio al dettaglio , commercio all’ ingrosso, vendita diretta" type="text" />
            </InputField>
            <InputField label="Descrizione clienti">
                <input v-model="dittaModel.customers_description" placeholder="Chi sono i clienti" type="text" />
            </InputField>
        </div>
        <div class="flex flex-col w-full gap-4 p-10">
            <div class="flex flex-row justify-evenly">
                <InputField label="Tipologia Contabilita" class="items-center">
                    <DropdownMenu id="accounting_type" class="min-w-[6rem]"
                            :label="dittaMappings.getAccountingTypeMap.value[dittaModel.accounting_type] ?? 'Seleziona valore corretto'"
                            @change="(e) => dittaModel.accounting_type = [e.toLocaleLowerCase()]" 
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
                            :label="settingsMappings.getTeamSystemFrequencyMap.value[dittaModel.vista_teamsystem_frequency] ?? 'Seleziona valore corretto'" 
                            @change="(e) => dittaModel.vista_teamsystem_frequency = [e.toLocaleLowerCase()]" 
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
                        id="access_type_dropdown"
                        :label="accessTypeToString(dittaModel.access_type) ?? 'Seleziona valore corretto'"
                        :items-formatter="(e:any) => accessTypeToString(e)??''"
                        close-on-click
                        :items="
                            dittaModel.profile_data?.enabled_profile_type?.toLocaleLowerCase() === 'individual'
                                ? ['ME_STESSO', 'DELEGA_DIRETTO', 'INCARICATO_DELEGATO', 'INCARICATO_DIRETTAMENTE']
                                : ['INCARICATO_DELEGATO', 'INCARICATO_DIRETTAMENTE']
                        "
                        @change="(e) => (dittaModel.access_type = e)"
                    ></DropdownMenu
                ></InputField>
                <InputField label="Profilo entratel" class="items-center"
                    ><DropdownMenu
                        id="entratel_dropdown"
                        :label="
                            dittaModel.profile_data?.codice_entratel
                                ? `${dittaModel.profile_data?.codice_entratel} (${dittaModel.profile_data?.enabled_profile_type})`
                                : 'Seleziona valore corretto'
                        "
                        close-on-click
                        :items="profiles"
                        :items-formatter="(e:any) => `${e.codice_entratel} (${e.enabled_profile_type})`"
                        @change="(e) => (dittaModel.profile_data = e)"
                    ></DropdownMenu
                ></InputField>
                <InputField label="Intermediario società" class="items-center"
                    ><DropdownMenu
                        id="intermediario_dropdown"
                        :label="dittaModel.collaborator_data?.fiscal_code ?? 'Seleziona valore corretto'"
                        close-on-click
                        :items="[...collaborators, undefined]"
                        :items-formatter="(e:any) => e?.fiscal_code??'Assente'"
                        @change="(e) => (dittaModel.collaborator_data = e)"
                    ></DropdownMenu
                ></InputField>
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
    </div>
</template>

<script lang="ts" setup>
import * as stringUtils from "~/src/common/string";
import { useSettingsMappings } from "~/composables/settings/settings_mappings";
import {useDittaMappings} from "~/composables/ditta/ditta_mappings";
const settingsMappings = useSettingsMappings();
const dittaMappings = useDittaMappings();
const endpoints = useEndpoints();
const { api } = useApi();
const cpa = useCpa();
const fetching = ref(false);
const dittaModel = ref<any>({});
const updateSuccess = ref<boolean | undefined>(undefined);
const props = defineProps<{ collaborators: any[]; profiles: any[] }>();

const emit = defineEmits<{ (e: "dittaAdded", model: any): void }>();


function isFilled(val: string) {
    return val !== undefined && val !== null && val.toString().length > 0;
}

const canSubmit = computed(() => {
    return [
        dittaModel.value.ditta_number,
        dittaModel.value.registered_name,
        dittaModel.value.vat_id,
        dittaModel.value.codice_fiscale,
        dittaModel.value.access_type,
        dittaModel.value.profile_data,
        dittaModel.value.accounting_type,
        dittaModel.value.vista_teamsystem_frequency,
        dittaModel.value.ateco_code,
        dittaModel.value.ateco_description
    ].every((e) => isFilled(e));
});

function submit() {
    updateSuccess.value = undefined;
    fetching.value = true;
    api(endpoints.userDittas, {
        method: "POST",
        query: { customer_id: cpa.getData.id },
        body: {
            scraper_api_token: cpa.scraperApiAccess,
            dittas: [
                {
                    vat_id: dittaModel.value.vat_id,
                    codice_fiscale: dittaModel.value.codice_fiscale,
                    cpa: Number.parseInt(cpa.getData.id),
                    registered_name: dittaModel.value.registered_name,
                    ditta_number: Number.parseInt(dittaModel.value.ditta_number),
                    enabled_profile: Number.parseInt(dittaModel.value.profile_data?.id),
                    access_type: dittaModel.value.access_type,
                    appointing_subject: Number.parseInt(dittaModel.value.collaborator_data?.id),
                    appointed_collaborator: dittaModel.value.appointed_collaborator,
                    accounting_type: dittaModel.value.accounting_type[0],
                    vista_teamsystem_frequency: dittaModel.value.vista_teamsystem_frequency[0],
                    ateco_code: dittaModel.value.ateco_code,
                    ateco_description: dittaModel.value.ateco_description,
                    process_inputs: dittaModel.value.process_inputs,
                    business_process_type: dittaModel.value.business_process_type,
                    business_process_output: dittaModel.value.business_process_output,
                    good_or_service_distribution: dittaModel.value.good_or_service_distribution,
                    customers_description: dittaModel.value.customers_description,
                },
            ],
        },
        onResponse: async ({ request, response, options }) => {
            if (response.ok) {
                updateSuccess.value = true;
                emit("dittaAdded", dittaModel.value);
                console.log(`ditta add submitted`);
            } else {
                updateSuccess.value = false;
                console.error(`problem with adding ditta: ${JSON.stringify(response._data)}`);
            }
            fetching.value = false;
        },
        onResponseError({ request, response, options }) {
            fetching.value = false;
            updateSuccess.value = false;
            console.log(`problem with adding ditta: ${JSON.stringify(response._data)}`);
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

<style></style>
