import "./main.css";
import charUrl from "../../assets/char.png";
import { AnimatedChar } from "../char/char";
import { Chat } from "../chat/chat";
import { Integration } from "../integration";

const root = document.querySelector<HTMLElement>("#root");
if (!root) throw "no root";

const integration = new Integration();

const animatedChar = new AnimatedChar(charUrl);
animatedChar.createElement(root);
integration.onSpeechStart = () => animatedChar.isSpeaking = true;
integration.onSpeechEnd = () => animatedChar.isSpeaking = false;

const chat = new Chat();
chat.createElement(root);
integration.onChatMessage = chat.createChatMessage.bind(chat);



