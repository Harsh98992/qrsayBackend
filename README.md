# DigitalMenuBackend

This is the backend for the Digital Menu project. It is a REST API built with Node.js and Express.js. It uses MongoDB as a database and Mongoose as an ODM.

## Installation



1. Clone the repository
2. Run `npm install` to install the dependencies
3. Create a `.env` file in the root directory and add the following environment variables:
4. Run `sudo npm install -g nodemon` to install nodemon globally


```
PORT=9000
MONGO_URI=<your_mongodb_uri>
JWT_SECRET=<your_jwt_secret>
```

4. Run `nodemon server.js` to start the server

## Usage

The api is at port 9000 by default. You can change it in the `.env` file.

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

### Important things to keep in mind while contributing

1. Use camelCase for naming variables, functions, etc.
2. Use PascalCase for naming classes.
3. Use snake_case for naming files and directories.
4. use the catchasync utility function to wrap async functions in the controllers instead of using try-catch blocks.
5. use the appError class to create new errors in the controllers instead of using the Error class.
6. use the sendResponse utility function to send responses from the controllers.
7. use the sendError utility function to send errors from the controllers.
8. use the sendErrorDev utility function to send errors in development mode.
