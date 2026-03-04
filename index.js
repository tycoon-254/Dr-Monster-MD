import makeWASocket, { useMultiFileAuthState, DisconnectReason } from "@whiskeysockets/baileys";
import P from "pino";
import qrcode from "qrcode-terminal";
import express from "express";

const app = express();
app.get("/", (req, res) => res.send("Dr.Monster Bot is Alive 😈"));
app.listen(process.env.PORT || 3000);

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState("session");

    const sock = makeWASocket({
        logger: P({ level: "silent" }),
        auth: state
    });

    sock.ev.on("creds.update", saveCreds);

    sock.ev.on("connection.update", (update) => {
        const { connection, qr } = update;

        if (qr) {
            console.log("Scan this QR:");
            qrcode.generate(qr, { small: true });
        }

        if (connection === "close") {
            startBot();
        } else if (connection === "open") {
            console.log("Dr.Monster Connected 👑");
        }
    });

    sock.ev.on("messages.upsert", async ({ messages }) => {
        const msg = messages[0];
        if (!msg.message) return;

        const text = msg.message.conversation;

        if (text === ".menu") {
            await sock.sendMessage(msg.key.remoteJid, {
                text: "😈 Dr.Monster Bot Online\n\nCommands:\n.menu\n.ping"
            });
        }

        if (text === ".ping") {
            await sock.sendMessage(msg.key.remoteJid, { text: "Pong 🧠🔥" });
        }
    });
}

startBot();
