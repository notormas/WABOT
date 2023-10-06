const { Router } = require("express");
const {
  sendMessage,
  sendBulkMessage,
  valid,
} = require("../controllers/message_controller");

const MessageRouter = (context) => {
  const MessageRouter = Router();
  MessageRouter.all("/send-message", sendMessage(context));
  MessageRouter.all("/valid", valid(context));
  MessageRouter.all("/send-bulk-message", sendBulkMessage(context));
  return MessageRouter;
}

module.exports = MessageRouter;
