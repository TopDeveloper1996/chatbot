export default defineNuxtPlugin((nuxtApp) => {
    const config = useAppConfig();
    const api = $fetch.create<any>({
        baseURL: "/api/",
        headers: {
            Authorization: `Bearer ${config.auth}`,
        },
    });

    return {
        provide: { api },
    };
});
