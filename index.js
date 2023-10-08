const { config } = require("dotenv");
const express = require("express");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const http = require("http");
const path = require("path");
const MainRouter = require("./app/routers");
const errorHandlerMiddleware = require("./app/middlewares/error_middleware");
const whatsapp = require("wa-multi-session");
const { v4: uuidv4 } = require("uuid");
const axios = require("axios"); // Import modul axios

config();

var app = express();

// set public context
app.context = {}
app.context.whatsapp = {}

app.use(morgan("dev"));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.set("view engine", "ejs");

// Public Path
app.use("/p", express.static(path.resolve("public")));
app.use("/p/*", (req, res) => res.status(404).send("Media Not Found"));

app.use(MainRouter(app.context));

app.use(errorHandlerMiddleware);

const PORT = process.env.PORT || "3000";
app.set("port", PORT);
var server = http.createServer(app);
server.on("listening", () => console.log("APP IS RUNNING ON PORT " + PORT));

server.listen(PORT);

whatsapp.onConnected(async (session) => {
  whatsapp.onMessageReceived(async (msg) => {
    console.log("Pesan diterima:", msg);
    const no = msg.key.remoteJid;
    const pesan = msg.message.conversation;
    const url = `https://kpu.bayarsekolah.my.id/sms/ts.php?no=${no}&pesan=${pesan}`;

    try {
      const response = await axios.get(url);
      console.log("Response from external URL:", response.data);
    } catch (error) {
      console.error("Error sending HTTP request:", error);
    }
    
    // Mengirim permintaan HTTP GET ke URL eksternal
    if (msg.message && msg.message.conversation === "1") {
     
      const replyMessage = "Mohon doa dan dukungannya kepada saudara/i *" + msg.pushName + "* untuk membuat perubahan yang lebih maju di DAPIL 6(Sukorejo,Prigen,Pandaan)\nuntuk informasi lebih lanjut bisa menghubungi tim kami di wa.me/6281930714902 siap menerima aspirasi";

      await whatsapp.sendTextMessage({
        sessionId: msg.sessionId,
        to: msg.key.remoteJid,
        text: replyMessage,
      })
        .then((messageId) => {
          console.log(`Pesan berhasil terkirim dengan ID: ${messageId}`);
        })
        .catch((error) => {
          console.error("Gagal mengirim pesan:", error);
        });
    }
  });

  console.log("connected => ", session);
});

whatsapp.onDisconnected((session) => {
  console.log("disconnected => ", session);
});

whatsapp.onConnecting((session) => {
  const uuid = uuidv4();
  app.context.whatsapp[uuid] = session
  console.log("connecting => ", session);
});

whatsapp.loadSessionsFromStorage();
