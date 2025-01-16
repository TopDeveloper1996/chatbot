<template>
    <div class="w-full bg-[#1D2231] text-white font-inter">
      <div class="w-full mx-auto p-4">
        <div class="flex items-center justify-between mb-6">
          <div class="flex space-x-2 z-5">
            <div
              class="bg-[#182235] text-[#94a3b8] px-4 py-2 rounded-lg flex items-center space-x-2 border border-[#2e4a67]"
            >
              <div
                class="text-[#1a76d2] flex items-center space-x-1 focus:outline-none font-bold"
              >
                Periodo di riferimento
              </div>
              <DropdownMenu
                id="periodo_di_riferimento"
                class="min-w-[6rem]"
                @change="(e) => changeFocusTimeStam(e)"
                :label="focusTimeStamp"
                :closeOnClick="true"
                :selected-items="[focusTimeStamp]"
                :items-formatter="(item) => item.label"
                :items="trimestersOptions"
              ></DropdownMenu>
              <StyledMonthsrangePicker
                :key="dateRangeKey"
                class="h-[3rem]"
                @change="dateRangeChange"
                :initial-timespan="customTimespan"
                v-show="isCustomPeriod"
                :last-date="now"
              ></StyledMonthsrangePicker>
            </div>
          </div>
        </div>
  
        <!-- Title -->
        <div class="flow-root">
          <div class="float-left">
            <h2 class="text-xl font-semibold mb-4">Conto Economico</h2>
          </div>
          
        </div>
  
        <!-- Table Section -->
        <div
          id="ditta_income_statement"
          v-if="analytics"
          class="w-full"
          v-for="tableData in [analytics.yearly]"
        >
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-xl font-semibold">{{ tableData.title }}</h2>
            <div class="flow-root">
                <div class="float-left" style="padding-right: 20px;">
                  <button class="primary-button" @click="showuploadDataInput">Inserisci dati</button>
                </div>
                <div class="float-right">
                    <button
                      title="Scarica i dati"
                      @click="downloadContoData"
                      class="secondary-button"
                    >
                      <p>Scarica</p>
                      <icon
                        class="size-6"
                        name="material-symbols:cloud-download-rounded"
                      ></icon>
                  </button>
                </div>
              
            </div>
            
          </div>
  
          <div class="overflow-x-auto">
            <table class="min-w-full bg-[#222A41] text-left">
              <thead class="bg-gray-700">
                <tr>
                  <th></th>
                  <th
                    class="py-4 px-6 bg-[#1D2231] text-sm font-medium text-white"
                    v-for="h in tableData.headers"
                  >
                    {{ h }}
                    <span v-if="h === 'Periodo di riferimento'"
                      >- {{ focusTimeStamp }}</span
                    >
                  </th>
                </tr>
              </thead>
  
              <tbody>
                <tr class="border-t border-[#2A334E]">
                  <td
                    class="py-4 px-6 text-md flex items-center space-x-2"
                    colspan="4"
                  >
                    <icon name="material-symbols:chevron-right size-6" />
                    <span>Ricavi</span>
                  </td>
                </tr>
  
                <tr class="border-t border-[#2A334E]">
                  <td class="py-4 px-6 text-md font-semibold">Totale ricavi</td>
                  <td
                    class="py-4 px-6 text-sm font-semibold text-right text-nowrap"
                    v-for="val in tableData.recap.revenues"
                  >
                    {{ cellToString(val) }}
                  </td>
                </tr>
                <tr class="border-t border-[#2A334E]">
                  <td
                    class="py-4 px-6 text-md flex items-center space-x-2"
                    colspan="4"
                  >
                    <icon name="material-symbols:chevron-right size-6" />
                    <span>Costi</span>
                  </td>
                </tr>
                <tr
                  class="border-t border-[#2A334E]"
                  v-for="e in tableData.costsCategories"
                >
                  <td
                    v-if="e.key === 'Costi fissi e variabili cumulativi'"
                    class="py-2 pl-10 pr-6 text-sm"
                  >
                    {{ e.key }}
                  </td>
                  <td
                    v-if="e.key === 'Costi fissi e variabili cumulativi'"
                    class="py-2 px-6 text-sm text-right text-nowrap"
                    v-for="val in e.elements"
                  >
                    {{ cellToString(val) }}
                  </td>
                </tr>
  
                <tr class="border-t border-[#2A334E]">
                  <td class="py-4 px-6 text-md font-semibold">
                    <icon name="material-symbols:chevron-right size-6" />
                    <span>Margine lordo</span>
                  </td>
                  <td
                    v-for="val in tableData.recap.preTaxMargin"
                    class="py-4 px-6 text-sm font-bold text-right text-nowrap"
                  >
                    {{ cellToString(val) }}
                  </td>
                </tr>
                <tr
                  class="border-t border-[#2A334E]"
                  v-for="e in tableData.costsCategories"
                >
                  <td
                    v-if="e.key !== 'Costi fissi e variabili cumulativi'"
                    class="py-2 pl-10 pr-6 text-sm"
                  >
                    {{ e.key }}
                    <icon
                      class="text-accent text-2xl right"
                      name="material-symbols:edit-square"
                    ></icon>
                  </td>
                  <td
                    v-if="e.key !== 'Costi fissi e variabili cumulativi'"
                    class="py-2 px-6 text-sm text-right text-nowrap"
                    v-for="val in e.elements"
                  >
                    <span v-if="val.val !== 'N.P'">{{ cellToString(val) }}</span>
                    <span v-if="val.val === 'N.P'">{{ val.val }}</span>
                  </td>
                </tr>
  
                <!-- <tr class="border-t border-[#2A334E]">
                                      <td class="py-4 px-6 text-md font-semibold">Totale costi</td>
                                      <td v-for="val in tableData.recap.costs" class="py-4 px-6 text-sm font-semibold text-right">
                                          {{ cellToString(val) }}
                                      </td>
                                  </tr> -->
  
                <tr class="border-t border-[#2A334E]">
                  <td class="py-4 px-6 text-md font-semibold">
                    <span v-if="tableData.recap.isUserProvideIncomeStatement"
                      >EBITDA</span
                    >
                    <span v-if="!tableData.recap.isUserProvideIncomeStatement"
                      >EBITDA *
                    </span>
                  </td>
                  <td
                    v-for="val in tableData.recap.ebitda"
                    class="py-4 px-6 text-sm font-bold text-right text-nowrap"
                  >
                    {{ cellToString(val) }}
                  </td>
                </tr>
  
                <tr class="border-t border-[#2A334E]">
                  <td
                    class="py-4 px-6 text-md flex items-center space-x-2"
                    colspan="4"
                  >
                    <icon name="material-symbols:chevron-right size-6" />
                    <span>Costi non operativi</span>
                  </td>
                </tr>
                <tr
                  class="border-t border-[#2A334E]"
                  v-for="e in tableData.userDefinedITDACategories"
                >
                  <!-- <td class="py-2 pl-10 pr-6 text-sm">{{ e.key }}
                                      <icon class="text-accent text-2xl" name="material-symbols:edit-square"></icon>
                                      </td>
                                      <td class="py-2 px-6 text-sm text-right text-nowrap" v-for="val in e.elements" >
                                          <span v-if="val.val!=='N.P'" >{{ cellToString(val) }}</span> 
                                          <span v-if="val.val==='N.P'" >{{ val.val }}</span>
                                      </td> -->
  
                  <td
                    v-if="e.key === 'Oneri finanziari e oneri bancari (+/-)'"
                    class="py-2 pl-10 pr-6 text-sm"
                  >
                    {{ e.key }}
                    <icon
                      class="text-accent text-2xl right"
                      name="material-symbols:edit-square"
                    ></icon>
                  </td>
                  <td
                    v-if="e.key === 'Oneri finanziari e oneri bancari (+/-)'"
                    class="py-2 px-6 text-sm text-right text-nowrap"
                    v-for="val in e.elements"
                  >
                    <span v-if="val.val !== 'N.P'">{{ cellToString(val) }}</span>
                    <span v-if="val.val === 'N.P'">{{ val.val }}</span>
                  </td>
                </tr>
                <tr
                  class="border-t border-[#2A334E]"
                  v-for="e in tableData.userDefinedITDACategories"
                >
                  <td
                    v-if="e.key !== 'Oneri finanziari e oneri bancari (+/-)'"
                    class="py-2 pl-10 pr-6 text-sm"
                  >
                    {{ e.key }}
                    <icon
                      class="text-accent text-2xl"
                      name="material-symbols:edit-square"
                    ></icon>
                  </td>
                  <td
                    v-if="e.key !== 'Oneri finanziari e oneri bancari (+/-)'"
                    class="py-2 px-6 text-sm text-right text-nowrap"
                    v-for="val in e.elements"
                  >
                    <span v-if="val.val !== 'N.P'">{{ cellToString(val) }}</span>
                    <span v-if="val.val === 'N.P'">{{ val.val }}</span>
                  </td>
                </tr>
                <!-- <tr class="border-t border-[#2A334E]">
                                      <td class="py-4 px-6 text-md font-semibold">
                                          <span>Ammortamenti, svalutazioni e altri accantonamenti</span>
                                      </td>
                                      <td v-for="val in tableData.recap.itda" class="py-4 px-6 text-sm font-bold text-right text-nowrap">
                                          {{ cellToString(val) }}
                                      </td>
                                      
                                  </tr> -->
                <tr class="border-t border-[#2A334E]">
                  <td class="py-2 pl-10 pr-6 text-sm">
                    <span>Imposte sul reddito</span>
                  </td>
                  <td
                    v-for="val in tableData.recap.tax"
                    class="py-4 px-6 text-sm font-bold text-right text-nowrap"
                  >
                    {{val.prefix}}{{ cellToString(val) }}
                  </td>
                </tr>
                <tr class="border-t border-[#2A334E]">
                  <td class="py-2 pl-10 pr-6 text-sm">
                    <span class="text-accent" >Saldo anno precedente</span>
                  </td>
                  <td
                    v-for="val in tableData.recap.last_year_income_tax_balance"
                    class="py-4 px-6 text-sm font-bold text-right text-nowrap text-accent"
                  >
                    {{ cellToString(val) }}
                  </td>
                </tr>
                
                <!-- <tr class="border-t border-[#2A334E]" v-for="e in tableData.f24Categories">
                                      <td class="py-2 pl-10 pr-6 text-sm">{{ e.key }}</td>
                                      <td class="py-2 px-6 text-sm text-right text-nowrap" v-for="val in e.elements" >{{ cellToString(val) }}</td>
                                  </tr> -->
  
                <tr class="border-t border-[#2A334E]">
                  <td class="py-4 px-6 text-md font-semibold">
                    <span v-if="tableData.recap.isUserProvideIncomeStatement"
                      >Utile di Periodo</span
                    >
                    <span v-if="!tableData.recap.isUserProvideIncomeStatement"
                      >Utile di Periodo *
                    </span>
                  </td>
                  <td
                    v-for="val in tableData.recap.utile_netto"
                    class="py-4 px-6 text-sm font-bold text-right text-nowrap"
                  >
                    {{ cellToString(val) }}
                  </td>
                </tr>
              </tbody>
            </table>
  
            <Info v-if="!tableData.recap.isUserProvideIncomeStatement">
              <p class="text-sm">
                Se non hai aggiunto i costi del lavoro, gli altri costi, Gli
                ammortamenti, oneri e ricavi finanziari questo valore non è
                esattamente l’ utile netto. N.P. Non pervenuto
              </p>
            </Info>
          </div>
        </div>
      </div>
    </div>
    <ModalSheet :controller="modalSheet" height="100%">
      <div class="px-8">
        <CompaniesDataInput
          @ditta-updated="onDittaUpdate"
          :dittaId="invoicesSelectedDittaId"
          :customerId="cpa.getData.id"
        ></CompaniesDataInput>
      </div>
    </ModalSheet>
    
    <ModalSheet :controller="uploadmodalSheet" height="100%">
      <div class="px-8">
        <CompaniesUploadDataModal
          @upload-complete="reload_full_data"
          :show="show" :cpa="cpa"
        ></CompaniesUploadDataModal>
        
      </div>
    </ModalSheet>
  </template>
  
  <script lang="ts" setup>
  import { filter } from "lodash";
import * as stringUtils from "~/src/common/string";
  import Timespan from "~/src/timespan";
  const show = ref(true)
  const ditta360 = useDitta360Store();
  const { income_statement, focusPeriodLabel } = storeToRefs(ditta360);
  const { set_income_statement } = ditta360;
  const f24 = useF24();
  const cpa = useCpa();
  const { f24Fetching } = storeToRefs(f24);
  const invoices = useInvoices();
  const { invoicesSelectedDittaId } = storeToRefs(invoices);
  const fees = useFees();
  const userProvidedData = useUserProvidedDataStore();
  const lastAvailableInvoiceDate = ref<Date>(new Date());
  const dateRangeKey = ref(0);
  const isCustomPeriod = ref(false);
  const trimestersSince2020 = ref<any>([]);
  const focusTimeStamp = ref<string>("");
  const focusDataLoading = ref<boolean>(false);
  const focusTimeStampLabel = ref<string>("");
  const { $notifications } = useNuxtApp();

  
  const customTimespan = ref<Timespan>(
    new Timespan(new Date(getCurrentYear(), 0, 1), lastAvailableInvoiceDate.value)
  );
  const now = new Date();
  const analytics = ref<IncomeStatementAnalytics>();
  
  const modalSheet = useModalSheet();
  const uploadmodalSheet = useModalSheet();
  
  
  const showDataInput = () => {
    modalSheet.toggle(true);
  };

  const showuploadDataInput = () => {
    show.value=true
    uploadmodalSheet.toggle(true);
  };

  // const emit = defineEmits<{ (e: "dittaPageUpdated"): void }>();
  
  const onDittaUpdate = () => {
    console.log("ditta updated");
    modalSheet.toggle(false);
    $notifications.add({
        message: "Sincronizzazione in corso",
        icon: "material-symbols:check",
        timeout: 15000 // milliseconds
    });
    //emit("dittaPageUpdated");
  };

  const reload_full_data = () => {
    console.log("input data provided so reload full page");
    emit("ditta-page-updated");
    show.value=false;
    uploadmodalSheet.toggle(false);
    document.body.style.overflowY = "scroll";

    }
  
  function cellToStringForCSV(cell: ValueCell): string {
    if (cell.type === "string") return cell.val.toString();
    if (isNaN(cell.val) || !isFinite(cell.val)) return "-";
    switch (cell.type) {
      case "number":
        return cell.val.toLocaleString();
      case "currency":
        return `${cell.val.toLocaleString()}`;
      case "percentage":
        return `${cell.val.toFixed(2)} %`;
      default:
        return cell.val.toString();
    }
  }
  
  function cellToString(cell: ValueCell): string {
    if (cell.type === "string") return cell.val.toString();
    if (isNaN(cell.val) || !isFinite(cell.val)) return "-";
    switch (cell.type) {
      case "number":
        return cell.val.toLocaleString();
      case "currency":
        return `${cell.val.toLocaleString()} €`;
      case "percentage":
        return `${cell.val.toFixed(2)} %`;
      default:
        return cell.val.toString();
    }
  }
  
  const getTrimestersSince2020 = async () => {
    const startYear = new Date().getFullYear();
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1; // Months are zero-indexed, so we add 1
    const previewLastMonth = Timespan.getLastMonthDate(
      lastAvailableInvoiceDate.value
    );
    const trimesters = [
      {
        year: lastAvailableInvoiceDate.value.getFullYear(),
        quarter: 0,
        start: new Date(
          lastAvailableInvoiceDate.value.getFullYear(),
          lastAvailableInvoiceDate.value.getMonth(),
          1,
          0,
          0,
          0
        ).toString(),
        end: new Date(
          lastAvailableInvoiceDate.value.getFullYear(),
          lastAvailableInvoiceDate.value.getMonth() + 1,
          0,
          0,
          0,
          0
        ).toString(),
        label: `Mese Corrente - ${stringUtils.toMonthYearString(
          lastAvailableInvoiceDate.value
        )}`,
        text: stringUtils.toMonthYearString(lastAvailableInvoiceDate.value),
      },
      {
        year: previewLastMonth.getFullYear(),
        quarter: 0,
        start: new Date(
          previewLastMonth.getFullYear(),
          previewLastMonth.getMonth(),
          1,
          0,
          0,
          0
        ).toString(),
        end: new Date(
          previewLastMonth.getFullYear(),
          previewLastMonth.getMonth() + 1,
          0,
          0,
          0,
          0,
          0
        ).toString(),
        label: `Mese precedente - ${stringUtils.toMonthYearString(
          previewLastMonth
        )}`,
        text: stringUtils.toMonthYearString(previewLastMonth),
      },
    ];
  
    for (let year = startYear; year <= currentYear; year++) {
      for (let quarter = 1; quarter <= 4; quarter++) {
        // Calculate the quarter's end month
        const endMonth = quarter * 3;
  
        // If we're in the current year, stop adding trimesters once we've reached the current month
        if (year === currentYear && endMonth >= currentMonth) {
          break;
        }
        const endDate = new Date(year, endMonth, 0, 0, 0, 0);
  
        trimesters.push({
          year,
          quarter,
          start: `${year}-${(endMonth - 2).toString().padStart(2, "0")}`,
          end: endDate.toString(),
          label: `Q${quarter} ${year}`,
          text: `Q${quarter} ${year}`,
        });
      }
    }
    trimesters.push({
      year: 2020,
      quarter: 1,
      start: "2020-01-01",
      end: "2020-03-31",
      label: "Personalizzato",
      text: "Personalizzato",
    });
    return trimesters;
  };
  const getFocusTimeStamp = () => {
    if (isCustomPeriod.value) {
      return customTimespan.value;
    } else {
      const startDate = new Date(
        trimestersSince2020.value.find(
          (t: any) => t.label === focusTimeStamp.value
        )?.start ?? new Date(getCurrentYear(), now.getMonth(), 1)
      );
      const endDate = new Date(
        trimestersSince2020.value.find(
          (t: any) => t.label === focusTimeStamp.value
        )?.end ?? new Date(getCurrentYear(), now.getMonth()+1, 0)
      );
      return new Timespan(startDate, endDate);
    }
  };
  
  onMounted(async () => {
    trimestersSince2020.value = await getTrimestersSince2020();
    focusTimeStamp.value = trimestersSince2020.value[0].label;
    focusTimeStampLabel.value = trimestersSince2020.value[0].label;
  });
  async function updateStats() {
    try {
      let start = performance.now();
      trimestersSince2020.value = await getTrimestersSince2020();
      const activeTimespan = getFocusTimeStamp();
      analytics.value = computeIncomeStatementAnalytics({
        invoices: invoices.invoicesDocuments,
        f24s: f24.f24Documents,
        fees: fees.feesDocuments,
        userProvidedData: userProvidedData.income_statements,
        dittaId: invoicesSelectedDittaId.value,
        focustimespan: activeTimespan,
      });
      set_income_statement(analytics.value, focusTimeStamp.value);
      let end = performance.now();
  
      console.log(
        `income statement aggregations computed in ${(end - start).toFixed(2)} ms`
      );
    } catch (ex) {
      console.error("error computing stats");
      console.error(ex);
    }
    focusDataLoading.value = false;
  }
  
  watch(invoicesSelectedDittaId, updateStats, { immediate: true });
  
  const trimestersOptions = computed(() => {
    return trimestersSince2020.value.map((e: any) => {
      return {
        label: e.label,
        value: e.label,
      };
    });
  });
  
  function dateRangeChange(ts: Timespan) {
    customTimespan.value = ts;
    focusTimeStamp.value = ts.toITLabel();
    focusTimeStampLabel.value = ts.toITLabel();
    if (isCustomPeriod.value) {
      updateStats();
    }
  }
  
  function tableDataToCSV(): string {
    if (!analytics.value || !analytics.value.yearly) return "";
    // Helper function to format a value for CSV
    function formatForCSV(value: string): string {
    // value = value.replace(/€/g, ''); // This removes the Euro sign
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      return `${value.replace(/"/g, '""').replace(',', '')}`;
    }
    return value;
  }
    const tableData = analytics.value.yearly;
    let csv = "," + tableData.headers.join(",") + "\n";
  
    csv += 'Ricavi\n';
    // Add row for revenues
    csv += `Totale ricavi,${tableData.recap.revenues.map(cell => formatForCSV(cellToStringForCSV(cell))).join(',')}\n`;
    
    // Add rows for costs
    csv += 'Costi\n';
    tableData.costsCategories.forEach(category => {
      csv += `${formatForCSV(category.key)},${category.elements.map(cell => formatForCSV(cellToStringForCSV(cell))).join(',')}\n`;
    });
    
    // Add row for gross margin
    csv += `Margine lordo,${tableData.recap.preTaxMargin.map(cell => formatForCSV(cellToStringForCSV(cell))).join(',')}\n`;
    
    // Add row for EBITDA
    csv += `EBITDA,${tableData.recap.ebitda.map(cell => formatForCSV(cellToStringForCSV(cell))).join(',')}\n`;
    
    // Add rows for non-operational costs
    csv += 'Costi non operativi\n';
    tableData.userDefinedITDACategories.forEach(category => {
      csv += `${formatForCSV(category.key)},${category.elements.map(cell => {
        if (cell.val === 'N.P') {
          return 'N.P';
        } else {
          return formatForCSV(cellToStringForCSV(cell));
        }
      }).join(',')}\n`;
    });
    
    // Add row for income tax
    csv += `Imposte sul reddito,${tableData.recap.tax.map(cell => formatForCSV(cellToStringForCSV(cell))).join(',')}\n`;
    
    // Add row for net profit
    csv += `Utile di Periodo,${tableData.recap.utile_netto.map(cell => formatForCSV(cellToStringForCSV(cell))).join(',')}\n`;
    
    return csv;
  }
  
  // Add new function to download CSV
  function downloadContoData() {
    const csv = tableDataToCSV();
    const bom = new Uint8Array([0xEF, 0xBB, 0xBF]); // UTF-8 BOM
    const blob = new Blob([bom, csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", "income_statement.csv");
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }
  
  const changeFocusTimeStam = (e: any) => {
    if (e.label === "Personalizzato") {
      isCustomPeriod.value = true;
      dateRangeKey.value += 1;
    } else {
      focusTimeStamp.value = e.label;
      focusTimeStampLabel.value = e.text;
      isCustomPeriod.value = false;
    }
    focusDataLoading.value = true;
    updateStats();
  };

  function csvToJson(csv: string): any {
    const lines = csv.split("\n");
    const headers = lines[0].split(",");
    const jsonArray =  lines.slice(1).map(line => {
        const values = line.split(",");
        const obj: any = {};
        headers.forEach((header, index) => {
            obj[header.trim() == "" ? "key":header.trim()] = values[index]?.trim() || null; // Handle missing values
        });
        return obj;
    }).filter(obj => Object.keys(obj).length > 0); // Filter out empty objects

    const filteredArray = jsonArray.filter((_, index) => ![0, 2, 8, jsonArray.length - 1].includes(index));
    const ricavi = filteredArray[0]
    const costi = filteredArray[1]
    const margine_lordo = filteredArray.slice(2, 5)
    const ebitda = filteredArray[5]
    const costi_non_operativi = filteredArray.slice(6, 9)
    const utile_di_periodo = filteredArray[filteredArray.length - 1 ]

    return {
      "Ricavi": ricavi,
      "Costi": costi,
      "Margine lordo": margine_lordo,
      "Ebitda": ebitda,
      "Costi non operativi": costi_non_operativi,
      "Utile di Periodo": utile_di_periodo
    }
  }
  
  const emit = defineEmits<{
    (e: 'ditta-page-updated', result: any): void
    (e: 'income_statement-org-completed', result: any): void
  }>();

  watch(() => analytics.value, (newValue) => {
    const csv = tableDataToCSV();
    const result = csvToJson(csv)
    console.log(result)
    emit('income_statement-org-completed', result);
  }, { immediate: true });
  </script>
  
  <style lang="css" scoped>
  .divider {
    @apply h-[1.5px] bg-outline w-full my-2 rounded-full p-0;
  }
  
  .conto-table {
    @apply outline-none border-none !important;
  
    th {
      @apply border-t-0 border-l-0 bg-surface !important;
    }
  
    td {
      @apply outline-none border-none !important;
    }
  
    tr {
      @apply outline-none border-b border-gray-700 !important;
    }
  }
  </style>
  