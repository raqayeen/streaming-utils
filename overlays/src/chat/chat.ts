import "./chat.css";
import type { Badges, ChatMessage, ChatMessageBadge, Chatter, Message } from "../../../shared";
import type { Component } from "../component";

export class Chat implements Component {
    private static readonly SleepTimeMs = 30_000;
    private static readonly MaxChatItemsLen = 10;

    public badges: Badges = {};

    private sleepTimer?: number = undefined;
    private chatArea!: HTMLElement;

    get isSleeping() {
        return this.chatArea.dataset.sleep === "true";
    }

    set isSleeping(sleep: boolean) {
        this.chatArea.dataset.sleep = JSON.stringify(sleep);
    }

    public createElement(parent: HTMLElement): void {
        const area = document.createElement("div");
        area.id = "chat";
        this.chatArea = area;
        parent.appendChild(area);
    }

    public createChatMessage(chatMessage: ChatMessage) {
        if (this.sleepTimer) clearTimeout(this.sleepTimer);
        this.isSleeping = false;
        this.sleepTimer = setTimeout(() => this.isSleeping = true, Chat.SleepTimeMs);

        const chatItemsLen = this.chatArea.children.length;
        if (chatItemsLen >= Chat.MaxChatItemsLen) {
            const chatItem = this.chatArea.children.item(chatItemsLen - 1);
            chatItem?.remove();
        }

        const chatItem = document.createElement("div");
        chatItem.id = chatMessage.id;
        chatItem.className = "chat-item";

        this.createChannelRow(chatItem, chatMessage.chatter);
        this.createMessage(chatItem, chatMessage.message);
        this.chatArea.prepend(chatItem);
    }

    private createChannelRow(parent: HTMLElement, chatter: Chatter): void {
        const channelRow = document.createElement("div");
        channelRow.className = "channel";
        channelRow.style.backgroundColor = chatter.color;
        chatter.badges.forEach(badge => this.createBadge(channelRow, badge));
        const channelNameNode = document.createTextNode(chatter.name);
        channelRow.appendChild(channelNameNode);
        parent.appendChild(channelRow);
    }

    private createBadge(parent: HTMLElement, badge: ChatMessageBadge): void {
        const src = this.badges?.[badge.id]?.[badge.version]?.url;
        if (!src) return;
        const badgeImg = document.createElement("img");
        badgeImg.src = src;
        badgeImg.className = "inline-img badge";
        parent.appendChild(badgeImg);
    }

    private createMessage(parent: HTMLElement, msg: Message): void {
        const messageRow = document.createElement("div");
        messageRow.className = "message";
        const isEmoteOnly = this.isEmoteOnly(msg);
        for (const fragment of msg) {
            if (fragment.type === "text") {
                const text = document.createTextNode(fragment.text);
                messageRow.appendChild(text);
            } else if (fragment.type === "emote") {
                const img = document.createElement("img");
                img.src = `https://static-cdn.jtvnw.net/emoticons/v2/${fragment.emote.id}/default/dark/2.0`;
                img.className = "inline-img";
                img.dataset.onlyimg = JSON.stringify(isEmoteOnly);
                messageRow.appendChild(img);
            }
        }
        parent.appendChild(messageRow);
    }

    private isEmoteOnly(msg: Message): boolean {
        for (const fragment of msg) {
            if (fragment.type === "text" && fragment.text.trim() == "") {
                return false;
            }
        }
        return true;
    }
}
