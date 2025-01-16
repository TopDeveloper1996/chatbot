<template>
    <div v-if="mounted" class="flex flex-col flex-grow w-full">
        <Tip>Qui puoi aggiungere, modificare ed eliminare i contatti per l'analisi</Tip>
        <div class="wrapper">
            <div class="section">
                <h2 class="flex flex-row items-center gap-2">
                    <icon class="text-accent" name="material-symbols:lock"></icon>
                    <p>Contatti per analitica</p>
                </h2>
                <div class="mr-24 rounded shadow-md">
                    <table class="conto-table select-none">
                        <thead>
                            <tr>
                                <th>Contatti per analitica</th>
                                <th
                                    v-if="
                                        settings_data.analytics_delete_activated == true ||
                                        settings_data.analytics_edit_activated == true
                                    "
                                >
                                    Azione
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr
                                v-for="(analytics_contact, index) in settings_data.contact_analytics"
                                :key="index"
                                class="cursor-pointer pointer-events-auto"
                            >
                                <td class="px-5 py-5 border-b text-sm">
                                    <div v-if="editing_analytics_index === index">
                                        <input
                                            v-model="edited_analytics_contact2[index]"
                                            placeholder="Nome"
                                            type="text"
                                            hidden
                                        />
                                        <input
                                            v-model="edited_analytics_contact[index]"
                                            placeholder="Nome"
                                            type="text"
                                        />
                                    </div>
                                    <div v-else>
                                        {{ analytics_contact }}
                                    </div>
                                </td>
                                <td
                                    class="px-5 py-5 text-sm flex gap-2"
                                    v-if="
                                        settings_data.analytics_delete_activated == true ||
                                        settings_data.analytics_edit_activated == true
                                    "
                                >
                                    <button
                                        @click="edit_analytics_contact(index)"
                                        class="text-teal-300 hover:text-teal-500"
                                        v-if="
                                            editing_analytics_index !== index && settings_data.analytics_edit_activated
                                        "
                                    >
                                        <icon class="text-accent text-2xl" name="material-symbols:edit-square"></icon>
                                    </button>
                                    <button
                                        @click="save_analytics_contact(index)"
                                        class="text-teal-300 hover:text-teal-500"
                                        v-else
                                    >
                                        <icon class="text-accent text-2xl" name="material-symbols:check"></icon>
                                    </button>
                                    <button
                                        @click="delete_analytics_contact(analytics_contact)"
                                        class="text-red-500 hover:text-red-700"
                                        v-if="settings_data.analytics_delete_activated"
                                    >
                                        <icon class="text-accent text-2xl" name="material-symbols:delete"></icon>
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    <div class="flex justify-center mt-4">
                        <button
                            @click="show_add_form_and_Scroll"
                            class="bg-green-500 text-white p-2 rounded-full"
                            v-if="settings_data.analytics_add_activated == true"
                        >
                            <span class="text-2xl">+</span>
                        </button>
                    </div>
                    <div v-if="showAddForm" class="di mt-4 p-8 border rounded-xl shadow-md" ref="addForm">
                        <h2 class="flex flex-row items-center gap-2">
                            <icon class="text-accent" name="material-symbols:lock"></icon>
                            <p>Aggiungi Nuovo Contatti per analitica</p>
                        </h2>

                        <div class="mb-2">
                            <InputField label="Codice fiscale / Nome Utente"
                                ><input
                                    v-model="new_data.gmail_looker_board"
                                    placeholder="Inserisci un indirizzo e-mail"
                                    type="text"
                            /></InputField>
                        </div>

                        <br />
                        <div class="flex flex-row gap-16 justify-center">
                            <button @click="add_analytics_contact" class="primary-button">
                                <p>Aggiungi</p>
                                <icon name="material-symbols:check-circle-outline-rounded" class="size-6"></icon>
                            </button>

                            <button
                                @click="cancel_add_form"
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
import { nextTick, ref, watchEffect } from "vue";
// import { useCpa } from '~/composables/store/cpa_store';

const endpoints = useEndpoints();
const fetching = ref(false);
const updateSuccess = ref<boolean | undefined>(undefined);

const mounted = useMounted();
const cpa = useCpa();
let settings_data = ref(cpa.getSettings());

const editing_analytics_index = ref(-1);
const showAddForm = ref(false);
const addForm = ref<HTMLElement | null>(null); // Add a ref for the add form element
const new_data = ref({
    _setting_id: "",
    gmail_looker_board: "",
});
let edited_analytics_contact = ref([...(settings_data.value.contact_analytics ?? [])]);
let edited_analytics_contact2 = ref([...(settings_data.value.contact_analytics ?? [])]);
const { api } = useApi();

const edit_analytics_contact = (index: number) => {
    editing_analytics_index.value = index;
};

const show_add_form_and_Scroll = () => {
    showAddForm.value = true;
    nextTick(() => {
        addForm.value?.scrollIntoView({ behavior: "smooth" });
    });
};

const cancel_add_form = () => {
    showAddForm.value = false;
    nextTick(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    });
};

const save_analytics_contact = (index: number) => {
    const updatedContact = edited_analytics_contact.value[index];
    settings_data.value.contact_analytics[index] = updatedContact;
    update_analytics_contact(edited_analytics_contact.value[index], edited_analytics_contact2.value[index]);
    editing_analytics_index.value = -1;
};

function add_analytics_contact() {
    const AnalyticsContactModel = {
        _setting_id: new_data.value._setting_id,
        gmail_looker_board: new_data.value.gmail_looker_board,
    };
    showAddForm.value = false;
    updateSuccess.value = undefined;
    fetching.value = true;
    api(endpoints.userNotificationContact, {
        method: "POST",
        body: {
            operation: "add_analytics_contact",
            scraper_api_token: cpa.scraperApiAccess,
            analytics_contact: [
                {
                    gmail_looker_board: AnalyticsContactModel.gmail_looker_board,
                    customer_id: Number.parseInt(cpa.getData.id),
                },
            ],
        },
        onResponse: async ({ request, response, options }) => {
            if (response.ok) {
                let newcontact = response._data.data.analytics_contact[0];

                settings_data.value.contact_analytics.push(newcontact);
                new_data.value = { _setting_id: "", gmail_looker_board: "" };
                updateSuccess.value = true;
                console.log(`Analytics Contact Submitted`);
                let updatedEmailString = `${settings_data.value.contact_analytics_all};${AnalyticsContactModel.gmail_looker_board}`;
                settings_data.value.contact_analytics_all = updatedEmailString;
                cpa.setSettings(settings_data.value); // Update the settings
            } else {
                updateSuccess.value = false;
                console.error(`Problem Occured when Adding Analytics Contact: ${JSON.stringify(response._data)}`);
            }
            fetching.value = false;
        },
        onResponseError({ request, response, options }) {
            fetching.value = false;
            updateSuccess.value = false;
            console.log(`Problem Occured when Adding Analytics Contact: ${JSON.stringify(response._data)}`);
        },
    });
}

function update_analytics_contact(analyticsContact: any, analyticsContact2: any) {
    updateSuccess.value = undefined;
    fetching.value = true;
    const emailString = settings_data.value.contact_analytics_all;

    // Create a regular expression to find the exact match of 'new@test.com'
    const emailToFind = analyticsContact2;
    const emailToReplaceWith = analyticsContact;

    // Use the replace method with a regular expression to replace the email
    const updatedEmailString = emailString.replace(new RegExp(`\\b${emailToFind}\\b`, "g"), emailToReplaceWith);

    api(endpoints.userNotificationContact, {
        method: "POST",
        body: {
            operation: "update_analytics_contact",
            scraper_api_token: cpa.scraperApiAccess,
            analytics_contact: [
                {
                    gmail_looker_board: updatedEmailString,
                    customer_id: Number.parseInt(cpa.getData.id),
                    _settings_id: settings_data.value.contact_analytics_settings_id,
                },
            ],
        },
        onResponse: async ({ request, response, options }) => {
            if (response.ok) {
                settings_data.value.contact_analytics_all = updatedEmailString;
                updateSuccess.value = true;
                cpa.setSettings(settings_data.value); // Update the settings
                console.log(`Analytics Contact Update Submitted`);
            } else {
                updateSuccess.value = false;
                console.error(`Problem Occured when Updating Analytics Contact: ${JSON.stringify(response._data)}`);
            }
            fetching.value = false;
        },
        onResponseError({ request, response, options }) {
            fetching.value = false;
            updateSuccess.value = false;
            console.log(`Problem Occured when Updating Analytics Contact: ${JSON.stringify(response._data)}`);
        },
    });
}

function delete_analytics_contact(analyticsContact: any) {
    const confirmed = confirm("Sei sicuro di voler eliminare questo contatto?");
    if (!confirmed) return;
    updateSuccess.value = undefined;
    fetching.value = true;
    const emailString = settings_data.value.contact_analytics_all;
    const emailToFind = analyticsContact;

    // Use a regular expression to remove the emailToFind considering different positions
    const updatedEmailString = emailString
        .replace(new RegExp(`(^|;)${emailToFind}(;|$)`), "$1")
        .replace(/;;/g, ";") // Remove any resulting double semicolons
        .replace(/^;|;$/g, ""); // Remove leading or trailing semicolon if any

    api(endpoints.userNotificationContact, {
        method: "POST",
        body: {
            operation: "update_analytics_contact",
            scraper_api_token: cpa.scraperApiAccess,
            analytics_contact: [
                {
                    gmail_looker_board: updatedEmailString,
                    customer_id: Number.parseInt(cpa.getData.id),
                    _settings_id: settings_data.value.contact_analytics_settings_id,
                },
            ],
        },
        onResponse: async ({ request, response, options }) => {
            if (response.ok) {
                // Remove the contact from the local state
                settings_data.value.contact_analytics = settings_data.value.contact_analytics.filter(
                    (contact: string) => contact !== analyticsContact.gmail_looker_board
                );
                const index = settings_data.value.contact_analytics.findIndex(
                    (profile: any) => profile.contact_analytics === analyticsContact
                );
                if (index > -1) {
                    settings_data.value.contact_analytics.splice(index, 1);
                    settings_data.value.contact_analytics_all = updatedEmailString;

                    cpa.setSettings(settings_data.value); // Update the settings
                }
                updateSuccess.value = true;
                location.reload();
                // cpa.setSettings(settings_data.value); // Update the settings
                console.log(`Analytics Contact Delete Submitted`);
            } else {
                updateSuccess.value = false;
                console.error(`Problem Occured While Deleting Analytics Contact: ${JSON.stringify(response._data)}`);
            }
            fetching.value = false;
        },
        onResponseError({ request, response, options }) {
            fetching.value = false;
            updateSuccess.value = false;
            console.log(`Problem Occured While Deleting Analytics Contact: ${JSON.stringify(response._data)}`);
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
