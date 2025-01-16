import VueApexCharts from "vue3-apexcharts";
import { Log } from "~/server/src/logger";

export default defineNuxtPlugin((nuxtApp) => {
    nuxtApp.vueApp.use(VueApexCharts);
    Log.info("set up apexcharts");
});
