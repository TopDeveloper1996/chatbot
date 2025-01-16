

import Timespan from "~/src/timespan";

export const useUserProvidedDataStore = defineStore("user_provided_data", () => {
    const now = new Date();
    const YTDUserProvideData = ref<any[]>([]);
    const userProvidedDataSelectedDittaId = ref<string>("");
    const currentYearUserProvideData = ref<any[]>([]);
    const lastYearUserProvideData = ref<any[]>([]);
    const lastAvailableDate = ref<Date>(new Date());
    const focusUserProvideData = ref<any[]>([]);
    const userProvidedDataTimespan = ref<Timespan>(Timespan.yearToDate());
    const income_statements = ref<any[]>([]);
    const hasCache = ref<boolean>(false);
    const fetching = ref<boolean>(false);
    const isUserProvideData = ref<boolean>(false);
    let fetchPromise: Promise<any> | undefined = undefined;
    const endpoints = useEndpoints();
    const { api } = useApi();

    function $reset() {
      fetching.value = true;
      income_statements.value = [];
  }

    const userProvidedDataFetch = async ({ 
      dittaId, 
      timespan = userProvidedDataTimespan.value,
      ignoreCache = false
     }: { 
      dittaId: string;
      timespan?: Timespan;
      ignoreCache?: boolean }) => {
        if (fetching.value && fetchPromise !== undefined) {
          console.log("awaiting existing promise");
          await fetchPromise;
          return;
        }
        
        try {
            if (
              !ignoreCache &&
              dittaId === userProvidedDataSelectedDittaId.value && 
              hasCache.value
            )
              return;
          
            fetching.value = true;
            fetchPromise = api(endpoints.dittaUserProvidedData, { 
              query: { 
                ditta_id: dittaId,
                period_year: timespan.to.getFullYear()
              } 
            });
            const res = await fetchPromise;
            
            income_statements.value = res.data.income_statements;
            
            focusUserProvideData.value = res.data.income_statements.filter((i: any) => {
              const balance_period = new Date(i.period_year, i.period_month - 1, 2);
              return timespan.fits(balance_period)
            });
            currentYearUserProvideData.value = res.data.income_statements.filter(
              (i: any) => i.period_year === now.getFullYear());
            lastYearUserProvideData.value = res.data.income_statements.filter(
              (i: any) => i.period_year === now.getFullYear() - 1);
            
        
            YTDUserProvideData.value = res.data.income_statements.filter((i: any) => {
              const balance_period = new Date(i.period_year, i.period_month - 1, 2);
              return timespan.fits(balance_period)
            });
            lastAvailableDate.value = YTDUserProvideData.value.length ? new Date(YTDUserProvideData.value[0].period_year, YTDUserProvideData.value[0].period_month, 1) : new Date();
            
            hasCache.value = true;
            userProvidedDataSelectedDittaId.value = dittaId;
            userProvidedDataTimespan.value = timespan;
        
            if (focusUserProvideData.value) 
              isUserProvideData.value = true;
        } catch (ex) {
            console.error("error fetching user provided data");
            console.error(ex);
        } finally {
            fetching.value = false;
            fetchPromise = undefined;
            return;
        }
    };
    const getLastAvailableDate = () => {
      return lastAvailableDate.value;
    }

    const getfocusUserProvideData = (timespan: Timespan) => {
      focusUserProvideData.value = income_statements.value.filter((i: any) => {
      const balance_period = new Date(i.period_year, i.period_month - 1, 2);
      return timespan.fits(balance_period)
    });
      return focusUserProvideData.value;
    }

    return {
        $reset,
        userProvidedDataSelectedDittaId,
        isUserProvideData,
        income_statements,
        focusUserProvideData,
        currentYearUserProvideData,
        lastYearUserProvideData,
        YTDUserProvideData,
        hasCache,
        fetching,
        userProvidedDataFetch,
        getLastAvailableDate,
        getfocusUserProvideData,
    };
});
