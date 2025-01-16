import l from "lodash";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import Timespan from "../timespan";
import * as teamsSystemAccounts from "../../composables/store/teamsystemAccounts.js";
import { teamsystemAggregatationMode } from "../types/teamsystem_types";

function sumAttributes(obj1 :any, obj2:any, ignoreKeys: string[] = []) {
  for (let key in obj1) {
    if (obj1.hasOwnProperty(key) && obj2.hasOwnProperty(key) && !ignoreKeys.includes(key)) {
      obj1[key] = obj1[key] + obj2[key];
    }
  }
  return obj1;
}

const now = new Date();
const lastYearToday = new Date(now.getFullYear() - 1, now.getMonth(), 1);
const lastQuartersTimespan = Timespan.getLastFullyEndedNQuartersBounds(now, 4);
const lastYearQuartersTimespan = Timespan.getLastFullyEndedNQuartersBounds(
  lastYearToday,
  4
);
const yearToDayTimespan = new Timespan(
  new Date(now.getFullYear(), 0, 1),
  new Date(`${now.getFullYear()}-${now.getMonth() - 1}-01`) // last day of the previous month
);
const lastYearTimespan = new Timespan(
  new Date(now.getFullYear() - 1, 0, 1, 0, 0, 0),
  new Date(now.getFullYear(), 0, 0, 23, 59, 59)
);
const thisYear = now.getFullYear();
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

const computeStatsSeries = ({
  timespan,
  accounts,
  iva,
}: {
  timespan: Timespan;
  accounts: any[];
  iva: number;
}) => {
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
    const monthAccounts = accounts.filter(
      (a: any) =>
        a.period_month === i.from.getMonth() + 1 &&
        a.period_year === i.from.getFullYear()
    );
    const summary = computeSummary({ accounts: monthAccounts, iva: iva });
    statsSeries.ricavi.push(summary.ricavi_totale_valore_della_produzione);
    statsSeries.costi.push(summary.costi_fissi + summary.costi_variabili);
    statsSeries.ebitda.push(summary.ebitda);
    statsSeries.profitto_netto.push(
      summary.ricavi_totale_valore_della_produzione - summary.costi_fissi
    );
    statsSeries.costi_fissi.push(summary.costi_fissi);
    statsSeries.costi_variabili.push(summary.costi_variabili);
    statsSeries.utile_del_periodo.push(summary.utile_del_periodo);
    statsSeries.year = i.from.getFullYear();
    statsSeries.month = i.from.getMonth() + 1;
  });
  return statsSeries;
};

const computeLastYearCurrentYearSeries = ({
  accounts,
  iva,
  mode,
}: {
  accounts: any[];
  iva: number;
  mode: string,
}): TeamSystemLastYearCurrentYearChart => {
  const lastYearCurrentYearStatsSeries = <TeamSystemLastYearCurrentYearChart>{
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
  let ytdlastMonthDepreciation = 0;
  const lastQuartersTimespanIntervals = mode === teamsystemAggregatationMode.QUARTERLY ? Timespan.getQuarterlyIntervals(lastQuartersTimespan) : Timespan.getMonthlyIntervals(lastQuartersTimespan);
  lastQuartersTimespanIntervals.map((i) => {
    const monthAccounts = accounts.filter(
      (a: any) => i.fits(a.period_date)
    );
    const summary = computeSummary({ accounts: monthAccounts, iva: iva });
    lastYearCurrentYearStatsSeries.durata_media_del_credito.ytd_values.push(
      summary.durata_media_del_credito
    );
    lastYearCurrentYearStatsSeries.durata_media_del_credito.sum_ytd_value +=
      summary.durata_media_del_credito;
    lastYearCurrentYearStatsSeries.ricavi_totale_valore_della_produzione.ytd_values.push(
      summary.ricavi_totale_valore_della_produzione
    );
    lastYearCurrentYearStatsSeries.ricavi_totale_valore_della_produzione.sum_ytd_value +=
      summary.ricavi_totale_valore_della_produzione;
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
    lastYearCurrentYearStatsSeries.materiali_e_materie_di_consumo.sum_ytd_value +=
      summary.materiali_e_materie_di_consumo;
    lastYearCurrentYearStatsSeries.variazione_delle_rimanenze_materie_prime.sum_ytd_value +=
      summary.variazione_delle_rimanenze_materie_prime;
    lastYearCurrentYearStatsSeries.costi_rimanenze_iniziali.sum_ytd_value +=
      summary.costi_rimanenze_iniziali;
    lastYearCurrentYearStatsSeries.costi_rimanenze_finali.sum_ytd_value +=
      summary.costi_rimanenze_finali;
    lastYearCurrentYearStatsSeries.costi_lavorazioni_di_terzi.sum_ytd_value +=
      summary.costi_lavorazioni_di_terzi;
    lastYearCurrentYearStatsSeries.costi_altri_costi_per_servizi_generali_fissi.sum_ytd_value +=
      summary.costi_altri_costi_per_servizi_generali_fissi;
    lastYearCurrentYearStatsSeries.costi_affitti_noleggi.sum_ytd_value +=
      summary.costi_affitti_noleggi;
    lastYearCurrentYearStatsSeries.costi_costo_dipendenti.sum_ytd_value +=
      summary.costi_costo_dipendenti;
    lastYearCurrentYearStatsSeries.costi_oneri_diversi_di_gestione.sum_ytd_value +=
      summary.costi_oneri_diversi_di_gestione;
    lastYearCurrentYearStatsSeries.costi_ebitda.sum_ytd_value +=
      summary.costi_ebitda;
    lastYearCurrentYearStatsSeries.oneri_finanziari_e_oneri_bancari.sum_ytd_value +=
      summary.oneri_finanziari_e_oneri_bancari;
    lastYearCurrentYearStatsSeries.proventi_di_natura_finanziaria.sum_ytd_value +=
      summary.proventi_di_natura_finanziaria;
    lastYearCurrentYearStatsSeries.oneri_finanziari.sum_ytd_value +=
      summary.oneri_finanziari;
    lastYearCurrentYearStatsSeries.ammortamenti_svalutazioni_e_altri_accantonamenti.sum_ytd_value +=
      summary.ammortamenti_svalutazioni_e_altri_accantonamenti;
    
    ytdlastMonthDepreciation = summary.ammortamenti_svalutazioni_e_altri_accantonamenti;
    lastYearCurrentYearStatsSeries.imposte_sul_reddito.sum_ytd_value +=
      summary.imposte_sul_reddito;
    lastYearCurrentYearStatsSeries.utile_del_periodo.sum_ytd_value +=
      summary.utile_del_periodo;
    lastYearCurrentYearStatsSeries.utile_del_periodo.ytd_values.push(
        summary.utile_del_periodo
      );

    // crediti
    lastYearCurrentYearStatsSeries.crediti_verso_clienti.sum_ytd_value +=
      summary.crediti_verso_clienti;
    lastYearCurrentYearStatsSeries.crediti_tributari.sum_ytd_value +=
      summary.crediti_tributari;
    lastYearCurrentYearStatsSeries.crediti_previdenziali.sum_ytd_value +=
      summary.crediti_previdenziali;
    lastYearCurrentYearStatsSeries.altri_crediti.sum_ytd_value +=
      summary.altri_crediti;
    lastYearCurrentYearStatsSeries.disponibilita_liquide.sum_ytd_value +=
      summary.disponibilita_liquide;
    lastYearCurrentYearStatsSeries.trattamento_di_fine_rapporto.sum_ytd_value +=
      summary.trattamento_di_fine_rapporto;
    lastYearCurrentYearStatsSeries.crediti_sum.sum_ytd_value +=
      summary.crediti_sum;
    lastYearCurrentYearStatsSeries.crediti_sum.ytd_values.push(
        summary.crediti_sum
      );
    // debiti
    lastYearCurrentYearStatsSeries.debiti_verso_banche.sum_ytd_value +=
      summary.debiti_verso_banche;
    lastYearCurrentYearStatsSeries.debiti_verso_fornitori.sum_ytd_value +=
      summary.debiti_verso_fornitori;
    lastYearCurrentYearStatsSeries.debiti_tributari.sum_ytd_value +=
      summary.debiti_tributari;
    lastYearCurrentYearStatsSeries.debiti_previdenziali.sum_ytd_value +=
      summary.debiti_previdenziali;
    lastYearCurrentYearStatsSeries.debiti_verso_dipendenti.sum_ytd_value +=
      summary.debiti_verso_dipendenti;
    lastYearCurrentYearStatsSeries.altri_debiti.sum_ytd_value +=
      summary.altri_debiti;
    lastYearCurrentYearStatsSeries.debiti_sum.sum_ytd_value +=
      summary.debiti_sum;
    lastYearCurrentYearStatsSeries.debiti_sum.ytd_values.push(
      summary.debiti_sum
    );
    lastYearCurrentYearStatsSeries.indebitamento_netto_complessivo.sum_ytd_value +=
      summary.indebitamento_netto_complessivo;
    lastYearCurrentYearStatsSeries.indebitamento_netto_complessivo.ytd_values.push(
      Math.abs(summary.altri_ricavi_e_proventi_della_gestione)
    );
  });

  let lytdlastMonthDepreciation = 0;
  const lastYearQuartersTimespanIntervals = mode === teamsystemAggregatationMode.QUARTERLY ? Timespan.getQuarterlyIntervals(lastYearQuartersTimespan) : Timespan.getMonthlyIntervals(lastYearQuartersTimespan);
  lastYearQuartersTimespanIntervals.map((i) => {
    const lastYearMonthAccounts = accounts.filter(
      (a: any) => i.fits(a.period_date)
    );
    const lastYearSummary = computeSummary({
      accounts: lastYearMonthAccounts,
      iva: iva,
    });
    lastYearCurrentYearStatsSeries.durata_media_del_credito.lytd_values.push(
      lastYearSummary.durata_media_del_credito
    );
    lastYearCurrentYearStatsSeries.durata_media_del_credito.sum_lytd_value +=
      lastYearSummary.durata_media_del_credito;
    lastYearCurrentYearStatsSeries.ricavi.lytd_values.push(
      lastYearSummary.ricavi
    );
    lastYearCurrentYearStatsSeries.ricavi.sum_lytd_value +=
      lastYearSummary.ricavi;
    lastYearCurrentYearStatsSeries.ricavi_totale_valore_della_produzione.lytd_values.push(
      lastYearSummary.ricavi_totale_valore_della_produzione
    );
    lastYearCurrentYearStatsSeries.ricavi_totale_valore_della_produzione.sum_lytd_value +=
      lastYearSummary.ricavi_totale_valore_della_produzione;
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
    lastYearCurrentYearStatsSeries.materiali_e_materie_di_consumo.sum_lytd_value +=
      lastYearSummary.materiali_e_materie_di_consumo;
    lastYearCurrentYearStatsSeries.variazione_delle_rimanenze_materie_prime.sum_lytd_value +=
      lastYearSummary.variazione_delle_rimanenze_materie_prime;
    lastYearCurrentYearStatsSeries.costi_rimanenze_iniziali.sum_lytd_value +=
      lastYearSummary.costi_rimanenze_iniziali;
    lastYearCurrentYearStatsSeries.costi_rimanenze_finali.sum_lytd_value +=
      lastYearSummary.costi_rimanenze_finali;
    lastYearCurrentYearStatsSeries.costi_lavorazioni_di_terzi.sum_lytd_value +=
      lastYearSummary.costi_lavorazioni_di_terzi;
    lastYearCurrentYearStatsSeries.costi_altri_costi_per_servizi_generali_fissi.sum_lytd_value +=
      lastYearSummary.costi_altri_costi_per_servizi_generali_fissi;
    lastYearCurrentYearStatsSeries.costi_affitti_noleggi.sum_lytd_value +=
      lastYearSummary.costi_affitti_noleggi;
    lastYearCurrentYearStatsSeries.costi_costo_dipendenti.sum_lytd_value +=
      lastYearSummary.costi_costo_dipendenti;
    lastYearCurrentYearStatsSeries.costi_oneri_diversi_di_gestione.sum_lytd_value +=
      lastYearSummary.costi_oneri_diversi_di_gestione;
    lastYearCurrentYearStatsSeries.costi_ebitda.sum_lytd_value +=
      lastYearSummary.costi_ebitda;
    lastYearCurrentYearStatsSeries.oneri_finanziari_e_oneri_bancari.sum_lytd_value +=
      lastYearSummary.oneri_finanziari_e_oneri_bancari;
    lastYearCurrentYearStatsSeries.proventi_di_natura_finanziaria.sum_lytd_value +=
      lastYearSummary.proventi_di_natura_finanziaria;
    lastYearCurrentYearStatsSeries.oneri_finanziari.sum_lytd_value +=
      lastYearSummary.oneri_finanziari;
    lastYearCurrentYearStatsSeries.ammortamenti_svalutazioni_e_altri_accantonamenti.sum_lytd_value +=
      lastYearSummary.ammortamenti_svalutazioni_e_altri_accantonamenti;

    lytdlastMonthDepreciation = lastYearSummary.ammortamenti_svalutazioni_e_altri_accantonamenti;

    lastYearCurrentYearStatsSeries.imposte_sul_reddito.sum_lytd_value +=
      lastYearSummary.imposte_sul_reddito;
    lastYearCurrentYearStatsSeries.utile_del_periodo.sum_lytd_value +=
      lastYearSummary.utile_del_periodo;
    lastYearCurrentYearStatsSeries.utile_del_periodo.lytd_values.push(
      lastYearSummary.utile_del_periodo
      );
    // crediti
    lastYearCurrentYearStatsSeries.crediti_verso_clienti.sum_lytd_value +=
      lastYearSummary.crediti_verso_clienti;
    lastYearCurrentYearStatsSeries.crediti_tributari.sum_lytd_value +=
      lastYearSummary.crediti_tributari;
    lastYearCurrentYearStatsSeries.crediti_previdenziali.sum_lytd_value +=
      lastYearSummary.crediti_previdenziali;
    lastYearCurrentYearStatsSeries.altri_crediti.sum_lytd_value +=
      lastYearSummary.altri_crediti;
    lastYearCurrentYearStatsSeries.disponibilita_liquide.sum_lytd_value +=
      lastYearSummary.disponibilita_liquide;
    lastYearCurrentYearStatsSeries.trattamento_di_fine_rapporto.sum_lytd_value +=
      lastYearSummary.trattamento_di_fine_rapporto;
    lastYearCurrentYearStatsSeries.crediti_sum.sum_lytd_value +=
      lastYearSummary.crediti_sum;
    lastYearCurrentYearStatsSeries.crediti_sum.lytd_values.push(
        lastYearSummary.crediti_sum
      );
    // debiti
    lastYearCurrentYearStatsSeries.debiti_verso_banche.sum_lytd_value +=
      lastYearSummary.debiti_verso_banche;
    lastYearCurrentYearStatsSeries.debiti_verso_fornitori.sum_lytd_value +=
      lastYearSummary.debiti_verso_fornitori;
    lastYearCurrentYearStatsSeries.debiti_tributari.sum_lytd_value +=
      lastYearSummary.debiti_tributari;
    lastYearCurrentYearStatsSeries.debiti_previdenziali.sum_lytd_value +=
      lastYearSummary.debiti_previdenziali;
    lastYearCurrentYearStatsSeries.debiti_verso_dipendenti.sum_lytd_value +=
      lastYearSummary.debiti_verso_dipendenti;
    lastYearCurrentYearStatsSeries.altri_debiti.sum_lytd_value +=
      lastYearSummary.altri_debiti;
    lastYearCurrentYearStatsSeries.debiti_sum.sum_lytd_value +=
      lastYearSummary.debiti_sum;
    lastYearCurrentYearStatsSeries.debiti_sum.lytd_values.push(
      Math.abs(lastYearSummary.debiti_sum)
    );
    lastYearCurrentYearStatsSeries.indebitamento_netto_complessivo.sum_lytd_value +=
      lastYearSummary.indebitamento_netto_complessivo;
    lastYearCurrentYearStatsSeries.indebitamento_netto_complessivo.lytd_values.push(
      Math.abs(lastYearSummary.altri_ricavi_e_proventi_della_gestione)
    );
  });

  lastYearCurrentYearStatsSeries.utile_del_periodo.sum_ytd_value += lastYearCurrentYearStatsSeries.ammortamenti_svalutazioni_e_altri_accantonamenti.sum_ytd_value - ytdlastMonthDepreciation;
      lastYearCurrentYearStatsSeries.ammortamenti_svalutazioni_e_altri_accantonamenti.sum_ytd_value=ytdlastMonthDepreciation;

  lastYearCurrentYearStatsSeries.utile_del_periodo.sum_lytd_value += lastYearCurrentYearStatsSeries.ammortamenti_svalutazioni_e_altri_accantonamenti.sum_lytd_value - lytdlastMonthDepreciation;
  lastYearCurrentYearStatsSeries.ammortamenti_svalutazioni_e_altri_accantonamenti.sum_lytd_value=lytdlastMonthDepreciation;

  return lastYearCurrentYearStatsSeries;
};

const computeAllData = ({
  focusTimespan,
  accounts,
  iva,
}: {
  focusTimespan: Timespan;
  accounts: any[];
  iva: number;
}): TeamSystemLastYearCurrentYearChart => {
  const lastYearCurrentYearStatsSeries = <TeamSystemLastYearCurrentYearChart>{
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
    const monthAccounts = accounts.filter(
      (a: any) =>
        a.period_month === i.from.getMonth() + 1 &&
        a.period_year === i.from.getFullYear()
    );
    const summary = computeSummary({ accounts: monthAccounts, iva: iva });
    lastYearCurrentYearStatsSeries.durata_media_del_credito.ytd_values.push(
      summary.durata_media_del_credito
    );
    lastYearCurrentYearStatsSeries.durata_media_del_credito.sum_ytd_value +=
      summary.durata_media_del_credito;
    lastYearCurrentYearStatsSeries.ricavi_totale_valore_della_produzione.ytd_values.push(
      summary.ricavi_totale_valore_della_produzione
    );
    lastYearCurrentYearStatsSeries.ricavi_totale_valore_della_produzione.sum_ytd_value +=
      summary.ricavi_totale_valore_della_produzione;
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
    lastYearCurrentYearStatsSeries.materiali_e_materie_di_consumo.sum_ytd_value +=
      summary.materiali_e_materie_di_consumo;
    lastYearCurrentYearStatsSeries.variazione_delle_rimanenze_materie_prime.sum_ytd_value +=
      summary.variazione_delle_rimanenze_materie_prime;
    lastYearCurrentYearStatsSeries.costi_rimanenze_iniziali.sum_ytd_value +=
      summary.costi_rimanenze_iniziali;
    lastYearCurrentYearStatsSeries.costi_rimanenze_finali.sum_ytd_value +=
      summary.costi_rimanenze_finali;
    lastYearCurrentYearStatsSeries.costi_lavorazioni_di_terzi.sum_ytd_value +=
      summary.costi_lavorazioni_di_terzi;
    lastYearCurrentYearStatsSeries.costi_altri_costi_per_servizi_generali_fissi.sum_ytd_value +=
      summary.costi_altri_costi_per_servizi_generali_fissi;
    lastYearCurrentYearStatsSeries.costi_affitti_noleggi.sum_ytd_value +=
      summary.costi_affitti_noleggi;
    lastYearCurrentYearStatsSeries.costi_costo_dipendenti.sum_ytd_value +=
      summary.costi_costo_dipendenti;
    lastYearCurrentYearStatsSeries.costi_oneri_diversi_di_gestione.sum_ytd_value +=
      summary.costi_oneri_diversi_di_gestione;
    lastYearCurrentYearStatsSeries.costi_ebitda.sum_ytd_value +=
      summary.costi_ebitda;
    lastYearCurrentYearStatsSeries.oneri_finanziari_e_oneri_bancari.sum_ytd_value +=
      summary.oneri_finanziari_e_oneri_bancari;
    lastYearCurrentYearStatsSeries.proventi_di_natura_finanziaria.sum_ytd_value +=
      summary.proventi_di_natura_finanziaria;
    lastYearCurrentYearStatsSeries.oneri_finanziari.sum_ytd_value +=
      summary.oneri_finanziari;
    lastYearCurrentYearStatsSeries.ammortamenti_svalutazioni_e_altri_accantonamenti.sum_ytd_value +=
      summary.ammortamenti_svalutazioni_e_altri_accantonamenti;
    
    lastMonthDepreciation = summary.ammortamenti_svalutazioni_e_altri_accantonamenti;
    lastYearCurrentYearStatsSeries.imposte_sul_reddito.sum_ytd_value +=
      summary.imposte_sul_reddito;
    lastYearCurrentYearStatsSeries.utile_del_periodo.sum_ytd_value +=
      summary.utile_del_periodo;
    lastYearCurrentYearStatsSeries.utile_del_periodo.ytd_values.push(
        summary.utile_del_periodo
      );

    // crediti
    lastYearCurrentYearStatsSeries.crediti_verso_clienti.sum_ytd_value +=
      summary.crediti_verso_clienti;
    lastYearCurrentYearStatsSeries.crediti_tributari.sum_ytd_value +=
      summary.crediti_tributari;
    lastYearCurrentYearStatsSeries.crediti_previdenziali.sum_ytd_value +=
      summary.crediti_previdenziali;
    lastYearCurrentYearStatsSeries.altri_crediti.sum_ytd_value +=
      summary.altri_crediti;
    lastYearCurrentYearStatsSeries.disponibilita_liquide.sum_ytd_value +=
      summary.disponibilita_liquide;
    lastYearCurrentYearStatsSeries.trattamento_di_fine_rapporto.sum_ytd_value +=
      summary.trattamento_di_fine_rapporto;
    lastYearCurrentYearStatsSeries.crediti_sum.sum_ytd_value +=
      summary.crediti_sum;
    lastYearCurrentYearStatsSeries.crediti_sum.ytd_values.push(
        summary.crediti_sum
      );
    // debiti
    lastYearCurrentYearStatsSeries.debiti_verso_banche.sum_ytd_value +=
      summary.debiti_verso_banche;
    lastYearCurrentYearStatsSeries.debiti_verso_fornitori.sum_ytd_value +=
      summary.debiti_verso_fornitori;
    lastYearCurrentYearStatsSeries.debiti_tributari.sum_ytd_value +=
      summary.debiti_tributari;
    lastYearCurrentYearStatsSeries.debiti_previdenziali.sum_ytd_value +=
      summary.debiti_previdenziali;
    lastYearCurrentYearStatsSeries.debiti_verso_dipendenti.sum_ytd_value +=
      summary.debiti_verso_dipendenti;
    lastYearCurrentYearStatsSeries.altri_debiti.sum_ytd_value +=
      summary.altri_debiti;
    lastYearCurrentYearStatsSeries.debiti_sum.sum_ytd_value +=
      summary.debiti_sum;
    lastYearCurrentYearStatsSeries.debiti_sum.ytd_values.push(
      summary.debiti_sum
    );
    lastYearCurrentYearStatsSeries.indebitamento_netto_complessivo.sum_ytd_value +=
      summary.indebitamento_netto_complessivo;
    lastYearCurrentYearStatsSeries.indebitamento_netto_complessivo.ytd_values.push(
      Math.abs(summary.altri_ricavi_e_proventi_della_gestione)
    );
  });
  lastYearCurrentYearStatsSeries.utile_del_periodo.sum_ytd_value += lastYearCurrentYearStatsSeries.ammortamenti_svalutazioni_e_altri_accantonamenti.sum_ytd_value - lastMonthDepreciation;
  lastYearCurrentYearStatsSeries.ammortamenti_svalutazioni_e_altri_accantonamenti.sum_ytd_value=lastMonthDepreciation;
  return lastYearCurrentYearStatsSeries;
};
const computeSummary = ({
  accounts,
  iva,
  monthDate,
}: {
  accounts: any[];
  iva: number;
  monthDate?: Date;
}): TeamSystemSummary => {
  const lastMonthTimespan =  monthDate ?  Timespan.getLastMonthTimespan(monthDate): accounts.length ? Timespan.getLastMonthTimespan(accounts[0].period_date) : new Timespan(new Date(), new Date());
  const lastMonthAccounts = accounts.filter((i) =>
    lastMonthTimespan.fits(i.period_date)
  );
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
    ricavi_totale_valore_della_produzione: 0,
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

    oneri_finanziari_e_oneri_bancari: 0,
    proventi_di_natura_finanziaria: 0,
    oneri_finanziari: 0,
    ammortamenti_svalutazioni_e_altri_accantonamenti: 0,
    imposte_sul_reddito: 0,
    utile_del_periodo: 0,

    // crediti
    crediti_sum: 0,
    crediti_verso_clienti: 0,
    crediti_tributari: 0,
    crediti_previdenziali: 0,
    altri_crediti: 0,
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
    teamsSystemAccounts.CREDITI_VERSO_CLIENTI_ACCOUNTS
  );

  stats.crediti_tributari = filterAndSum(
    accounts,
    teamsSystemAccounts.CREDITI_TRIBUTARI_ACCOUNTS
  );
  stats.crediti_previdenziali = filterAndSum(
    accounts,
    teamsSystemAccounts.CREDITI_PREVIDENZIALI_ACCOUNTS
  );
  stats.altri_crediti = filterAndSum(
    accounts,
    teamsSystemAccounts.ALTRI_CREDITI_ACCOUNTS
  );
  stats.disponibilita_liquide = filterAndSum(
    accounts,
    teamsSystemAccounts.DISPONIBILITA_LIQUIDE_ACCOUNTS
  );
  stats.trattamento_di_fine_rapporto = filterAndSum(
    accounts,
    teamsSystemAccounts.TRATTAMENTO_DI_FINE_RAPPORTO_accounts
  );
  stats.crediti_sum =
    stats.crediti_verso_clienti +
    stats.crediti_tributari +
    stats.crediti_previdenziali +
    stats.altri_crediti;

  // debiti
  stats.debiti_verso_banche = filterAndSum(
    accounts,
    teamsSystemAccounts.DEBITI_VERSO_BANCHE_ACCOUNTS
  );
  stats.debiti_verso_fornitori = filterAndSum(
    accounts,
    teamsSystemAccounts.DEBITI_VERSO_FORNITORI_ACCOUNTS
  );
  stats.debiti_tributari = filterAndSum(
    accounts,
    teamsSystemAccounts.DEBITI_TRIBUTARI_ACCOUNTS
  );
  stats.debiti_previdenziali = filterAndSum(
    accounts,
    teamsSystemAccounts.DEBITI_PREVIDENZIALI_ACCOUNTS
  );
  stats.debiti_verso_dipendenti = filterAndSum(
    accounts,
    teamsSystemAccounts.DEBITI_VERSO_DIPENDENTI_ACCOUNTS
  );
  stats.altri_debiti =
    filterAndSum(accounts, teamsSystemAccounts.ALTRI_DEBITI_ACCOUNTS) -
    stats.debiti_verso_dipendenti;
  stats.debiti_sum =
    stats.debiti_verso_banche +
    stats.debiti_verso_fornitori +
    stats.debiti_tributari +
    stats.debiti_previdenziali +
    stats.debiti_verso_dipendenti +
    stats.altri_debiti;
  stats.indebitamento_netto_complessivo =
    stats.crediti_sum +
    stats.disponibilita_liquide -
    -stats.trattamento_di_fine_rapporto -
    stats.debiti_sum;

  stats.materiali_e_materie_di_consumo = filterAndSum(
    accounts,
    teamsSystemAccounts.MATERIALI_E_MATERIE_DI_CONSUMO_ACCOUNTS
  );
  stats.costi_rimanenze_iniziali = filterAndSum(
    accounts,
    teamsSystemAccounts.COSTI_RIMANENZE_INIZIALI_ACCOUNTS
  );
  stats.costi_rimanenze_finali = filterAndSum(
    accounts,
    teamsSystemAccounts.COSTI_RIMANENZE_FINALI_ACCOUNTS
  );
  // stats.variazione_delle_rimanenze_materie_prime = stats.costi_rimanenze_finali - stats.costi_rimanenze_iniziali;
  stats.costi_lavorazioni_di_terzi = filterAndSum(
    accounts,
    teamsSystemAccounts.LAVORAZIONI_DI_TERZI_ACCOUNTS
  );
  stats.ricavi_delle_prestazioni_di_servizi = filterAndSum(
    accounts,
    teamsSystemAccounts.RICAVI_DELLE_PRESTAZIONI_DI_SERVIZI_ACCOUNTS
  );
  // stats.costi_fissi = filterAndSum(accounts, teamsSystemAccounts.COSTI_FISSI_ACCOUNTS);
  stats.rimanenze_iniziali = filterAndSum(
    accounts,
    teamsSystemAccounts.RIMANENZE_INIZIALI_ACCOUNTS
  );
  stats.rimanenze_finali = filterAndSum(accounts, teamsSystemAccounts.RIMANENZE_FINALI_ACCOUNTS);
  // stats.variazione_rimanze_semilav_e_prod_finiti = stats.rimanenze_finali + stats.rimanenze_iniziali;
  stats.costi_affitti_noleggi = filterAndSum(
    accounts,
    teamsSystemAccounts.AFFITTI_NOLEGGI_ACCOUNTS
  );
  stats.costi_costo_dipendenti = filterAndSum(
    accounts,
    teamsSystemAccounts.COSTO_DIPENDENTI_ACCOUNTS, false
  );
  stats.costi_oneri_diversi_di_gestione = filterAndSum(
    accounts,
    teamsSystemAccounts.ONERI_DIVERSI_DI_GESTIONE_ACCOUNTS
  );
  stats.costi_altri_costi_per_servizi_generali_fissi = filterAndSum(
    accounts,
    teamsSystemAccounts.ALTRI_COSTI_PER_SERVIZI_ACCOUNTS
  ) - stats.costi_lavorazioni_di_terzi;

  stats.ricavi = filterAndSum(accounts, teamsSystemAccounts.RICAVI_ACCOUNT);
  stats.altri_ricavi_e_proventi_della_gestione = filterAndSum(
    accounts,
    teamsSystemAccounts.ALTRI_RICAVI_E_PROVENTI_DELLA_GESTIONE_ACCOUNTS
  );
  stats.contributi_in_c_esercizio_o_in_c_capitale = filterAndSum(
    accounts,
    teamsSystemAccounts.CONTRIBUTI_IN_C_ESERCIZIO_O_IN_C_CAPITALE_ACCOUNTS
  );
  stats.ricavi_totale_valore_della_produzione =
    stats.ricavi_delle_prestazioni_di_servizi +
    stats.ricavi +
    stats.variazione_rimanze_semilav_e_prod_finiti +
    stats.altri_ricavi_e_proventi_della_gestione +
    stats.contributi_in_c_esercizio_o_in_c_capitale;
  stats.costi_fissi = stats.costi_altri_costi_per_servizi_generali_fissi + stats.costi_affitti_noleggi + stats.costi_costo_dipendenti + stats.costi_oneri_diversi_di_gestione
  stats.costi_variabili = stats.materiali_e_materie_di_consumo + stats.variazione_delle_rimanenze_materie_prime + stats.costi_lavorazioni_di_terzi;
  // stats.ebitda =
  //   stats.ricavi_totale_valore_della_produzione -
  //   stats.materiali_e_materie_di_consumo -
  //   stats.variazione_delle_rimanenze_materie_prime -
  //   stats.costi_lavorazioni_di_terzi -
  //   stats.costi_altri_costi_per_servizi_generali_fissi -
  //   stats.costi_affitti_noleggi -
  //   stats.costi_costo_dipendenti -
  //   stats.costi_oneri_diversi_di_gestione;
  stats.ebitda = stats.ricavi_totale_valore_della_produzione - stats.costi_fissi - stats.costi_variabili;

  stats.proventi_di_natura_finanziaria = filterAndSum(
    accounts,
    teamsSystemAccounts.PROVENTI_DI_NATURA_FINANZIARIA_ACCOUNTS
  );
  stats.oneri_finanziari = filterAndSum(accounts, teamsSystemAccounts.ONERI_FINANZIARI_ACCOUNTS);
  const ammortamenti_svalutazioni_e_altri_accantonamenti_current_month = filterAndSum(
    accounts,
    teamsSystemAccounts.AMMORTAMENTI_SVALUTAZIONI_E_ALTRI_ACCANTONAMENTI_ACCOUNTS
  );
  const ammortamenti_svalutazioni_e_altri_accantonamenti_preview_month = filterAndSum(
    lastMonthAccounts,
    teamsSystemAccounts.AMMORTAMENTI_SVALUTAZIONI_E_ALTRI_ACCANTONAMENTI_ACCOUNTS
  );
  // stats.ammortamenti_svalutazioni_e_altri_accantonamenti = ammortamenti_svalutazioni_e_altri_accantonamenti_current_month - ammortamenti_svalutazioni_e_altri_accantonamenti_preview_month;
  stats.ammortamenti_svalutazioni_e_altri_accantonamenti = ammortamenti_svalutazioni_e_altri_accantonamenti_preview_month;
  stats.imposte_sul_reddito = filterAndSum(
    accounts,
    teamsSystemAccounts.IMPOSTE_SUL_REDDITO_ACCOUNTS
  );
  stats.oneri_finanziari_e_oneri_bancari = stats.proventi_di_natura_finanziaria - stats.oneri_finanziari;
  stats.utile_del_periodo = stats.ebitda + stats.oneri_finanziari_e_oneri_bancari - stats.ammortamenti_svalutazioni_e_altri_accantonamenti - stats.imposte_sul_reddito;

  stats.crediti =
    stats.crediti_verso_clienti +
    stats.crediti_tributari +
    stats.crediti_previdenziali +
    stats.altri_crediti;
  const durata_media_del_credito =
    stats.crediti_verso_clienti /
    ((stats.ricavi + stats.ricavi_delle_prestazioni_di_servizi) *
      (1 + (iva / 100)));
  console.log({iva})
  stats.durata_media_del_credito = isNaN(durata_media_del_credito) || !isFinite(durata_media_del_credito)
    ? 0
    : (durata_media_del_credito * 365);
  stats.durata_media_del_credito = Math.round(stats.durata_media_del_credito)
  stats.break_even_point =
    stats.costi_fissi /
    (1 -
      stats.costi_variabili /
      (stats.ricavi + stats.ricavi_delle_prestazioni_di_servizi));
  stats.profitto_netto = stats.ebitda - stats.costi_fissi;
  return stats;
};

const computeYTDSeries = ({
  accounts,
  iva,
}: {
  accounts: any[];
  iva: number;
}): TeamSystemOverAllChart => {
  const statsSeries = <TeamSystemOverAllChart>{
    ricavi: [],
    costi: [],
    ebitda: [],
    profitto_netto: [],
    utile_del_periodo: [],
    costi_fissi: [],
    costi_variabili: [],
    year: 0,
    month: 0,
  };
  const yearToDayTimespan = new Timespan(
    new Date(now.getFullYear(),0,1, 0,0,0),
    new Date(`${now.getFullYear()}-${now.getMonth() - 1}-01`) // last day of the previous month
);
  Timespan.getMonthlyIntervals(yearToDayTimespan).map((i) => {
    const focusAccounts = accounts.filter((acc: any) => i.fits(acc.period_date));
    const summary = computeSummary({ accounts: focusAccounts, iva: iva });
    statsSeries.ricavi.push(summary.ricavi_totale_valore_della_produzione);
    statsSeries.costi.push(summary.costi_fissi + summary.costi_variabili);
    statsSeries.ebitda.push(summary.ebitda);
    statsSeries.profitto_netto.push(
      summary.ricavi_totale_valore_della_produzione - summary.costi_fissi
    );
    statsSeries.costi_fissi.push(summary.costi_fissi);
    statsSeries.costi_variabili.push(summary.costi_variabili);
    statsSeries.utile_del_periodo.push(summary.utile_del_periodo);
    statsSeries.year = i.from.getFullYear();
    statsSeries.month = i.from.getMonth() + 1;
  });
  return statsSeries;
};
const computeSimpleYearSeries = ({ activeTimespan, teamsystemAccounts, iva }: { activeTimespan: Timespan, teamsystemAccounts: any[], iva: number }): TeamSystemSummary => {
  const focusAccounts = teamsystemAccounts.filter(
    (a: any) =>
      activeTimespan.fits(a.period_date)
  );
  return computeSummary({ accounts: focusAccounts, iva: iva });
};


const computeSummaryMonthly = ({ OverAllAccounts, activeTimespan, iva } : { OverAllAccounts: any[],activeTimespan: Timespan,iva:number }) : TeamSystemSummary => {
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
    const focusAccounts = OverAllAccounts.filter(
      (a: any) =>
        activeMonth.fits(a.period_date)
    );
    const monthStats = computeSummary({ accounts: focusAccounts , iva: iva });
    sumAttributes(stats, monthStats, ["ammortamenti_svalutazioni_e_altri_accantonamenti"]);
    stats.ammortamenti_svalutazioni_e_altri_accantonamenti = monthStats.ammortamenti_svalutazioni_e_altri_accantonamenti; // always take only the last month
  });

  return stats;
};

export async function computeDittaTeamsystemAggregations({
  teamsystemAccounts,
  ActiveTimespan,
  iva,
  mode = teamsystemAggregatationMode.MONTHLY
}: {
  teamsystemAccounts: any[];
  ActiveTimespan: Timespan;
  iva: number;
  mode: string;
}) {
  const lastFullyEndedNQuartersAccounts = teamsystemAccounts.filter((i: any) =>
    lastQuartersTimespan.fits(i.period_date)
  );
  // const teamsystemSummaryStats = computeSummary({
  //   accounts: teamsystemAccounts,
  //   iva: iva,
  // });
  const teamSystemOverFocus = computeStatsSeries({
    timespan: ActiveTimespan,
    accounts: teamsystemAccounts,
    iva: iva,
  });
  const teamSystemYTD = computeYTDSeries({
    accounts: teamsystemAccounts,
    iva: iva,
  });
  const teamSystemLastYearCurrentYearChartData =
    computeLastYearCurrentYearSeries({
      accounts: teamsystemAccounts,
      iva: iva,
      mode:mode,
    });
  const yearToDateData = computeAllData({
    focusTimespan: yearToDayTimespan,
    accounts: lastFullyEndedNQuartersAccounts,
    iva: iva,
  });
  const lastYearData = computeAllData({
    focusTimespan: lastYearTimespan,
    accounts: lastFullyEndedNQuartersAccounts,
    iva: iva,
  });
  const focusTableData = computeSimpleYearSeries({
    activeTimespan: yearToDayTimespan,
    teamsystemAccounts: teamsystemAccounts,
    iva: iva
  });
  const teamSystemSummaryStats = computeSummary({
    accounts: teamsystemAccounts.filter((i: any) => yearToDayTimespan.fits(i.period_date)),
    iva: iva,
  });
  const getLastAvailableDate = () => {
    return teamsystemAccounts.length ? new Date(teamsystemAccounts[0].from_date) : new Date();
  }
  const lastAvailableDate = getLastAvailableDate();
  const categories = mode === teamsystemAggregatationMode.MONTHLY ? Timespan.getMonthlyIntervals(lastQuartersTimespan).map((d) => format(d.from, "MMM", { locale: it })) : Timespan.getQuarterlyIntervals(lastQuartersTimespan).map((d) => "Q " + format(d.from, "QQ", { locale: it }));
  return {
    teamSystemSummaryStats,
    teamSystemOverFocus,
    teamSystemYTD,
    teamSystemLastYearCurrentYearChartData,
    yearToDateData,
    lastYearData,
    focusTableData,
    categories,
    lastAvailableDate
  }
};
