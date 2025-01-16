import ScraperDatabase from "~/server/src/db/scraper_db";
import { notifyDriveConnection } from "~/server/src/notification/notify";
import { success } from "~/server/src/response";

// CREATE
// (root_folder, cpa_id, drive_type, acces_token, refresh_token, expiry_date, token_type)
// 1. Create entry in cpa_googledriveauth and retrieve id
// 2. Create entry in cpa_cloud_storage_option with previous id and retrieve id
// 3. Create entry in cpa_cloud_migration_configuration with previous id

export default defineEventHandler(async (event) => {
    try {
        assertMethod(event, "POST");
        const body = await readBody(event);
        let scraper = await ScraperDatabase.get();

        // Insert new linked entries in all three tables
        const driveId = (
            await scraper`
            INSERT INTO cpa_googledriveauth (
                google_drive_access_token,
                google_drive_refresh_token,
                google_drive_token_expires_at,
                google_drive_token_type,
                google_drive_quota,
                google_drive_used_storage,
                created_at,
                updated_at,
                cpa_id,
                isactive,
                google_drive_email,
                google_drive_givenname
            )
            VALUES (
                ${body.access_token},
                ${body.refresh_token},
                ${body.expiry_date},
                ${body.token_type},
                0,
                0,
                NOW(),
                NOW(),
                ${body.customer_id},
                true,
                'support@mentally.ai',
                'cpa'
            )
            RETURNING id`
        )[0].id;

        const optionId = (
            await scraper`
            INSERT INTO cpa_cloud_storage_option (
                drive_id,
                isactive,
                created_at,
                updated_at,
                cpa_id,
                drive_type_id
            )
            VALUES (
                ${driveId},
                true,
                NOW(),
                NOW(),
                ${body.customer_id},
                1
            )
            RETURNING id`
        )[0].id;
        const invoiceTypes = "['1','2','3','4','5']";
        const configId = (
            await scraper`
            INSERT INTO cpa_cloud_migration_configuration (
                root_folder,
                invoice_types,
                isactive,
                created_at,
                updated_at,
                cpa_id,
                drive_option_id,
                root_folder_id
            )
            VALUES (
                ${body.root_folder},
                ${invoiceTypes},
                true,
                NOW(),
                NOW(),
                ${body.customer_id},
                ${optionId},
                null
            )
            RETURNING id`
        )[0].id;
        console.log({
            driveId: driveId,
            optionId: optionId,
            configId: configId,
        });
        notifyDriveConnection({
            driveType: "google",
            cpaId: body.customer_id,
            folderName: body.root_folder,
        });
        return success(event, 200, {
            driveId: driveId,
            optionId: optionId,
            configId: configId,
        });
    } catch (ex: any) {
        console.error(ex);
        throw createError({
            statusCode: 422,
            message: ex.toString(),
        });
    }
});
