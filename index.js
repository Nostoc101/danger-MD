import makeWASocket, { useMultiFileAuthState, DisconnectReason, Browsers } from '@whiskeysockets/baileys';
import pino from 'pino';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';
import express from 'express';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ==========================================
// CORE IDENTITY & SECURITY PROTOCOLS - DANGER-MD
// ==========================================
const OWNER_NAME = "Nostoc 😈";
const BOT_NAME = "DANGER-MD";
const PREFIX = "."; 
const PORT = process.env.PORT || 10000; 
// REMOVED TARGET_PHONE LOCK - Now public
// const TARGET_PHONE = "2348142334779"; 

const THEME = {
    banner: `\n============================================================\n    🔥  D I A B L O   M O D E   A C T I V A T E D  🔥\n============================================================\n[DANGER-MD SYSTEM // VERSION 7.0.0]\n> PUBLIC MODE: ENGAGED\n> AUTHORIZED OPERATOR: ${OWNER_NAME.toUpperCase()}\n------------------------------------------------------------`,
    prefix: `[DANGER-MD://DIABLO]`,
    line: `----------------------------------------`,
    securityAlert: `❌ [SECURITY://ACCESS_DENIED]\n> ONLY OWNER CAN USE ADMIN COMMANDS`
};

const OWNER_NUMBER = process.env.OWNER_NUMBER || "2348142334779"; // Set in Railway Variables
const commands = new Map();
const pendingPairings = new Map(); // store who requested pairing

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
        execute: () => `🚀 [DANGER-MD://PING]\nLATENCY : ${Date.now() - Date.now()}ms\nSTATUS : ONLINE\nMODE : PUBLIC`
    });

    const bugs = [
        'test', 'crash', 'leak', 'cpu', 'slow', 'timeout', 'db', 'auth', 'race', 'corrupt',
        'overflow', 'unhandled', 'env', 'perm', 'deadlock', 'null', 'json', 'dep', 'infinite',
        'dns', 'fswrite', 'fsread', 'portconflict', 'sslexpired', 'corsblocked', 'evalerror',
        'rangeerror', 'urierror', 'eventemitter', 'gcfreeze', 'bufferalloc', 'cryptofail',
        'zliberror', 'childprocess', 'http2error', 'processdisconnect', 'workerterminate',
        'intlerror', 'asynchooks', 'v8heap', 'readlinefreeze', 'replcrash', 'streamdestroy',
        'clusterdisconnect', 'netserverfail', 'dgramerror', 'modulenotfound', 'syntaxerror',
        'typecoercion', 'arraybound', 'asyncdeadlock', 'timeroverflow', 'prototypepollution',
        'mathprecision', 'abortedfetch'
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
// WHATSAPP CONNECTION LOGIC (PAIRING ENGINE)
// ==========================================
async function connectToWhatsApp(requestedNumber = null) {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');
    const sock = makeWASocket({
        logger: pino({ level: 'silent' }),
        printQRInTerminal: false,
        browser: Browsers.macOS('Safari'),
        auth: state
    });

    if (!sock.authState.creds.registered && requestedNumber) {
        setTimeout(async () => {
            try {
                const pairingCode = await sock.requestPairingCode(requestedNumber);
                const formattedCode = pairingCode?.match(/.{1,4}/g)?.join("-") || pairingCode;
                console.log(`\n============================================================\n🔑 PAIRING CODE FOR ${requestedNumber}: ${formattedCode}\n============================================================`);
                pendingPairings.set(requestedNumber, formattedCode);
            } catch (err) {
                console.error('Pairing code generation failed:', err);
            }
        }, 5000);
    }

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            if (lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut) {
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

        // CHANGED: Only OWNER_NUMBER can use admin commands
        if (command.adminOnly && senderNumber !== OWNER_NUMBER) {
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
    return sock;
}

// ==========================================
// EXPRESS WEB PANEL FOR PUBLIC PAIRING
// ==========================================
const app = express();
app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.get('/', (req, res) => {
  let codeDisplay = '';
  if(pendingPairings.size > 0){
    const [num, code] = pendingPairings.entries().next().value;
    codeDisplay = `<p><b>Latest Code for ${num}:</b> ${code}</p>`;
  }
  
  res.send(`
  <body style="background:#111;color:#0f0;font-family:monospace;text-align:center;padding:40px">
  <h1>🔥 ${BOT_NAME} PUBLIC PANEL 🔥</h1>
  <p>Enter any WhatsApp number to get pairing code</p>
  <form method="POST" action="/pair">
    <input name="number" placeholder="2348XXXXXXXX" required style="padding:10px;width:250px">
    <button style="padding:10px">Get Pairing Code</button>
  </form>
  ${codeDisplay}
  <p style="margin-top:20px">${THEME.line}</p>
  <p>Owner: ${OWNER_NAME}</p>
  </body>
  `)
});

let activeSocket = null;
app.post('/pair', async (req, res) => {
  let number = req.body.number.replace(/[^0-9]/g, '');
  if(!number) return res.send('Invalid number');
  
  // Restart connection to generate code for new number
  if(activeSocket) await activeSocket.ws.close();
  activeSocket = await connectToWhatsApp(number);
  
  res.redirect('/');
});

app.get('/health', (req, res) => res.send(`${BOT_NAME} Protocol Active. Public Mode`));
app.listen(PORT, () => console.log(`${THEME.prefix} Web port handling live on ${PORT}`));

loadSystemArchitecture();
connectToWhatsApp(); // start without number