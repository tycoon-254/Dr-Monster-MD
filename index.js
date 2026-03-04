import makeWASocket, { 
    useMultiFileAuthState, 
    fetchLatestBaileysVersion 
} from "@whiskeysockets/baileys";
import P from "pino";
import express from "express";

const app = express();
app.get("/", (req, res) => res.send("Dr.Monster Bot is Alive 😈"));
app.listen(process.env.PORT || 3000);

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState("session");
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        logger: P({ level: "silent" }),
        auth: state,
        version
    });

    sock.ev.on("creds.update", saveCreds);

    sock.ev.on("connection.update", async (update) => {
        const { connection } = update;

        if (connection === "open") {
            console.log("Dr.Monster Connected 👑");
        }

        if (connection === "close") {
            console.log("Reconnecting...");
            startBot();
        }
    });

    // 🔥 Pairing Code System
    if (!sock.authState.creds.registered) {
        const phoneNumber = process.env.NUMBER; // number from Render env
        const code = await sock.requestPairingCode(phoneNumber);
        console.log("Your Pairing Code:", code);
    }

    sock.ev.on("messages.upsert", async ({ messages }) =>
