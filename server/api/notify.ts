import { sendEmail } from "../src/notification/notify";
import { success } from "../src/response";

export default defineEventHandler(async (event) => {
    try {
        assertMethod(event, "POST");
        const body = await readBody(event);
        const r = await sendEmail({
            subject: body.subject,
            to: body.to,
            cc: body.cc,
            htmlMessage: body.htmlMessage,
        });
        return success(event, 200, r);
    } catch (ex: any) {
        console.log(ex);
        throw createError({
            statusCode: 422,
            message: ex.toString(),
        });
    }
});
