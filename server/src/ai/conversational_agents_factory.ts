import { Agent } from "~/src/types/ai_agent_types";
import BookConversationalAgent from "./book_conversational_agent";
import ConversationalAgent from "./conversational_agent";
import DefaultConversationalAgent from "./default_conversational_agent";

export function conversationalAgentsFactory({
    agent,
    openApiKey,
    pineconeApiKey,
}: {
    agent: Agent;
    openApiKey: string;
    pineconeApiKey: string;
}): ConversationalAgent | undefined {
    switch (agent) {
        case Agent.default:
            return new DefaultConversationalAgent(openApiKey, pineconeApiKey);
        case Agent.book:
            return new BookConversationalAgent(openApiKey, pineconeApiKey);
        default:
            break;
    }
    return undefined;
}
