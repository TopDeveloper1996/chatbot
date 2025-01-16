<template>
    <div v-if="mounted" class="flex flex-col flex-grow">
      <Transition name="fade" appear mode="out-in">
        <div v-if="fetching" class="flex justify-center w-full">
          <div class="flex items-center flex-row gap-2">
            <icon class="size-6" name="line-md:loading-twotone-loop"></icon>
            <p class="">Recuperando i dati</p>
          </div>
        </div>
  
        <div
          v-else
          class="py-2 flex w-full flex-col gap-4"
          v-if="userDittasModel.dittas"
        >
          <div class="sticky top-0 bg-gray-900 z-20 p-4">
            <h1 class="view-title">Stato ditte</h1>
            <span class="flex flex-row gap-2 items-center justify-end">
              <div class="flex justify-between items-center mb-4">
                <div class="absolute top-4 right-4">
                  <h3>{{ cpa.getDisplayData.name }}</h3>
                </div>
              </div>
              <icon
                name="material-symbols-light:business-center-rounded"
                class="size-8 text-accent"
              ></icon>
              <p class="buttom-4 right-4">
                {{ userDittasModel.dittas.length }} ditte registrate
              </p>
            </span>
            <div class="w-full h-[60px] flex items-center justify-left">
              <div
                class="bg-[#182235] text-[#94a3b8] w-full px-4 py-2 rounded-full flex items-center space-x-2 border border-[#2e4a67]"
              >
                <button
                  class="text-[#1a76d2] flex items-center space-x-1 focus:outline-none"
                  @click="fetchData"
                >
                  <icon name="material-symbols:search"></icon>
                  <span class="text-[#1a76d2] font-semibold">Cerca</span>
                </button>
                <input
                  v-model="searchQuery"
                  type="text"
                  placeholder="Inserisci nome ditta o id"
                  class="bg-transparent text-[#94a3b8] focus:outline-none w-full placeholder-[#94a3b8]"
                />
              </div>
            </div>
          </div>
          <div class="flex flex-col justify-stretch">
            <div class="justify-center flex flex-row gap-8">
              <button
                title="Aggiungi una ditta singolarmente"
                class="card-button"
                @click="addDitta"
              >
                <p>Aggiungi ditta</p>
                <icon name="bi:cloud-plus-fill"></icon></button
              ><button
                title="Aggiungi più ditte contemporaneamente"
                class="card-button"
                @click="addBulkDittas"
              >
                <p>Aggiunta multipla</p>
                <icon name="fluent:add-square-multiple-24-filled"></icon>
              </button>
              <button
                v-if="!bulkEditing"
                @click="() => toggleBulkEditing()"
                class="card-button"
              >
                <p>Aggiorna più ditte</p>
                <icon name="material-symbols:edit-rounded"></icon>
              </button>
            </div>
  
            <div
              class="justify-center flex mt-8 gap-4 flex-row items-center"
              v-if="userDittasModel.dittas"
            >
              <button
                v-if="bulkEditing"
                @click="() => toggleBulkEditing()"
                class="secondary-button"
              >
                <p>Annulla selezione</p>
              </button>
              <button
                :disabled="userDittasModel.dittas.filter((e: any) => e.selected).length<=0"
                v-if="bulkEditing"
                @click="() => bulkEdit()"
                class="primary-button"
              >
                <p>Modifica impostazioni</p>
                <icon
                  class="size-8"
                  name="material-symbols:chevron-right-rounded"
                ></icon>
              </button>
            </div>
            <div
              class="bg-[#0B1631] flex justify-left items-center"
              v-if="dittasInSync.length"
            >
              <div
                class="bg-[#172347] text-white w-[650px] py-4 px-6 rounded-lg flex items-center justify-between w-full"
              >
                <div class="flex items-start space-x-3">
                  <div>
                    <p class="text-base w-full">
                      <icon
                        name="ic:outline-access-time"
                        class="text-[#F7891E] text-2xl mt-1"
                      />
                      Stiamo sincronizzando {{ dittasInSync.length }} ditte da
                      TeamSystem, questo processo può richiedere del tempo.
                    </p>
                    <ul
                      class="mt-2 text-sm list-disc list-inside"
                      v-if="!hideSyncDittas"
                    >
                      <li v-for="d in dittasInSync">
                        {{ d.registered_name }} -
                        {{ strToDateLabel(d.report_start_date) }} |
                        {{ strToDateLabel(d.report_end_date) }} - {{ d.status }}
                      </li>
                    </ul>
                  </div>
                </div>
                <button
                  v-if="hideSyncDittas"
                  @click="() => (hideSyncDittas = !hideSyncDittas)"
                >
                  <icon
                    name="ion:ios-arrow-down"
                    class="items-stretch justify-end text-white text-sm"
                  />
                </button>
                <button
                  v-if="!hideSyncDittas"
                  @click="() => (hideSyncDittas = !hideSyncDittas)"
                >
                  <icon
                    name="ion:ios-arrow-up"
                    class="items-stretch justify-end text-white text-sm"
                  />
                </button>
              </div>
            </div>
            <div class="p-4 flex items-center justify-between">
              <div
                class="w-full flex flex-col items-stretch justify-start gap-2 md:flex-row space-y-4 md:space-y-0 md:space-x-4"
              >
                <span v-if="downloadModeEnabled && !dittasToDownload.length">
                  Seleziona almeno una ditta da scaricare
                </span>
                <span v-if="teamsystemModeEnabled && !dittasToSync.length">
                  Seleziona almeno una ditta da sincronizzare
                </span>
                <span v-if="downloadModeEnabled && dittasToDownload.length">
                  Hai selezionato {{ dittasToDownload.length }}
                  <strong>ditte</strong>
                </span>
                <span v-if="teamsystemModeEnabled && dittasToSync.length">
                  Hai selezionato
                  <strong
                    >{{ dittasToSync.length }} ditte da sincronizzare</strong
                  >
                </span>
                <button
                  v-if="downloadModeEnabled && dittasToDownload.length"
                  @click="() => downloadData()"
                  class="bg-[#6972fa] hover:bg-[#5c64e6] text-white font-semibold py-2 px-4 rounded-lg flex items-center"
                >
                  <span class="ml-2">Download .csv </span>
                </button>
                <button
                  v-if="downloadModeEnabled"
                  @click="() => cancelDownload()"
                  class="secondary-button text-white font-semibold py-2 px-4 rounded-lg flex items-center"
                >
                  <p>Annula</p>
                </button>
                <button
                  v-if="!downloadModeEnabled && !teamsystemModeEnabled"
                  class="bg-accent hover:bg-[#5c64e6] text-white font-semibold py-2 px-4 rounded-lg flex items-center"
                  @click="onEnableDownloadMode"
                >
                  <span class="ml-2">Scarica questa tabella in formato .cvs</span>
                </button>
  
                <button
                  v-if="teamsystemModeEnabled && dittasToSync.length"
                  @click="() => doDittasSync()"
                  class="bg-[#6972fa] hover:bg-[#5c64e6] text-white font-semibold py-2 px-4 rounded-lg flex items-center"
                >
                  <span class="ml-2">Sincronizza</span>
                </button>
  
                <button
                  v-if="teamsystemModeEnabled"
                  @click="() => cancelTeamsystemMode()"
                  class="secondary-button text-white font-semibold py-2 px-4 rounded-lg flex items-center"
                >
                  <p>Annula</p>
                </button>
                <button
                  v-if="!teamsystemModeEnabled && !downloadModeEnabled"
                  class="bg-[#6972fa] hover:bg-[#5c64e6] text-white font-semibold py-2 px-4 rounded-lg flex items-center"
                  @click="onEnableTeamsystemMode"
                >
                  <span class="ml-2">Sincronizza TeamSystem</span>
                </button>
              </div>
  
              <div
                class="justify-end flex my-4 gap-4 flex-row items-center"
                v-if="userDittasModel.dittas"
              >
                <div class="flex flex-row items-center gap-2 text-nowrap">
                  <div>
                    <p>Mostra solo ditte con problemi</p>
                    <p class="text-sm text-red-400">
                      <span class="font-bold">
                        {{
                          userDittasModel.dittas.filter(
                            (d: any) => !d.is_delega_exist
                          ).length
                        }}</span
                      >
                      ditte con problemi
                    </p>
                  </div>
  
                  <Checkbox v-model="filters.errorsOnly"></Checkbox>
                </div>
                <InputField label="Collaboratore">
                  <DropdownMenu
                    @change="(v) => (filters.collaborator = v)"
                    class="min-w-[6rem]"
                    close-on-click
                    :items-formatter="(i) => stringUtils.wordCapitalize(i) ?? ''"
                    :label="stringUtils.wordCapitalize(filters.collaborator)!"
                    :items="['tutti', ...collaborators]"
                    id="collaborators_dropdown"
                  ></DropdownMenu>
                </InputField>
  
                <!-- <div>
                              <button class="secondary-button" @click="downloadData">
                                  <p>Scarica dati</p>
                                  <icon name="material-symbols:cloud-download-rounded" class="size-6"></icon>
                              </button>
                          </div> -->
              </div>
            </div>
  
            <table ref="table" class="conto-table select-none">
              <thead>
                <tr>
                  <th v-if="downloadModeEnabled || teamsystemModeEnabled">
                    Select
                  </th>
                  <th v-if="bulkEditing">
                    <div>
                      <p>Seleziona</p>
                    </div>
                  </th>
                  <th>
                    <div>
                      <p>Codice entratel</p>
                    </div>
                  </th>
                  <th>
                    <div>
                      <p>Tipo</p>
                    </div>
                  </th>
                  <th
                    class="cursor-pointer"
                    @click="() => sortByHeader('appointing_subject_cf')"
                  >
                    <div class="text-accent">
                      <p>Numero incaricato</p>
                      <icon
                        v-if="filters.sort === 'appointing_subject_cf'"
                        class="size-8"
                        :name="
                          filters.sortAscending
                            ? 'material-symbols:arrow-drop-down-rounded'
                            : 'material-symbols:arrow-drop-up-rounded'
                        "
                      ></icon>
                    </div>
                  </th>
                  <th
                    class="cursor-pointer"
                    @click="() => sortByHeader('ditta_number')"
                  >
                    <div class="text-accent">
                      <p>Numero ditta</p>
                      <icon
                        v-if="filters.sort === 'ditta_number'"
                        class="size-8"
                        :name="
                          filters.sortAscending
                            ? 'material-symbols:arrow-drop-down-rounded'
                            : 'material-symbols:arrow-drop-up-rounded'
                        "
                      ></icon>
                    </div>
                  </th>
                  <th
                    class="cursor-pointer"
                    @click="() => sortByHeader('registered_name')"
                  >
                    <div class="text-accent">
                      <p>Name</p>
                      <icon
                        v-if="filters.sort === 'registered_name'"
                        class="size-8"
                        :name="
                          filters.sortAscending
                            ? 'material-symbols:arrow-drop-down-rounded'
                            : 'material-symbols:arrow-drop-up-rounded'
                        "
                      ></icon>
                    </div>
                  </th>
                  <th class="max-w-36">
                    <div>
                      <p>Descrizione Codice ATECO</p>
                    </div>
                  </th>
                  <th
                    class="cursor-pointer"
                    @click="() => sortByHeader('invoice_count')"
                  >
                    <div class="text-accent">
                      <p>Fatture</p>
                      <icon
                        v-if="filters.sort === 'invoice_count'"
                        class="size-8"
                        :name="
                          filters.sortAscending
                            ? 'material-symbols:arrow-drop-down-rounded'
                            : 'material-symbols:arrow-drop-up-rounded'
                        "
                      ></icon>
                    </div>
                  </th>
                  <th
                    class="cursor-pointer"
                    @click="() => sortByHeader('fee_count')"
                  >
                    <div class="text-accent">
                      <p>Corrispettivi</p>
                      <icon
                        v-if="filters.sort === 'fee_count'"
                        class="size-8"
                        :name="
                          filters.sortAscending
                            ? 'material-symbols:arrow-drop-down-rounded'
                            : 'material-symbols:arrow-drop-up-rounded'
                        "
                      ></icon>
                    </div>
                  </th>
                  <th
                    class="cursor-pointer"
                    @click="() => sortByHeader('f24_count')"
                  >
                    <div class="text-accent">
                      <p>F24</p>
                      <icon
                        v-if="filters.sort === 'f24_count'"
                        class="size-8"
                        :name="
                          filters.sortAscending
                            ? 'material-symbols:arrow-drop-down-rounded'
                            : 'material-symbols:arrow-drop-up-rounded'
                        "
                      ></icon>
                    </div>
                  </th>
                  <th
                    class="cursor-pointer"
                    @click="() => sortByHeader('invoice_sale')"
                  >
                    <div class="text-accent">
                      <p>Fatturato</p>
                      <icon
                        v-if="filters.sort === 'invoice_sale'"
                        class="size-8"
                        :name="
                          filters.sortAscending
                            ? 'material-symbols:arrow-drop-down-rounded'
                            : 'material-symbols:arrow-drop-up-rounded'
                        "
                      ></icon>
                    </div>
                  </th>
                  <th>
                    <div>
                      <p>Partita IVA</p>
                    </div>
                  </th>
                  <th>
                    <div>
                      <p>Codice fiscale</p>
                    </div>
                  </th>
                  <th
                    class="cursor-pointer"
                    @click="() => sortByHeader('appointed_collaborator')"
                  >
                    <div class="text-accent">
                      <p>Incaricato</p>
                      <icon
                        v-if="filters.sort === 'appointed_collaborator'"
                        class="size-8"
                        :name="
                          filters.sortAscending
                            ? 'material-symbols:arrow-drop-down-rounded'
                            : 'material-symbols:arrow-drop-up-rounded'
                        "
                      ></icon>
                    </div>
                  </th>
                  <th>
                    <div>
                      <p>Esecuzioni</p>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr
                  :id="i.toString()"
                  @click="() => dittaClicked(ditta)"
                  v-for="(ditta, i) of filteredDittas"
                  class="cursor-pointer pointer-events-auto"
                  :style="{
                    '--bg': ditta.is_delega_exist
                      ? i % 2 === 0
                        ? '#1E2742'
                        : '#13192F'
                      : '#AD1F4E66',
                  }"
                >
                  <td
                    @click="($event) => $event.stopPropagation()"
                    v-if="downloadModeEnabled"
                  >
                    <input
                      type="checkbox"
                      v-model="dittasToDownload"
                      :value="ditta.id"
                    />
                  </td>
                  <td
                    @click="($event) => $event.stopPropagation()"
                    v-if="teamsystemModeEnabled"
                  >
                    <input
                      type="checkbox"
                      v-model="dittasToSync"
                      :value="ditta.id"
                    />
                  </td>
                  <td v-if="bulkEditing" class="text-center">
                    <input
                      v-model="ditta.selected"
                      class="accent-accent size-4"
                      type="checkbox"
                    />
                  </td>
                  <td>{{ ditta.codice_entratel }}</td>
                  <td>{{ accessTypeToString(ditta.access_type) }}</td>
                  <td>{{ ditta.appointing_subject_cf }}</td>
                  <td>{{ ditta.ditta_number }}</td>
                  <td>{{ stringUtils.wordCapitalize(ditta.registered_name) }}</td>
                  <td>{{ ditta.ateco_description }}</td>
                  <td>{{ ditta.invoice_count }}</td>
                  <td>{{ ditta.fee_count }}</td>
                  <td>{{ ditta.f24_count }}</td>
                  <td>{{ formatCurrency( ditta.invoice_sale )}}</td>
                  <td>{{ ditta.vat_id }}</td>
                  <td>{{ ditta.codice_fiscale?.toLocaleUpperCase() }}</td>
                  <td>
                    {{ stringUtils.capitalize(ditta.appointed_collaborator) }}
                  </td>
                  <td class="w-[25%]">
                    <div class="flex flex-col gap-2">
                      <div class="flex flex-col items-start">
                        <p class="text-base font-bold">
                          Scraper:
                          <span
                            class="font-bold"
                            :class="[getExecutionDateColor((ditta.executions?.scraper as Date))]"
                            >{{
                              (
                                ditta.executions?.scraper as Date | undefined
                              )?.toLocaleString()
                            }}</span
                          >
                        </p>
                        <p>
                          <span>{{ `● Fatture attive: ` }}</span
                          ><span
                            class="font-bold"
                            :class="[getExecutionDateColor((ditta.executions?.active as Date))]"
                            >{{
                              (
                                ditta.executions?.active as Date | undefined
                              )?.toLocaleString()
                            }}</span
                          >
                        </p>
                        <p>
                          <span>{{ `● Fatture passive: ` }}</span
                          ><span
                            class="font-bold"
                            :class="[getExecutionDateColor((ditta.executions?.passive as Date))]"
                            >{{
                              (
                                ditta.executions?.passive as Date | undefined
                              )?.toLocaleString()
                            }}</span
                          >
                        </p>
                        <p>
                          <span>{{ `● Corrispettivi: ` }}</span
                          ><span
                            class="font-bold"
                            :class="[getExecutionDateColor((ditta.executions?.corrispettivi as Date))]"
                            >{{
                              (
                                ditta.executions?.corrispettivi as
                                  | Date
                                  | undefined
                              )?.toLocaleString()
                            }}</span
                          >
                        </p>
                      </div>
                      <div class="flex flex-col items-start">
                        <p class="text-base font-bold">
                          Cassetto fiscale:
                          <span
                            class="font-bold"
                            :class="[getExecutionDateColor((ditta.executions?.f24 as Date))]"
                            >{{
                              (
                                ditta.executions?.f24 as Date | undefined
                              )?.toLocaleString()
                            }}</span
                          >
                        </p>
                        <p>
                          <span>{{ `● F24 download: ` }}</span
                          ><span
                            class="font-bold"
                            :class="[getExecutionDateColor((ditta.executions?.f24_download as Date))]"
                            >{{
                              (
                                ditta.executions?.f24_download as Date | undefined
                              )?.toLocaleString()
                            }}</span
                          >
                        </p>
                      </div>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </Transition>
      <ModalSheet :controller="modalSheet" height="100%">
        <div class="px-8">
          <div v-if="modalSheetSetup === ModalSheetSetup.info">
            <DittasInfoPanel
              @ditta-edited="fetchData"
              @ditta-deleted="fetchData"
              :collaborators="userDittasModel.collaborators"
              :profiles="userDittasModel.profiles"
              :ditta-model="selectedDittaModel"
            ></DittasInfoPanel>
          </div>
          <div v-else-if="modalSheetSetup === ModalSheetSetup.add">
            <DittasAddPanel
              @ditta-added="fetchData"
              :collaborators="userDittasModel.collaborators"
              :profiles="userDittasModel.profiles"
              :ditta-model="selectedDittaModel"
            ></DittasAddPanel>
          </div>
          <div v-else-if="modalSheetSetup === ModalSheetSetup.bulk_add">
            <DittasBulkAddPanel
              @dittas-added="fetchData"
              :collaborators="userDittasModel.collaborators"
              :profiles="userDittasModel.profiles"
            ></DittasBulkAddPanel>
          </div>
          <div v-else-if="modalSheetSetup === ModalSheetSetup.bulk_edit">
            <DittasBulkEditPanel
              @ditta-edited="fetchData"
              :dittas="selectedDittas"
              :collaborators="userDittasModel.collaborators"
              :profiles="userDittasModel.profiles"
            ></DittasBulkEditPanel>
          </div>
          <div v-else-if="modalSheetSetup === ModalSheetSetup.ts_async">
            <DittasTeamsystemSync
              @ditta-sync-started="fetchTeamsystemeQueue"
              :dittas="fullDittasToSync"
            ></DittasTeamsystemSync>
          </div>
        </div>
      </ModalSheet>
    </div>
  </template>
  
  <script lang="ts" setup>
  enum ModalSheetSetup {
    info,
    add,
    bulk_add,
    bulk_edit,
    ts_async,
  }
  
  import { parse } from "date-fns";
  import l, { head } from "lodash";
  import * as stringUtils from "~/src/common/string";
  import { strToDateLabel } from "~/src/common/dates.js";
  type HeaderSort =
    | "ditta_number"
    | "registered_name"
    | "appointing_subject_cf"
    | "appointed_collaborator"
    | "invoice_count"
    | "invoice_sale"
    | "fee_count"
    | "f24_count";
  
  const table = ref<HTMLElement>();
  const mounted = useMounted();
  const fileSaver = useFileDownloader();
  const modalSheetSetup = ref<ModalSheetSetup>(ModalSheetSetup.info);
  const fetching = ref<boolean>(true);
  const endpoints = useEndpoints();
  const cpa = useCpa();
  const { api } = useApi();
  const userDittasModel = ref<any>({});
  const searchQuery = ref<string>("");
  const downloadModeEnabled = ref<boolean>(false);
  const teamsystemModeEnabled = ref<boolean>(false);
  const dittasToDownload = ref<any[]>([]);
  const dittasToSync = ref<any[]>([]);
  const hideSyncDittas = ref<boolean>(true);
  const dittasInSync = ref<any[]>([]);
  const fullDittasToSync = ref<any[]>([]);
  const fetchingDittasInSync = ref<boolean>(false);
  
  const bulkEditing = ref<boolean>(false);
  const selectedDittas = ref<any[]>([]);
  
  const onEnableTeamsystemMode = () => {
    teamsystemModeEnabled.value = true;
  };
  
  const cancelTeamsystemMode = () => {
    teamsystemModeEnabled.value = false;
    dittasToSync.value = [];
  };
  
  const onEnableDownloadMode = () => {
    downloadModeEnabled.value = true;
  };
  const cancelDownload = () => {
    downloadModeEnabled.value = false;
    dittasToDownload.value = [];
  };
  
  const doDittasSync = async () => {
    fullDittasToSync.value = userDittasModel.value.dittas.filter((e: any) =>
      dittasToSync.value.includes(e.id)
    );
    modalSheetSetup.value = ModalSheetSetup.ts_async;
    modalSheet.toggle(true, { title: "Teamsystem Sincronizza" });
  };
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
  
  function bulkEdit() {
    selectedDittas.value = userDittasModel.value.dittas.filter(
      (e: any) => e.selected
    );
    if (selectedDittas.value.length <= 0) {
      bulkEditing.value = false;
      return;
    }
    modalSheetSetup.value = ModalSheetSetup.bulk_edit;
    modalSheet.toggle(true, { title: "Modifica gruppo di ditte" });
  }
  
  function toggleBulkEditing() {
    userDittasModel.value.dittas.forEach((e: any) => {
      e.selected = false;
    });
    bulkEditing.value = !bulkEditing.value;
  }
  
  const filters = ref<{
    errorsOnly: false;
    collaborator: string;
    sort: HeaderSort | undefined;
    sortAscending: boolean;
  }>({
    errorsOnly: false,
    collaborator: "tutti",
    sort: "registered_name",
    sortAscending: true,
  });
  const collaborators = ref<string[]>([]);
  
  const modalSheet = useModalSheet();
  const selectedDittaModel = ref<any>({});
  
  function accessTypeToString(val: string) {
    if (val === null || val === undefined || val.length <= 0) return val;
    return val
      .split("_")
      .map((e) => stringUtils.capitalize(e))
      .join(" ");
  }
  
  function addDitta() {
    selectedDittaModel.value = {};
    modalSheetSetup.value = ModalSheetSetup.add;
    modalSheet.toggle(true, { title: "Aggiungi ditta" });
  }
  
  function dittaClicked(ditta: any) {
    if (!bulkEditing.value) {
      selectedDittaModel.value = ditta;
      selectedDittaModel.value.profile_data =
        userDittasModel.value.profiles.filter(
          (p: any) => p.id === ditta.enabled_profile_id
        )[0];
      selectedDittaModel.value.collaborator_data =
        userDittasModel.value.collaborators.filter(
          (p: any) => p.id === ditta.appointing_subject_id
        )[0];
      modalSheetSetup.value = ModalSheetSetup.info;
      setTimeout(() => {
        modalSheet.toggle(true, { title: "Info ditta" });
      });
    } else {
      ditta.selected = !ditta.selected ? true : false;
    }
  }
  function addBulkDittas() {
    modalSheetSetup.value = ModalSheetSetup.bulk_add;
    modalSheet.toggle(true, { title: "Aggiungi più ditte" });
  }
  
  function downloadData() {
    let now = new Date();
    let csvData: string = `Data,${now.toString()}\nCliente ID,${
      cpa.getData.id
    }\nNome,${cpa.getData.name}\nDitta totali,${
      userDittasModel.value.dittas.length
    }\nPartita IVA,Codice fiscale,Nome,Fatture, Fatturato, Corrispettivi,F24,Numero ditta,Profilo entratel,Tipo,Codice fiscale intermediario,Collaboratore\n`;
    userDittasModel.value.dittas
      .filter((d: any) => dittasToDownload.value.includes(d.id))
      .forEach((ditta: any) => {
        return (csvData += `${[
          ditta.vat_id,
          ditta.codice_fiscale?.toLocaleUpperCase(),
          stringUtils.wordCapitalize(ditta.registered_name),
          ditta.invoice_count,
          ditta.invoice_sale,
          ditta.fee_count,
          ditta.f24_count,
          ditta.ditta_number,
          ditta.codice_entratel,
          ditta.access_type,
          ditta.appointing_subject_cf,
          stringUtils.capitalize(ditta.appointed_collaborator),
        ].join(",")}\n`);
      });
    var blob = new Blob([csvData], { type: "text/csv;charset=utf-8" });
    fileSaver.download(blob, "ditta_list_" + now.toISOString() + ".csv");
    cancelDownload();
  }
  
  const filteredDittas = computed(() => {
    let list = userDittasModel.value.dittas;
    list = list.filter((d: any) => {
      let valid = true;
      if (filters.value.errorsOnly) {
        valid = valid && d.is_delega_exist === false;
      }
  
      if (filters.value.collaborator !== "tutti") {
        valid =
          valid &&
          d.appointed_collaborator?.toLocaleLowerCase() ===
            filters.value.collaborator;
      }
      return valid;
    });
  
    if (searchQuery.value.length <= 0) {
      return list;
    }
  
    return list.filter(
      (d: any) =>
        stringUtils.similarity(
          `${d.ditta_number} ${d.registered_name} ${d.vat_id} ${d.codice_fiscale}`,
          searchQuery.value
        ) >= 0.7
    );
  });
  
  async function getLastAvailableAccount(dittaNumber: number) {
    api(endpoints.teamSystem, {
      method: "GET",
      query: {
        customer_id: cpa.getData.id,
        ditta_id: dittaNumber,
        operation: "last_available_account",
      },
      onResponse: async ({ request, response, options }) => {
        if (response.ok) {
          return response._data.data;
        } else {
          console.log(
            `problem with fetching last available account: ${JSON.stringify(
              response._data
            )}`
          );
        }
        fetching.value = false;
      },
      onResponseError({ request, response, options }) {
        console.log(
          `error fetching last available account: ${JSON.stringify(
            response._data
          )}`
        );
      },
    });
  }
  
  async function fetchTeamsystemeQueue() {
    modalSheet.toggle(false);
    fetchingDittasInSync.value = true;
    dittasInSync.value = [];
    api(endpoints.teamSystemQueue, {
      method: "GET",
      query: { customer_id: cpa.getData.id },
      onResponse: async ({ request, response, options }) => {
        if (response.ok) {
          for (const dInfo of response._data.data.teamsystemQueue) {
            let match = userDittasModel.value.dittas.find(
              (d: any) => d.id == dInfo.ditta_id.toString()
            );
            if (!match) continue;
            dittasInSync.value.push({
              ...match,
              ...dInfo,
            });
          }
        } else {
          console.log(
            `problem with fetching ditta sync details: ${JSON.stringify(
              response._data
            )}`
          );
        }
        fetching.value = false;
      },
      onResponseError({ request, response, options }) {
        console.log(
          `error fetching ditta sync details: ${JSON.stringify(response._data)}`
        );
      },
    });
    fetchingDittasInSync.value = false;
  }
  
  async function fetchData() {
    fetching.value = true;
    await cpa.dittas.fetch(true);
    userDittasModel.value = cpa.dittas.info;
    userDittasModel.value.dittas = l.orderBy(
      userDittasModel.value.dittas,
      filters.value.sort,
      filters.value.sortAscending ? "asc" : "desc"
    );
    collaborators.value = l
      .uniqBy(userDittasModel.value.dittas, (e: any) => e.appointed_collaborator)
      .filter((e) => e.appointed_collaborator?.length > 0)
      .map((e) => e.appointed_collaborator?.toLocaleLowerCase()?.trim());
  
    api(endpoints.userDittaInfo, {
      method: "GET",
      query: { customer_id: cpa.getData.id},
      onResponse: async ({ request, response, options }) => {
        if (response.ok) {
          const dataItems = response?._data?.data || []; 
          for (const dInfo of dataItems) {
            let match = userDittasModel.value.dittas.find(
              (d: any) => d.id == dInfo.id
            );
            if (!match) continue;
            match.executions = {
              active: dInfo.executions?.active
                ? parse(
                    dInfo.executions.active,
                    "dd-MM-yyyy HH:mm:ss",
                    new Date()
                  )
                : undefined,
              passive: dInfo.executions?.passive
                ? parse(
                    dInfo.executions.passive,
                    "dd-MM-yyyy HH:mm:ss",
                    new Date()
                  )
                : undefined,
              corrispettivi: dInfo.executions?.corrispettivi
                ? parse(
                    dInfo.executions.corrispettivi,
                    "dd-MM-yyyy HH:mm:ss",
                    new Date()
                  )
                : undefined,
              scraper: dInfo.executions?.scraper
                ? parse(
                    dInfo.executions.scraper,
                    "dd-MM-yyyy HH:mm:ss",
                    new Date()
                  )
                : undefined,
              f24: dInfo.executions?.f24
                ? parse(dInfo.executions.f24, "dd-MM-yyyy HH:mm:ss", new Date())
                : undefined,
              f24_download: dInfo.executions?.f24_download
                ? parse(
                    dInfo.executions.f24_download,
                    "dd-MM-yyyy HH:mm:ss",
                    new Date()
                  )
                : undefined,
            };
          }
        } else {
          console.log(
            `problem with fetching ditta execution details: ${JSON.stringify(
              response._data
            )}`
          );
        }
        fetching.value = false;
      },
      onResponseError({ request, response, options }) {
        console.log(
          `error fetching ditta execution details: ${JSON.stringify(
            response._data
          )}`
        );
      },
    });
    fetching.value = false;
  }
  
  function sortByHeader(header: HeaderSort) {
    if (header === filters.value.sort) {
      filters.value.sortAscending = !filters.value.sortAscending;
    } else {
      filters.value.sort = header;
    }
    userDittasModel.value.dittas = l.orderBy(
      userDittasModel.value.dittas,
      filters.value.sort,
      filters.value.sortAscending ? "asc" : "desc"
    );
  }
  
  
  function formatCurrency(value) {
      if (value == null) return ''; // Handle null or undefined values
  
      // Round to nearest integer
      const roundedValue = Math.round(value);
  
      // Format the number using European notation
      return new Intl.NumberFormat('de-DE', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(roundedValue);
    }
  
  onMounted(() => {
    fetchData();
    document.body.style.overflowY = "scroll";
  });
  
  watch(userDittasModel, () => {
    if (userDittasModel.value.dittas) {
      fetchTeamsystemeQueue();
    }
  });
  </script>
  
  <style lang="css" scoped>
  .card-button {
    * {
      cursor: pointer;
    }
    @apply relative bg-surface px-4 py-2 min-w-[12rem] rounded-xl justify-start flex flex-col items-center border-[1.5px] border-outline hover:border-accent cursor-pointer hover:scale-[102%] transition-all duration-100 ease-out;
    p {
      @apply text-[0.8rem];
    }
    .iconify {
      @apply size-16 mt-4 text-accent;
    }
  }
  
  .conto-table {
    --header-height: 6rem;
    @apply outline-none border-none !important;
  
    th {
      @apply border-t-0 border-l-0 border-r-0 border-b-[2px] border-outline bg-surface h-[var(--header-height)] !important;
      td {
        @apply h-[var(--header-height)] !important;
      }
      div {
        @apply flex flex-col h-full items-center justify-center;
  
        p {
          @apply text-center;
        }
      }
    }
  
    td {
      @apply outline-none border-[1px] !important;
    }
  
    tr {
      @apply outline-none !important;
    }
  
    tbody tr:hover {
      @apply bg-outline/60 !important;
    }
    tbody tr {
      background-color: var(--bg) !important;
    }
  }
  
  table tr:last-child td:first-child {
    @apply rounded-bl-xl;
  }
  
  table tr:last-child td:last-child {
    @apply rounded-br-xl;
  }
  
  table th:first-child {
    @apply rounded-tl-xl border-t-0;
  }
  
  table th:last-child {
    @apply rounded-tr-xl;
  }
  </style>
  