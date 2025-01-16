import { error } from "../src/response";

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig();
    if (event.node.req.url?.startsWith("/api")) {
        const authorization = event.node.req.headers.authorization;
        if (authorization === null || !authorization?.toLocaleLowerCase().startsWith("bearer")) {
            return error(event, 401, "Unauthorized");
        }
        let token = authorization.replaceAll("Bearer", "").trim();
        if (token !== config.auth) {
            return error(event, 401, "Unauthorized");
        }
    }
});
