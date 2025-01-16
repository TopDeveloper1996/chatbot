<template>
    <div class="flex flex-col">
        <div class="flex flex-col gap-2">
            <div>
                <div class="flex flex-row items-center gap-2">
                    <h1 class="text-2xl font-bold">Inserimento dati</h1>
                    <icon name="material-symbols:info" class="size-6"></icon>
                </div>
                <p class="text-sm font-light">Inserisci i dati relativi al costo del lavoro, ammortamenti, svalutazioni e altri accantonamenti, oneri finanziari e bancari e ricavi dal valore della produzione.</p>
                <div class="divider"></div>
                <div v-if="computing || loading" class="flex justify-center w-full">
                    <div class="flex items-center flex-row gap-2">
                        <icon class="size-6" name="line-md:loading-twotone-loop"></icon>
                        <p class="">Preparando l'ambiente</p>
                    </div>
                </div>
                <div v-else class="flex justify-center w-full">
                    <button class="primary-button" @click="enableDisableMassCopy"  :disabled="computing">
                        <div class="flex flex-col gap-2 items-center">
                            <div class="flex flex-row gap-2 items-center">
                                <p v-if ="!massCopyMode">Copia valori</p>
                                <p v-if ="massCopyMode">Annulla copia valori</p>
                                <icon name="material-symbols:copy" class="size-6"></icon>
                            </div>
                            <p class="text-sm font-light">Copia i valori di un mese su tutti gli altri mesi</p>
                        </div>
                    </button>
                    <div class="flex flex-row gap-2 items-center p-3">
                        <StyledMonthsrangePicker class="h-[3rem]" @change="dateRangeChange"
                             v-show="massCopyMode"
                             :initialTimespan="copyTimespan"
                            :last-date="now"></StyledMonthsrangePicker>
                    </div>
                    <button class="primary-button" v-if="massCopyMode" @click="applyMassCopy" :disabled="!canApplyCopy">
                        <div class="flex flex-col gap-2 items-center">
                            <div class="flex flex-row gap-2 items-center">
                                <p>Apply</p>
                                <icon name="material-symbols:copy" class="size-6"></icon>
                            </div>
                        </div>
                    </button>
                </div>
                <table class="mt-4 conto-table table-container">
                    <thead>
                        <tr>
                            <th class="text-nowrap text-center sticky-left">Metrica cumulativa</th>
                            <th class="text-nowrap text-center sticky-left">Metriche Specifche</th>
                            <th class="text-nowrap" v-for="row in tableData" :key="row.date.getMilliseconds()">
                                <p>{{ stringUtils.capitalize(format(row.date, 'LLLL-yyy', { locale: it })) }}</p>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td rowspan="6" class="[writing-mode:vertical-lr] text-center sticky-left">
                                Costo del Lavoro
                            </td>
                        </tr>
                        <tr class="align-top">
                            <td class="text-nowrap sticky-left">
                                Salari e stipendi 
                            </td>
                            <td  v-for="row in tableData" :key="row.date.getMilliseconds()">
                                <div class="flex flex-row gap-2 items-center" v-if="massCopyMode">
                                    <span class="input-symbol-euro"> 
                                        <input type="number" :disabled="computing" placeholder="000.00"  v-model="row.salari_e_stipendi"  class="w-full py-2 px-6 text-sm text-right"/>
                                    </span>
                                    <input type="checkbox" v-model="copyChecks[row.date.toLocaleDateString()].salari_e_stipendi" v-if="massCopyMode" class="w-4 h-4"/>
                                </div>
                                <span class="input-symbol-euro" v-else> 
                                        <input type="number" :disabled="computing" placeholder="000.00"  v-model="row.salari_e_stipendi"  class="w-full py-2 px-6 text-sm text-right"/>
                                </span>
                            </td>
                        </tr>
                        <tr class="align-top">
                            <td>
                                Contributi INPS
                            </td>
                            <td  v-for="row in tableData" :key="row.date.getMilliseconds()">
                                <div class="flex flex-row gap-2 items-center" v-if="massCopyMode">
                                    <span class="input-symbol-euro"> 
                                        <input type="number" :disabled="computing" placeholder="000.00"  v-model="row.contributi_inps"  class="w-full py-2 px-6 text-sm text-right"/>
                                    </span>
                                    <input type="checkbox" v-model="copyChecks[row.date.toLocaleDateString()].contributi_inps" v-if="massCopyMode" class="w-4 h-4"/>
                                </div>
                                <span class="input-symbol-euro" v-else> 
                                        <input type="number" :disabled="computing" placeholder="000.00"  v-model="row.contributi_inps"  class="w-full py-2 px-6 text-sm text-right"/>
                                </span>
                            </td>
                        </tr>
                        <tr class="align-top">
                            <td>
                                TFR
                            </td>
                            <td  v-for="row in tableData" :key="row.date.getMilliseconds()">
                                <div class="flex flex-row gap-2 items-center" v-if="massCopyMode">
                                    <span class="input-symbol-euro"> 
                                        <input type="number" :disabled="computing" placeholder="000.00"  v-model="row.tfr"  class="w-full py-2 px-6 text-sm text-right"/>
                                    </span>
                                    <input type="checkbox" v-model="copyChecks[row.date.toLocaleDateString()].tfr" v-if="massCopyMode" class="w-4 h-4"/>
                                </div>
                                <span class="input-symbol-euro" v-else> 
                                        <input type="number" :disabled="computing" placeholder="000.00"  v-model="row.tfr"  class="w-full py-2 px-6 text-sm text-right"/>
                                </span>
                            </td>
                        </tr>
                        <tr class="align-top">
                            <td>
                                Ratei ferie e permessi
                            </td>
                            <td  v-for="row in tableData" :key="row.date.getMilliseconds()">
                                <div class="flex flex-row gap-2 items-center" v-if="massCopyMode">
                                    <span class="input-symbol-euro"> 
                                        <input type="number" :disabled="computing" placeholder="000.00"  v-model="row.ratei_ferie_e_permessi"  class="w-full py-2 px-6 text-sm text-right"/>
                                    </span>
                                    <input type="checkbox" v-model="copyChecks[row.date.toLocaleDateString()].ratei_ferie_e_permessi" v-if="massCopyMode" class="w-4 h-4"/>
                                </div>
                                <span class="input-symbol-euro" v-else> 
                                        <input type="number" :disabled="computing" placeholder="000.00"  v-model="row.ratei_ferie_e_permessi"  class="w-full py-2 px-6 text-sm text-right"/>
                                </span>
                            </td>
                        </tr>
                        <tr class="align-top">
                            <td>
                                INAIL
                            </td>
                            <td  v-for="row in tableData" :key="row.date.getMilliseconds()">
                                <div class="flex flex-row gap-2 items-center" v-if="massCopyMode">
                                    <span class="input-symbol-euro"> 
                                        <input type="number" :disabled="computing" placeholder="000.00"  v-model="row.contributi_inail"  class="w-full py-2 px-6 text-sm text-right"/>
                                    </span>
                                    <input type="checkbox" v-model="copyChecks[row.date.toLocaleDateString()].contributi_inail"  v-if="massCopyMode" class="w-4 h-4"/>
                                </div>
                                <span class="input-symbol-euro" v-else> 
                                        <input type="number" :disabled="computing" placeholder="000.00"  v-model="row.contributi_inail"  class="w-full py-2 px-6 text-sm text-right"/>
                                </span>
                            </td>
                        </tr>
                        <tr class="align-top">
                            <td colspan="2" class="text-center">
                                Costo Totale Del Lavoro
                            </td>
                            <td class="text-nowrap" v-for="row in tableData" :key="row.date.getMilliseconds()">
                                <span class="input-symbol-euro">
                                    <input type="number"  placeholder="000.00" v-model="row.costoLavoro" disabled  class="w-full py-2 px-6 text-sm text-right"/>
                                </span>
                            </td>
                        </tr>
                        <!-- New Section -->
                        <tr class="align-top">
                            <td colspan="2"  class="text-center text-nowrap">
                                Oneri diversi di gestione
                                <br/>
                                Altri costi operativi 
                            </td>
                            <td class="text-nowrap" v-for="row in tableData" :key="row.date.getMilliseconds()">
                                <div class="flex flex-row gap-2 items-center" v-if="massCopyMode">
                                    <span class="input-symbol-euro"> 
                                        <input type="number" :disabled="computing" placeholder="000.00"  v-model="row.altriCostiOperativi"  class="w-full py-2 px-6 text-sm text-right"/>
                                    </span>
                                    <input type="checkbox" v-model="copyChecks[row.date.toLocaleDateString()].altriCostiOperativi"  v-if="massCopyMode" class="w-4 h-4"/>
                                </div>
                                <span class="input-symbol-euro" v-else>
                                    <input type="number" :disabled="computing" placeholder="000.00"  v-model="row.altriCostiOperativi"  class="w-full py-2 px-6 text-sm text-right"/>
                                </span>
                            </td>
                        </tr>
                        <!-- New Section -->
                        <tr>
                            <td rowspan="3" class="[writing-mode:vertical-lr] text-center">
                                (interessi e altre charge finanziarie)
                                <br>
                                Oneri finanziari 
                            </td>
                        </tr>
                        <tr class="align-top">
                            <td>
                                Proventi finanziari
                            </td>
                            <td class="text-nowrap" v-for="row in tableData" :key="row.date.getMilliseconds()">
                                <div class="flex flex-row gap-2 items-center" v-if="massCopyMode">
                                    <span class="input-symbol-euro"> 
                                        <input type="number" :disabled="computing" placeholder="000.00"  v-model="row.ProventiFinanziari"  class="w-full py-2 px-6 text-sm text-right"/>
                                    </span>
                                    <input type="checkbox" v-model="copyChecks[row.date.toLocaleDateString()].ProventiFinanziari"  v-if="massCopyMode" class="w-4 h-4"/>
                                </div>
                                <span class="input-symbol-euro" v-else>
                                    <input type="number" :disabled="computing" placeholder="000.00"  v-model="row.ProventiFinanziari"  class="w-full py-2 px-6 text-sm text-right"/>
                                </span>
                            </td>
                        </tr>
                        <tr class="align-top">
                            <td>
                                oneri bancari 
                            </td>
                            <td class="text-nowrap" v-for="row in tableData" :key="row.date.getMilliseconds()">
                                <div class="flex flex-row gap-2 items-center" v-if="massCopyMode">
                                    <span class="input-symbol-euro"> 
                                        <input type="number" :disabled="computing" placeholder="000.00"  v-model="row.oneriBancari"  class="w-full py-2 px-6 text-sm text-right"/>
                                    </span>
                                    <input type="checkbox" v-model="copyChecks[row.date.toLocaleDateString()].oneriBancari"  v-if="massCopyMode" class="w-4 h-4"/>
                                </div>
                                <span class="input-symbol-euro"  v-else>
                                    <input type="number" :disabled="computing" placeholder="000.00"  v-model="row.oneriBancari"  class="w-full py-2 px-6 text-sm text-right"/>
                                </span>
                            </td>
                        </tr>
                        <tr class="align-top">
                            <td colspan="2" class="text-center">
                                Total Oneri finanziari
                            </td>
                            <td class="text-nowrap" v-for="row in tableData" :key="row.date.getMilliseconds()">
                                <span class="input-symbol-euro">
                                    <input type="number" placeholder="000.00" v-model="row.oneriFinanziari" disabled  class="w-full py-2 px-6 text-sm text-right"/>
                                </span>
                            </td>
                        </tr>
                        <!-- New Section -->
                        <tr>
                            <td rowspan="4" class="[writing-mode:vertical-lr] text-center">
                                ( depreciations and amortization) 
                                <br>
                                Svalutazioni e ammortamenti
                            </td>
                        </tr>
                        <tr class="align-top">
                            <td class="text-center">
                                Ammortamenti
                            </td>
                            <td  v-for="row in tableData" :key="row.date.getMilliseconds()">
                                <div class="flex flex-row gap-2 items-center" v-if="massCopyMode">
                                    <span class="input-symbol-euro"> 
                                        <input type="number" :disabled="computing" placeholder="000.00"  v-model="row.ammortamenti"  class="w-full py-2 px-6 text-sm text-right"/>
                                    </span>
                                    <input type="checkbox" v-model="copyChecks[row.date.toLocaleDateString()].ammortamenti"  v-if="massCopyMode" class="w-4 h-4"/>
                                </div>
                                <span class="input-symbol-euro" v-else> 
                                        <input type="number" :disabled="computing" placeholder="000.00"  v-model="row.ammortamenti"  class="w-full py-2 px-6 text-sm text-right"/>
                                </span>
                            </td>
                        </tr>
                        <tr class="align-top">
                            <td class="text-center">
                                Svalutazioni
                            </td>
                            <td  v-for="row in tableData" :key="row.date.getMilliseconds()">
                                <div class="flex flex-row gap-2 items-center" v-if="massCopyMode">
                                    <span class="input-symbol-euro"> 
                                        <input type="number" :disabled="computing" placeholder="000.00"  v-model="row.svalutazioni"  class="w-full py-2 px-6 text-sm text-right"/>
                                    </span>
                                    <input type="checkbox" v-model="copyChecks[row.date.toLocaleDateString()].svalutazioni"  v-if="massCopyMode" class="w-4 h-4"/>
                                </div>
                                <span class="input-symbol-euro" v-else> 
                                        <input type="number" :disabled="computing" placeholder="000.00"  v-model="row.svalutazioni"  class="w-full py-2 px-6 text-sm text-right"/>
                                </span>
                            </td>
                        </tr>
                        <tr class="align-top">
                            <td class="text-center">
                                altri accantonamenti
                            </td>
                            <td  v-for="row in tableData" :key="row.date.getMilliseconds()">
                                <div class="flex flex-row gap-2 items-center" v-if="massCopyMode">
                                    <span class="input-symbol-euro"> 
                                        <input type="number" :disabled="computing" placeholder="000.00"  v-model="row.altriAccantonamenti"  class="w-full py-2 px-6 text-sm text-right"/>
                                    </span>
                                    <input type="checkbox" v-model="copyChecks[row.date.toLocaleDateString()].altriAccantonamenti"  v-if="massCopyMode" class="w-4 h-4"/>
                                </div>
                                <span class="input-symbol-euro" v-else> 
                                        <input type="number" :disabled="computing" placeholder="000.00"  v-model="row.altriAccantonamenti"  class="w-full py-2 px-6 text-sm text-right"/>
                                </span>
                            </td>
                        </tr>

                        <tr class="align-top">
                            <td colspan="2" class="text-center">
                                Total Svalutazioni e ammortamenti
                            </td>
                            <td class="text-nowrap" v-for="row in tableData" :key="row.date.getMilliseconds()">
                                <span class="input-symbol-euro">
                                    <input type="number" placeholder="000.00" v-model="row.svalutazioniEAmmortamentiDepreciationsAndAmortization" disabled  class="w-full py-2 px-6 text-sm text-right"/>
                                </span>
                            </td>
                        </tr>

                    </tbody>
                </table>
            </div>
            <div class="divider"></div>
            <div class="w-full flex flex-row items-center justify-center">
                <div class="flex flex-row gap-16 justify-center">
                    <button :disabled="computing" @click="submit" class="primary-button">
                        <p>Conferma</p>
                        <icon name="material-symbols:check-circle-outline-rounded" class="size-6"></icon>
                    </button>
                </div>
            </div>

        </div>
    </div>
</template>

<script lang="ts" setup>
import l from "lodash";
import * as stringUtils from "~/src/common/string";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import Timespan from "~/src/timespan";
import DateBuilder from "~/src/date_builder";
import { IncomeStatementUserInput } from "~/src/types/income_statement_types";
import { useDittaCustomIncome } from "~/composables/store/ditta_custom_income_store";

const initialCopyTimespan = new Timespan(new Date(), new Date());
const computing = ref<boolean>(true);
const { $notifications } = useNuxtApp();
const endpoints = useEndpoints();
const { api } = useApi();
const dittaCustomIncome = useDittaCustomIncome();
const { dittaCustomIncomeDittaId } = storeToRefs(dittaCustomIncome);
const { getCustomIncomeInTimespan, getCustomIncomes, updateCustomIncomeInTimespan, loading } = dittaCustomIncome;
const massCopyMode = ref<boolean>(false);
const copyChecks = ref<any>({});
const initialValuesFetched = ref<any[]>([]);
const copyTimespan = ref<Timespan>(initialCopyTimespan);
const canApplyCopy = computed(() =>
    Object.values(copyChecks.value).some((d) => Object.values(d).some((d) => d)) && massCopyMode.value
);
const emit = defineEmits<{ (e: "dittaUpdated"): void }>();

const initialTableData = ref<any[]>([]);

let now = new Date();
const focusTimespan =  new Timespan(
    new DateBuilder()
        .withDate({ year: now.getFullYear() , month: now.getMonth() - 13, day: 31 })
        .withTime({ hours: 0, minutes: 0, seconds: 0 })
        .get(),
    new DateBuilder()
        .withDate({ year: now.getFullYear() , month: now.getMonth(), day: 1 })
        .withTime({ hours: 23, minutes: 59, seconds: 59 })
        .get()
);

const props = defineProps<{ dittaId: string; customerId: string }>();

function dateRangeChange(ts: Timespan) {
        copyTimespan.value = ts
    }
const enableDisableMassCopy = () => {
    if (massCopyMode.value) {
        massCopyMode.value = false;
        copyTimespan.value = new Timespan(new Date(), new Date());
        return;
    }
    massCopyMode.value = true;
};
const applyMassCopy = async () => {
    console.log(copyChecks.value)
    Timespan.getMonthlyIntervals(focusTimespan).forEach((date) => {
        const focusDate = date.from.toLocaleDateString();
        if (!copyChecks.value[focusDate]) {
            return;
        }
        for (const [key, value] of Object.entries(copyChecks.value[focusDate])) {
            if (value) {
                tableData.value.forEach((d) => {
                    tableData.value.filter((d) => copyTimespan.value.fits(d.date)).forEach((d) => {
                        d[key] = tableData.value.find((d) => d.date.toLocaleDateString() === focusDate)[key];
                    });
                });
            }
        }
    })
    massCopyMode.value = false;
    initiateCopyChecks();
    $notifications.add({
        message: "Valori copiati con successo",
        icon: "material-symbols:check",
        timeout: 15000 // milliseconds
    });
    return
};


const tableData = computed(() => {
    initialTableData.value.forEach((d) => {
        d.costoLavoro = d.salari_e_stipendi + d.contributi_inps + d.tfr + d.ratei_ferie_e_permessi + d.contributi_inail;
        d.oneriFinanziari = d.ProventiFinanziari + d.oneriBancari;
        d.altriCostiOperativi = d.costoLavoro + d.ammortamentiSvalutazioniAccantonamenti + d.oneriFinanziariBancari + d.ricaviValoreProduzione;
        d.svalutazioniEAmmortamentiDepreciationsAndAmortization = d.ammortamenti + d.svalutazioni + d.altriAccantonamenti;
    });
    return initialTableData.value;
});

const initiateCopyChecks = () => {
    copyTimespan.value = initialCopyTimespan;
    tableData.value.forEach((d) => {
        copyChecks.value[d.date.toLocaleDateString()] = {
            salari_e_stipendi: false,
            contributi_inps: false,
            tfr: false,
            ratei_ferie_e_permessi: false,
            contributi_inail: false,
            altriCostiOperativi: false,
            ProventiFinanziari: false,
            oneriBancari: false,
            oneriFinanziari: false,
        };
    });
};

const getSavedValues = async () => {

    const fetechedCustomData = await getCustomIncomes();
    console.log(fetechedCustomData);
    focusTimespan.getYearMonthList().forEach((date) => {
        const data = fetechedCustomData.find((d) => d.period_month === date.month  && d.period_year === date.year);
        initialTableData.value.push({
            date: new Date(date.year, date.month - 1, 1),
            salari_e_stipendi: data?.salari_e_stipendi || 0,
            contributi_inps: data?.contributi_inps || 0,
            tfr: data?.tfr || 0,
            ratei_ferie_e_permessi: data?.ratei_ferie_e_permessi || 0,
            contributi_inail: data?.contributi_inail || 0,
            altriCostiOperativi : data?.altriCostiOperativi || 0,
            proventiFinanziari: data?.proventiFinanziari || 0,
            ProventiFinanziari: data?.ProventiFinanziari || 0,
            oneriBancari: data?.oneriBancari || 0,
            oneriFinanziari: data?.oneriFinanziari || 0,

            ammortamenti: data?.ammortamenti || 0,
            svalutazioni: data?.svalutazioni || 0,
            altriAccantonamenti: data?.altriAccantonamenti || 0,


            // costoLavoro: data?.costoLavoro || 0,
            // ammortamentiSvalutazioniAccantonamenti: data?.ammortamentiSvalutazioniAccantonamenti || 0,
            // oneriFinanziariBancari: data?.oneriFinanziariBancari || 0,
            // ricaviValoreProduzione: data?.ricaviValoreProduzione || 0,
            // altriCostiOperativi: data?.altriCostiOperativi || 0,
        });
    });
    initiateCopyChecks();
    initialValuesFetched.value = l.cloneDeep(initialTableData.value); // clone the initial values to only update changed values
}

async function  fetchData (){
    await getCustomIncomeInTimespan({timespan:focusTimespan, dittaId:  props.dittaId ,cpaId: props.customerId});
};


async function submit() {
    computing.value = true;
    const data = tableData.value.map((d) => {
        return {
            period_month: d.date.getMonth() + 1,
            period_year: d.date.getFullYear(),
            salari_e_stipendi: d.salari_e_stipendi,
            contributi_inps: d.contributi_inps,
            tfr: d.tfr,
            ratei_ferie_e_permessi: d.ratei_ferie_e_permessi,
            contributi_inail: d.contributi_inail,
            altriCostiOperativi: d.altriCostiOperativi,
            ProventiFinanziari: d.ProventiFinanziari,
            oneriBancari: d.oneriBancari,
            ammortamenti: d.ammortamenti,
            svalutazioni: d.svalutazioni,
            altriAccantonamenti: d.altriAccantonamenti,
        };
    });
    await updateCustomIncomeInTimespan({
        updateValues: data,
        dittaId: props.dittaId,
        cpaId: props.customerId
    }).
        then(() => {
            computing.value = false;
            $notifications.add({
                message: "Dati salvati con successo",
                icon: "material-symbols:check",
                timeout: 30000 // milliseconds
            });
        });
    
}

onMounted(async () => {
    computing.value = true;
    await fetchData();
    computing.value = false;
});

watch(
loading,
  async (newValue, oldValue) => {
    if (!newValue) {
        console.log('loading done');
        await getSavedValues();
    }
  },
  { immediate: true }
)

watch(dittaCustomIncomeDittaId, fetchData, { immediate: true });


</script>

<style lang="css" scoped>
.conto-table {
    @apply outline-none border-none !important;

    th {
        @apply border-t-0 border-l-0 border-r-0 border-b-[2px] border-outline bg-transparent !important;
    }

    td {
        @apply outline-none border-[1px] !important;
    }
    tr:hover {
        @apply bg-background !important;
    }

    tr {
        @apply outline-none !important;
    }
}
.input-symbol-euro {
  position: relative;
}
.input-symbol-euro input {
  padding-right: 18px;
}
.input-symbol-euro:after {
  position: absolute;
  top: 0;
  right: 5px;
}
</style>
