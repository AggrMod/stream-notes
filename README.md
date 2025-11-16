# Stream Notes

A minimal, dependency-free markdown journaling app with live preview, search, and cloud sync capabilities.

## Features

- ✍️ **Markdown Editor** with live preview
- 💾 **LocalStorage Persistence** - your entries are saved automatically
- 🔍 **Search & Filter** - quickly find your entries
- 📤 **Import/Export** - backup and restore your journal as JSON
- ☁️ **Optional Cloud Sync** - sync entries with a server
- 📱 **Responsive UI** - built with Tailwind CSS

## Quick Start

### Client Only (No Server)

1. Open `index.html` in your browser
2. Start writing! Your entries are saved to browser localStorage

### With Server Sync (Optional)

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the server:
   ```bash
   npm start
   ```

3. Open `index.html` in your browser
4. Use the "Sync → Server" and "Pull ← Server" buttons to sync your entries

## How It Works

- **Create** entries with markdown formatting
- **Edit** entries with live preview
- **Search** through all your entries
- **Export** your journal to JSON for backup
- **Import** entries from JSON files
- **Sync** with an optional server for cloud storage

## Files

- `index.html` - Single-page app with UI
- `app.js` - Client-side logic and localStorage management
- `server.js` - Optional Express server for cloud sync
- `package.json` - npm dependencies and scripts

## Tech Stack

- Vanilla JavaScript (no build step required)
- [Tailwind CSS](https://tailwindcss.com/) via CDN
- [Marked.js](https://marked.js.org/) for markdown parsing
- Optional: Express + CORS for server sync

## Future Enhancements

- Authentication and user accounts
- Tags and categories
- Rich media attachments
- GitHub integration for version control
- Mobile app versions

## License

MIT