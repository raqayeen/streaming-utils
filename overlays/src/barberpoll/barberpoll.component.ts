import type { Component } from "../component";
import "./barberpoll.css";

export class BarberpollComponent implements Component {
    public createElement(): void {
        document.body.dataset.barberpoll = "";
    }
}