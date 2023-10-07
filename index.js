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
const { v4: uuidv4 } = require("uuid")

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

whatsapp.onConnected((session) => {
  whatsapp.onMessageReceived(async (msg) => {
    console.log("Pesan diterima:", msg);
    if (msg.message && msg.message.conversation === "1") {
   
    const replyMessage = "Mohon doa dan restunya kepada saudara/i *"+msg.pushName +"* untuk membuat perubahan yang lebih maju untuk DAPIL 6\nuntuk informasi lebih lanjut bisa menghubungi tim kami di wa.me/6281554850403 dalam bentuk aspirasi";


    await whatsapp.sendTextMessage({
      sessionId: msg.sessionId, // Menggunakan session.sessionId
      to: msg.key.remoteJid,
      text: replyMessage, // Menggunakan "text" untuk pesan balasan, bukan "replyMessage"
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
