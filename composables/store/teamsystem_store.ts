import {
  TeamSystemSummary,
  TeamSystemOverAllChart,
  TeamSystemReport,
  TeamSystemLastYearCurrentYearChart,
} from "~/src/types/teamsystem_types";
import Timespan from "~/src/timespan";
import * as teamsSystemAccounts  from "./teamsystemAccounts.js";
import l from "lodash";
import { strToDateLabel } from "~/src/common/dates";
function sumAttributes(obj1 :any, obj2:any, ignoreKeys: string[] = []) {
  for (let key in obj1) {
    if (obj1.hasOwnProperty(key) && obj2.hasOwnProperty(key) && !ignoreKeys.includes(key)) {
      obj1[key] = obj1[key] + obj2[key];
    }
  }
  return obj1;
}

const getOpeningBalance = (accounts:any[], account: string, date:Date) => {
  const openingDate = Timespan.getFirstDayOfYear(date)
  const openingBalance = accounts.filter((i) => i.period_date == openingDate && i.account.startsWith(account));
  return openingBalance ? openingBalance[0].balance_amount : 0;
}
const filterAndSum = (accounts: any[], accountFilter: string[], isABS: boolean = true) => {
  const filtered = accounts.filter((i) =>
    accountFilter.some((f) => i.account && i.account.startsWith(f))
  );
  const amount = filtered.reduce(
    (acc, i) => acc + parseFloat(i.balance_amount),
    0.0
  );
  return isABS ? Math.abs(amount) : amount || 0;
};

const filterAndSumByAccount = (accounts: any[], accountFilter: string[], isABS: boolean = true) => {
  const amount = accountFilter.reduce(
    (acc, i) => acc + filterAndSum(accounts, [i], isABS),
    0.0
  );
  return isABS ? Math.abs(amount) : amount || 0;
};

export const useTeamSystemStore = defineStore("teamsystem", () => {
  const TSAccounts = ref<any[]>([]);
  const OverAllAccounts = ref<any[]>([]);
  const YTDAccounts = ref<any[]>([]);
  const FocusAccounts = ref<any[]>([]);
  const teamSystemSelectedDittaId = ref<string>("");
  const teamSystemSelectedCpaID = ref<string>("");
  const teamSystemIva = ref<number>(0);
  const statsSeries = ref<any[]>([]);
  const teamSystemPeriodYear = ref<number>(new Date().getFullYear());
  const teamSystemPeriodMonth = ref<number>(new Date().getMonth() + 1);
  const teamSystemTimespan = ref<Timespan>(Timespan.yearToDate());
  const hasCache = ref<boolean>(false);
  const fetching = ref<boolean>(false);
  let fetchPromise: Promise<any> | undefined = undefined;
  const endpoints = useEndpoints();
  const cpa = useCpa();
  const { api } = useApi();
  const now = new Date();
  const lastYearToday = new Date(now.getFullYear() - 1, now.getMonth(), 1);
  const currentYearAccounts = ref<any[]>([]);
  const lastYearAccounts = ref<any[]>([]);
  const lastFullyEndedNQuartersAccounts = ref<any[]>([]);
  const lastYearFullyEndedNQuartersAccounts = ref<any[]>([]);
  const lastAvailableDate = ref<Date>(new Date());
  const lastSynchronizationDate = ref<string>("");
  const haveData = ref<boolean>(false);

  const lastQuartersTimespan = ref<Timespan>(new Timespan(new Date(), new Date()));
  const lastYearQuartersTimespan = ref<Timespan>(new Timespan(new Date(), new Date()));

  const currentYearTimespan = new Timespan(
    new Date(`${now.getFullYear()}-01-01`),
    new Date(`${now.getFullYear()}-12-31`)
  );
  const lastYearTimespan = new Timespan(
    new Date(`${now.getFullYear() - 1}-01-01`),
    new Date(`${now.getFullYear() - 1}-12-31`)
  );

  const lastTwelveMonths = new Timespan(
    new Date(`${now.getFullYear() - 1}-${now.getMonth()}-01`),
    new Date(`${now.getFullYear()}-${now.getMonth() - 1}-01`)
  );
  const previewTwelveMonths = new Timespan(
    new Date(`${now.getFullYear() - 2}-${now.getMonth()}-01`),
    new Date(`${now.getFullYear() - 1}-${now.getMonth() - 1}-01`)
  );
  const thisYear = now.getFullYear();
  const dittaReportSummary = ref<string>("");
  const dittaReportFinalComment = ref<string>("");


  const teamsystemFetch = async ({
    dittaId,
    cpa_id,
    timespan,
    iva,
    ignoreCache = false,
  }: {
    dittaId: string;
    cpa_id : string;
    timespan: Timespan;
    iva: number;
    ignoreCache?: boolean;
  }) => {
    if (fetchPromise !== undefined) {
      console.log("awaiting existing promise");
      await fetchPromise;
      return;
    }
    console.log("fetching team system data");
    teamSystemIva.value = iva;

    try {
      if (
        !ignoreCache &&
        dittaId === teamSystemSelectedDittaId.value &&
        timespan == teamSystemTimespan.value
      )
        return;
      fetching.value = true;

      fetchPromise = api(endpoints.teamSystem, {
        query: {
          ditta_id: dittaId,
          customer_id: cpa_id,
        },
      });
      const res = await fetchPromise;
      const last_synchronization_date: string | undefined = res.data.accounts.length ? l.max(res.data.accounts.map((d: any) => d.updated_at).reduce((a: Date[], b: Date) => a.concat(b), <Date[]>[])) : undefined;
   
      lastSynchronizationDate.value = last_synchronization_date ? strToDateLabel(last_synchronization_date) : '';

      const lastAvailableAccountDate = res.data.accounts.length ? new Date(res.data.accounts[0].from_date) : new Date();
      const lastAvailableMonth = new Date(lastAvailableAccountDate.getFullYear(), lastAvailableAccountDate.getMonth() + 1, 0);
      lastAvailableDate.value = lastAvailableMonth;
      lastQuartersTimespan.value = Timespan.getLastFullyEndedNQuartersBounds(lastAvailableDate.value, 4);
      const lastYearToday = new Date(lastAvailableDate.value.getFullYear() - 1, lastAvailableDate.value.getMonth(), 1);
      lastYearQuartersTimespan.value = Timespan.getLastFullyEndedNQuartersBounds(lastYearToday, 4);
      haveData.value = res.data.accounts.length > 0;
      TSAccounts.value = res.data.accounts.map((i: any) => {
        return {
          ...i,
          balance_amount: parseFloat(i.balance_amount),
        };
      });
      OverAllAccounts.value = res.data.accounts.map((i: any) => {
        return {
          ...i,
          balance_amount: parseFloat(i.balance_amount),
          period_date: new Date(i.period_year, i.period_month -1 , 1, 0, 0, 0), 
        };
      })
      YTDAccounts.value = res.data.accounts.filter(
        (i: any) => i.period_year === thisYear
      );
      YTDAccounts.value = YTDAccounts.value.map((i: any) => {
        return {
          ...i,
          balance_amount: parseFloat(i.balance_amount),
          period_date: new Date(i.period_year, i.period_month -1 , 1, 0, 0, 0), 
        };
      })

      FocusAccounts.value = res.data.accounts.filter((i: any) => {
        const balance_period = new Date(i.period_year, i.period_month,1);
        return timespan.fits(balance_period)
      });
      currentYearAccounts.value = res.data.accounts.filter(
        (i: any) => i.period_year === now.getFullYear()
      );
      lastYearAccounts.value = res.data.accounts.filter(
        (i: any) => i.period_year === now.getFullYear() - 1
      );
      lastFullyEndedNQuartersAccounts.value = OverAllAccounts.value.filter(
        (i: any) => lastQuartersTimespan.value.fits(i.period_date)
      );
      lastYearFullyEndedNQuartersAccounts.value = OverAllAccounts.value.filter(
        (i: any) => lastYearQuartersTimespan.value.fits(i.period_date)
      );
      console.log("FocusAccounts", FocusAccounts.value);

      teamSystemSelectedDittaId.value = dittaId;
      teamSystemTimespan.value = timespan;
      teamSystemSelectedCpaID.value = cpa_id;
    } catch (ex) {
      console.error("error fetching teamsystem reports");
      console.error(ex);
    } finally {
      fetching.value = false;
      fetchPromise = undefined;
      return;
    }
  };

  const getReportConfig = async ({}: {}) => {
    if (!teamSystemSelectedDittaId.value || !teamSystemSelectedCpaID.value) return <TeamSystemReport>{
      ts_report_summary: dittaReportSummary.value,
      ts_report_final_comment: dittaReportFinalComment.value,
    };
    await api(endpoints.teamSystemReport, {
      method: "GET",
      query: { ditta_id: teamSystemSelectedDittaId.value, cpa_id :teamSystemSelectedCpaID.value },
      onResponse({ request, response, options }) {
        if (response.ok) {
          const responseData = response._data.data.accounts[0]
          console.log({responseData})
          dittaReportSummary.value = responseData.ts_report_summary;
          dittaReportFinalComment.value = responseData.ts_report_final_comment;
        } else {
          console.log(
            `problem with fetching dittas: ${JSON.stringify(response._data)}`
          );
        }
      },
      onResponseError({ request, response, options }) {
        console.log("error fetching dittas");
      },
    });
    return <TeamSystemReport>{
      ts_report_summary: dittaReportSummary.value,
      ts_report_final_comment: dittaReportFinalComment.value,
    };
  };

  const saveReportConfig = async ({
    ts_report_config,
  }: {
    ts_report_config: TeamSystemReport;
  }) => {
    console.log({ts_report_config})
    await api(endpoints.teamSystemReport, {
      method: "PATCH",
      body: {
        ditta_id: teamSystemSelectedDittaId.value,
        cpa_id :teamSystemSelectedCpaID.value,
        ts_report_summary: ts_report_config.ts_report_summary,
        ts_report_final_comment: ts_report_config.ts_report_final_comment,
      },
      onResponse({ request, response, options }) {
        if (response.ok) {
          console.log("report saved");
        } else {
          console.log(
            `problem with saving report: ${JSON.stringify(response._data)}`
          );
        }
      },
      onResponseError({ request, response, options }) {
        console.log("error saving report");
      },
    });
  }

  const computeStatsSeries = ({ timespan }: { timespan: Timespan }) => {
    const statsSeries = <TeamSystemOverAllChart>{
      ricavi: [],
      costi: [],
      ebitda: [],
      profitto_netto: [],
      costi_fissi: [],
      costi_variabili: [],
      utile_del_periodo:[],
      year: 0,
      month: 0,
    };
    Timespan.getMonthlyIntervals(timespan).map((i) => {
      const monthAccounts = OverAllAccounts.value.filter(
        (a: any) =>
          a.period_month === i.from.getMonth() + 1 &&
          a.period_year === i.from.getFullYear()
      );
      // console.log("monthAccounts", monthAccounts);
      const summary = computeSummary({ accounts: monthAccounts });
      // console.log("summary", summary);
      statsSeries.ricavi.push(summary.ricavi_totale_valore_della_produzione);
      statsSeries.costi.push(summary.costi_fissi + summary.costi_variabili);
      statsSeries.ebitda.push(summary.ebitda);
      statsSeries.profitto_netto.push(summary.ricavi_totale_valore_della_produzione - summary.costi_fissi);
      statsSeries.costi_fissi.push(summary.costi_fissi);
      statsSeries.costi_variabili.push(summary.costi_variabili);
      statsSeries.utile_del_periodo.push(summary.utile_del_periodo);
      statsSeries.year = i.from.getFullYear();
      statsSeries.month = i.from.getMonth() + 1;
    });
    console.log("statsSeries", statsSeries);
    return statsSeries;
  };

  const computeSummaryMonthly = ({ activeTimespan } : { activeTimespan: Timespan }) : TeamSystemSummary => {
    const stats = <TeamSystemSummary>{
      ricavi: 0,
      costi_fissi: 0,
      costi_variabili: 0,
      ebitda: 0,
      crediti: 0,
      durata_media_del_credito: 0,
      break_even_point: 0,
      profitto_netto: 0,
      ricavi_delle_prestazioni_di_servizi: 0,
      rimanenze_finali: 0,
      rimanenze_iniziali: 0,
      variazione_rimanze_semilav_e_prod_finiti: 0,
      altri_ricavi_e_proventi_della_gestione: 0,
      contributi_in_c_esercizio_o_in_c_capitale: 0,
      ricavi_totale_valore_della_produzione:0,
      indebitamento: 0, // TODO
      // costi
      materiali_e_materie_di_consumo: 0,
      variazione_delle_rimanenze_materie_prime: 0,
      costi_rimanenze_iniziali: 0,
      costi_rimanenze_finali: 0,
      costi_lavorazioni_di_terzi: 0,
      costi_altri_costi_per_servizi_generali_fissi: 0,
      costi_affitti_noleggi: 0,
      costi_costo_dipendenti: 0,
      costi_oneri_diversi_di_gestione: 0,
      costi_ebitda: 0,

      oneri_finanziari_e_oneri_bancari : 0,
      proventi_di_natura_finanziaria : 0,
      oneri_finanziari : 0,
      ammortamenti_svalutazioni_e_altri_accantonamenti: 0,
      imposte_sul_reddito : 0,
      utile_del_periodo: 0,

      // crediti
      crediti_sum: 0,
      crediti_verso_clienti:0,
      crediti_tributari:0,
      crediti_previdenziali:0,
      altri_crediti:0,
      disponibilita_liquide: 0,
      trattamento_di_fine_rapporto: 0,
      

      // debiti
      debiti_sum: 0,
      debiti_verso_banche: 0,
      debiti_verso_fornitori: 0,
      debiti_tributari: 0,
      debiti_previdenziali: 0,
      debiti_verso_dipendenti: 0,
      altri_debiti: 0,
      indebitamento_netto_complessivo: 0,

    };
    Timespan.getMonthlyIntervals(activeTimespan).map((activeMonth) => {
      const focusAccounts = OverAllAccounts.value.filter(
        (a: any) =>
          activeMonth.fits(a.period_date)
      );
      const monthStats = computeSummary({ accounts: focusAccounts });
      sumAttributes(stats, monthStats, ["ammortamenti_svalutazioni_e_altri_accantonamenti"]);
      stats.ammortamenti_svalutazioni_e_altri_accantonamenti = monthStats.ammortamenti_svalutazioni_e_altri_accantonamenti; // always take only the last month
    });

    return stats;
  };

  const computeSummary = ({
    accounts = YTDAccounts.value,
    monthDate,
  }: {
    accounts?: any[];
    monthDate?: Date;
  }): TeamSystemSummary => {
    const focusDate = accounts.length ? accounts[0].period_date: new Date();
    const lastMonthTimespan =  monthDate ?  Timespan.getLastMonthTimespan(monthDate): accounts.length ? Timespan.getLastMonthTimespan(accounts[0].period_date) : new Timespan(new Date(), new Date());
    const lastMonthAccounts = accounts.filter((i) =>
      lastMonthTimespan.fits(i.period_date)
    );
   
    const yearToDateTimeSpan = Timespan.yearToDateWithEndDate(focusDate);
    const stats = <TeamSystemSummary>{
      ricavi: 0,
      costi_fissi: 0,
      costi_variabili: 0,
      ebitda: 0,
      crediti: 0,
      durata_media_del_credito: 0,
      break_even_point: 0,
      profitto_netto: 0,
      ricavi_delle_prestazioni_di_servizi: 0,
      rimanenze_finali: 0,
      rimanenze_iniziali: 0,
      variazione_rimanze_semilav_e_prod_finiti: 0,
      altri_ricavi_e_proventi_della_gestione: 0,
      contributi_in_c_esercizio_o_in_c_capitale: 0,
      ricavi_totale_valore_della_produzione:0,
      indebitamento: 0, // TODO
      // costi
      materiali_e_materie_di_consumo: 0,
      variazione_delle_rimanenze_materie_prime: 0,
      costi_rimanenze_iniziali: 0,
      costi_rimanenze_finali: 0,
      costi_lavorazioni_di_terzi: 0,
      costi_altri_costi_per_servizi_generali_fissi: 0,
      costi_affitti_noleggi: 0,
      costi_costo_dipendenti: 0,
      costi_oneri_diversi_di_gestione: 0,
      costi_ebitda: 0,

      oneri_finanziari_e_oneri_bancari : 0,
      proventi_di_natura_finanziaria : 0,
      oneri_finanziari : 0,
      ammortamenti_svalutazioni_e_altri_accantonamenti: 0,
      imposte_sul_reddito : 0,
      utile_del_periodo: 0,

      // crediti
      crediti_sum: 0,
      crediti_verso_clienti:0,
      crediti_tributari:0,
      crediti_previdenziali:0,
      altri_crediti:0,
      disponibilita_liquide: 0,
      trattamento_di_fine_rapporto: 0,
      

      // debiti
      debiti_sum: 0,
      debiti_verso_banche: 0,
      debiti_verso_fornitori: 0,
      debiti_tributari: 0,
      debiti_previdenziali: 0,
      debiti_verso_dipendenti: 0,
      altri_debiti: 0,
      indebitamento_netto_complessivo: 0,

    };

    // crediti
    stats.crediti_verso_clienti = filterAndSum(
      accounts,
      teamsSystemAccounts.CREDITI_VERSO_CLIENTI_ACCOUNTS,
      false
    );
    
    stats.crediti_tributari = filterAndSum(
      accounts,
      teamsSystemAccounts.CREDITI_TRIBUTARI_ACCOUNTS,
      false
    );
    stats.crediti_previdenziali = filterAndSum(
      accounts,
      teamsSystemAccounts.CREDITI_PREVIDENZIALI_ACCOUNTS,
      false
    );
    stats.altri_crediti = filterAndSum(
      accounts,
      teamsSystemAccounts.ALTRI_CREDITI_ACCOUNTS,
      false
    );
    stats.disponibilita_liquide = filterAndSum(
      accounts,
      teamsSystemAccounts.DISPONIBILITA_LIQUIDE_ACCOUNTS,
      false
    );
    stats.trattamento_di_fine_rapporto = filterAndSum(
      accounts,
      teamsSystemAccounts.TRATTAMENTO_DI_FINE_RAPPORTO_accounts,
      false
    );
    stats.crediti_sum = stats.crediti_verso_clienti + stats.crediti_tributari + stats.crediti_previdenziali + stats.altri_crediti;

    // debiti
    // stats.debiti_verso_banche = filterAndSum(
    //   accounts,
    //   teamsSystemAccounts.DEBITI_VERSO_BANCHE_ACCOUNTS
    // );
    stats.debiti_verso_banche = filterAndSumByAccount(accounts, teamsSystemAccounts.DEBITI_VERSO_BANCHE_ACCOUNTS, false);
    stats.debiti_verso_fornitori = filterAndSum(
      accounts,
      teamsSystemAccounts.DEBITI_VERSO_FORNITORI_ACCOUNTS,false
    );
    stats.debiti_tributari = filterAndSum(
      accounts,
      teamsSystemAccounts.DEBITI_TRIBUTARI_ACCOUNTS,false
    );
    stats.debiti_previdenziali = filterAndSum(
      accounts,
      teamsSystemAccounts.DEBITI_PREVIDENZIALI_ACCOUNTS,false
    );
    stats.debiti_verso_dipendenti = filterAndSumByAccount(
      accounts,
      teamsSystemAccounts.DEBITI_VERSO_DIPENDENTI_ACCOUNTS,
      false
    );
    stats.altri_debiti = filterAndSumByAccount(
      accounts,
      teamsSystemAccounts.ALTRI_DEBITI_ACCOUNTS,
      false
    ) - stats.debiti_verso_dipendenti;
    stats.debiti_sum = stats.debiti_verso_banche + stats.debiti_verso_fornitori + stats.debiti_tributari + stats.debiti_previdenziali + stats.debiti_verso_dipendenti + stats.altri_debiti;
    //stats.indebitamento_netto_complessivo = stats.crediti_sum + stats.disponibilita_liquide - stats.trattamento_di_fine_rapporto - stats.debiti_sum;
    stats.indebitamento_netto_complessivo = stats.crediti_sum + stats.disponibilita_liquide + stats.trattamento_di_fine_rapporto +stats.debiti_sum;

    stats.materiali_e_materie_di_consumo = filterAndSum(
      accounts,
      MATERIALI_E_MATERIE_DI_CONSUMO_ACCOUNTS
    );
    stats.costi_rimanenze_iniziali = filterAndSum(
      accounts,
      COSTI_RIMANENZE_INIZIALI_ACCOUNTS
    );
    stats.costi_rimanenze_finali = filterAndSum(
      accounts,
      COSTI_RIMANENZE_FINALI_ACCOUNTS
    );

    // stats.variazione_delle_rimanenze_materie_prime = stats.costi_rimanenze_iniziali - stats.costi_rimanenze_finali;
    stats.costi_lavorazioni_di_terzi = filterAndSum(
      accounts,
      LAVORAZIONI_DI_TERZI_ACCOUNTS
    );
    stats.ricavi_delle_prestazioni_di_servizi = filterAndSum(
      accounts,
      RICAVI_DELLE_PRESTAZIONI_DI_SERVIZI_ACCOUNTS
    );
    // stats.costi_fissi = filterAndSum(accounts, COSTI_FISSI_ACCOUNTS);
    stats.rimanenze_iniziali = filterAndSum(
      accounts,
      RIMANENZE_INIZIALI_ACCOUNTS
    );
    stats.rimanenze_finali = filterAndSum(accounts, RIMANENZE_FINALI_ACCOUNTS);
    // stats.variazione_rimanze_semilav_e_prod_finiti = stats.rimanenze_finali - stats.rimanenze_iniziali;
    stats.costi_affitti_noleggi = filterAndSum(accounts, AFFITTI_NOLEGGI_ACCOUNTS, false);
    stats.costi_costo_dipendenti = filterAndSum(accounts, COSTO_DIPENDENTI_ACCOUNTS, false);
    stats.costi_oneri_diversi_di_gestione = filterAndSum(
      accounts,
      ONERI_DIVERSI_DI_GESTIONE_ACCOUNTS
    );
    stats.costi_altri_costi_per_servizi_generali_fissi = filterAndSum(
      accounts,
      ALTRI_COSTI_PER_SERVIZI_ACCOUNTS
    ) - stats.costi_lavorazioni_di_terzi;
    stats.ricavi = filterAndSum(accounts, RICAVI_ACCOUNT);
    stats.altri_ricavi_e_proventi_della_gestione = filterAndSum(
      accounts,
      ALTRI_RICAVI_E_PROVENTI_DELLA_GESTIONE_ACCOUNTS
    );
    stats.contributi_in_c_esercizio_o_in_c_capitale = filterAndSum(
      accounts,
      CONTRIBUTI_IN_C_ESERCIZIO_O_IN_C_CAPITALE_ACCOUNTS
    );
    stats.ricavi_totale_valore_della_produzione = stats.ricavi_delle_prestazioni_di_servizi + stats.ricavi + stats.variazione_rimanze_semilav_e_prod_finiti + stats.altri_ricavi_e_proventi_della_gestione + stats.contributi_in_c_esercizio_o_in_c_capitale;

    // stats.costi_variabili =
    //   stats.rimanenze_iniziali +
    //   stats.costi_lavorazioni_di_terzi +
    //   stats.costi_affitti_noleggi +
    //   stats.costi_costo_dipendenti +
    //   stats.costi_oneri_diversi_di_gestione +
    //   stats.materiali_e_materie_di_consumo +
    //   stats.costi_altri_costi_per_servizi_generali_fissi +
    //   stats.variazione_delle_rimanenze_materie_prime;
    stats.costi_fissi = stats.costi_altri_costi_per_servizi_generali_fissi + stats.costi_affitti_noleggi + stats.costi_costo_dipendenti + stats.costi_oneri_diversi_di_gestione
    stats.costi_variabili = stats.materiali_e_materie_di_consumo + stats.variazione_delle_rimanenze_materie_prime + stats.costi_lavorazioni_di_terzi;
    // stats.ebitda = stats.ricavi_totale_valore_della_produzione - stats.materiali_e_materie_di_consumo -stats.variazione_delle_rimanenze_materie_prime - stats.costi_lavorazioni_di_terzi - stats.costi_altri_costi_per_servizi_generali_fissi -stats.costi_affitti_noleggi - stats.costi_costo_dipendenti - stats.costi_oneri_diversi_di_gestione
    stats.ebitda = stats.ricavi_totale_valore_della_produzione - stats.costi_fissi - stats.costi_variabili;


    stats.proventi_di_natura_finanziaria = filterAndSum(
      accounts,
      PROVENTI_DI_NATURA_FINANZIARIA_ACCOUNTS
    );
    stats.oneri_finanziari = filterAndSum(
      accounts,
      ONERI_FINANZIARI_ACCOUNTS
    );
    const ammortamenti_svalutazioni_e_altri_accantonamenti_current_month = filterAndSum(
      accounts,
      AMMORTAMENTI_SVALUTAZIONI_E_ALTRI_ACCANTONAMENTI_ACCOUNTS
    );
    const ammortamenti_svalutazioni_e_altri_accantonamenti_preview_month = filterAndSum(
      lastMonthAccounts,
      AMMORTAMENTI_SVALUTAZIONI_E_ALTRI_ACCANTONAMENTI_ACCOUNTS
    );
    // stats.ammortamenti_svalutazioni_e_altri_accantonamenti = ammortamenti_svalutazioni_e_altri_accantonamenti_current_month - ammortamenti_svalutazioni_e_altri_accantonamenti_preview_month;
    
    stats.ammortamenti_svalutazioni_e_altri_accantonamenti = ammortamenti_svalutazioni_e_altri_accantonamenti_preview_month;
    stats.imposte_sul_reddito = filterAndSum(
      accounts,
      IMPOSTE_SUL_REDDITO_ACCOUNTS
    );
    stats.oneri_finanziari_e_oneri_bancari = stats.proventi_di_natura_finanziaria - stats.oneri_finanziari;
    stats.utile_del_periodo = stats.ebitda + stats.oneri_finanziari_e_oneri_bancari - stats.ammortamenti_svalutazioni_e_altri_accantonamenti - stats.imposte_sul_reddito;


    stats.crediti =
      stats.crediti_verso_clienti +
      stats.crediti_tributari +
      stats.crediti_previdenziali +
      stats.altri_crediti;
    const durata_media_del_credito = (stats.crediti_verso_clienti/((stats.ricavi + stats.ricavi_delle_prestazioni_di_servizi) * (1 + (teamSystemIva.value/100))) ) ;
    stats.durata_media_del_credito = isNaN(durata_media_del_credito) || !isFinite(durata_media_del_credito) ?  0 : (durata_media_del_credito * 365);
    stats.durata_media_del_credito = Math.round(stats.durata_media_del_credito)
    stats.break_even_point = stats.costi_fissi / (1-(stats.costi_variabili/(stats.ricavi + stats.ricavi_delle_prestazioni_di_servizi)));
    stats.profitto_netto = stats.ebitda - stats.costi_fissi;
    return stats;
  };

  const computeYTDSeries = ({
    timespan,
  }: {
    timespan: Timespan;
  }): TeamSystemOverAllChart => {
    const statsSeries = <TeamSystemOverAllChart>{
      ricavi: [],
      costi: [],
      ebitda: [],
      profitto_netto: [],
      costi_fissi: [],
      costi_variabili: [],
      utile_del_periodo:[],
      year: 0,
      month: 0,
    };
    YTDAccounts.value.map((i) => {
      const summary = computeSummary({ accounts: [i] });
      statsSeries.ricavi.push(summary.ricavi_totale_valore_della_produzione);
      statsSeries.costi.push(summary.costi_fissi + summary.costi_variabili);
      statsSeries.ebitda.push(summary.ebitda);
      statsSeries.profitto_netto.push(summary.ricavi_totale_valore_della_produzione - summary.costi_fissi);
      statsSeries.costi_fissi.push(summary.costi_fissi);
      statsSeries.costi_variabili.push(summary.costi_variabili);
      statsSeries.utile_del_periodo.push(summary.utile_del_periodo);
      statsSeries.year = i.year;
      statsSeries.month = i.month;
    });
    return statsSeries;
  };

  const computeSimpleYearSeries = ({ activeTimespan } : { activeTimespan: Timespan }) : TeamSystemSummary => {
    const focusAccounts = OverAllAccounts.value.filter(
      (a: any) =>
        activeTimespan.fits(a.period_date)
    );
    console.log({focusAccounts})
    return computeSummary({ accounts: focusAccounts });
  };


  const computeAllData = ({focusTimespan}: {focusTimespan:Timespan}): TeamSystemLastYearCurrentYearChart => {
    const lastYearCurrentYearStatsSeries = <
      TeamSystemLastYearCurrentYearChart
    >{
      durata_media_del_credito: {
        ytd_values: [],
        lytd_values: [],
        sum_ytd_value: 0,
        sum_lytd_value: 0,
      },
      ricavi: {
        ytd_values: [],
        lytd_values: [],
        sum_ytd_value: 0,
        sum_lytd_value: 0,
      },
      ricavi_totale_valore_della_produzione: {
        ytd_values: [],
        lytd_values: [],
        sum_ytd_value: 0,
        sum_lytd_value: 0,
      },
      costi: {
        ytd_values: [],
        lytd_values: [],
        sum_ytd_value: 0,
        sum_lytd_value: 0,
      },
      ebitda: {
        ytd_values: [],
        lytd_values: [],
        sum_ytd_value: 0,
        sum_lytd_value: 0,
      },
      profitto_netto: {
        ytd_values: [],
        lytd_values: [],
        sum_ytd_value: 0,
        sum_lytd_value: 0,
      },
      costi_fissi: {
        ytd_values: [],
        lytd_values: [],
        sum_ytd_value: 0,
        sum_lytd_value: 0,
      },
      costi_variabili: {
        ytd_values: [],
        lytd_values: [],
        sum_ytd_value: 0,
        sum_lytd_value: 0,
      },
      ricavi_delle_prestazioni_di_servizi: {
        ytd_values: [],
        lytd_values: [],
        sum_ytd_value: 0,
        sum_lytd_value: 0,
      },
      rimanenze_iniziali: {
        ytd_values: [],
        lytd_values: [],
        sum_ytd_value: 0,
        sum_lytd_value: 0,
      },
      rimanenze_finali: {
        ytd_values: [],
        lytd_values: [],
        sum_ytd_value: 0,
        sum_lytd_value: 0,
      },
      variazione_rimanze_semilav_e_prod_finiti: {
        ytd_values: [],
        lytd_values: [],
        sum_ytd_value: 0,
        sum_lytd_value: 0,
      },
      altri_ricavi_e_proventi_della_gestione: {
        ytd_values: [],
        lytd_values: [],
        sum_ytd_value: 0,
        sum_lytd_value: 0,
      },
      contributi_in_c_esercizio_o_in_c_capitale: {
        ytd_values: [],
        lytd_values: [],
        sum_ytd_value: 0,
        sum_lytd_value: 0,
      },
      materiali_e_materie_di_consumo: {
        sum_ytd_value: 0,
        sum_lytd_value: 0,
      },
      variazione_delle_rimanenze_materie_prime: {
        sum_ytd_value: 0,
        sum_lytd_value: 0,
      },
      costi_rimanenze_iniziali: {
        sum_ytd_value: 0,
        sum_lytd_value: 0,
      },
      costi_rimanenze_finali: {
        sum_ytd_value: 0,
        sum_lytd_value: 0,
      },
      costi_lavorazioni_di_terzi: {
        sum_ytd_value: 0,
        sum_lytd_value: 0,
      },
      costi_altri_costi_per_servizi_generali_fissi: {
        sum_ytd_value: 0,
        sum_lytd_value: 0,
      },
      costi_affitti_noleggi: {
        sum_ytd_value: 0,
        sum_lytd_value: 0,
      },
      costi_costo_dipendenti: {
        sum_ytd_value: 0,
        sum_lytd_value: 0,
      },
      costi_oneri_diversi_di_gestione: {
        sum_ytd_value: 0,
        sum_lytd_value: 0,
      },
      costi_ebitda: {
        sum_ytd_value: 0,
        sum_lytd_value: 0,
      },
      oneri_finanziari_e_oneri_bancari: {
        sum_ytd_value: 0,
        sum_lytd_value: 0,
      },
      proventi_di_natura_finanziaria: {
        sum_ytd_value: 0,
        sum_lytd_value: 0,
      },
      oneri_finanziari: {
        sum_ytd_value: 0,
        sum_lytd_value: 0,
      },
      ammortamenti_svalutazioni_e_altri_accantonamenti: {
        sum_ytd_value: 0,
        sum_lytd_value: 0,
      },
      imposte_sul_reddito: {
        sum_ytd_value: 0,
        sum_lytd_value: 0,
      },
      utile_del_periodo: {
        ytd_values: [],
        lytd_values: [],
        sum_ytd_value: 0,
        sum_lytd_value: 0,
      },
      crediti_sum: {
        sum_ytd_value: 0,
        sum_lytd_value: 0,
        ytd_values: [],
        lytd_values: [],
      },
      crediti_verso_clienti: {
        sum_ytd_value: 0,
        sum_lytd_value: 0,
      },
      crediti_tributari: {
        sum_ytd_value: 0,
        sum_lytd_value: 0,
      },
      crediti_previdenziali: {
        sum_ytd_value: 0,
        sum_lytd_value: 0,
      },
      altri_crediti: {
        sum_ytd_value: 0,
        sum_lytd_value: 0,
      },
      disponibilita_liquide: {
        sum_ytd_value: 0,
        sum_lytd_value: 0,
      },
      trattamento_di_fine_rapporto: {
        sum_ytd_value: 0,
        sum_lytd_value: 0,
      },
      debiti_sum: {
        sum_ytd_value: 0,
        sum_lytd_value: 0,
        ytd_values: [],
        lytd_values: [],
      },
      debiti_verso_banche: {
        sum_ytd_value: 0,
        sum_lytd_value: 0,
      },
      debiti_verso_fornitori: {
        sum_ytd_value: 0,
        sum_lytd_value: 0,
      },
      debiti_tributari: {
        sum_ytd_value: 0,
        sum_lytd_value: 0,
      },
      debiti_previdenziali: {
        sum_ytd_value: 0,
        sum_lytd_value: 0,
      },
      debiti_verso_dipendenti: {
        sum_ytd_value: 0,
        sum_lytd_value: 0,
      },
      altri_debiti: {
        sum_ytd_value: 0,
        sum_lytd_value: 0,
      },
      indebitamento_netto_complessivo: {
        sum_ytd_value: 0,
        sum_lytd_value: 0,
        ytd_values: [],
        lytd_values: [],
      },
    };
    let lastMonthDepreciation = 0
    Timespan.getMonthlyIntervals(focusTimespan).map((i) => {
      const monthAccounts = OverAllAccounts.value.filter(
        (a: any) =>
          i.fits(a.period_date) && a.period_year === i.from.getFullYear() && a.period_month === i.from.getMonth() + 1
      );
      const summary = computeSummary({ accounts: monthAccounts });
     
      lastYearCurrentYearStatsSeries.durata_media_del_credito.ytd_values.push(summary.durata_media_del_credito);
      lastYearCurrentYearStatsSeries.durata_media_del_credito.sum_ytd_value += summary.durata_media_del_credito;
      lastYearCurrentYearStatsSeries.ricavi_totale_valore_della_produzione.ytd_values.push(summary.ricavi_totale_valore_della_produzione)
      lastYearCurrentYearStatsSeries.ricavi_totale_valore_della_produzione.sum_ytd_value += summary.ricavi_totale_valore_della_produzione;
      lastYearCurrentYearStatsSeries.ricavi.ytd_values.push(summary.ricavi);
      lastYearCurrentYearStatsSeries.ricavi.sum_ytd_value += summary.ricavi;
      lastYearCurrentYearStatsSeries.costi.ytd_values.push(
        summary.costi_fissi + summary.costi_variabili
      );
      lastYearCurrentYearStatsSeries.costi.sum_ytd_value +=
        summary.costi_fissi + summary.costi_variabili;
      lastYearCurrentYearStatsSeries.ebitda.ytd_values.push(summary.ebitda);
      lastYearCurrentYearStatsSeries.ebitda.sum_ytd_value += summary.ebitda;
      lastYearCurrentYearStatsSeries.profitto_netto.ytd_values.push(
        summary.ricavi - summary.costi_fissi
      );
      lastYearCurrentYearStatsSeries.profitto_netto.sum_ytd_value +=
        summary.ricavi - summary.costi_fissi;
      lastYearCurrentYearStatsSeries.costi_fissi.ytd_values.push(
        summary.costi_fissi
      );
      lastYearCurrentYearStatsSeries.costi_fissi.sum_ytd_value +=
        summary.costi_fissi;
      lastYearCurrentYearStatsSeries.costi_variabili.ytd_values.push(
        summary.costi_variabili
      );
      lastYearCurrentYearStatsSeries.costi_variabili.sum_ytd_value +=
        summary.costi_variabili;
      lastYearCurrentYearStatsSeries.ricavi_delle_prestazioni_di_servizi.ytd_values.push(
        summary.ricavi_delle_prestazioni_di_servizi
      );
      lastYearCurrentYearStatsSeries.ricavi_delle_prestazioni_di_servizi.sum_ytd_value +=
        summary.ricavi_delle_prestazioni_di_servizi;
      lastYearCurrentYearStatsSeries.rimanenze_iniziali.ytd_values.push(
        summary.rimanenze_iniziali
      );
      lastYearCurrentYearStatsSeries.rimanenze_iniziali.sum_ytd_value +=
        summary.rimanenze_iniziali;
      lastYearCurrentYearStatsSeries.rimanenze_finali.ytd_values.push(
        summary.rimanenze_finali
      );
      lastYearCurrentYearStatsSeries.rimanenze_finali.sum_ytd_value +=
        summary.rimanenze_finali;
      lastYearCurrentYearStatsSeries.variazione_rimanze_semilav_e_prod_finiti.ytd_values.push(
        summary.variazione_rimanze_semilav_e_prod_finiti
      );
      lastYearCurrentYearStatsSeries.variazione_rimanze_semilav_e_prod_finiti.sum_ytd_value +=
        summary.variazione_rimanze_semilav_e_prod_finiti;
      lastYearCurrentYearStatsSeries.altri_ricavi_e_proventi_della_gestione.ytd_values.push(
        summary.altri_ricavi_e_proventi_della_gestione
      );
      lastYearCurrentYearStatsSeries.altri_ricavi_e_proventi_della_gestione.sum_ytd_value +=
        summary.altri_ricavi_e_proventi_della_gestione;
      lastYearCurrentYearStatsSeries.contributi_in_c_esercizio_o_in_c_capitale.ytd_values.push(
        summary.contributi_in_c_esercizio_o_in_c_capitale
      );
      lastYearCurrentYearStatsSeries.contributi_in_c_esercizio_o_in_c_capitale.sum_ytd_value +=
        summary.contributi_in_c_esercizio_o_in_c_capitale;
      lastYearCurrentYearStatsSeries.materiali_e_materie_di_consumo.sum_ytd_value += summary.materiali_e_materie_di_consumo;
      lastYearCurrentYearStatsSeries.variazione_delle_rimanenze_materie_prime.sum_ytd_value += summary.variazione_delle_rimanenze_materie_prime;
      lastYearCurrentYearStatsSeries.costi_rimanenze_iniziali.sum_ytd_value += summary.costi_rimanenze_iniziali;
      lastYearCurrentYearStatsSeries.costi_rimanenze_finali.sum_ytd_value += summary.costi_rimanenze_finali;
      lastYearCurrentYearStatsSeries.costi_lavorazioni_di_terzi.sum_ytd_value += summary.costi_lavorazioni_di_terzi;
      lastYearCurrentYearStatsSeries.costi_altri_costi_per_servizi_generali_fissi.sum_ytd_value += summary.costi_altri_costi_per_servizi_generali_fissi;
      lastYearCurrentYearStatsSeries.costi_affitti_noleggi.sum_ytd_value += summary.costi_affitti_noleggi;
      lastYearCurrentYearStatsSeries.costi_costo_dipendenti.sum_ytd_value += summary.costi_costo_dipendenti;
      lastYearCurrentYearStatsSeries.costi_oneri_diversi_di_gestione.sum_ytd_value += summary.costi_oneri_diversi_di_gestione;
      lastYearCurrentYearStatsSeries.costi_ebitda.sum_ytd_value += summary.costi_ebitda;
      lastYearCurrentYearStatsSeries.oneri_finanziari_e_oneri_bancari.sum_ytd_value += summary.oneri_finanziari_e_oneri_bancari;
      lastYearCurrentYearStatsSeries.proventi_di_natura_finanziaria.sum_ytd_value += summary.proventi_di_natura_finanziaria;
      lastYearCurrentYearStatsSeries.oneri_finanziari.sum_ytd_value += summary.oneri_finanziari;
      lastYearCurrentYearStatsSeries.ammortamenti_svalutazioni_e_altri_accantonamenti.sum_ytd_value += summary.ammortamenti_svalutazioni_e_altri_accantonamenti;
      lastMonthDepreciation = summary.ammortamenti_svalutazioni_e_altri_accantonamenti;

      lastYearCurrentYearStatsSeries.imposte_sul_reddito.sum_ytd_value += summary.imposte_sul_reddito;
      lastYearCurrentYearStatsSeries.utile_del_periodo.sum_ytd_value += summary.utile_del_periodo;
      lastYearCurrentYearStatsSeries.utile_del_periodo.ytd_values.push(
        summary.utile_del_periodo
      );

      
      // crediti
      lastYearCurrentYearStatsSeries.crediti_verso_clienti.sum_ytd_value += summary.crediti_verso_clienti;
      lastYearCurrentYearStatsSeries.crediti_tributari.sum_ytd_value += summary.crediti_tributari;
      lastYearCurrentYearStatsSeries.crediti_previdenziali.sum_ytd_value += summary.crediti_previdenziali;
      lastYearCurrentYearStatsSeries.altri_crediti.sum_ytd_value += summary.altri_crediti;
      lastYearCurrentYearStatsSeries.disponibilita_liquide.sum_ytd_value += summary.disponibilita_liquide;
      lastYearCurrentYearStatsSeries.trattamento_di_fine_rapporto.sum_ytd_value += summary.trattamento_di_fine_rapporto;
      lastYearCurrentYearStatsSeries.crediti_sum.sum_ytd_value += summary.crediti_sum;
      // debiti
      lastYearCurrentYearStatsSeries.debiti_verso_banche.sum_ytd_value += summary.debiti_verso_banche;
      lastYearCurrentYearStatsSeries.debiti_verso_fornitori.sum_ytd_value += summary.debiti_verso_fornitori;
      lastYearCurrentYearStatsSeries.debiti_tributari.sum_ytd_value += summary.debiti_tributari;
      lastYearCurrentYearStatsSeries.debiti_previdenziali.sum_ytd_value += summary.debiti_previdenziali;
      lastYearCurrentYearStatsSeries.debiti_verso_dipendenti.sum_ytd_value += summary.debiti_verso_dipendenti;
      lastYearCurrentYearStatsSeries.altri_debiti.sum_ytd_value += summary.altri_debiti;
      lastYearCurrentYearStatsSeries.debiti_sum.sum_ytd_value += summary.debiti_sum;
      lastYearCurrentYearStatsSeries.debiti_sum.ytd_values.push(summary.debiti_sum);
      lastYearCurrentYearStatsSeries.indebitamento_netto_complessivo.sum_ytd_value += summary.indebitamento_netto_complessivo;
      lastYearCurrentYearStatsSeries.indebitamento_netto_complessivo.ytd_values.push(
        Math.abs(summary.altri_ricavi_e_proventi_della_gestione)
      );
    });
    lastYearCurrentYearStatsSeries.utile_del_periodo.sum_ytd_value += lastYearCurrentYearStatsSeries.ammortamenti_svalutazioni_e_altri_accantonamenti.sum_ytd_value - lastMonthDepreciation;
    lastYearCurrentYearStatsSeries.ammortamenti_svalutazioni_e_altri_accantonamenti.sum_ytd_value=lastMonthDepreciation;

    return lastYearCurrentYearStatsSeries;
  }

  const computeLastYearCurrentYearSeries = ({}: {}): TeamSystemLastYearCurrentYearChart => {
      const lastYearCurrentYearStatsSeries = <
        TeamSystemLastYearCurrentYearChart
      >{
        durata_media_del_credito: {
          ytd_values: [],
          lytd_values: [],
          sum_ytd_value: 0,
          sum_lytd_value: 0,
        },
        ricavi: {
          ytd_values: [],
          lytd_values: [],
          sum_ytd_value: 0,
          sum_lytd_value: 0,
        },
        ricavi_totale_valore_della_produzione: {
          ytd_values: [],
          lytd_values: [],
          sum_ytd_value: 0,
          sum_lytd_value: 0,
        },
        costi: {
          ytd_values: [],
          lytd_values: [],
          sum_ytd_value: 0,
          sum_lytd_value: 0,
        },
        ebitda: {
          ytd_values: [],
          lytd_values: [],
          sum_ytd_value: 0,
          sum_lytd_value: 0,
        },
        profitto_netto: {
          ytd_values: [],
          lytd_values: [],
          sum_ytd_value: 0,
          sum_lytd_value: 0,
        },
        costi_fissi: {
          ytd_values: [],
          lytd_values: [],
          sum_ytd_value: 0,
          sum_lytd_value: 0,
        },
        costi_variabili: {
          ytd_values: [],
          lytd_values: [],
          sum_ytd_value: 0,
          sum_lytd_value: 0,
        },
        ricavi_delle_prestazioni_di_servizi: {
          ytd_values: [],
          lytd_values: [],
          sum_ytd_value: 0,
          sum_lytd_value: 0,
        },
        rimanenze_iniziali: {
          ytd_values: [],
          lytd_values: [],
          sum_ytd_value: 0,
          sum_lytd_value: 0,
        },
        rimanenze_finali: {
          ytd_values: [],
          lytd_values: [],
          sum_ytd_value: 0,
          sum_lytd_value: 0,
        },
        variazione_rimanze_semilav_e_prod_finiti: {
          ytd_values: [],
          lytd_values: [],
          sum_ytd_value: 0,
          sum_lytd_value: 0,
        },
        altri_ricavi_e_proventi_della_gestione: {
          ytd_values: [],
          lytd_values: [],
          sum_ytd_value: 0,
          sum_lytd_value: 0,
        },
        contributi_in_c_esercizio_o_in_c_capitale: {
          ytd_values: [],
          lytd_values: [],
          sum_ytd_value: 0,
          sum_lytd_value: 0,
        },
        materiali_e_materie_di_consumo: {
          sum_ytd_value: 0,
          sum_lytd_value: 0,
        },
        variazione_delle_rimanenze_materie_prime: {
          sum_ytd_value: 0,
          sum_lytd_value: 0,
        },
        costi_rimanenze_iniziali: {
          sum_ytd_value: 0,
          sum_lytd_value: 0,
        },
        costi_rimanenze_finali: {
          sum_ytd_value: 0,
          sum_lytd_value: 0,
        },
        costi_lavorazioni_di_terzi: {
          sum_ytd_value: 0,
          sum_lytd_value: 0,
        },
        costi_altri_costi_per_servizi_generali_fissi: {
          sum_ytd_value: 0,
          sum_lytd_value: 0,
        },
        costi_affitti_noleggi: {
          sum_ytd_value: 0,
          sum_lytd_value: 0,
        },
        costi_costo_dipendenti: {
          sum_ytd_value: 0,
          sum_lytd_value: 0,
        },
        costi_oneri_diversi_di_gestione: {
          sum_ytd_value: 0,
          sum_lytd_value: 0,
        },
        costi_ebitda: {
          sum_ytd_value: 0,
          sum_lytd_value: 0,
        },
        oneri_finanziari_e_oneri_bancari: {
          sum_ytd_value: 0,
          sum_lytd_value: 0,
        },
        proventi_di_natura_finanziaria: {
          sum_ytd_value: 0,
          sum_lytd_value: 0,
        },
        oneri_finanziari: {
          sum_ytd_value: 0,
          sum_lytd_value: 0,
        },
        ammortamenti_svalutazioni_e_altri_accantonamenti: {
          sum_ytd_value: 0,
          sum_lytd_value: 0,
        },
        imposte_sul_reddito: {
          sum_ytd_value: 0,
          sum_lytd_value: 0,
        },
        utile_del_periodo: {
          ytd_values: [],
          lytd_values: [],
          sum_ytd_value: 0,
          sum_lytd_value: 0,
        },
        crediti_sum: {
          sum_ytd_value: 0,
          sum_lytd_value: 0,
          ytd_values: [],
          lytd_values: [],
        },
        crediti_verso_clienti: {
          sum_ytd_value: 0,
          sum_lytd_value: 0,
        },
        crediti_tributari: {
          sum_ytd_value: 0,
          sum_lytd_value: 0,
        },
        crediti_previdenziali: {
          sum_ytd_value: 0,
          sum_lytd_value: 0,
        },
        altri_crediti: {
          sum_ytd_value: 0,
          sum_lytd_value: 0,
        },
        disponibilita_liquide: {
          sum_ytd_value: 0,
          sum_lytd_value: 0,
        },
        trattamento_di_fine_rapporto: {
          sum_ytd_value: 0,
          sum_lytd_value: 0,
        },
        debiti_sum: {
          sum_ytd_value: 0,
          sum_lytd_value: 0,
          ytd_values: [],
          lytd_values: [],
        },
        debiti_verso_banche: {
          sum_ytd_value: 0,
          sum_lytd_value: 0,
        },
        debiti_verso_fornitori: {
          sum_ytd_value: 0,
          sum_lytd_value: 0,
        },
        debiti_tributari: {
          sum_ytd_value: 0,
          sum_lytd_value: 0,
        },
        debiti_previdenziali: {
          sum_ytd_value: 0,
          sum_lytd_value: 0,
        },
        debiti_verso_dipendenti: {
          sum_ytd_value: 0,
          sum_lytd_value: 0,
        },
        altri_debiti: {
          sum_ytd_value: 0,
          sum_lytd_value: 0,
        },
        indebitamento_netto_complessivo: {
          sum_ytd_value: 0,
          sum_lytd_value: 0,
          ytd_values: [],
          lytd_values: [],
        },
        credit_debit:{
          sum_ytd_value: 0,
          sum_lytd_value: 0,
          ytd_values: [],
          lytd_values: [],
        }
      };
      let ytdlastMonthDepreciation = 0;
      Timespan.getMonthlyIntervals(lastQuartersTimespan.value).map((i) => {
        const monthAccounts = lastFullyEndedNQuartersAccounts.value.filter(
          (a: any) =>
            i.fits(a.period_date)
        );
        // console.log("month",i)
        const summary = computeSummary({ accounts: monthAccounts });
        lastYearCurrentYearStatsSeries.durata_media_del_credito.ytd_values.push(summary.durata_media_del_credito);
        lastYearCurrentYearStatsSeries.durata_media_del_credito.sum_ytd_value += summary.durata_media_del_credito;
        lastYearCurrentYearStatsSeries.ricavi_totale_valore_della_produzione.ytd_values.push(summary.ricavi_totale_valore_della_produzione)
        lastYearCurrentYearStatsSeries.ricavi_totale_valore_della_produzione.sum_ytd_value += summary.ricavi_totale_valore_della_produzione;
        lastYearCurrentYearStatsSeries.ricavi.ytd_values.push(summary.ricavi);
        lastYearCurrentYearStatsSeries.ricavi.sum_ytd_value += summary.ricavi;
        lastYearCurrentYearStatsSeries.costi.ytd_values.push(
          summary.costi_fissi + summary.costi_variabili
        );
        lastYearCurrentYearStatsSeries.costi.sum_ytd_value +=
          summary.costi_fissi + summary.costi_variabili;
        lastYearCurrentYearStatsSeries.ebitda.ytd_values.push(summary.ebitda);
        lastYearCurrentYearStatsSeries.ebitda.sum_ytd_value += summary.ebitda;
        lastYearCurrentYearStatsSeries.profitto_netto.ytd_values.push(
          summary.ricavi - summary.costi_fissi
        );
        lastYearCurrentYearStatsSeries.profitto_netto.sum_ytd_value +=
          summary.ricavi - summary.costi_fissi;
        lastYearCurrentYearStatsSeries.costi_fissi.ytd_values.push(
          summary.costi_fissi
        );
        lastYearCurrentYearStatsSeries.costi_fissi.sum_ytd_value +=
          summary.costi_fissi;
        lastYearCurrentYearStatsSeries.costi_variabili.ytd_values.push(
          summary.costi_variabili
        );
        lastYearCurrentYearStatsSeries.costi_variabili.sum_ytd_value +=
          summary.costi_variabili;
        lastYearCurrentYearStatsSeries.ricavi_delle_prestazioni_di_servizi.ytd_values.push(
          summary.ricavi_delle_prestazioni_di_servizi
        );
        lastYearCurrentYearStatsSeries.ricavi_delle_prestazioni_di_servizi.sum_ytd_value +=
          summary.ricavi_delle_prestazioni_di_servizi;
        lastYearCurrentYearStatsSeries.rimanenze_iniziali.ytd_values.push(
          summary.rimanenze_iniziali
        );
        lastYearCurrentYearStatsSeries.rimanenze_iniziali.sum_ytd_value +=
          summary.rimanenze_iniziali;
        lastYearCurrentYearStatsSeries.rimanenze_finali.ytd_values.push(
          summary.rimanenze_finali
        );
        lastYearCurrentYearStatsSeries.rimanenze_finali.sum_ytd_value +=
          summary.rimanenze_finali;
        lastYearCurrentYearStatsSeries.variazione_rimanze_semilav_e_prod_finiti.ytd_values.push(
          summary.variazione_rimanze_semilav_e_prod_finiti
        );
        lastYearCurrentYearStatsSeries.variazione_rimanze_semilav_e_prod_finiti.sum_ytd_value +=
          summary.variazione_rimanze_semilav_e_prod_finiti;
        lastYearCurrentYearStatsSeries.altri_ricavi_e_proventi_della_gestione.ytd_values.push(
          summary.altri_ricavi_e_proventi_della_gestione
        );
        lastYearCurrentYearStatsSeries.altri_ricavi_e_proventi_della_gestione.sum_ytd_value +=
          summary.altri_ricavi_e_proventi_della_gestione;
        lastYearCurrentYearStatsSeries.contributi_in_c_esercizio_o_in_c_capitale.ytd_values.push(
          summary.contributi_in_c_esercizio_o_in_c_capitale
        );
        lastYearCurrentYearStatsSeries.contributi_in_c_esercizio_o_in_c_capitale.sum_ytd_value +=
          summary.contributi_in_c_esercizio_o_in_c_capitale;
        lastYearCurrentYearStatsSeries.materiali_e_materie_di_consumo.sum_ytd_value += summary.materiali_e_materie_di_consumo;
        lastYearCurrentYearStatsSeries.variazione_delle_rimanenze_materie_prime.sum_ytd_value += summary.variazione_delle_rimanenze_materie_prime;
        lastYearCurrentYearStatsSeries.costi_rimanenze_iniziali.sum_ytd_value += summary.costi_rimanenze_iniziali;
        lastYearCurrentYearStatsSeries.costi_rimanenze_finali.sum_ytd_value += summary.costi_rimanenze_finali;
        lastYearCurrentYearStatsSeries.costi_lavorazioni_di_terzi.sum_ytd_value += summary.costi_lavorazioni_di_terzi;
        lastYearCurrentYearStatsSeries.costi_altri_costi_per_servizi_generali_fissi.sum_ytd_value += summary.costi_altri_costi_per_servizi_generali_fissi;
        lastYearCurrentYearStatsSeries.costi_affitti_noleggi.sum_ytd_value += summary.costi_affitti_noleggi;
        lastYearCurrentYearStatsSeries.costi_costo_dipendenti.sum_ytd_value += summary.costi_costo_dipendenti;
        lastYearCurrentYearStatsSeries.costi_oneri_diversi_di_gestione.sum_ytd_value += summary.costi_oneri_diversi_di_gestione;
        lastYearCurrentYearStatsSeries.costi_ebitda.sum_ytd_value += summary.costi_ebitda;
        lastYearCurrentYearStatsSeries.oneri_finanziari_e_oneri_bancari.sum_ytd_value += summary.oneri_finanziari_e_oneri_bancari;
        lastYearCurrentYearStatsSeries.proventi_di_natura_finanziaria.sum_ytd_value += summary.proventi_di_natura_finanziaria;
        lastYearCurrentYearStatsSeries.oneri_finanziari.sum_ytd_value += summary.oneri_finanziari;
        lastYearCurrentYearStatsSeries.ammortamenti_svalutazioni_e_altri_accantonamenti.sum_ytd_value += summary.ammortamenti_svalutazioni_e_altri_accantonamenti;
        ytdlastMonthDepreciation = summary.ammortamenti_svalutazioni_e_altri_accantonamenti;
        lastYearCurrentYearStatsSeries.imposte_sul_reddito.sum_ytd_value += summary.imposte_sul_reddito;
        lastYearCurrentYearStatsSeries.utile_del_periodo.sum_ytd_value += summary.utile_del_periodo;
        lastYearCurrentYearStatsSeries.utile_del_periodo.ytd_values.push(
          summary.utile_del_periodo
        );

        // crediti
        lastYearCurrentYearStatsSeries.crediti_verso_clienti.sum_ytd_value += summary.crediti_verso_clienti;
        lastYearCurrentYearStatsSeries.crediti_tributari.sum_ytd_value += summary.crediti_tributari;
        lastYearCurrentYearStatsSeries.crediti_previdenziali.sum_ytd_value += summary.crediti_previdenziali;
        lastYearCurrentYearStatsSeries.altri_crediti.sum_ytd_value += summary.altri_crediti;
        lastYearCurrentYearStatsSeries.disponibilita_liquide.sum_ytd_value += summary.disponibilita_liquide;
        lastYearCurrentYearStatsSeries.trattamento_di_fine_rapporto.sum_ytd_value += summary.trattamento_di_fine_rapporto;
        lastYearCurrentYearStatsSeries.crediti_sum.sum_ytd_value += summary.crediti_sum;
        lastYearCurrentYearStatsSeries.crediti_sum.ytd_values.push(summary.crediti_sum);
        // debiti
        lastYearCurrentYearStatsSeries.debiti_verso_banche.sum_ytd_value += summary.debiti_verso_banche;
        lastYearCurrentYearStatsSeries.debiti_verso_fornitori.sum_ytd_value += summary.debiti_verso_fornitori;
        lastYearCurrentYearStatsSeries.debiti_tributari.sum_ytd_value += summary.debiti_tributari;
        lastYearCurrentYearStatsSeries.debiti_previdenziali.sum_ytd_value += summary.debiti_previdenziali;
        lastYearCurrentYearStatsSeries.debiti_verso_dipendenti.sum_ytd_value += summary.debiti_verso_dipendenti;
        lastYearCurrentYearStatsSeries.altri_debiti.sum_ytd_value += summary.altri_debiti;
        lastYearCurrentYearStatsSeries.debiti_sum.sum_ytd_value += summary.debiti_sum;
        lastYearCurrentYearStatsSeries.debiti_sum.ytd_values.push(summary.debiti_sum);
        lastYearCurrentYearStatsSeries.indebitamento_netto_complessivo.sum_ytd_value += summary.indebitamento_netto_complessivo;
        lastYearCurrentYearStatsSeries.indebitamento_netto_complessivo.ytd_values.push(
          Math.abs(summary.altri_ricavi_e_proventi_della_gestione)
        );
        lastYearCurrentYearStatsSeries.credit_debit.ytd_values.push(summary.crediti_sum - summary.debiti_sum);

      });
      let lytdlastMonthDepreciation = 0;
      Timespan.getMonthlyIntervals(lastYearQuartersTimespan.value).map((i) => {
        const lastYearMonthAccounts = lastYearFullyEndedNQuartersAccounts.value.filter(
          (a: any) =>
            i.fits(a.period_date)
        );
        const lastYearSummary = computeSummary({
          accounts: lastYearMonthAccounts,
        });
        lastYearCurrentYearStatsSeries.durata_media_del_credito.lytd_values.push(lastYearSummary.durata_media_del_credito);
        lastYearCurrentYearStatsSeries.durata_media_del_credito.sum_lytd_value += lastYearSummary.durata_media_del_credito;
        lastYearCurrentYearStatsSeries.ricavi.lytd_values.push(
          lastYearSummary.ricavi
        );
        lastYearCurrentYearStatsSeries.ricavi.sum_lytd_value +=
          lastYearSummary.ricavi;
        lastYearCurrentYearStatsSeries.ricavi_totale_valore_della_produzione.lytd_values.push(lastYearSummary.ricavi_totale_valore_della_produzione)
        lastYearCurrentYearStatsSeries.ricavi_totale_valore_della_produzione.sum_lytd_value += lastYearSummary.ricavi_totale_valore_della_produzione;
        lastYearCurrentYearStatsSeries.costi.lytd_values.push(
          lastYearSummary.costi_fissi + lastYearSummary.costi_variabili
        );
        lastYearCurrentYearStatsSeries.costi.sum_lytd_value +=
          lastYearSummary.costi_fissi + lastYearSummary.costi_variabili;
        lastYearCurrentYearStatsSeries.ebitda.lytd_values.push(
          lastYearSummary.ebitda
        );
        lastYearCurrentYearStatsSeries.ebitda.sum_lytd_value +=
          lastYearSummary.ebitda;
        lastYearCurrentYearStatsSeries.profitto_netto.lytd_values.push(
          lastYearSummary.ricavi - lastYearSummary.costi_fissi
        );
        lastYearCurrentYearStatsSeries.profitto_netto.sum_lytd_value +=
          lastYearSummary.ricavi - lastYearSummary.costi_fissi;
        lastYearCurrentYearStatsSeries.costi_fissi.lytd_values.push(
          lastYearSummary.costi_fissi
        );
        lastYearCurrentYearStatsSeries.costi_fissi.sum_lytd_value +=
          lastYearSummary.costi_fissi;
        lastYearCurrentYearStatsSeries.costi_variabili.lytd_values.push(
          lastYearSummary.costi_variabili
        );
        lastYearCurrentYearStatsSeries.costi_variabili.sum_lytd_value +=
          lastYearSummary.costi_variabili;
        lastYearCurrentYearStatsSeries.ricavi_delle_prestazioni_di_servizi.lytd_values.push(
          lastYearSummary.ricavi_delle_prestazioni_di_servizi
        );
        lastYearCurrentYearStatsSeries.ricavi_delle_prestazioni_di_servizi.sum_lytd_value +=
          lastYearSummary.ricavi_delle_prestazioni_di_servizi;
        lastYearCurrentYearStatsSeries.rimanenze_iniziali.lytd_values.push(
          lastYearSummary.rimanenze_iniziali
        );
        lastYearCurrentYearStatsSeries.rimanenze_iniziali.sum_lytd_value +=
          lastYearSummary.rimanenze_iniziali;
        lastYearCurrentYearStatsSeries.rimanenze_finali.lytd_values.push(
          lastYearSummary.rimanenze_finali
        );
        lastYearCurrentYearStatsSeries.rimanenze_finali.sum_lytd_value +=
          lastYearSummary.rimanenze_finali;
        lastYearCurrentYearStatsSeries.variazione_rimanze_semilav_e_prod_finiti.lytd_values.push(
          lastYearSummary.variazione_rimanze_semilav_e_prod_finiti
        );
        lastYearCurrentYearStatsSeries.variazione_rimanze_semilav_e_prod_finiti.sum_lytd_value +=
          lastYearSummary.variazione_rimanze_semilav_e_prod_finiti;
        lastYearCurrentYearStatsSeries.altri_ricavi_e_proventi_della_gestione.lytd_values.push(
          lastYearSummary.altri_ricavi_e_proventi_della_gestione
        );
        lastYearCurrentYearStatsSeries.altri_ricavi_e_proventi_della_gestione.sum_lytd_value +=
          lastYearSummary.altri_ricavi_e_proventi_della_gestione;
        lastYearCurrentYearStatsSeries.contributi_in_c_esercizio_o_in_c_capitale.lytd_values.push(
          lastYearSummary.contributi_in_c_esercizio_o_in_c_capitale
        );
        lastYearCurrentYearStatsSeries.contributi_in_c_esercizio_o_in_c_capitale.sum_lytd_value +=
          lastYearSummary.contributi_in_c_esercizio_o_in_c_capitale;
        lastYearCurrentYearStatsSeries.materiali_e_materie_di_consumo.sum_lytd_value += lastYearSummary.materiali_e_materie_di_consumo;
        lastYearCurrentYearStatsSeries.variazione_delle_rimanenze_materie_prime.sum_lytd_value += lastYearSummary.variazione_delle_rimanenze_materie_prime;
        lastYearCurrentYearStatsSeries.costi_rimanenze_iniziali.sum_lytd_value += lastYearSummary.costi_rimanenze_iniziali;
        lastYearCurrentYearStatsSeries.costi_rimanenze_finali.sum_lytd_value += lastYearSummary.costi_rimanenze_finali;
        lastYearCurrentYearStatsSeries.costi_lavorazioni_di_terzi.sum_lytd_value += lastYearSummary.costi_lavorazioni_di_terzi;
        lastYearCurrentYearStatsSeries.costi_altri_costi_per_servizi_generali_fissi.sum_lytd_value += lastYearSummary.costi_altri_costi_per_servizi_generali_fissi;
        lastYearCurrentYearStatsSeries.costi_affitti_noleggi.sum_lytd_value += lastYearSummary.costi_affitti_noleggi;
        lastYearCurrentYearStatsSeries.costi_costo_dipendenti.sum_lytd_value += lastYearSummary.costi_costo_dipendenti;
        lastYearCurrentYearStatsSeries.costi_oneri_diversi_di_gestione.sum_lytd_value += lastYearSummary.costi_oneri_diversi_di_gestione;
        lastYearCurrentYearStatsSeries.costi_ebitda.sum_lytd_value += lastYearSummary.costi_ebitda;
        lastYearCurrentYearStatsSeries.oneri_finanziari_e_oneri_bancari.sum_lytd_value += lastYearSummary.oneri_finanziari_e_oneri_bancari;
        lastYearCurrentYearStatsSeries.proventi_di_natura_finanziaria.sum_lytd_value += lastYearSummary.proventi_di_natura_finanziaria;
        lastYearCurrentYearStatsSeries.oneri_finanziari.sum_lytd_value += lastYearSummary.oneri_finanziari;
        lastYearCurrentYearStatsSeries.ammortamenti_svalutazioni_e_altri_accantonamenti.sum_lytd_value += lastYearSummary.ammortamenti_svalutazioni_e_altri_accantonamenti;
        lytdlastMonthDepreciation = lastYearSummary.ammortamenti_svalutazioni_e_altri_accantonamenti;
        lastYearCurrentYearStatsSeries.imposte_sul_reddito.sum_lytd_value += lastYearSummary.imposte_sul_reddito;
        lastYearCurrentYearStatsSeries.utile_del_periodo.sum_lytd_value += lastYearSummary.utile_del_periodo;
        lastYearCurrentYearStatsSeries.utile_del_periodo.lytd_values.push(
          lastYearSummary.utile_del_periodo
        );
        // crediti
        lastYearCurrentYearStatsSeries.crediti_verso_clienti.sum_lytd_value += lastYearSummary.crediti_verso_clienti;
        lastYearCurrentYearStatsSeries.crediti_tributari.sum_lytd_value += lastYearSummary.crediti_tributari;
        lastYearCurrentYearStatsSeries.crediti_previdenziali.sum_lytd_value += lastYearSummary.crediti_previdenziali;
        lastYearCurrentYearStatsSeries.altri_crediti.sum_lytd_value += lastYearSummary.altri_crediti;
        lastYearCurrentYearStatsSeries.disponibilita_liquide.sum_lytd_value += lastYearSummary.disponibilita_liquide;
        lastYearCurrentYearStatsSeries.trattamento_di_fine_rapporto.sum_lytd_value += lastYearSummary.trattamento_di_fine_rapporto;
        lastYearCurrentYearStatsSeries.crediti_sum.sum_lytd_value += lastYearSummary.crediti_sum;
        // debiti
        lastYearCurrentYearStatsSeries.debiti_verso_banche.sum_lytd_value += lastYearSummary.debiti_verso_banche;
        lastYearCurrentYearStatsSeries.debiti_verso_fornitori.sum_lytd_value += lastYearSummary.debiti_verso_fornitori;
        lastYearCurrentYearStatsSeries.debiti_tributari.sum_lytd_value += lastYearSummary.debiti_tributari;
        lastYearCurrentYearStatsSeries.debiti_previdenziali.sum_lytd_value += lastYearSummary.debiti_previdenziali;
        lastYearCurrentYearStatsSeries.debiti_verso_dipendenti.sum_lytd_value += lastYearSummary.debiti_verso_dipendenti;
        lastYearCurrentYearStatsSeries.altri_debiti.sum_lytd_value += lastYearSummary.altri_debiti;
        lastYearCurrentYearStatsSeries.debiti_sum.sum_lytd_value += lastYearSummary.debiti_sum;
        lastYearCurrentYearStatsSeries.debiti_sum.lytd_values.push(
          Math.abs(lastYearSummary.debiti_sum)
        );
        lastYearCurrentYearStatsSeries.indebitamento_netto_complessivo.sum_lytd_value += lastYearSummary.indebitamento_netto_complessivo;
        lastYearCurrentYearStatsSeries.indebitamento_netto_complessivo.lytd_values.push(
          Math.abs(lastYearSummary.altri_ricavi_e_proventi_della_gestione)
        );
        lastYearCurrentYearStatsSeries.credit_debit.lytd_values.push(lastYearSummary.crediti_sum - lastYearSummary.debiti_sum);
      });
      lastYearCurrentYearStatsSeries.utile_del_periodo.sum_ytd_value += lastYearCurrentYearStatsSeries.ammortamenti_svalutazioni_e_altri_accantonamenti.sum_ytd_value - ytdlastMonthDepreciation;
      lastYearCurrentYearStatsSeries.ammortamenti_svalutazioni_e_altri_accantonamenti.sum_ytd_value=ytdlastMonthDepreciation;

      lastYearCurrentYearStatsSeries.utile_del_periodo.sum_lytd_value += lastYearCurrentYearStatsSeries.ammortamenti_svalutazioni_e_altri_accantonamenti.sum_lytd_value - lytdlastMonthDepreciation;
      lastYearCurrentYearStatsSeries.ammortamenti_svalutazioni_e_altri_accantonamenti.sum_lytd_value=lytdlastMonthDepreciation;
 

      return lastYearCurrentYearStatsSeries;
    };

  const getLastAvailableDate = () => {
    return lastAvailableDate.value;
  }
  const getHaveData = () => {
    return haveData.value;
  }
  return {
    accounts: TSAccounts,
    hasCache,
    fetching,
    teamSystemSelectedDittaId,
    lastSynchronizationDate,
    teamsystemFetch,
    computeSummary,
    computeStatsSeries,
    computeSimpleYearSeries,
    computeSummaryMonthly,
    computeYTDSeries,
    computeLastYearCurrentYearSeries,
    getReportConfig,
    saveReportConfig,
    getLastAvailableDate,
    computeAllData,
    getHaveData,
  };
});
