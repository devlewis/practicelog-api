const knex = require("knex");
const app = require("../src/app");
const helpers = require("./test-helpers");

describe("Prlog Endpoints", function () {
  let db;

  const { testUsers, testGoals, testDays } = helpers.makePrlogFixtures();

  before("make knex instance", () => {
    db = knex({
      client: "pg",
      connection: process.env.TEST_DATABASE_URL,
    });
    app.set("db", db);
  });

  after("disconnect from db", () => db.destroy());

  before("cleanup", () => helpers.cleanTables(db));

  afterEach("cleanup", () => helpers.cleanTables(db));

  describe(`GET /api/prlog/goal`, () => {
    context(`Given no goals`, () => {
      beforeEach("insert goals", () =>
        helpers.seedPrlogTables(db, testUsers, testGoals, testDays)
      );
      it(`responds with 200 and an empty list`, () => {
        return supertest(app)
          .get("/api/prlog/goal")
          .set("Authorization", helpers.makeAuthHeader(testUsers[0]))
          .expect(200, []);
      });
    });

    context("Given there are goals in the database", () => {
      beforeEach("insert goals", () =>
        helpers.seedPrlogTables(db, testUsers, testGoals, testDays)
      );

      it("responds with 201 and the most recent goalId", () => {
        const maxExpectedGoal = {
          id: 3,
          user_id: 3,
          num_of_days: 100,
          total_hours: 0,
          hours_goal: "2.00",
        };
        return supertest(app)
          .get("/api/prlog/goal")
          .set("Authorization", helpers.makeAuthHeader(testUsers[2]))
          .expect(201, maxExpectedGoal);
      });
    });
  });

  describe(`POST /api/prlog/goal`, () => {
    beforeEach("insert days", () =>
      helpers.seedPrlogTables(db, testUsers, testGoals, testDays)
    );

    it(`creates an array of new days, each with new goal_id, 
    responding with 201 and the array`, function () {
      this.retries(3);
      const testGoal = testGoals[0];
      const testUser = testUsers[0];
      const newDays = {
        num_of_days: 3,
        actual_hours: 2,
        user_id: testUser.id,
        total_hours: 0,
      };

      return supertest(app)
        .post("/api/prlog/goal")
        .set("Authorization", helpers.makeAuthHeader(testUsers[0]))
        .send(newDays)
        .expect(201)
        .expect((res) => {
          expect(res.body[0]).to.have.property("id");
          expect(res.body.length).to.eql(3);
          expect(res.body[1].goal_id).to.eql(5);
        })
        .expect((res) =>
          db
            .from("days")
            .select("*")
            .where({ id: res.body[0].id })
            .first()
            .then((row) => {
              expect(row.goal_id).to.eql(5);
              expect(row.user_id).to.eql(testUser.id);
            })
        );
    });
  });

  describe(`PUT /api/prlog/updategoal`, () => {
    beforeEach("insert days", () =>
      helpers.seedPrlogTables(db, testUsers, testGoals, testDays)
    );

    it(`responds with 204`, function () {
      this.retries(3);
      const testUser = testUsers[0];

      const updatedGoal = {
        goal_id: 1,
        num_of_days: 3,
        actual_hours: 2,
        user_id: testUser.id,
        total_hours: 0,
      };

      return supertest(app)
        .put("/api/prlog/updategoal")
        .set("Authorization", helpers.makeAuthHeader(testUsers[0]))
        .send(updatedGoal)
        .expect(204);
    });
  });

  describe(`GET /api/prlog/alldays`, () => {
    beforeEach("insert days", () =>
      helpers.seedPrlogTables(db, testUsers, testGoals, testDays)
    );
    it("responds with 201 and an array of days", () => {
      const testUser = testUsers[1];

      return supertest(app)
        .get("/api/prlog/alldays")
        .set("Authorization", helpers.makeAuthHeader(testUsers[1]))
        .expect(201)
        .expect((res) => {
          expect(res.body[0]).to.have.property("id");
          expect(res.body.length).to.eql(2);
          expect(res.body[1].goal_id).to.eql(2);
        })
        .expect((res) =>
          db
            .from("days")
            .select("*")
            .where({ id: res.body[0].id })
            .first()
            .then((row) => {
              expect(row.goal_id).to.eql(2);
              expect(row.user_id).to.eql(testUser.id);
            })
        );
    });
  });

  describe(`PUT /api/prlog/days`, () => {
    beforeEach("insert days", () =>
      helpers.seedPrlogTables(db, testUsers, testGoals, testDays)
    );

    it(`responds with 204`, function () {
      this.retries(3);
      const testUser = testUsers[1];
      const dayToUpdate = {
        id: 1,
        day_num: 1,
        day_date: new Date("2029-01-22T16:28:32.615Z"),
        completed: "true",
        technique: "",
        repertoire: "",
        actual_hours: 5,
        touched: true,
        goal_id: 1,
        user_id: testUser.id,
        goal_hours: 3,
      };

      return supertest(app)
        .put("/api/prlog/updategoal")
        .set("Authorization", helpers.makeAuthHeader(testUsers[1]))
        .send(dayToUpdate)
        .expect(204);
    });
  });

  describe(`GET /api/prlog/alldays`, () => {
    beforeEach("insert days", () =>
      helpers.seedPrlogTables(db, testUsers, testGoals, testDays)
    );

    it(`returns an array of days,
    responding with 201 and the array`, function () {
      this.retries(3);
      const testUser = testUsers[1];

      return supertest(app)
        .get("/api/prlog/alldays")
        .set("Authorization", helpers.makeAuthHeader(testUser))
        .expect(201)
        .expect((res) => {
          expect(res.body[0]).to.have.property("id");
          expect(res.body.length).to.eql(2);
          expect(res.body[1].goal_id).to.eql(2);
        })
        .expect((res) =>
          db
            .from("days")
            .select("*")
            .where({ id: res.body[0].id })
            .first()
            .then((row) => {
              expect(row.goal_id).to.eql(2);
              expect(row.user_id).to.eql(testUser.id);
            })
        );
    });
  });
});
