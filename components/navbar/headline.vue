<template>
    <div ref="el">
        <div
            v-if="breakpoints.greaterOrEqual('md').value"
            class="vertical-menu"
            :style="{ '--duration': transitionDurationMs + 'ms' }"
            :class="{ 'w-[20rem]': status.expanded, 'w-[var(--v-navbar-width)]': !status.expanded }"
        >
            <div class="p-4 w-full flex flex-col items-center min-h-[100px]">
                <img v-if="notifiedExpanded" src="/mentally.png" class="h-[80px] object-contain" />
                <div v-else class="h-[80px]"></div>
            </div>
            <div class="overflow-scroll grow">
                <ul>
                    <NavbarSection
                        :navbar-collapsed="!notifiedExpanded"
                        @click="collapse"
                        v-for="e in navbarElements"
                        :title="e.title"
                        :icon="e.icon"
                        :path="e.path"
                    ></NavbarSection>
                </ul>
            </div>
            <button
                @click="logout"
                class="flex flex-row items-center justify-center gap-2 font-bold rounded-xl p-2 hover:bg-outline bg-background"
            >
                <icon class="size-6" name="solar:logout-3-bold"></icon>
                <p v-if="notifiedExpanded">Esci</p>
            </button>
            <div class="text-center my-2 text-text" v-if="notifiedExpanded">
                <p class="text-md font-semibold">{{ cpa.getDisplayData.name }}</p>
                <p class="text-sm">CPA: {{ cpa.getDisplayData.id }}</p>
                <p class="mt-2 text-center text-sm text-text/75">AdeMentally {{ runtimeConfig.version }}</p>
            </div>

            <div class="w-full pr-3 flex justify-center items-end flex-col gap-8">
                <button @click="onExpandClicked">
                    <Icon
                        class="size-8 hover:scale-105 transition-all duration-150"
                        :class="{ 'rotate-180': notifiedExpanded }"
                        name="material-symbols:expand-circle-right-rounded"
                    ></Icon>
                </button>
            </div>
        </div>
        <div v-else class="horizontal-menu">
            <div class="flex flex-row gap-2 items-center">
                <button @click="onExpandClicked">
                    <icon
                        name="material-symbols:menu-rounded"
                        class="size-12 hover:bg-outline/50 p-2 rounded-xl"
                    ></icon>
                </button>
            </div>
            <div class="text-end text-text">
                <p class="text-sm font-semibold">{{ cpa.getDisplayData.name }}</p>
                <p class="text-xs">CPA: {{ cpa.getDisplayData.id }}</p>
            </div>
            <Transition name="slide" appear mode="out-in">
                <div
                    v-if="notifiedExpanded"
                    class="absolute top-0 left-0 border-[1.5px] border-outline border-l-[0] max-w-[20rem] w-[70%] h-screen flex flex-col bg-surface rounded-xl"
                    :style="{ '--x-tr': windowSize.width.value * -0.7 + 'px' }"
                >
                    <div class="p-8 w-full flex-col flex items-center min-h-[150px]">
                        <img src="/mentally.png" class="h-[128px] object-contain" />
                    </div>
                    <div>
                        <ul>
                            <NavbarSection
                                :navbar-collapsed="!notifiedExpanded"
                                @click="collapse"
                                v-for="e in navbarElements"
                                :title="e.title"
                                :icon="e.icon"
                                :path="e.path"
                            ></NavbarSection>
                        </ul>
                    </div>
                    <div class="divider"></div>
                    <button
                        @click="logout"
                        class="flex flex-row mx-4 items-center justify-center gap-2 font-bold rounded-xl p-2 hover:bg-outline bg-background"
                    >
                        <icon class="size-6" name="solar:logout-3-bold"></icon>
                        <p v-if="notifiedExpanded">Esci</p>
                    </button>
                    <div class="w-full h-full pr-3 pb-24 flex justify-end items-end">
                        <button @click="onExpandClicked">
                            <Icon
                                class="size-8 hover:scale-105 transition-all duration-150"
                                :class="{ 'rotate-180': notifiedExpanded }"
                                name="material-symbols:expand-circle-right-rounded"
                            ></Icon>
                        </button>
                    </div>
                </div>
            </Transition>
        </div>
    </div>
    <GlobalNotifications />
</template>

<script lang="ts" setup>
import { breakpointsTailwind } from "@vueuse/core";
import { useCpa } from "~/composables/store/cpa_store";
import { useNavbarStatusStore } from "~/composables/store/navbar_status_store";

const el = ref<HTMLElement | null>(null);
useWindowClickDetector((ev) => {
    if (ev.target !== null && !el.value?.contains(ev.target as Node)) {
        collapse();
    }
});
const cpa = useCpa();
const status = useNavbarStatusStore();
const runtimeConfig = useAppConfig();
const breakpoints = useBreakpoints(breakpointsTailwind);
const windowSize = useWindowSize();
const notifiedExpanded = ref(false);
const transitionDurationMs = ref(250);
const navbarElements = [
    { title: "Home", icon: "material-symbols:home-rounded", path: "/" },
    { title: "Stato ditte", icon: "fa6-solid:user-check", path: "/dittas" },
    { title: "F24 - Cassetto fiscale", icon: "material-symbols:bottom-drawer", path: "/tax_drawer/f24" },
    { title: "Fatture 360", icon: "basil:invoice-solid", path: "/invoices" },
    { title: "Ditte 360", icon: "ri:pie-chart-2-fill", path: "/companies" },
    { title: "Statistiche processo", icon: "ic:round-query-stats", path: "/process_statistics" },
    { title: "TeamSystem", icon: "material-symbols:database", path: "/teamsystem" },
    { title: "Assistente I.A.", icon: "fluent:chat-sparkle-16-filled", path: "/assistant" },
    { title: "Impostazioni", icon: "material-symbols:settings-rounded", path: "/settings" },
];
if (!cpa.isTeamSystem) {
    navbarElements.splice(
        navbarElements.findIndex((e) => e.path === "/teamsystem"),
        1
    );
}

if (Number(cpa.getData.id) === 10040) {
    navbarElements.splice(
        navbarElements.findIndex((e) => e.path === "/teamsystem"),
        1
    );
    navbarElements.splice(
        navbarElements.findIndex((e) => e.path === "/companies"),
        1
    );
    navbarElements.splice(
        navbarElements.findIndex((e) => e.path === "/assistant"),
        1
    );
}

function collapse() {
    status.toggle(false);
    notifiedExpanded.value = false;
}

function logout() {
    collapse();
    cpa.logout();
}

function onExpandClicked() {
    const newStatus = !status.expanded;
    status.toggle(newStatus);

    let delay = newStatus ? transitionDurationMs.value * 0.75 : 0;
    if (breakpoints.smallerOrEqual("md").value) {
        delay = 0;
    }
    setTimeout(() => (notifiedExpanded.value = !notifiedExpanded.value), delay);
}
</script>

<style lang="css" scoped>
.vertical-menu {
    transition: all var(--duration) ease;
    z-index: 40;
    @apply fixed rounded-r-xl flex-col h-screen flex border-[1.5px] border-outline border-l-[0] bg-surface_variant py-8 px-2 shadow-black/25 shadow-md;
}

.horizontal-menu {
    transition: all var(--duration) ease;
    z-index: 10;
    @apply fixed rounded-b-xl w-full h-[var(--h-navbar-height)] items-center flex justify-between bg-surface_variant py-2 px-4 shadow-black/25 shadow-md;
}

.btn {
    @apply rounded-xl w-full flex items-center hover:bg-surface px-4 py-2 cursor-pointer select-none;
}

.slide-enter-from,
.slide-leave-to {
    transform: translate(var(--x-tr, 0), var(--y-tr, 0));
}

.slide-enter-active,
.slide-leave-active {
    transition: all var(--duration-tr, 200ms) cubic-bezier(0.25, 1, 0.5, 1);
    transition-delay: var(--delay-tr, 0ms);
}
</style>
