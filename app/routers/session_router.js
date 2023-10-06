const { Router } = require("express");
const {
  createSession,
  deleteSession,
  sessions,
} = require("../controllers/session_controller");

const SessionRouter = (context) => {

  const SessionRouter = Router();

  SessionRouter.all("/start-session", createSession(context));
  SessionRouter.all("/delete-session", deleteSession(context));
  SessionRouter.all("/sessions", sessions(context));

  return SessionRouter;
}

module.exports = SessionRouter;
