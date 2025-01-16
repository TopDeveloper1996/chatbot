import l from "lodash";
import { parse } from "date-fns";
import { error, success } from "~/server/src/response";
import { computeDittaSummaryAnalytics } from "~/src/algorithm/ditta_summary_computer";
import Timespan from "~/src/timespan";
import AnalyticsDatabase, { Database } from "../../src/db/analytics_db";
import ParserDatabase from "../../src/db/parser_db";
import UserDatabase from "../../src/db/user_db";
import { computeIncomeStatementAnalytics } from "~/src/algorithm/income_statement_computer";
import * as stringUtils from "~/src/common/string";
export default defineEventHandler(async (event) => {
    try {
       
        assertMethod(event, ["POST"]);
        const body = await readBody(event);
        const dittaId = body.dittaId?.toString();
        const customerId = body.customerId?.toString();
        // const minDate = new Date(
        //     Math.min(
        //         body.firstPeriod.from * 1000,
        //         body.firstPeriod.to * 1000,
        //         body.secondPeriod.from * 1000,
        //         body.secondPeriod.to * 1000
        //     )
        // );
        // const maxDate = new Date(
        //     Math.max(
        //         body.firstPeriod.from * 1000,
        //         body.firstPeriod.to * 1000,
        //         body.secondPeriod.from * 1000,
        //         body.secondPeriod.to * 1000
        //     )
        // );
        // const firstPeriod = new Timespan(new Date(body.firstPeriod.from * 1000), new Date(body.firstPeriod.to * 1000));
        // const secondPeriod = new Timespan(
        //     new Date(body.secondPeriod.from * 1000),
        //     new Date(body.secondPeriod.to * 1000)
        // );
        let start = performance.now();

        let summaries : any = {};
    
        
        const data = await fetch_data({
            cpaId: customerId,
            dittaId: Number(dittaId),
            from:  Timespan.previous12Months().from,
            to: Timespan.yearToDate().to,
        })
        console.log(`colledted data for ${customerId} and ditta ${dittaId} > ${data[0].length} invoices, ${data[1].length} fees, ${data[2].length} f24, ${data[3].length} user_provided_data`);

        summaries['ytd'] = await prepare_summery({
            dittaId: Number(dittaId),
            invoices: data[0],
            fees: data[1],
            f24: data[2],
            user_provided_data: data[3],
            firstPeriod: Timespan.yearToDateLastYear(),
            secondPeriod: Timespan.yearToDate(),
        });
        summaries['p12m'] = await prepare_summery({
            dittaId: Number(dittaId),
            invoices: data[0],
            fees: data[1],
            f24: data[2],
            user_provided_data: data[3],
            firstPeriod: Timespan.previous12Months(),
            secondPeriod: Timespan.last12Months(),
        });
        const get_last_month = new Date();
        get_last_month.setMonth(get_last_month.getMonth() - 1);
       
        const activeTimespan = new Timespan(new Date(get_last_month.getFullYear(), get_last_month.getMonth(), 1),
        new Date(get_last_month.getFullYear(), get_last_month.getMonth() + 1, 0));

        summaries['income_statement'] = await prepare_income_statement({
            dittaId: Number(dittaId),
            invoices: data[0],
            fees: data[1],
            f24: data[2],
            user_provided_data: data[3],
            activeTimespan: activeTimespan,
        });
        
        const responseData = await get_ditta_text_summary({ditta_id: Number(dittaId), cpa_id: Number(customerId)})
        const focus_period_label = `Mese precedente - ${stringUtils.toMonthYearString(get_last_month)}`
        summaries["focus_period_label"] = focus_period_label ?? "Mese precedente";
        summaries["report_summary"]=null
        summaries["report_final_comment"]=null
        if (responseData.length > 0){
            summaries["report_summary"] = responseData[0].ditta_360_report_summary;
            summaries["report_final_comment"] = responseData[0].ditta_360_report_final_comment;
        }

        console.log(`ditta_summary [compute] completed in ${(performance.now() - start).toFixed(3)} ms`);
        return success(event, 200, summaries);
    } catch (ex) {
        console.error(ex);
        return error(event, 403, "error retrieving data, exception in server. Check that request is correct.");
    }
});



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
        console.log("get_user_provided_data", dittaId);
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

async function get_ditta_text_summary({
    ditta_id, cpa_id
    }:{ditta_id: number, cpa_id:number}){
        try {
            let db = await UserDatabase.get();
            let res = await Promise.resolve(
                db`
                SELECT ditta_360_report_summary, ditta_360_report_final_comment FROM ditta WHERE _ditta_id = ${ditta_id!} and customer_id = ${cpa_id!};
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
async function prepare_summery({
    dittaId,
    invoices,
    fees,
    f24,
    user_provided_data,
    firstPeriod,
    secondPeriod
    }:{dittaId: number; invoices: any[]; fees: any[]; f24: any[]; user_provided_data: any[]; firstPeriod: Timespan; secondPeriod: Timespan}){
    try {
        
       
        const timespan = new Timespan(firstPeriod.from, secondPeriod.to);
        
        const filteredInvoices = invoices.filter(
            (i) =>timespan.fits(i["emission_date"])
        );
        const filteredFees = fees.filter(
            (i) => i["ditta_id"] == dittaId && timespan.fits(i["detection_date"])
        );
        const filteredF24 = f24.filter(
            (i) => i["ditta_id"] == dittaId && timespan.fits(i["application_date"])
        );
        const filteredUserDefinedCosts =user_provided_data.filter(
            (i) => i["income_statement_type"] == 'cost');
        const filteredUserDefinedITDA = user_provided_data.filter(
                (i) => i["income_statement_type"] == 'itda');
      
        const summary =  computeDittaSummaryAnalytics({
                    invoices: filteredInvoices,
                    f24s: filteredF24,
                    fees: filteredFees,
                    userDefinedCosts: filteredUserDefinedCosts,
                    userDefinedITDA: filteredUserDefinedITDA,
                    firstPeriod: firstPeriod,
                    secondPeriod: secondPeriod,
                });
        summary["newClients"] = summary["newClients"].length ?? 0;
        summary["inactiveClients"] = summary["inactiveClients"].length ?? 0;
        summary["secondPeriod"]["activeClientIds"] = summary["secondPeriod"]["activeClientIds"].length ?? 0;
        summary["firstPeriod"]["activeClientIds"] = summary["firstPeriod"]["activeClientIds"].length ?? 0;
       
        return summary;
    } catch (ex: any) {
        throw createError({
            statusCode: 422,
            message: ex.toString(),
        });
    }

}

async function prepare_income_statement({
    dittaId,
    invoices,
    fees,
    f24,
    user_provided_data,
    activeTimespan,
    }:{dittaId: number; invoices: any[]; fees: any[]; f24: any[]; user_provided_data: any[]; activeTimespan: Timespan}){
    try {
        
        
        return computeIncomeStatementAnalytics({
            invoices: invoices,
            f24s: f24,
            fees: fees,
            userProvidedData: user_provided_data,
            dittaId: dittaId.toString(),
            focustimespan: activeTimespan,
        });
    } catch (ex: any) {
        throw createError({
            statusCode: 422,
            message: ex.toString(),
        });
    }
}