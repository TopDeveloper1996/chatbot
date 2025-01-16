import { Pinecone } from "@pinecone-database/pinecone";
import * as openai from "openai";

export default abstract class ConversationalAgent {
    model: openai.AzureOpenAI;
    vectorDb: Pinecone;

    constructor(model: openai.AzureOpenAI, vectorDb: Pinecone) {
        this.model = model;
        this.vectorDb = vectorDb;
    }

    abstract answer({ prompt, history }: { prompt: string; history?: [] }): Promise<ReadableStream<string>>;
}
