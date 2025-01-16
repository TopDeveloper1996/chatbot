export interface IncomeStatementSectionData {
    title: string;
    headers: string[];
    recap: {
        revenues: ValueCell[];
        costs: ValueCell[];
        ebitda: ValueCell[];
        itda: ValueCell[];
        tax: ValueCell [];
        last_year_income_tax_balance: ValueCell[];
        utile_netto: ValueCell[];
        isUserProvideIncomeStatement: boolean;
        margin: ValueCell[];
        preTaxMargin: ValueCell[];
    };
    revenueCategories: {
        key: string;
        elements: ValueCell[];
    }[];
    costsCategories: {
        key: string;
        elements: ValueCell[];
    }[];
    userDefinedcostsCategories: {
        key: string;
        elements: ValueCell[];
    }[];
    userDefinedITDACategories: {
        key: string;
        elements: ValueCell[];
    }[];
    f24Categories: {
        key: string;
        elements: ValueCell[];
    }[];
}
export interface IncomeStatementAnalytics {
    yearly: IncomeStatementSectionData;
    quarterly: IncomeStatementSectionData;
}


export interface costoLavoro{
    salari_e_stipendi:number;
    contributi_inps:number;
    contributi_inail:number;
    tfr:number;
    altre_voci:number;
    ratei_ferie_e_permessi : number;
    totale:number; // salari_e_stipendi + contributi_inps + contributi_inail + tfr + altre_voci + ratei_ferie_e_permessi
}

export interface OneriFinanziariInteressiEAltreChargeFinanziarie {
    OneriDiversiDiGestioneAltriCostiOperativi: number;
    ProventiFinanziari: number;
    oneriBancari: number; // "`Oneri finanziari e Bancari (+/-)`
    totale: number; // OneriDiversiDiGestioneAltriCostiOperativi + ProventiFinanziari + oneriBancari
}

export interface SvalutazioniEAmmortamentiDepreciationsAndAmortization {
    ammortamenti: number;
    svalutazioni: number;
    altriAccantonamenti: number;
    totale: number; // ammortamenti + svalutazioni + altri_accantonamenti
}

export interface IncomeStatementUserInput {
    ditta_id: number;
    customer_id: number;
    period_year: number;
    period_month: number;
    costoLavoro: costoLavoro;
    ammortamentiSvalutazioniAccantonamenti: number;
    oneriFinanziari: OneriFinanziariInteressiEAltreChargeFinanziarie;
    ricaviValoreProduzione: number;
    altriCostiOperativi: number;
    svalutazioniEAmmortamentiDepreciationsAndAmortization: SvalutazioniEAmmortamentiDepreciationsAndAmortization;
    salari_e_stipendi:number;
    contributi_inps:number;
    contributi_inail:number;
    tfr:number;
    altre_voci:number;
    ratei_ferie_e_permessi : number;
    OneriDiversiDiGestioneAltriCostiOperativi: number;
    ProventiFinanziari: number;
    oneriBancari: number; // "`Oneri finanziari e Bancari (+/-)`
    ammortamenti: number;
    svalutazioni: number;
    altriAccantonamenti: number;
    
};

export interface IncomeStatementuploadData {
    isUploading: boolean | false;
    errorMessage: string;
    progress: number | 0;
}