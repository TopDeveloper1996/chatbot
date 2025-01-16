export interface DittaPeriodSummaryAnalytics {
    /**Data regarding the revenue */
    revenue: {
        /**Total revnue */
        total: number;
        /**Revenue from fees */
        fees: number;
        /**Revenue from invoices (actives) */
        invoices: number;
        /**Total iva from invoices (actives) */
        invoices_iva: number;
        /**Total iva from fees */
        fees_iva: number;

    };
    /**Costs data */
    costs: {
        /**Total costs */
        total: number;
        /**Costs from invoices (passives) */
        invoices: number;
        /**Costs from taxes (F24) */
        taxes: number;
        /**Total iva from invoices (actives) */
        invoices_iva: number;
    };
    /**User provided data  */
    isUserProvideData: boolean;
    /**Total ebitda */
    ebitda: number;
    /**Profit computes as total revenue - total costs */
    profit: number;
    /**Ratio of the profit with respect to total revenue, domain: [0, 1] */
    profitRatio: number;
    /**List of ids of active clients */
    activeClientIds: string[];
}

export interface DittaSummaryAnalytics {
    /**Data regarding the first period */
    firstPeriod: DittaPeriodSummaryAnalytics;
    /**Data regarding the second period */
    secondPeriod: DittaPeriodSummaryAnalytics;
    /**Variations data, comparison between the two periods*/
    variations: {
        /**Revenue variations data */
        revenue: {
            /**Variation of the total revenue */
            total: number;
            /**Variation of the fees revenue */
            fees: number;
            /**Variation of the invoice revenue */
            invoices: number;
        };
        /**Costs variations data */
        costs: {
            /**Variation of the total costs */
            total: number;
            /**Variation of the invoice costs */
            invoices: number;
            /**Variation of the taxes costs */
            taxes: number;
        };
        /**Variation of the ebitda */
        ebitda: number;
        /**Variation of the profit */
        profit: number;
        
    };
    /**Growth as ratio between second period gross revenue and first period gross revenue, domain: [0, 1]*/
    growth: number;
    /**List of ids of clients that are active in the second period and were not active in the first period*/
    newClients: string[];
    /**List of ids of clients that were active in the first period and that are no active anymore in the second period*/
    inactiveClients: string[];
}

export interface DittaSummaryOverAllChart {
    ricavi: number[];
    costi: number[]; // costi_fissi_variabili + costi_operativi
    margine_lordo: number[]; // ricavi - costi_fissi_variabili
    ebitda: number[]; // ricavi - costi
    itda: number[];
    profitto_netto: number[]; // ricavi - costi - itda
    costi_fissi_variabili: number[];
    costi_operativi: number[];
    year: number[];
    month: number[];
    isUserProvideData: boolean[];
  }

export interface DittaSummaryChart {
    ricavi: number;
    costi: number; // costi_fissi_variabili + costi_operativi
    margine_lordo: number; // ricavi - costi_fissi_variabili
    ebitda: number; // ricavi - costi
    itda: number;
    profitto_netto: number; // ricavi - costi - itda
    costi_fissi_variabili: number;
    costi_operativi: number;
    year: number;
    month: number;
    isUserProvideData: boolean;
  }

export interface DittaTextSummaryFinalComment {
    ditta_report_final_comment : string;
    ditta_report_summary: string;
  }
  