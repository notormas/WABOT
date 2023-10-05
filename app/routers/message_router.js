const { Router } = require("express");
const {
  sendMessage,
  sendBulkMessage,
  valid,
} = require("../controllers/message_controller");

const MessageRouter = (context) => {
  const MessageRouter = Router();
  MessageRouter.all("/send-message", sendMessage);
  MessageRouter.all("/valid", valid);
  MessageRouter.all("/send-bulk-message", sendBulkMessage);
  return MessageRouter;
}

module.exports = MessageRouter;
