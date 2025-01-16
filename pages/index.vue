<template>
    <div v-if="mounted" class="flex flex-col w-full">
        <h1>Dashboard</h1>
        <h3 class="text-start">
            Benvenuto, <span class="font-bold">{{ cpa.getDisplayData.name }}</span>
        </h3>
        <div>
            <span class="flex flex-row gap-2 items-center">
                <icon name="mdi:identifier" class="size-8 text-accent"></icon>
                <p>{{ cpa.getDisplayData.id }}</p>
            </span>
            <span class="flex flex-row gap-2 items-center">
                <icon name="material-symbols-light:business-center-rounded" class="size-8 text-accent"></icon>
                <p>{{ cpa.dittas.list.length }} ditte registrate</p>
            </span>
        </div>
        <div class="divider"></div>
        <h2 class="text-center">Menù principale</h2>
        <div class="flex self-center max-w-[80rem] flex-row flex-wrap justify-center gap-10 my-8 items-start w-full">
            <Transition name="join" appear mode="out-in">
                <NuxtLink to="/dittas" :style="{ '--y-tr': '25px' }">
                    <div class="card-button group">
                        <img src="/stats.svg" class="w-[200px]" />
                        <p>Riassunto stato ditte</p>
                    </div>
                </NuxtLink>
            </Transition>
            <Transition name="join" appear mode="out-in">
                <NuxtLink to="/process_statistics" :style="{ '--y-tr': '25px' }">
                    <div class="card-button group">
                        <img src="/barchart.svg" />
                        <p>Statistiche di processo</p>
                    </div>
                </NuxtLink>
            </Transition>
            <Transition name="join" appear mode="out-in">
                <NuxtLink to="/settings" :style="{ '--y-tr': '25px' }">
                    <div class="card-button group">
                        <img src="/settings.svg" />
                        <p>Impostazioni generali</p>
                    </div>
                </NuxtLink>
            </Transition>
            <Transition name="join" appear mode="out-in">
                <NuxtLink to="/cloud_synch" :style="{ '--y-tr': '25px' }">
                    <div class="card-button group">
                        <img src="/cloud.svg" />
                        <p>Connetti al cloud</p>
                    </div>
                </NuxtLink>
            </Transition>
            <Transition name="join" appear mode="out-in">
                <NuxtLink to="/tax_drawer/f24" :style="{ '--y-tr': '25px' }">
                    <div class="card-button group">
                        <BetaBadge class="absolute top-2 right-2"></BetaBadge>
                        <img src="/stats1.svg" />
                        <p>F24 analisi & statistiche</p>
                    </div>
                </NuxtLink> </Transition
            ><Transition name="join" appear mode="out-in">
                <NuxtLink to="/invoices" :style="{ '--y-tr': '25px' }">
                    <div class="card-button group">
                        <img src="/invoice.svg" />
                        <p>Fatture 360</p>
                    </div>
                </NuxtLink>
            </Transition>
            <Transition v-if="Number(cpa.getData.id) !== 10040" name="join" appear mode="out-in">
                <NuxtLink to="/companies" :style="{ '--y-tr': '25px' }">
                    <div class="card-button group">
                        <BetaBadge class="absolute top-2 right-2"></BetaBadge>
                        <img src="/companies.svg" />
                        <p>Ditte 360</p>
                    </div>
                </NuxtLink>
            </Transition>
            <Transition v-if="Number(cpa.getData.id) !== 10040" name="join" appear mode="out-in">
                <NuxtLink to="/assistant" :style="{ '--y-tr': '25px' }">
                    <div class="card-button group">
                        <BetaBadge class="absolute top-2 right-2"></BetaBadge>
                        <img src="/chat.svg" />
                        <p>Assistente I.A.</p>
                    </div>
                </NuxtLink>
            </Transition>
            <Transition v-if="cpa.isTeamSystem && Number(cpa.getData.id) !== 10040" name="join" appear mode="out-in">
                <NuxtLink to="/teamsystem" :style="{ '--y-tr': '25px' }">
                    <div class="card-button group">
                        <img src="/team-system.svg" />
                        <p>TeamSystem</p>
                    </div>
                </NuxtLink>
            </Transition>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { useToast } from "vue-toastification";
const { api } = useApi();
const endpoints = useEndpoints();
// const toast = useToast();

const mounted = useMounted();
const cpa = useCpa();

async function checkIfCredentialIsExpired(customerId) {
  try {
    await api(endpoints.checkteamsystem_expiration, {
      method: "POST",
      body: { customer_id: customerId },
      onResponse({ request, response, options }) {

        if (response.status == 200) {
          let verification_results = response._data.data.results;
          console.log("TeamSystem verification successful====>", response);
          
          // toast.success("Teamsystem Verification Results");
        //   useToast().success("Teamsystem Verification Results")
          let expired_accounts: string[] = [];;
          verification_results.forEach((result) => {
            if (result.is_expired == true) {
              expired_accounts.push(result.username);
            }

            console.log(
              `Username: ${result.username}, Verification Status: ${result.data}`
            );
          });
          if (expired_accounts.length > 0) {
            let message = "Le credenziali del tuo sistema di team sono scadute:\n";
            expired_accounts.forEach((account) => {
              message += `               ${account}\n`;
            });

            // toast.error(message);
            useToast().error(message)
          }
        }
      },
      onResponseError({ request, response, options }) {
        console.error("TeamSystem verification failed");
      },
    });
  } catch (error) {
    console.error(error);
  }
}
onMounted(() => {
    checkIfCredentialIsExpired(cpa.getDisplayData.id)
});
</script>

<style lang="css" scoped>
.section {
    @apply flex flex-col;
}

.card-button {
    @apply relative bg-surface px-4 py-4 min-w-[16rem] text-[1.15rem] rounded-xl justify-start flex flex-col items-center gap-4 border-[1.5px] border-outline hover:border-accent cursor-pointer hover:scale-[102%] transition-all duration-100 ease-out;

    .iconify {
        @apply size-8;
    }

    img {
        @apply w-[180px];
    }
}
</style>
