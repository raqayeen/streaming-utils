import { exec } from "node:child_process";

const overlay = exec("npm --prefix overlays run dev", (error) => {
    if (error) console.error("overlay exited abnormally");
});
overlay.stderr.on("data", (chunk) => console.error("OVERLAYS:", chunk));
overlay.stdout.on("data", (chunk) => console.log("OVERLAYS:", chunk));

const server_build = exec("npm --prefix integration_server run watch-build", (error) => {
    if (error) console.error("server tsc exited abnormally");
});
server_build.stderr.on("data", (chunk) => console.error("SERVER TSC:", chunk));
server_build.stdout.on("data", (chunk) => console.log("SERVER TSC:", chunk));

const server_run = exec("npm --prefix integration_server run watch", (error) => {
    if (error) console.error("server run exited abnormally");
});
server_run.stderr.on("data", (chunk) => console.error("SERVER RUN:", chunk));
server_run.stdout.on("data", (chunk) => console.log("SERVER RUN:", chunk));

