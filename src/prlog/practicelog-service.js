const PracticeLogService = {
  insertUser(knex, user) {
    return knex.insert(user).into("users").returning("*");
  },

  getUserIdByName(knex, user) {
    return knex.select("users.id").from("users").where("users.user_name", user);
  },

  getGoalById(knex, goal_id) {
    return knex
      .select("*")
      .from("goals")
      .where("goals.id", goal_id)
      .returning("*")
      .then((row) => {
        return row;
      });
  },

  getMostRecentGoalId(knex, user_id) {
    return knex("goals")
      .max("id")
      .where("user_id", user_id)
      .returning("*")
      .then((row) => {
        return row;
      });
  },

  insertGoal(knex, goal) {
    return knex
      .insert(goal)
      .into("goals")
      .returning("*")
      .then((row) => {
        return row;
      });
  },

  insertDays(knex, newDays) {
    //return knex.raw () INSERT COLUMN("day_date")
    return knex
      .insert(newDays)
      .into("days")
      .returning("*")
      .then((rows) => {
        return rows;
      });
  },

  updateDay(knex, newDayContent, id) {
    return knex("days").where({ id }).update(newDayContent);
  },

  updateGoal(knex, goal, goal_id) {
    return knex("goals").where("goals.id", goal_id).update(goal);
  },

  getByDayId(knex, id) {
    console.log("the day id in the service", id);
    return knex.from("days").select("*").where("id", id).first();
  },

  getAllGoals(knex, user) {
    return knex("goals").select("*").where("goals.user_id", user);
  },

  getAllDays(knex, goalId) {
    return knex("days")
      .orderBy("id")
      .where("days.goal_id", goalId)
      .returning((rows) => {
        return rows;
      });
  },
};

module.exports = PracticeLogService;
