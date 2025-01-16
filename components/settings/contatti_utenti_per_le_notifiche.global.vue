<template>
    <div class="flex flex-col flex-grow w-full">
        <Tip>Qui puoi aggiungere, modificare ed eliminare i contatti che verranno utilizzati per la notifica</Tip>
        <div class="wrapper">
            <div class="section">
                <h2 class="flex flex-row items-center gap-2">
                    <icon class="text-accent" name="material-symbols:notifications-rounded"></icon>
                    <p>Contatti per le notifiche</p>
                </h2>

                <div class="mr-24 rounded shadow-md">
                    <table class="conto-table select-none">
                        <thead>
                            <tr>
                                <th>Nome</th>
                                <th>Cognome</th>
                                <th>Email</th>
                                <th>SMS numero</th>
                                <th
                                    v-if="
                                        editedSettings.contact_notification_delete_activated == true ||
                                        editedSettings.contact_notification_edit_activated == true
                                    "
                                >
                                    Azione
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr
                                v-for="(profile, index) in editedSettings.contacts ?? []"
                                :key="index"
                                class="cursor-pointer pointer-events-auto"
                            >
                                <td class="px-5 py-5 border-b text-sm">
                                    <div v-if="editingIndex === index">
                                        <input
                                            v-model="editedProfiles[index].user_name"
                                            placeholder="Nome"
                                            type="text"
                                        />
                                    </div>
                                    <div v-else>
                                        {{ profile.user_name }}
                                    </div>
                                </td>
                                <td class="px-5 py-5 border-b text-sm">
                                    <div v-if="editingIndex === index">
                                        <input
                                            v-model="editedProfiles[index].user_surname"
                                            placeholder="Cognome"
                                            type="text"
                                        />
                                    </div>
                                    <div v-else>
                                        {{ profile.user_surname }}
                                    </div>
                                </td>
                                <td class="px-5 py-5 border-b text-sm">
                                    <div v-if="editingIndex === index">
                                        <input v-model="editedProfiles[index].email" placeholder="Email" type="email" />
                                    </div>
                                    <div v-else>
                                        {{ profile.email }}
                                    </div>
                                </td>
                                <td class="px-5 py-5 border-b text-sm">
                                    <div v-if="editingIndex === index">
                                        <input v-model="editedProfiles[index].phone" placeholder="Phone" type="tel" />
                                    </div>
                                    <div v-else>
                                        {{ profile.phone }}
                                    </div>
                                </td>
                                <td
                                    class="px-5 py-5 text-sm flex gap-2"
                                    v-if="
                                        editedSettings.contact_notification_delete_activated == true ||
                                        editedSettings.contact_notification_edit_activated == true
                                    "
                                >
                                    <button
                                        @click="editProfile(index)"
                                        class="text-teal-300 hover:text-teal-500"
                                        v-if="
                                            editingIndex !== index && editedSettings.contact_notification_edit_activated
                                        "
                                    >
                                        <icon class="text-accent text-2xl" name="material-symbols:edit-square"></icon>
                                    </button>
                                    <button
                                        @click="saveProfile(index)"
                                        class="text-teal-300 hover:text-teal-500"
                                        v-else
                                    >
                                        <icon class="text-accent text-2xl" name="material-symbols:check"></icon>
                                    </button>
                                    <button
                                        @click="deleteProfile(profile._user_id)"
                                        class="text-red-500 hover:text-red-700"
                                        v-if="editedSettings.contact_notification_delete_activated"
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
                            v-if="editedSettings.contact_notification_add_activated"
                        >
                            <span class="text-2xl">+</span>
                        </button>
                    </div>
                    <div v-if="showAddForm" class="mt-4 p-4 border rounded" ref="addForm">
                        <h2 class="flex flex-row items-center gap-2">
                            <icon class="text-accent" name="material-symbols:notifications-rounded"></icon>
                            <p>Crea Nuovo Contatto per le Notifiche</p>
                        </h2>

                        <div class="mb-2">
                            <InputField label="Nome"
                                ><input v-model="newProfile.user_name" placeholder="Nome" type="text"
                            /></InputField>
                        </div>
                        <div class="mb-2">
                            <InputField label="Cognome"
                                ><input v-model="newProfile.user_surname" placeholder="Cognome" type="text"
                            /></InputField>
                        </div>
                        <div class="mb-2">
                            <InputField label="Email"
                                ><input v-model="newProfile.email" placeholder="Email" type="text"
                            /></InputField>
                        </div>
                        <div class="mb-2">
                            <InputField label="SMS"
                                ><input v-model="newProfile.phone" placeholder="SMS" type="text"
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
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import l from "lodash";
// import axios from 'axios';
import { nextTick, ref, watchEffect } from "vue";
import * as stringUtils from "~/src/common/string";
// import { useCpa } from '~/composables/store/cpa_store';

const endpoints = useEndpoints();
const fetching = ref(false);
const updateSuccess = ref<boolean | undefined>(undefined);
const emit = defineEmits<{ (e: "contactAdded", model: any): void }>();
const contactModel = ref<any>({});

const mounted = useMounted();
const cpa = useCpa();
let editedSettings = ref(cpa.getSettings());
// const contactSettings = ref({...editedSettings.value.contact_notification_setting_status});

const editingIndex = ref(-1);
const showAddForm = ref(false);
const addForm = ref<HTMLElement | null>(null); // Add a ref for the add form element
const newProfile = ref({ _user_id: "", user_name: "", user_surname: "", email: "", phone: "" });
const editedProfiles = ref([...(editedSettings.value.contacts ?? [])]);
const { api } = useApi();

const loadSettings = async () => {
    const settings = await cpa.getSettings();
    editedSettings.value = settings;
    editedProfiles.value = [...settings.contacts];
};

watchEffect(() => {
    loadSettings();
});
const editProfile = (index: number) => {
    editingIndex.value = index;
};

function isFilled(val: string) {
    return val !== undefined && val !== null && val.toString().length > 0;
}

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

const saveProfile = (index: number) => {
    updateProfile(editedProfiles.value[index]);
    editingIndex.value = -1;
};

function addProfile() {
    const contactModel = {
        _user_id: newProfile.value._user_id,
        user_name: newProfile.value.user_name,
        user_surname: newProfile.value.user_surname,
        email: newProfile.value.email,
        phone: newProfile.value.phone,
    };
    showAddForm.value = false;
    updateSuccess.value = undefined;
    fetching.value = true;
    api(endpoints.userNotificationContact, {
        method: "POST",
        body: {
            operation: "add_contact",
            scraper_api_token: cpa.scraperApiAccess,
            contact: [
                {
                    customer: Number.parseInt(cpa.getData.id),
                    user_name: contactModel.user_name,
                    user_surname: contactModel.user_surname,
                    email: contactModel.email,
                    phone: contactModel.phone,
                },
            ],
        },
        onResponse: async ({ request, response, options }) => {
            if (response.ok) {
                // newProfile.value = response._data.data.contacts[0];
                let new_profile = {
                    _user_id: response._data.data.contacts[0]._user_id,
                    user_name: response._data.data.contacts[0].user_name,
                    user_surname: response._data.data.contacts[0].user_surname,
                    email: response._data.data.contacts[0].email,
                    phone: response._data.data.contacts[0].phone,
                };

                editedSettings.value.contacts.push(new_profile);
                newProfile.value = { _user_id: "", user_name: "", user_surname: "", email: "", phone: "" };
                updateSuccess.value = true;
                emit("contactAdded", contactModel);
                console.log(`contact add submitted`);
                cpa.setSettings(editedSettings.value); // Update the settings
            } else {
                updateSuccess.value = false;
                console.error(`problem with adding contact: ${JSON.stringify(response._data)}`);
            }
            fetching.value = false;
        },
        onResponseError({ request, response, options }) {
            fetching.value = false;
            updateSuccess.value = false;
            console.log(`problem with adding contact: ${JSON.stringify(response._data)}`);
        },
    });
}

function updateProfile(profile: any) {
    updateSuccess.value = undefined;
    fetching.value = true;
    api(endpoints.userNotificationContact, {
        method: "POST",
        body: {
            operation: "update_contact",
            scraper_api_token: cpa.scraperApiAccess,
            contact: [
                {
                    customer: Number.parseInt(cpa.getData.id),
                    _user_id: profile._user_id,
                    user_name: profile.user_name,
                    user_surname: profile.user_surname,
                    email: profile.email,
                    phone: profile.phone,
                },
            ],
        },
        onResponse: async ({ request, response, options }) => {
            if (response.ok) {
                updateSuccess.value = true;
                cpa.setSettings(editedSettings.value); // Update the settings
                console.log(`contact update submitted`);
            } else {
                updateSuccess.value = false;
                console.error(`problem with updating contact: ${JSON.stringify(response._data)}`);
            }
            fetching.value = false;
        },
        onResponseError({ request, response, options }) {
            fetching.value = false;
            updateSuccess.value = false;
            console.log(`problem with updating contact: ${JSON.stringify(response._data)}`);
        },
    });
}

function deleteProfile(_user_id: string) {
    const confirmed = confirm("Sei sicuro di voler eliminare questo contatto?");
    if (!confirmed) return;
    updateSuccess.value = undefined;
    fetching.value = true;
    api(endpoints.userNotificationContact, {
        method: "POST",
        body: {
            operation: "delete_contact",
            scraper_api_token: cpa.scraperApiAccess,
            contact: {
                _user_id: _user_id,
            },
        },
        onResponse: async ({ request, response, options }) => {
            if (response.ok) {
                const index = editedSettings.value.contacts.findIndex((profile: any) => profile._user_id === _user_id);
                if (index > -1) {
                    editedSettings.value.contacts.splice(index, 1);
                    cpa.setSettings(editedSettings.value); // Update the settings
                }
                updateSuccess.value = true;
                console.log(`contact successfully deleted`);
                console.log(cpa);
                console.log(cpa.scraperApiAccess);
                // get_latest()
                // location.reload()
            } else {
                updateSuccess.value = false;
                console.error(`problem with deleting contact: ${JSON.stringify(response._data)}`);
                console.error(cpa);
                console.error(cpa.scraperApiAccess);
            }
            fetching.value = false;
        },
        onResponseError({ request, response, options }) {
            fetching.value = false;
            updateSuccess.value = false;
            console.log(`problem with deleting contact: ${JSON.stringify(response._data)}`);
        },
    });
}
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
