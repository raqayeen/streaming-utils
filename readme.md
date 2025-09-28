# Streaming utilities

My streaming environment.

## Running

1. [Build](#building-the-project) the project
2. Create a [secrets.json](#secrets) file
3. Run `server.js` in the `dist` folder

```sh
cd dist
node server.js -s <PATH_TO_SECRETS>
```

## Building the project

Requirements

- node (using v23, earlier should also work)

Use the provided script in `scripts/build.js` to build the project

```sh
node scripts/build.js
```

## Secrets

In order to run the Twitch integration unfortunately you need to create a
[Twitch bot](https://dev.twitch.tv/docs/chat/#chat-clients). This utility is
basically just a chat client, but even so Twitch requires you to create one.

Once you aquired your bots client id, you need to grant your bot user access, so
it can interact in your chat. See
[Implicit Grant auth flow](https://dev.twitch.tv/docs/authentication/getting-tokens-oauth/#implicit-grant-flow)
for the easiest setup.

Create `secrets.json` with the following format. For development it's expected
to be in the root directory, but you can put it anywhere.

```json
{
    "channelId": "YOUR_CHANNELS_ID",
    "botId": "BOT_ID",
    "clientId": "BOT_CLIENT_ID",
    "clientSecret": "BOT_CLIENT_SECRET",
    "accessToken": "ACCESS_TOKEN", // see Implicit Grant flow
    "obsPort": "4455" // port on which obs-websocket is running
}
```
