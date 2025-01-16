<template>
    <div v-if="mounted" class="flex flex-col flex-grow w-full">
        <Tip>Al momento le impostazioni sono di sola lettura</Tip>
        <div class="wrapper">
            <div class="section">
                <h2 class="flex flex-row items-center gap-2">
                    <icon class="text-accent" name="material-symbols:notifications-rounded"></icon>
                    <p>Sito Web e Pagina Login Software Contabilità</p>
                </h2>

                <div class="mr-24 rounded shadow-md">
                    <table class="conto-table select-none">
                        <thead>
                            <tr>
                                <th>Link tipo</th>
                                <th>Link</th>
                                <th
                                    v-if="
                                        editedSettings.teamsystem_websites_delete_activated &&
                                        editedSettings.teamsystem_websites_edit_activated
                                    "
                                >
                                    Azione
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr
                                v-for="(profile, index) in editedSettings.accesses?.teamsystem_websites"
                                :key="index"
                                class="cursor-pointer pointer-events-auto"
                            >
                                <td class="px-5 py-5 border-b text-sm">Teamsystem link di accesso</td>
                                <td class="px-5 py-5 border-b text-sm">
                                    <div v-if="editingTSWebsiteIndex === index">
                                        <input
                                            v-model="editedTSWebsite[index].teamsystem_link"
                                            placeholder="Teamsystem Website Link"
                                            type="text"
                                        />
                                    </div>
                                    <div v-else>
                                        {{ profile.teamsystem_link }}
                                    </div>
                                </td>
                                <td
                                    class="px-5 py-5 text-sm flex gap-2"
                                    v-if="
                                        editedSettings.teamsystem_websites_delete_activated == true ||
                                        editedSettings.teamsystem_websites_edit_activated
                                    "
                                >
                                    <button
                                        @click="editTeamsystemWebsite(index)"
                                        class="text-teal-300 hover:text-teal-500"
                                        v-if="
                                            editingTSWebsiteIndex !== index &&
                                            editedSettings.teamsystem_websites_edit_activated
                                        "
                                    >
                                        <icon class="text-accent text-2xl" name="material-symbols:edit-square"></icon>
                                    </button>
                                    <button
                                        @click="saveTeamsystemWebsite(index)"
                                        class="text-teal-300 hover:text-teal-500"
                                        v-else
                                    >
                                        <icon class="text-accent text-2xl" name="material-symbols:check"></icon>
                                    </button>
                                    <button
                                        @click="deleteTeamsystemWebsite(index)"
                                        class="text-red-500 hover:text-red-700"
                                        v-if="editedSettings.teamsystem_websites_delete_activated"
                                    >
                                        <icon class="text-accent text-2xl" name="material-symbols:delete"></icon>
                                    </button>
                                </td>
                            </tr>
                            <tr
                                v-for="(profile, index) in editedSettings.accesses?.teamsystem_websites"
                                :key="index"
                                class="cursor-pointer pointer-events-auto"
                            >
                                <td class="px-5 py-5 border-b text-sm">Teamsystem digital link di accesso</td>
                                <td class="px-5 py-5 text-sm">
                                    <div v-if="editingTSDigitalWebsiteIndex === index">
                                        <input
                                            v-model="editedTSDigitalWebsite[index].ts_didgital_link"
                                            placeholder="Teamsystem Digital Website Link"
                                            type="text"
                                        />
                                    </div>
                                    <div v-else>
                                        {{ profile.ts_didgital_link }}
                                    </div>
                                </td>
                                <td
                                    class="px-5 py-5 text-sm flex gap-2"
                                    v-if="
                                        editedSettings.teamsystem_websites_delete_activated == true ||
                                        editedSettings.teamsystem_websites_edit_activated
                                    "
                                >
                                    <button
                                        @click="editTeamsystemDigitalWebsite(index)"
                                        class="text-teal-300 hover:text-teal-500"
                                        v-if="
                                            editingTSDigitalWebsiteIndex !== index &&
                                            editedSettings.teamsystem_websites_edit_activated
                                        "
                                    >
                                        <icon class="text-accent text-2xl" name="material-symbols:edit-square"></icon>
                                    </button>
                                    <button
                                        @click="saveTeamsystemDigitalWebsite(index)"
                                        class="text-teal-300 hover:text-teal-500"
                                        v-else
                                    >
                                        <icon class="text-accent text-2xl" name="material-symbols:check"></icon>
                                    </button>
                                    <button
                                        @click="deleteTeamsystemDigitalWebsite(index)"
                                        class="text-red-500 hover:text-red-700"
                                        v-if="editedSettings.teamsystem_websites_delete_activated"
                                    >
                                        <icon class="text-accent text-2xl" name="material-symbols:delete"></icon>
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    <!-- <div v-if="editedSettings.teamsystem_websites_add_activated" class="flex justify-center mt-4">
                        <button @click="showAddForm = true" class="bg-green-500 text-white p-2 rounded-full">
                            <span class="text-2xl">+</span>
                        </button>
                    </div> -->
                    <!-- <div v-if="showAddForm" class="mt-4 p-4 border rounded">
                        <h3>Aggiungi Nuovo Profilo</h3>
                        <div class="mb-2">
                            <label class="block">Teamsystem link di accesso</label>
                            <input v-model="newProfile.teamsystem_link" class="w-full px-2 py-1 border rounded" />
                        </div>
                        <div class="mb-2">
                            <label class="block">Teamsystem digital link di accesso</label>
                            <input v-model="newProfile.ts_didgital_link" class="w-full px-2 py-1 border rounded" />
                        </div>
                        <button @click="addProfile" class="bg-blue-500 text-white p-2 rounded">Aggiungi</button>
                        <button @click="showAddForm = false" class="bg-red-500 text-white p-2 rounded ml-2">
                            Annulla
                        </button>
                    </div> -->
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";

const endpoints = useEndpoints();
const fetching = ref(false);
const updateSuccess = ref<boolean | undefined>(undefined);

const mounted = useMounted();
const cpa = useCpa();
const editedSettings = ref(cpa.getSettings());

const editingTSWebsiteIndex = ref(-1);
const editingTSDigitalWebsiteIndex = ref(-1);
const editedTSWebsite = ref([...editedSettings.value.accesses?.teamsystem_websites]);
const editedTSDigitalWebsite = ref([...editedSettings.value.accesses?.teamsystem_websites]);

const { api } = useApi();

const editTeamsystemWebsite = (index: number) => {
    editingTSWebsiteIndex.value = index;
};

const editTeamsystemDigitalWebsite = (index: number) => {
    editingTSDigitalWebsiteIndex.value = index;
};

const saveTeamsystemWebsite = (index: number) => {
    updateTeamsystemWebsite(editedTSWebsite.value[index]);
    editingTSWebsiteIndex.value = -1;
};

const saveTeamsystemDigitalWebsite = (index: number) => {
    updateTeamsystemDigitalWebsite(editedTSDigitalWebsite.value[index]);
    editingTSDigitalWebsiteIndex.value = -1;
};

const deleteTeamsystemWebsite = (index: number) => {
    const confirmed = confirm("Sei sicuro di voler eliminare questi dati?");
    if (!confirmed) return;
    editedSettings.value.accesses.teamsystem_websites[index].teamsystem_link = "-";
    updateTeamsystemWebsite(editedTSWebsite.value[index]);
};

const deleteTeamsystemDigitalWebsite = (index: number) => {
    const confirmed = confirm("Sei sicuro di voler eliminare questi dati?");
    if (!confirmed) return;
    editedSettings.value.accesses.teamsystem_websites[index].ts_didgital_link = "-";
    updateTeamsystemDigitalWebsite(editedTSDigitalWebsite.value[index]);
};

function updateTeamsystemWebsite(teamsystem: any) {
    updateSuccess.value = undefined;
    fetching.value = true;
    api(endpoints.userNotificationContact, {
        method: "POST",
        body: {
            operation: "update_teamsystem_website",
            scraper_api_token: cpa.scraperApiAccess,
            teamsystem_website: [
                {
                    teamsystem_link: teamsystem.teamsystem_link,
                    customer_id: Number.parseInt(cpa.getData.id),
                    _settings_id: editedSettings.value.contact_analytics_settings_id,
                },
            ],
        },
        onResponse: async ({ request, response, options }) => {
            if (response.ok) {
                updateSuccess.value = true;
                cpa.setSettings(editedSettings.value); // Update the settings
                console.log(`Teamsystem Website Update Submitted`);
            } else {
                updateSuccess.value = false;
                console.error(
                    `Problem Occured While Updating Teamsystem Website Data: ${JSON.stringify(response._data)}`
                );
            }
            fetching.value = false;
        },
        onResponseError({ request, response, options }) {
            fetching.value = false;
            updateSuccess.value = false;
            console.log(`Problem Occured While Updating Teamsystem Website Data: ${JSON.stringify(response._data)}`);
        },
    });
}

function updateTeamsystemDigitalWebsite(teamsystem_digital: any) {
    updateSuccess.value = undefined;
    fetching.value = true;
    api(endpoints.userNotificationContact, {
        method: "POST",
        body: {
            operation: "update_teamsystem_digital_website",
            scraper_api_token: cpa.scraperApiAccess,
            teamsystem_digital_website: [
                {
                    ts_didgital_link: teamsystem_digital.ts_didgital_link,
                    customer_id: Number.parseInt(cpa.getData.id),
                    _settings_id: editedSettings.value.contact_analytics_settings_id,
                },
            ],
        },
        onResponse: async ({ request, response, options }) => {
            if (response.ok) {
                updateSuccess.value = true;
                cpa.setSettings(editedSettings.value); // Update the settings
                console.log(`Teamsystem Digital Website Update Submitted`);
            } else {
                updateSuccess.value = false;
                console.error(
                    `Problem Occured While Updating Teamsystem Digital Website Data: ${JSON.stringify(response._data)}`
                );
            }
            fetching.value = false;
        },
        onResponseError({ request, response, options }) {
            fetching.value = false;
            updateSuccess.value = false;
            console.log(
                `Problem Occured While Updating Teamsystem Digital Website Data: ${JSON.stringify(response._data)}`
            );
        },
    });
}

// const addProfile = () => {
//     editedSettings.value.accesses.teamsystem_websites.push({ ...newProfile.value });
//     newProfile.value = { teamsystem_link: "", ts_didgital_link: "" };
//     showAddForm.value = false;
// };
</script>

<style lang="css" scoped>
.select {
    @apply my-0 mx-0 px-4 py-3 w-full bg-background border-outline focus:border-accent focus:outline-none border-[2px] rounded-xl;
}
.wrapper {
    @apply flex flex-col items-stretch gap-8 w-full;
}
.section {
    @apply flex flex-col gap-4;
}

.sub-section {
    @apply flex flex-col gap-2;
}
</style>
