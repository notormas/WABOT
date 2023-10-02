const whatsapp = require("wa-multi-session");
const ValidationError = require("../../utils/error");
const { responseSuccessWithData } = require("../../utils/response");
exports.sendMessage = async (req, res, next) => {
  try {
    let to = req.body.to || req.query.to;
    let text = req.body.text || req.query.text;
    let isGroup = req.body.isGroup || req.query.isGroup;
    const sessionId =
      req.body.session || req.query.session || req.headers.session;

    // Menambahkan parameter untuk gambar dan caption
    let image = req.body.image || req.query.image;
    let caption = req.body.caption || req.query.caption;

    if (!to) throw new ValidationError("Missing 'to' Parameter");

    const receiver = to;
    if (!sessionId) throw new ValidationError("Session Not Found");

    let send;

    // Mengirim pesan gambar jika image ada
    if (image) {
      send = await whatsapp.sendImage({
        sessionId,
        to: receiver,
        isGroup: !!isGroup,
        media:image, // Gambar (biasanya berupa URL atau path file)
        text:text, // Keterangan atau caption untuk gambar
      });
    } else {
      // Mengirim pesan teks jika image tidak ada
      send = await whatsapp.sendTextMessage({
        sessionId,
        to: receiver,
        isGroup: !!isGroup,
        text,
      });
    }

    res.status(200).json(
      responseSuccessWithData({
        id: send?.key?.id,
        status: send?.status,
        message: send?.message?.extendedTextMessage?.text || "Not Text",
        remoteJid: send?.key?.remoteJid,
      })
    );
  } catch (error) {
    next(error);
  }
};


exports.sendBulkMessage = async (req, res, next) => {
  try {
    const sessionId =
      req.body.session || req.query.session || req.headers.session;
    const delay = req.body.delay || req.query.delay || req.headers.delay;
    if (!sessionId) {
      return res.status(400).json({
        status: false,
        data: {
          error: "Session Not Found",
        },
      });
    }
    res.status(200).json({
      status: true,
      data: {
        message: "Bulk Message is Processing",
      },
    });
    for (const dt of req.body.data) {
      const to = dt.to;
      const text = dt.text;
      const isGroup = !!dt.isGroup;

      await whatsapp.sendTextMessage({
        sessionId,
        to: to,
        isGroup: isGroup,
        text: text,
      });
      await whatsapp.createDelay(delay ?? 1000);
    }
    console.log("SEND BULK MESSAGE WITH DELAY SUCCESS");
  } catch (error) {
    next(error);
  }
};
