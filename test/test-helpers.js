const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

function makeUsersArray() {
  return [
    {
      id: 1,
      user_name: "test-user-1",
      password: "password",
      date_created: new Date("2029-01-22T16:28:32.615Z"),
    },
    {
      id: 2,
      user_name: "test-user-2",
      password: "password",
      date_created: new Date("2029-01-22T16:28:32.615Z"),
    },
    {
      id: 3,
      user_name: "test-user-3",
      password: "password",
      date_created: new Date("2029-01-22T16:28:32.615Z"),
    },
    {
      id: 4,
      user_name: "test-user-4",
      password: "password",
      date_created: new Date("2029-01-22T16:28:32.615Z"),
    },
  ];
}

function makeGoalsArray(users) {
  return [
    {
      id: 1,
      user_id: users[1].id,
      num_of_days: 7,
      total_hours: 0.0,
      hours_goal: 3.0,
    },
    {
      id: 2,
      user_id: users[1].id,
      num_of_days: 30,
      total_hours: 0.0,
      hours_goal: 7.0,
    },
    {
      id: 3,
      user_id: users[2].id,
      num_of_days: 100,
      total_hours: 0.0,
      hours_goal: 2.0,
    },
    {
      id: 4,
      user_id: users[3].id,
      num_of_days: 7,
      total_hours: 10,
      hours_goal: 3.5,
    },
  ];
}

function makeDaysArray(users, goals) {
  return [
    {
      id: 1,
      day_num: 1,
      day_date: new Date("2029-01-22T16:28:32.615Z"),
      completed: "false",
      technique: "",
      repertoire: "",
      actual_hours: 0,
      touched: false,
      goal_id: goals[0].id,
      user_id: users[0].id,
      goal_hours: 3,
    },
    {
      id: 2,
      day_num: 2,
      day_date: new Date("2029-01-22T16:28:32.615Z"),
      completed: "false",
      technique: "",
      repertoire: "",
      actual_hours: 0,
      touched: false,
      goal_id: goals[0].id,
      user_id: users[0].id,
      goal_hours: 3,
    },
    {
      id: 3,
      day_num: 1,
      day_date: new Date("2029-01-22T16:28:32.615Z"),
      completed: "true",
      technique: "",
      repertoire: "",
      actual_hours: 3,
      touched: true,
      goal_id: goals[1].id,
      user_id: users[0].id,
      goal_hours: 4,
    },
    {
      id: 4,
      day_num: 2,
      day_date: new Date("2029-01-22T16:28:32.615Z"),
      completed: "true",
      technique: "",
      repertoire: "",
      actual_hours: 3,
      touched: true,
      goal_id: goals[1].id,
      user_id: users[0].id,
      goal_hours: 4,
    },
    {
      id: 5,
      day_num: 1,
      day_date: new Date("2029-01-22T16:28:32.615Z"),
      completed: "true",
      technique: "",
      repertoire: "",
      actual_hours: 3,
      touched: true,
      goal_id: goals[0].id,
      user_id: users[1].id,
      goal_hours: 5,
    },
    {
      id: 6,
      day_num: 2,
      day_date: new Date("2029-01-22T16:28:32.615Z"),
      completed: "true",
      technique: "",
      repertoire: "",
      actual_hours: 4,
      touched: true,
      goal_id: goals[0].id,
      user_id: users[1].id,
      goal_hours: 5,
    },
    {
      id: 7,
      day_num: 3,
      day_date: new Date("2029-01-22T16:28:32.615Z"),
      completed: "false",
      technique: "",
      repertoire: "",
      actual_hours: 0,
      touched: false,
      goal_id: goals[0].id,
      user_id: users[1].id,
      goal_hours: 5,
    },
  ];
}

function makeExpectedGoal(users, goal, days = []) {
  const goal_user = users.find((user) => user.id === goal.user_id);
  console.log(goal_user);
  const number_of_days = days.filter((day) => day.goal_id === goal.id).length;
  console.log(number_of_days);

  return {
    id: goal.id,
    user_id: goal_user.id,
    num_of_days: number_of_days,
    total_hours: 0,
    hours_goal: 3,
  };
}
}
function makePrlogFixtures() {
  const testUsers = makeUsersArray();
  const testGoals = makeGoalsArray(testUsers);
  const testDays = makeDaysArray(testUsers, testGoals);
  return { testUsers, testGoals, testDays };
}

function cleanTables(db) {
  return db.transaction((trx) =>
    trx
      .raw(
        `TRUNCATE
          users,
          goals,
          days
        `
      )
      .then(() =>
        Promise.all([
          trx.raw(`ALTER SEQUENCE days_id_seq minvalue 0 START WITH 1`),
          trx.raw(`ALTER SEQUENCE goals_id_seq minvalue 0 START WITH 1`),
          trx.raw(`ALTER SEQUENCE users_id_seq minvalue 0 START WITH 1`),
          trx.raw(`SELECT setval('days_id_seq', 0)`),
          trx.raw(`SELECT setval('goals_id_seq', 0)`),
          trx.raw(`SELECT setval('users_id_seq', 0)`),
        ])
      )
  );
}

function seedUsers(db, users) {
  const preppedUsers = users.map((user) => ({
    ...user,
    password: bcrypt.hashSync(user.password, 1),
  }));
  return db
    .into("users")
    .insert(preppedUsers)
    .then(() =>
      // update the auto sequence to stay in sync
      db.raw(`SELECT setval('users_id_seq', ?)`, [users[users.length - 1].id])
    );
}

function seedPrlogTables(db, users, goals, days = []) {
  // use a transaction to group the queries and auto rollback on any failure
  return db.transaction(async (trx) => {
    await seedUsers(trx, users);
    await trx.into("goals").insert(goals);
    // update the auto sequence to match the forced id values
    await trx.raw(`SELECT setval('goals_id_seq', ?)`, [
      goals[goals.length - 1].id,
    ]);
    // only insert days if there are some, also update the sequence counter
    if (days.length) {
      await trx.into("days").insert(days);
      await trx.raw(`SELECT setval('days_id_seq', ?)`, [
        days[days.length - 1].id,
      ]);
    }
  });
}

function makeAuthHeader(user, secret = process.env.JWT_SECRET) {
  const token = jwt.sign({ user_id: user.id }, secret, {
    subject: user.user_name,
    algorithm: "HS256",
  });
  return `Bearer ${token}`;
}

module.exports = {
  makeUsersArray,
  makeGoalsArray,
  makeExpectedGoal,
  // makeExpectedArticleComments,
  // makeMaliciousArticle,
  makeDaysArray,

  makePrlogFixtures,
  cleanTables,
  seedPrlogTables,
  // seedMaliciousArticle,
  makeAuthHeader,
  seedUsers,
};
