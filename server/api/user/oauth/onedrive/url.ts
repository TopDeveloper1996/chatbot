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
        const scopes = ["https://graph.microsoft.com/.default"];
        const url = await cca.getAuthCodeUrl({
            redirectUri: query.redirect_uri?.toString()!,
            scopes: scopes,
            state: "onedrive",
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
