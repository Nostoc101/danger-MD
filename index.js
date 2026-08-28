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
const TARGET_PHONE = "2348142334779"; // YOUR LOCKED OPERATOR DEVICE

const THEME = {
    banner: `
============================================================
    🔥  D I A B L O   M O D E   A C T I V A T E D  🔥
============================================================
[DANGER-MD SYSTEM // VERSION 7.0.0]
> INTEGRATED ADMIN LOCK: ENGAGED
> AUTHORIZED OPERATOR: ${OWNER_NAME.toUpperCase()}
> TARGET NUMBER: ${TARGET_PHONE}
------------------------------------------------------------`,
    prefix: `[DANGER-MD://DIABLO]`,
    line: `----------------------------------------`,
    securityAlert: `❌ [SECURITY://ACCESS_DENIED]\n> PRIVILEGE ENFORCEMENT PROTOCOL ACTIVATED.\n> ONLY ${TARGET_PHONE} CAN USE ADMIN COMMANDS`
};

const commands = new Map();
const cooldowns = new Map();
let sockGlobal;

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
async function loadSystemArchitecture() {
    const commandsDir = path.join(__dirname, 'commands');
    if (!fs.existsSync(commandsDir)) fs.mkdirSync(commandsDir);

    // Built-in Core
    commands.set('status', {
        name: 'status',
        adminOnly: false,
        execute: () => `BOT : ${BOT_NAME}\nSTATUS : OPERATIONAL\nINTEGRITY: 100%\nOPERATOR : ${OWNER_NAME}\nNUMBER : ${TARGET_PHONE}`
    });

    commands.set('ping', {
        name: 'ping',
        adminOnly: false,
        execute: () => `🚀 [DANGER-MD://PING]\nLATENCY : ${Date.now() - Date.now()}ms\nSTATUS : ONLINE\nTARGET : ${TARGET_PHONE}`
    });

    // ------------------------------------------------------------
    // THE 55 AUTOMATED BUG COMMAND MATRIX REGISTRY
    // ------------------------------------------------------------
    const bugCommandsList = [
        { trigger: 'bug:test', type: 'test-suite' },
        { trigger: 'bug:crash', type: 'force-crash' },
        { trigger: 'bug:leak', type: 'memory-leak' },
        { trigger: 'bug:cpu', type: 'cpu-spike' },
        { trigger: 'bug:slow', type: 'slow-network' },
        { trigger: 'bug:timeout', type: 'request-timeout' },
        { trigger: 'bug:db', type: 'db-fail' },
        { trigger: 'bug:auth', type: 'auth-bypass' },
        { trigger: 'bug:race', type: 'race-condition' },
        { trigger: 'bug:corrupt', type: 'data-corruption' },
        { trigger: 'bug:overflow', type: 'stack-overflow' },
        { trigger: 'bug:unhandled', type: 'unhandled-promise' },
        { trigger: 'bug:env', type: 'missing-env' },
        { trigger: 'bug:perm', type: 'permission-denied' },
        { trigger: 'bug:deadlock', type: 'deadlock' },
        { trigger: 'bug:null', type: 'null-pointer' },
        { trigger: 'bug:json', type: 'invalid-json' },
        { trigger: 'bug:dep', type: 'dep-collision' },
        { trigger: 'bug:infinite', type: 'infinite-loop' },
        { trigger: 'bug:dns', type: 'dns-failure' },
        { trigger: 'bug:fswrite', type: 'fs-write-fail' },
        { trigger: 'bug:fsread', type: 'fs-read-fail' },
        { trigger: 'bug:portconflict', type: 'port-conflict' },
        { trigger: 'bug:sslexpired', type: 'ssl-expired' },
        { trigger: 'bug:corsblocked', type: 'cors-blocked' },
        { trigger: 'bug:evalerror', type: 'eval-error' },
        { trigger: 'bug:rangeerror', type: 'range-error' },
        { trigger: 'bug:urierror', type: 'uri-error' },
        { trigger: 'bug:eventemitter', type: 'event-emitter-leak' },
        { trigger: 'bug:gcfreeze', type: 'gc-freeze' },
        { trigger: 'bug:bufferalloc', type: 'buffer-alloc-error' },
        { trigger: 'bug:cryptofail', type: 'crypto-fail' },
        { trigger: 'bug:zliberror', type: 'zlib-error' },
        { trigger: 'bug:childprocess', type: 'child-process-fail' },
        { trigger: 'bug:http2error', type: 'http2-error' },
        { trigger: 'bug:processdisconnect', type: 'process-disconnect' },
        { trigger: 'bug:workerterminate', type: 'worker-terminate' },
        { trigger: 'bug:intlerror', type: 'intl-error' },
        { trigger: 'bug:asynchooks', type: 'async-hooks-leak' },
        { trigger: 'bug:v8heap', type: 'v8-heap-exhaust' },
        { trigger: 'bug:readlinefreeze', type: 'readline-freeze' },
        { trigger: 'bug:replcrash', type: 'repl-crash' },
        { trigger: 'bug:streamdestroy', type: 'stream-destroy' },
        { trigger: 'bug:clusterdisconnect', type: 'cluster-disconnect' },
        { trigger: 'bug:netserverfail', type: 'net-server-fail' },
        { trigger: 'bug:dgramerror', type: 'dgram-error' },
        { trigger: 'bug:modulenotfound', type: 'module-not-found' },
        { trigger: 'bug:syntaxerror', type: 'syntax-error' },
        { trigger: 'bug:typecoercion', type: 'type-coercion-bug' },
        { trigger: 'bug:arraybound', type: 'array-bound-panic' },
        { trigger: 'bug:asyncdeadlock', type: 'async-deadlock' },
        { trigger: 'bug:timeroverflow', type: 'timer-overflow' },
        { trigger: 'bug:prototypepollution', type: 'prototype-pollution' },
        { trigger: 'bug:mathprecision', type: 'math-precision-error' },
        { trigger: 'bug:abortedfetch', type: 'aborted-fetch' }
    ];

    // Inject bug routines directly into system map
    bugCommandsList.forEach(bug => {
        commands.set(bug.trigger, {
            name: bug.trigger,
            adminOnly: true,
            execute: () => executeBugSimulation(bug.type)
        });
    });

    commands.set('menu', {
        name: 'menu',
        adminOnly: false,
        execute: () => {
            let bugMenuText = `📜 [${BOT_NAME.toUpperCase()} MENU]\n` +
                              `> ${PREFIX}status - Check bot status\n` +
                              `> ${PREFIX}ping - Check bot latency\n` +
                              `> ${PREFIX}menu - Show this menu\n\n` +
                              `🔥 [DIABLO ULTRA-BUG TRIGGERS]\n`;
            
            bugCommandsList.forEach(b => {
                bugMenuText += `> ${PREFIX}${b.trigger}\n`;
            });

            bugMenuText += `\n${THEME.line}\nOperator: ${OWNER_NAME}`;
            return bugMenuText;
        }
    });

    console.log(THEME.banner);
    console.log(`${THEME.prefix} Loaded core command matrix + 55 bug subroutines successfully.`);
}

// ==========================================
// WHATSAPP CONNECTION LOGIC (PAIRING ENGINE)
// ==========================================
async function connectToWhatsApp() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');
    
    const sock = makeWASocket({
        logger: pino({ level: 'silent' }),
        printQRInTerminal: false,
        browser: Browsers.macOS('Safari'),
        auth: state
    });

    sockGlobal = sock;

    // Automated Pairing Execution Sequence
    if (!sock.authState.creds.registered) {
        setTimeout(async () => {
            try {
                console.log(`\n${THEME.prefix} Requesting pairing authentication code for: ${TARGET_PHONE}...`);
                const pairingCode = await sock.requestPairingCode(TARGET_PHONE);
                const formattedCode = pairingCode?.match(/.{1,4}/g)?.join("-") || pairingCode;
                
                console.log(`\n============================================================`);
                console.log(`🔑 YOUR WHATSAPP PAIRING CODE: ${formattedCode}`);
                console.log(`============================================================`);
                console.log(`👉 Go to WhatsApp > Linked Devices > Link a Device > Link with phone number instead`);
                console.log(`👉 Enter the 8-character code above to link your bot instantly.\n`);
            } catch (pairingError) {
                console.error(`${THEME.prefix} Failed to generate numerical pairing code:`, pairingError);
            }
        }, 5000);
    }

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log(`${THEME.prefix} Connection closed. Reconnecting: ${shouldReconnect}`);
            if (shouldReconnect) {
                connectToWhatsApp();
            }
