import { default as makeWASocket, delay, fetchLatestBaileysVersion, makeCacheableSignalKeyStore, makeInMemoryStore, PHONENUMBER_MCC, useMultiFileAuthState, DisconnectReason, MessageType } from "@whiskeysockets/baileys";
import pino from "pino";
import fs from "fs";
import NodeCache from "node-cache";
import readline from "readline";
import express from "express";
import bodyParser from "body-parser";

let sessionName = "";

const useStore: boolean = false;
const usePairingCode: boolean = true;
const useMobile: boolean = false;

const rl = readline.createInterface({
   input: process.stdin,
   output: process.stdout,
});


const question = (text: string): Promise<string> => new Promise((resolve) => rl.question(text, resolve));

const questName = async () => {
   const name = await question("Name Sessi : ")
   sessionName = "session-"+name;
}



// Konfigurasi Express
const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const MAIN_LOGGER = pino({
   timestamp: () => `,"time":"${new Date().toJSON()}"`,
});

const logger = MAIN_LOGGER.child({});
logger.level = "trace";

const store = useStore ? makeInMemoryStore({ logger }) : undefined;
store?.readFromFile(`./session/session-${sessionName}`);

// Simpan setiap 1 menit
setInterval(() => {
   store?.writeToFile(`./session/session-${sessionName}`);
}, 10000 * 6);

const msgRetryCounterCache = new NodeCache();



const P = pino({
   level: "silent",
});



async function start() {
   await questName();
   let { state, saveCreds } = await useMultiFileAuthState(sessionName);
   let { version, isLatest } = await fetchLatestBaileysVersion();
   const sock = makeWASocket({
      version,
      logger: P, // P untuk konsol log yang tersembunyi
      printQRInTerminal: !usePairingCode, // Jika Anda ingin menggunakan pemindaian, ubah nilai variabel ini menjadi false
      mobile: useMobile,
      browser: ["chrome (linux)", "", ""], // Jika Anda mengubah ini, maka kode pairing tidak akan berfungsi
      auth: {
         creds: state.creds,
         keys: makeCacheableSignalKeyStore(state.keys, P),
      },
      msgRetryCounterCache,
   });
   store?.bind(sock.ev);

   sock.ev.on("creds.update", saveCreds); // untuk menyimpan kredensial

   if (usePairingCode && !sock.authState.creds.registered) {
      if (useMobile) {
         throw new Error("Tidak dapat menggunakan API seluler");
      }
      const phoneNumber = await question("Masukkan nomor WhatsApp aktif Anda: ");
      const code = await sock.requestPairingCode(phoneNumber);
      console.log(`Pengaitan dengan kode ini: ${code}`);
   }

   // Untuk memperbarui pesan dari WhatsApp
   sock.ev.process(async (events: Record<string, any>) => {
      if (events["connection.update"]) {
         const update = events["connection.update"];
         const { connection, lastDisconnect } = update;
         if (connection === "close") {
            if (
               lastDisconnect &&
               lastDisconnect.error &&
               lastDisconnect.error.output &&
               lastDisconnect.error.output.statusCode !==
                  DisconnectReason.loggedOut
            ) {
               // Handle disconnection error here
            } else {
               console.log("Koneksi ditutup. Anda telah keluar.");
            }
         }
         console.log("Pembaruan koneksi", update);
      }
   });

   app.get('/valid', async (req, res) => {
      const phone = req.query.number;
      const numberWA = phone + "@s.whatsapp.net";
      const exists = await sock.onWhatsApp(numberWA);
      if ((exists as any ).jid || (exists && exists[0]?.jid)) {
         fs.appendFile('success_numbers.txt', `${phone}\n`, (err) => {
            if (err) {
               console.error('Gagal menyimpan nomor ke file:', err);
            } else {
               console.log('Nomor berhasil disimpan ke file.');
            }
         });
         res.status(200).json({
            status: true,
            response: `valid ${phone} `,
         });
      } else {
         res.status(500).json({
            status: false,
            response: `Nomor ${phone} tidak terdaftar.`,
         });
      }
   });

   sock.ev.on("messages.upsert", async ({ messages, type }: { messages: any[], type: string }) => {
      if (type === "notify") {
         if (!messages[0].key.fromMe) {
            const pesan = messages[0].message.conversation;
            const noWa = messages[0].key.remoteJid;
            console.log(noWa);
            await sock.readMessages([messages[0].key]);
            const pesanMasuk = pesan.toLowerCase();
            if (!messages[0].key.fromMe && pesanMasuk === "ping") {
               await sock.sendMessage(noWa, { text: "Pong" }, { quoted: messages[0] });
            }
         }
      }
   });

   app.get("/send-message", async (req, res) => {
      const pesan = req.query.message as string;
      const wa = req.query.number as string;
      const nomorTujuan = wa + "@s.whatsapp.net";
      console.log(req.query);
      if (!pesan || !nomorTujuan) {
         res.status(400).json({ status: false, response: 'Harap sertakan pesan dan nomor tujuan dalam URL.' });
         return;
      }

      try {
         await sock.sendMessage(nomorTujuan, { text: pesan });
         res.status(200).json({ status: true, response: 'Pesan berhasil dikirim.' });
      } catch (error) {
         res.status(500).json({ status: false, response: 'Kesalahan saat mengirim pesan.' });
      }
   });

   app.get("/send-image", async (req, res) => {
      const pesan = req.query.message as string;
      const wa = req.query.number as string;
      const nomorTujuan = wa + "@s.whatsapp.net";
      if (!pesan || !nomorTujuan) {
         res.status(400).json({ status: false, response: 'Harap sertakan pesan dan nomor tujuan dalam URL.' });
         return;
      }

      try {
         await sock.sendMessage(nomorTujuan, {
            image: {
               url: './hy.jpeg'
            },
            caption: pesan
         });
         res.status(200).json({ status: true, response: 'Pesan berhasil dikirim.' });
      } catch (error) {
         res.status(500).json({ status: false, response: 'Kesalahan saat mengirim pesan.' });
      }
   });

   // Port yang akan digunakan oleh Express
   const port = process.env.PORT || 3000;
}

// Panggil fungsi start untuk memulai proses
start();