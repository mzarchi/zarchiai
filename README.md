# ZarchiAI

A Telegram channel management bot built with JavaScript and [tgcloud](https://github.com/tgcloud). It tracks channel membership activity, keeps a history of joins and leaves, and provides lightweight channel administration tools.

## Features

- **Member Tracking** — Records when users join or leave the configured channel.
- **Membership History** — Stores join and leave timestamps in the `member_logs` database table.
- **Activity Logging** — Sends membership event notifications to a configured log channel.
- **Membership Duration** — Calculates how long a member stayed in the channel.
- **Channel Statistics** — Provides counts for tracked users and stored membership records.
- **Channel Description Management** — Updates the description of the configured channel.
- **Tehran Timezone** — Formats membership event dates and times using `Asia/Tehran`.

## Commands

| Command | Description |
| --- | --- |
| `/count` | Shows the number of unique tracked users and total membership records. Admin only. |
| `/updatebio` | Updates the configured channel description. |

## Project Structure

```text
zarchiai/
├── tgcloud/
│   ├── handlers/
│   │   ├── message.js
│   │   ├── chat_member.js
│   │   └── channel_post.js
│   ├── lib/
│   │   └── config.js.example
│   ├── schema.js
│   └── ...
├── docs/
│   └── tgcloud-sdk.md
├── package.json
└── tgcloud.jsonc
```

## Requirements

Before starting, make sure you have:

- **Node.js 18+ and npm** — Download from [nodejs.org](https://nodejs.org). Verify with `node -v` and `npm -v`.
- **Git** — Download from [git-scm.com](https://git-scm.com). Verify with `git --version`.
- **A Telegram account** — You will use it to create a bot and to add the bot to your channel.
- **A Telegram channel you own** — You must be the **creator** of the channel. Admin-only access is not enough for some operations.
- **A tgcloud account** — Sign up at [tgcloud.io](https://tgcloud.io) (free tier is enough to start).
- **A code editor** — [VS Code](https://code.visualstudio.com) is recommended.

You do **not** need prior experience with Telegram bots, SQL, or serverless platforms. Follow the steps below in order.

## Setup

### Step 1 — Create a Telegram bot

1. Open Telegram and search for **@BotFather**. Open the chat (the one with the blue checkmark).
2. Send `/newbot`.
3. BotFather asks for a **name** (display name, can contain spaces, e.g. `Zarchi AI`).
4. BotFather asks for a **username**. It must end in `bot` (e.g. `ZarchiAIBot`). If taken, try another.
5. BotFather replies with a **token** that looks like:

   ```text
   123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ
   ```

   **Copy this token and keep it safe.** Anyone with it controls your bot. If you ever leak it, send `/revoke` to BotFather immediately.

### Step 2 — Create or choose your Telegram channel

1. In Telegram, tap **New Channel** (menu → New Channel).
2. Give it a name, set it public or private, and create it.
3. You must be the **creator** of the channel. If you are only an admin, some commands in this project will fail.

### Step 3 — Get the channel ID

The bot needs the numeric ID of your channel. Two ways to get it:

**Option A — Public channel (has a `@username`)**

You can use the username directly (e.g. `@MyChannel`). No numeric ID needed.

**Option B — Private channel (no username)**

1. Add **@userinfobot** or **@RawDataBot** to the channel as an admin temporarily.
2. Post any message in the channel.
3. The bot replies with a `chat.id` value that starts with `-100`. Example: `-1003900606276`.
4. **Remove the helper bot afterwards.**

Save this ID — you will need it in Step 5.

### Step 4 — Add your bot to the channel as admin

1. Open your channel → **Administrators** → **Add Administrator**.
2. Search for your bot's username (the one you created in Step 1).
3. Add it and grant **at least** these permissions:
   - **Change channel info** — required for `/updatebio`.
   - **Post messages** — required for scheduled messages and log replies.
   - **View members** — required for `chat_member` events.
4. Save.

> Without these permissions, the bot will silently fail or return `ChatAdminRequiredError`.

### Step 5 — Configure the bot in tgcloud

1. Go to [tgcloud.io](https://tgcloud.io), sign in, and click **New Project**.
2. Choose **Link existing bot**, and paste the token from Step 1.
3. Copy the **project ID** shown after creation (you will use it to log in from the CLI in Step 7).
4. In the tgcloud dashboard, go to **Settings → CLI Access** and generate an **access token**. Copy it.

### Step 6 — Clone the project

Open a terminal (Command Prompt / PowerShell on Windows, Terminal on macOS/Linux) and run:

```bash
git clone https://github.com/mzarchi/zarchiai.git
cd zarchiai
npm install
```

If `git` is not installed, download the ZIP from the GitHub page, extract it, and run `npm install` inside the extracted folder.

### Step 7 — Log in to tgcloud from the CLI

```bash
npx tgcloud login
```

When prompted:

- **Project ID**: paste the ID from Step 5.
- **Access token**: paste the token from Step 5.

If login succeeds, you will see a confirmation message.

### Step 8 — Create the local configuration file

Copy the example config:

```bash
cp tgcloud/lib/config.js.example tgcloud/lib/config.js
```

> On Windows PowerShell, use `copy` instead of `cp`.

Open `tgcloud/lib/config.js` in your editor and fill in the values:

```javascript
// tgcloud/lib/config.js
export const ADMIN_CHAT_ID = 123456789;        // your own Telegram user ID
export const LOG_CHANNEL_ID = -1001234567890;  // channel where logs are sent
```

- **`ADMIN_CHAT_ID`** — Your personal Telegram user ID. To get it, message **@userinfobot** and it will reply with your `id`. This is the only account allowed to run `/count` and `/updatebio`.
- **`LOG_CHANNEL_ID`** — The channel ID from Step 3. This is where the bot posts join/leave notifications.

Save the file. **Do not commit this file to Git** (it is already in `.gitignore`).

### Step 9 — Deploy the code

```bash
npm run status
npm run deploy
```

- `status` shows whether the CLI can reach your project.
- `deploy` uploads all handlers and schema to tgcloud.

If `status` fails, re-run Step 7 — your token may have expired.

### Step 10 — Apply the database schema

The project uses a SQLite table called `member_logs`. Create it once:

```bash
npx tgcloud push
npx tgcloud migrate
```

- `push` uploads the schema file to the server for review.
- `migrate` actually creates the table in the database.

You only need to run this once, unless you change `schema.js`.

### Step 11 — Sync the webhook

After every deploy that adds or removes a handler file, run:

```bash
npx tgcloud webhook sync
```

This tells Telegram which update types (`message`, `chat_member`, `channel_post`, etc.) your bot should receive. Without this, the bot will not receive events for newly added handlers.

### Step 12 — Test it

1. **Test `/count`** — Open a private chat with your bot and send `/count`. You should get a reply like:

   ```text
   Unique users in DB: 0
   Total records: 0
   ```

   If you get nothing, check that `ADMIN_CHAT_ID` in `config.js` matches your Telegram user ID exactly.

2. **Test join tracking** — Have a friend (or a second account) join your channel. Within a few seconds you should see a `#Join Member Notice!` message in your log channel. If not, check:
   - The bot is an admin with **View members** permission.
   - `LOG_CHANNEL_ID` is correct.
   - `npx tgcloud webhook sync` was run after the last deploy.

3. **Test `/updatebio`** — In your channel, send `/updatebio`. The channel description should change. If you get `Failed to update bio`, the bot lacks **Change channel info** permission (see Step 4).

### Step 13 — (Optional) Schedule recurring `/updatebio`

If you want the channel bio to stay fresh automatically, you can schedule `/updatebio` messages ahead of time using your own Telegram account (not the bot). See `scripts/schedule_bio.py` in the repository for a ready-made script.

## Troubleshooting

| Problem | Likely cause | Fix |
| --- | --- | --- |
| `/count` does nothing | `ADMIN_CHAT_ID` does not match your Telegram user ID | Get your ID from @userinfobot and update `config.js`, then `npm run deploy` |
| Join/leave events never arrive | Bot is not admin, or `chat_member` not in webhook | Grant **View members** and run `npx tgcloud webhook sync` |
| `/updatebio` returns `ChatAdminRequiredError` | Bot lacks **Change channel info** | Update admin permissions in the channel |
| `Could not find the input entity` (Python scripts) | Telethon has not cached the channel | Open the channel in the Telegram app once, then rerun |
| Login fails with `invalid token` | Access token expired | Regenerate in tgcloud dashboard → Settings → CLI Access |
| Database errors after schema change | Migration not applied | Run `npx tgcloud push` then `npx tgcloud migrate` |

## Database

The `member_logs` table stores membership events:

| Column | Type | Description |
| --- | --- | --- |
| `id` | integer | Primary key, auto-increment |
| `userId` | text | Telegram user ID |
| `join` | integer (timestamp) | Join time, stored as Unix seconds |
| `left` | integer (timestamp) | Leave time, stored as Unix seconds, `null` while still in channel |

A user with `left = null` is currently a member. When they leave, the same row's `left` column is filled in, so the duration can be computed from `left - join`.

## Documentation

For details about the tgcloud SDK and project runtime, see [docs/tgcloud-sdk.md](docs/tgcloud-sdk.md).

## Author

Developed by [@mhzarchi](https://github.com/mzarchi).