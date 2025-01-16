import { Agent, ChatRole } from "~/src/types/ai_agent_types";
export const useAssistant = () => {
    const config = useAppConfig();

    const answer = async (
        prompt: string,
        history?: { role: ChatRole; content: string }[],
        agent?: Agent
    ): Promise<ReadableStream<string> | undefined> => {
        const res = await fetch("/api/ai/assistant", {
            method: "POST",
            body: JSON.stringify({
                prompt: prompt,
                assistant_agent: agent ?? Agent.default,
                history: history?.map((m) => ({ role: ChatRole[m.role], content: m.content })),
            }),
            headers: { Authorization: `Bearer ${config.auth}` },
        });
        if (res.status > 299) {
            return undefined;
        }
        const apiStream = res.body?.getReader()!;
        const stringStream = new ReadableStream<string>({
            start(controller) {
                const decode = new TextDecoder();
                const read = async () => {
                    const { done, value } = await apiStream.read();
                    if (done) {
                        controller.close();
                        return;
                    }
                    const chunk = decode.decode(value, { stream: !done });
                    controller.enqueue(chunk);
                    read();
                };
                read();
            },
        });

        return stringStream;
    };
    return { answer };
};
