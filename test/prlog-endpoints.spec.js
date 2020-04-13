const knex = require("knex");
const app = require("../src/app");
const helpers = require("./test-helpers");

describe("Prlog Endpoints", function () {
  let db;

  const { testUsers, testGoals, testDays } = helpers.makePrlogFixtures();

  before("make knex instance", () => {
    db = knex({
      client: "pg",
      connection: process.env.TEST_DB_URL,
    });
    app.set("db", db);
  });

  after("disconnect from db", () => db.destroy());

  before("cleanup", () => helpers.cleanTables(db));

  afterEach("cleanup", () => helpers.cleanTables(db));

  describe(`GET /api/prlog/goal`, () => {
    context(`Given no goals`, () => {
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

      it("responds with 201 and the most recent goal", () => {
        const expectedGoals = testGoals.map((goal) =>
          helpers.makeExpectedGoal(testUsers, goal, testDays)
        );
        const maxExpectedGoals = [];
        expectedGoals.forEach((goal) => {
          if (!maxExpectedGoals[goal.user_id === goal.user_id]) {
            maxExpectedGoals.push(goal);
          }
        });

        return supertest(app)
          .get("/api/articles")
          .set("Authorization", helpers.makeAuthHeader(testUsers[0]))
          .expect(200, maxExpectedGoals);
      });
    });
  });

  context("Given there are articles in the database", () => {
    beforeEach("insert articles", () =>
      helpers.seedArticlesTables(db, testUsers, testArticles, testComments)
    );

    it("responds with 200 and the specified article", () => {
      const articleId = 2;
      const expectedArticle = helpers.makeExpectedArticle(
        testUsers,
        testArticles[articleId - 1],
        testComments
      );

      return supertest(app)
        .get(`/api/articles/${articleId}`)
        .set("Authorization", helpers.makeAuthHeader(testUsers[0]))
        .expect(200, expectedArticle);
    });
  });

  //     context(`Given an XSS attack article`, () => {
  //       const testUser = helpers.makeUsersArray()[1]
  //       const {
  //         maliciousArticle,
  //         expectedArticle,
  //       } = helpers.makeMaliciousArticle(testUser)

  //       beforeEach('insert malicious article', () => {
  //         return helpers.seedMaliciousArticle(
  //           db,
  //           testUser,
  //           maliciousArticle,
  //         )
  //       })

  //       it('removes XSS attack content', () => {
  //         return supertest(app)
  //           .get(`/api/articles/${maliciousArticle.id}`)
  //           .set('Authorization', helpers.makeAuthHeader(testUser))
  //           .expect(200)
  //           .expect(res => {
  //             expect(res.body.title).to.eql(expectedArticle.title)
  //             expect(res.body.content).to.eql(expectedArticle.content)
  //           })
  //       })
  //     })
  //   })

  //   describe(`GET /api/articles/:article_id/comments`, () => {
  //     context(`Given no articles`, () => {
  //       beforeEach(() =>
  //         helpers.seedUsers(db, testUsers)
  //       )

  //       it(`responds with 404`, () => {
  //         const articleId = 123456
  //         return supertest(app)
  //           .get(`/api/articles/${articleId}/comments`)
  //           .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
  //           .expect(404, { error: `Article doesn't exist` })
  //       })
  //     })

  //     context('Given there are comments for article in the database', () => {
  //       beforeEach('insert articles', () =>
  //         helpers.seedArticlesTables(
  //           db,
  //           testUsers,
  //           testArticles,
  //           testComments,
  //         )
  //       )

  //       it('responds with 200 and the specified comments', () => {
  //         const articleId = 1
  //         const expectedComments = helpers.makeExpectedArticleComments(
  //           testUsers, articleId, testComments
  //         )

  //         return supertest(app)
  //           .get(`/api/articles/${articleId}/comments`)
  //           .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
  //           .expect(200, expectedComments)
  //       })
  //     })
  //   })
});
