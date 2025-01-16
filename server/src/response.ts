import { EventHandlerRequest, H3Event } from "h3";

export function error(event: H3Event<EventHandlerRequest>, code: number, message: string): Object {
    event.node.res.statusCode = code;
    event.node.res.setHeader("Content-Type", "application/json");
    return { url: event.node.req.url, code: code, message: message };
}

export function success(event: H3Event<EventHandlerRequest>, code: number, data: any): Object {
    event.node.res.statusCode = code;
    event.node.res.setHeader("Content-Type", "application/json");
    return { url: event.node.req.url, code: code, data: data };
}
