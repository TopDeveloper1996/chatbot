<template>
    <div class="flex flex-col items-stretch w-full gap-16 my-8 flex-wrap">
        <div class="flex-1 flex flex-col items-start gap-2">
            <h3 class="m-0">
                {{ toPayInvoices.length > 0 ? "Fatture passive da pagare" : "Non ci sono fatture passive da pagare" }}
            </h3>
            <InvoicesTable
                v-if="toPayInvoices.length > 0"
                :header-color="'rgba(var(--passive-invoices-color))'"
                :invoices="toPayInvoices"
                :show-tip="false"
                :show-filters="false"
                :bottom-download="false"
                :invoice_type="'passive'"
            ></InvoicesTable>
        </div>
        <div class="flex-1 flex flex-col items-start gap-2">
            <h3 class="m-0">
                {{
                    toReceiveInvoices.length > 0
                        ? "Fatture attive da ricevere"
                        : "Non ci sono fatture attive da ricevere"
                }}
            </h3>
            <InvoicesTable
                v-if="toReceiveInvoices.length > 0"
                :invoices="toReceiveInvoices"
                :header-color="'rgba(var(--active-invoices-color))'"
                :show-tip="false"
                :show-filters="false"
                :bottom-download="false"
                :invoice_type="'active'"
            ></InvoicesTable>
        </div>
    </div>
</template>

<script lang="ts" setup>
const props = defineProps<{ stats: InvoicesStatistics }>();

const toPayInvoices = computed(() => {
    const now = new Date();
    return props.stats.passives.elements.filter((i) => i.payment_date.getTime() >= now.getTime());
});

const toReceiveInvoices = computed(() => {
    const now = new Date();
    return props.stats.actives.elements.filter((i) => i.payment_date.getTime() >= now.getTime());
});
</script>

<style lang="css" scoped></style>
