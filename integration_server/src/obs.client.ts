import OBSWebSocket from "obs-websocket-js";
import EventEmitter from "events";
import { IntegrationEvent } from "../../shared.js";

export class ObsClient extends EventEmitter<{ "event": [IntegrationEvent] }> {
    private static readonly ObsEventInputVolumeMetersSub = 1 << 16;
    private static readonly RpcVersion = 1;

    private static readonly ObsWebsocketUrl = "ws://127.0.0.1:4455";
    private static readonly VolumeThreshold = 0.02;
    private static readonly AttackMinLenMs = 100;

    private speakingStart: number = 0;

    constructor() {
        super();
        const obs = new OBSWebSocket();

        obs.connect(ObsClient.ObsWebsocketUrl, undefined, {
            eventSubscriptions: ObsClient.ObsEventInputVolumeMetersSub,
            rpcVersion: ObsClient.RpcVersion,
        }).catch((err) => console.log("FAIL: Failed to connect to OBS WebSocket", err));

        const onVolumeChange = this.onVolumeChange.bind(this) as ((resp: { inputs: {}[] }) => void);
        obs.on('InputVolumeMeters', onVolumeChange);
    }

    /**
     * Averages volume on active mics when volume changes.
     */
    private onVolumeChange(resp: { inputs: InputLevelChange[] }) {
        const now = Date.now();
        const volume = this.calculateVolume(resp.inputs);
        const isLoudEnough = volume > ObsClient.VolumeThreshold;
        if (isLoudEnough) {
            if (this.speakingStart == 0) {
                this.emit("event", { eventType: "speech.start", source: "Good Mic" });
            }
            this.speakingStart = now;
        } else if (this.speakingStart != 0 && this.speakingStart + ObsClient.AttackMinLenMs < now) {
            this.emit("event", { eventType: "speech.end", source: "Good Mic" });
            this.speakingStart = 0;
        }
    }

    private calculateVolume(inputs: InputLevelChange[]): number {
        for (const input of inputs) {
            if (input.inputName !== "Good Mic") continue;
            let volume = 0;
            for (const levels of input.inputLevelsMul) {
                for (const level of levels) {
                    if (volume < level) volume = level
                }
            }
            return volume;
        }
        return 0;
    }
}

type InputLevelChange = {
    inputLevelsMul: number[][];
    inputName: string;
};