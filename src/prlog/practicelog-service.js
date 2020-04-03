const PracticeLogService = {
  insertUser(knex, user) {
    return knex
      .insert(user)
      .into("users")
      .returning("*");
  },

  getUserIdByName(knex, user) {
    return knex
      .select("users.id")
      .from("users")
      .where("users.user_name", user);
  },

  insertGoal(knex, goal, user_id) {
    return knex
      .insert(goal)
      .into("goals")
      .where("goals.user_id", user_id)
      .returning("*");
  },

  insertDays(knex, newDays) {
    return knex
      .insert(newDays)
      .into("days")
      .returning("*")
      .then(rows => {
        return rows;
      });
  }
};
// getAllUserGoals(knex, user) {
//   return knex
//     .select("goals.id")
//     .from("goals")
//     .join("users")
//     .on("users.id", "goals.user_id")
//     .where("users.user_name" === user);
// },

module.exports = PracticeLogService;
