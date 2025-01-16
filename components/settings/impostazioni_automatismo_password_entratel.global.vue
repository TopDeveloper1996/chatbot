<template>
    <div class="flex flex-col flex-grow w-full">
        <div class="wrapper">
            <div class="section">
                <h2 class="flex flex-row items-center gap-2">
                    <icon class="text-accent" name="material-symbols:notifications-rounded"></icon>
                    <p>Impostazione cambio automatico password entratel</p>
                </h2>
                <div class="flex flex-row justify-start gap-4 items-center">
                    <p class="">Impostazione cambio automatico password entratel:</p>
                    <div>
                        <Checkbox v-model="editedSettings.auto_password" @change="updateCheckbox"></Checkbox>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { nextTick, ref, watchEffect } from "vue";

const endpoints = useEndpoints();
const fetching = ref(false);
const updateSuccess = ref<boolean | undefined>(undefined);

const cpa = useCpa();
let editedSettings = ref(cpa.getSettings());

const { api } = useApi();

const updateCheckbox = async () => {
    try {
        fetching.value = true;
        // const response = await api.updateSettings({ auto_password: editedSettings.value.auto_password });
        api(endpoints.userNotificationContact, {
            method: "POST",
            body: {
                operation: "update_auto_password",
                scraper_api_token: cpa.scraperApiAccess,
                auto_password: [
                    {
                        is_auto_password_change_enabled_for_tax_agency: editedSettings.value.auto_password,
                        customer_id: Number.parseInt(cpa.getData.id),
                        _settings_id: editedSettings.value.contact_analytics_settings_id,
                    },
                ],
            },
            onResponse: async ({ request, response, options }) => {
                if (response.ok) {
                    updateSuccess.value = true;
                    cpa.setSettings(editedSettings.value); // Update the settings
                    console.log(`Auto Password Update Submitted`);
                } else {
                    updateSuccess.value = false;
                    console.error(
                        `Problem Occured While Updating Auto Password Data: ${JSON.stringify(response._data)}`
                    );
                }
                fetching.value = false;
            },
            onResponseError({ request, response, options }) {
                fetching.value = false;
                updateSuccess.value = false;
                console.log(`Problem Occured While Updating Auto Password Data: ${JSON.stringify(response._data)}`);
            },
        });
        // updateSuccess.value = response.status === 200;
    } catch (error) {
        console.error("Error updating checkbox:", error);
        updateSuccess.value = false;
    } finally {
        fetching.value = false;
    }
};
</script>

<style lang="css" scoped>
.select {
    @apply my-0 mx-0 px-4 py-3 w-full bg-background border-outline focus:border-accent focus:outline-none border-[2px] rounded-xl;
}
.wrapper {
    @apply flex flex-col items-stretch gap-8 w-full;
}
.header {
    background-color: rgb(26, 161, 224, 0.5) !important;
    color: whitesmoke !important;
}
.section {
    @apply flex flex-col gap-4;
}

.sub-section {
    @apply flex flex-col gap-2;
}
</style>
