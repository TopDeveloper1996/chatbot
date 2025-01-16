import ParserDatabase from "~/server/src/db/parser_db";
import { error } from "~/server/src/response";

export default defineEventHandler(async (event) => {
    try {
        const body = JSON.parse(await readBody(event));
        if (body === undefined) {
            return error(event, 404, "Converstational agent not found");
        }

        let db = await ParserDatabase.get();
        const chatResult = await db`INSERT INTO chats (user_id) VALUES (${body.user_id}) RETURNING id`;
        const chat_id = chatResult[0].id;
        const message_id = await db`INSERT INTO messages (chat_id, role, content, context) VALUES (${chat_id}, ${body.role}, ${body.content}, ${body.context}::jsonb) RETURNING id`
        return { result: message_id}
    } catch (ex: any) {
        console.log(ex);
        throw createError({
            statusCode: 422,
            message: ex.toString(),
        });
    }
});
