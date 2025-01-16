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
                :last-date="props.teamSystemLastAvailableDate"
              ></StyledMonthsrangePicker>
            </div>
          </div>
        </div>
        <div class="flex justify-between items-center mb-1">
          <h2 class="text-xl font-semibold mb-4">Andamento economico</h2>
          
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
            @click="downloadAndamentoDataCSV"
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
                  class="py-4 px-6 text-md flex items-center space-x-2"
                  colspan="4"
                >
                  <icon name="material-symbols:chevron-right size-6" />
                  <span>Ricavi</span>
                </td>
              </tr>
              <tr class="border-t border-[#2A334E]">
                <td class="py-2 pl-10 pr-6 text-sm">Ricavi delle vendite</td>
                <td class="py-2 px-6 text-sm text-right">
                  {{ stringUtils.toCurrencyString(FocusChartData.ricavi) }}
                </td>
                <td class="py-2 px-6 text-sm text-right">
                  {{ stringUtils.toCurrencyString(ytdData.ricavi.sum_ytd_value) }}
                </td>
                <td class="py-2 px-6 text-sm text-right">
                  {{
                    stringUtils.toCurrencyString(
                      lastYearData.ricavi.sum_ytd_value
                    )
                  }}
                </td>
              </tr>
              <tr class="border-t border-[#2A334E]">
                <td class="py-2 pl-10 pr-6 text-sm">
                  Ricavi delle prestazioni di servizi
                </td>
                <td class="py-2 px-6 text-sm text-right">
                  {{
                    stringUtils.toCurrencyString(
                      FocusChartData.ricavi_delle_prestazioni_di_servizi
                    )
                  }}
                </td>
                <td class="py-2 px-6 text-sm text-right">
                  {{
                    stringUtils.toCurrencyString(
                      ytdData.ricavi_delle_prestazioni_di_servizi.sum_ytd_value
                    )
                  }}
                </td>
                <td class="py-2 px-6 text-sm text-right">
                  {{
                    stringUtils.toCurrencyString(
                      lastYearData.ricavi_delle_prestazioni_di_servizi
                        .sum_ytd_value
                    )
                  }}
                </td>
              </tr>
              <tr class="border-t border-[#2A334E]">
                <td class="py-2 pl-10 pr-6 text-sm">
                  Variazione rimanze, semilav. e prod. finiti...
                </td>
                <td class="py-2 px-6 text-sm text-right">
                  N.P.
                  <!-- {{
                                  stringUtils.toCurrencyString(FocusChartData.variazione_rimanze_semilav_e_prod_finiti)
                              }}  -->
                </td>
                <td class="py-2 px-6 text-sm text-right">
                  N.P.
                  <!-- {{
                                  stringUtils.toCurrencyString(ytdData.variazione_rimanze_semilav_e_prod_finiti.sum_ytd_value)
                                  }} -->
                </td>
                <td class="py-2 px-6 text-sm text-right">
                  N.P.
                  <!-- {{
                                  stringUtils.toCurrencyString(lastYearData.variazione_rimanze_semilav_e_prod_finiti.sum_ytd_value)
                                  }} -->
                </td>
              </tr>
              <tr class="border-t border-[#2A334E]">
                <td class="py-2 pl-10 pr-6 text-sm text-[#009EFF]">
                  Rimanenze iniziali
                </td>
                <td class="py-2 px-6 text-sm text-right">
                  N.P.
                  <!-- {{
                                  stringUtils.toCurrencyString(FocusChartData.rimanenze_iniziali) }}  -->
                </td>
                <td class="py-2 px-6 text-sm text-right">
                  N.P.
                  <!-- {{
                                  stringUtils.toCurrencyString(ytdData.rimanenze_iniziali.sum_ytd_value) }} -->
                </td>
                <td class="py-2 px-6 text-sm text-right">
                  N.P.
                  <!-- {{
                                  stringUtils.toCurrencyString(lastYearData.rimanenze_iniziali.sum_ytd_value) }}  -->
                </td>
              </tr>
              <tr class="border-t border-[#2A334E]">
                <td class="py-2 pl-10 pr-6 text-sm text-[#009EFF]">
                  Rimanenze finali
                </td>
                <td class="py-2 px-6 text-sm text-right">
                  N.P.
                  <!-- {{stringUtils.toCurrencyString(FocusChartData.rimanenze_finali) }} -->
                </td>
                <td class="py-2 px-6 text-sm text-right">
                  N.P.
                  <!-- {{stringUtils.toCurrencyString(ytdData.rimanenze_finali.sum_ytd_value) }} -->
                </td>
                <td class="py-2 px-6 text-sm text-right">
                  N.P.
                  <!-- {{ stringUtils.toCurrencyString(lastYearData.rimanenze_finali.sum_ytd_value) }} -->
                </td>
              </tr>
              <tr class="border-t border-[#2A334E]">
                <td class="py-2 pl-10 pr-6 text-sm">
                  Altri ricavi e proventi della gestione...
                </td>
                <td class="py-2 px-6 text-sm text-right">
                  {{
                    stringUtils.toCurrencyString(
                      FocusChartData.altri_ricavi_e_proventi_della_gestione
                    )
                  }}
                </td>
                <td class="py-2 px-6 text-sm text-right">
                  {{
                    stringUtils.toCurrencyString(
                      ytdData.altri_ricavi_e_proventi_della_gestione.sum_ytd_value
                    )
                  }}
                </td>
                <td class="py-2 px-6 text-sm text-right">
                  {{
                    stringUtils.toCurrencyString(
                      lastYearData.altri_ricavi_e_proventi_della_gestione
                        .sum_ytd_value
                    )
                  }}
                </td>
              </tr>
              <tr class="border-t border-[#2A334E]">
                <td class="py-2 pl-10 pr-6 text-sm">
                  Contributi in c/esercizio o in c/capitale
                </td>
                <td class="py-2 px-6 text-sm text-right">
                  {{
                    stringUtils.toCurrencyString(
                      FocusChartData.contributi_in_c_esercizio_o_in_c_capitale
                    )
                  }}
                </td>
                <td class="py-2 px-6 text-sm text-right">
                  {{
                    stringUtils.toCurrencyString(
                      ytdData.contributi_in_c_esercizio_o_in_c_capitale
                        .sum_ytd_value
                    )
                  }}
                </td>
                <td class="py-2 px-6 text-sm text-right">
                  {{
                    stringUtils.toCurrencyString(
                      lastYearData.contributi_in_c_esercizio_o_in_c_capitale
                        .sum_ytd_value
                    )
                  }}
                </td>
              </tr>
              <tr class="border-t border-[#2A334E]">
                <td class="py-4 px-6 text-md font-semibold">
                  Totale ricavi (Totale valore della produzione)
                </td>
                <td class="py-4 px-6 text-sm font-semibold text-right">
                  {{
                    stringUtils.toCurrencyString(
                      FocusChartData.ricavi_totale_valore_della_produzione
                    )
                  }}
                </td>
                <td class="py-4 px-6 text-sm font-semibold text-right">
                  {{
                    stringUtils.toCurrencyString(
                      ytdData.ricavi_totale_valore_della_produzione?.sum_ytd_value
                    )
                  }}
                </td>
                <td class="py-4 px-6 text-sm font-semibold text-right">
                  {{
                    stringUtils.toCurrencyString(
                      lastYearData.ricavi_totale_valore_della_produzione
                        ?.sum_ytd_value
                    )
                  }}
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
              <tr class="border-t border-[#2A334E]">
                <td class="py-2 pl-10 pr-6 text-sm">
                  Materiali e materie di consumo
                </td>
                <td class="py-2 px-6 text-sm text-right">
                  {{
                    stringUtils.toCurrencyString(
                      FocusChartData.materiali_e_materie_di_consumo
                    )
                  }}
                </td>
                <td class="py-2 px-6 text-sm text-right">
                  {{
                    stringUtils.toCurrencyString(
                      ytdData.materiali_e_materie_di_consumo.sum_ytd_value
                    )
                  }}
                </td>
                <td class="py-2 px-6 text-sm text-right">
                  {{
                    stringUtils.toCurrencyString(
                      lastYearData.materiali_e_materie_di_consumo.sum_ytd_value
                    )
                  }}
                </td>
              </tr>
              <tr class="border-t border-[#2A334E]">
                <td class="py-2 pl-10 pr-6 text-sm">
                  Variazione delle rimanenze materie prime (+/-)
                </td>
                <td class="py-2 px-6 text-sm text-right">
                  N.P.
                  <!-- {{
                                  stringUtils.toCurrencyString(FocusChartData.variazione_delle_rimanenze_materie_prime)
                              }}  -->
                </td>
                <td class="py-2 px-6 text-sm text-right">
                  N.P.
                  <!-- {{
                                  stringUtils.toCurrencyString(ytdData.variazione_delle_rimanenze_materie_prime.sum_ytd_value)
                                  }} -->
                </td>
                <td class="py-2 px-6 text-sm text-right">
                  N.P.
                  <!-- {{
                                  stringUtils.toCurrencyString(lastYearData.variazione_delle_rimanenze_materie_prime.sum_ytd_value)
                                  }} -->
                </td>
              </tr>
              <tr class="border-t border-[#2A334E]">
                <td class="py-2 pl-10 pr-6 text-sm text-[#009EFF]">
                  Rimanenze iniziali
                </td>
                <td class="py-2 px-6 text-sm text-right">
                  N.P.
                  <!-- {{stringUtils.toCurrencyString(FocusChartData.costi_rimanenze_iniziali) }} -->
                </td>
                <td class="py-2 px-6 text-sm text-right">
                  N.P.
                  <!-- {{stringUtils.toCurrencyString(ytdData.costi_rimanenze_iniziali.sum_ytd_value) }} -->
                </td>
                <td class="py-2 px-6 text-sm text-right">
                  N.P.
                  <!-- {{stringUtils.toCurrencyString(lastYearData.costi_rimanenze_iniziali.sum_ytd_value) }} -->
                </td>
              </tr>
              <tr class="border-t border-[#2A334E]">
                <td class="py-2 pl-10 pr-6 text-sm text-[#009EFF]">
                  Rimanenze finali
                </td>
                <td class="py-2 px-6 text-sm text-right">
                  N.P.
                  <!-- {{stringUtils.toCurrencyString(FocusChartData.costi_rimanenze_finali) }} -->
                </td>
                <td class="py-2 px-6 text-sm text-right">
                  N.P.
                  <!-- {{stringUtils.toCurrencyString(ytdData.costi_rimanenze_finali.sum_ytd_value) }} -->
                </td>
                <td class="py-2 px-6 text-sm text-right">
                  N.P.
                  <!-- {{stringUtils.toCurrencyString(lastYearData.costi_rimanenze_finali.sum_ytd_value) }} -->
                </td>
              </tr>
              <tr class="border-t border-[#2A334E]">
                <td class="py-2 pl-10 pr-6 text-sm">Lavorazioni di terzi</td>
                <td class="py-2 px-6 text-sm text-right">
                  {{
                    stringUtils.toCurrencyString(
                      FocusChartData.costi_lavorazioni_di_terzi
                    )
                  }}
                </td>
                <td class="py-2 px-6 text-sm text-right">
                  {{
                    stringUtils.toCurrencyString(
                      ytdData.costi_lavorazioni_di_terzi.sum_ytd_value
                    )
                  }}
                </td>
                <td class="py-2 px-6 text-sm text-right">
                  {{
                    stringUtils.toCurrencyString(
                      lastYearData.costi_lavorazioni_di_terzi.sum_ytd_value
                    )
                  }}
                </td>
              </tr>
              <tr class="border-t border-[#2A334E]">
                <td class="py-2 pl-10 pr-6 text-sm">
                  Altri costi per servizi (generali-fissi)
                </td>
                <td class="py-2 px-6 text-sm text-right">
                  {{
                    stringUtils.toCurrencyString(
                      FocusChartData.costi_altri_costi_per_servizi_generali_fissi
                    )
                  }}
                </td>
                <td class="py-2 px-6 text-sm text-right">
                  {{
                    stringUtils.toCurrencyString(
                      ytdData.costi_altri_costi_per_servizi_generali_fissi
                        .sum_ytd_value
                    )
                  }}
                </td>
                <td class="py-2 px-6 text-sm text-right">
                  {{
                    stringUtils.toCurrencyString(
                      lastYearData.costi_altri_costi_per_servizi_generali_fissi
                        .sum_ytd_value
                    )
                  }}
                </td>
              </tr>
              <tr class="border-t border-[#2A334E]">
                <td class="py-2 pl-10 pr-6 text-sm">Affitti/noleggi</td>
                <td class="py-2 px-6 text-sm text-right">
                  {{
                    stringUtils.toCurrencyString(
                      FocusChartData.costi_affitti_noleggi
                    )
                  }}
                </td>
                <td class="py-2 px-6 text-sm text-right">
                  {{
                    stringUtils.toCurrencyString(
                      ytdData.costi_affitti_noleggi.sum_ytd_value
                    )
                  }}
                </td>
                <td class="py-2 px-6 text-sm text-right">
                  {{
                    stringUtils.toCurrencyString(
                      lastYearData.costi_affitti_noleggi.sum_ytd_value
                    )
                  }}
                </td>
              </tr>
              <tr class="border-t border-[#2A334E]">
                <td class="py-2 pl-10 pr-6 text-sm">Costo dipendenti</td>
                <td class="py-2 px-6 text-sm text-right">
                  {{
                    stringUtils.toCurrencyString(
                      FocusChartData.costi_costo_dipendenti
                    )
                  }}
                </td>
                <td class="py-2 px-6 text-sm text-right">
                  {{
                    stringUtils.toCurrencyString(
                      ytdData.costi_costo_dipendenti.sum_ytd_value
                    )
                  }}
                </td>
                <td class="py-2 px-6 text-sm text-right">
                  {{
                    stringUtils.toCurrencyString(
                      lastYearData.costi_costo_dipendenti.sum_ytd_value
                    )
                  }}
                </td>
              </tr>
              <tr class="border-t border-[#2A334E]">
                <td class="py-2 pl-10 pr-6 text-sm">Oneri diversi di gestione</td>
                <td class="py-2 px-6 text-sm text-right">
                  {{
                    stringUtils.toCurrencyString(
                      FocusChartData.costi_oneri_diversi_di_gestione
                    )
                  }}
                </td>
                <td class="py-2 px-6 text-sm text-right">
                  {{
                    stringUtils.toCurrencyString(
                      ytdData.costi_oneri_diversi_di_gestione.sum_ytd_value
                    )
                  }}
                </td>
                <td class="py-2 px-6 text-sm text-right">
                  {{
                    stringUtils.toCurrencyString(
                      lastYearData.costi_oneri_diversi_di_gestione.sum_ytd_value
                    )
                  }}
                </td>
              </tr>
              <tr class="border-t border-[#2A334E]">
                <td class="py-4 px-6 text-md font-semibold">EBITDA</td>
                <td class="py-4 px-6 text-sm font-semibold text-right">
                  {{ stringUtils.toCurrencyString(FocusChartData.ebitda) }}
                </td>
                <td class="py-4 px-6 text-sm font-semibold text-right">
                  {{
                    stringUtils.toCurrencyString(ytdData.ebitda?.sum_ytd_value)
                  }}
                </td>
                <td class="py-4 px-6 text-sm font-semibold text-right">
                  {{
                    stringUtils.toCurrencyString(
                      lastYearData.ebitda?.sum_ytd_value
                    )
                  }}
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
              <tr class="border-t border-[#2A334E]">
                <td class="py-2 pl-10 pr-6 text-sm">
                  Oneri finanziari e oneri bancari (+/-)
                </td>
                <td class="py-2 px-6 text-sm text-right">
                  {{
                    stringUtils.toCurrencyString(
                      FocusChartData.oneri_finanziari_e_oneri_bancari
                    )
                  }}
                </td>
                <td class="py-2 px-6 text-sm text-right">
                  {{
                    stringUtils.toCurrencyString(
                      ytdData.oneri_finanziari_e_oneri_bancari.sum_ytd_value
                    )
                  }}
                </td>
                <td class="py-2 px-6 text-sm text-right">
                  {{
                    stringUtils.toCurrencyString(
                      lastYearData.oneri_finanziari_e_oneri_bancari.sum_ytd_value
                    )
                  }}
                </td>
              </tr>
              <tr class="border-t border-[#2A334E]">
                <td class="py-2 pl-10 pr-6 text-sm text-[#009EFF]">
                  Proventi di natura finanziaria
                </td>
                <td class="py-2 px-6 text-sm text-right">
                  {{
                    stringUtils.toCurrencyString(
                      FocusChartData.proventi_di_natura_finanziaria
                    )
                  }}
                </td>
                <td class="py-2 px-6 text-sm text-right">
                  {{
                    stringUtils.toCurrencyString(
                      ytdData.proventi_di_natura_finanziaria.sum_ytd_value
                    )
                  }}
                </td>
                <td class="py-2 px-6 text-sm text-right">
                  {{
                    stringUtils.toCurrencyString(
                      lastYearData.proventi_di_natura_finanziaria.sum_ytd_value
                    )
                  }}
                </td>
              </tr>
              <tr class="border-t border-[#2A334E]">
                <td class="py-2 pl-10 pr-6 text-sm text-[#009EFF]">
                  Oneri finanziari
                </td>
                <td class="py-2 px-6 text-sm text-right">
                  {{
                    stringUtils.toCurrencyString(FocusChartData.oneri_finanziari)
                  }}
                </td>
                <td class="py-2 px-6 text-sm text-right">
                  {{
                    stringUtils.toCurrencyString(
                      ytdData.oneri_finanziari.sum_ytd_value
                    )
                  }}
                </td>
                <td class="py-2 px-6 text-sm text-right">
                  {{
                    stringUtils.toCurrencyString(
                      lastYearData.oneri_finanziari.sum_ytd_value
                    )
                  }}
                </td>
              </tr>
              <tr class="border-t border-[#2A334E]">
                <td class="py-2 pl-10 pr-6 text-sm">
                  Ammortamenti, svalutazioni e altri accantonamenti
                </td>
                <td class="py-2 px-6 text-sm text-right">
                  {{
                    stringUtils.toCurrencyString(
                      FocusChartData.ammortamenti_svalutazioni_e_altri_accantonamenti
                    )
                  }}
                </td>
                <td class="py-2 px-6 text-sm text-right">
                  {{
                    stringUtils.toCurrencyString(
                      ytdData.ammortamenti_svalutazioni_e_altri_accantonamenti
                        .sum_ytd_value
                    )
                  }}
                </td>
                <td class="py-2 px-6 text-sm text-right">
                  {{
                    stringUtils.toCurrencyString(
                      lastYearData
                        .ammortamenti_svalutazioni_e_altri_accantonamenti
                        .sum_ytd_value
                    )
                  }}
                </td>
              </tr>
              <tr class="border-t border-[#2A334E]">
                <td class="py-2 pl-10 pr-6 text-sm">Imposte sul reddito</td>
                <td class="py-2 px-6 text-sm text-right">
                  {{
                    stringUtils.toCurrencyString(
                      FocusChartData.imposte_sul_reddito
                    )
                  }}
                </td>
                <td class="py-2 px-6 text-sm text-right">
                  {{
                    stringUtils.toCurrencyString(
                      ytdData.imposte_sul_reddito.sum_ytd_value
                    )
                  }}
                </td>
                <td class="py-2 px-6 text-sm text-right">
                  {{
                    stringUtils.toCurrencyString(
                      lastYearData.imposte_sul_reddito.sum_ytd_value
                    )
                  }}
                </td>
              </tr>
              <tr class="border-t border-[#2A334E]">
                <td class="py-4 px-6 text-md font-semibold">Utile del Periodo</td>
                <td class="py-4 px-6 text-sm font-semibold text-right">
                  {{
                    stringUtils.toCurrencyString(FocusChartData.utile_del_periodo)
                  }}
                </td>
                <td class="py-4 px-6 text-sm font-semibold text-right">
                  {{
                    stringUtils.toCurrencyString(
                      ytdData.utile_del_periodo?.sum_ytd_value
                    )
                  }}
                </td>
                <td class="py-4 px-6 text-sm font-semibold text-right">
                  {{
                    stringUtils.toCurrencyString(
                      lastYearData.utile_del_periodo?.sum_ytd_value
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
  import * as stringUtils from "~/src/common/string";
  import Timespan from "~/src/timespan";
  import DateBuilder from "~/src/date_builder";
  import DateFilter from "~/src/date_filter";
  import {
    TeamSystemLastYearCurrentYearChart,
    TeamSystemSummary,
  } from "~/src/types/teamsystem_types";
  import {
    dateToUTC,
    getCurrentYear,
    getDateLabel,
    getLastMonthDate,
  } from "~/src/common/dates";
import { filter } from "lodash";
  
  const focusDataLoading = ref<boolean>(false);
  const activeTimespan = ref<Timespan>(Timespan.thisYear());
  const isCustomPeriod = ref(false);
  const dateRangeKey = ref(0);
  const FocusChartData = ref<TeamSystemSummary>(<TeamSystemSummary>{});
  const trimestersSince2020 = ref<any>([]);
  const focusTimeStamp = ref<string>("");
  const focusTimeStampLabel = ref<string>("");
  const props = defineProps<{
    chartsData: TeamSystemLastYearCurrentYearChart;
    teamSystemLastAvailableDate: Date;
    teamSystemLastAvailableDateStr: string;
    computeSimpleYearSeries: ({
      activeTimespan,
      focusTimeLabel,
    }: {
      activeTimespan: Timespan;
      focusTimeLabel: string;
    }) => TeamSystemSummary;
    ytdData: TeamSystemLastYearCurrentYearChart;
    lastYearData: TeamSystemLastYearCurrentYearChart;
    mode: string;
    lastFiscalYear: number;
    lastSynchedDate:string;
  }>();
  const customTimespan = ref<Timespan>(
    new Timespan(
      new Date(getCurrentYear(), 0, 1),
      props.teamSystemLastAvailableDate
    )
  );
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
      updateFocusTable();
    }
  }
  
  const getQuarterOption = (startDate: Date) => {
    const lastQuarter = Timespan.getQuarter(startDate);
    const lastQuarterLastDay = lastQuarter.to;
    const lastQuarterFirstDay = lastQuarter.from;
    const quarter = lastQuarterFirstDay.getMonth() / 3 + 1;
    const year = lastQuarterFirstDay.getFullYear();
    return {
      year: year,
      quarter: quarter,
      start: lastQuarterFirstDay.toString(),
      end: lastQuarterLastDay.toString(),
      label: `Q${quarter} ${year}`,
      text: `Q${quarter} ${year}`,
    };
  };
  
  const getTrimestersSince2020 = async () => {
    const startDate = Timespan.getLastMonthDate(
      props.teamSystemLastAvailableDate
    );
    const startYear = startDate.getFullYear();
    const currentYear = startDate.getFullYear();
    const currentMonth = startDate.getMonth() + 1; // Months are zero-indexed, so we add 1
    const previewLastMonth = Timespan.getLastMonthDate(
      props.teamSystemLastAvailableDate
    );
    const trimesters = [
      {
        year: props.teamSystemLastAvailableDate.getFullYear(),
        quarter: 0,
        start: props.teamSystemLastAvailableDate.toString(),
        end: new Date(
          props.teamSystemLastAvailableDate.getFullYear(),
          props.teamSystemLastAvailableDate.getMonth() + 1,
          0,
          0,
          0,
          0
        ).toString(),
        label: `Ultimo mese - ${stringUtils.toMonthYearString(
          props.teamSystemLastAvailableDate
        )}`,
        text: stringUtils.toMonthYearString(props.teamSystemLastAvailableDate),
      },
      {
        year: previewLastMonth.getFullYear(),
        quarter: 0,
        start: previewLastMonth.toString(),
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
  
    const lastQuarter1 = getQuarterOption(props.teamSystemLastAvailableDate);
    const lastStart = new Date(lastQuarter1.start);
    const nextDay = new DateBuilder(lastStart)
      .withDate({ day: 1 })
      .withDate({ month: lastStart.getDate() + 1 })
      .withTime({ hours: 0, minutes: 0, seconds: 0 });
    const lastQuarter2 = getQuarterOption(nextDay.get());
    trimesters.push(lastQuarter2);
    trimesters.push(lastQuarter1);
  
    // for (let year = startYear; year <= currentYear; year++) {
    //     for (let quarter = 1; quarter <= 4; quarter++) {
    //         // Calculate the quarter's end month
    //         const endMonth = quarter * 3;
  
    //         // If we're in the current year, stop adding trimesters once we've reached the current month
    //         if (year === currentYear && endMonth >= currentMonth) {
    //             break;
    //         }
    //         const endDate = new Date(year, endMonth, 0, 0, 0, 0);
  
    //         trimesters.push({
    //             year,
    //             quarter,
    //             start: `${year}-${(endMonth - 2).toString().padStart(2, "0")}`,
    //             end: endDate.toString(),
    //             label: `Q${quarter} ${year}`,
    //             text : `Q${quarter} ${year}`
    //         });
    //     }
    // }
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
    updateFocusTable();
  };
  
  onMounted(async () => {
    trimestersSince2020.value = await getTrimestersSince2020();
    if (props.mode == "monthly") {
      focusTimeStamp.value = trimestersSince2020.value[0].label;
      focusTimeStampLabel.value = trimestersSince2020.value[0].label;
    } else {
      const trimestersSince2020Length = trimestersSince2020.value.length;
      focusTimeStamp.value =
        trimestersSince2020.value[trimestersSince2020Length - 2].label;
      focusTimeStampLabel.value =
        trimestersSince2020.value[trimestersSince2020Length - 2].label;
    }
    updateFocusTable();
  });
  
  
  function andamentoTableDataToCSV(): string {
    const headers = [
      "",
      `Periodo di riferimento - ${focusTimeStamp.value}`,
      `Dall'inizio dell'anno Fino a - ${props.teamSystemLastAvailableDateStr}`,
      `Ultimo anno fiscale - ${props.lastFiscalYear}`
    ];
  
    let csv = headers.join(',') + '\n';
  
    function addRow(category: string, focus: any, ytd: any, lastYear: any) {
      const focusValue = typeof focus === 'number' ? stringUtils.toCurrencyString(focus) : 'N.P.';
      const ytdValue = ytd?.sum_ytd_value !== undefined ? stringUtils.toCurrencyString(ytd.sum_ytd_value) : 'N.P.';
      const lastYearValue = lastYear?.sum_ytd_value !== undefined ? stringUtils.toCurrencyString(lastYear.sum_ytd_value) : 'N.P.';
      csv += `${formatForCSV(category)},${formatForCSV(focusValue)},${formatForCSV(ytdValue)},${formatForCSV(lastYearValue)}\n`;
    }
  
    // Ricavi section
    csv += 'Ricavi\n';
    addRow("Ricavi delle vendite", FocusChartData.value.ricavi, props.ytdData.ricavi, props.lastYearData.ricavi);
    addRow("Ricavi delle prestazioni di servizi", FocusChartData.value.ricavi_delle_prestazioni_di_servizi, props.ytdData.ricavi_delle_prestazioni_di_servizi, props.lastYearData.ricavi_delle_prestazioni_di_servizi);
    addRow("Variazione rimanze, semilav. e prod. finiti...", FocusChartData.value.variazione_rimanze_semilav_e_prod_finiti, props.ytdData.variazione_rimanze_semilav_e_prod_finiti, props.lastYearData.variazione_rimanze_semilav_e_prod_finiti);
    addRow("Rimanenze iniziali", FocusChartData.value.rimanenze_iniziali, props.ytdData.rimanenze_iniziali, props.lastYearData.rimanenze_iniziali);
    addRow("Rimanenze finali", FocusChartData.value.rimanenze_finali, props.ytdData.rimanenze_finali, props.lastYearData.rimanenze_finali);
    addRow("Altri ricavi e proventi della gestione...", FocusChartData.value.altri_ricavi_e_proventi_della_gestione, props.ytdData.altri_ricavi_e_proventi_della_gestione, props.lastYearData.altri_ricavi_e_proventi_della_gestione);
    addRow("Contributi in c/esercizio o in c/capitale", FocusChartData.value.contributi_in_c_esercizio_o_in_c_capitale, props.ytdData.contributi_in_c_esercizio_o_in_c_capitale, props.lastYearData.contributi_in_c_esercizio_o_in_c_capitale);
    addRow("Totale ricavi (Totale valore della produzione)", FocusChartData.value.ricavi_totale_valore_della_produzione, props.ytdData.ricavi_totale_valore_della_produzione, props.lastYearData.ricavi_totale_valore_della_produzione);
  
    // Costi section
    csv += 'Costi\n';
    addRow("Materiali e materie di consumo", FocusChartData.value.materiali_e_materie_di_consumo, props.ytdData.materiali_e_materie_di_consumo, props.lastYearData.materiali_e_materie_di_consumo);
    addRow("Variazione delle rimanenze materie prime (+/-)", FocusChartData.value.variazione_delle_rimanenze_materie_prime, props.ytdData.variazione_delle_rimanenze_materie_prime, props.lastYearData.variazione_delle_rimanenze_materie_prime);
    addRow("Rimanenze iniziali", FocusChartData.value.costi_rimanenze_iniziali, props.ytdData.costi_rimanenze_iniziali, props.lastYearData.costi_rimanenze_iniziali);
    addRow("Rimanenze finali", FocusChartData.value.costi_rimanenze_finali, props.ytdData.costi_rimanenze_finali, props.lastYearData.costi_rimanenze_finali);
    addRow("Lavorazioni di terzi", FocusChartData.value.costi_lavorazioni_di_terzi, props.ytdData.costi_lavorazioni_di_terzi, props.lastYearData.costi_lavorazioni_di_terzi);
    addRow("Altri costi per servizi (generali-fissi)", FocusChartData.value.costi_altri_costi_per_servizi_generali_fissi, props.ytdData.costi_altri_costi_per_servizi_generali_fissi, props.lastYearData.costi_altri_costi_per_servizi_generali_fissi);
    addRow("Affitti/noleggi", FocusChartData.value.costi_affitti_noleggi, props.ytdData.costi_affitti_noleggi, props.lastYearData.costi_affitti_noleggi);
    addRow("Costo dipendenti", FocusChartData.value.costi_costo_dipendenti, props.ytdData.costi_costo_dipendenti, props.lastYearData.costi_costo_dipendenti);
    addRow("Oneri diversi di gestione", FocusChartData.value.costi_oneri_diversi_di_gestione, props.ytdData.costi_oneri_diversi_di_gestione, props.lastYearData.costi_oneri_diversi_di_gestione);
  
    // EBITDA row
    addRow("EBITDA", FocusChartData.value.ebitda, props.ytdData.ebitda, props.lastYearData.ebitda);
  
    // Costi non operativi section
    csv += 'Costi non operativi\n';
    addRow("Oneri finanziari e oneri bancari (+/-)", FocusChartData.value.oneri_finanziari_e_oneri_bancari, props.ytdData.oneri_finanziari_e_oneri_bancari, props.lastYearData.oneri_finanziari_e_oneri_bancari);
    addRow("Proventi di natura finanziaria", FocusChartData.value.proventi_di_natura_finanziaria, props.ytdData.proventi_di_natura_finanziaria, props.lastYearData.proventi_di_natura_finanziaria);
    addRow("Oneri finanziari", FocusChartData.value.oneri_finanziari, props.ytdData.oneri_finanziari, props.lastYearData.oneri_finanziari);
    addRow("Ammortamenti, svalutazioni e altri accantonamenti", FocusChartData.value.ammortamenti_svalutazioni_e_altri_accantonamenti, props.ytdData.ammortamenti_svalutazioni_e_altri_accantonamenti, props.lastYearData.ammortamenti_svalutazioni_e_altri_accantonamenti);
    addRow("Imposte sul reddito", FocusChartData.value.imposte_sul_reddito, props.ytdData.imposte_sul_reddito, props.lastYearData.imposte_sul_reddito);
  
    // Final row
    addRow("Utile del Periodo", FocusChartData.value.utile_del_periodo, props.ytdData.utile_del_periodo, props.lastYearData.utile_del_periodo);
  
    return csv;
  }
  
  function formatForCSV(value: string): string {
    // value = value.replace(/€/g, ''); // This removes the Euro sign
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      return `${value.replace(/"/g, '""').replace(',', '')}`;
    }
    return value;
  }
  
  function downloadAndamentoDataCSV() {
    const csv = andamentoTableDataToCSV();
    console.log(csvToJson(csv));
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'andamento_economico_report.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }
  
  
  const getFocusTimeStamp = () => {
    if (isCustomPeriod.value) {
      return customTimespan.value;
      const from = customTimespan.value.from;
      const to = customTimespan.value.from;
      from.setHours(0);
      to.setHours(23);
      from.setMinutes(0);
      to.setMinutes(59);
      from.setSeconds(0);
      to.setSeconds(59);
      return new Timespan(from, to);
    } else {
      let startDate = new Date(
        trimestersSince2020.value.find(
          (t: any) => t.label === focusTimeStamp.value
        ).start
      );
      startDate = new Date(
          startDate.getFullYear(),
          startDate.getMonth(),
          1,
          0,
          0,
          0
        )
      const endDate = new Date(
        trimestersSince2020.value.find(
          (t: any) => t.label === focusTimeStamp.value
        ).end
      );
      startDate.setHours(0);
      endDate.setHours(23);
      startDate.setMinutes(0);
      endDate.setMinutes(59);
      startDate.setSeconds(0);
      endDate.setSeconds(59);
      return new Timespan(startDate, endDate);
    }
  };
  
  const updateFocusTable = () => {
    const activeTimespan = getFocusTimeStamp();
    console.log({ activeTimespan });
    FocusChartData.value = props.computeSimpleYearSeries({
      activeTimespan: activeTimespan,
      focusTimeLabel: focusTimeStamp.value,
    });
    focusDataLoading.value = false;
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

    const filteredArray = jsonArray.filter((_, index) => ![0, 9, 20, jsonArray.length - 1].includes(index));
    const ricavi = filteredArray.slice(0, 7)
    const totale_ricavi = filteredArray[7]
    const costi = filteredArray.slice(8, 17)
    const ebitda = filteredArray[17]
    const utile_del_periodo = filteredArray[filteredArray.length - 1 ]
    const costi_non_operativi = filteredArray.slice(18, 23)

    return {
      ricavi: ricavi,
      totale_ricavi: totale_ricavi,
      costi: costi,
      ebitda: ebitda,
      costi_non_operativi: costi_non_operativi,
      utile_del_periodo: utile_del_periodo
    }
  }

  const emit = defineEmits<{(e: 'andamento_economico-org-completed', result: any): void}>();

  watch(() => props, (newValue) => {
    const csv = andamentoTableDataToCSV();
    const result = csvToJson(csv)
    emit('andamento_economico-org-completed', result);
  }, { immediate: true });
  
  </script>
  