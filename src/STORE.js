function makeDays(num_of_days, actual_hours) {
  let newDays = new Array(num_of_days);
  for (let i = 0; i < num_of_days; i++) {
    newDays[i] = {
      date:
        i === 0 ? new Date() : new Date(newDays[i].getTime() + 86400000 * i),
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

module.exports = makeDays();
