import EventEmitter from "node:events";
import type { Badge, BadgeId, Badges, BadgeVersion, EmoteId, EmoteSet, IntegrationEvent, MessageFragmentText, MessageId } from "../../shared.js";

export class TwitchClient extends EventEmitter<{ "event": [IntegrationEvent] }> {
    private static readonly EventSubWsUrl = "wss://eventsub.wss.twitch.tv/ws";

    private static readonly BaseUrl = "https://api.twitch.tv/helix";
    private static readonly CreateEventSubUrl = "eventsub/subscriptions";
    private static readonly BadgesUrl = "chat/badges";
    private static readonly BadgesGlobalUrl = `${TwitchClient.BadgesUrl}/global`;

    private static readonly EventSubChannelChatMessageName = "channel.chat.message";

    private badges?: Badges;

    constructor(private secrets: TwitchClientSecrets) {
        super();
        this.setupEventSub();
        this.setupBadges();
    }

    public sendBadges(): void {
        if (this.badges) this.emit("event", { eventType: "badge.setup", badges: this.badges });
    }

    private setupEventSub(url: string = TwitchClient.EventSubWsUrl): void {
        const eventSubWebSocket = new WebSocket(url);
        eventSubWebSocket.onopen = () => console.log("TwitchClient subscriping to events");
        eventSubWebSocket.onmessage = ev => {
            const evData: TwitchApiEventSubData = JSON.parse(ev.data);
            if (this.isEventSubTypeSession(evData)) {
                const id = evData.payload.session.id;
                this.postApi(`${TwitchClient.BaseUrl}/${TwitchClient.CreateEventSubUrl}`, {
                    type: TwitchClient.EventSubChannelChatMessageName,
                    version: "1",
                    condition: {
                        broadcaster_user_id: this.secrets.channelId,
                        user_id: this.secrets.channelId,
                    },
                    transport: {
                        method: "websocket",
                        session_id: id,
                    },
                })
                    .then(() => console.log("TwitchClient subscribed to events"))
                    .catch((err) => console.error("FAIL: TwitchClient couldn't subscribe to events", err));
            } else if (evData.metadata.message_type === "notification") {
                console.log("TwitchClient: message event received");
                const event = evData.payload.event;
                this.emit("event", {
                    eventType: "chat.message",
                    chatMessage: {
                        id: event.message_id as MessageId,
                        chatter: {
                            name: event.chatter_user_name,
                            color: event.color,
                            badges: event.badges.map(b => ({ id: b.set_id as BadgeId, version: b.id as BadgeVersion })),
                        },
                        message: event.message.fragments.map(f => {
                            if (f.type === "text") return { type: "text", text: f.text };
                            else if (f.type === "cheermote") return { type: "cheermote", cheermote: f.cheermote };
                            else if (f.type === "emote") return {
                                type: "emote",
                                emote: {
                                    id: f.emote.id as EmoteId,
                                    set: f.emote.emote_set_id as EmoteSet,
                                    is_animated: f.emote.format.includes("animated"),
                                },
                            };
                            return (<MessageFragmentText>f);
                        }),
                    }
                });
            }
        };
    }

    private async setupBadges() {
        this.badges = {};
        const badgesGetResp = await Promise.all([
            this.fetchApi<TwitchApiBadgeGet>(`${TwitchClient.BaseUrl}/${TwitchClient.BadgesGlobalUrl}`),
            this.fetchApi<TwitchApiBadgeGet>(`${TwitchClient.BaseUrl}/${TwitchClient.BadgesUrl}?broadcaster_id=${this.secrets.channelId}`),
        ]);
        const badgesData = badgesGetResp.flatMap(resp => resp.data);
        badgesData.forEach(badge => {
            const badgeVersions: Record<TwitchApiBadgeVersionId, Badge> = {};
            const badgeId = badge.set_id as BadgeId;
            badge.versions.forEach(version => {
                const versionId = version.id as BadgeVersion;
                badgeVersions[version.id] = {
                    id: badgeId,
                    version: versionId,
                    url: version.image_url_4x ?? version.image_url_2x ?? version.image_url_1x ?? "",
                    description: version.description,
                    title: version.title,
                }
            })
            this.badges![badgeId] = badgeVersions;
        });
        this.emit("event", { eventType: "badge.setup", badges: this.badges });
    }

    private async postApi<T, I>(url: string | URL, body: I): Promise<T> {
        return await fetch(url, {
            method: "POST",
            body: JSON.stringify(body),
            headers: { ...this.headers, "Content-Type": "application/json" },
        }).then<T>(resp => resp.json() as Promise<T>);
    }

    private async fetchApi<T>(url: string | URL): Promise<T> {
        return await fetch(url, { headers: this.headers })
            .then<T>(resp => resp.json() as Promise<T>);
    }

    private get headers() {
        return {
            "Authorization": `Bearer ${this.secrets.accessToken}`,
            "Client-Id": this.secrets.clientId,
        };
    }

    private isEventSubTypeSession(data: TwitchApiEventSubData): data is TwitchApiEventSubWelcome {
        return data.metadata.message_type === "session_welcome";
    }

    // Get notified of twitch messages
    // Get notified of subscriptions, cheers, custom channel rewards
}

type TwitchClientSecrets = {
    channelId: string;
    accessToken: string;
    clientId: string;
    botId: string;
}

type TwitchApiEventSubData =
    TwitchApiEventSubWelcome
    | TwitchApiEventSubMessage;

type TwitchApiEventSubWelcome = {
    metadata: { message_type: "session_welcome" };
    payload: { session: { id: string } };
};

type TwitchApiEventSubMessage = {
    metadata: {
        message_type: "notification",
        subscription_type: "channel.chat.message",
    },
    payload: {
        event: {
            chatter_user_name: string;
            message_id: string;
            message: TwitchApiEventSubMessageMessage;
            color: string;
            badges: { set_id: string; id: string; }[];
        }
    }
};

type TwitchApiEventSubMessageMessage = {
    fragments: TwitchApiEventSubMessageMessageFragment[];
};

type TwitchApiEventSubMessageMessageFragment =
    TwitchApiEventSubMessageMessageFragmentText
    | TwitchApiEventSubMessageMessageFragmentCheermote
    | TwitchApiEventSubMessageMessageFragmentEmote;

type TwitchApiEventSubMessageMessageFragmentText = {
    type: "text";
    text: string;
};

type TwitchApiEventSubMessageMessageFragmentCheermote = {
    type: "cheermote";
    cheermote: {
        prefix: string;
        bits: number;
    };
};

type TwitchApiEventSubMessageMessageFragmentEmote = {
    type: "emote";
    emote: {
        id: string;
        emote_set_id: string;
        format: ("animated" | "static")[];
    };
};

type TwitchApiBadgeGet = { data: TwitchApiBadgeSet[] };

type TwitchApiBadgeSet = {
    set_id: TwitchApiBadgeSetId;
    versions: TwitchApiBadgeVersion[];
};

type TwitchApiBadgeSetId = string;

type TwitchApiBadgeVersion = {
    id: TwitchApiBadgeVersionId;
    image_url_1x?: string;
    image_url_2x?: string;
    image_url_4x?: string;
    title?: string;
    description?: string;
};

type TwitchApiBadgeVersionId = string;


