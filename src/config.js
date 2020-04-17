module.exports = {
  PORT: process.env.PORT || 8000,
  NODE_ENV: process.env.NODE_ENV || "development",
  DATABASE_URL:
    process.env.DATABASE_URL || "postgresql://postgres@localhost/prlog",
  JWT_SECRET: "secret",
  JWT_EXPIRY: process.env.JWT_EXPIRY || "5m",
};
