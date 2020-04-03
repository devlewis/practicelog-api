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
  day_num: day.day_num,
  day_date: day.day_date,
  completed: day.completed,
  technique: day.technique,
  repertoire: day.repertoire,
  actual_hours: day.actual_hours,
  touched: day.touched,
  goal_id: day.goal_id,
  user_id: day.user_id
});

practicelogRouter
  .route("/goal")
  //.all(requireAuth)
  .post(bodyParser, (req, res) => {
    const { num_of_days, actual_hours, user } = req.body;
    PracticeLogService.getUserIdByName(req.app.get("db"), user)
      .then(([user_id]) => {
        const goal = { user_id: user_id.id };

        return PracticeLogService.insertGoal(req.app.get("db"), goal)
          .then(goal => {
            logger.info(`goal created.`);
            console.log("goal", goal);
            const goalid = goal[0].id;
            console.log("goalid", goalid);
            const userid = goal[0].user_id;
            console.log("userid", userid);

            function makeDays(num_of_days, actual_hours, goalid, userid) {
              let newDays = new Array(num_of_days);
              for (let i = 0; i < num_of_days; i++) {
                count = newDays[i] = {
                  day_num: i + 1,
                  day_date: new Date(),
                  completed: "",
                  technique: "",
                  repertoire: "",
                  actual_hours: actual_hours,
                  touched: false,
                  goal_id: goalid,
                  user_id: userid
                };
              }
              return newDays;
            }

            let newDays = makeDays(num_of_days, actual_hours, goalid, userid);

            console.log("newDays", newDays);

            if (!actual_hours || !num_of_days || !goalid || !userid) {
              logger.error(`actual_hours and num_of_days are required`);
              return res.status(400).send({
                error: { message: `actual_hours and num_of_days are required` }
              });
            }

            return PracticeLogService.insertDays(
              //if (error) return res.status(400).send(error); //const error = getNoteValidationError(newNote);
              req.app.get("db"),
              newDays
            )
              .then(newDays => {
                console.log(newDays);
                logger.info(`days created.`);
                res.status(201).json(newDays.map(serializeDay));
              })
              .catch(error => console.log(error));
          })
          .catch(error => console.log(error));
      })
      .catch(error => console.log(error));
  });

practicelogRouter
  .route("/days")
  //.all(requireAuth)
  .all(bodyParser, (req, res, next) => {
    const { dayId } = req.body;

    console.log(dayId, typeof dayId, parseInt(dayId));
    PracticeLogService.getByDayId(req.app.get("db"), parseInt(dayId))
      .then(day => {
        console.log(day);
        if (!day) {
          logger.error(`day with id ${dayId} not found.`);
          return res.status(404).json({
            error: { message: `day Not Found` }
          });
        }

        res.day = day;
        next();
      })
      .catch(next);
  })
  .get((req, res) => {
    res.json(serializeDay(res.day));
  })

  .patch(bodyParser, (req, res, next) => {
    const { completed, actual_hours, technique, repertoire } = req.body;
    const dayToUpdate = { completed, actual_hours, technique, repertoire };

    const numberOfValues = Object.values(dayToUpdate).filter(Boolean).length;
    if (numberOfValues === 0) {
      logger.error(`Invalid update without required fields`);
      return res.status(400).json({
        error: {
          message: `Request body must content 'completed', 'actual_hours', 'technique', and 'repertoire'`
        }
      });
    }

    PracticeLogService.updateDay(
      req.app.get("db"),
      req.params.dayId,
      dayToUpdate
    )
      .then(numRowsAffected => {
        res.status(204).end();
      })
      .catch(next);
  });

module.exports = practicelogRouter;
