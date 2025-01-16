import { error, success } from "../../src/response";
import TokenVault from "../../src/token_vault";

export default defineEventHandler(async (event) => {
    try {
        const query = getQuery(event);
        let data = TokenVault.instance.getData(query.customer_id?.toString());
        console.log({data});
        console.log(data.expiration_timestamp);
        console.log(new Date().getTime());
        console.log(query.session_token);
        console.log(query.customer_id );
        console.log(data.session_token?.toString());
        if (
            !query.session_token ||
            !query.customer_id ||
            !data ||
            data.session_token?.toString() !== query.session_token ||
            data.expiration_timestamp < new Date().getTime()
        ) {
            return error(event, 401, "Invalid session");
        }

        return success(event, 200, data);
    } catch (ex: any) {
        console.log(ex);
        throw createError({
            statusCode: 422,
            message: ex.toString(),
        });
    }
});
