import axios, { AxiosError, isAxiosError } from "axios";
import { EventHandlerRequest, H3Event } from "h3";
import l from "lodash";
import AnalyticsDatabase, { Database } from "~/server/src/db/analytics_db";
import ScraperDatabase from "~/server/src/db/scraper_db";
import { error, success } from "~/server/src/response";
import Timespan from "~/src/timespan";


async function editDittas(
  event: H3Event<EventHandlerRequest>,
  dittaModels: any[]
): Promise<Object> {
  if (dittaModels.length <= 0) return success(event, 200, {});
  let body = await readBody(event);
  const scraperApiToken = body.scraper_api_token?.toString();
  let hasError = false;
  for (const ditta of dittaModels) {
    let dittaId = Number.parseInt(ditta.id);
    delete ditta.id;
    console.log(
      `patching edit ditta, model: ${JSON.stringify(ditta, undefined, "  ")}`
    );
    try {
      let result = await axios.patch(
        `https://ade.mentally.ai/api/v1/crawler/ditta/${dittaId}`,
        ditta,
        {
          headers: {
            Authorization: `Bearer ${scraperApiToken}`,
            "Content-Type": "application/json",
          },
        }
      );
    } catch (ex: any) {
      if (isAxiosError(ex)) {
        console.error(
          `error editing ditta: ${JSON.stringify(ex.response?.data)}`
        );
      }
      hasError = true;
    }
  }
  if (hasError) {
    return error(event, 400, "one or more error occured while editing dittas");
  }
  return success(event, 200, body);
}

async function deleteDittas(
  event: H3Event<EventHandlerRequest>,
  dittaModels: any[]
): Promise<Object> {
  if (dittaModels.length <= 0) return success(event, 200, {});
  let body = await readBody(event);
  const scraperApiToken = body.scraper_api_token?.toString();
  let hasError = false;
  for (const ditta of dittaModels) {
    console.log(ditta.id);
    let dittaId = Number.parseInt(ditta.id);
    delete ditta.id;
    console.log(
      `patching delete ditta, model: ${JSON.stringify(ditta, undefined, "  ")}`
    );
    try {
      let result = await axios.delete(
        `https://ade.mentally.ai/api/v1/crawler/ditta/${dittaId}`,
        {
          headers: {
            Authorization: `Bearer ${scraperApiToken}`,
            "Content-Type": "application/json",
          },
        }
      );
    } catch (ex: any) {
      if (isAxiosError(ex)) {
        console.error(`error deleting ditta: ${ex.response?.data}`);
      }
      hasError = true;
    }
  }
  if (hasError) {
    return error(event, 400, "one or more error occured while deleting dittas");
  }
  return success(event, 201, body);
}

async function addDittas(
  event: H3Event<EventHandlerRequest>,
  dittaModels: any[]
): Promise<Object> {
  if (dittaModels.length <= 0) return success(event, 200, {});
  let body = await readBody(event);
  const scraperApiToken = body.scraper_api_token?.toString();
  let hasError = false;
  for (const ditta of dittaModels) {
    console.log(
      `posting add ditta, model: ${JSON.stringify(ditta, undefined, "  ")}`
    );
    try {
      let result = await axios.post(
        "https://ade.mentally.ai/api/v1/crawler/ditta/",
        ditta,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${scraperApiToken}`,
          },
        }
      );
    } catch (ex: any) {
      console.error(`error adding ditta: ${ex}`);
      console.error(`error adding ditta: ${ex as AxiosError}`);
      hasError = true;
    }
  }
  if (hasError) {
    return error(event, 400, "one or more error occured while adding dittas");
  }
  return success(event, 201, body);
}

export default defineEventHandler(async (event) => {
  let db = await ScraperDatabase.get();
  const params = getQuery(event);
  const withCounts = params.withCounts || true;
  let analyticsDbDitta = await AnalyticsDatabase.getDb(Database.ditta);
  let analyticsDbInvoice = await AnalyticsDatabase.getDb(Database.invoice);
  let analyticsDbFee = await AnalyticsDatabase.getDb(Database.fee);
  let analyticsDbF24 = await AnalyticsDatabase.getDb(Database.f24);
  try {
    if (event.method === "GET") {
      const customer = params.customer_id?.toString();

      const dittas = await db`
                SELECT d.*, p.codice_entratel, p.enabled_profile_type, a.fiscal_code as appointing_subject_cf
                FROM ditta d
                    JOIN enabled_profiles p ON d.enabled_profile_id = p.id
                    LEFT JOIN appointing_subjects a ON a.id = d.appointing_subject_id
                WHERE d.cpa_id = ${customer!} AND d.is_deleted = false
                ORDER BY d.id`;

      const profiles = await db`
                SELECT *
                FROM enabled_profiles                    
                WHERE cpa_id = ${customer!} AND is_deleted = false`;

      const profilesIds = profiles.map((p) => p.id.toString());
      const collaborators = await db`
                SELECT *
                FROM appointing_subjects                    
                WHERE enabled_profile_id = ANY(${profilesIds}) AND is_deleted = false`;
      const dittaIds = Object.entries(dittas).map((d: any) =>
        Number.parseInt(d[1]["id"])
      );
      const res = (
        await analyticsDbDitta
          .collection(customer!)
          .find({ id: { $in: dittaIds } })
          .toArray()
      ).toSorted((a, b) => a.id - b.id);

      // console.log({invoiceCounts});
      //! Dittas are fetched from the production SQL database to maintain synchronization. This ensures that when a ditta is modified and the dittas are fetched, the data are updated. However, here we join the SQL data with the aggregated data in the CosmosDB so we have more complete data.
      const remappedFields = [
        "ateco_code",
        // "ateco_description",
        "rea_code",
        "address",
        "postal_code",
        "comune",
        "province",
      ];
      if (withCounts === 'true') {
        const invoiceCounts = await analyticsDbInvoice
        .collection(customer!)
        .aggregate([
          { $match: { ditta_id: { $in: dittaIds } } },
          { $group: { _id: "$ditta_id", count: { $sum: 1 } } },
        ])
        .toArray();

      const firstPeriod = Timespan.yearToDate().from;
      const secondPeriod = Timespan.last12Months().to;

      const invoiceSales = await analyticsDbInvoice
        .collection(customer!)
        .aggregate([
          {
            $addFields: {
                emissionDateAsDate: {
                    $dateFromString: {
                        dateString: "$emission_date",
                        format: "%d-%m-%Y" // Specify the format of your date strings
                    }
                }
              }
          },
          { $match: { ditta_id: { $in: dittaIds }, 
                          type: "attiva", 
            emissionDateAsDate: { $gte: firstPeriod, $lte: secondPeriod } 
              }, 
          },
          {
            $group: {
              _id: "$ditta_id",
              totalWithoutIvaSum: { $sum: "$total_without_iva" },
            },
          },
        ])
        .toArray();

      const feeCounts = await analyticsDbFee
        .collection(customer!)
        .aggregate([
          {
            $addFields: {
                detectionDateAsDate: {
                    $dateFromString: {
                        dateString: "$detection_date",
                        format: "%d-%m-%Y" // Specify the format of your date strings
                    }
                }
              }
          },
          { $match: { ditta_id: { $in: dittaIds }, 
           detectionDateAsDate: { $gte: firstPeriod, $lte: secondPeriod } } },
          {
            $group: {
              _id: "$ditta_id",
              count: { $sum: 1 },
              feeTotalWithoutIvaSum: { $sum: "$total_without_iva" },
            },
          },
        ])
        .toArray();

      const f24Counts = await analyticsDbF24
        .collection(customer!)
        .aggregate([
          { $match: { ditta_id: { $in: dittaIds } } },
          { $group: { _id: "$ditta_id", count: { $sum: 1 } } },
        ])
        .toArray();
        for (const ditta of l.zip(dittas, res)) {
          if (!ditta[0] || !ditta[1]) {
            console.info("Ditta or ditta from cosmosdb is null");
            ditta[0].invoice_count = 0;
            ditta[0].invoice_sale = 0;
            ditta[0].fee_count = 0;
            ditta[0].f24_count = 0;
            continue;
          }
          for (const field of remappedFields) {
            ditta[0][field] = ditta[1][field];
          }
          ditta[0].invoice_count =
            invoiceCounts.find((x) => x._id === ditta[1].id)?.count ?? 0;
          ditta[0].invoice_sale =
            (invoiceSales.find((x) => x._id === ditta[1].id)?.totalWithoutIvaSum ??
            0) + (feeCounts.find((x) => x._id === ditta[1].id)?.feeTotalWithoutIvaSum ?? 0);
          ditta[0].fee_count =
            feeCounts.find((x) => x._id === ditta[1].id)?.count ?? 0;
          ditta[0].f24_count =
            f24Counts.find((x) => x._id === ditta[1].id)?.count ?? 0;
        }
      }
      else {
        for (const ditta of l.zip(dittas, res)) {
          if (!ditta[0] || !ditta[1]) {
            console.info("Ditta or ditta from cosmosdb is null");
            ditta[0].invoice_count = 0;
            ditta[0].invoice_sale = 0;
            ditta[0].fee_count = 0;
            ditta[0].f24_count = 0;
            continue;
          }
          for (const field of remappedFields) {
            ditta[0][field] = ditta[1][field];
          }

      }
    }
      return success(event, 200, {
        dittas: dittas,
        profiles: profiles,
        collaborators: collaborators,
      });
    } else if (event.method === "PATCH") {
      const model = await readBody(event);
      return await editDittas(event, model.dittas);
    } else if (event.method === "POST") {
      const model = await readBody(event);
      return await addDittas(event, model.dittas);
    } else if (event.method === "DELETE") {
      const model = await readBody(event);
      return await deleteDittas(event, model.dittas);
    }
  } catch (ex: any) {
    console.error(ex);
    throw createError({
      statusCode: 422,
      message: ex.toString(),
    });
  }
});
