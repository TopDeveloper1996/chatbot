export const useChatLogger = () => {
    const config = useAppConfig();
    const save = async (
        user_id: string,
        role: ChatRole,
        content: string | undefined,
        context: Context[] | undefined
    ): Promise<string | undefined> => {
        try {
            const res = await fetch("/api/ai/chat_logger", {
                method: "POST",
                body: JSON.stringify({
                    user_id: user_id,
                    role: role,
                    content: content,
                    context: context
                }),
                headers: { Authorization: `Bearer ${config.auth}` },
            });

            if (res.status > 299) {
                console.error('Failed to fetch:', res.statusText);
                return undefined;
            }
            const data = await res.json();
            return data.result;
        } catch (error) {
            console.error('Error fetching data:', error);
            return undefined;
        }
    };
    return { save };
};