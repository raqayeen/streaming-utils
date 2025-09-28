import type { Component } from "../component";
import "./char.css";

export class AnimatedChar implements Component {
    private character!: HTMLImageElement;

    constructor(
        private characterUrl: string,
    ) { }

    get isSpeaking() {
        return this.character.dataset.bounce === "true";
    }

    set isSpeaking(speaking: boolean) {
        console.log(speaking);
        this.character.dataset.bounce = speaking ? "true" : undefined;
    }

    public createElement(parent: HTMLElement): void {
        this.character = document.createElement("img");
        this.character.id = "char";
        this.character.src = this.characterUrl;
        parent.appendChild(this.character);
    }

}