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

  getMostRecentGoal(knex, user) {
    return knex("goals")
      .max("goals.id")
      .where("goals.user_id", user);
  },

  insertGoal(knex, goal) {
    return knex
      .insert(goal)
      .into("goals")
      .returning("*")
      .then(row => {
        return row;
      });
  },

  insertDays(knex, newDays) {
    return knex
      .insert(newDays)
      .into("days")
      .returning("*")
      .then(rows => {
        return rows;
      });
  },

  getByDayId(knex, dayId) {
    return knex
      .select("days.id")
      .from("days")
      .where("days.id", dayId);
  },

  updateDay(knex, id, newDayContent) {
    return knex("days")
      .where({ id })
      .update(newDayContent);
  },

  getByDayId(knex, id) {
    console.log("the day id in the service", id);
    return knex
      .from("days")
      .select("*")
      .where("id", id)
      .first();
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
