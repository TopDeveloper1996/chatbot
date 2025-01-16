<template>
    <div class="flex flex-col w-full gap-8 justify-stretch items-center">
        <div class="w-full flex gap-2 flex-col">
            <h3 class="text-center">Andamento dettagliato dei ricavi</h3>
            <table class="active-table flex-1 h-min min-w-[12rem]">
                <thead>
                    <tr>
                        <th>Categoria</th>
                        <th>{{ firstPeriodLabel ?? comparisonStats.first.timespan.toLabel() }}</th>
                        <th>{{ secondPeriodLabel ?? comparisonStats.second.timespan.toLabel() }}</th>
                        <th>Delta</th>
                    </tr>
                </thead>
                <tbody>
                    <tr
                        v-for="e in comparisonStats.categories.filter((c) => c.firstRevenue > 0 || c.secondRevenue > 0)"
                    >
                        <td>{{ e.category }}</td>
                        <td>{{ e.firstRevenue.toLocaleString() }} €</td>
                        <td>{{ e.secondRevenue.toLocaleString() }} €</td>
                        <td>{{ (e.revenueDelta * 100).toLocaleString() }} %</td>
                    </tr>
                    <tr class="bg-surface">
                        <td class="font-bold">Totale</td>
                        <td class="font-bold">{{ comparisonStats.first.revenue.toLocaleString() }} €</td>
                        <td class="font-bold">{{ comparisonStats.second.revenue.toLocaleString() }} €</td>
                        <td
                            :class="[
                                'font-bold',
                                comparisonStats.second.revenue / comparisonStats.first.revenue - 1 > 0
                                    ? 'text-green-500'
                                    : 'text-red-700',
                            ]"
                        >
                            {{
                                (
                                    (comparisonStats.second.revenue / comparisonStats.first.revenue - 1) *
                                    100
                                ).toLocaleString()
                            }}
                            %
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
        <div class="w-full flex gap-2 flex-col">
            <h3 class="text-center">Andamento dettagliato dei costi</h3>
            <table class="active-table flex-1 h-min min-w-[12rem]">
                <thead>
                    <tr>
                        <th>Categoria</th>
                        <th>{{ firstPeriodLabel ?? comparisonStats.first.timespan.toLabel() }}</th>
                        <th>{{ secondPeriodLabel ?? comparisonStats.second.timespan.toLabel() }}</th>
                        <th>Delta</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="e in comparisonStats.categories.filter((c) => c.firstCosts > 0 || c.secondCosts > 0)">
                        <td>{{ e.category }}</td>
                        <td>{{ e.firstCosts.toLocaleString() }} €</td>
                        <td>{{ e.secondCosts.toLocaleString() }} €</td>
                        <td>{{ (e.costsDelta * 100).toLocaleString() }} %</td>
                    </tr>
                    <tr class="bg-surface">
                        <td class="font-bold">Totale</td>
                        <td class="font-bold">{{ comparisonStats.first.costs.toLocaleString() }} €</td>
                        <td class="font-bold">{{ comparisonStats.second.costs.toLocaleString() }} €</td>
                        <td
                            :class="[
                                'font-bold',
                                comparisonStats.second.costs / comparisonStats.first.costs - 1 < 0
                                    ? 'text-green-500'
                                    : 'text-red-700',
                            ]"
                        >
                            {{
                                (
                                    (comparisonStats.second.costs / comparisonStats.first.costs - 1) *
                                    100
                                ).toLocaleString()
                            }}
                            %
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script lang="ts" setup>
import l from "lodash";
const props = defineProps<{
    comparisonStats: InvoiceRevenueCostCategoriesComparison;
    firstPeriodLabel?: string;
    secondPeriodLabel?: string;
}>();
</script>

<style></style>
