const AuthService = require("../auth/auth-service");
const logger = require("../logger");

function requireAuth(req, res, next) {
  logger.info(`received and reading the JWT!`);
  const authToken = req.get("Authorization") || "";

  logger.info(`authToken: ${authToken}`);

  let bearerToken;
  if (!authToken.toLowerCase().startsWith("bearer ")) {
    return res.status(401).json({ error: "Missing bearer token" });
  } else {
    bearerToken = authToken.slice(7, authToken.length);
  }

  logger.info(`bearerToken: ${bearerToken}`);

  try {
    const payload = AuthService.verifyJwt(bearerToken);
    logger.info(`payload: ${payload}`);
    AuthService.getUserWithUserName(req.app.get("db"), payload.sub)
      .then((user) => {
        if (!user)
          return res.status(401).json({ error: "Unauthorized request" });
        req.user = user;
        next();
      })
      .catch((err) => {
        console.error(err);
        next(err);
      });
  } catch (error) {
    res.status(401).json({ error: "Unauthorized request" });
  }
}

module.exports = {
  requireAuth,
};
