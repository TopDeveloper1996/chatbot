<template>
    <FullscreenLoading :display="fetching"></FullscreenLoading>
    <div v-if="mounted" class="flex flex-col flex-grow w-full">
        <Tip>Qui puoi aggiungere, modificare ed eliminare la voce del tuo profilo di ingresso</Tip>
        <div class="wrapper">
            <div class="section">
                <h2 class="flex flex-row items-center gap-2">
                    <icon class="text-accent" name="material-symbols:lock"></icon>
                    <p>Profili Entratel</p>
                </h2>
                <div v-if="logincheck" class="">
                    <p class="mb-4 text-red-500 dark:text-red-400">
                        I dati del profilo Entratel forniti contengono un errore
                    </p>
                </div>
                <div class="mr-24 rounded shadow-md">
                    <table class="conto-table select-none">
                        <thead>
                            <tr>
                                <th>Codice Entratel</th>
                                <th>Tipo profilo</th>
                                <th
                                    v-if="
                                        editedSettings.profile_entranet_delete_activated == true ||
                                        editedSettings.profile_entranet_edit_activated == true
                                    "
                                >
                                    Azione
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr
                                v-for="(profile, index) in editedSettings.entratel"
                                class="cursor-pointer pointer-events-auto"
                            >
                                <td class="px-5 py-5 border-b text-sm">{{ profile.codice_entratel }}</td>
                                <td class="px-5 py-5 border-b text-sm">{{ profile.enabled_profile_type }}</td>
                                <td
                                    class="px-5 py-5 border-b text-sm"
                                    v-if="
                                        editedSettings.profile_entranet_delete_activated == true ||
                                        editedSettings.profile_entranet_edit_activated == true
                                    "
                                >
                                    <button
                                        @click="editProfile(index)"
                                        class="text-teal-300 hover:text-teal-500"
                                        v-if="editingIndex !== index && editedSettings.profile_entranet_edit_activated"
                                    >
                                        <icon class="text-accent text-2xl" name="material-symbols:edit-square"></icon>
                                    </button>

                                    <button
                                        @click="deleteProfile(profile._profile_id)"
                                        class="text-red-500 hover:text-red-700"
                                        v-if="editedSettings.profile_entranet_delete_activated"
                                    >
                                        <icon class="text-accent text-2xl" name="material-symbols:delete"></icon>
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    <div class="flex justify-center mt-4">
                        <button
                            @click="showAddFormAndScroll"
                            class="bg-green-500 text-white p-2 rounded-full"
                            v-if="editedSettings.profile_entranet_add_activated == true"
                        >
                            <span class="text-2xl">+</span>
                        </button>
                    </div>
                    <div v-if="showAddForm" class="di mt-4 p-8 border rounded-xl shadow-md" ref="addForm">
                        <h2 class="flex flex-row items-center gap-2">
                            <icon class="text-accent" name="material-symbols:lock"></icon>
                            <p>Aggiungi Nuovo Profilo</p>
                        </h2>

                        <div class="mb-2">
                            <label for="enabled_profile_type" class="block text-gray-200 text-sm font-bold mb-2"
                                >Tipo Profilo</label
                            >
                            <select id="enabled_profile_type" v-model="newProfile.enabled_profile_type" class="select">
                                <option value="" disabled selected>Seleziona tipo profilo</option>
                                <option value="INDIVIDUAL">Accesso Come Individuo</option>
                                <option value="DITTA">Accesso Come Società</option>
                            </select>
                        </div>
                        <div class="mb-2">
                            <InputField label="Codice fiscale / Nome Utente"
                                ><input
                                    v-model="newProfile.codice_entratel"
                                    placeholder="Codice fiscale / Nome Utente"
                                    type="text"
                            /></InputField>
                        </div>
                        <div class="mb-2">
                            <InputField label="Password"
                                ><input v-model="newProfile.password_1" placeholder="Password" type="text"
                            /></InputField>
                        </div>
                        <div class="mb-2">
                            <InputField label="PIN"
                                ><input v-model="newProfile.password_2" placeholder="PIN" type="text"
                            /></InputField>
                        </div>
                        <div class="mb-2">
                            <InputField label="Codice Segreto"
                                ><input v-model="newProfile.codice_segreto" placeholder="Codice Segreto" type="text"
                            /></InputField>
                        </div>
                        <br />
                        <div class="flex flex-row gap-16 justify-center">
                            <button @click="addProfile" class="primary-button">
                                <p>Aggiungi</p>
                                <icon name="material-symbols:check-circle-outline-rounded" class="size-6"></icon>
                            </button>

                            <button
                                @click="cancelAddProfile"
                                class="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-xl flex items-center"
                            >
                                <p class="mr-2">Annulla</p>
                                <icon name="material-symbols:check-circle-outline-rounded" class="size-6"></icon>
                            </button>
                        </div>
                    </div>
                    <div v-if="showEditForm" class="di mt-4 p-8 border rounded-xl shadow-md" ref="editForm">
                        <h2 class="flex flex-row items-center gap-2">
                            <icon class="text-accent" name="material-symbols:lock"></icon>
                            <p>Aggiungi Nuovo Profilofdgsdfgdfgd</p>
                        </h2>

                        <div class="mb-2">
                            <label for="enabled_profile_type" class="block text-gray-200 text-sm font-bold mb-2"
                                >Tipo Profilo</label
                            >
                            <select
                                id="enabled_profile_type"
                                v-model="edited_profile.enabled_profile_type"
                                class="select"
                            >
                                <option value="" disabled selected>Seleziona tipo profilo</option>
                                <option value="INDIVIDUAL">Accesso Come Individuo</option>
                                <option value="DITTA">Accesso Come Società</option>
                            </select>
                        </div>
                        <div class="mb-2">
                            <InputField label="Codice fiscale / Nome Utente"
                                ><input
                                    v-model="edited_profile.codice_entratel"
                                    placeholder="Codice fiscale / Nome Utente"
                                    type="text"
                            /></InputField>
                        </div>
                        <div class="mb-2">
                            <InputField label="Password"
                                ><input v-model="edited_profile.password_1" placeholder="Password" type="text"
                            /></InputField>
                        </div>
                        <div class="mb-2">
                            <InputField label="PIN"
                                ><input v-model="edited_profile.password_2" placeholder="PIN" type="text"
                            /></InputField>
                        </div>
                        <div class="mb-2">
                            <InputField label="Codice Segreto"
                                ><input
                                    v-model="edited_profile.codice_segreto"
                                    placeholder="Codice Segreto"
                                    type="text"
                            /></InputField>
                        </div>
                        <br />
                        <div class="flex flex-row gap-16 justify-center">
                            <button @click="updateProfile(edited_profile)" class="primary-button">
                                <p>Aggiungi</p>
                                <icon name="material-symbols:check-circle-outline-rounded" class="size-6"></icon>
                            </button>

                            <button
                                @click="cancelEditProfile"
                                class="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-xl flex items-center"
                            >
                                <p class="mr-2">Annulla</p>
                                <icon name="material-symbols:check-circle-outline-rounded" class="size-6"></icon>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { nextTick, ref } from "vue";
import { useCpa } from "~/composables/store/cpa_store";
const emit = defineEmits<{ (e: "entratelAdded", model: any): void }>();

const mounted = useMounted();
const cpa = useCpa();
const editedSettings = ref(cpa.getSettings());
const addForm = ref<HTMLElement | null>(null); // Add a ref for the add form element
const editForm = ref<HTMLElement | null>(null); // Add a ref for the add form element
const editingIndex = ref(-1);
const endpoints = useEndpoints();
const fetching = ref(false);
const updateSuccess = ref<boolean | undefined>(undefined);

const logincheck = ref(false);
let editedProfiles = ref([...editedSettings.value.entratel]);
const { api } = useApi();

const edited_profile = ref({
    _profile_id: "",
    codice_entratel: "",
    password_1: "",
    password_2: "",
    codice_segreto: "",
    enabled_profile_type: "",
});

const editProfile = (index: number) => {
    const profile = editedSettings.value.entratel[index];
    edited_profile.value = { ...profile };
    showEditForm.value = true;
    nextTick(() => {
        editForm.value?.scrollIntoView({ behavior: "smooth" });
    });
};

const showAddForm = ref(false);
const showEditForm = ref(false);
const newProfile = ref({
    _credentials_id: "",
    codice_entratel: "",
    password_1: "",
    password_2: "",
    codice_segreto: "",
    enabled_profile_type: "",
});

const showAddFormAndScroll = () => {
    showAddForm.value = true;
    nextTick(() => {
        addForm.value?.scrollIntoView({ behavior: "smooth" });
    });
};

const cancelAddProfile = () => {
    showAddForm.value = false;
    nextTick(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    });
};

const cancelEditProfile = () => {
    showEditForm.value = false;
    nextTick(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    });
};

function deleteProfile(_profile_id: string) {
    const confirmed = confirm("Sei sicuro di voler eliminare questi dati?");
    if (!confirmed) return;
    updateSuccess.value = undefined;
    fetching.value = true;
    api(endpoints.userNotificationContact, {
        method: "POST",
        body: {
            operation: "delete_entratel_profile",
            scraper_api_token: cpa.scraperApiAccess,
            entratel: {
                _profile_id: _profile_id,
            },
        },
        onResponse: async ({ request, response, options }) => {
            if (response.ok) {
                const index = editedSettings.value.entratel.findIndex(
                    (profile: any) => profile._profile_id === _profile_id
                );
                if (index > -1) {
                    editedSettings.value.entratel.splice(index, 1);
                    cpa.setSettings(editedSettings.value); // Update the settings
                }
                updateSuccess.value = true;
                console.log(`Entratel Profile successfully deleted`);
                console.log(cpa);
                console.log(cpa.scraperApiAccess);
            } else {
                updateSuccess.value = false;
                console.error(`problem with deleting Entratel Profile: ${JSON.stringify(response._data)}`);
            }
            fetching.value = false;
        },
        onResponseError({ request, response, options }) {
            fetching.value = false;
            updateSuccess.value = false;
            console.log(`problem with deleting Entratel Profile: ${JSON.stringify(response._data)}`);
        },
    });
}

const addProfile = () => {
    showAddForm.value = false;
    const entratelModel = {
        _credentials_id: newProfile.value._credentials_id,
        codice_entratel: newProfile.value.codice_entratel,
        password_1: newProfile.value.password_1,
        password_2: newProfile.value.password_2,
        codice_segreto: newProfile.value.codice_segreto,
        enabled_profile_type: newProfile.value.enabled_profile_type,
    };

    updateSuccess.value = undefined;
    fetching.value = true;
    api(endpoints.userNotificationContact, {
        method: "POST",
        body: {
            operation: "add_entratel_profile",
            scraper_api_token: cpa.scraperApiAccess,
            entratel: [
                {
                    cpa: Number.parseInt(cpa.getData.id),
                    codice_entratel: entratelModel.codice_entratel,
                    password_1: entratelModel.password_1,
                    password_2: entratelModel.password_2,
                    codice_segreto: entratelModel.codice_segreto,
                    enabled_profile_type: entratelModel.enabled_profile_type,
                },
            ],
        },
        onResponse: async ({ request, response, options }) => {
            if (response.ok) {
                // newProfile.value = response._data.data.contacts[0];
                let new_profile = {
                    _credentials_id: response._data.data.entratelprofile[0]._credentials_id,
                    codice_entratel: response._data.data.entratelprofile[0].codice_entratel,
                    password_1: response._data.data.entratelprofile[0].password_1,
                    password_2: response._data.data.entratelprofile[0].password_2,
                    codice_segreto: response._data.data.entratelprofile[0].codice_segreto,
                    enabled_profile_type: response._data.data.entratelprofile[0].enabled_profile_type,
                };

                editedSettings.value.entratel.push(new_profile);
                newProfile.value = {
                    _credentials_id: "",
                    codice_entratel: "",
                    password_1: "",
                    password_2: "",
                    codice_segreto: "",
                    enabled_profile_type: "",
                };
                updateSuccess.value = true;
                console.log(`Entratel Profile Submitted`);
                cpa.setSettings(editedSettings.value); // Update the settings
            } else {
                updateSuccess.value = false;
                logincheck.value = true;
                console.error(`Problem Occured While Adding Entratel Profile: ${JSON.stringify(response._data)}`);
            }
            fetching.value = false;
        },
        onResponseError({ request, response, options }) {
            fetching.value = false;
            updateSuccess.value = false;
            console.log(`Problem Occured While Adding Entratel Profile: ${JSON.stringify(response._data)}`);
        },
    });
    // Save new profile to the server or other state management as needed
};

function updateProfile(profile: any) {
    updateSuccess.value = undefined;
    fetching.value = true;
    showEditForm.value = false;

    // Find the index of the profile being updated
    const index = editedSettings.value.entratel.findIndex((p: any) => p._profile_id === profile._profile_id);

    if (index !== -1) {
        // Update the profile at the found index
        editedSettings.value.entratel[index] = { ...profile };
    }

    api(endpoints.userNotificationContact, {
        method: "POST",
        body: {
            operation: "update_entratel_profile",
            scraper_api_token: cpa.scraperApiAccess,
            entratel: [
                {
                    cpa: Number.parseInt(cpa.getData.id),
                    _profile_id: profile._profile_id,
                    codice_entratel: profile.codice_entratel,
                    password_1: profile.password_1,
                    password_2: profile.password_2,
                    codice_segreto: profile.codice_segreto,
                    enabled_profile_type: profile.enabled_profile_type,
                },
            ],
        },
        onResponse: async ({ request, response, options }) => {
            if (response.ok) {
                updateSuccess.value = true;
                cpa.setSettings(editedSettings.value); // Update the settings
                console.log(`Entratel Profile Update Submitted`);
            } else {
                updateSuccess.value = false;
                console.error(`Problem Occured While Updating Entratel Profile: ${JSON.stringify(response._data)}`);
            }
            fetching.value = false;
        },
        onResponseError({ request, response, options }) {
            fetching.value = false;
            updateSuccess.value = false;
            console.log(`Problem Occured While Updating Entratel Profile: ${JSON.stringify(response._data)}`);
        },
    });
}
</script>

<style lang="css" scoped>
.wrapper {
    @apply flex flex-col items-stretch gap-8 w-full;
}

.section {
    @apply flex flex-col gap-4;
}

.sub-section {
    @apply flex flex-col gap-2;
}

.select {
    @apply my-0 mx-0 px-4 py-3 w-full bg-background border-outline focus:border-accent focus:outline-none border-[2px] rounded-xl;
}
.di {
    border-color: rgb(26, 161, 224, 0.5) !important;
}
</style>
