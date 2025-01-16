import * as msal from "@azure/msal-node";
import { google } from "googleapis";
import ScraperDatabase from "~/server/src/db/scraper_db";
import { notifyDriveDisconnection } from "~/server/src/notification/notify";
import { success } from "~/server/src/response";
// let r = await endpoint`SELECT * FROM customer_user WHERE customer_id = ${customer!} AND email IS NOT NULL`;
export default defineEventHandler(async (event) => {
    try {
        assertMethod(event, "DELETE");
        const config = useRuntimeConfig();
        const params = getQuery(event);
        let scraper = await ScraperDatabase.get();
        const customer = params.customer_id?.toString();

        // Fetch active configuration
        let rows = await scraper`
        SELECT *
        FROM cpa_cloud_migration_configuration conf JOIN cpa_cloud_storage_option opt ON conf.drive_option_id = opt.id
        WHERE conf.cpa_id = ${customer!}
        ORDER BY conf.updated_at DESC LIMIT 1`;
        if (rows.length <= 0) {
            throw createError({
                statusCode: 404,
                message: "configuration not active for current customer",
            });
        }
        let entry = rows[0];

        // Revoke tokens
        if (entry.drive_type_id === 1) {
            // GOOGLE
            const googleDriveEntry = await scraper`
                SELECT * FROM cpa_googledriveauth WHERE id = ${entry.drive_id}`;
            const oauth2Client = new google.auth.OAuth2(
                config.google.clientId,
                config.google.clientSecret,
                params.redirect_uri as string
            );
            try {
                await oauth2Client.revokeToken(googleDriveEntry[0].google_drive_access_token);
                console.log("google access token revoked");
            } catch (ex) {
                console.warn(ex);
            } finally {
                await scraper`
                UPDATE cpa_googledriveauth
                SET 
                    isactive = false,
                    updated_at = NOW()
                WHERE cpa_id = ${customer!} AND isactive = true`;
            }
        } else if (entry.drive_type_id === 2) {
            try {
                const oneDriveEntry = await scraper`
                SELECT * FROM cpa_onedriveauth WHERE id = ${entry.drive_id}`;
                const cca = new msal.ConfidentialClientApplication({
                    auth: { clientId: config.onedrive.clientId, clientSecret: config.onedrive.clientSecret },
                });
            } catch (ex) {
                console.warn(ex);
            } finally {
                await scraper`
                UPDATE cpa_onedriveauth
                SET 
                    isactive = false,
                    updated_at = NOW()
                WHERE cpa_id = ${customer!} AND isactive = true`;
            }
        } else {
            console.warn("drive provider not recognized, disabling all configurations");
        }

        // Update configuration in scraper db
        await Promise.all([
            scraper`
                UPDATE cpa_cloud_migration_configuration
                SET 
                    isactive = false,
                    updated_at = NOW()
                WHERE cpa_id = ${customer!} AND isactive = true`,
            scraper`
                UPDATE cpa_cloud_storage_option
                SET 
                    isactive = false,
                    updated_at = NOW()
                WHERE cpa_id = ${customer!} AND isactive = true`,
        ]);
        notifyDriveDisconnection({
            driveType: entry.drive_type_id === 1 ? "google" : "onedrive",
            cpaId: customer!,
            folderName: entry.root_folder,
        });
        return success(event, 200, {});
    } catch (ex: any) {
        console.error(ex);
        throw createError({
            statusCode: 422,
            message: ex.toString(),
        });
    }
});
