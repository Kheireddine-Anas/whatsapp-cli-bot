# WhatsApp CLI Bot 📱💬

A command-line interface for WhatsApp that allows you to send and receive messages, manage chats, and interact with WhatsApp Web directly from your terminal.

## 🚀 Features

- **Send Messages**: Send text messages to any WhatsApp contact
- **List Chats**: View your recent or all WhatsApp conversations
- **Unread Messages**: Check and manage unread messages
- **Read Messages**: View message history from specific chats
- **Media Support**: Handle and download media files (images, videos, documents)
- **Desktop Notifications**: Get notified when new messages arrive
- **QR Code Authentication**: Secure login using WhatsApp's QR code system

## 🛠️ Technologies Used

- **Node.js**: JavaScript runtime environment
- **whatsapp-web.js**: WhatsApp Web API wrapper for Node.js
- **Puppeteer**: Headless Chrome browser automation (included with whatsapp-web.js)
- **qrcode-terminal**: Generate QR codes in the terminal for authentication
- **node-notifier**: Cross-platform desktop notifications
- **readline**: Built-in Node.js module for command-line interface

## 📋 Prerequisites

- Node.js (v14 or higher)
- npm (Node Package Manager)
- WhatsApp account with mobile app

## 🔧 Installation

1. **Clone or download the project:**
   ```bash
   git clone <repository-url>
   cd whatsapp-cli
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run the bot:**
   ```bash
   node bot.js
   ```

## 🔐 Authentication Process

When you first run the bot, it will:

1. Start a headless Chrome browser instance
2. Load WhatsApp Web
3. Generate and display a QR code in your terminal
4. Wait for you to scan the QR code with your phone

**To authenticate:**
1. Open WhatsApp on your mobile device
2. Go to **Settings** → **Linked Devices** → **Link a Device**
3. Scan the QR code displayed in your terminal
4. Once authenticated, you'll see "✅ WhatsApp is ready!"

## 📁 Generated Folders & Files

The bot creates several folders and files for authentication and session management:

### Authentication Storage
- `.wwebjs_auth/` - Contains authentication session data
  - `session-main/` - Main session folder (clientId: 'main')
    - `Default/` - Chrome user profile data
    - Various Chrome-related files for session persistence

### Cache Storage
- `.wwebjs_cache/` - Browser cache and temporary files

### Media Files
- `read-media-*.{ext}` - Downloaded media files from messages (when using `read` command)
  - Format: `read-media-{timestamp}.{extension}`
  - Examples: `read-media-1641234567890.jpg`, `read-media-1641234567891.pdf`

## 🎮 Available Commands

Once authenticated, you can use these commands:

| Command | Description | Example |
|---------|-------------|---------|
| `send <number> <message>` | Send a text message | `send 1234567890 Hello there!` |
| `list` | Show last 10 chats | `list` |
| `list all` | Show all chats | `list all` |
| `msgs` | Show unread messages | `msgs` |
| `read <index/name/number>` | Read messages from a chat | `read 1` or `read John` |
| `clear` | Clear the terminal screen | `clear` |
| `exit` | Stop the bot and exit | `exit` |

## 📖 Usage Examples

### Sending a Message
```bash
> send 1234567890 Hello from WhatsApp CLI!
✅ Message sent to 1234567890
```

### Checking Unread Messages
```bash
> msgs
🔔 Unread chats:
[ 1 ]: John Doe (3)
[ 2 ]: Work Group (7)
[ 3 ]: +1234567890 (1)
```

### Reading Messages
```bash
> read 1
📖 Last messages in "John Doe":
John Doe: Hey, how are you?
You: I'm good, thanks!
John Doe: Great to hear!
```

## 🔒 Security & Privacy

- **Local Authentication**: All session data is stored locally on your machine
- **No Data Collection**: The bot doesn't collect or send your data anywhere
- **WhatsApp's Security**: Uses WhatsApp's official Web API through whatsapp-web.js
- **Session Persistence**: Once authenticated, you won't need to scan QR code again (unless you clear session data)

## ⚠️ Known Limitations

- **Read Receipts (Blue Ticks):**
  - When you read messages using this CLI bot, the messages may not appear as "read" (blue tick) to the sender in their WhatsApp app, even if Read Receipts are enabled on both accounts.
  - This is a limitation of the WhatsApp Web API and how message status is handled by whatsapp-web.js.
  - Sending a message to the same chat also does not mark previous messages as read.

If you require the "read" status to be reflected to the sender, you may need to open the chat in the official WhatsApp app or WhatsApp Web.

## 🔄 Development

### Project Structure
```
whatsapp-cli/
├── bot.js              # Main bot application
├── package.json        # Dependencies and project info
├── README.md          # This file
├── LICENSE            # MIT License file
├── .gitignore         # Git ignore rules
├── .wwebjs_auth/      # Authentication data (auto-generated)
├── .wwebjs_cache/     # Browser cache (auto-generated)
└── read-media-*.*     # Downloaded media files (auto-generated)
```

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

**What this means:**
- ✅ **Free to use** - Anyone can use this code for any purpose
- ✅ **Free to modify** - Anyone can change and improve the code  
- ✅ **Free to distribute** - Anyone can share or redistribute the code
- ✅ **Commercial use allowed** - Companies can use it in their products
- ✅ **No warranty** - Code is provided "as is" without guarantees

**Requirements:**
- 📝 Keep the original copyright notice and license text in any copies

## 🤝 Contributing

Feel free to fork this project and submit pull requests for improvements or bug fixes.

## ⚠️ Disclaimer

This bot uses unofficial WhatsApp Web API. Use at your own risk and ensure compliance with WhatsApp's Terms of Service.

## 🔧 Running as a Background Service

For advanced users who want to run WhatsApp CLI as a background service (daemon), there's a separate service version available in the `/AsService` folder.

### Service Features
- **Background Operation**: Runs as a systemd service
- **Socket Communication**: Use Unix sockets to interact with the running service
- **Interactive Client**: Full-featured CLI client for service interaction
- **Auto-start**: Starts automatically on system boot
- **Service Management**: Standard systemd controls (start, stop, restart, status)

### Quick Service Setup
```bash
cd AsService
./install.sh
```

### Service Usage
```bash
# Connect to the running service
./whatsapp

# Or if symlink was created during installation
whatsapp-cli
```

### Service Management
```bash
# Check service status
sudo systemctl status whatsapp-cli

# View service logs
sudo journalctl -u whatsapp-cli -f

# Restart service
sudo systemctl restart whatsapp-cli
```

For detailed service documentation, see [`AsService/README.md`](AsService/README.md).
