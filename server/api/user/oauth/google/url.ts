import { google } from "googleapis";
import { success } from "~/server/src/response";

export default defineEventHandler(async (event) => {
    try {
        assertMethod(event, "GET");
        const config = useRuntimeConfig();
        const query = getQuery(event);
        const oauth2Client = new google.auth.OAuth2(config.google.clientId, config.google.clientSecret);
        const scopes = ["https://www.googleapis.com/auth/drive.file"];

        const url = oauth2Client.generateAuthUrl({
            access_type: "offline",
            scope: scopes,
            redirect_uri: query.redirect_uri?.toString(),
            state: "google",
        });
        return success(event, 200, url);
    } catch (ex: any) {
        console.error(ex);
        throw createError({
            statusCode: 422,
            message: ex.toString(),
        });
    }
});
