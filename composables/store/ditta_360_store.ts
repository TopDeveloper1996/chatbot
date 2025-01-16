import { DittaTextSummaryFinalComment } from "~/src/types/analytics_types";
import { IncomeStatementAnalytics } from "~/src/types/income_statement_types";
export const useDitta360Store = defineStore("ditta_360", () => {
    const income_statement = ref<IncomeStatementAnalytics>();
    const focusPeriodLabel = ref<string>("");
    const ditta360ReportTextSummary = ref<string>("");
    const ditta360ReportFinalComment = ref<string>("");
    const ditta360SelectedDittaId = ref<string>("");
    const ditta360SelectedCpaID = ref<string>("");
    const endpoints = useEndpoints();
    const { api } = useApi();
    const set_income_statement = (analytics: IncomeStatementAnalytics, focustimestamp: string) =>{
        console.debug("set income statement in state store", analytics, focustimestamp)
        income_statement.value = analytics;
        focusPeriodLabel.value = focustimestamp;
    }
  

    const getDitta360ReportConfig = async ({}: {}) => {
        if (!ditta360SelectedDittaId.value || !ditta360SelectedCpaID.value) return <DittaTextSummaryFinalComment>{
          ditta_report_summary: '',
          ditta_report_final_comment: '',
        };
        await api(endpoints.ditta_360_Report, {
          method: "GET",
          query: { ditta_id: ditta360SelectedDittaId.value, cpa_id :ditta360SelectedCpaID.value },
          onResponse({ request, response, options }) {
            if (response.ok) {
              const responseData = response._data.data.accounts[0]
            //   console.log({responseData})
              ditta360ReportTextSummary.value = responseData.ditta_360_report_summary;
              ditta360ReportFinalComment.value = responseData.ditta_360_report_final_comment;
            } else {
              console.log(
                `problem with fetching dittas 360 report summary and final comment: ${JSON.stringify(response._data)}`
              );
            }
          },
          onResponseError({ request, response, options }) {
            console.log("error fetching dittas 360 report summary and final comment");
            ditta360ReportTextSummary.value = '';
            ditta360ReportFinalComment.value = '';
          },
        });
        return <DittaTextSummaryFinalComment>{
          ditta_report_summary: ditta360ReportTextSummary.value,
          ditta_report_final_comment: ditta360ReportFinalComment.value,
        };
      };
    
    const saveDitta360ReportConfig = async ({
        ditta360_report_config,
      }: {
        ditta360_report_config: DittaTextSummaryFinalComment;
      }) => {
        // console.log({ditta360_report_config})

        if (!ditta360SelectedDittaId.value || !ditta360SelectedCpaID.value) return <DittaTextSummaryFinalComment>{
            ditta_report_summary: '',
            ditta_report_final_comment: '',
          };
        await api(endpoints.ditta_360_Report, {
          method: "PATCH",
          body: {
            ditta_id: ditta360SelectedDittaId.value,
            cpa_id :ditta360SelectedCpaID.value,
            ditta_report_summary: ditta360_report_config.ditta_report_summary,
            ditta_report_final_comment: ditta360_report_config.ditta_report_final_comment,
          },
          onResponse({ request, response, options }) {
            if (response.ok) {
              console.log("ditta 360 report text summary saved");
            } else {
              console.log(
                `problem with saving ditta 360 report summary and final comment: ${JSON.stringify(response._data)}`
              );
            }
          },
          onResponseError({ request, response, options }) {
            console.log("error saving ditta 360 report and text summary");
          },
        });
      }
    return {ditta360SelectedDittaId,
            ditta360SelectedCpaID,
            income_statement, 
            focusPeriodLabel, 
            set_income_statement, 
            getDitta360ReportConfig,  
            saveDitta360ReportConfig,
        };
});
