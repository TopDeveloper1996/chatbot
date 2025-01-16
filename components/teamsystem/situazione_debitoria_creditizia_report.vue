<template>
    <div class="w-full bg-[#1D2231] text-white font-inter">
      <div class="w-full mx-auto p-4">
        <div class="flex items-center justify-between mb-6">
          <div class="flex space-x-2 z-20">
            <div
              class="bg-[#182235] text-[#94a3b8] px-4 py-2 rounded-lg flex items-center space-x-2 border border-[#2e4a67]"
            >
              <div
                class="text-[#1a76d2] flex items-center space-x-1 focus:outline-none font-bold"
              >
                Periodo di riferimento
              </div>
              <StyledMonthsrangePicker
                key="SituazionedateRangeKey"
                class="h-[3rem]"
                @change="dateRangeChange"
                :initial-timespan="customTimespan"
                :first-date="firstDate"
                :last-date="props.teamSystemLastAvailableDate"
              ></StyledMonthsrangePicker>
            </div>
          </div>
        </div>
        <div class="flex justify-between items-center mb-1">
          <h2 class="text-xl font-semibold mb-4">
            Situazione debitoria e creditizia 
          </h2>
          
        </div>
        <div class="flex items-center justify-between mb-4">
          <div class="text-white rounded-lg flex items-center justify-start w-full ">
              <p class="bg-[#172347] py-4 rounded-lg flex justify-between items-center">
                  <icon name="material-symbols:info" class="size-6 mr-2"/>
                  Data Ultima sincronizzazione con TeamSystem è il - {{ props.lastSynchedDate }}
              </p>
          </div>
          <button
            title="Scarica i dati"
            @click="downloadSituazioneDataCSV"
            class="secondary-button"
          >
            <p>Scarica</p>
            <icon
              class="size-6"
              name="material-symbols:cloud-download-rounded"
            ></icon>
          </button>

        </div>
  
        <div class="overflow-x-auto">
          <table class="min-w-full bg-[#222A41] text-left">
            <thead>
              <tr>
                <th></th>
                <th
                  class="py-4 px-6 bg-[#1D2231] text-sm font-medium text-white text-center"
                >
                  Periodo di riferimento - {{ focusTimeStamp }}
                </th>
                <th
                  class="py-4 px-6 bg-[#1D2231] text-sm font-medium text-white text-center"
                >
                  Dall'inizio dell'anno Fino a -
                  {{ props.teamSystemLastAvailableDateStr }}
                </th>
                <th
                  class="py-4 px-6 bg-[#1D2231] text-sm font-medium text-white text-center"
                >
                  Ultimo anno fiscale - {{ props.lastFiscalYear }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr class="border-t border-[#2A334E]">
                <td
                  class="py-4 px-6 text-lg flex items-center space-x-2"
                  colspan="4"
                >
                  <icon name="material-symbols:chevron-right" class="size-8" />
                  <span>Crediti</span>
                </td>
              </tr>
              <tr class="border-t border-[#2A334E]">
                <td class="py-2 pl-10 pr-6 text-sm">Crediti</td>
                <td class="py-2 px-6 text-sm text-right">
                  {{
                    stringUtils.toCurrencyString(
                      yearToSelectedDateData.crediti_sum.sum_ytd_value
                    )
                  }}
                </td>
                <td class="py-2 px-6 text-sm text-right">
                  {{
                    stringUtils.toCurrencyString(
                      ytdData.crediti_sum.sum_ytd_value
                    )
                  }}
                </td>
                <td class="py-2 px-6 text-sm text-right">
                  {{
                    stringUtils.toCurrencyString(
                      lastYearData.crediti_sum.sum_ytd_value
                    )
                  }}
                </td>
              </tr>
              <tr class="border-t border-[#2A334E]">
                <td class="py-2 pl-10 pr-6 text-sm text-[#009EFF]">
                  Crediti verso clienti
                </td>
                <td class="py-2 px-6 text-sm text-right">
                  {{
                    stringUtils.toCurrencyString(
                      yearToSelectedDateData.crediti_verso_clienti.sum_ytd_value
                    )
                  }}
                </td>
  
                <td class="py-2 px-6 text-sm text-right">
                  {{
                    stringUtils.toCurrencyString(
                      ytdData.crediti_verso_clienti.sum_ytd_value
                    )
                  }}
                </td>
                <td class="py-2 px-6 text-sm text-right">
                  {{
                    stringUtils.toCurrencyString(
                      lastYearData.crediti_verso_clienti.sum_ytd_value
                    )
                  }}
                </td>
              </tr>
              <tr class="border-t border-[#2A334E]">
                <td class="py-2 pl-10 pr-6 text-sm text-[#009EFF]">
                  Crediti tributari
                </td>
                <td class="py-2 px-6 text-sm text-right">
                  {{
                    stringUtils.toCurrencyString(
                      yearToSelectedDateData.crediti_tributari.sum_ytd_value
                    )
                  }}
                </td>
                <td class="py-2 px-6 text-sm text-right">
                  {{
                    stringUtils.toCurrencyString(
                      ytdData.crediti_tributari.sum_ytd_value
                    )
                  }}
                </td>
                <td class="py-2 px-6 text-sm text-right">
                  {{
                    stringUtils.toCurrencyString(
                      lastYearData.crediti_tributari.sum_ytd_value
                    )
                  }}
                </td>
              </tr>
              <tr class="border-t border-[#2A334E]">
                <td class="py-2 pl-10 pr-6 text-sm text-[#009EFF]">
                  Crediti previdenziali
                </td>
                <td class="py-2 px-6 text-sm text-right">
                  {{
                    stringUtils.toCurrencyString(
                      yearToSelectedDateData.crediti_previdenziali.sum_ytd_value
                    )
                  }}
                </td>
                <td class="py-2 px-6 text-sm text-right">
                  {{
                    stringUtils.toCurrencyString(
                      ytdData.crediti_previdenziali.sum_ytd_value
                    )
                  }}
                </td>
                <td class="py-2 px-6 text-sm text-right">
                  {{
                    stringUtils.toCurrencyString(
                      lastYearData.crediti_previdenziali.sum_ytd_value
                    )
                  }}
                </td>
              </tr>
              <tr class="border-t border-[#2A334E]">
                <td class="py-2 pl-10 pr-6 text-sm text-[#009EFF]">
                  Altri crediti
                </td>
                <td class="py-2 px-6 text-sm text-right">
                  {{
                    stringUtils.toCurrencyString(
                      yearToSelectedDateData.altri_crediti.sum_ytd_value
                    )
                  }}
                </td>
                <td class="py-2 px-6 text-sm text-right">
                  {{
                    stringUtils.toCurrencyString(
                      ytdData.altri_crediti.sum_ytd_value
                    )
                  }}
                </td>
                <td class="py-2 px-6 text-sm text-right">
                  {{
                    stringUtils.toCurrencyString(
                      lastYearData.altri_crediti.sum_ytd_value
                    )
                  }}
                </td>
              </tr>
              <tr class="border-t border-[#2A334E]">
                <td class="py-2 pl-10 pr-6 text-sm">Disponibilita liquide</td>
                <td class="py-2 px-6 text-sm text-right">
                  {{
                    stringUtils.toCurrencyString(
                      yearToSelectedDateData.disponibilita_liquide.sum_ytd_value
                    )
                  }}
                </td>
                <td class="py-2 px-6 text-sm text-right">
                  {{
                    stringUtils.toCurrencyString(
                      ytdData.disponibilita_liquide.sum_ytd_value
                    )
                  }}
                </td>
                <td class="py-2 px-6 text-sm text-right">
                  {{
                    stringUtils.toCurrencyString(
                      lastYearData.disponibilita_liquide.sum_ytd_value
                    )
                  }}
                </td>
              </tr>
              <tr class="border-t border-[#2A334E]">
                <td
                  class="py-4 px-6 text-lg flex items-center space-x-2"
                  colspan="4"
                >
                  <icon name="material-symbols:chevron-right" class="size-8" />
                  <span>Debiti</span>
                </td>
              </tr>
              <tr class="border-t border-[#2A334E]">
                <td class="py-2 pl-10 pr-6 text-sm">
                  Trattamento di fine rapporto
                </td>
                <td class="py-2 px-6 text-sm text-right">
                  {{
                    stringUtils.toCurrencyString(
                      yearToSelectedDateData.trattamento_di_fine_rapporto.sum_ytd_value
                    )
                  }}
                </td>
                <td class="py-2 px-6 text-sm text-right">
                  {{
                    stringUtils.toCurrencyString(
                      ytdData.trattamento_di_fine_rapporto.sum_ytd_value
                    )
                  }}
                </td>
                <td class="py-2 px-6 text-sm text-right">
                  {{
                    stringUtils.toCurrencyString(
                      lastYearData.trattamento_di_fine_rapporto.sum_ytd_value
                    )
                  }}
                </td>
              </tr>
              <tr class="border-t border-[#2A334E]">
                <td class="py-2 pl-10 pr-6 text-sm">Debiti</td>
                <td class="py-2 px-6 text-sm text-right">
                  {{
                    stringUtils.toCurrencyString(yearToSelectedDateData.debiti_sum.sum_ytd_value)
                  }}
                </td>
                <td class="py-2 px-6 text-sm text-right">
                  {{
                    stringUtils.toCurrencyString(ytdData.debiti_sum.sum_ytd_value)
                  }}
                </td>
                <td class="py-2 px-6 text-sm text-right">
                  {{
                    stringUtils.toCurrencyString(
                      lastYearData.debiti_sum.sum_ytd_value
                    )
                  }}
                </td>
              </tr>
              <tr class="border-t border-[#2A334E]">
                <td class="py-2 pl-10 pr-6 text-sm text-[#009EFF]">
                  Debiti verso banche
                </td>
                <td class="py-2 px-6 text-sm text-right">
                  {{
                    stringUtils.toCurrencyString(
                      yearToSelectedDateData.debiti_verso_banche.sum_ytd_value
                    )
                  }}
                </td>
                <td class="py-2 px-6 text-sm text-right">
                  {{
                    stringUtils.toCurrencyString(
                      ytdData.debiti_verso_banche.sum_ytd_value
                    )
                  }}
                </td>
                <td class="py-2 px-6 text-sm text-right">
                  {{
                    stringUtils.toCurrencyString(
                      lastYearData.debiti_verso_banche.sum_ytd_value
                    )
                  }}
                </td>
              </tr>
              <tr class="border-t border-[#2A334E]">
                <td class="py-2 pl-10 pr-6 text-sm text-[#009EFF]">
                  Debiti verso fornitori
                </td>
                <td class="py-2 px-6 text-sm text-right">
                  {{
                    stringUtils.toCurrencyString(
                      yearToSelectedDateData.debiti_verso_fornitori.sum_ytd_value
                    )
                  }}
                </td>
                <td class="py-2 px-6 text-sm text-right">
                  {{
                    stringUtils.toCurrencyString(
                      ytdData.debiti_verso_fornitori.sum_ytd_value
                    )
                  }}
                </td>
                <td class="py-2 px-6 text-sm text-right">
                  {{
                    stringUtils.toCurrencyString(
                      lastYearData.debiti_verso_fornitori.sum_ytd_value
                    )
                  }}
                </td>
              </tr>
              <tr class="border-t border-[#2A334E]">
                <td class="py-2 pl-10 pr-6 text-sm">Debiti tributari</td>
                <td class="py-2 px-6 text-sm text-right">
                  {{
                    stringUtils.toCurrencyString(
                      yearToSelectedDateData.debiti_tributari.sum_ytd_value
                    )
                  }}
                </td>
                <td class="py-2 px-6 text-sm text-right">
                  {{
                    stringUtils.toCurrencyString(
                      ytdData.debiti_tributari.sum_ytd_value
                    )
                  }}
                </td>
                <td class="py-2 px-6 text-sm text-right">
                  {{
                    stringUtils.toCurrencyString(
                      lastYearData.debiti_tributari.sum_ytd_value
                    )
                  }}
                </td>
              </tr>
              <tr class="border-t border-[#2A334E]">
                <td class="py-2 pl-10 pr-6 text-sm">Debiti previdenziali</td>
                <td class="py-2 px-6 text-sm text-right">
                  {{
                    stringUtils.toCurrencyString(
                      yearToSelectedDateData.debiti_previdenziali.sum_ytd_value
                    )
                  }}
                </td>
                <td class="py-2 px-6 text-sm text-right">
                  {{
                    stringUtils.toCurrencyString(
                      ytdData.debiti_previdenziali.sum_ytd_value
                    )
                  }}
                </td>
                <td class="py-2 px-6 text-sm text-right">
                  {{
                    stringUtils.toCurrencyString(
                      lastYearData.debiti_previdenziali.sum_ytd_value
                    )
                  }}
                </td>
              </tr>
              <tr class="border-t border-[#2A334E]">
                <td class="py-2 pl-10 pr-6 text-sm">Debiti verso dipendenti</td>
                <td class="py-2 px-6 text-sm text-right">
                  {{
                    stringUtils.toCurrencyString(
                      yearToSelectedDateData.debiti_verso_dipendenti.sum_ytd_value
                    )
                  }}
                </td>
                <td class="py-2 px-6 text-sm text-right">
                  {{
                    stringUtils.toCurrencyString(
                      ytdData.debiti_verso_dipendenti.sum_ytd_value
                    )
                  }}
                </td>
                <td class="py-2 px-6 text-sm text-right">
                  {{
                    stringUtils.toCurrencyString(
                      lastYearData.debiti_verso_dipendenti.sum_ytd_value
                    )
                  }}
                </td>
              </tr>
              <tr class="border-t border-[#2A334E]">
                <td class="py-2 pl-10 pr-6 text-sm">Altri debiti</td>
                <td class="py-2 px-6 text-sm text-right">
                  {{
                    stringUtils.toCurrencyString(
                      yearToSelectedDateData.altri_debiti.sum_ytd_value
                    )
                  }}
                </td>
                <td class="py-2 px-6 text-sm text-right">
                  {{
                    stringUtils.toCurrencyString(
                      ytdData.altri_debiti.sum_ytd_value
                    )
                  }}
                </td>
                <td class="py-2 px-6 text-sm text-right">
                  {{
                    stringUtils.toCurrencyString(
                      lastYearData.altri_debiti.sum_ytd_value
                    )
                  }}
                </td>
              </tr>
              <tr class="border-t border-[#2A334E]">
                <td class="py-4 px-6 text-md font-semibold">
                  Indebitamento netto complessivo
                </td>
                <td class="py-4 px-6 text-sm font-semibold text-right">
                  {{
                    stringUtils.toCurrencyString(
                      yearToSelectedDateData.indebitamento_netto_complessivo
                        ?.sum_ytd_value
                    )
                  }}
                </td>
                <td class="py-4 px-6 text-sm font-semibold text-right">
                  {{
                    stringUtils.toCurrencyString(
                      ytdData.indebitamento_netto_complessivo?.sum_ytd_value
                    )
                  }}
                </td>
                <td class="py-4 px-6 text-sm font-semibold text-right">
                  {{
                    stringUtils.toCurrencyString(
                      lastYearData.indebitamento_netto_complessivo?.sum_ytd_value
                    )
                  }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </template>
  
  <script lang="ts" setup>
  import Timespan from "~/src/timespan";
  import * as stringUtils from "~/src/common/string";
  import { TeamSystemLastYearCurrentYearChart } from "~/src/types/teamsystem_types";
  const focusTimeStamp = ref<string>("");
  
  const props = defineProps<{
    chartsData: TeamSystemLastYearCurrentYearChart;
    teamSystemLastAvailableDateStr: string;
    teamSystemLastAvailableDate: Date;
    ytdData: TeamSystemLastYearCurrentYearChart;
    computeYtdData: ({
      activeTimespan,
    }: {
      activeTimespan: Timespan;
    }) => TeamSystemSummary;
    yearToSelectedDateData: TeamSystemLastYearCurrentYearChart;
    lastYearData: TeamSystemLastYearCurrentYearChart;
    lastFiscalYear: number;
    lastSynchedDate:string;
  }>();
  
  const firstDate = new Date(getCurrentYear(), 0, 1);
  const customTimespan = ref<Timespan>(
    new Timespan(
      new Date(getCurrentYear(), 0, 1),
      props.teamSystemLastAvailableDate
    )
  );
  
  function dateRangeChange(ts: Timespan) {
    customTimespan.value = ts;
    focusTimeStamp.value = ts.toITLabel();
    props.computeYtdData({ activeTimespan: ts });
  }
  
  function tableDataToCSV(): string {
    const headers = [
      "",
      `Periodo di riferimento - ${focusTimeStamp.value}`,
      `Dall'inizio dell'anno Fino a - ${props.teamSystemLastAvailableDateStr}`,
      `Ultimo anno fiscale - ${props.lastFiscalYear}`,
    ];
  
    let csv = headers.map(formatForCSV).join(",") + "\n";
  
    const addRow = (category: string, focus: any, ytd: any, lastYear: any) => {
      const formatValue = (value: any) =>
        value === undefined || value === null
          ? "N.P."
          : stringUtils.toCurrencyString(value);
      csv += `${formatForCSV(category)},${formatForCSV(
        formatValue(focus)
      )},${formatForCSV(formatValue(ytd))},${formatForCSV(
        formatValue(lastYear)
      )}\n`;
    };
  
    // Crediti section
    csv += "Crediti\n";
    addRow(
      "Crediti",
      props.yearToSelectedDateData.crediti_sum.sum_ytd_value,
      props.ytdData.crediti_sum.sum_ytd_value,
      props.lastYearData.crediti_sum.sum_ytd_value
    );
    addRow(
      "Crediti verso clienti",
      props.yearToSelectedDateData.crediti_verso_clienti.sum_ytd_value,
      props.ytdData.crediti_verso_clienti.sum_ytd_value,
      props.lastYearData.crediti_verso_clienti.sum_ytd_value
    );
    addRow(
      "Crediti tributari",
      props.yearToSelectedDateData.crediti_tributari.sum_ytd_value,
      props.ytdData.crediti_tributari.sum_ytd_value,
      props.lastYearData.crediti_tributari.sum_ytd_value
    );
    addRow(
      "Crediti previdenziali",
      props.yearToSelectedDateData.crediti_previdenziali.sum_ytd_value,
      props.ytdData.crediti_previdenziali.sum_ytd_value,
      props.lastYearData.crediti_previdenziali.sum_ytd_value
    );
    addRow(
      "Altri crediti",
      props.yearToSelectedDateData.altri_crediti.sum_ytd_value,
      props.ytdData.altri_crediti.sum_ytd_value,
      props.lastYearData.altri_crediti.sum_ytd_value
    );
    addRow(
      "Disponibilita liquide",
      props.yearToSelectedDateData.disponibilita_liquide.sum_ytd_value,
      props.ytdData.disponibilita_liquide.sum_ytd_value,
      props.lastYearData.disponibilita_liquide.sum_ytd_value
    );
  
    // Debiti section
    csv += "\nDebiti\n";
    addRow(
      "Trattamento di fine rapporto",
      props.yearToSelectedDateData.trattamento_di_fine_rapporto.sum_ytd_value,
      props.ytdData.trattamento_di_fine_rapporto.sum_ytd_value,
      props.lastYearData.trattamento_di_fine_rapporto.sum_ytd_value
    );
    addRow(
      "Debiti",
      props.yearToSelectedDateData.debiti_sum.sum_ytd_value,
      props.ytdData.debiti_sum.sum_ytd_value,
      props.lastYearData.debiti_sum.sum_ytd_value
    );
    addRow(
      "Debiti verso banche",
      props.yearToSelectedDateData.debiti_verso_banche.sum_ytd_value,
      props.ytdData.debiti_verso_banche.sum_ytd_value,
      props.lastYearData.debiti_verso_banche.sum_ytd_value
    );
    addRow(
      "Debiti verso fornitori",
      props.yearToSelectedDateData.debiti_verso_fornitori.sum_ytd_value,
      props.ytdData.debiti_verso_fornitori.sum_ytd_value,
      props.lastYearData.debiti_verso_fornitori.sum_ytd_value
    );
    addRow(
      "Debiti tributari",
      props.yearToSelectedDateData.debiti_tributari.sum_ytd_value,
      props.ytdData.debiti_tributari.sum_ytd_value,
      props.lastYearData.debiti_tributari.sum_ytd_value
    );
    addRow(
      "Debiti previdenziali",
      props.yearToSelectedDateData.debiti_previdenziali.sum_ytd_value,
      props.ytdData.debiti_previdenziali.sum_ytd_value,
      props.lastYearData.debiti_previdenziali.sum_ytd_value
    );
    addRow(
      "Debiti verso dipendenti",
      props.yearToSelectedDateData.debiti_verso_dipendenti.sum_ytd_value,
      props.ytdData.debiti_verso_dipendenti.sum_ytd_value,
      props.lastYearData.debiti_verso_dipendenti.sum_ytd_value
    );
    addRow(
      "Altri debiti",
      props.yearToSelectedDateData.altri_debiti.sum_ytd_value,
      props.ytdData.altri_debiti.sum_ytd_value,
      props.lastYearData.altri_debiti.sum_ytd_value
    );
    addRow(
      "Indebitamento netto complessivo",
      props.yearToSelectedDateData.indebitamento_netto_complessivo?.sum_ytd_value,
      props.ytdData.indebitamento_netto_complessivo?.sum_ytd_value,
      props.lastYearData.indebitamento_netto_complessivo?.sum_ytd_value
    );
  
    return csv;
  }
  
  function formatForCSV(value: string): string {
    // value = value.replace(/€/g, ''); // This removes the Euro sign
    if (value.includes(",") || value.includes('"') || value.includes("\n")) {
      return `${value.replace(/"/g, '""').replace(',', '')}`;
    }
    return value;
  }

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

    const filteredArray = jsonArray.filter((_, index) => ![0, 7, 8, jsonArray.length - 1].includes(index));
    const crediti = filteredArray.slice(0, 6)
    const debiti = filteredArray.slice(6, 14)
    const indebitamento_netto_complessivo = filteredArray[filteredArray.length - 1 ]

    return {
      crediti: crediti,
      debiti: debiti,
      indebitamento_netto_complessivo: indebitamento_netto_complessivo
    }
  }
  
  function downloadSituazioneDataCSV() {
    const csv = tableDataToCSV();
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", "situazione_debitoria.csv");
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  const emit = defineEmits<{(e: 'situazione_debitoria_e_creditizia-org-completed', result: any): void}>();

  watch(() => props, (newValue) => {
    const csv = tableDataToCSV();
    const result = csvToJson(csv)
    emit('situazione_debitoria_e_creditizia-org-completed', result);
  }, { immediate: true });
  </script>
  