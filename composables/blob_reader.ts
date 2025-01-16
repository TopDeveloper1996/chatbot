import { ArticleContent } from "~/src/types/ai_agent_types";

export const useBlobReader = () => {
    const config = useAppConfig();
    const read = async (
        title: string,
        link: string,
    ): Promise<ArticleContent[] | undefined> => {
        try {
            const res = await fetch("/api/ai/blob_reader", {
                method: "POST",
                body: JSON.stringify({
                    title: title,
                    link: link,
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
    return { read };
};