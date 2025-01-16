import { Pinecone } from "@pinecone-database/pinecone";
import * as openai from "openai";
import { ChatCompletionChunk } from "openai/resources/index.mjs";
import ConversationalAgent from "./conversational_agent";

import { Context } from "~/src/types/ai_agent_types";

const websites_public = <string[]>(['def.finanze.it', 'www.fiscooggi.it']);
const websites_temporarily = <string[]>(['www.eutekne.info']);

export default class DefaultConversationalAgent extends ConversationalAgent {
    constructor(openApiKey: string, pineConeApiKey: string) {
        super(
            new openai.AzureOpenAI({
                apiKey: openApiKey,
                dangerouslyAllowBrowser: false,
                endpoint: "https://mentallopenaigpt4omnisupport.openai.azure.com/",
                apiVersion: "2024-02-01",
            }),
            new Pinecone({ apiKey: pineConeApiKey })
        );
    }

    async answer({ prompt, history }: { prompt: string; history?: [] }): Promise<ReadableStream<string>> {
        history ??= [];
        const embeddings = await this.model.embeddings.create({
            input: prompt,
            model: "text-embedding-ada-002",
        });
        const contexts_array: Context[] = [];
        let index = this.vectorDb.index("prova-ai-commercialisti-serverless");
        try {
            const res = await index.query({
                topK: 30,
                vector: embeddings.data[0].embedding,
                includeMetadata: true,
            });
            for (const match of res.matches) {
                if (match.metadata) {
                    contexts_array.push({ title: match.metadata['title'], content: match.metadata['content'], link: match.metadata['links'] ?? match.metadata['link'] } as Context);
                }
            }
        } catch (ex: any) {
            console.error(`unable to fetch context from pinecone: ${ex.toString()}`);
        }
        console.log(contexts_array.filter(context => context.link).length)
        const text_array = contexts_array.map(obj => obj.content).join("\n");
        const apiStream = (
            await this.model.chat.completions.create({
                model: "gpt4-omni-adementally",
                stream: true,
                temperature: 0.2,
                n: 1,
                messages: [
                    {
                        role: "system",
                        content: `1. Rispondi alla seguente domanda usando il contesto scritto riportato nel seguito e segui le seguenti regole espresse in bullets.
2. Quando analizzi il contesto valuta se una legge o direttiva è stata modificata piu' volte durante gli anni. 
3. Valuta se le modifiche riguardano l' essenza della direttiva oppure aspetti di dettaglio. 
4. Se le modifiche riguardano l' essenza della direttiva assumi che l' ultima modifica supersiede tutte le precedenti e diventa prioritaria.
5. Se le modifiche riguardano aspetti di dettaglio, identifica la direttiva o legge principale e la sua data di pubblicazione ed utilizza questa come elemento portante della risposta. Poi metti in evidenza le variazioni di dettaglio avvenute nel tempo relazionandole alla domanda.
6. Se il contesto riportato è insufficiente per rispondere alla domanda o se possiedi in memoria informazioni rilevanti ed altamente specialistiche  prova a fornire una risposta che tenga conto anche della tua base dati ma senza banalizzare o ignorare informazioni pertinenti nel contesto fornito. 
7. Ricorda che stai parlando a degli esperti e stai cercando di aiutarli a velocizzare la ricerca d' informazione specialistica. Infine evita di dire all' utente che deve consultare un esperto in quanto tu sei l' esperto. 
8. Se pensi che la tua risposta sia insufficiente o è poco probabile che sia esaustiva o precisa, comunica all' utente che pensi ci sia bisogno di un ulteriore approfondimento e suggeriscigli pubblicazioni e riviste specializzate che lo possano aiutare. 
9. Strutturare la risposta in paragrafi chiari, inserendo due riga vuota tra i paragrafi.
10. Non includere "Resposta" all'inizio della tua risposta.`,
                    },
                    ...history,
                    {
                        role: "user",
                        content: `Rispondi alla seguente domanda usando il contesto scritto qua sotto:\nContext: ${text_array}\nQ: ${prompt}\nA:`,
                    },
                ],
            })
        )
            .toReadableStream()
            .getReader();

        // const valid_contexts_array: Context[] = contexts_array.map(match => {
        //     const title = match.title;
        //     const content = match.content;
        //     const effectiveLink = match.link;

        //     if (effectiveLink && websites_temporarily.some(tempSite => effectiveLink.includes(tempSite))) {
        //         console.log('Link is from a temporarily website.');
        //         return {
        //             title,
        //             content,
        //             link: undefined
        //         } as Context;
        //     } else if (effectiveLink && websites_public.some(pubSite => effectiveLink.includes(pubSite))) {
        //         if (title && content) {
        //             console.log('Link is from a public website.');
        //             return {
        //                 title,
        //                 content,
        //                 link: effectiveLink
        //             } as Context;
        //         }
        //     }
        //     console.log('Link is from a private website.');
        //     // Return undefined for items that don't match criteria to filter them out later
        //     return undefined;
        // }).filter((context): context is Context => context !== undefined);

        let post = JSON.stringify(contexts_array);
        post += `## Risposta   \n`;
        const decoder = new TextDecoder();
        const resStream = new ReadableStream<string>({
            start(controller) {
                controller.enqueue(post);
                const read = async () => {
                    const { done, value } = await apiStream.read();
                    if (done) {
                        controller.close();
                        return;
                    }
                    const chunk: ChatCompletionChunk = JSON.parse(decoder.decode(value)) as ChatCompletionChunk;
                    if (chunk.choices.length > 0 && chunk.choices[0].delta && chunk.choices[0].delta.content) {
                        const delta = chunk.choices[0].delta.content;
                        controller.enqueue(delta);
                    }
                    read();
                };
                read();
            },
        });
        return resStream;
    }
}
