# Auction Bot on Twitch

A Twitch chat bot that runs live auctions. Viewers place bids with `!bid <amount>` in chat, and the current highest bid is rendered to an HTML overlay you can drop into OBS as a browser source.

## How it works

- Connects to a Twitch channel via [tmi.js](https://github.com/tmijs/tmi.js) and listens for `!bid` messages.
- Bids are validated against the current highest bid stored in DynamoDB. Higher bids are written to the `bids` table; lower bids get a chat reply telling the user the floor to beat.
- An Express server exposes `/data` (JSON: highest bid + bidder) and serves `index.html`, an auto-refreshing overlay that polls `/data` every 10 seconds.

## Setup

```bash
npm install
```

Set the following environment variables:

| Variable             | Purpose                                                          |
| -------------------- | ---------------------------------------------------------------- |
| `TWITCH_ACCOUNT`     | Twitch channel name to join                                      |
| `TWITCH_TMI_TOKEN`   | OAuth token for the bot account (get one at https://twitchapps.com/tmi) |
| `PORT`               | (Optional) Express port. Defaults to `3369`                      |

AWS credentials are picked up via the standard AWS SDK chain (env vars, shared credentials file, or IAM role). The bot expects a DynamoDB table named `bids` in `us-west-2` with items shaped like `{ id, bid, user }`.

## Running

```bash
npm start
```

This starts the Express server and connects the bot to Twitch chat. Add `http://localhost:3369/` as a browser source in OBS to display the overlay.

## Chat commands

- `!bid <amount>` — place a bid (e.g. `!bid 25` or `!bid $25.50`). Must exceed the current highest bid.

## Project layout

- `index.js` — bot + Express server
- `index.html` — overlay served at `/`
- `public/` — static assets (fonts, etc.)
