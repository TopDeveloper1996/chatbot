export const useDittaMappings = () => {
    const accountingTypeMap: any = {
        ordinario: "Ordinario",
        semplificato: "Semplificato", // can't run Teamsystem robot
        forfettario: "Forfettario",
    };
    const getAccountingTypeMap = computed(() => accountingTypeMap);
    return { getAccountingTypeMap};
};
