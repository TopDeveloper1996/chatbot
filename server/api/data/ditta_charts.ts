import l from "lodash";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { parse } from "date-fns";
import { error, success } from "~/server/src/response";
import { DittaSummaryOverAllChart, DittaSummaryChart } from "~/src/types/analytics_types";
import { Grouping } from "~/src/types/common_types";
import { InvoicesStatistics } from "~/src/types/invoice_store_types";
import Timespan from "~/src/timespan";
import AnalyticsDatabase, { Database } from "../../src/db/analytics_db";
import ParserDatabase from "../../src/db/parser_db";
import * as invoiceComputer from "~/src/algorithm/invoice_computer";
export default defineEventHandler(async (event) => {
    try {
      
        assertMethod(event, ["POST"]);
        const body = await readBody(event);
        const dittaId = body.dittaId?.toString();
        const customerId = body.customerId?.toString();
 
        let start = performance.now();
        const now = new Date();
        let chart : any = {};
    
        
        const data = await fetch_data({
            cpaId: customerId,
            dittaId: Number(dittaId),
            from:  Timespan.yearToDateLastYear().from,
            to: Timespan.last8MonthsToFuture4months().to,
        })
        console.log(`colledted data for ${customerId} and ditta ${dittaId} > ${data[0].length} invoices, ${data[1].length} fees, ${data[2].length} f24, ${data[3].length} user_provided_data`);
        chart["dittaStatsSeries"] = await prepare_chart({
            activetimespan:Timespan.thisYear(), dittaId: dittaId, invoices: data[0], fees: data[1], f24: data[2], user_provided_data: data[3]
        });
        let categories = Timespan.getMonthlyIntervals(Timespan.thisYear()).map((d) => format(d.from, "MMM yy", { locale: it }));
        chart["dittaStatsSeries"]["categories"] = categories;

        chart["dittaStatsSeriesytd"] = await prepare_chart({
            activetimespan:Timespan.yearToDate(), dittaId: dittaId, invoices: data[0], fees: data[1], f24: data[2], user_provided_data: data[3]
        });

        categories = Timespan.getMonthlyIntervals(Timespan.yearToDate()).map((d) => format(d.from, "MMM", { locale: it }));
        chart["dittaStatsSeriesytd"]["categories"] = categories;

        chart["dittaStatsSerieslytd"] = await prepare_chart({
            activetimespan:Timespan.yearToDateLastYear(), dittaId: dittaId, invoices: data[0], fees: data[1], f24: data[2], user_provided_data: data[3]
        });

        chart["dittaStatsSerieslytd"]["categories"] = categories;

        chart["cashFlowProjection"] = {"actives":{}, "passives":{}};
        const cashFlowProjection = await invoicesComputeStats({
            invoices: data[0],
            timespan: Timespan.last8MonthsToFuture4months(),
        });
        
        chart["toPayInvoices"]= cashFlowProjection.passives.elements.filter((i) => i.payment_date.getTime() >= now.getTime());
        
        chart["toPayInvoices"].forEach(r => {
           
            r['items_count']=Number(r["items"]?.length ?? 0);
            delete r["items"];
            
          });
        chart["toReceiveInvoices"] = cashFlowProjection.actives.elements.filter((i) => i.payment_date.getTime() >= now.getTime());
        chart["toReceiveInvoices"].forEach(r => {
         
            r['items_count']=Number(r["items"]?.length ?? 0);
            delete r["items"];
          });
     
        
        chart["cashFlowProjection"]["actives"]["sumByPaymentTimespan"] = cashFlowProjection.actives.sumByPaymentTimespan;
        chart["cashFlowProjection"]["actives"]["sumByTimespan"] = cashFlowProjection.actives.sumByTimespan;

        chart["cashFlowProjection"]["passives"]["sumByPaymentTimespan"] = cashFlowProjection.passives.sumByPaymentTimespan;
        chart["cashFlowProjection"]["passives"]["sumByTimespan"] = cashFlowProjection.passives.sumByTimespan;

        chart["cashFlowProjection"]["invoicesByTimespanKey"] = cashFlowProjection.invoicesByTimespan[0].key;
        chart["cashFlowProjection"]["timespan"] = cashFlowProjection.timespan;
        chart["cashFlowProjection"]["intervalAggregation"] = cashFlowProjection.intervalAggregation;

        chart["cashFlowProjection"]["title"] = cashFlowProjection.invoicesByTimespan.length < 1
                ? ""
                : `Dal ${cashFlowProjection.invoicesByTimespan[0].key.from.toLocaleDateString()} al ${cashFlowProjection.invoicesByTimespan[
                      cashFlowProjection.invoicesByTimespan.length - 1
                  ].key.to.toLocaleDateString()}`;
        
        categories = Timespan.getMonthlyIntervals(Timespan.last8MonthsToFuture4months()).map((d) => format(d.from, "MMM yy", { locale: it }));
        chart["cashFlowProjection"]["categories"] = categories;
        
        console.log(`ditta_summary [compute] completed in ${(performance.now() - start).toFixed(3)} ms`);
        return success(event, 200, chart);
    } catch (ex) {
        console.error(ex);
        return error(event, 403, "error retrieving data, exception in server. Check that request is correct.");
    }
});

const invoicesComputeStats = async ({
    timespan = Timespan.all(),
    invoices,
    grouping,
}: {
    timespan: Timespan;
    invoices: any[];
    grouping?: Grouping | undefined;
}): Promise<InvoicesStatistics> => {
    return invoiceComputer.invoicesComputeStats({
        invoices: invoices,
        timespan: timespan,
        grouping: grouping,
    });
};


async function get_invoices({
    cpaId,
    dittaId,
    from,
    to
    }:{cpaId: string; dittaId: number; from: Date; to: Date;}){
    try {
  
        let endpoint = await AnalyticsDatabase.getDb(Database.invoice);
        const documentsArray = await endpoint
        .collection(cpaId!)
        .find({
            $and: [
                { ditta_id: dittaId },
                {
                    $or: [
                        {
                            $and: [
                                {
                                    type: "attiva",
                                },
                                {
                                    $expr: {
                                        $and: [
                                            {
                                                $gte: [
                                                    {
                                                        $dateFromString: {
                                                            dateString: "$emission_date",
                                                            format: "%d-%m-%Y",
                                                        },
                                                    },
                                                    from,
                                                ],
                                            },
                                            {
                                                $lte: [
                                                    {
                                                        $dateFromString: {
                                                            dateString: "$emission_date",
                                                            format: "%d-%m-%Y",
                                                        },
                                                    },
                                                    to,
                                                ],
                                            },
                                        ],
                                    },
                                },
                            ],
                        },
                        {
                            $and: [
                                {
                                    type : "passiva",
                                },
                                {
                                    $expr: {
                                        $and: [
                                            {
                                                $gte: [
                                                    {
                                                        $dateFromString: {
                                                            dateString: "$data_consegna",
                                                            format: "%d-%m-%Y",
                                                        },
                                                    },
                                                    from,
                                                ],
                                            },
                                            {
                                                $lte: [
                                                    {
                                                        $dateFromString: {
                                                            dateString: "$data_consegna",
                                                            format: "%d-%m-%Y",
                                                        },
                                                    },
                                                    to,
                                                ],
                                            },
                                        ],
                                    },
                                },
                            ],
                        },
                    ],
                },
            ],
        })
        .toArray();
        const res = documentsArray.map((_: any, i: number, array: any[]) => {
            array[i]["emission_date"] = parse(array[i]["emission_date"], "dd-MM-yyyy", new Date());
            array[i]["receive_date"] = parse(array[i]["receive_date"], "dd-MM-yyyy", new Date());
            if (array[i]["document_type"]?.toLocaleLowerCase() === "td04") {
                for (const item of array[i]["items"] ?? []) {
                    item["total"] = Math.abs(item["total"]) * -1;
                }
                array[i]["total_amount"] = Math.abs(array[i]["total_amount"]) * -1;
                array[i]["total_without_iva"] = Math.abs(array[i]["total_without_iva"]) * -1;
                array[i]["total_iva"] = Math.abs(array[i]["total_iva"]) * -1;
            }
            array[i]["payment_date"] =
                array[i]["payment_date"] != undefined
                    ? parse(array[i]["payment_date"], "dd-MM-yyyy", new Date())
                    : array[i]["emission_date"];
            return array[i];
        })
        .sort((a: any, b: any) => b["emission_date"].getTime() - a["emission_date"].getTime());
      
        return res;
    } catch (ex: any) {
        throw createError({
            statusCode: 422,
            message: ex.toString(),
        });
    }

}

async function get_fees({
    cpaId,
    dittaId,
    }:{cpaId: string; dittaId: number}){
    try {
        
        const customer = cpaId;
        let endpoint = await AnalyticsDatabase.getDb(Database.fee);
        let r = await endpoint.collection(customer!).find({"ditta_id":dittaId}).toArray();
       

        const res = r.map((e: any) => {
            if (e["detection_date"]) {
                e["detection_date"] = parse(e["detection_date"], "dd-MM-yyyy", new Date());
            }
            return e;
        })
        .sort((a: any, b: any) => b["detection_date"].getTime() - a["detection_date"].getTime());
     
        return res;
    } catch (ex: any) {
        throw createError({
            statusCode: 422,
            message: ex.toString(),
        });
    }

}

async function get_f24({
    cpaId,
    dittaId,
    }:{cpaId: string; dittaId: number}){
    try {
        
        const customer = cpaId;
        let endpoint = await AnalyticsDatabase.getDb(Database.f24);
        let r = await endpoint.collection(customer!).find({"ditta_id":dittaId}).toArray();

     
        const res = r.map((_: any, i: number, array: any[]) => {
            array[i]["application_date"] = parse(
                array[i]["application_date"],
                "dd-MM-yyyy",
                new Date()
            );
            return array[i];
        })
        .sort((a: any, b: any) => b["application_date"].getTime() - a["application_date"].getTime());
      
        return res;
    } catch (ex: any) {
        throw createError({
            statusCode: 422,
            message: ex.toString(),
        });
    }

}

async function get_user_provided_data({
    dittaId,
    }:{dittaId: number}){
        try {
            let db = await ParserDatabase.get();
            let res = await Promise.resolve(
                db`
                SELECT detail.income_statement_type, detail.category, detail.income_statement_value, main.period_year, main.period_month 
                FROM ditta_income_statement_main main
                JOIN ditta_income_statement_detail detail
                ON main.id = detail.income_statement_main_id
                AND main.data_source = 'user'
                AND main.ditta_id = ${dittaId!} 
                order by main.period_year desc, main.period_month desc
                `
            );
         
          
            return res;
        } catch (ex: any) {
            console.error(ex);
            throw createError({
                statusCode: 422,
                message: ex.toString(),
            });
        }

}

async function fetch_data({
    cpaId,
    dittaId,
    from,
    to
    }:{cpaId: string; dittaId: number; from: Date; to: Date}) {
    try{
        const data = await Promise.all([
            get_invoices({
                cpaId: cpaId,
                dittaId: dittaId,
                from: from,
                to: to,
            }), get_fees({
                cpaId: cpaId,
                dittaId: dittaId,
            }), get_f24({
                cpaId: cpaId,
                dittaId: dittaId,
            }),
            get_user_provided_data({
                dittaId: dittaId
            })
    
        ]);
        return data;
    }
    catch (ex: any) {
        console.error(ex);
        throw createError({
            statusCode: 422,
            message: ex.toString(),
        });
    }
    
    
}
async function prepare_chart({
    activetimespan,
    dittaId,
    invoices,
    fees,
    f24,
    user_provided_data,
    }:{activetimespan:Timespan; dittaId: number; invoices: any[]; fees: any[]; f24: any[]; user_provided_data: any[];}){
    try {
        
        
        const filteredInvoices = invoices.filter(
            (i) =>activetimespan.fits(i["emission_date"])
        );
        const filteredFees = fees.filter(
            (i) => i["ditta_id"] == dittaId && activetimespan.fits(i["detection_date"])
        );
        const filteredF24 = f24.filter(
            (i) => i["ditta_id"] == dittaId && activetimespan.fits(i["application_date"])
        );
      
        const chart = await computeDittaStatsSeries({activetimespan:activetimespan, ditta_f24s: filteredF24, ditta_invoices: filteredInvoices, ditta_fees: filteredFees, userProvidedData:user_provided_data});
        
        return chart;
    } catch (ex: any) {
        throw createError({
            statusCode: 422,
            message: ex.toString(),
        });
    }

}

async function computeDittaStatsSeries({activetimespan, ditta_f24s, ditta_invoices, ditta_fees, userProvidedData}:{activetimespan: Timespan; ditta_f24s: any[]; ditta_invoices: any[]; ditta_fees: any[]; userProvidedData: any[]}): Promise<DittaSummaryOverAllChart> {
    
    const statsSeries = <DittaSummaryOverAllChart>{
        ricavi: [],
        costi: [], // costi_fissi_variabili + costi_operativi
        margine_lordo: [],
        ebitda: [], // ricavi - costi
        itda: [],
        profitto_netto: [], // ricavi - costi - itda
        costi_fissi_variabili: [],
        costi_operativi: [],
        year: [],
        month: [],
        isUserProvideData: [],
    };
    
    Timespan.getMonthlyIntervals(activetimespan).map((i) => {
     
      
        const filteredF24s = ditta_f24s.filter((f) => i.fits(f.application_date));
        const filteredInvoices = ditta_invoices.filter((a) => i.fits(a.emission_date));
        const filteredfees = ditta_fees.filter((fe) => i.fits(fe.detection_date));
        const filteredUserProvideData = userProvidedData.filter(
        (a: any) =>
          a.period_month === i.from.getMonth() + 1 &&
          a.period_year === i.from.getFullYear()
      );
     
      const summary = computeDittaSummary({ 
        invoices : filteredInvoices,
        fees: filteredfees,
        f24s: filteredF24s,
        userProvidedData: filteredUserProvideData,
        timespan: i});
      
      
      statsSeries.ricavi.push(summary.ricavi);
      statsSeries.costi.push(summary.costi);
      statsSeries.margine_lordo.push(summary.margine_lordo);
      statsSeries.ebitda.push(summary.ebitda);
      statsSeries.itda.push(summary.itda);
      statsSeries.profitto_netto.push(summary.profitto_netto);
      statsSeries.costi_fissi_variabili.push(summary.costi_fissi_variabili);
      statsSeries.costi_operativi.push(summary.costi_operativi);
      statsSeries.year.push(summary.year);
      statsSeries.month.push(summary.month);
      statsSeries.isUserProvideData.push(summary.isUserProvideData);
    });
    return statsSeries;
  };

function computeDittaSummary({
        invoices,
        fees,
        f24s,
        userProvidedData,
        timespan,
    }: {
        invoices: any[];
        fees: any[];
        f24s: any[];
        userProvidedData: any[];
        timespan: Timespan;
    }) {

        let stats = <DittaSummaryChart>{ 
            ricavi: 0,
            costi: 0, // costi_fissi_variabili + costi_operativi
            margine_lordo: 0,
            ebitda: 0, // ricavi - costi
            itda: 0,
            profitto_netto: 0, // ricavi - costi - itda
            costi_fissi_variabili: 0,
            costi_operativi: 0,
            year: 0,
            month: 0,
            isUserProvideData: userProvidedData.length > 0 ? true : false};
        const taxesCategories = ["versamenti reddito", "ires", "irap", "tasse locali", "tasse regionali"];
        let taxes = 0
        
        
        for (const f24 of f24s?? []) {
            for (const aggregationKey in f24.aggregations) {
                if (!taxesCategories.includes(aggregationKey)) continue;
                taxes += f24.aggregations[aggregationKey].balance_amount;
            }
        }
        
        let focusUserProvideDataCost = userProvidedData.filter((f) => f.income_statement_type == 'cost');
        let focusUserProvideDataITDA = userProvidedData.filter((f) => f.income_statement_type == 'itda');
        
        
        let user_provided_cost = 0;
        let user_provided_itda = 0;
        for (const user_cost of focusUserProvideDataCost?? []) { 
            user_provided_cost += Number(user_cost["income_statement_value"]);
            
        }
        for (const user_itdas of focusUserProvideDataITDA ?? []) { 
            user_provided_itda += Number(user_itdas["income_statement_value"]);
            
        }
        const total_fees=l.sumBy(fees, "total_without_iva");  
        
        
        stats.ricavi = l.sumBy(
            invoices.filter((e) => e.type === "attiva"),
            "total_without_iva"
        );
        let production_cost = l.sumBy(
            invoices.filter((e) => e.type === "passiva"),
            "total_without_iva"
        );
        
        stats.ricavi+= total_fees;
        stats.costi_fissi_variabili = production_cost;
        stats.margine_lordo = stats.ricavi - stats.costi_fissi_variabili;
        stats.costi_operativi = user_provided_cost;
        stats.costi = production_cost + user_provided_cost;
        
        stats.ebitda = stats.ricavi - stats.costi;
        stats.itda = user_provided_itda;
        stats.profitto_netto = stats.ricavi - stats.costi - stats.itda - taxes;
        stats.year = timespan.from.getFullYear();
        stats.month = timespan.from.getMonth() + 1;

    
    return stats;
    };
