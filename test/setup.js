process.env.TZ = "UCT";
process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "secret";
process.env.JWT_EXPIRY = "20s";

require("dotenv").config();

process.env.TEST_DB_URL =
  process.env.TEST_DB_URL || "postgresql://postgres@localhost/prlog_test";

const { expect } = require("chai");
const supertest = require("supertest");

global.expect = expect;
global.supertest = supertest;
