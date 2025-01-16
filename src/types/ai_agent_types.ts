export enum Agent {
    default = "default",
    book = "book",
}

export enum ChatMessageType {
    text,
}
export enum ChatRole {
    assistant,
    user,
}

export interface ChatMessage {
    id: string | undefined;
    icon: string | undefined;
    content: string | undefined;
    type: ChatMessageType;
    time: Date;
    agent: ChatRole;
    loading?: boolean;
}

export interface Context {
    title: string;
    content: string;
    link: string | undefined;
}

export interface ArticleContent {
    title: string;
    content: string;
    blob_link: string;
}
