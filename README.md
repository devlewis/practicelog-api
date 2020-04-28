# Practice Log API

### [Practice Log App: Live Site](https://practice-log-app.devreelewis.now.sh/)

##### Summary

This app is for logging hours and basic details for your daily practice. Users may choose goal lengths of 7, 30, or 100 consecutive days of practice, choose a daily number of hours goal, and log/edit their hours and practice notes accordingly.

## Run Practice Log API in a local development environment

### Prerequisites

* You will need these programs installed
  * [Git](https://git-scm.com/)
  * [Node.js](https://nodejs.org/en/)
  * [npm](https://www.npmjs.com/)

### Installation

* Clone this repository:
  * `git clone https://github.com/devlewis/practicelog-api`
* Install dependencies 

### Run Program

* Create local database and user 
* Run `npm run migrate --1`
* Make requests using the root: `localhost:8000` or your specified port

### Test

* Run `npm test`



## API Overview

*** Note: all requests to protected endpoints must contain an Authorization header with a valid JWT string:
    

* e.g. using the Fetch API:

  ```
  fetch(PATH, {
      METHOD,
      headers: {
          'content-type': 'application/json',
          Authorization: `Bearer ${authToken}`
      },
      body: JSON.stringify(BODY)
  }
  ```

### users

* The users endpoint is used to create new users and to obtain user information

* The User model has the following schema:

  ```
  {
      username: { type: String, required: true },
      password: { type: String, required: true },
      date_created: { type: Date, default: new Date() },
  }
  ```

#### GET /api/users/

* Provides the username for a given user id
  * E.g. populate the username of the author of a review (reviews contain reviewer ids, but not usernames)
* The query parameter is simply the requested user id
* Successful response (200) will return the username
* If user id is not found in the database, it will return a 404 response

#### POST /api/users

* Creates a new user

* Valid requests must provide a 'username' and 'password' in the request body

  * Both fields must be strings
  * Neither field may contain leading or trailing whitespace
  * Usernames must be 1-20 characters
  * Passwords must be 8-72 characters

* Invalid requests will result in a 400 response with the following information:

  ```
  {
      code: 400,
      message: errorMessage,
  }
  ```

* Successful responses (201) will return serialized user data

___

### auth

* The auth endpoint is used to obtain or refresh a JWT (authentication token)

#### POST /api/auth/login

* Uses jwt.sign and bcrypt to compare passwords and create token 
* Request body must provide valid username and password stored in psql
* Successful response (200) will contain a JWT (authentication token) with serialized user data in the payload
* Invalid credentials will result in 401 response

#### POST /api/auth/refresh

* verifies userName
* sends new token with jwt.sign

___

### prlog

* The prlog endpoint is used to create, read, and update practice goals and related days

* The goals model has the following schema:

  ```
  {
      user_id: { ref: 'users', required: true },
      num_of_days: { type: INT, required: true },
      total_hours: { type: DECIMAL, required: true },
      hours_goal: { type: DECIMAL, required: true },
  }
  ```

* The days model has the following schema:

  ```
  {
      day_num: { type: INT, required: true },
      day_date: { type: Date, required: true },
      completed: { type: string, default: "false" required: true},
      technique: { type: string, required: false },
      repertoire: { type: string, required: false },
      actual_hours: { type: DECIMAL, default: 0.00, required: true},
      touched: {type: boolean, default: false, required: true},
      goal_id: { ref: 'goals', required: true}
      user_id: { ref: 'users', required: true },
      goal_hours: {type: DECIMAL, required: true}
  ```

  -----------------

  #### POST /api/prlog/goal

* This is a protected endpoint

* Valid requests must provide 'num_of_days', 'total_hours' (set to 0) and 'hours_goal' in the request body

  * 'hours_goal' must be 0-24 hours

* The requesting user_id is obtained via the request object

* A successful response (200), will return a new goal and array of day objects associated with that goal.  

  #### GET /api/prlog/goal

* This is a protected endpoint

* The requesting user_id is obtained via the request object

* If no goal is found, a successful response (200), will return an empty array, prompting the client to push user to setup first goal. 

* A successful response (201) will return the most recent goal associated with requesting user.  

  #### PUT /api/prlog/updategoal

* This is a protected endpoint

* Request body must contain id, user_id obtained from request object, num_of_days, total_hours, and hours_goal. 

* Updates the requested goal 

* A successful response (204) will end the fetch, logging message: `goal with ${goal_id} updated`

  #### GET /api/prlog/allgoals

* This is a protected endpoint

* The requesting user_id is obtained via the request object

* A successful response (201) will return an array of all goal objects containing requesting user's id 

  #### GET /api/prlog/alldays

* This is a protected endpoint

* The requesting user_id is obtained via the request object

* If the user has not created any goals, the invalid request will return (400) with message: `No goalId`

* A successful response (201) will return an array of day objects associated with the user's most recent goal. 

  #### PUT /api/prlog/days

* This is a protected endpoint

* Valid requests must provide {dayToUpdate} in the request body

  * 'dayToUpdate.actual_hours' must be < 24
  * dayToUpdate must contain all required fields

* An invalid request will return (400) with the error message. 

* A successful response (204) will end the fetch, logging message: `day with id ${dayToUpdate.id} updated`



##### Live App Screenshots

![Screen Shot 2020-04-25 at 4.57.52 PM](/Users/Devree/Library/Application Support/typora-user-images/Screen Shot 2020-04-25 at 4.57.52 PM.png)

![Screen Shot 2020-04-25 at 4.59.01 PM](/Users/Devree/Library/Application Support/typora-user-images/Screen Shot 2020-04-25 at 4.59.01 PM.png)![Screen Shot 2020-04-25 at 4.59.35 PM](/Users/Devree/Library/Application Support/typora-user-images/Screen Shot 2020-04-25 at 4.59.35 PM.png)

![Screen Shot 2020-04-25 at 4.59.35 PM](/Users/Devree/Library/Application Support/typora-user-images/Screen Shot 2020-04-25 at 5.03.59 PM.png)

## Technology

### Back End

* [Node](https://nodejs.org/en/) and [Express](https://expressjs.com/)
  * JWT authentication
  * Mocha test framework and Chai assertion library, Supertest 
  * Morgan, helmet 
* PSQL

### Production

* [Heroku](https://www.heroku.com/) Cloud Application Platform

#####  
