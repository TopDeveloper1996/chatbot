
export interface TeamSystemSummary {
  ricavi: number;
  costi_fissi: number;
  costi_variabili: number;
  ebitda: number;
  crediti: number;
  indebitamento: number; // debiti
  durata_media_del_credito: number;
  break_even_point: number;
  profitto_netto: number; // ricavi - costi
  ricavi_delle_prestazioni_di_servizi: number;
  rimanenze_iniziali: number;
  rimanenze_finali: number;
  variazione_rimanze_semilav_e_prod_finiti: number; // -rimanenze_iniziali + rimanenze_finali
  altri_ricavi_e_proventi_della_gestione: number;
  contributi_in_c_esercizio_o_in_c_capitale: number;
  ricavi_totale_valore_della_produzione: number; // ricavi + variazione_rimanze_semilav_e_prod_finiti + altri_ricavi_e_proventi_della_gestione + contributi_in_c_esercizio_o_in_c_capitale

  // costi
  materiali_e_materie_di_consumo: number;
  variazione_delle_rimanenze_materie_prime: number;
  costi_rimanenze_iniziali: number;
  costi_rimanenze_finali: number;
  costi_lavorazioni_di_terzi: number;
  costi_altri_costi_per_servizi_generali_fissi: number;
  costi_affitti_noleggi: number;
  costi_costo_dipendenti: number;
  costi_oneri_diversi_di_gestione: number;
  costi_ebitda: number;

  oneri_finanziari_e_oneri_bancari: number;
  proventi_di_natura_finanziaria: number;
  oneri_finanziari: number;
  ammortamenti_svalutazioni_e_altri_accantonamenti: number;
  imposte_sul_reddito: number;
  utile_del_periodo: number;

  // crediti
  crediti_sum: number;
  crediti_verso_clienti: number;
  crediti_tributari: number;
  crediti_previdenziali: number;
  altri_crediti: number;
  disponibilita_liquide: number;
  trattamento_di_fine_rapporto: number;

  // debiti
  debiti_sum: number;
  debiti_verso_banche: number;
  debiti_verso_fornitori: number;
  debiti_tributari: number;
  debiti_previdenziali: number;
  debiti_verso_dipendenti : number;
  altri_debiti: number;
  indebitamento_netto_complessivo: number;
}
export interface TeamSystemOverAllChart {
  ricavi: number[];
  costi: number[]; // costi_fissi + costi_variabili
  ebitda: number[];
  profitto_netto: number[]; // ricavi - costi
  utile_del_periodo: number[];
  costi_fissi: number[];
  costi_variabili: number[];
  year: number;
  month: number;
}

export interface TeamSystemRicaviChart {
  focus_ricavi: number[];
  focus_last_ricavi: number[];
}
export interface TeamSystemSeriesVar {
  ytd_values: number[];
  lytd_values: number[];
  sum_ytd_value: number;
  sum_lytd_value: number;
}

export interface TeamSystemTotal {
  sum_ytd_value: number;
  sum_lytd_value: number;
}
export interface TeamSystemLastYearCurrentYearChart {
  ricavi: TeamSystemSeriesVar;
  ricavi_delle_prestazioni_di_servizi: TeamSystemSeriesVar;
  costi: TeamSystemSeriesVar;
  ebitda: TeamSystemSeriesVar;
  profitto_netto: TeamSystemSeriesVar;
  costi_fissi: TeamSystemSeriesVar;
  costi_variabili: TeamSystemSeriesVar;
  rimanenze_iniziali: TeamSystemSeriesVar;
  rimanenze_finali: TeamSystemSeriesVar;
  variazione_rimanze_semilav_e_prod_finiti: TeamSystemSeriesVar;
  altri_ricavi_e_proventi_della_gestione: TeamSystemSeriesVar;
  contributi_in_c_esercizio_o_in_c_capitale: TeamSystemSeriesVar;
  ricavi_totale_valore_della_produzione: TeamSystemSeriesVar;
  durata_media_del_credito: TeamSystemSeriesVar;
  // costi
  materiali_e_materie_di_consumo: TeamSystemTotal;
  variazione_delle_rimanenze_materie_prime: TeamSystemTotal;
  costi_rimanenze_iniziali: TeamSystemTotal;
  costi_rimanenze_finali: TeamSystemTotal;
  costi_lavorazioni_di_terzi: TeamSystemTotal;
  costi_altri_costi_per_servizi_generali_fissi: TeamSystemTotal;
  costi_affitti_noleggi: TeamSystemTotal;
  costi_costo_dipendenti: TeamSystemTotal;
  costi_oneri_diversi_di_gestione: TeamSystemTotal;
  costi_ebitda: TeamSystemTotal;

  oneri_finanziari_e_oneri_bancari: TeamSystemTotal;
  proventi_di_natura_finanziaria: TeamSystemTotal;
  oneri_finanziari: TeamSystemTotal;
  ammortamenti_svalutazioni_e_altri_accantonamenti: TeamSystemTotal;
  imposte_sul_reddito: TeamSystemTotal;
  utile_del_periodo: TeamSystemSeriesVar;

  // crediti
  crediti_sum: TeamSystemTotal;
  crediti_verso_clienti: TeamSystemTotal;
  crediti_tributari: TeamSystemTotal;
  crediti_previdenziali: TeamSystemTotal;
  altri_crediti: TeamSystemTotal;
  disponibilita_liquide: TeamSystemTotal;
  trattamento_di_fine_rapporto: TeamSystemTotal;
  // debiti
  debiti_sum: TeamSystemSeriesVar;
  debiti_verso_banche: TeamSystemTotal;
  debiti_verso_fornitori: TeamSystemTotal;
  debiti_tributari: TeamSystemTotal;
  debiti_previdenziali: TeamSystemTotal;
  debiti_verso_dipendenti: TeamSystemTotal;
  altri_debiti: TeamSystemTotal;
  indebitamento_netto_complessivo: TeamSystemSeriesVar;
}

export interface TeamSystemReport {
  ts_report_summary: string;
  ts_report_final_comment: string;
}

export enum teamsystemAggregatationMode {
  MONTHLY = "monthly",
  QUARTERLY= "quarterly",
}
