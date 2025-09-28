export type IntegrationEvent =
    BadgeSetupEvent
    | ChatMessageEvent
    | SpeechStartEvent
    | SpeechEndEvent;

export type BadgeSetupEvent = {
    eventType: "badge.setup";
    badges: Badges;
};

export type Badges = Record<BadgeId, Record<BadgeVersion, Badge>>;

export type BadgeId = string & { __type: "BadgeId" };

export type BadgeVersion = string & { __type: "BadgeVersion" };

export type Badge = {
    id: BadgeId;
    version: BadgeVersion;
    url: string;
    title?: string;
    description?: string;
}

export type ChatMessageEvent = {
    eventType: "chat.message";
    chatMessage: ChatMessage;
};

export type ChatMessage = {
    id: MessageId;
    chatter: Chatter;
    message: Message;
};

export type MessageId = string & { __type: "MessageId" };

export type Chatter = {
    name: string;
    badges: ChatMessageBadge[];
    color: string;
};

export type ChatMessageBadge = { id: BadgeId, version: BadgeVersion };

export type Message = MessageFragment[];

export type MessageFragment = MessageFragmentText
    | MessageFragmentCheermote
    | MessageFragmentEmote;

export type MessageFragmentText = {
    type: "text";
    text: string;
};

export type MessageFragmentCheermote = {
    type: "cheermote";
    cheermote: {
        prefix: string;
        bits: number;
    };
};

export type MessageFragmentEmote = {
    type: "emote";
    emote: {
        id: EmoteId;
        set: EmoteSet;
        is_animated: boolean;
    };
};

export type EmoteId = string & { __type: "EmoteId" };

export type EmoteSet = string & { __type: "EmoteSet" };

export type SpeechStartEvent = {
    eventType: "speech.start";
    source: string;
};

export type SpeechEndEvent = {
    eventType: "speech.end";
    source: string;
};