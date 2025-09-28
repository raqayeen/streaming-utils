import { readFileSync } from "node:fs";

export function getSecrets(path: string = "."): Secrets | null {
    try {
        const buf = readFileSync(path, { encoding: "utf-8" });
        const parsedSecrets = JSON.parse(buf);
        if (!parseSecrets(parsedSecrets)) return null;
        return parsedSecrets;
    } catch (err) {
        console.error("Couldn't parse secrets.");
        return null;
    }
}

function parseSecrets(inp: any): inp is Secrets {
    if (typeof inp == "object") {
        const fields = [
            parseField(inp, "channelId"),
            parseField(inp, "botId"),
            parseField(inp, "clientId"),
            parseField(inp, "clientSecret"),
            parseField(inp, "accessToken"),
            parseField(inp, "obsPort")
        ];
        return fields.reduce((prev, curr) => prev && curr, true);
    } else {
        console.error("Couldn't parse secrets, incorrect format")
    }
    return false;
}

function parseField(inp: Record<string, string>, field: string): field is string {
    if (!(field in inp)) {
        console.error("Secrets file must contain a", field, "field.");
        return false;
    }
    if (typeof inp[field] != "string") {
        console.error(field, "must be a string");
        return false;
    }
    return true;
}

export type Secrets = {
    channelId: string;
    botId: string;
    clientId: string;
    clientSecret: string;
    accessToken: string;
    obsPort: string;
};