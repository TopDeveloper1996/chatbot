import { conversationalAgentsFactory } from "~/server/src/ai/conversational_agents_factory";
import { error } from "~/server/src/response";

const config = useRuntimeConfig();

export default defineEventHandler(async (event) => {
    try {
        const body = JSON.parse(await readBody(event));
        let agent = conversationalAgentsFactory({
            agent: body.assistant_agent,
            openApiKey: config.openAiApiKey,
            pineconeApiKey: config.pineconeApiKey,
        });
        if (agent === undefined) {
            return error(event, 404, "Converstational agent not found");
        }
        return await agent!.answer({ prompt: body.prompt, history: body.history ?? [] });
    } catch (ex: any) {
        console.log(ex);
        throw createError({
            statusCode: 422,
            message: ex.toString(),
        });
    }
});
