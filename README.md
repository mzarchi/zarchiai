
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

- Node.js and npm
- A Telegram bot configured through tgcloud
- A tgcloud account
- Required channel permissions, including access to membership updates and permission to edit the channel description.

## Setup

1. Clone the repository and install dependencies:

   ```bash
   git clone https://github.com/mzarchi/zarchiai.git
   cd zarchiai
   npm install
   ```

2. Create the local configuration file:

   ```bash
   cp tgcloud/lib/config.js.example tgcloud/lib/config.js
   ```

   Configure the following values in `tgcloud/lib/config.js`:

   - `ADMIN_CHAT_ID` — Telegram user or chat ID allowed to use administrative commands.
   - `LOG_CHANNEL_ID` — ID of the channel where membership activity logs are sent.

3. Authenticate with tgcloud:

   ```bash
   npx tgcloud login
   ```

4. Check the project status and deploy:

   ```bash
   npm run status
   npm run deploy
   ```

5. Apply the database schema:

   ```bash
   npx tgcloud migrate
   ```

## Database

The `member_logs` table stores membership events:

| Column | Description |
| --- | --- |
| `id` | Record identifier |
| `userId` | Telegram user ID |
| `join` | Join timestamp |
| `left` | Leave timestamp |

## Documentation

For details about the tgcloud SDK and project runtime, see [docs/tgcloud-sdk.md](docs/tgcloud-sdk.md).

## Author

Developed by [@mhzarchi](https://github.com/mzarchi).
