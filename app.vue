<template>
    <div v-if="mounted">
        <Transition name="fade" appear mode="out-in">
            <div
                :style="{ '--duration-tr': '400ms' }"
                v-if="loginFreeSubdomains.find((r) => route.path.includes(r))"
                class="flex w-screen"
            >
                <NuxtPage class="py-2 flex h-full px-2 md:pl-6 md:ml-[4.5rem] mt-[var(--h-navbar-height)] md:mt-0">
                </NuxtPage>
            </div>
            <div :style="{ '--duration-tr': '400ms' }" v-else-if="cpa.isLogged" class="flex w-screen">
                <NavbarHeadline></NavbarHeadline>
                <div class="absolute top-4 right-4">
                    <h3>{{ cpa.getDisplayData.name }}</h3>
                </div>
                <NuxtPage class="py-2 flex h-full px-2 md:pl-6 md:ml-[4.5rem] mt-[var(--h-navbar-height)] md:mt-0">
                </NuxtPage>
            </div>
            <div
                v-else
                :style="{ '--duration-tr': '400ms' }"
                class="flex w-screen h-screen flex-col items-center justify-center p-8 overflow-clip"
            >
                <div class="rounded-xl border-[1px] border-outline flex flex-col items-stretch p-4 md:p-12 bg-surface">
                    <img class="mx-4 my-16" width="90%" src="/mentally.png" />

                    <div v-if="!logging" class="flex flex-col justify-stretch gap-6">
                        <input v-model="username" type="text" placeholder="Email" />
                        <input v-model="password" type="password" placeholder="Password" />
                        <div>
                            <button
                                :disabled="stringUtils.isNullOrEmpty(username) || stringUtils.isNullOrEmpty(password)"
                                @click="() => manualLogin(false)"
                                class="primary-button w-full"
                            >
                                <icon class="size-8" name="solar:login-3-bold"></icon>
                                <p>Login</p>
                            </button>
                            <p class="mt-1 text-center text-red-400">{{ errorDisplay }}</p>
                        </div>
                    </div>
                    <div v-else class="flex justify-center w-full">
                        <div class="flex items-center flex-row gap-2">
                            <icon class="size-6" name="line-md:loading-twotone-loop"></icon>
                            <p class="">Preparando l'ambiente</p>
                        </div>
                    </div>
                </div>
            </div>
        </Transition>
    </div>
</template>

<script lang="ts" setup>
import * as stringUtils from "~/src/common/string";
import { useCpa } from "./composables/store/cpa_store";

const loginFreeSubdomains = ["cloud_synch_oauth", "onedrive_cloud_logout"];

const { api } = useApi();
const mounted = useMounted();
const sessionTokenCookie = useCookie<string | undefined>("session_token", { watch: true });
const customerIdCookie = useCookie<string | undefined>("customer_id", { watch: true });
const demoCookie = useCookie<boolean | undefined>("is_demo", { watch: true });
const cpa = useCpa();
const endpoints = useEndpoints();
const username = ref("");
const password = ref("");
const selected_ditta = ref("");
const errorMessage = ref("");

const route = useRoute();
const router = useRouter();

const logging = ref<boolean>(false);

const errorDisplay = computed(() =>
    stringUtils.isNullOrEmpty(username.value) && stringUtils.isNullOrEmpty(password.value) ? "" : errorMessage.value
);

watch(
    () => cpa.isLogged,
    (logged) => {
        if (!logged) {
            sessionTokenCookie.value = undefined;
            customerIdCookie.value = undefined;
            demoCookie.value = undefined;
            logging.value = false;
        }
    }
);

async function login(data: any) {
    errorMessage.value = "";
    sessionTokenCookie.value = data.session_token;
    customerIdCookie.value = data.customer_id;
    demoCookie.value = data.is_demo;
    await cpa.login({
        cpa: { id: data.customer_id, name: data.name, studioName: data.studio_name, isDemo: data.is_demo, blobContainerName: data.blob_container_name },
        username: data.username,
        password: data.password,
        selected_ditta: data.selected_ditta,
    });
}

function logout() {
    logging.value = false;
    cpa.logout();
}

async function manualLogin(isDemo?: boolean) {
    try {
        logging.value = true;
        await api(endpoints.authLogin, {
            method: "POST",
            body: { email: username.value.trim(), password: password.value.trim() },
            onResponse({ request, response, options }) {
                if (response.status == 200) {
                    let data = response._data.data;
                    data.username = username.value.trim();
                    data.password = password.value.trim();
                    data.selected_ditta = selected_ditta.value.trim();
                    data.is_demo = isDemo;
                    login(data);
                }
            },
            onResponseError({ request, response, options }) {
                console.log(response._data);
                errorMessage.value = "Login non valido, riprovare";
                logout();
            },
        });
    } catch (error) {}
}

async function checkAuth() {
    if (cpa.isLogged) return;
    if (!sessionTokenCookie.value || !customerIdCookie.value) return;
    try {
        logging.value = true;
        await api(endpoints.authVerify, {
            method: "GET",
            query: { customer_id: customerIdCookie.value, session_token: sessionTokenCookie.value },
            onResponse({ request, response, options }) {
                if (response.status == 200) {
                    const data = response._data.data;
                    data.is_demo = demoCookie.value;
                    login(data);
                }
            },
            onResponseError({ request, response, options }) {
                console.log(response._data);
                logout();
            },
        });
    } catch (error) {}
}

onMounted(() => {
    if (loginFreeSubdomains.find((r) => route.path.includes(r))) return;
    let userStr = route.query.username?.toString();
    let pswStr = route.query.password?.toString();
    let selectedDittaStr = route.query.ditta?.toString() ?? '';
    let isDemo = route.query.demo?.toString() === "true";
    const currentQuery = router.currentRoute.value.query;
    delete currentQuery.username;
    delete currentQuery.password;
    delete currentQuery.demo;
    router.replace({ query: currentQuery });
    if (userStr && pswStr) {
        username.value = userStr;
        password.value = pswStr;
        selected_ditta.value = selectedDittaStr;
        route;
        manualLogin(isDemo);
        return;
    }
    // let session_token = route.query["session_token"];
    // let customer_id = route.query["customer_id"];
    // if (session_token && customer_id) {
    //     sessionTokenCookie.value = session_token.toString();
    //     customerIdCookie.value = customer_id.toString();
    //     router.replace({ query: {} });
    // }
    checkAuth();
});

useSeoMeta({
    title: "Ade Mentally",
});
</script>

<style lang="css" scoped></style>
