import { exec } from "node:child_process";
import { cp, mkdirSync } from "node:fs";

build();

function build() {
    mkdirSync("dist", { recursive: true });
    buildOverlays();
    buildIntegrationServer();
}

function buildOverlays() {
    console.log("Building overlays");
    exec("npm --prefix overlays run build", (error, _, stderr) => {
        if (error) {
            console.error("ERROR: Failed to build overlays, Got:\n", stderr);
        } else {
            console.log("built overlays");
            cp("overlays/dist", "dist/overlays", { recursive: true, force: true }, (error) => {
                if (error) {
                    console.error("ERROR: Failed to copy overlays build artifacts to `./dist/overlays` folder.\n", error);
                }
            });
        }
    });
}

function buildIntegrationServer() {
    console.log("Building integration_server");
    exec("npm --prefix integration_server run build", (error, _, stderr) => {
        if (error) {
            console.error("ERROR: Failed to build integration_server, Got:\n", stderr);
        } else {
            console.log("built integration_server");
            cp("integration_server/dist", "dist", { recursive: true, force: true }, (error) => {
                if (error) {
                    console.error("ERROR: Failed to copy integration_server build artifacts to `./dist/` folder.\n", error);
                }
            });
            cp("integration_server/node_modules", "dist/node_modules", { recursive: true, force: true }, (error) => {
                if (error) {
                    console.error("ERROR: Failed to copy integration_server node_modules artifacts to `./dist/node_modules` folder.\n", error);
                }
            });
        }
    });
}
