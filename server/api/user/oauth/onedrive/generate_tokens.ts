import * as msal from "@azure/msal-node";
import { success } from "~/server/src/response";

export default defineEventHandler(async (event) => {
    try {
        assertMethod(event, "GET");
        const config = useRuntimeConfig();
        const query = getQuery(event);
        const cca = new msal.ConfidentialClientApplication({
            auth: { clientId: config.onedrive.clientId, clientSecret: config.onedrive.clientSecret },
        });
        const code = query.code as string;
        const tokens = await cca.acquireTokenByCode({
            code: code!,
            redirectUri: query.redirect_uri!.toString(),
            scopes: ["https://graph.microsoft.com/.default"],
        });
        const refreshToken = () => {
            const tokenCache = cca.getTokenCache().serialize();
            const refreshTokenObject = JSON.parse(tokenCache).RefreshToken;
            const refreshToken = refreshTokenObject[Object.keys(refreshTokenObject)[0]].secret;
            return refreshToken;
        };
        return success(event, 200, { ...tokens, refreshToken: refreshToken() });
    } catch (ex: any) {
        console.error(ex);
        throw createError({
            statusCode: 422,
            message: ex.toString(),
        });
    }
});
