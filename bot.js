const notifier = require('node-notifier');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const readline = require('readline');
let unreadChatIndexMap = [];
let groupIndexMap = []; // Store groups for index-based sending

const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
});

const client = new Client({
	authStrategy: new LocalAuth({ 
		clientId: 'main'
	}),
	puppeteer: {
		headless: true,
		args: [
			'--no-sandbox',
			'--disable-setuid-sandbox'
		]
	}
});


client.on('qr', (qr) => {
	console.log('📱 Scan the QR code below:\n');
	qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
	console.log('✅ WhatsApp is ready!');
	startPrompt();
});

client.on('auth_failure', (msg) => {
	console.error('❌ Authentication failed:', msg);
});

client.on('disconnected', (reason) => {
	console.log('❌ WhatsApp disconnected:', reason);
});

client.on('message', async (msg) => {
	if (msg.fromMe) return;

	const contact = await msg.getContact();
	const chat = await msg.getChat();
	const sender = contact.pushname || contact.number;
	
	// Determine if it's a group message
	const isGroup = chat.isGroup;
	const chatName = isGroup ? chat.name : sender;
	const prefix = isGroup ? '👥' : '📨';

	if (msg.hasMedia) {
		const media = await msg.downloadMedia();
		const mime = media.mimetype;

		notifier.notify({
			title: isGroup ? `💬 ${chatName}` : "💬 WhatsApp CLI",
			message: isGroup ? `${sender}: Media message` : "New media message!",
			sound: true,
			wait: false
		});

		console.log(`\n🖼 Media message from ${sender}${isGroup ? ` in ${chatName}` : ''}`);
		console.log(`📎 Type: ${mime}`);
		if (msg.caption) console.log(`💬 Caption: ${msg.caption}`);
	} else if (msg.body) {
		notifier.notify({
			title: isGroup ? `${prefix} ${chatName}` : `📨 Message from ${sender}`,
			message: isGroup ? `${sender}: ${msg.body.length > 40 ? msg.body.slice(0, 40) + '...' : msg.body}` : 
					 msg.body.length > 50 ? msg.body.slice(0, 50) + '...' : msg.body,
			sound: true
		});

		console.log(`\n${prefix} ${isGroup ? `${sender} in ${chatName}` : sender}: ${msg.body}`);
	}
});


function startPrompt() {
	rl.question('\n> ', async (input) => {
		const args = input.trim().split(' ');
		const cmd = args[0].toLowerCase();

		switch (cmd) {
			case 'send':
				const number = args[1];
				const message = args.slice(2).join(' ');
				if (!number || !message) {
					console.log('Usage: send <number> <message>');
				} else {
					try {
						await client.sendMessage(`${number}@c.us`, message);
						console.log(`✅ Message sent to ${number}`);
					} catch (e) {
						console.error('❌ Error sending message:', e.message);
					}
				}
				break;

			case 'sendgroup':
				const groupIndex = args[1];
				const groupMessage = args.slice(2).join(' ');
				if (!groupIndex || !groupMessage) {
					console.log('Usage: sendgroup <group_index> <message>');
					console.log('💡 Use "groups" command first to see group indices');
				} else {
					try {
						if (!isNaN(groupIndex) && groupIndexMap.length > 0) {
							const index = parseInt(groupIndex) - 1;
							if (index >= 0 && index < groupIndexMap.length) {
								const targetGroup = groupIndexMap[index];
								await client.sendMessage(targetGroup.id._serialized, groupMessage);
								console.log(`✅ Message sent to group "${targetGroup.name}"`);
							} else {
								console.log('❌ Invalid group index. Use "groups" to see available groups.');
							}
						} else {
							console.log('❌ Please provide a valid group index. Use "groups" command first.');
						}
					} catch (e) {
						console.error('❌ Error sending message to group:', e.message);
					}
				}
				break;

			case 'list':
				const showAll = args[1] === 'all';
				const chatsToShow = await client.getChats();

				if (!chatsToShow.length) {
					console.log("📭 No chats found.");
					break;
				}

				const chats = showAll ? chatsToShow : chatsToShow.slice(0, 10);

				console.log(showAll ? `📃 All Chats:` : `📃 Last 10 Chats:`);

				chats.forEach((c, i) => {
					const name = c.name || null;
					const number = c.id.user;
					const display = name ? `${name} (${number})` : `${number}`;
					console.log(`${i + 1}. ${display}`);
				});

				if (!showAll && chatsToShow.length > 10) {
					console.log(`\n📌 To see all chats, type: list all`);
				}
				break;

			case 'groups':
				try {
					const allChats = await client.getChats();
					const groups = allChats.filter(chat => chat.isGroup);

					groupIndexMap = groups; // Store groups globally for index-based sending

					if (groups.length === 0) {
						console.log('📭 No groups found.');
						break;
					}

					console.log('👥 Your Groups:');
					groups.forEach((group, i) => {
						const participantCount = group.participants ? group.participants.length : 'Unknown';
						console.log(`${i + 1}. ${group.name}`);
						console.log(`   📍 ID: ${group.id.user}`);
						console.log(`   👤 Participants: ${participantCount}`);
						if (group.unreadCount > 0) {
							console.log(`   🔔 Unread: ${group.unreadCount}`);
						}
						console.log('');
					});
					console.log('💡 Use "send <group_index> <message>" to send to a group by index');
				} catch (e) {
					console.error('❌ Error fetching groups:', e.message);
				}
				break;

			case 'groupinfo':
				const targetGroupId = args[1];
				if (!targetGroupId) {
					console.log('Usage: groupinfo <group_id>');
					console.log('💡 Use "groups" command to see group IDs');
					break;
				}

				try {
					const allChats = await client.getChats();
					const targetGroup = allChats.find(chat => 
						chat.isGroup && chat.id.user === targetGroupId
					);

					if (!targetGroup) {
						console.log('❌ Group not found.');
						break;
					}

					console.log(`👥 Group Information: ${targetGroup.name}`);
					console.log(`📍 Group ID: ${targetGroup.id.user}`);
					console.log(`📝 Description: ${targetGroup.description || 'No description'}`);
					console.log(`👤 Participants: ${targetGroup.participants.length}`);
					console.log(`🔔 Unread messages: ${targetGroup.unreadCount}`);
					
					console.log('\n👥 Participants:');
					for (let participant of targetGroup.participants) {
						const contact = await client.getContactById(participant.id._serialized);
						const name = contact.pushname || contact.name || participant.id.user;
						const isAdmin = participant.isAdmin ? ' (Admin)' : '';
						console.log(`   • ${name}${isAdmin}`);
					}
				} catch (e) {
					console.error('❌ Error getting group info:', e.message);
				}
				break;


			case 'msgs':
				const allChats = await client.getChats();
				const unread = allChats.filter(c => c.unreadCount > 0);

				unreadChatIndexMap = unread;

				if (unread.length === 0) {
					console.log('📭 No unread messages.');
				} else {
					console.log('🔔 Unread chats:');
					unread.forEach((c, i) => {
						const nameOrNum = c.name || `+${c.id.user}`;
						console.log(`[ ${i + 1} ]: ${nameOrNum} (${c.unreadCount})`);
					});
				}
				break;



			case 'read':
				const inputId = args[1];
				if (!inputId) {
					console.log('❌ Usage: read <index|name|number>');
					break;
				}

				let targetChat;

				// Check if input is a number index from the unread list
				if (!isNaN(inputId) && unreadChatIndexMap.length > 0) {
					const index = parseInt(inputId) - 1;
					if (index >= 0 && index < unreadChatIndexMap.length) {
						targetChat = unreadChatIndexMap[index];
					} else {
						console.log('❌ Invalid index. Use "msgs" to see chat indexes.');
						break;
					}
				}

				// Fallback: search by name or number
				if (!targetChat) {
					const all = await client.getChats();
					targetChat = all.find(c =>
						c.name?.toLowerCase().includes(inputId.toLowerCase()) ||
						c.id.user.includes(inputId)
					);
				}

				if (!targetChat) {
					console.log('❌ Chat not found.');
					break;
				}
				const fs = require('fs');
				const path = require('path');

				const messages = await targetChat.fetchMessages({ limit: 10 });
				console.log(`📖 Last messages in "${targetChat.name || targetChat.id.user}":`);

				for (let m of messages) {
					const author = m.fromMe ? 'You' : targetChat.name || m.from;

					if (m.hasMedia) {
						const media = await m.downloadMedia();
						const mime = media.mimetype;
						const ext = mime.split('/')[1].split(';')[0];  // clean extension
						const filename = `read-media-${Date.now()}.${ext}`;


						const buffer = Buffer.from(media.data, 'base64');
						fs.writeFileSync(path.join(__dirname, filename), buffer);

						console.log(`${author}: 🖼 Media message`);
						console.log(`         📎 Type: ${mime}`);
						if (m.caption) console.log(`         💬 Caption: ${m.caption}`);
						console.log(`         💾 Saved to ${filename}`);
					} else if (m.body) {
						console.log(`${author}: ${m.body}`);
					} else {
						console.log(`${author}: [Deleted or unsupported message]`);
					}
				}
				break;

			case 'clear':
				console.clear();
				break;
			case 'exit':
				console.log('👋 Goodbye!');
				rl.close();
				process.exit(0);

			default:
				console.log('❓ Unknown command. Available commands:');
				console.log('📤 send <number> <message> - Send message to contact');
				console.log('👥 sendgroup <group_index> <message> - Send message to group by index');
				console.log('📋 list [all] - Show chats');
				console.log('👥 groups - Show all groups with indices');
				console.log('ℹ️  groupinfo <group_id> - Show group details');
				console.log('🔔 msgs - Show unread messages');
				console.log('📖 read <index|name|number> - Read messages');
				console.log('🧹 clear - Clear screen');
				console.log('🚪 exit - Exit bot');
		}

		startPrompt();
	});
}

console.log('🚀 Starting WhatsApp CLI Bot...');

// Add error event listener
client.on('error', (error) => {
	console.error('❌ Client error:', error);
});

// Add loading event listener
client.on('loading_screen', (percent, message) => {
	console.log(`⏳ Loading... ${percent}% - ${message}`);
});

try {
	client.initialize();
} catch (error) {
	console.error('❌ Failed to initialize WhatsApp client:', error.message);
	process.exit(1);
}
