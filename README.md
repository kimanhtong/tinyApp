# TinyApp Project

TinyApp is a full stack web application built with Node and Express that allows users to shorten long URLs (à la bit.ly).

## Final Product

!["My URLs screen"](https://github.com/kimanhtong/tinyApp/blob/main/docs/TinyApp_MainPage.png)
!["Login screen"](https://github.com/kimanhtong/tinyApp/blob/main/docs/TinyApp_LogInPage.png)

## Dependencies

- Node
- Express
- bcrypt
- body-parser
- cookie-session
- nodemon

## Getting Started

- Install all dependencies as following:
  - Node: `nvm install node`
  - Express: `npm install express`
  - bcrypt: `npm install -E bcrypt`
  - body-parser: `npm install body-parser`
  - cookie-session: `npm install cookie-session`
  - nodemon: `npm install --save-dev nodemon`

- Run the development web server using the `node express_server.js` or `npm start` command.
- Launch http://localhost:8080/urls website, register an account, and log in.
- Run test for the helper functions by `npm test` command.
