<template>
    <div v-if="mounted" class="flex flex-col flex-grow w-full">
        <Tip>Qui è possibile aggiungere, modificare ed eliminare Accessi Software di
            Contabilità</Tip>
        <div class="wrapper">
            <div class="section">
                <h2 class="flex flex-row items-center gap-2">
                    <icon class="text-accent" name="material-symbols:lock-open"></icon>
                    <p>Accessi Software di Contabilità</p>
                </h2>
                <div class="sub-section">
                    <h3>Teamsystem</h3>
                    <div class="flex flex-col gap-2">
                        <div class="mr-24 rounded shadow-md">
                            <table class="conto-table select-none">
                                <thead>
                                    <tr>
                                        <th>Teamsystem login</th>
                                        <th>Teamsystem password</th>
                                        <th>Tipo di account</th>
                                        <th colspan="4">Time span</th>
                                        <th>Stato di scadenza</th>
                                        <th v-if="
                                            editedSettings.teamsystem_delete_activated == true ||
                                            editedSettings.teamsystem_edit_activated
                                        ">
                                            Azione
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="(teamsystem_profile, index) in editedSettings
                                        .accesses?.teamsystem" :key="index" class="cursor-pointer pointer-events-auto">
                                        <td class="px-5 py-5 border-b text-sm">
                                            <div v-if="editingIndex === index">
                                                <input v-model="editedTeamsystemProfiles[index].username"
                                                    placeholder="Teamsystem Login Email" type="email" />
                                            </div>
                                            <div v-else>
                                                {{ teamsystem_profile.username }}
                                            </div>
                                        </td>
                                        <td class="px-5 py-5 text-sm">
                                            <div v-if="editingIndex === index">
                                                <input v-model="editedTeamsystemProfiles[index].password_1"
                                                    placeholder="Password" type="text" />
                                            </div>
                                            <div v-else>
                                                <span v-if="passwordVisibility[index]">{{
                                                    teamsystem_profile.password_1
                                                    }}</span>
                                                <span v-else>********</span>
                                                <button @click="togglePasswordVisibility(index)"
                                                    class="ml-2 text-teal-300 hover:text-teal-500">
                                                    <icon v-if="passwordVisibility[index]"
                                                        name="material-symbols:visibility-off"></icon>
                                                    <icon v-else name="material-symbols:visibility"></icon>
                                                </button>
                                            </div>
                                        </td>
                                        <td class="px-5 py-5 text-sm">
                                            <div v-if="editingIndex === index">
                                                <select id="enabled_profile_type" v-model="editedTeamsystemProfiles[index].dedicated_shared
                                                    " class="select">
                                                    <option value="dedicated">Dedicato al robot</option>
                                                    <option value="shared">
                                                        Condiviso con utente studio
                                                    </option>
                                                    <option value="ade_integration">Account Condiviso per Integrazione ADEMentally Teamsystem</option>
                                                </select>
                                            </div>
                                            <div v-else>
                                                <div v-if="
                                                    teamsystem_profile.dedicated_shared == 'dedicated'
                                                ">
                                                    Dedicato al robot
                                                </div>
                                                <div v-if="teamsystem_profile.dedicated_shared == 'shared'">
                                                    Condiviso con utente studio
                                                </div>
                                                <div v-if="teamsystem_profile.dedicated_shared == 'ade_integration'">
                                                    Account Condiviso per Integrazione ADEMentally Teamsystem
                                                </div>
                                            </div>
                                        </td>
                                        <td class="px-5 py-5 border-b text-sm" :colspan="4">
                                            <!-- Merged cell across four columns -->
                                            <div v-if=" teamsystem_profile.dedicated_shared == 'shared' 
                                                    || teamsystem_profile.dedicated_shared =='ade_integration'">
                                            <div v-if="editingIndex === index">
                                                <div class="flex space-x-2">
                                                    <h5>(lu-ve):</h5>
                                                    <input v-model="editedTeamsystemProfiles[index].weekday_start
                                                        " placeholder="Weekday Start" type="time"
                                                        class="border border-gray-300 rounded p-1 w-24" />
                                                    <!-- Weekday End -->
                                                    <input v-model="editedTeamsystemProfiles[index].weekday_end
                                                        " placeholder="Weekday End" type="time"
                                                        class="border border-gray-300 rounded p-1 w-24" />
                                                </div>
                                                <div class="flex space-x-2 mt-2">
                                                    <!-- Weekend Start -->
                                                    <h5>(sa-do):</h5>
                                                    <input v-model="editedTeamsystemProfiles[index].weekend_start
                                                        " placeholder="Weekend Start" type="time"
                                                        class="border border-gray-300 rounded p-1 w-24" />
                                                    <!-- Weekend End -->
                                                    <input v-model="editedTeamsystemProfiles[index].weekend_end
                                                        " placeholder="Weekend End" type="time"
                                                        class="border border-gray-300 rounded p-1 w-24" />
                                                </div>
                                            </div>
                                            <div v-else>
                                                <!-- Displaying values -->
                                                <div class="flex space-x-2">
                                                    <span class="mr-2">Giorno feriale   (lu-ve):</span>
                                                    <span>{{ formatTime(teamsystem_profile.weekday_start) }}</span>
                                                    <span>-</span>
                                                    <span>{{ formatTime(teamsystem_profile.weekday_end) }}</span>
                                                </div>
                                                <div class="flex space-x-2 mt-2">
                                                    <span class="mr-2">Fine settimana (sa-do):</span>

                                                    <span>{{ formatTime(teamsystem_profile.weekend_start) }}</span>
                                                    <span>-</span>
                                                    <span>{{ formatTime(teamsystem_profile.weekend_end) }}</span>
                                                </div>
                                            </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div class="flex space-x-2">
                                                <span v-if="teamsystem_profile.is_expired">La password è scaduta</span>
                                                <span v-else>Password è valida</span>
                                            </div>
                                        </td>
                                        <td class="px-5 py-5 text-sm" v-if="editedSettings.teamsystem_edit_activated">
                                            <button @click="editTeamsystemProfile(index)"
                                                class="text-teal-300 hover:text-teal-500" v-if="
                                                    editingIndex !== index &&
                                                    editedSettings.teamsystem_edit_activated
                                                ">
                                                <icon class="text-accent text-2xl" name="material-symbols:edit-square">
                                                </icon>
                                            </button>
                                            <button @click="saveTeamsystemProfile(index)"
                                                class="text-teal-300 hover:text-teal-500" v-else>
                                                <icon class="text-accent text-2xl" name="material-symbols:check"></icon>
                                            </button>
                                            <button @click="
                                                deleteTeamsystemProfile(
                                                    teamsystem_profile._credentials_id
                                                )
                                                " class="text-red-500 hover:text-red-700" v-if="editedSettings.teamsystem_delete_activated">
                                                <icon class="text-accent text-2xl" name="material-symbols:delete">
                                                </icon>
                                            </button>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div class="flex justify-center mt-4">
                            <button @click="showAddProfileFormAndScroll"
                                class="bg-green-500 text-white p-2 rounded-full"
                                v-if="editedSettings.profile_entranet_add_activated == true">
                                <span class="text-2xl">+</span>
                            </button>
                        </div>
                        <div v-if="showAddFormProfile" class="di mt-4 p-8 border rounded-xl shadow-md" ref="addForm">
                            <h2 class="flex flex-row items-center gap-2">
                                <icon class="text-accent" name="material-symbols:lock"></icon>
                                <p>Aggiungi un nuovo account</p>
                            </h2>

                            <div class="mb-2">
                                <InputField label="Login"><input v-model="newProfile.username" placeholder="Login"
                                        type="text" /></InputField>
                            </div>
                            <div class="mb-2">
                                <InputField label="Password"><input v-model="newProfile.password_1"
                                        placeholder="Password" type="text" required /></InputField>
                            </div>
                            <div class="mb-2">
                                <label for="type_account" class="block text-gray-200 text-sm font-bold mb-2">Tipo di
                                    account</label>
                                <select id="dedicated_shared" v-model="newProfile.dedicated_shared" class="select">
                                    <option value="dedicated">Dedicato al robot</option>
                                    <option value="shared">Condiviso con utente studio</option>
                                    <option value="ade_integration">Account Condiviso per Integrazione ADEMentally Teamsystem</option>
                                </select>
                            </div>
                            <div class="mb-2" v-if="newProfile.dedicated_shared == 'shared' || newProfile.dedicated_shared =='ade_integration'">
                                <label for="date-picker" class="block text-gray-200 text-sm font-bold mb-2">
                                    Time Span
                                </label>
                                <div class="grid grid-cols-2 gap-4">
                                    <!-- Weekdays Column -->
                                    <div class="p-4 border rounded bg-gray-800">
                                        <h3 class="text-white text-lg font-bold mb-2">
                                            Giorno feriale (lu-ve)
                                        </h3>
                                        <div class="flex flex-col space-y-2">
                                            <div class="flex items-center space-x-2">
                                                <!-- Start Time -->
                                                <input type="time" v-model="timeSpan.weekday_start"
                                                    class="border border-gray-300 rounded p-1 w-24" />
                                                <span>-</span>
                                                <!-- End Time -->
                                                <input type="time" v-model="timeSpan.weekday_end"
                                                    class="border border-gray-300 rounded p-1 w-24" />
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Weekend Column -->
                                    <div class="p-4 border rounded bg-gray-800">
                                        <h3 class="text-white text-lg font-bold mb-2">Fine settimana (sa-do)</h3>
                                        <div class="flex flex-col space-y-2">
                                            <div class="flex items-center space-x-2">
                                                <!-- Start Time -->
                                                <input type="time" v-model="timeSpan.weekend_start"
                                                    class="border border-gray-300 rounded p-1 w-24" />
                                                <span>-</span>
                                                <!-- End Time -->
                                                <input type="time" v-model="timeSpan.weekend_end"
                                                    class="border border-gray-300 rounded p-1 w-24" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <br />
                            <div class="flex flex-row gap-16 justify-center">
                                <button @click="createTeamsystemProfile" class="primary-button">
                                    <p>Aggiungi</p>
                                    <icon name="material-symbols:check-circle-outline-rounded" class="size-6"></icon>
                                </button>

                                <button @click="cancelAddProfile"
                                    class="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-xl flex items-center">
                                    <p class="mr-2">Annulla</p>
                                    <icon name="material-symbols:check-circle-outline-rounded" class="size-6"></icon>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="sub-section">
                    <h3>Teamsystem Digital</h3>
                    <div class="mr-24 rounded shadow-md">
                        <table class="conto-table select-none">
                            <thead>
                                <tr>
                                    <th>Teamsystem login</th>
                                    <th>Teamsystem password</th>
                                    <th>Tipo di account</th>
                                    <th v-if="
                                        editedSettings.teamsystem_digital_edit_activated ||
                                        editedSettings.teamsystem_digital_delete_activated
                                    ">
                                        Azione
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="(teamsystem_digital_profile, index) in editedSettings
                                    .accesses?.teamsystem_digital" :key="index" class="cursor-pointer pointer-events-auto">
                                    <td class="px-5 py-5 border-b text-sm">
                                        <div v-if="editingTeamsystemDigitalIndex === index">
                                            <input v-model="editedTeamsystemDigitalProfiles[index].username
                                                " placeholder="Teamsystem Digital Login Email" type="email" />
                                        </div>
                                        <div v-else>
                                            {{ teamsystem_digital_profile.username }}
                                        </div>
                                    </td>
                                    <td class="px-5 py-5 text-sm">
                                        <div v-if="editingTeamsystemDigitalIndex === index">
                                            <input v-model="editedTeamsystemDigitalProfiles[index].password_1
                                                " placeholder="Password" type="text" />
                                        </div>
                                        <div v-else>
                                            <span v-if="passwordVisibilityDigital[index]">{{
                                                teamsystem_digital_profile.password_1
                                                }}</span>
                                            <span v-else>********</span>
                                            <button @click="togglePasswordVisibilityDigital(index)"
                                                class="ml-2 text-teal-300 hover:text-teal-500">
                                                <icon v-if="passwordVisibilityDigital[index]"
                                                    name="material-symbols:visibility-off"></icon>
                                                <icon v-else name="material-symbols:visibility"></icon>
                                            </button>
                                        </div>
                                    </td>
                                    <td class="px-5 py-5 text-sm">
                                        <div v-if="editingTeamsystemDigitalIndex === index">
                                            <select id="enabled_profile_type" v-model="editedTeamsystemDigitalProfiles[index]
                                                    .dedicated_shared
                                                " class="select">
                                                <option value="dedicated">Dedicato al robot</option>
                                                <option value="shared">
                                                    Condiviso con utente studio
                                                </option>
                                            </select>
                                        </div>
                                        <div v-else>
                                            {{ teamsystem_digital_profile.dedicated_shared }}
                                            <div v-if="
                                                teamsystem_digital_profile.dedicated_shared ==
                                                'dedicated'
                                            ">
                                                Dedicato al robot
                                            </div>
                                            <div v-if="
                                                teamsystem_digital_profile.dedicated_shared ==
                                                'shared'
                                            ">
                                                Condiviso con utente studio
                                            </div>
                                            <div
                                                v-if="
                                                teamsystem_digital_profile.dedicated_shared ==
                                                'ade_integration'
                                                "
                                            >
                                            Account Condiviso per Integrazione ADEMentally Teamsystem
                                            </div>
                                        </div>
                                    </td>
                                    <td class="px-5 py-5 text-sm" v-if="
                                        editedSettings.teamsystem_digital_edit_activated ==
                                        true ||
                                        editedSettings.teamsystem_digital_delete_activated == true
                                    ">
                                        <button @click="editTeamsystemDigitalProfile(index)"
                                            class="text-teal-300 hover:text-teal-500" v-if="
                                                editingTeamsystemDigitalIndex !== index &&
                                                editedSettings.teamsystem_digital_edit_activated
                                            ">
                                            <icon class="text-accent text-2xl" name="material-symbols:edit-square">
                                            </icon>
                                        </button>
                                        <button @click="saveTeamsystemDigitalProfile(index)"
                                            class="text-teal-300 hover:text-teal-500" v-else>
                                            <icon class="text-accent text-2xl" name="material-symbols:check"></icon>
                                        </button>
                                        <button @click="
                                            deleteTeamsystemDigitalProfile(
                                                teamsystem_digital_profile._credentials_id
                                            )
                                            " class="text-red-500 hover:text-red-700"
                                            v-if="editedSettings.teamsystem_digital_delete_activated">
                                            <icon class="text-accent text-2xl" name="material-symbols:delete"></icon>
                                        </button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div class="flex justify-center mt-4">
                        <button @click="showAddDigitalFormAndScroll" class="bg-green-500 text-white p-2 rounded-full"
                            v-if="editedSettings.profile_entranet_add_activated == true">
                            <span class="text-2xl">+</span>
                        </button>
                    </div>
                    <div v-if="showAddFormDigital" class="di mt-4 p-8 border rounded-xl shadow-md" ref="addForm">
                        <h2 class="flex flex-row items-center gap-2">
                            <icon class="text-accent" name="material-symbols:lock"></icon>
                            <p>Aggiungi un nuovo account</p>
                        </h2>

                        <div class="mb-2">
                            <InputField label="Login" :error="validationErrors.username"><input
                                    v-model="newProfile.username" placeholder="Login" type="text"
                                    :class="{ 'border-rose-500': validationErrors.username }" />
                            </InputField>
                        </div>
                        <div class="mb-2">
                            <InputField label="Password" :error="validationErrors.password_1"><input
                                    v-model="newProfile.password_1" placeholder="Password" type="text" required
                                    :class="{ 'border-rose-500': validationErrors.password_1 }" /></InputField>
                        </div>
                        <div class="mb-2">
                            <label for="type_account" class="block text-gray-200 text-sm font-bold mb-2">Tipo di
                                account</label>
                            <select id="dedicated_shared" v-model="newProfile.dedicated_shared" class="select" :class="{
                                'border-rose-500': validationErrors.dedicated_shared,
                            }">
                                <option value="dedicated">Dedicato al robot</option>
                                <option value="shared">Condiviso con utente studio</option>
                                <option value="ade_integration">Account Condiviso per Integrazione ADEMentally Teamsystem</option>
                            </select>
                            <span v-if="validationErrors.dedicated_shared"
                                class="flex items-center font-medium tracking-wide text-red-500 text-xs mt-1 ml-1">
                                {{ validationErrors.dedicated_shared }}
                            </span>
                        </div>
                        <br />
                        <div class="flex flex-row gap-16 justify-center">
                            <button @click="createTeamsystemDigitalProfile" class="primary-button">
                                <p>Aggiungi</p>
                                <icon name="material-symbols:check-circle-outline-rounded" class="size-6"></icon>
                            </button>

                            <button @click="cancelAddProfile"
                                class="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-xl flex items-center">
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
import { nextTick, ref, onMounted, watchEffect, reactive } from "vue";
import { validateEmail } from "~/src/common/string";
import Datepicker from "@vuepic/vue-datepicker";
import { startOfWeek, endOfWeek, isBefore, isAfter } from "date-fns";

const timeSpan = ref({
    weekday_start: "21:00", // Default start time for weekdays
    weekday_end: "07:00", // Default end time for weekdays
    weekend_start: "00:00", // Default start time for weekends
    weekend_end: "23:59", // Default end time for weekends
});

const endpoints = useEndpoints();
const mounted = useMounted();
const cpa = useCpa();
let editedSettings = ref(cpa.getSettings());
const editingIndex = ref(-1);
const editingTeamsystemDigitalIndex = ref(-1);
const editedTeamsystemProfiles = ref([
    ...(editedSettings.value.accesses?.teamsystem ?? []),
]);
const editedTeamsystemDigitalProfiles = ref([
    ...(editedSettings.value.accesses?.teamsystem_digital ?? []),
]);
watchEffect(() => {
    editedTeamsystemProfiles.value = [
        ...(editedSettings.value.accesses?.teamsystem ?? []),
    ];
  });
const updateSuccess = ref<boolean | undefined>(undefined);
const fetching = ref(false);
const validationErrors = ref<any>({});
const showAddFormDigital = ref(false);
const showAddFormProfile = ref(false);

const newProfile = ref({
    username: "",
    password_1: "",
    password_2: "",
    dedicated_shared: "",
    weekday_start: "21:00", // Default start time for weekdays
    weekday_end: "07:00", // Default end time for weekdays
    weekend_start: "00:00", // Default start time for weekends
    weekend_end: "23:59", // Default end time for weekends
});

const { api } = useApi();

const addForm = ref<HTMLElement | null>(null); // Add a ref for the add form element

const showAddDigitalFormAndScroll = () => {
    showAddFormDigital.value = true;
    nextTick(() => {
        addForm.value?.scrollIntoView({ behavior: "smooth" });
    });
};

const formatTime = (time) => {
    if (time && typeof time === 'string') {
        return time.substring(0, 5);
    }
    return '';
}
const showAddProfileFormAndScroll = () => {
    showAddFormProfile.value = true;
    nextTick(() => {
        addForm.value?.scrollIntoView({ behavior: "smooth" });
    });
};

const cancelAddProfile = () => {
    showAddFormDigital.value = false;
    showAddFormProfile.value = false;
    nextTick(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    });
};

const editTeamsystemDigitalProfile = (index: number) => {
    editingTeamsystemDigitalIndex.value = index;
};

const editTeamsystemProfile = (index: number) => {
    editingIndex.value = index;
};

const saveTeamsystemProfile = (index: number) => {
    console.log("editedTeamsystemProfiles.value[index]====>", editedTeamsystemProfiles.value[index])
    updateTeamsystemProfile(editedTeamsystemProfiles.value[index]);
    editingIndex.value = -1;
};

const saveTeamsystemDigitalProfile = (index: number) => {
    updateTeamsystemDigitalProfile(editedTeamsystemDigitalProfiles.value[index]);
    editingTeamsystemDigitalIndex.value = -1;
};

const passwordVisibility = ref<boolean[]>(
    Array(editedSettings.value.accesses.teamsystem.length).fill(false)
);
const passwordVisibilityDigital = ref<boolean[]>(
    Array(editedSettings.value.accesses.teamsystem_digital.length).fill(false)
);

function togglePasswordVisibility(index: number) {
    passwordVisibility.value[index] = !passwordVisibility.value[index];
}

function togglePasswordVisibilityDigital(index: number) {
    passwordVisibilityDigital.value[index] =
        !passwordVisibilityDigital.value[index];
}

function createTeamsystemProfile() {
    createTeamsystem(7);
}

function createTeamsystemDigitalProfile() {
    createTeamsystem(8);
}

function createTeamsystem(applicationId: number) {
    validationErrors.value = {};
    if (!newProfile.value.username) {
        validationErrors.value.username = "Inserisci un username";
    } else if (!validateEmail(newProfile.value.username)) {
        validationErrors.value.username = "Inserisci un username valido";
    }
    if (!newProfile.value.password_1) {
        validationErrors.value.password_1 = "Inserisci una password";
    }
    if (!newProfile.value.dedicated_shared) {
        validationErrors.value.dedicated_shared = "Seleziona un tipo di account";
    }
    if (
        validationErrors.value.username ||
        validationErrors.value.password_1 ||
        validationErrors.value.dedicated_shared
    ) {
        return;
    }

    updateSuccess.value = undefined;
    fetching.value = true;
    showAddFormProfile.value = false;
    showAddFormDigital.value = false;
    api(endpoints.userNotificationContact, {
        method: "POST",
        body: {
            operation: "create_teamsystem",
            scraper_api_token: cpa.scraperApiAccess,
            teamsystem: [
                {
                    customer_id: Number.parseInt(cpa.getData.id),
                    username: newProfile.value.username,
                    password_1: newProfile.value.password_1,
                    dedicated_shared: newProfile.value.dedicated_shared,
                    weekday_start: newProfile.value.dedicated_shared == "shared" ? timeSpan.value?.weekday_start : "00:00",
                    weekday_end: newProfile.value.dedicated_shared == "shared" ? timeSpan.value?.weekday_end : "23:59",
                    weekend_start: newProfile.value.dedicated_shared == "shared" ? timeSpan.value?.weekend_start : "00:00",
                    weekend_end: newProfile.value.dedicated_shared == "shared" ? timeSpan.value?.weekend_end : "23:59",
                    application_id: applicationId,
                },
            ],
        },
        onResponse: async ({ request, response, options }) => {
            if (response.ok) {
                const responseData = response._data.data;
                console.log("--------->create Teamsystem", responseData)
                updateSuccess.value = true;
                if (applicationId == 7)
                    editedSettings.value.accesses.teamsystem.push(
                        responseData.teamsystem[0]
                    );
                else
                    editedSettings.value.accesses.teamsystem_digital.push(
                        responseData.teamsystem[0]
                    );
                cpa.setSettings(editedSettings.value); // Update the settings
                console.log(`Teamsystem Profile created`);
            } else {
                updateSuccess.value = false;
                console.error(
                    `problem with creating Teamsystem Profile: ${JSON.stringify(
                        response._data
                    )}`
                );
            }
            fetching.value = false;
        },
        onResponseError({ request, response, options }) {
            fetching.value = false;
            updateSuccess.value = false;
            console.log(
                `problem with creating Teamsystem Profile: ${JSON.stringify(
                    response._data
                )}`
            );
        },
    });
    newProfile.value = {
        username: "",
        password_1: "",
        password_2: "",
        dedicated_shared: "",
        weekday_start: "21:00",
        weekday_end: "07:00",
        weekend_start: "00:00",
        weekend_end: "23:59",
    };
}

function updateTeamsystemProfile(teamsystem_profile: any) {
    updateSuccess.value = undefined;
    fetching.value = true;
    console.log("teamsystem_profile====>", teamsystem_profile)
    api(endpoints.userNotificationContact, {
        method: "POST",
        body: {
            operation: "update_teamsystem",
            scraper_api_token: cpa.scraperApiAccess,
            teamsystem: [
                {
                    customer: Number.parseInt(cpa.getData.id),
                    _credentials_id: teamsystem_profile._credentials_id,
                    username: teamsystem_profile.username,
                    password_1: teamsystem_profile.password_1,
                    dedicated_shared: teamsystem_profile.dedicated_shared,
                    weekday_start: teamsystem_profile.dedicated_shared == "shared" || teamsystem_profile.dedicated_shared == "ade_integration" ? teamsystem_profile.weekday_start : "00:00",
                    weekday_end: teamsystem_profile.dedicated_shared == "shared" || teamsystem_profile.dedicated_shared == "ade_integration"? teamsystem_profile.weekday_end : "23:59",
                    weekend_start: teamsystem_profile.dedicated_shared == "shared" || teamsystem_profile.dedicated_shared == "ade_integration"? teamsystem_profile.weekend_start : "00:00",
                    weekend_end: teamsystem_profile.dedicated_shared == "shared" || teamsystem_profile.dedicated_shared == "ade_integration"?  teamsystem_profile.weekend_end : "23:59"
                },
            ],
        },
        onResponse: async ({ request, response, options }) => {
            if (response.ok) {
                updateSuccess.value = true;
                cpa.setSettings(editedSettings.value); // Update the settings
                console.log(`Teamsystem Profile update submitted +++++++>`, response._data.data);
            } else {
                updateSuccess.value = false;
                console.error(
                    `problem with updating Teamsystem Profile: ${JSON.stringify(
                        response._data
                    )}`
                );
            }
            fetching.value = false;
        },
        onResponseError({ request, response, options }) {
            fetching.value = false;
            updateSuccess.value = false;
            console.log(
                `problem with updating Teamsystem Profile: ${JSON.stringify(
                    response._data
                )}`
            );
        },
    });
}

function deleteTeamsystemProfile(_credentials_id: string) {
    const confirmed = confirm("Sei sicuro di voler eliminare questi dati?");
    if (!confirmed) return;
    updateSuccess.value = undefined;
    fetching.value = true;
    api(endpoints.userNotificationContact, {
        method: "POST",
        body: {
            operation: "delete_teamsystem",
            scraper_api_token: cpa.scraperApiAccess,
            teamsystem: {
                _credentials_id: _credentials_id,
            },
        },
        onResponse: async ({ request, response, options }) => {
            if (response.ok) {
                const index = editedSettings.value.accesses?.teamsystem.findIndex(
                    (teamsystem_profile: any) =>
                        teamsystem_profile._credentials_id === _credentials_id
                );
                if (index > -1) {
                    editedSettings.value.accesses?.teamsystem.splice(index, 1);
                    cpa.setSettings(editedSettings.value); // Update the settings
                }
                updateSuccess.value = true;
                console.log(`Teamsystem Profile successfully deleted`);
                console.log(cpa);
                console.log(cpa.scraperApiAccess);
                // get_latest()
                // location.reload()
            } else {
                updateSuccess.value = false;
                console.error(
                    `problem with deleting Teamsystem Profile: ${JSON.stringify(
                        response._data
                    )}`
                );
                console.error(cpa);
                console.error(cpa.scraperApiAccess);
            }
            fetching.value = false;
        },
        onResponseError({ request, response, options }) {
            fetching.value = false;
            updateSuccess.value = false;
            console.log(
                `problem with deleting Teamsystem Profile: ${JSON.stringify(
                    response._data
                )}`
            );
        },
    });
}

function updateTeamsystemDigitalProfile(teamsystem_digital_profile: any) {
    updateSuccess.value = undefined;
    fetching.value = true;
    api(endpoints.userNotificationContact, {
        method: "POST",
        body: {
            operation: "update_teamsystem_digital",
            scraper_api_token: cpa.scraperApiAccess,
            teamsystem_digital: [
                {
                    customer: Number.parseInt(cpa.getData.id),
                    _credentials_id: teamsystem_digital_profile._credentials_id,
                    username: teamsystem_digital_profile.username,
                    password_1: teamsystem_digital_profile.password_1,
                    dedicated_shared: teamsystem_digital_profile.dedicated_shared,
                },
            ],
        },
        onResponse: async ({ request, response, options }) => {
            if (response.ok) {
                updateSuccess.value = true;
                cpa.setSettings(editedSettings.value); // Update the settings
                console.log(`Teamsystem Digital Profile update submitted`);
            } else {
                updateSuccess.value = false;
                console.error(
                    `problem with updating Teamsystem Digital Profile: ${JSON.stringify(
                        response._data
                    )}`
                );
            }
            fetching.value = false;
        },
        onResponseError({ request, response, options }) {
            fetching.value = false;
            updateSuccess.value = false;
            console.log(
                `problem with updating Teamsystem Digital Profile: ${JSON.stringify(
                    response._data
                )}`
            );
        },
    });
}

function deleteTeamsystemDigitalProfile(_credentials_id: string) {
    const confirmed = confirm("Sei sicuro di voler eliminare questo contatto?");
    if (!confirmed) return;
    updateSuccess.value = undefined;
    fetching.value = true;
    api(endpoints.userNotificationContact, {
        method: "POST",
        body: {
            operation: "delete_teamsystem_digital",
            scraper_api_token: cpa.scraperApiAccess,
            teamsystem_digital: {
                _credentials_id: _credentials_id,
            },
        },
        onResponse: async ({ request, response, options }) => {
            if (response.ok) {
                const index =
                    editedSettings.value.accesses?.teamsystem_digital.findIndex(
                        (teamsystem_digital_profile: any) =>
                            teamsystem_digital_profile._credentials_id === _credentials_id
                    );
                if (index > -1) {
                    editedSettings.value.accesses?.teamsystem_digital.splice(index, 1);
                    cpa.setSettings(editedSettings.value); // Update the settings
                }
                updateSuccess.value = true;
                console.log(`Teamsystem Digital Profile successfully deleted`);
                console.log(cpa);
                console.log(cpa.scraperApiAccess);
                // get_latest()
                // location.reload()
            } else {
                updateSuccess.value = false;
                console.error(
                    `problem with deleting Teamsystem Digital Profile: ${JSON.stringify(
                        response._data
                    )}`
                );
                console.error(cpa);
                console.error(cpa.scraperApiAccess);
            }
            fetching.value = false;
        },
        onResponseError({ request, response, options }) {
            fetching.value = false;
            updateSuccess.value = false;
            console.log(
                `problem with deleting Teamsystem Digital Profile: ${JSON.stringify(
                    response._data
                )}`
            );
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

.time-range-picker {
    display: flex;
    flex-direction: row;
    gap: 20px;
}

.time-selector {
    display: flex;
    /* Set the display to flex to align items in a row */
    gap: 20px;
    /* Space between the two columns */
}

.start-time,
.end-time {
    display: flex;
    flex-direction: column;
}

input[type="time"] {
    margin-top: 5px;
    @apply my-0 mx-0 px-4 py-3 w-full bg-background border-outline focus:ring focus:ring-blue-500 focus:border-accent focus:outline-none border-[1px] rounded-xl;
}

.selection-result {
    margin-top: 20px;
}

.time-span-selector {
    background-color: #1a202c;
    border-radius: 8px;
}

.time-span-selector input {
    color: #e2e8f0;
    background-color: #2d3748;
}

.bulk-select select,
.bulk-select input {
    background-color: #2d3748;
    color: #e2e8f0;
}
</style>