import type { Badges, ChatMessage, IntegrationEvent } from "../../shared";

export class Integration {
    public onBadgeSetup?: (badges: Badges) => void;
    public onChatMessage?: (chatMessage: ChatMessage) => void;
    public onSpeechStart?: (source: string) => void;
    public onSpeechEnd?: (source: string) => void;

    constructor() {
        const ws = new WebSocket("/wss");
        ws.onopen = () => console.log("opened websocket connection");
        ws.onmessage = (ev) => this.onEvent(JSON.parse(ev.data));
    }

    private onEvent(event: IntegrationEvent) {
        if (event.eventType === "badge.setup") {
            this.onBadgeSetup?.(event.badges);
        } else if (event.eventType === "chat.message") {
            this.onChatMessage?.(event.chatMessage);
        } else if (event.eventType === "speech.start") {
            this.onSpeechStart?.(event.source);
        } else if (event.eventType === "speech.end") {
            this.onSpeechEnd?.(event.source);
        }
    }
}