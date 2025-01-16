import * as stringUtils from "~/src/common/string";
export const useInvoiceMappings = () => {
    const docTypeMap: any = {
        td01: "Fattura",
        td02: "Acconto/anticipo fattura",
        td03: "Acconto/anticipo parcella",
        td04: "Nota di credito",
        td05: "Nota di debito",
        td06: "Parcella",
        td07: "Fattura semplificata",
        td08: "Nota di credito semplificata",
        td09: "Nota di debito semplificata",
        td10: "Fattura acquisto intracomunitario beni",
        td11: "Fattura acquisto intracomunitario servizi",
        td12: "Documento riepilogativo",
        td16: "Integrazione fattura reverse charge interno",
        td17: "Integrazione/autofattura per acquisto servizi dall'estero",
        td18: "Integrazione per acquisto di beni intracomunitari",
        td19: "Integrazione/autofattura per acquisto di beni ",
        td20: "Autofattura per regolarizzazione e integrazione delle fatture",
        td21: "Autofattura per splafonamento",
        td22: "Estrazione beni da Deposito IVA",
        td23: "Estrazione beni da Deposito IVA con versamento dell'IVA",
        td24: "Fattura differita (art. 21, comma 4, lett. A)",
        td25: "Fattura differita (art. 21, comma 4, 3° periodo lett. B)",
        td26: "Cessione di beni ammortizzabili e per passaggi interni ",
        td27: "Fattura per autoconsumo o per cessioni gratuite senza rivalsa",
    };
    const ivaNatureMap: any = {
        n1: "Escluse (ex art.15)",
        n2: "Non soggette",
        "n2.1": "Non soggette (art. 7, D.P.R N.633/72)",
        "n2.2": "Non soggette (Altri casi)",
        n3: "Non imponibili",
        "n3.1": "Non imponibili (Esportazioni)",
        "n3.2": "Non imponibili (Cessioni intracomunitarie)",
        "n3.3": "Non imponibili (Cessioni verso San Marino)",
        "n3.4": "Non imponibili (Operazioni assimilate alle cessioni all'esportazione)",
        "n3.5": "Non imponibili (Seguito dichiarazioni d'intento)",
        "n3.6": "Non imponibili (Altre operazioni)",
        n4: "Esenti",
        n5: "Regime del margine, IVA non esposta in fattura",
        n6: "Inversione contabile (Operazioni in reverse charge)",
        "n6.1": "Inversione contabile (Cessione di rottami e altri materiali di recupero)",
        "n6.2": "Inversione contabile (Cessione oro e argento puro)",
        "n6.3": "Inversione contabile (Subappalto settore edile)",
        "n6.4": "Inversione contabile (Cessione di fabbricati)",
        "n6.5": "Inversione contabile (Cessione telefoni cellulari)",
        "n6.6": "Inversione contabile (Cessione prodotti elettronici)",
        "n6.7": "Inversione contabile (Prestazioni comparto edile e settori connessi)",
        "n6.8": "Inversione contabile (Operazioni settore energetico)",
        "n6.9": "Inversione contabile (Altri casi)",
    };
    const rtMap: any = {
        rt01: "Persone fisiche",
        rt02: "Persone giuridiche",
        rt03: "Contributo INPS",
        rt04: "Contributo ENASARCO",
        rt05: "Contributo ENPAM",
        rt06: "Altro contributo",
    };
    const getIvaNatureMap = computed(() => ivaNatureMap);
    const getDocTypeMap = computed(() => docTypeMap);
    const getRtMap = computed(() => rtMap);

    const getReadableDocType = (code: string | null | undefined): string => {
        if (stringUtils.isNullOrEmpty(code)) return "";
        let elem = docTypeMap[code!.toLowerCase()];
        if (elem === undefined) return code!.toUpperCase();
        return `${code?.toUpperCase()} - ${elem}`;
    };
    const getReadableRt = (code: string | null | undefined): string => {
        if (stringUtils.isNullOrEmpty(code)) return "";
        let elem = rtMap[code!.toLowerCase()];
        if (elem === undefined) return code!.toUpperCase();
        return `${code?.toUpperCase()} - ${elem}`;
    };

    const getReadableNatureType = (code: string): string => {
        if (stringUtils.isNullOrEmpty(code)) return "";

        let elem = ivaNatureMap[code.toLowerCase()];
        if (elem === undefined) return code.toUpperCase();
        return `${code?.toUpperCase()} - ${elem}`;
    };
    return { getReadableDocType, getReadableNatureType, getReadableRt, getIvaNatureMap, getDocTypeMap, getRtMap };
};
