import { pbkdf2Sync } from "pbkdf2";
import { v4 } from "uuid";
import ScraperDatabase from "~/server/src/db/scraper_db";
import { error, success } from "~/server/src/response";
import TokenVault from "~/server/src/token_vault";

export default defineEventHandler(async (event) => {
    try {
        const body = await readBody(event);

        if (!body.email || !body.password) {
            return error(event, 422, "Invalid login request");
        }
        let db = await ScraperDatabase.get();
        const res =
            await db`SELECT * from auth_user u JOIN customers c ON c.id = u.customer_id WHERE u.email = ${body.email}`;
        if (res.length <= 0) {
            return error(event, 401, "Wrong credentials");
        }
        for (const r of res) {
            let splits = r.password.split("$");
            let iterations = Number.parseInt(splits[1]);
            let salt = splits[2];
            let hashBytes = pbkdf2Sync(body.password, salt, iterations, 32, "sha256");
            let digest = btoa(String.fromCharCode(...new Uint8Array(hashBytes)));
            if (digest === splits[3]) {
                let sessionToken = v4();
                const sessionData = TokenVault.instance.getData(r.customer_id);
                if (!sessionData) {
                    console.log(`[${r.customer_id}] new session created`);
                    sessionToken = v4();
                    TokenVault.instance.addToken(r.customer_id, sessionToken, {
                        customer_id: r.customer_id,
                        name: `${r.first_name} ${r.last_name}`.trim(),
                        studio_name: r.studio_name?.trim(),
                        email: r.email,
                        blob_container_name: r.blob_container_name,
                    });
                } else {
                    console.log(`[${r.customer_id}] existing session retrieved`);
                    sessionToken = sessionData.session_token;
                }
                return success(event, 200, {
                    customer_id: r.customer_id,
                    username: r.email,
                    session_token: sessionToken,
                    studio_name: r.studio_name?.trim(),
                    name: `${r.first_name} ${r.last_name}`.trim(),
                    blob_container_name: r.blob_container_name,
                });
            }
        }

        return error(event, 401, "Wrong credentials");
    } catch (ex: any) {
        console.log(ex);
        throw createError({
            statusCode: 422,
            message: ex.toString(),
        });
    }
});
