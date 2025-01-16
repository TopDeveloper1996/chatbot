<template>
    <div v-if="mounted" class="flex flex-col flex-grow h-screen">
        <div>
            <h1 class="view-title">Connessione al drive personale</h1>
            <Transition name="fade" appear mode="out-in">
                <div v-if="fetching" class="flex justify-center w-full">
                    <div class="flex items-center flex-row gap-2">
                        <icon class="size-6" name="line-md:loading-twotone-loop"></icon>
                        <p class="">Recuperando i dati</p>
                    </div>
                </div>
                <div v-else>
                    <div v-if="driveConfig && driveConfig.isactive" class="flex flex-col items-start gap-4">
                        <div class="flex flex-row items-center gap-4">
                            <icon :name="connectedDriveIcon" class="size-12 text-accent"></icon>
                            <p>
                                Sei attualmente connesso a <span class="font-bold">{{ connectedDriveName }}</span>
                            </p>
                        </div>
                        <p>
                            La cartella sincronizzata è:
                            <span class="font-bold text-accent">{{ driveConfig.root_folder }}</span>
                        </p>
                        <button @click="() => modal.toggle(true)" class="mt-8 secondary-button">
                            <icon class="size-8" name="fluent:plug-disconnected-16-filled"></icon>
                            Disconnetti
                        </button>
                    </div>
                    <div v-else class="flex flex-col items-start gap-8">
                        <h3>Seleziona il tipo di servizio Drive</h3>
                        <div class="flex flex-row items-center gap-2">
                            <icon class="size-12" :name="driveIcon"></icon>
                            <DropdownMenu
                                id="agent_type_dropdown"
                                class="w-[8rem]"
                                :items="enabledDrives"
                                :items-formatter="(e) => wordCapitalize(e) ?? ''"
                                close-on-click
                                :label="wordCapitalize(selectedDrive) ?? ''"
                                @change="(e) => (selectedDrive = e)"
                            ></DropdownMenu>
                        </div>
                        <div class="flex flex-col items-start gap-1 w-full">
                            <p>Puoi modificare il nome della cartella Drive</p>
                            <input v-model="folderName" type="text" placeholder="Nome della cartella Drive" />
                        </div>

                        <div class="flex flex-col items-start gap-4">
                            <button
                                @click="auth"
                                :disabled="folderName === undefined || folderName.length <= 0"
                                class="disabled:transition-none disabled:bg-slate-500 disabled:cursor-not-allowed flex flex-row items-center gap-2 bg-white hover:bg-slate-200 px-6 py-2 rounded-lg text-black font-bold transition-all duration-150"
                            >
                                <icon class="size-8" :name="driveIcon"></icon>
                                Connetti {{ wordCapitalize(selectedDrive) }}
                            </button>
                        </div>
                    </div>
                </div>
            </Transition>
        </div>
        <ModalSheet :controller="modal" :height="'50%'">
            <div class="flex flex-col gap-4 items-center">
                <h1>Sei sicuro di voler disconnettere il Drive?</h1>
                <p class="text-red-600 font-bold">
                    A seguito della disconnessione, i files non verranno più sincronizzati con il Drive personale!
                </p>
                <div class="flex flex-row justify-center items-center gap-8">
                    <button @click="disconnect" class="primary-button delete-button">Disconnetti</button>
                    <button @click="() => modal.toggle(false)" class="secondary-button">Annulla</button>
                </div>
            </div>
        </ModalSheet>
    </div>
</template>

<script lang="ts" setup>
enum DriveType {
    google = "google",
    onedrive = "one drive",
}

const enabledDrives = [DriveType.google, DriveType.onedrive];
const mounted = useMounted();
const selectedDrive = ref<DriveType>(enabledDrives[0]);
const cpa = useCpa();
const fetching = ref<boolean>(true);
const driveConfig = ref<any>({});
const modal = useModalSheet();
const { api } = useApi();

const folderName = ref<string>(`Mentally ${cpa.getData.studioName}`);

const connectedDriveName = computed(() => {
    switch (driveConfig.value.drive_type_id) {
        case 1:
            return "Google Drive";
        case 2:
            return "OneDrive";
        default:
            return "Cloud";
    }
});

const connectedDriveIcon = computed(() => {
    switch (driveConfig.value.drive_type_id) {
        case 1:
            return "logos:google-drive";
        case 2:
            return "logos:microsoft-onedrive";
        default:
            return "material-symbols:home-storage-rounded";
    }
});

const driveIcon = computed(() => {
    switch (selectedDrive.value) {
        case DriveType.google:
            return "logos:google-drive";
        case DriveType.onedrive:
            return "logos:microsoft-onedrive";
        default:
            return "material-symbols:home-storage-rounded";
    }
});

async function onMessage(m: MessageEvent<any>) {
    if (origin !== m.origin) {
        console.warn("received message from unrecognized origin: " + m.origin);
        return;
    }
    try {
        if (m.data.provider === "google" && m.data.code) {
            fetching.value = true;
            const res = await api("/api/user/oauth/google/generate_tokens", {
                query: {
                    customer_id: cpa.getData.id,
                    code: m.data.code,
                    redirect_uri: `${location.origin}/cloud_synch_oauth`,
                },
            });
            const tokens = res.data;
            console.log(tokens);
            const connectionRes = await api("/api/user/cloud/connect_google", {
                method: "POST",
                body: {
                    root_folder: folderName.value,
                    customer_id: cpa.getData.id,
                    access_token: tokens.access_token,
                    refresh_token: tokens.refresh_token,
                    expiry_date: tokens.expiry_date,
                    token_type: tokens.token_type,
                },
            });

            console.log(connectionRes);
            fetch();
        } else if (m.data.provider === "onedrive" && m.data.code) {
            fetching.value = true;
            const res = await api("/api/user/oauth/onedrive/generate_tokens", {
                query: {
                    customer_id: cpa.getData.id,
                    code: m.data.code,
                    redirect_uri: `${location.origin}/cloud_synch_oauth`,
                },
            });
            const tokens = res.data;

            console.log(tokens);

            const connectionRes = await api("/api/user/cloud/connect_onedrive", {
                method: "POST",
                body: {
                    root_folder: folderName.value,
                    customer_id: cpa.getData.id,
                    access_token: tokens.accessToken,
                    refresh_token: tokens.refreshToken,
                    expiry_date: tokens.expiresOn,
                    token_type: tokens.tokenType,
                },
            });
            console.log(connectionRes);
            fetch();
        } else if (m.data.provider === "onedrive" && m.data.disconnected) {
            console.log("received a message for onedrive disconnect");
            await api("/api/user/cloud/disconnect", {
                query: { customer_id: cpa.getData.id },
                method: "DELETE",
            });
            await fetch();
        }
    } catch (ex) {
    } finally {
        fetching.value = false;
    }
}

onMounted(() => {
    fetch();
    window.addEventListener("message", onMessage);
});

onUnmounted(() => {
    window.removeEventListener("message", onMessage);
});

async function disconnect() {
    modal.toggle(false);
    fetching.value = true;
    if (driveConfig.value?.drive_type_id === 2) {
        const redirectUri = encodeURIComponent(`${location.origin}/onedrive_cloud_logout`);
        console.log(redirectUri);
        window.open(
            `https://login.microsoftonline.com/common/oauth2/v2.0/logout?post_logout_redirect_uri=${redirectUri}`,
            "Diconnect OneDrive",
            "popup=true,height=800,width=500"
        );
        fetching.value = false;
        return;
    }
    await api("/api/user/cloud/disconnect", {
        query: { customer_id: cpa.getData.id },
        method: "DELETE",
    });
    await fetch();
}

async function fetch() {
    fetching.value = true;
    const res = await api("/api/user/cloud/settings", { query: { customer_id: cpa.getData.id } });
    driveConfig.value = res.data;
    fetching.value = false;
}

async function auth() {
    switch (selectedDrive.value) {
        case DriveType.google:
            const r = await api("/api/user/oauth/google/url", {
                query: { redirect_uri: `${location.origin}/cloud_synch_oauth` },
            });
            window.open(r.data, "Oauth", "popup=true,height=800,width=500");
            break;
        case DriveType.onedrive:
            const res = await api("/api/user/oauth/onedrive/url", {
                query: { redirect_uri: `${location.origin}/cloud_synch_oauth` },
            });
            window.open(res.data, "Oauth", "popup=true,height=800,width=500");
            break;
        default:
            break;
    }
}
</script>

<style></style>
