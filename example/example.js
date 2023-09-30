const sessionName = question("Masukan Nama sessi");

const {
   default: makeWASocket,
   delay,
   fetchLatestBaileysVersion,
   makeCacheableSignalKeyStore,
   makeInMemoryStore,
   PHONENUMBER_MCC,
   useMultiFileAuthState,
   DisconnectReason,
   MessageType,
} = require("@whiskeysockets/baileys");

const pino = require("pino");
const fs = require("fs");
const NodeCache = require("node-cache");
const readline = require("readline");

const useStore = false;
const usePairingCode = true;
const useMobile = false;
const express = require("express");
const bodyParser = require("body-parser");


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
store?.readFromFile(`./session/${sessionName}`);

// Simpan setiap 1 menit
setInterval(() => {
   store?.writeToFile("./session/${sessionName}");
}, 10000 * 6);

const msgRetryCounterCache = new NodeCache();

const rl = readline.createInterface({
   input: process.stdin,
   output: process.stdout,
});
const question = (text) => new Promise((resolve) => rl.question(text, resolve));


const P = require("pino")({
   level: "silent",
});



async function start() {
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
   sock.ev.process(async (events) => {
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
               
            } else {
               console.log("Koneksi ditutup. Anda telah keluar.");
            }
         }
         console.log("Pembaruan koneksi", update);
         
      }
   });
   app.get('/valid' , async (req , res)=>{
      const phone = req.query.number;
      numberWA = phone + "@s.whatsapp.net";
    
          const exists = await sock.onWhatsApp(numberWA);
          console.log(exists);
          if (exists?.jid || (exists && exists[0]?.jid)) {
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
     
  
  })
   sock.ev.on("messages.upsert", async ({ messages, type }) => {
      //console.log(messages);
      if (type === "notify") {
          if (!messages[0].key.fromMe) {
              //tentukan jenis pesan berbentuk text                
              const pesan = messages[0].message.conversation;

              //nowa dari pengirim pesan sebagai id
              const noWa = messages[0].key.remoteJid;
              console.log(noWa);
              await sock.readMessages([messages[0].key]);

              //kecilkan semua pesan yang masuk lowercase 
              const pesanMasuk = pesan.toLowerCase();

              if (!messages[0].key.fromMe && pesanMasuk === "ping") {
                  await sock.sendMessage(noWa, { text: "Pong" }, { quoted: messages[0] });
              } else {
                  // await sock.sendMessage(noWa, { text: "Nggeh, pripun?" }, { quoted: messages[0] });
              }
          }
      }
  });



// // Route untuk mengirim pesan
// app.get("/send-message", async (req, res) => {

//    const pesankirim = req.body.message;
//     const number = req.body.number;
//    await sock.sendMessage("6281554850403@s.whatsapp.net", { text: "Pong" });
  
// });

app.get("/send-message", async (req, res) => {
   const pesan = req.query.message; // Mengambil pesan dari parameter 'message' dalam URL
   const wa = req.query.number; // Mengambil nomor tujuan dari parameter 'number' dalam URL
   const nomorTujuan = wa + "@s.whatsapp.net";
console.log(req.query);
   if (!pesan || !nomorTujuan) {
      res.status(400).json({ status: false, response: 'Harap sertakan pesan dan nomor tujuan dalam URL.' });
      return;
   }

   try {
      // Kirim pesan ke nomor tujuan
      // await sendMessage(sock, nomorTujuan, pesan);
      await sock.sendMessage(nomorTujuan, { text: pesan });
      res.status(200).json({ status: true, response: 'Pesan berhasil dikirim.' });
   } catch (error) {
      res.status(500).json({ status: false, response: 'Kesalahan saat mengirim pesan.' });
   }
});

app.get("/send-image", async (req, res) => {
   const pesan = req.query.message; // Mengambil pesan dari parameter 'message' dalam URL
   const wa = req.query.number; // Mengambil nomor tujuan dari parameter 'number' dalam URL
   const nomorTujuan = wa + "@s.whatsapp.net";
   if (!pesan || !nomorTujuan) {
      res.status(400).json({ status: false, response: 'Harap sertakan pesan dan nomor tujuan dalam URL.' });
      return;
   }

   try {
      // Kirim pesan ke nomor tujuan
      // await sendMessage(sock, nomorTujuan, pesan);

      
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

// Mulai server Express
app.listen(port, () => {
   console.log(`Server berjalan di port ${port}`);
});

  
}

// Panggil fungsi start untuk memulai proses
start();
