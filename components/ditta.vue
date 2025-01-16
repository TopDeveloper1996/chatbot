<template>
    <div v-if="dittaModel">
        <h2 class="mb-2">
            {{ stringUtils.wordCapitalize(dittaModel["registered_name"]) }}
        </h2>
        <p
            class="text-accent font-bold"
            v-if="dittaModel['ateco_code']?.length > 0 && dittaModel['ateco_description']?.length > 0"
        >
            {{ dittaModel["ateco_code"] }} - {{ dittaModel["ateco_description"] }}
        </p>
        <p class="text-sm font-light text-accent" v-if="dittaModel['rea_code']?.length > 0">
            {{ dittaModel["rea_code"] }}
        </p>
        <div class="flex flex-col items-start font-semibold">
            <!-- <div class="flex flex-row gap-2">
                <p v-if="dittaModel['address']?.length > 0">{{ dittaModel["address"] }}</p>
                <p v-if="dittaModel['comune']?.length > 0">{{ dittaModel["comune"] }}</p>
            </div> -->
            <div class="flex flex-row gap-2">
                <p v-if="dittaModel['postal_code']?.length > 0">{{ dittaModel["postal_code"] }}</p>
                <p v-if="dittaModel['province']?.length > 0">{{ dittaModel["province"] }}</p>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import * as stringUtils from "~/src/common/string";
const props = defineProps<{ dittaModel: any }>();
</script>

<style></style>
