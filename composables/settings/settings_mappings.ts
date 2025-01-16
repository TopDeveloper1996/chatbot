export const useSettingsMappings = () => {
    const reportFrequencyTypeMap: any = {
        manual: "Solo Manuale",
        daily: "Giornaliero",
        weekly: "Settimanale",
        monthly: "Mensile",
        quarterly: "Trimestrale",
        yearly: "Annuale",
    };
    const reportTypeMap: any = {
        // f24: "F24",
        ditte360: "Ditte360",
        // fatture360: "Fatture 360",
        // consigliai: "Consigli A.I.",
        teamsystem: "Teamsystem",
        // personalizzato: "Personalizzato",
    };

    const teamSystemFrequencyMap: any = {
        monthly: "Mensile",
        quarterly: "Trimestrale",
    };

    const getReportFrequencyTypeMap = computed(() => reportFrequencyTypeMap);
    const getReportTypeMap = computed(() => reportTypeMap);
    const getTeamSystemFrequencyMap = computed(() => teamSystemFrequencyMap);
    return { getReportFrequencyTypeMap, getReportTypeMap , getTeamSystemFrequencyMap};
};
