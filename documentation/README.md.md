```markdown
# DigitalMenuBackend Documentation

This is the backend for the **Digital Menu** project. It is a REST API built with **Node.js** and **Express.js**. It uses **MongoDB** as a database and **Mongoose** as an ODM (Object Document Mapper).

## Deployment

### Deployment in Testing
1. Commit code to the `develop` branch.

### Deployment in Production
1. Click on **Pull Request**.
2. Click on **New Pull Request**.
3. Select the **base branch** as `main`.
4. Create the pull request.
5. Add a title for the pull request.
6. Click on **Create Pull Request**.
7. Click on **Merge Pull Request**.

## Installation

### Steps to Set Up the Project Locally

1. Clone the repository:
   ```bash
   git clone <repository_url>
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory and add the following environment variables:
   ```plaintext
   PORT=9000
   MONGO_URI=<your_mongodb_uri>
   JWT_SECRET=<your_jwt_secret>
   ```

4. Install **nodemon** globally:
   ```bash
   sudo npm install -g nodemon
   ```

5. Run the application:
   ```bash
   nodemon server.js
   ```

Alternatively, for development mode, run:
```bash
npm run dev
```

### Setting Up Development Mode
In your `.env` file, include the necessary configurations and use the following command to start the server:
```bash
npm install
sudo npm install -g nodemon
nodemon server.js
```

## Usage

The API runs by default on port `9000`. You can change the port number in the `.env` file by modifying the `PORT` variable.

## Contributing

We welcome pull requests! For major changes, please open an issue first to discuss the proposed changes.

### Contribution Guidelines

To maintain consistency in the codebase, please follow these guidelines:

1. **Naming Conventions:**
   - Use `camelCase` for naming variables, functions, etc.
   - Use `PascalCase` for naming classes.
   - Use `snake_case` for naming files and directories.

2. **Async Functions:**
   - Use the `catchasync` utility function to wrap async functions in the controllers instead of using traditional `try-catch` blocks.

3. **Error Handling:**
   - Use the `appError` class to create new errors in the controllers instead of using the native `Error` class.

4. **Response Handling:**
   - Use the `sendResponse` utility function to send responses from the controllers.
   - Use the `sendError` utility function to send errors from the controllers.
   - Use the `sendErrorDev` utility function to send errors when in development mode.

---

Happy coding and thanks for contributing!
```

This documentation provides clear instructions for setting up, using, and contributing to the **DigitalMenuBackend** project. Feel free to adjust any specifics depending on your project's further requirements.