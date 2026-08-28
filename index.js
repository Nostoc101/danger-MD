import makeWASocket, { useMultiFileAuthState, DisconnectReason, Browsers } from '@whiskeysockets/baileys';
import pino from 'pino';
import 'dotenv/config';

// ==========================================
// CORE IDENTITY & SECURITY PROTOCOLS - DANGER-MD
// ==========================================
const OWNER_NAME = "Nostoc 😈";
const BOT_NAME = "DANGER-MD";
const PREFIX = ".";
const OWNER_NUMBER = process.env.OWNER_NUMBER || "2348142334779"; // Your bot number here

const THEME = {
    banner: `\n============================================================\n 🔥 D I A B L O M O D E A C T I V A T E D 🔥\n============================================================\n[DANGER-MD SYSTEM // VERSION 7.0.0]\n> PUBLIC MODE: ENGAGED\n> AUTHORIZED OPERATOR: ${OWNER_NAME.toUpperCase()}\n------------------------------------------------------------`,
    prefix: `[DANGER-MD://DIABLO]`,
    line: `----------------------------------------`,
    securityAlert: `❌ [SECURITY://ACCESS_DENIED]\n> ONLY OWNER CAN USE ADMIN COMMANDS`
};

const commands = new Map();

// ==========================================
// BUG UTILITY INTERNALS
// ==========================================
function executeBugSimulation(type) {
    console.log(`[BUG:EXECUTIONER] Injecting payload for simulation: ${type}`);
    switch (type) {
        case 'force-crash':
            setTimeout(() => { process.exit(1); }, 1000);
            return "💀 [CRASH_DEPLOYED] Server will terminate in 1 second.";
        case 'memory-leak':
            const leakArray = [];
            for (let i = 0; i < 50000; i++) { leakArray.push(new Array(100).fill('leak')); }
            return "💧 [LEAK_DEPLOYED] Flooded memory heap allocation arrays.";
        case 'cpu-spike':
            const end = Date.now() + 2000;
            while (Date.now() < end) { Math.random() * Math.random(); }
            return "⚡ [CPU_SPIKE] Forced single-thread execution spike for 2000ms.";
        default:
            return `💀 [DIABLO://BUG_DEPLOYED]\nACTION: ${type.toUpperCase()}\nTARGET: STABLE_SESSION\nSTATUS: INJECTED SUCCESSFULLY.`;
    }
}

// ==========================================
// LOAD COMMAND MATRIX
// ==========================================
function loadSystemArchitecture() {
    commands.set('status', {
        name: 'status',
        adminOnly: false,
        execute: () => `BOT : ${BOT_NAME}\nSTATUS : OPERATIONAL\nINTEGRITY: 100%\nOWNER : ${OWNER_NAME}\nMODE : PUBLIC`
    });

    commands.set('ping', {
        name: 'ping',
        adminOnly: false,
        execute: () => `🚀 [DANGER-MD://PING]\nLATENCY : ONLINE\nSTATUS : 100%`
    });

    const bugs = [
        'test', 'crash', 'leak', 'cpu', 'slow', 'timeout', 'db', 'auth', 'race', 'corrupt',
        'overflow', 'unhandled', 'env', 'perm', 'deadlock', 'null', 'json', 'dep', 'infinite'
    ];

    bugs.forEach(bugName => {
        commands.set(`bug:${bugName}`, {
            name: `bug:${bugName}`,
            adminOnly: true, // ONLY OWNER
            execute: () => executeBugSimulation(bugName)
        });
    });

    commands.set('menu', {
        name: 'menu',
        adminOnly: false,
        execute: () => {
            let menuText = `📜 [${BOT_NAME.toUpperCase()} MENU]\n> ${PREFIX}status\n> ${PREFIX}ping\n> ${PREFIX}menu\n\n🔥 [DIABLO ULTRA-BUG TRIGGERS]\n`;
            bugs.forEach(b => { menuText += `> ${PREFIX}bug:${b}\n`; });
            return menuText + `\n${THEME.line}\nOwner: ${OWNER_NAME}`;
        }
    });

    console.log(THEME.banner);
}

// ==========================================
// WHATSAPP CONNECTION LOGIC - NUMBER PAIRING
// ==========================================
async function connectToWhatsApp() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');
    const sock = makeWASocket({
        logger: pino({ level: 'silent' }),
        printQRInTerminal: false, // NO QR
        browser: Browsers.macOS('Safari'),
        auth: state
    });

    // NEW: Auto request pairing code if not registered
    if (!sock.authState.creds.registered) {
        setTimeout(async () => {
            try {
                const pairingCode = await sock.requestPairingCode(OWNER_NUMBER);
                const formattedCode = pairingCode?.match(/.{1,4}/g)?.join("-") || pairingCode;
                console.log(`\n============================================================\n🔑 YOUR WHATSAPP PAIRING CODE: ${formattedCode}\nGo to WhatsApp > Linked Devices > Link with phone number\n============================================================`);
            } catch (err) {
                console.error('Pairing code generation failed:', err);
            }
        }, 3000);
    }

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            if (lastDisconnect?.error?.output?.statusCode!== DisconnectReason.loggedOut) {
                connectToWhatsApp();
            }
        } else if (connection === 'open') {
            console.log(`${THEME.prefix} Connected successfully! Public Mode Active`);
        }
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('messages.upsert', async ({ messages }) => {
        if (!messages || messages.length === 0) return;
        const msg = messages[0];
        if (!msg.message || msg.key.fromMe) return;

        const senderNumber = msg.key.remoteJid.replace('@s.whatsapp.net', '');
        const messageTypes = Object.keys(msg.message);
        let text = '';

        if (messageTypes.includes('conversation')) {
            text = msg.message.conversation;
        } else if (messageTypes.includes('extendedTextMessage')) {
            text = msg.message.extendedTextMessage.text;
        }

        if (!text.startsWith(PREFIX)) return;

        const args = text.slice(PREFIX.length).trim().split(/ +/);
        const commandName = args.shift().toLowerCase();
        const command = commands.get(commandName);
        if (!command) return;

        if (command.adminOnly && senderNumber!== OWNER_NUMBER) {
            await sock.sendMessage(msg.key.remoteJid, { text: THEME.securityAlert });
            return;
        }

        try {
            const response = command.execute();
            await sock.sendMessage(msg.key.remoteJid, { text: response });
        } catch (error) {
            console.error('Execution error:', error);
        }
    });
}

loadSystemArchitecture();
connectToWhatsApp();