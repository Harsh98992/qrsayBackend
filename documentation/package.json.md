# DigitalMenuBackend Documentation

## Overview

**Project Name:** DigitalMenuBackend  
**Version:** 1.0.0  
**Description:** A backend application for managing digital menus.  

## Table of Contents

- [Getting Started](#getting-started)
- [Installation](#installation)
- [Dependencies](#dependencies)
- [Scripts](#scripts)
- [Engines](#engines)
- [Repository](#repository)
- [Bugs and Issues](#bugs-and-issues)
- [License](#license)

## Getting Started

To get started with the DigitalMenuBackend project, you will need to have Node.js installed on your machine. The application is designed to be run with Node.js version 14.20.1 or higher.

## Installation

You can clone the repository and install the necessary dependencies using the following commands:

```bash
git clone https://github.com/RahulSharma19021996/DigitalMenuBackend.git
cd DigitalMenuBackend
npm install
```

## Dependencies

The project uses several dependencies to function properly. Below is the list of dependencies:

- `@hapi/joi`: Data validation
- `apicache`: Middleware for caching API responses
- `aws-sdk`: AWS SDK for JavaScript
- `axios`: Promise-based HTTP client
- `bcryptjs`: Password hashing library
- `body-parser`: Middleware to parse request bodies
- `cloudinary`: Uploading and managing images
- `cors`: Middleware for enabling CORS
- `crypto`: For cryptographic functions
- `date-fns`: Date utility functions
- `dotenv`: Environment variable management
- `easyinvoice`: Creation of invoices
- `escpos`: Node.js library for ESC/POS printers
- `express`: Web framework for Node.js
- `joi`: Object schema description language and validator for JavaScript objects
- `jsonwebtoken`: Implementation of JSON Web Tokens
- `lodash`: Utility library for JavaScript
- `mongoose`: MongoDB object modeling
- `ngrok`: Secure introspectable tunnels to localhost
- `node-cron`: Job scheduler for Node.js
- `nodemailer`: Email sending library
- `otp-generator`: One Time Password generation
- `passport`: Authentication middleware for Node.js
- `passport-jwt`: Passport strategy for authenticating with JWT
- `paytmchecksum`: Paytm checksum utility
- `pdfjs-dist`: PDF parsing and rendering
- `razorpay`: Payment gateway
- `request_trimmer`: Middleware to trim requests
- `sharp`: Image processing library
- `socket.io`: Real-time communication library
- `usb`: USB library for Node.js
- `validator`: String validation and sanitization library

### Dev Dependencies

The following dev dependency is used:

- `nodemon`: Utility that monitors for changes in your source and automatically restarts your server.

## Scripts

The following scripts are defined in the `package.json` file:

- `test`: Runs the test command (currently does not specify any tests).
  
  ```bash
  npm test
  ```

- `start`: Starts the server using `nodemon`.

  ```bash
  npm start
  ```

## Engines

The application requires Node.js version 14.20.1 or higher.

```json
"engines": {
  "node": ">=14.20.1"
}
```

## Repository

The source code for DigitalMenuBackend is hosted on GitHub:

- **Repository Type:** Git
- **Repository URL:** [DigitalMenuBackend Repository](https://github.com/RahulSharma19021996/DigitalMenuBackend.git)

## Bugs and Issues

If you encounter any bugs or issues, please report them on the GitHub issues page:

- **Bugs URL:** [Report an Issue](https://github.com/RahulSharma19021996/DigitalMenuBackend/issues)

## License

This project is licensed under the ISC License. See the [LICENSE](LICENSE) file for details.