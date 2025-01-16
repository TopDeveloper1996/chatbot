<template>
    <div>
        <div class="min-h-full	 w-full md:w-auto flex-grow flex flex-col items-center">
            <!-- Title -->
            <h1 class="view-title text-start w-full">Impostazioni generali</h1>
            <div class="divider"></div>
            <div class="flex-grow p-8">
                <div class="mt-6 flex space-x-4">
                    <button 
                        v-for="component in Object.entries(componentsMappings)"
                        @click="setComponent(component[0])"
                        :class="currentComponent === component[0] ? ['bg-outline/50 text-accent'] : []"
                        class="section-button bg-[#0B1D49] text-white py-2 px-4 rounded flex items-center space-x-2" >
                        <icon
                                            class="text-accent size-8 shrink-0"
                                            :name="(component[1] as any).icon"
                                        ></icon>
                        <span>{{ (component[1] as any).label }}</span>
                    </button>
                </div>
                <div class="divider"></div>
                <main class="flex-1 p-8 bg-primary-light rounded-lg">
                    <!-- Interactive Separator -->
                    <!-- <div class="w-full border-b-2 border-secondary-dark mb-4"></div> -->
                    <component :is="currentComponent"></component>
                </main>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
const componentsMappings: any = {
    LazySettingsProfiliEntratel: {
        title: "Impostazioni Generali - Profili Entratel",
        label: "Profili Entratel",
        icon: "material-symbols:lock",
    },
    LazySettingsContattiUtentiPerLeNotifiche: {
        title: "Impostazioni Generali - Contatti Utenti Per le Notifiche",
        label: "Contatti Utenti Per le Notifiche",
        icon: "material-symbols:notifications-rounded",
    },
    LazySettingsImpostazioniPerIntermediario: {
        title: "Impostazioni Generali - Impostazioni Per Intermediario Società",
        label: "Impostazioni Per Intermediario Società",
        icon: "material-symbols:supervisor-account",
    },
    LazySettingsProfiliDeiClienti: {
         title: "Impostazioni Generali - Profili Dei Clienti",
         label: "Profili Dei Clienti",
         icon: "material-symbols:account-circle",
    },
    LazySettingsImpostazioniAutomatismoPasswordEntratel: {
        title: "Impostazioni Generali - Impostazioni Automatismo Password Entratel",
        label: "Impostazioni Automatismo Password Entratel",
        icon: "material-symbols:shield",
    },
    LazySettingsAccountingSoftwareAccesses: {
        title: "Impostazioni Generali - Accessi Software di Contabilità",
        label: "Accessi Software di Contabilità",
        icon: "material-symbols:lock-open",
    },
    LazySettingsTeamsystemWebsites: {
        title: "Impostazioni Generali - Sito Web e Pagina Login Software Contabilità",
        label: "Sito Web e Pagina Login Software Contabilità",
        icon: "material-symbols:globe",
    },
    LazySettingsContattiPerAnalitica: {
        title: "Impostazioni Generali - Contatti Per Analitica",
        label: "Contatti Per Analitica",
        icon: "majesticons:chart-bar",
    }
};

const currentComponent = ref<string>("LazySettingsProfiliEntratel");

const headerTitle = ref<string>("Contatti Utenti Per le Notifiche");
const isAnyCloudConnected = ref<boolean>(false);

function setComponent(component: string) {
    currentComponent.value = component;
    localStorage.setItem("selectedComponent", component);
}

onMounted(() => {
    const selectedComponent = localStorage.getItem("selectedComponent");
    if (selectedComponent) {
        currentComponent.value = selectedComponent;
        headerTitle.value = componentsMappings[selectedComponent]?.title ?? "";
    }
});
</script>

<style scoped>
.section-button {
    @apply w-full text-left py-4 px-4 rounded-lg flex items-center transition-all duration-100;

    h3 {
        @apply m-0 flex flex-row items-center gap-2;
    }
}

button.bg-white {
    background-color: white; /* Inactive button background color */
    color: black;
}

button.text-black {
    color: black;
}

button.text-white {
    color: white;
}

button:hover {
    @apply hover:bg-outline/50;
}
aside {
    height: auto !important;
    background: none;
}
nav {
    /* background:gray */
    background-color: transparent !important;
    /* @apply rounded-lg border-[2px] p-4 border-outline; */
}
</style>
