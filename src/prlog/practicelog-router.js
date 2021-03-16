const express = require("express");
const { requireAuth } = require("../middleware/jwt-auth");
const logger = require("../logger");
const PracticeLogService = require("./practicelog-service");

const practicelogRouter = express.Router();
const bodyParser = express.json();

practicelogRouter
  .route("/goal")
  .all(requireAuth)
  .post(bodyParser, (req, res) => {
    const { num_of_days, actual_hours, total_hours } = req.body;
    const goal = {
      user_id: req.user.id,
      num_of_days: num_of_days,
      total_hours: total_hours,
      hours_goal: actual_hours,
    };

    for (const [key, value] of Object.entries(goal))
      if (value == null)
        return res.status(400).json({
          error: `Missing '${key}' in request body`,
        });
      else if (goal.hours_goal < 0 || goal.hours_goal > 24) {
        return res
          .status(400)
          .json({ error: `Please enter a number between 0 and 24` });
      }
    return PracticeLogService.insertGoal(req.app.get("db"), goal)
      .then((goal) => {
        logger.info(`goal created.`);

        const goalid = goal[0].id;

        const userid = goal[0].user_id;

        function makeDays(num_of_days, actual_hours, goalid, userid) {
          const newDays = [];
          for (let i = 0; i < num_of_days; i++) {
            const date = new Date();
            const updatedDate = date.setDate(date.getDate() + i);
            const realDate = new Date(updatedDate).toISOString();

            newDays.push({
              day_num: i + 1,
              day_date: realDate,
              completed: "false",
              technique: "",
              repertoire: "",
              actual_hours: 0,
              touched: false,
              goal_id: goalid,
              user_id: userid,
              goal_hours: actual_hours,
            });
          }
          return newDays;
        }

        let newDays = makeDays(num_of_days, actual_hours, goalid, userid);

        if (!actual_hours || !num_of_days || !goalid || !userid) {
          logger.error(`hours and number of days are required`);
          return res.status(400).send({
            error: { message: `hours and number of days are required` },
          });
        }

        return PracticeLogService.insertDays(req.app.get("db"), newDays)
          .then((newDays) => {
            logger.info(`days created.`);
            res.status(201).json(newDays.map(serializeDay));
          })
          .catch((error) => console.log(error));
      })
      .catch((error) => console.log(error));
  })

  .get((req, res) => {
    return PracticeLogService.getMostRecentGoalId(
      req.app.get("db"),
      req.user.id
    )
      .then((goalId) => {
        logger.info(`goal_id  ${goalId[0].max} retrieved.`);
        const goal_id = goalId[0].max;
        if (!goal_id) {
          return res.status(200).json([]);
        } else {
          return PracticeLogService.getGoalById(req.app.get("db"), goal_id)
            .then((goal) => {
              return res.status(200).json(serializeGoal(goal));
            })
            .catch((error) => console.log(error));
        }
      })
      .catch((error) => console.log(error));
  });

practicelogRouter
  .route("/updategoal")
  .all(requireAuth)
  .put(bodyParser, (req, res) => {
    const { num_of_days, total_hours, hours_goal, goal_id } = req.body;
    const goal = {
      id: goal_id,
      user_id: req.user.id,
      num_of_days: num_of_days,
      total_hours: total_hours,
      hours_goal: hours_goal,
    };

    return PracticeLogService.updateGoal(req.app.get("db"), goal, goal_id)
      .then((goal) => {
        logger.info(`goal with ${goal_id} updated.`);
        return res.status(204).end();
      })
      .catch((error) => console.log(error));
  });

practicelogRouter
  .route("/allgoals")
  .all(requireAuth)
  .get(bodyParser, (req, res) => {
    PracticeLogService.getAllGoals(req.app.get("db"), req.user.id).then(
      (goals) => {
        return res.status(200).json(goals.map(serializeAllGoals));
      }
    );
  });

practicelogRouter
  .route("/alldays")
  .all(requireAuth)
  .get(bodyParser, (req, res) => {
    const user_id = req.user.id;
    return PracticeLogService.getMostRecentGoalId(req.app.get("db"), user_id)
      .then(([goal_id]) => {
        const goalId = goal_id.max;
        if (goalId == null) return res.status(400).json({ error: `No goalId` });
        return PracticeLogService.getAllDays(req.app.get("db"), goalId)
          .then((days) => {
            logger.info(`days fetched.`);
            res.status(200).json(days.map(serializeDay));
          })
          .catch((error) => console.log(error));
      })
      .catch((error) => console.log(error));
  });

practicelogRouter
  .route("/days")
  .all(requireAuth)

  .put(bodyParser, (req, res, next) => {
    const { dayToUpdate } = req.body;
    if (dayToUpdate.actual_hours > 24)
      return res
        .status(400)
        .json({ error: `Please enter a number less than 24.` });

    const numberOfValues = Object.values(dayToUpdate).filter(Boolean).length;
    if (numberOfValues === 0) {
      logger.error(`Invalid update without required fields`);
      return res.status(400).json({
        error: {
          message: `Request body must content 'completed', 'actual_hours', 'technique', and 'repertoire'`,
        },
      });
    }

    return PracticeLogService.updateDay(
      req.app.get("db"),
      dayToUpdate,
      dayToUpdate.id
    )
      .then((rows) => {
        logger.info(`day with id ${dayToUpdate.id} updated.`);
        res.status(204).end();
      })
      .catch(next);
  });

const serializeDay = (day) => ({
  id: day.id,
  day_num: day.day_num,
  day_date: new Date(day.day_date).toString().slice(0, 11),
  completed: day.completed,
  technique: day.technique,
  repertoire: day.repertoire,
  actual_hours: parseFloat(day.actual_hours),
  touched: day.touched,
  goal_id: day.goal_id,
  user_id: day.user_id,
  goal_hours: parseFloat(day.goal_hours),
});

const serializeGoal = (goal) => ({
  id: goal[0].id,
  user_id: goal[0].user_id,
  num_of_days: goal[0].num_of_days,
  total_hours: parseFloat(goal[0].total_hours),
  hours_goal: goal[0].hours_goal,
});

const serializeAllGoals = (goal) => ({
  id: goal.id,
  user_id: goal.user_id,
  num_of_days: goal.num_of_days,
  total_hours: goal.total_hours,
  hours_goal: goal.hours_goal,
});

module.exports = practicelogRouter;
