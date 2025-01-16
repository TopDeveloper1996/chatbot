import { parse } from "date-fns";
import { aggregateDocumentsInTimespan } from "~/src/common/aggregator";
import { stringToF24Category } from "~/src/common/string";
import Timespan from "~/src/timespan";

const categoryToField = {
    "Costo del Lavoro": "costoLavoro",
    "Ammortamenti, svalutazioni e altri accantonamenti": "ammortamentiSvalutazioniAccantonamenti",
    "Oneri finanziari e Bancari (+/-)": "oneriFinanziariBancari",
    "Ricavi dal valore della produzione": "ricaviValoreProduzione",
    "Altri costi operativi": "altriCostiOperativi",
    "salaries": "salari_e_stipendi",
    "Contributi INPS": "contributi_inps",
    "Contributi INAIL": "contributi_inail",
    "TFR": "tfr",
    "Altre voci": "altre_voci",
    "Ratei ferie e permessi": "ratei_ferie_e_permessi",
    "Oneri diversi di gestione e altri costi operativi": "OneriDiversiDiGestioneAltriCostiOperativi",
    "Proventi finanziari": "ProventiFinanziari",
    "Oneri bancari": "oneriBancari",
    "Svalutazioni": "svalutazioni",
    "Altri accantonamenti": "altriAccantonamenti",
    "Ammortamenti":'ammortamenti'

};
const Altri_costi_operativi = [];
const Costo_del_lavoro = ["salaries", "Contributi INPS", "Contributi INAIL", "TFR", "Altre voci", "Ratei ferie e permessi"];
const Oneri_finanziari_e_oneri_bancari = ["Proventi finanziari", "Oneri bancari"];
const Ammortamenti_svalutazioni_e_altri_accantonamenti = ["Ammortamenti","Svalutazioni", "Altri accantonamenti"];

const getFieldToCategory = () => {
    const fieldToCategory = {};
    for (let key in categoryToField) {
        fieldToCategory[categoryToField[key]] = key;
    }
    return fieldToCategory;
}

const groupBy = (keys: any[]) => (array: any[]) =>
    array.reduce((objectsByKeyValue: { [x: string]: any; }, obj: { [x: string]: any; }) => {
      const value = keys.map((key: string | number) => obj[key]).join('-');
      objectsByKeyValue[value] = (objectsByKeyValue[value] || []).concat(obj);
      return objectsByKeyValue;
    }, {});
    
export const useDittaCustomIncome = defineStore("dittaCustomIncome", () => {
    const customIncomes = ref<any[]>([]);
    const endpoints = useEndpoints();
    const loading = ref(false);
    let fetchPromise: Promise<any> | undefined = undefined;
    const { api } = useApi();

    function $reset() {
        customIncomes.value = [];
    }

    const getCustomIncomeInTimespan = async ({
        timespan,
        dittaId,
        cpaId,
    }: {
        timespan: Timespan;
        dittaId?: string;
        cpaId?: string;
    }) => {
        loading.value = true;
        let existingCustomIncomes:IncomeStatementUserInput[] = [];
        timespan.getYearMonthList().map(async (date) => {
            let existingCustomIncome = {};
            const response = await api(endpoints.dittaIncomeStatement, {
                query: {
                    dittaId:dittaId,
                    customerId: cpaId,
                    year: date.year,
                    month: date.month,
                },
            });
            console.log(response.data);
            const data: IncomeStatementUserInput = {
                salari_e_stipendi: 0,
                contributi_inps: 0,
                contributi_inail: 0,
                tfr: 0,
                altre_voci: 0,
                ratei_ferie_e_permessi: 0,
                ammortamentiSvalutazioniAccantonamenti: 0,
                ricaviValoreProduzione: 0,
                altriCostiOperativi: 0,
                period_year: date.year,
                period_month: date.month,
                ditta_id: 0,
                customer_id: 0
            };
            response.data.forEach((item: any) => {
                if (item.category === "Altri costi operativi") {
                    data.altriCostiOperativi = parseFloat(item.income_statement_value);
                }
                if (!categoryToField[item.sub_category]) return;
                const field = categoryToField[item.sub_category] as keyof IncomeStatementUserInput;
                data[field] = parseFloat(item.income_statement_value);
            });
            console.log({data})
            existingCustomIncomes.push(data)

        });
        customIncomes.value = existingCustomIncomes;
        console.log({existingCustomIncomes})
        loading.value = false;
        return;
    };

    const getCustomIncomes = async () => {
        return customIncomes.value
    } 

    const updateCustomIncomeInTimespan = async ({
        updateValues,
        dittaId,
        cpaId,
    }: {
        updateValues: any[];
        dittaId?: string;
        cpaId?: string;
    }) => {
        const updateDate = [];
        const fieldToCategory = getFieldToCategory();
        for (let i = 0; i < updateValues.length; i++) {
            const data = updateValues[i];
            for (let key in data) {
                let subCategory = fieldToCategory[key];
                let category = ""
                
                if (subCategory) {
                    if (Costo_del_lavoro.includes(subCategory)) { 
                        category = "Costo del lavoro";
                    }
                    if (Oneri_finanziari_e_oneri_bancari.includes(subCategory)) {
                        category = "Oneri finanziari e oneri bancari (+/-)";
                    }
                    if (Ammortamenti_svalutazioni_e_altri_accantonamenti.includes(subCategory)) {
                        category = "Ammortamenti, svalutazioni e altri accantonamenti";
                    }
                }
                if (key == "altriCostiOperativi"){
                    category = "Altri costi operativi";
                    subCategory = "";
                }
                if (category !== undefined && category !== "") {
                    updateDate.push({
                        category: category,
                        sub_category:subCategory,
                        income_statement_value: data[key] || 0,
                        income_statement_type: "cost",
                        period_year : data.period_year,
                        period_month : data.period_month,
                    });
                }
            };
        }
        const updateDataByMonthYear = groupBy(["period_year", "period_month"])(updateDate);
        await api(endpoints.dittaIncomeStatement, {
            method: "PATCH",
            body: {
                dittaId: dittaId,
                customerId: cpaId,
                data: updateDataByMonthYear,
            },
        })
        return;

    }

    return {
        $reset,
        loading,
        customIncomes,
        getCustomIncomes,
        getCustomIncomeInTimespan,
        updateCustomIncomeInTimespan
    };
});
