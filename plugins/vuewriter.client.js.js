import VueWriter from "vue-writer";
import { Log } from "~/server/src/logger";
export default defineNuxtPlugin((nuxtApp) => {
    nuxtApp.vueApp.use(VueWriter);
    Log.info("set up vuewriter");
});
