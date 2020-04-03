const path = require("path");
const express = require("express");
const xss = require("xss");
const { requireAuth } = require("../middleware/jwt-auth");
const logger = require("../logger");
const PracticeLogService = require("./practicelog-service");
//const makeDays = require("../STORE");
//const { getNoteValidationError } = require("./note-validator");

const practicelogRouter = express.Router();
const bodyParser = express.json();

const serializeDay = day => ({
  id: day.id,
  date: day.date,
  completed: day.completed,
  technique: day.technique,
  repertoire: day.repertoire,
  actual_hours: day.actual_hours,
  touched: day.touched,
  goal_id: day.goal_id,
  user_id: day.user_id
});

practicelogRouter
  .route("/days")
  .all(requireAuth)

  .post(bodyParser, (req, res, next) => {
    const { num_of_days, actual_hours } = req.body;

    function makeDays(num_of_days, actual_hours) {
      let newDays = new Array(num_of_days);
      for (let i = 0; i < num_of_days; i++) {
        newDays[i] = {
          day_num: i + 1,
          date: new Date(),
          actual_hours: actual_hours,
          completed: "",
          technique: "",
          repertoire: "",
          touched: false,
          goal_id: 1
        };
      }
      return newDays;
    }

    let newDays = makeDays(num_of_days, actual_hours);

    console.log(newDays);

    if (![actual_hours] || !num_of_days) {
      logger.error(`actual_hours and num_of_days are required`);
      return res.status(400).send({
        error: { message: `actual_hours and num_of_days are required` }
      });
    }

    PracticeLogService.insertDays(
      //if (error) return res.status(400).send(error); //const error = getNoteValidationError(newNote);
      req.app.get("db"),
      newDays
    )
      .then(newDays => {
        logger.info(`days with id ${days.id} created.`);
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `${days.id}`))
          .json(newDays.map(serializeDay));
      })
      .catch(next);
  });

practicelogRouter
  .route("/goal")
  //.all(requireAuth)
  .post(bodyParser, (req, res) => {
    console.log(req.body);
    const { user } = req.body;

    PracticeLogService.getUserIdByName(req.app.get("db"), user).then(
      user_id => {
        const { goal } = { user_id: user_id };
        PracticeLogService.insertGoal(req.app.get("db"), goal, user_id).then(
          res => {
            logger.info(`new goal with id ${res.id} created.`);
            res.status(201).json(res);
          }
        );
      }
    );
  });

module.exports = practicelogRouter;
