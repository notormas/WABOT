const { toDataURL } = require("qrcode");
const whatsapp = require("wa-multi-session");
const ValidationError = require("../../utils/error");
const {
  responseSuccessWithMessage,
  responseSuccessWithData,
} = require("../../utils/response");

exports.sessionFromContext = (context) => {
  return async (req, res, next) => {
    try {
      return res.json({
        "error": false,
        "messages": "",
        "data": context.whatsapp,
      })
    } catch (error) {
      next(error);
    }
  }
}

exports.createSession = (context) => {
  return async (req, res, next) => {
    try {
      const scan = req.query.scan;
      const sessionName =
        req.body.session || req.query.session || req.headers.session;
      if (!sessionName) {
        throw new Error("Bad Request");
      }
      whatsapp.onQRUpdated(async (data) => {
        if (res && !res.headersSent) {
          const qr = await toDataURL(data.qr);
          if (scan && data.sessionId == sessionName) {
            res.render("scan", { qr: qr });
          } else {
            res.status(200).json(
              responseSuccessWithData({
                qr: qr,
              })
            );
          }
        }
      });
      await whatsapp.startSession(sessionName, { printQR: true });
    } catch (error) {
      next(error);
    }
  };
}
exports.deleteSession = (context) => {
  return async (req, res, next) => {
    try {
      const sessionName =
        req.body.session || req.query.session || req.headers.session;
      if (!sessionName) {
        throw new ValidationError("session Required");
      }
      whatsapp.deleteSession(sessionName);
      res
        .status(200)
        .json(responseSuccessWithMessage("Success Deleted " + sessionName));
    } catch (error) {
      next(error);
    }
  };
}
exports.sessions = (context) => {
  return async (req, res, next) => {
    try {
      const key = req.body.key || req.query.key || req.headers.key;
  
      // is KEY provided and secured
      if (process.env.KEY && process.env.KEY != key) {
        throw new ValidationError("Invalid Key");
      }
  
      res.status(200).json(responseSuccessWithData(whatsapp.getAllSession()));
    } catch (error) {
      next(error);
    }
  };
}