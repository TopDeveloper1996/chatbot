<template>
    <div id="ditta_general_summary" v-if="summaries.length > 0" class="w-full flex-col flex items-center gap-4">
        <h2 class="text-center">Riepilogo quest'anno alla data di oggi, YTD</h2>
        <div class="flex flex-row flex-wrap w-full items-center justify-center gap-4">
            <div class="card">
                <p class="title">Fatturato YTD</p>
                <span class="content">{{
                    stringUtils.toShortCurrencyString(summaries[0].secondPeriod.revenue.total)
                }}</span>
                <icon name="hugeicons:money-receive-square"></icon>
            </div>
            <div class="card">
                <p class="title">Costi al netto delle tasse</p>
                <span class="content">{{
                    stringUtils.toShortCurrencyString(summaries[0].secondPeriod.costs.total)
                }}</span>
                <icon name="hugeicons:money-send-square"></icon>
            </div>
            <div v-if="summaries[0].secondPeriod.isUserProvideData" class="card">
                <p class="title">EBITDA</p>
                <span class="content">{{
                    stringUtils.toShortCurrencyString(summaries[0].secondPeriod.ebitda)
                }}</span>
                
            </div>
            <div v-if="summaries[0].secondPeriod.isUserProvideData" class="card">
                <p class="title">Utile Netto</p>
                <span class="content">{{
                    stringUtils.toShortCurrencyString(summaries[0].secondPeriod.profit)
                }}</span>
               
            </div>
            <div class="card">
                <Tooltip class="absolute right-2 top-2"
                    >Calcolata come il rapporto tra il fatturato dall'inizio dell'anno a questa data e il fatturato
                    dell'anno precedente. ((Ricavi YTD - Ricavi LYTD) / Ricavi YTD) *100 </Tooltip
                >
                <p class="title">Crescita fatturato</p>
                <span class="content">{{ formatPercentage(summaries[0].growth) }} </span>
                <icon
                    name="uil:arrow-growth"
                    :class="summaries[0].growth > 0 ? ['text-green-600'] : ['text-red-700']"
                ></icon>
            </div>
            <!-- <div class="card">
                <Tooltip class="absolute right-2 top-2"
                    >Calcolata come la percentuale del margine netto in proporzione al fatturato totale. ((Ricavi - Costi da Fatture) / Ricavi) *100</Tooltip
                >
                <p class="title">Percentuale Primo Margine</p>
                <span class="content">{{ formatPercentage(summaries[0].secondPeriod.profitRatio, 2)}}</span>
                <icon
                    name="bxs:wallet"
                    :class="summaries[0].secondPeriod.profitRatio > 0 ? ['text-green-600'] : ['text-red-700']"
                ></icon>
            </div> -->
            
            <div class="card">
                <Tooltip class="absolute right-2 top-2"
                    >versamenti reddito + Irap +Tasse locali +Tasse regionali .</Tooltip
                >
                <p class="title">Tasse</p>
                <span class="content">{{
                    stringUtils.toShortCurrencyString(summaries[0].secondPeriod.costs.taxes)
                }}</span>
                <icon name="hugeicons:taxes"></icon>
            </div>
        </div>
        <div class="flex flex-row w-full flex-wrap items-center justify-center gap-4">
            <div class="card">
                <p class="title">Fatturato Da fatture</p>
                <span class="content">{{
                    stringUtils.toShortCurrencyString(summaries[0].secondPeriod.revenue.invoices)
                }}</span>
                <icon name="basil:invoice-solid"></icon>
            </div>
            <div class="card">
                <p class="title">Fatturato Da corrispettivi</p>
                <span class="content">{{
                    stringUtils.toShortCurrencyString(summaries[0].secondPeriod.revenue.fees)
                }}</span>
                <icon name="tabler:coin-euro-filled"></icon>
            </div>
            <div class="card">
                <Tooltip class="absolute right-2 top-2"
                    >Numero totale di clienti a cui è stata rivolta una fattura attiva in questo anno.</Tooltip
                >
                <p class="title">Clienti attivi</p>
                <span class="content">{{ summaries[0].secondPeriod.activeClientIds.length }}</span>
                <icon name="material-symbols:person-rounded"></icon>
            </div>
            <div class="card">
                <Tooltip class="absolute right-2 top-2"
                    >Numero di nuovi clienti acquisiti quest'anno che non erano attivi nell'anno precedente.</Tooltip
                >
                <p class="title">Nuovi clienti</p>
                <span class="content">{{ summaries[0].newClients.length }}</span>
                <icon
                    name="material-symbols:person-add-rounded"
                    :class="summaries[0].newClients.length > 0 ? ['text-green-600'] : []"
                ></icon>
            </div>
            <div class="card">
                <Tooltip class="absolute right-2 top-2"
                    >Numero di clienti che erano attivi l'anno precedente e che non sono più attivi quest'anno.</Tooltip
                >
                <p class="title">Clienti inattivi</p>
                <span class="content">{{ summaries[0].inactiveClients.length }}</span>
                <icon
                    name="material-symbols:person-cancel-rounded"
                    :class="summaries[0].inactiveClients.length <= 0 ? ['text-green-600'] : ['text-red-700']"
                ></icon>
            </div>
        </div>
        <div class="flex flex-row w-full flex-wrap items-center justify-center gap-4">
            <div class="card">
                <p class="title">BEP</p>
                <span class="text-accent">In elaborazione</span>
                <icon name="tabler:cloud-computing"></icon>
            </div>
            <div class="card">
                <p class="title">IVA</p>
                <span class="text-accent">Da Fatture Passive</span>
                <span class="content">{{
                    stringUtils.toShortCurrencyString(summaries[0].secondPeriod.costs.invoices_iva)
                }}</span>
                <icon name="hugeicons:taxes"></icon>
            </div>
            <div class="card">
                <p class="title">IVA</p>
                <span class="text-accent">Da Fatture Attive</span>
                <span class="content">{{
                    stringUtils.toShortCurrencyString(summaries[0].secondPeriod.revenue.invoices_iva)
                }}</span>
                <icon name="hugeicons:taxes"></icon>
            </div>
            <div class="card">
                <p class="title">IVA</p>
                <span class="text-accent">Da Corrispettivi Incassati</span>
                <span class="content">{{
                    stringUtils.toShortCurrencyString(summaries[0].secondPeriod.revenue.fees_iva)
                }}</span>
                <icon name="hugeicons:taxes"></icon>
            </div>
        </div>
        <table class="min-w-full bg-[#222A41] text-left h-min min-w-[12rem]">
            <thead class="bg-gray-700">
                <tr>
                    <th class="py-4 px-6 bg-[#1D2231] text-sm font-medium text-white"></th>
                    <th class="py-4 px-6 bg-[#1D2231] text-sm font-medium text-white">YTD</th>
                    <th class="py-4 px-6 bg-[#1D2231] text-sm font-medium text-white">LYTD</th>
                    <th class="py-4 px-6 bg-[#1D2231] text-sm font-medium text-white">Variazione %</th>
                    <th class="py-4 px-6 bg-[#1D2231] text-sm font-medium text-white">L12</th>
                    <th class="py-4 px-6 bg-[#1D2231] text-sm font-medium text-white">L12-1</th>
                    <th class="py-4 px-6 bg-[#1D2231] text-sm font-medium text-white">Variazione %</th>
                </tr>
            </thead>
            <tbody>
                <tr class="border-t border-[#2A334E]">
                    <td class="py-4 px-6 text-md font-semibold">Ricavi</td>
                    <td class="py-4 px-6 text-sm font-semibold text-right">{{ summaries[0].secondPeriod.revenue.total.toLocaleString() }} €</td>
                    <td class="py-4 px-6 text-sm font-semibold text-right">{{ summaries[0].firstPeriod.revenue.total.toLocaleString() }} €</td>
                    <td class="py-4 px-6 text-sm font-semibold text-right">{{ formatPercentage(summaries[0].variations.revenue.total) }}</td>
                    <td class="py-4 px-6 text-sm font-semibold text-right">{{ summaries[1].secondPeriod.revenue.total.toLocaleString() }} €</td>
                    <td class="py-4 px-6 text-sm font-semibold text-right">{{ summaries[1].firstPeriod.revenue.total.toLocaleString() }} €</td>
                    <td class="py-4 px-6 text-sm font-semibold text-right">{{ formatPercentage(summaries[1].variations.revenue.total) }}</td>
                </tr>
                <tr class="border-t border-[#2A334E]">
                    <td class="py-4 px-6 text-md font-semibold">Costi</td>
                    <td class="py-4 px-6 text-sm font-semibold text-right">{{ summaries[0].secondPeriod.costs.total.toLocaleString() }} €</td>
                    <td class="py-4 px-6 text-sm font-semibold text-right">{{ summaries[0].firstPeriod.costs.total.toLocaleString() }} €</td>
                    <td class="py-4 px-6 text-sm font-semibold text-right">{{ formatPercentage(summaries[0].variations.costs.total) }}</td>
                    <td class="py-4 px-6 text-sm font-semibold text-right">{{ summaries[1].secondPeriod.costs.total.toLocaleString() }} €</td>
                    <td class="py-4 px-6 text-sm font-semibold text-right">{{ summaries[1].firstPeriod.costs.total.toLocaleString() }} €</td>
                    <td class="py-4 px-6 text-sm font-semibold text-right">{{ formatPercentage(summaries[1].variations.costs.total)}} </td>
                </tr>
                <tr v-if="summaries[0].secondPeriod.isUserProvideData" class="border-t border-[#2A334E]">
                    <td class="py-4 px-6 text-md font-semibold">EBITDA</td>
                    <td class="py-4 px-6 text-sm font-semibold text-right">{{summaries[0].secondPeriod.ebitda.toLocaleString() }} €</td>
                    <td class="py-4 px-6 text-sm font-semibold text-right">{{ summaries[0].firstPeriod.ebitda.toLocaleString() }} €</td>
                    <td class="py-4 px-6 text-sm font-semibold text-right">{{ formatPercentage(summaries[0].variations.ebitda) }}</td>
                    <td class="py-4 px-6 text-sm font-semibold text-right">{{ summaries[1].secondPeriod.ebitda.toLocaleString() }} €</td>
                    <td class="py-4 px-6 text-sm font-semibold text-right">{{ summaries[1].firstPeriod.ebitda.toLocaleString() }} €</td>
                    <td class="py-4 px-6 text-sm font-semibold text-right">{{ formatPercentage(summaries[1].variations.ebitda)}} </td>
                </tr>

                <tr v-if="summaries[0].secondPeriod.isUserProvideData" class="border-t border-[#2A334E]">
                    <td class="py-4 px-6 text-md font-semibold">Utile Netto</td>
                    <td class="py-4 px-6 text-sm font-semibold text-right">
                        {{ summaries[0].secondPeriod.profit.toLocaleString() }} €
                    </td>
                    <td class="py-4 px-6 text-sm font-semibold text-right">
                        {{ summaries[0].firstPeriod.profit.toLocaleString() }} €
                    </td>
                    <td class="py-4 px-6 text-sm font-semibold text-right">
                        {{ formatPercentage(summaries[0].variations.profit)}}
                    </td>
                    <td class="py-4 px-6 text-sm font-semibold text-right">
                        {{ summaries[1].secondPeriod.profit.toLocaleString() }} €
                    </td>
                    <td class="py-4 px-6 text-sm font-semibold text-right">
                        {{ summaries[1].firstPeriod.profit.toLocaleString() }} €
                    </td>
                    <td class="py-4 px-6 text-sm font-semibold text-right">
                        {{ formatPercentage(summaries[1].variations.profit) }}
                    </td>
                </tr>
                <tr v-if="summaries[0].secondPeriod.isUserProvideData===false" class="border-t border-[#2A334E]">
                    <td class="py-4 px-6 text-md font-semibold">Marginalità</td>
                    <td class="py-4 px-6 text-sm font-semibold text-right">
                        {{ summaries[0].secondPeriod.profit.toLocaleString() }} €
                    </td>
                    <td class="py-4 px-6 text-sm font-semibold text-right">
                        {{ summaries[0].firstPeriod.profit.toLocaleString() }} €
                    </td>
                    <td class="py-4 px-6 text-sm font-semibold text-right">
                        {{ formatPercentage(summaries[0].variations.profit)}}
                    </td>
                    <td class="py-4 px-6 text-sm font-semibold text-right">
                        {{ summaries[1].secondPeriod.profit.toLocaleString() }} €
                    </td>
                    <td class="py-4 px-6 text-sm font-semibold text-right">
                        {{ summaries[1].firstPeriod.profit.toLocaleString() }} €
                    </td>
                    <td class="py-4 px-6 text-sm font-semibold text-right">
                        {{ formatPercentage(summaries[1].variations.profit) }}
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script lang="ts" setup>
import * as stringUtils from "~/src/common/string";
import Timespan from "~/src/timespan";
import {formatPercentage}  from "~/src/common/math";

const summary = useDittaSummary();
const summaries = ref<DittaSummaryAnalytics[]>([]);
const props = defineProps<{ dittaId: string }>();

onMounted(async () => {
    summaries.value = await Promise.all([
        summary.computeSummary({
            dittaId: props.dittaId,
            firstPeriod: Timespan.yearToDateLastYear(),
            secondPeriod: Timespan.yearToDate(),
        }),
        summary.computeSummary({
            dittaId: props.dittaId,
            firstPeriod: Timespan.previous12Months(),
            secondPeriod: Timespan.last12Months(),
        }),
    ]);
    const result = performCalculation(summaries.value);
    emit('summary-org-completed', result);
});

const emit = defineEmits<{(e: 'summary-org-completed', result: any): void}>();
const performCalculation = (value: DittaSummaryAnalytics[]): any => {
  return {
    "valuta": "Eu",
    "Fatturato YTD": value[0].secondPeriod.revenue.total ,
    "Costi al netto delle tasse": value[0].secondPeriod.costs.total ,
    "Crescita fatturato": value[0].growth + "%",
    "Tasse": value[0].secondPeriod.costs.taxes ,
    "Fatturato Da fatture": value[0].secondPeriod.revenue.invoices ,
    "Fatturato Da corrispettivi": value[0].secondPeriod.revenue.fees ,
    "Clienti attivi": value[0].secondPeriod.activeClientIds.length,
    "Nuovi clienti": value[0].newClients.length,
    "Clienti inattivi": value[0].inactiveClients.length,
    "IVA DaFatture Passive": value[0].secondPeriod.costs.invoices_iva ,
    "IVA Da Fatture Attive": value[0].secondPeriod.revenue.invoices_iva ,
    "IVA Da Corrispettivi incassati": value[0].secondPeriod.revenue.fees_iva ,
    "Ricavi": {
        "Da inizio anno": value[0].secondPeriod.revenue.total.toLocaleString() ,
        "Ultimo anno ad oggi": value[0].firstPeriod.revenue.total.toLocaleString() ,
        "Variazione %": formatPercentage(value[0].variations.revenue.total) + "%",
        "Ultimi 12 mesi": value[1].secondPeriod.revenue.total.toLocaleString() ,
        "Precedenti 12 mesi in partenza da 12 mesi fa": value[1].firstPeriod.revenue.total.toLocaleString() ,
        "Variazione(1) %": formatPercentage(value[1].variations.revenue.total) + "%"
    },
    "Costi": {
        "Da inizio anno": value[0].secondPeriod.costs.total.toLocaleString() ,
        "Ultimo anno ad oggi": value[0].firstPeriod.costs.total.toLocaleString() ,
        "Variazione %": formatPercentage(value[0].variations.ebitda) + "%",
        "Ultimi 12 mesi": value[1].secondPeriod.costs.total.toLocaleString() ,
        "Precedenti 12 mesi in partenza da 12 mesi fa": value[1].firstPeriod.ebitda.toLocaleString() ,
        "Variazione(1) %": formatPercentage(value[1].variations.costs.total) + "%"
    },
    "Ebitda": value[0].secondPeriod.isUserProvideData ? {
        "Da inizio anno": value[0].secondPeriod.costs.total.toLocaleString() ,
        "Ultimo anno ad oggi": value[0].firstPeriod.costs.total.toLocaleString() ,
        "Variazione %": formatPercentage(value[0].variations.ebitda) + "%",
        "Ultimi 12 mesi": value[1].secondPeriod.costs.total.toLocaleString() ,
        "Precedenti 12 mesi in partenza da 12 mesi fa": value[1].firstPeriod.ebitda.toLocaleString() ,
        "Variazione(1) %": formatPercentage(value[1].variations.costs.total) + "%"
    }: null,
    "Utile Netto": value[0].secondPeriod.isUserProvideData ? {
        "Da inizio anno": value[0].secondPeriod.profit.toLocaleString() ,
        "Ultimo anno ad oggi": value[0].firstPeriod.profit.toLocaleString() ,
        "Variazione %": formatPercentage(value[0].variations.profit) + "%",
        "Ultimi 12 mesi": value[1].secondPeriod.profit.toLocaleString() ,
        "Precedenti 12 mesi in partenza da 12 mesi fa": value[1].firstPeriod.profit.toLocaleString() ,
        "Variazione(1) %": formatPercentage(value[1].variations.profit) + "%"
    }: null,
    "Marginalita": !value[0].secondPeriod.isUserProvideData ? {
        "Da inizio anno": value[0].secondPeriod.profit.toLocaleString() ,
        "Ultimo anno ad oggi": value[0].firstPeriod.profit.toLocaleString() ,
        "Variazione %": formatPercentage(value[0].variations.profit) + "%",
        "Ultimi 12 mesi": value[1].secondPeriod.profit.toLocaleString() ,
        "Precedenti 12 mesi in partenza da 12 mesi fa": value[1].firstPeriod.profit.toLocaleString() ,
        "Variazione(1) %": formatPercentage(value[1].variations.profit) + "%"
    }: null
  };
};

// const { stats, fetching, fetched, revenueCostStats, dateFilter } = storeToRefs(invoices);

function valueColor(val: any) {
    if (val > 0) {
        return ["text-green-600", "font-bold","text-right"];
    } else {
        return ["text-red-600", "font-bold","text-right"];
    }
}
</script>

<style lang="css" scoped>
.card {
    @apply flex-grow relative bg-surface rounded-xl flex flex-col items-center px-8 pt-10 pb-2 self-stretch border-[1.5px] border-outline;
    .content {
        @apply text-3xl font-bold mt-4;
    }
    .title {
        @apply text-sm font-light;
    }
    .iconify {
        @apply size-10 my-2;
    }
}
</style>
