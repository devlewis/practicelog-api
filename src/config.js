module.exports = {
  PORT: process.env.PORT || 8000,
  CLIENT_ORIGIN: "*",
  NODE_ENV: process.env.NODE_ENV || "development",
  API_BASE_URL:
    process.env.REACT_APP_API_BASE_URL || "http://localhost:3000/api",
  DATABASE_URL:
    process.env.DATABASE_URL || "postgresql://postgres@localhost/prlog",
  TEST_DATABASE_URL:
    process.env.TEST_DATABASE_URL ||
    "postgresql://postgres@localhost/prlog_test",
  JWT_SECRET: process.env.JWT_SECRET || "secret",
  JWT_EXPIRY: process.env.JWT_EXPIRY || "5m",
};
