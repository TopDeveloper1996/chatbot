import { parse } from "date-fns";
import l from "lodash";
import AnalyticsDatabase, { Database } from "../db/analytics_db";
import ParserDatabase from "../db/parser_db";
import UserDatabase from "../db/user_db";

export async function fetchInvoices({
    customerId,
    dittaIds,
    from,
    to,
}: {
    customerId: string;
    dittaIds: string[];
    from: Date;
    to: Date;
}): Promise<{ dittaId: string; elements: any[] }[]> {
    let endpoint = await AnalyticsDatabase.getDb(Database.invoice);
    const documentsArray = await endpoint
    .collection(customerId!)
    .find({
        $and: [
            { ditta_id: { $in: dittaIds } },
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
    const documents = documentsArray
      .map((_: any, i: number, array: any[]) => {
        array[i]["emission_date"] = parse(
          array[i]["emission_date"],
          "dd-MM-yyyy",
          new Date()
        );
        array[i]["receive_date"] = parse(
          array[i]["receive_date"],
          "dd-MM-yyyy",
          new Date()
        );
        array[i]["is_active"] = array[i]["type"] === "attiva";
        const document_type = array[i]["document_type"]?.toLocaleLowerCase();
        if (["td04", "td08", "td20", "td21"].includes(document_type)) {
          for (const item of array[i]["items"] ?? []) {
            item["total"] = Math.abs(item["total"]) * -1;
          }
          array[i]["total_amount"] = Math.abs(array[i]["total_amount"]) * -1;
          array[i]["total_without_iva"] =
            Math.abs(array[i]["total_without_iva"]) * -1;
          array[i]["total_iva"] = Math.abs(array[i]["total_iva"]) * -1;
        } else if (
          ["td17", "td18"].includes(document_type) &&
          array[i]["is_foreign"] === true
        ) {
          // for active and passive invoices, ignore iva for foreign invoices
          array[i]["total_amount"] = array[i]["total_without_iva"]; // ignore iva for foreign invoices
          array[i]["total_iva"] = 0; // ignore iva for foreign invoices
        } else if (document_type === "td02") {
          if (
            documentsArray.filter(
              (v) =>
                v["invoice_number"] === array[i]["invoice_number"] &&
                v["receive_date"] === array[i]["receive_date"] &&
                v["_id"] != array[i]["_id"]
            ).length > 0
          ) {
            array[i]["total_amount"] = 0;
            array[i]["total_without_iva"] = 0;
            array[i]["total_iva"] = 0;
          }
        }

        array[i]["payment_date"] =
          array[i]["payment_date"] != undefined
            ? parse(array[i]["payment_date"], "dd-MM-yyyy", new Date())
            : array[i]["emission_date"];
        return array[i];
      })
      .sort(
        (a: any, b: any) =>
          b["emission_date"].getTime() - a["emission_date"].getTime()
      );

    return Object.entries(l.toPlainObject(l.groupBy(documents, "ditta_id"))).map((e) => ({
        dittaId: e[0],
        elements: e[1] as any,
    }));
}
export async function fetchFees({
    customerId,
    dittaIds,
    from,
    to,
}: {
    customerId: string;
    dittaIds: string[];
    from: Date;
    to: Date;
}): Promise<{ dittaId: string; elements: any[] }[]> {
    let endpoint = await AnalyticsDatabase.getDb(Database.fee);
    const documents = (
        await endpoint
            .collection(customerId!)
            .find({
                $and: [
                    { ditta_id: { $in: dittaIds } },
                    {
                        $expr: {
                            $gte: [
                                {
                                    $dateFromString: {
                                        dateString: "$detection_date",
                                        format: "%d-%m-%Y",
                                    },
                                },
                                from,
                            ],
                        },
                    },
                    {
                        $expr: {
                            $lte: [
                                {
                                    $dateFromString: {
                                        dateString: "$detection_date",
                                        format: "%d-%m-%Y",
                                    },
                                },
                                to,
                            ],
                        },
                    },
                ],
            })
            .toArray()
    ).map((_: any, i: number, array: any[]) => {
        array[i]["detection_date"] = parse(array[i]["detection_date"], "dd-MM-yyyy", new Date());
        return array[i];
    });
    return Object.entries(l.toPlainObject(l.groupBy(documents, "ditta_id"))).map((e) => ({
        dittaId: e[0],
        elements: e[1] as any,
    }));
}

export async function fetchF24({
    customerId,
    dittaIds,
    from,
    to,
}: {
    customerId: string;
    dittaIds: string[];
    from: Date;
    to: Date;
}): Promise<{ dittaId: string; elements: any[] }[]> {
    let endpoint = await AnalyticsDatabase.getDb(Database.f24);
    const documents = (
        await endpoint
            .collection(customerId!)
            .find({
                $and: [
                    { ditta_id: { $in: dittaIds } },
                    {
                        $expr: {
                            $gte: [
                                {
                                    $dateFromString: {
                                        dateString: "$application_date",
                                        format: "%d-%m-%Y",
                                    },
                                },
                                from,
                            ],
                        },
                    },
                    {
                        $expr: {
                            $lte: [
                                {
                                    $dateFromString: {
                                        dateString: "$application_date",
                                        format: "%d-%m-%Y",
                                    },
                                },
                                to,
                            ],
                        },
                    },
                ],
            })
            .toArray()
    ).map((_: any, i: number, array: any[]) => {
        array[i]["application_date"] = parse(array[i]["application_date"], "dd-MM-yyyy", new Date());
        return array[i];
    });
    return Object.entries(l.toPlainObject(l.groupBy(documents, "ditta_id"))).map((e) => ({
        dittaId: e[0],
        elements: e[1] as any,
    }));
}


export async function fetchTeamsystemAccounts({
    customerId,
    dittaIds,
}: {
    customerId: string;
    dittaIds: string[];
}): Promise<{ dittaId: string; report :any,elements: any[] }[]> {
    let result: any[] = [];
    let db = await ParserDatabase.get();
    for (const ditta of dittaIds) {
        let useDb = await UserDatabase.get();
        let report = {
            ts_report_summary: "",
            ts_report_final_comment: "",
        };
        let reportRes = await Promise.resolve(
            useDb`
            SELECT ts_report_summary, ts_report_final_comment FROM ditta WHERE _ditta_id = ${ditta!} and customer_id = ${customerId!}
            `
        );
        if (reportRes.length > 0) {
            report.ts_report_final_comment = reportRes[0].ts_report_final_comment;
            report.ts_report_summary = reportRes[0].ts_report_summary;
        }

        const dittaNumbers = await Promise.resolve(
            useDb`
            SELECT ditta_number FROM ditta WHERE _ditta_id  = ${ditta!} and customer_id = ${customerId!}
            `
        );
        if (dittaNumbers.length === 0) {
            continue;
        }
        const dittaNumber = dittaNumbers[0].ditta_number;
        let accounts = await Promise.resolve(
            db`
            SELECT opening_balance_amount, balance_amount , balance_date, account,from_date, to_date,period_year, period_month FROM ditta_account_balance WHERE ditta_id = ${dittaNumber!} and customer_id = ${customerId!} order by from_date desc
            `
        );
        const updatedAccounts = accounts.map((i: any) => {
            return {
              ...i,
              balance_amount: parseFloat(i.balance_amount),
              opening_balance_amount: parseFloat(i.opening_balance_amount),
              period_date: new Date(i.period_year, i.period_month -1 , 1, 0, 0, 0), 
            };
          });
          result.push({
            dittaId: ditta,
            report,
            elements: updatedAccounts,
          });
          }
    return result;
};
