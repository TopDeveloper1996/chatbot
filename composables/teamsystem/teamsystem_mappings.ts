import * as stringUtils from "~/src/common/string";
export const useTeamSystemMappings = () => {
    const aggregationMode: any = {
        monthly: "Mensile",
        quarterly: "Trimestrale",
    };
    const getAggregationModeMap = computed(() => aggregationMode);

    const getReadableAggregationMode = (code: string | null | undefined): string => {
        if (stringUtils.isNullOrEmpty(code)) return "";
        let elem = aggregationMode[code!.toLowerCase()];
        if (elem === undefined) return code!.toUpperCase();
        return `${code?.toUpperCase()} - ${elem}`;
    };
    return { getReadableAggregationMode, getAggregationModeMap };
};
