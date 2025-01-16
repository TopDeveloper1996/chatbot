import { google } from "googleapis";
import { success } from "~/server/src/response";

export default defineEventHandler(async (event) => {
    try {
        assertMethod(event, "GET");
        const config = useRuntimeConfig();
        const query = getQuery(event);
        const oauth2Client = new google.auth.OAuth2(
            config.google.clientId,
            config.google.clientSecret,
            query.redirect_uri as string
        );
        const code = query.code as string;
        const { tokens } = await oauth2Client.getToken(code);
        if (!tokens.refresh_token) {
            await oauth2Client.revokeToken(tokens.access_token!);
            console.warn("revoking past token");
        }
        return success(event, 200, tokens);
    } catch (ex: any) {
        console.error(ex);
        throw createError({
            statusCode: 422,
            message: ex.toString(),
        });
    }
});
