<template>
    <div class="flex flex-col flex-grow w-full">
        <Tip>Qui puoi visualizzare le Impostazioni per la società intermediaria</Tip>
        <div class="wrapper">
            <div class="section">
                <h2 class="flex flex-row items-center gap-2">
                    <icon class="text-accent text-4xl" name="material-symbols:supervisor-account"></icon>
                    <p>Impostazioni Per Intermediario Società</p>
                </h2>

                <div class="mr-24 rounded shadow-md">
                    <table class="conto-table select-none">
                        <thead>
                            <tr>
                                <th>Codice Entratel</th>
                                <th>Tipo profilo</th>
                                <th>Codice Fiscale</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr
                                v-for="(items, index) in appointingsubjectSettings.appointingsubject"
                                :key="index"
                                class="cursor-pointer pointer-events-auto"
                            >
                                <td class="px-5 py-5 border-b text-sm">
                                    <div>
                                        {{ items.codice_entratel }}
                                    </div>
                                </td>
                                <td class="px-5 py-5 border-b text-sm">
                                    <div>
                                        {{ items.enabled_profile_type }}
                                    </div>
                                </td>
                                <td class="px-5 py-5 border-b text-sm">
                                    <div>
                                        {{ items.fiscal_code }}
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import l from "lodash";
import { ref } from "vue";

const endpoints = useEndpoints();
const mounted = useMounted();
const cpa = useCpa();
const appointingsubjectSettings = ref(cpa.getSettings());
const { api } = useApi();
</script>

<style lang="css" scoped>
.select {
    @apply my-0 mx-0 px-4 py-3 w-full bg-background border-outline focus:border-accent focus:outline-none border-[2px] rounded-xl;
}
.wrapper {
    @apply flex flex-col items-stretch gap-8 w-full;
}

.section {
    @apply flex flex-col gap-4;
}

.sub-section {
    @apply flex flex-col gap-2;
}
</style>
