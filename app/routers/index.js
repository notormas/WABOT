const { Router } = require("express");
const MessageRouter = require("./message_router");
const SessionRouter = require("./session_router");

const MainRouter = (context) => {

    const MainRouter = Router();

    MainRouter.use(SessionRouter(context));
    MainRouter.use(MessageRouter(context));

    return MainRouter;
}

module.exports = MainRouter;
