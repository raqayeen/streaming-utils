import "./main.css";
import charUrl from "../assets/char.png";
import { AnimatedChar } from "./char/char";
import { Chat } from "./chat/chat";
import { Integration } from "./integration";
import { BarberpollComponent } from "./barberpoll/barberpoll.component";

const root = document.querySelector<HTMLElement>("#root");
if (!root) throw "no root";

if (window.location.pathname === "/") {
    const integration = new Integration();

    const animatedChar = new AnimatedChar(charUrl);
    animatedChar.createElement(root);
    integration.onSpeechStart = () => animatedChar.isSpeaking = true;
    integration.onSpeechEnd = () => animatedChar.isSpeaking = false;

    const chat = new Chat();
    chat.createElement(root);
    integration.onChatMessage = chat.createChatMessage.bind(chat);
}

if (window.location.pathname === "/barberpoll") {
    const bp = new BarberpollComponent();
    bp.createElement();
}

