<template>
    <ModalSheet height="90%" :controller="detailsModalSheet">
        <div class="flex flex-col w-full gap-10 p-4">
            <div class="flex flex-row gap-4 justify-evenly w-full flex-wrap">
                <span class="flex flex-row gap-2 items-center">
                    <span class="font-bold">Nome:</span>
                    <span>{{ focusData.ditta.registered_name }}</span>
                </span>
                <span class="flex flex-row gap-2 items-center">
                    <span class="font-bold">Numero:</span>
                    <span>{{ focusData.ditta.ditta_number }}</span>
                </span>
            </div>
            <div class="flex flex-row gap-4 justify-evenly w-full flex-wrap">
                <span class="flex flex-row gap-2 items-center">
                    <span class="font-bold">Frequenze:</span>
                    <DropdownMenu :id="'report_frequencies_type_dropdown_' + focusData.ditta.id" class="min-w-[6rem]"
                        :label="dropDownLabel(focusData.ditta.report_frequencies, settingsMappings.getReportFrequencyTypeMap.value)"
                        @change="
                            (e) =>
                                toggleSetElement(
                                    focusData.ditta.report_frequencies,
                                    e.toLocaleLowerCase()
                                )
                        " :selected-items="[...focusData.ditta.report_frequencies.values()]" :items="[
                            ...Object.keys(
                                settingsMappings.getReportFrequencyTypeMap.value
                            ).map((i) => i),
                        ]" :itemsFormatter="(e: any) => settingsMappings.getReportFrequencyTypeMap.value[e]">
                    </DropdownMenu>
                </span>
                <span class="flex flex-row gap-2 items-center">
                    <span class="font-bold">Tipi di report:</span>
                    <DropdownMenu :id="'report_type_dropdown_' + focusData.ditta.id" class="min-w-[6rem]"
                        :label="dropDownLabel(focusData.ditta.report_types, settingsMappings.getReportTypeMap.value)" @change="
                            (e) =>
                                toggleSetElement(
                                    focusData.ditta.report_types,
                                    e.toLocaleLowerCase()
                                )
                        " :selected-items="[...focusData.ditta.report_types.values()]" :items="[
                            ...Object.keys(settingsMappings.getReportTypeMap.value).map((i) =>
                                i.toLocaleUpperCase()
                            ),
                        ]"></DropdownMenu>
                </span>
                <span class="flex flex-row gap-2 items-center">
                    <span class="font-bold">Vista teamsystem:</span>
                    <DropdownMenu :id="'teamsystemdropdown_' + focusData.ditta.id" class="min-w-[6rem]"
                        :label="dropDownLabel(focusData.ditta.vista_teamsystem_frequency,settingsMappings.getTeamSystemFrequencyMap.value)" 
                        @change="(e) => focusData.ditta.vista_teamsystem_frequency = [e.toLocaleLowerCase()]" 
                        :items="[
                            ...Object.keys(settingsMappings.getTeamSystemFrequencyMap.value).map((i) =>
                                i
                            ),
                        ]"
                        :itemsFormatter="(e: any) => settingsMappings.getTeamSystemFrequencyMap.value[e]"
                        close-on-click
                        ></DropdownMenu>
                </span>
            </div>

            <table class="conto-table select-none">
                <thead>
                    <tr>
                        <th>Nome *</th>
                        <th>Cognome *</th>
                        <th>Email *</th>
                        <th>SMS numero</th>
                        <th>Azione</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(contact, contactIndex) in editingDittaContacts" :key="contactIndex">
                        <td>
                            <input type="text" v-model="contact.first_name" required class="required" />
                            <span v-if="validationErrors[`first_name.${contactIndex}`]" class="flex items-center font-medium tracking-wide text-red-500 text-xs mt-1 ml-1">
                                inserisci Nome !
                            </span>
                        </td>
                        <td>
                            <input type="text" v-model="contact.last_name" required  class="required" />
                            <span v-if="validationErrors[`last_name.${contactIndex}`]" class="flex items-center font-medium tracking-wide text-red-500 text-xs mt-1 ml-1">
                                inserisci Cognome !
                            </span>
                        </td>
                        <td>
                            <input type="email" v-model="contact.email" required class="required" />
                            <span v-if="validationErrors[`email.${contactIndex}`]" class="flex items-center font-medium tracking-wide text-red-500 text-xs mt-1 ml-1">
                                inserisci Email !
                            </span>
                        </td>
                        <td>
                            <input type="tel" v-model="contact.phone" />
                        </td>
                        <td>
                            <button @click="removeContact(contact.contact_id, contactIndex)"
                                class="text-teal-300 hover:text-teal-500">
                                <icon class="text-accent text-2xl" name="material-symbols:delete"></icon>
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
            <div class="flex justify-center mt-4">
                <button @click="addNewContact" class="bg-blue-500 text-white p-2 rounded-full">
                    <span class="text-2xl">+</span>
                </button>
            </div>
        </div>
        <div class="fixed bottom-0 left-0 right-0 z-50 text-[#94a3b8]">
            <div v-for="(alertId, index) in Object.keys(Alerts).filter(al => Alerts[al])" class="text-lg w-full flex items-center justify-center py-px">
                <div class="bg-[#182235] text-[#94a3b8] px-4 py-2 rounded-full flex items-center space-x-2 border border-[#2680eb]">
                    <icon v-if="alertId" :name="Alerts[alertId].icon"></icon>
                    <span>{{ Alerts[alertId].message }}</span>
                    <button class="text-[#94a3b8] focus:outline-none" @click="clearAlert">
                        <icon name="material-symbols:close-rounded"></icon>
                    </button>
                </div>
            </div>
        </div>
    </ModalSheet>
    <div v-if="mounted" class="flex flex-col flex-grow w-full">
        <div class="wrapper">
            <div class="section">
                <div class="w-full h-[60px] flex items-center justify-left">
                    <div class="bg-[#182235] text-[#94a3b8] w-full px-4 py-2 rounded-full flex items-center space-x-2 border border-[#2e4a67]">
                        <button class="text-[#1a76d2] flex items-center space-x-1 focus:outline-none" @click="fetchData">
                            <icon name="material-symbols:search"></icon>
                            <span class="text-[#1a76d2] font-semibold">Cerca</span>
                        </button>
                        <input v-model="search"  type="text" placeholder="Inserisci nome ditta o id" class="bg-transparent text-[#94a3b8] focus:outline-none w-full placeholder-[#94a3b8]">
                    </div>
                </div>
                <div class="mt-6 flex justify-between flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
                    <div class="mt-6 flex justify-between flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
                    <!-- Filter Section -->
                        <span v-if="sendModeEnabled && !dittasEmails.length">
                            Seleziona le ditta a cui inviare la segnalazione
                        </span>
                        <span v-if="sendModeEnabled && dittasEmails.length">
                            {{ dittasEmails.length }} ditte Selezionte
                        </span>
                        <button class="bg-[#6972fa] hover:bg-[#5c64e6] text-white font-semibold py-2 px-4 rounded-lg flex items-center"
                            @click="onSendDittaEmails" 
                            v-if="!sendModeEnabled || (sendModeEnabled && dittasEmails.length)">
                            <icon  class="size-6" name="material-symbols:stacked-email"/>
                            <span class="ml-2">Invia report</span>
                        </button>
                        <button class="bg-[#6972fa] hover:bg-[#5c64e6] text-white font-semibold py-2 px-4 rounded-lg flex items-center"
                            @click="disableSendMode"
                            v-if="sendModeEnabled"
                            >
                            <icon  class="size-6" name="material-symbols:close-rounded"/>
                            <span class="ml-2">Annulla</span>
                        </button>
                    </div>
                    <div class="bg-[#17254D] text-white py-2 px-4 rounded-lg flex items-center space-x-2 justify-right">
                        <span class="flex flex-row gap-2 items-center rounded-full">
                            <div class="text-lg">Collaboratore incaricato:</div>
                        <DropdownMenu
                            :id="'collaborator_dropdown'"
                            class="w-[12rem] h-[3rem]"
                            :label="selectedCollaborator"
                            @change="collaboratorChanged"
                            :items="appointedCollaborators"
                            close-on-click
                        ></DropdownMenu>
                        </span>
                    </div>
                </div>
                <div class="shadow-md di mt-4 p-8 border rounded-xl">
                    <table class="table-auto min-w-full divide-y divide-gray-200 no-hover">
                        <thead>
                            <tr>
                                <th v-if="sendModeEnabled">
                                    <input type="checkbox" :disabled="true"/>
                                </th>
                                <th>Nome Ditta</th>
                                <th>Numero Ditta</th>
                                <th>Partita IVA</th>
                                <th>Frequenze</th>
                                <th>Vista teamsystem Default</th>
                                <th>Tipi di report</th>
                                <th>Azione</th>
                            </tr>
                        </thead>
                        <tbody>
                            <template v-for="(ditta, index) in userDittasModel.dittas" :key="index">
                                <tr>
                                    <td v-if="sendModeEnabled">
                                        <input type="checkbox" v-model="dittasEmails" :value="ditta" />
                                    </td>
                                    <td>{{ ditta.registered_name }}</td>
                                    <td>{{ ditta.ditta_number }}</td>
                                    <td>{{ ditta.vat_id }}</td>
                                        <td>
                                            {{
                                            dropDownLabel(ditta.report_frequencies,settingsMappings.getReportFrequencyTypeMap.value)
                                            }}
                                        </td>
                                        <td>{{ dropDownLabel(ditta.vista_teamsystem_frequency ,settingsMappings.getTeamSystemFrequencyMap.value) }}</td>
                                        <td>
                                            {{ dropDownLabel(ditta.report_types, settingsMappings.getReportTypeMap.value) }}
                                        </td>
                                    <td>
                                        <div class="px-5 py-5 text-sm flex gap-2">
                                        <button @click="editDitta(index)" class="text-teal-300 hover:text-teal-500"
                                            v-if="editingIndex !== index">
                                            <icon class="text-accent text-2xl" name="material-symbols:edit-square">
                                            </icon>
                                        </button>
                                    </div>
                                    </td>
                                </tr>
                            </template>
                        </tbody>
                    </table>
                    <div class="">
                        <div class="w-full h-[116px] flex flex-col justify-end px-4">
                            <div class="flex justify-between items-center mb-4">
                                <div class="flex items-center space-x-2">
                                    <div
                                        class="bg-[#222e3b] text-[#94a3b8] text-sm px-3 py-1 rounded-full flex items-center space-x-2">
                                        <div
                                            class="bg-[#222e3b] text-[#94a3b8] text-sm px-3 py-1 rounded-full flex items-center space-x-2">
                                            <span>Risultati</span>
                                            <select v-model="pageSize"
                                                class="bg-[#263647] text-white text-xs px-2 py-1 rounded-full outline-none">
                                                <option v-for="number in pageSizeOptions" :key="number" :value="number">
                                                    {{ number }}</option>
                                            </select>
                                            <i class="fas fa-chevron-down text-[#94a3b8]"></i>
                                        </div>
                                    </div>
                                    <span>{{ (currentPage - 1) * pageSize + 1 }} - {{ currentPage * pageSize }} di {{
                                        totalRecords }} elementi</span>
                                </div>
                                <div class="flex items-center space-x-2">
                                    <button @click="firstPage"
                                    :disabled="currentPage === 1"
                                        class="text-teal-300 hover:text-teal-500 text-lg px-3 py-1 rounded-full">
                                        <icon class="text-accent text-2xl" name="ion:md-skip-backward"></icon>
                                    </button>
                                    <button @click="lastPage"
                                    :disabled="currentPage === 1"
                                        class="text-teal-300 hover:text-teal-500 text-lg px-3 py-1 rounded-full">
                                        <icon class="text-accent text-2xl" name="material-symbols:arrow-back-ios-new">
                                        </icon>
                                    </button>
                                    <div class="bg-[#222e3b] text-[#94a3b8] text-lg px-4 py-1 rounded-full"> {{
                                        currentPage }} </div>
                                    <span>di {{ totalPages }}</span>
                                    <button @click="nextPage"
                                    :disabled="currentPage === totalPages"
                                        class="text-teal-300 hover:text-teal-500 text-lg px-3 py-1 rounded-full">
                                        <icon class="text-accent text-2xl"
                                            name="material-symbols:arrow-forward-ios-rounded"></icon>
                                    </button>
                                    <button @click="endPage"
                                    :disabled="currentPage === totalPages"
                                        class="text-teal-300 hover:text-teal-500 text-lg px-3 py-1 rounded-full">
                                        <icon class="text-accent text-2xl" name="ion:md-skip-forward"></icon>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="fixed bottom-0 left-0 right-0 z-50 text-[#94a3b8]">
            <div v-for="(alertId, index) in Object.keys(Alerts).filter(al => Alerts[al])" class="text-lg w-full flex items-center justify-center py-px">
                <div class="bg-[#182235] text-[#94a3b8] px-4 py-2 rounded-full flex items-center space-x-2 border border-[#2680eb]">
                    <icon v-if="alertId" :name="Alerts[alertId].icon"></icon>
                    <span>{{ Alerts[alertId].message }}</span>
                    <button class="text-[#94a3b8] focus:outline-none" @click="clearAlert">
                        <icon name="material-symbols:close-rounded"></icon>
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { useSettingsMappings } from "~/composables/settings/settings_mappings";
import { useMounted, watchDebounced } from "@vueuse/core";
import l, { set } from "lodash";
import { ref } from "vue";
import { useCpa } from "~/composables/store/cpa_store";
import { useTeamsystemStats } from "~/composables/teamsystem_summary";
const { $notifications } = useNuxtApp();

const cpa = useCpa();
const mounted = useMounted();
const fetching = ref<boolean>(true);
const fetchingContact = ref<boolean>(false);
const dittaSendingEmail = ref(-1);
const endpoints = useEndpoints();
const { api } = useApi();
const userDittasModel = ref<any>({});
const settingsMappings = useSettingsMappings();
const editingIndex = ref(-1);
const editingDittaContacts = ref<any>([]);
const editingValues = ref<any>(null);
const ContactIdsToBeDeleted = ref<number[]>([]);
const search = ref("");
const detailsModalSheet = useModalSheet();
const alertText = ref("");
const alertIcon = ref("");
const Alerts = ref<any[]>([]);
const pageSize = ref<number>(10);
const currentPage = ref(1);
const totalPages = ref(1);
const totalRecords = ref(0);
const allPages = ref<number[]>([]);
const pageSizeOptions = [10, 20, 30, 40, 50];
const validationErrors = ref<any>({});
const appointedCollaborators = ref<string[]>([]);
const selectedCollaborator = ref<string>("tutte");
const sendModeEnabled = ref<boolean>(false);
const dittasEmails = ref<number[]>([]);

const collaboratorChanged = (collaborator: string) => {
    selectedCollaborator.value = collaborator;
    fetchData();
};

const disableSendMode = () => {
    sendModeEnabled.value = false;
    dittasEmails.value = [];
};


async function  onSendDittaEmails(){
    if (!sendModeEnabled.value) {
        sendModeEnabled.value = true;
    } else {
        if (dittasEmails.value.length) {
            console.log(`sending emails for list of dittas: ${JSON.stringify(dittasEmails.value)}`);
            await doSendEmailsFor(dittasEmails.value)
        }
        sendModeEnabled.value = !sendModeEnabled.value;
        dittasEmails.value = [];
        
    }
};

async function doSendEmailsFor(dittas: number[]){
    dittas.forEach(async (currentDitta) => {
        await sendTeamSystemEmail(currentDitta);
        await sendDittaReportEmail(currentDitta);
        // await sendDittaEmail(currentDitta);
    });
};

const clearAlert = () => {
    alertText.value = "";
};

const lastPage = () => {
    if (currentPage.value > 1) {
        currentPage.value -= 1;
    }
};

const nextPage = () => {
    if (currentPage.value < totalPages.value) {
        currentPage.value += 1;
    }
};
const firstPage = () => {
    currentPage.value = 1;
};

const endPage = () => {
    currentPage.value = totalPages.value;
};
const config = useRuntimeConfig();

const focusData = ref<{ ditta: any; title: string, save: any }>({ ditta: {}, title: "", save: () => saveDitta(undefined)});

async function editDitta(index: number) {
    await fetchDittaContacts(userDittasModel.value.dittas[index].id);
    editingValues.value = l.cloneDeep(userDittasModel.value.dittas[index]);
    console.log(`editing ditta: ${JSON.stringify(editingValues.value)}`);
    const ditta = userDittasModel.value.dittas[index];
    focusData.value = { ditta: ditta, title: "Dettagli" , save: () => saveDittaAndContacts(ditta)};
    detailsModalSheet.toggle(true, <ModalSheetProps>{ title: focusData.value.title , save: focusData.value.save});
}

const updateDitta = (ditta: any) => {
    console.log(`updating ditta: ${JSON.stringify(ditta)}`);
    updateDittaSettings(ditta);
};

const saveDitta = (ditta: any) => {
    const updatedValues = {
        report_frequencies: [...focusData.value.ditta.report_frequencies],
        report_types: [...focusData.value.ditta.report_types],
        vista_teamsystem_frequency : focusData.value.ditta.vista_teamsystem_frequency[0],
        id: ditta.id,
    };
    updateDitta(updatedValues);
    editingIndex.value = -1;
    detailsModalSheet.toggle(false);
};
const saveDittaAndContacts = (ditta: any) => {
    for (let i = 0; i < editingDittaContacts.value.length; i++) {
        if (!editingDittaContacts.value[i].first_name) {
            validationErrors.value[`first_name.${i}`] = true;
        } else {
            validationErrors.value[`first_name.${i}`] = false;
        }
        if (!editingDittaContacts.value[i].last_name) {
            validationErrors.value[`last_name.${i}`] = true;
        } else {
            validationErrors.value[`last_name.${i}`] = false;
        }
        if (!editingDittaContacts.value[i].email || (editingDittaContacts.value[i].email && !editingDittaContacts.value[i].email.includes("@"))) {
            validationErrors.value[`email.${i}`] = true;
        } else {
            validationErrors.value[`email.${i}`] = false;
        }
    }
    if (Object.values(validationErrors.value).some((val) => val)) {
        return;
    }

    const updatedValues = {
        report_frequencies: [...focusData.value.ditta.report_frequencies],
        report_types: [...focusData.value.ditta.report_types],
        vista_teamsystem_frequency: focusData.value.ditta.vista_teamsystem_frequency,
        id: ditta.id,
    };
    updateDitta(updatedValues);
    editingIndex.value = -1;
    for (let i = 0; i < editingDittaContacts.value.length; i++) {
        saveContact(ditta.id, i, editingDittaContacts.value[i].contact_id);
    }
    ContactIdsToBeDeleted.value.forEach((contactId) => {
        deleteContact(contactId);
    });
    ContactIdsToBeDeleted.value = [];
    Alerts.value[ditta.id] = {
        message: "Ditta e contatti salvati correttamente",
        icon: "material-symbols:check",
    };
    setTimeout(() => {
        Alerts.value[ditta.id] = null;
    }, 2000);

    detailsModalSheet.toggle(false);
};
async function sendDittaEmail(ditta: any){
    return;
    // if(ditta.report_types.has('f24') || ditta.report_types.has('fatture360') || ditta.report_types.has('consigliai') || ditta.report_types.has('personalizzato')) {
    //     console.log(`sending old ditta email to ditta: ${JSON.stringify(ditta.registered_name)}`);
    //     Alerts.value[ditta.id] = {
    //         message: `Invio email in corso per la ditta  ${ditta.registered_name} ...`,
    //         icon: "svg-spinners:180-ring",
    //     };
    //     dittaSendingEmail.value = ditta.id;
    //     await api(endpoints.dittasReports, {
    //         method: "POST",
    //         url: "generate_report",
    //         body: { dittaId: ditta.id,customerId: cpa.getData.id,},
    //         onResponse: async ({ request, response, options }) => {
    //             if (response.ok) {
    //                 console.log(`email sent to ditta: ${JSON.stringify(response._data)}`);
    //             } else {
    //                 console.log(`problem with sending emails: ${JSON.stringify(response._data)}`);
    //             }
    //             dittaSendingEmail.value = -1;
    //             Alerts.value[ditta.id] = {
    //                 message: `Email inviata corretemente per la ditta  ${ditta.registered_name} ...`,
    //                 icon: "material-symbols:check",
    //             };
    //             setTimeout(() => {
    //                 Alerts.value[ditta.id] = null;
    //             }, 5000);
    //         },
    //         onResponseError({ request, response, options }) {
    //             console.log(`error sending emails: ${JSON.stringify(response._data)}`);
    //             Alerts.value[ditta.id] = {
    //                 message: `Errore nell'invio dell'email per la ditta  ${ditta.registered_name} ...`,
    //                 icon: "material-symbols:close-rounded",
    //             };
    //         },
    //     });
    // }
};

async function sendTeamSystemEmail(ditta: any){
    if(ditta.report_types.has('teamsystem')) {
        
        
        console.log(`sending teamstsem email to ditta: ${JSON.stringify(ditta.registered_name)}`);
        Alerts.value[ditta.id] = {
            message: `Invio email in corso per la ditta  ${ditta.registered_name} ...`,
            icon: "svg-spinners:180-ring",
        };
        await api(endpoints.teamSystemReport, {
            method: "POST",
            url: "generate_teamsystem_report",
            body: { dittaId: ditta.id,
                    customerId: cpa.getData.id,
                    data:{
                        mode:[...ditta.vista_teamsystem_frequency][0],
                        focus:"",
                        lastFiscalYear:"",
                        teamSystemLastAvailableDateStr:""
                    }, 
                    },
            onResponse: async ({ request, response, options }) => {
                if (response.ok) {
                    console.log(`email sent to ditta: ${JSON.stringify(response._data)}`);
                } else {
                    console.log(`problem with sending emails: ${JSON.stringify(response._data)}`);
                }
                dittaSendingEmail.value = -1;
                Alerts.value[ditta.id] = {
                    message: `Email inviata corretemente per la ditta  ${ditta.registered_name} ...`,
                    icon: "material-symbols:check",
                };
                setTimeout(() => {
                    Alerts.value[ditta.id] = null;
                }, 5000);
            },
            onResponseError({ request, response, options }) {
                console.log(`error sending emails: ${JSON.stringify(response._data)}`);
                Alerts.value[ditta.id] = {
                    message: `Errore nell'invio dell'email per la ditta  ${ditta.registered_name} ...`,
                    icon: "material-symbols:close-rounded",
                };
            },
        });
    }
};

async function sendDittaReportEmail(ditta : any) {
    if(ditta.report_types.has('ditte360')) {
        
   
        console.log(`sending ditta report email to ditta: ${JSON.stringify(ditta.registered_name)}`);
        console.log(`dittaId:${ditta.id} customerId:${cpa.getData.id}`);
        Alerts.value[ditta.id] = {
            message: `Invio email in corso per la ditta  ${ditta.registered_name} ...`,
            icon: "svg-spinners:180-ring",
        };
    
        await api(endpoints.ditta_360_Report, {
            method: "POST",
            body: {
                dittaId: ditta.id, customerId: cpa.getData.id
            },
            onResponse: async ({ request, response, options }) => {
                if (response.ok) {
                    
                    console.log(`email sent to ditta: ${JSON.stringify(response._data)}`);
                } else {
                    console.log(`problem with sending emails: ${JSON.stringify(response._data)}`);
                }
                
                Alerts.value[ditta.id] = {
                    message: `Email inviata corretemente per la ditta  ${ditta.registered_name} ...`,
                    icon: "material-symbols:check",
                };
                setTimeout(() => {
                    Alerts.value[ditta.id] = null;
                }, 5000);
                
            },
            onResponseError({ request, response, options }) {
                Alerts.value[ditta.id] = {
                    message: `Errore nell'invio dell'email per la ditta  ${ditta.registered_name} ...`,
                    icon: "material-symbols:close-rounded",
                };
            },
        });
    }
};


const saveContact = (dittaId: number, contactIndex: number, contact_id: number) => {
    console.log(`saving contact: ${JSON.stringify(editingDittaContacts.value[contactIndex])}`);
    if (contact_id) {
        // Update contact
        updateContact(editingDittaContacts.value[contactIndex], contact_id, dittaId);
    } else {
        // Create contact
        createContact(editingDittaContacts.value[contactIndex], dittaId);
    }
};

const addNewContact = () => {
    editingDittaContacts.value = [...editingDittaContacts.value, {}];
};
const removeContact = (contactId: number, contactIndex: number) => {
    ContactIdsToBeDeleted.value.push(contactId);
    editingDittaContacts.value = editingDittaContacts.value.filter(
        (contact: any, index: number) => index !== contactIndex
    );
};

function toggleSetElement(set: Set<string>, elem: string) {
    if (set.has(elem)) {
        set.delete(elem);
    } else {
        set.add(elem);
        if (elem === "manual") {
            set.clear();
            set.add(elem);
        }
        if (elem !== "manual") {
            set.delete("manual");
        }
        if (elem !== "tutte") {
            set.delete("tutte");
        } else {
            set.clear();
        }
    }
    // if (set.size <= 0) {
    //     set.add("tutte");
    // }
}

function dropDownLabel(elems: Set<string>, options: any = {}) {
    if (options && Object.keys(options).length > 0){
        return l.trim([...elems].map((elem) => options[elem]).join(","), ',');
    }
    return [...elems].join(",");
}

async function fetchData() {
    fetching.value = true;
    const lowerSearch = search.value.toLowerCase();
    await api(endpoints.userDittas, {
        method: "GET",
        query: { customer_id: cpa.getData.id},
        onResponse: async ({ request, response, options }) => {
            if (response.ok) {
                const responseData = response._data.data;
                const allDittas = responseData.dittas;
                const allAppointedCollaborators = allDittas.map((ditta: any) => ditta.appointed_collaborator).filter((collaborator: any) => collaborator)
                appointedCollaborators.value = ["tutte",...new Set(allAppointedCollaborators)].map((collaborator: any) => (collaborator));
                const dittasData = allDittas.map((obj: any) => ({
                    ...obj,
                    report_frequencies: obj.report_frequencies ? new Set(obj.report_frequencies) : new Set(),
                    report_types: obj.report_types ? new Set(obj.report_types) : new Set(),
                    vista_teamsystem_frequency: new Set([obj.vista_teamsystem_frequency]),
                })).filter((ditta: any) =>
                    (ditta.ditta_number && ditta.ditta_number.toString().toLowerCase().includes(lowerSearch)) || (ditta.registered_name && ditta.registered_name.toLowerCase().includes(lowerSearch))
                ).filter((ditta: any) => selectedCollaborator.value === "tutte" || ditta.appointed_collaborator === selectedCollaborator.value);
                totalPages.value = Math.ceil(dittasData.length / pageSize.value);
                totalRecords.value = dittasData.length;
                allPages.value = Array.from({ length: totalPages.value }, (_, i) => i + 1);
                const currentPageData = dittasData.slice((currentPage.value - 1) * pageSize.value, currentPage.value * pageSize.value)
                userDittasModel.value = {
                    ...responseData,
                    dittas: currentPageData,
                };
            } else {
                console.log(`problem with fetching dittas: ${JSON.stringify(response._data)}`);
            }
            fetching.value = false;
        },
        onResponseError({ request, response, options }) {
            console.log(`error fetching invoices: ${JSON.stringify(response._data)}`);
        },
    });
}

async function updateDittaSettings(dittaDetails: any) {
    //fetching.value = true;
    console.log(`updating ditta settings: ${JSON.stringify(dittaDetails)}`);
    api(endpoints.userDittas, {
        method: "PATCH",
        query: { customer_id: cpa.getData.id },
        body: {
            scraper_api_token: cpa.scraperApiAccess,
            dittas: [
                {
                    id: dittaDetails.id,
                    report_frequencies: dittaDetails.report_frequencies,
                    report_types: dittaDetails.report_types,
                    vista_teamsystem_frequency: dittaDetails.vista_teamsystem_frequency[0],
                },
            ],
        },
        onResponse: async ({ request, response, options }) => {
            if (response.ok) {
                console.log(`ditta settings updated`);
                fetchData();
                console.log(`ditta edit submitted`);
            } else {
                console.log(`problem with fetching ditta execution details: ${JSON.stringify(response._data)}`);
            }
            //fetching.value = false;
        },
        onResponseError({ request, response, options }) {
            //fetching.value = false;
            console.log(`error fetching ditta execution details: ${JSON.stringify(response._data)}`);
        },
    });
}

async function createContact(body: any, ditta_id: number) {
    fetchingContact.value = true;
    await api(endpoints.userDittasContacts, {
        method: "POST",
        body: { ...body, ditta: ditta_id },
        query: { scraperApiAccess: cpa.scraperApiAccess },
        onResponse: async ({ request, response, options }) => {
            if (response.ok) {
                fetchDittaContacts(ditta_id);
            } else {
                console.log(`problem with fetching dittas contact: ${JSON.stringify(response._data)}`);
            }
            fetchingContact.value = false;
        },
        onResponseError({ request, response, options }) {
            console.log(`error fetching invoices: ${JSON.stringify(response._data)}`);
        },
    });
}

async function updateContact(body: any, contact_id: number, ditta_id: number) {
    fetchingContact.value = true;
    await api(endpoints.userDittasContacts, {
        method: "PATCH",
        body: { ...body },
        query: { scraperApiAccess: cpa.scraperApiAccess, contact_id: contact_id },
        onResponse: async ({ request, response, options }) => {
            if (response.ok) {
                const updatedContact = response._data.data;
                editingDittaContacts.value = editingDittaContacts.value.map((contact: any) => {
                    if (contact.contact_id === contact_id) {
                        return updatedContact;
                    }
                    return contact;
                });
            } else {
                console.log(`problem with fetching dittas: ${JSON.stringify(response._data)}`);
            }
            fetchingContact.value = false;
        },
        onResponseError({ request, response, options }) {
            console.log(`error fetching invoices: ${JSON.stringify(response._data)}`);
        },
    });
}

async function deleteContact(contactId: number) {
    fetchingContact.value = true;
    await api(endpoints.userDittasContacts, {
        method: "DELETE",
        query: { scraperApiAccess: cpa.scraperApiAccess, contact_id: contactId },
        onResponse: async ({ request, response, options }) => {
            if (response.ok) {
                editingDittaContacts.value = editingDittaContacts.value.filter(
                    (contact: any) => contact.contact_id !== contactId
                );
            } else {
                console.log(`problem with fetching dittas: ${JSON.stringify(response._data)}`);
            }
            fetchingContact.value = false;
        },
        onResponseError({ request, response, options }) {
            console.log(`error fetching invoices: ${JSON.stringify(response._data)}`);
        },
    });
}

async function fetchDittaContacts(ditta_id: number) {
    fetchingContact.value = true;
    await api(endpoints.userDittasContacts, {
        method: "GET",
        query: { ditta_id: ditta_id, scraperApiAccess: cpa.scraperApiAccess },
        onResponse: async ({ request, response, options }) => {
            if (response.ok) {
                const responseData = response._data.data;
                editingDittaContacts.value = responseData.dittasContacts.results;
            } else {
                console.log(`problem with fetching dittas: ${JSON.stringify(response._data)}`);
            }
            fetchingContact.value = false;
        },
        onResponseError({ request, response, options }) {
            console.log(`error fetching invoices: ${JSON.stringify(response._data)}`);
        },
    });
}

onMounted(() => {
    fetchData();
});
watch(selectedCollaborator, fetchData);
watch(currentPage, fetchData);
watch(pageSize, fetchData);
watchDebounced(
    search,
  () => { fetchData();},
  { debounce: 1500, maxWait: 1000 },
)

</script>

<style lang="css" scoped>
.wrapper {
    @apply flex flex-col items-stretch gap-8 w-full;
}

.conto-table th {
    @apply border-t-0 border-l-0 border-r-0 border-b-[2px] bg-surface h-[var(--header-height)] !important;
}

.section {
    @apply flex flex-col gap-4;
}
.tabkle th {
    @apply py-2 px-4;
}
.sub-section {
    @apply flex flex-col gap-2;
}
</style>
