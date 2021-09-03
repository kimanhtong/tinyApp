// Settings and Default parameters

// Use Express for web server
const express = require('express');
const app = express();

const PORT = 8080; // default port 8080

// Use EJS for templates
app.set('view engine', 'ejs');

// Use body-parser for POST methods
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));

// Use cookie-session to keep user id on browsers during an active session
let cookieSession = require('cookie-session')
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2'],
  maxAge: 24 * 60 * 60 * 1000 // 24 hours 
}))

// Use bcrypt to store passwords
const bcrypt = require('bcrypt');

// Add helper functions
const { generateRandomString,
        emailVal,
        passwordVal,
        getUserByEmail,
        urlByUser,
        urlAuthorized,
        urlSave,
      } = require('./helpers');

////////////////////////////////////////////////////////////
// Database init

// Use urlDatabase object to record shortURL-longURL pairs
const urlDatabase = {
  b2xVn2: { longURL: 'http://www.lighthouselabs.ca', userID: 'userRandomID' },
  '9sm5xK': { longURL: 'http://www.google.com', userID: '5LeSwOVY' },
  c93ms8: { longURL: 'http://www.test.com', userID: 'oxbD60ax' },
  ad83UD: { longURL: 'http://www.youtube.com', userID: 't3FIWqOZ' },
  '3343sd': { longURL: 'http://www.microsoft.com', userID: '5LeSwOVY' },
  b6UTxQ: { longURL: 'https://www.tsn.ca', userID: '5LeSwOVY' }
};

// Use users object to record all users registerred
const users = {
  'userRandomID': { id: 'userRandomID', email: 'user@example.com', password: bcrypt.hashSync('purple-monkey-dinosaur', 10)},
  'user2RandomID': { id: 'user2RandomID', email: 'user2@example.com', password: bcrypt.hashSync('dishwasher-funk', 10)},
  '5LeSwOVY': { id: '5LeSwOVY', email: 'a@b.c', password: bcrypt.hashSync('test', 10) },
  'oxbD60ax': { id: 'oxbD60ax', email: 'test@test.com', password: bcrypt.hashSync('test', 10) },
  't3FIWqOZ': { id: 't3FIWqOZ', email: 'c@d.e', password: bcrypt.hashSync('test', 10) }
}

////////////////////////////////////////////////////////////
// For testing or practice purposes - to be updated

app.get('/', (req, res) => {
  res.send('Hello!');
});

app.get('/hello', (req, res) => {
  res.send('<html><body>Hello <b>World</b></body></html>\n');
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

////////////////////////////////////////////////////////////
// TinyApp -GET requests and responses

// Launch Log In page
app.get('/login', (req, res) => {
  let email = req.session.user_id;
  if (email) {
    res.redirect('/urls');
  } else {
    const templateVars = {
      user_id: req.session.user_id
    }
    res.render('urls_login', templateVars);
  }
});

// Launch Register page
app.get('/register', (req, res) => {
  if (req.session.user_id) {
    res.redirect('/urls');
  } else {
    const templateVars = {
      user_id: req.session.user_id
    }
    res.render('urls_register', templateVars);
  }
});

// Launch the Index page = home page
app.get('/urls', (req, res) => {
  const email = req.session.user_id;
  if (email) {
    const templateVars = {
      user_id: email,
      urls: urlByUser(email, users, urlDatabase)
    };
    res.render('urls_index', templateVars);
  } else {
    res.redirect('/login');
  }
});

// Launch the New page to add a new short-long URL pair.
app.get('/urls/new', (req, res) => {
  if (req.session.user_id) {
    const templateVars = {
      user_id: req.session.user_id
    }
    res.render('urls_new', templateVars);
  } else { 
    res.redirect('/login');
  }
});

// Launch detail page of a shortURL
app.get('/urls/:shortURL', (req, res) => {
  if (req.session.user_id) {
    let email = req.session.user_id; // get the user email
    let shortURL = req.params.shortURL; // get the shortURL which user requests
    if(urlAuthorized(email, shortURL, users, urlDatabase)) {
      const urls = urlByUser(email, users, urlDatabase);
      const templateVars = { 
        user_id: email,
        shortURL, 
        longURL: urls[shortURL]
      };
      res.render('urls_show', templateVars);
    } else {                // User doesn't have the right to view the requested URL
      res.statusCode = 401; // Unauthorized
      res.end('You cannot view this detail');
    }
  } else {
    res.redirect('/login');   // user has to log on before viewing details
  }
});

// Launch the website where the shortURL/longURL points
app.get('/u/:shortURL', (req, res) => {
  if (req.session.user_id) {
    let email = req.session.user_id; // get the user email
    let shortURL = req.params.shortURL; // get the shortURL which user requests
    if(urlAuthorized(email, shortURL, users, urlDatabase)) {
      const urls = urlByUser(email, users, urlDatabase);
      const longURL = urls[shortURL];
      res.redirect(longURL);
    } else {                                      // User cannot use the short URL
      res.statusCode = 401; // Unauthorized
      res.end('You cannot use this shortlink');
    }
  } else {
    res.redirect('/login');   // user has to log on before viewing details
  }
});

////////////////////////////////////////////////////////////
// TinyApp -POST requests and responses

// Log user in
app.post('/login', (req, res) => {
  if (!emailVal(req.body.email) || !passwordVal(req.body.password)) {
    res.status(400).send('Email or Password cannot be empty');
  }
  let userIdArr = Object.keys(users);
  for (let key of userIdArr) {
    let hashedPassword = users[key].password;
    if (users[key].email === req.body.email && bcrypt.compareSync(req.body.password, hashedPassword)) {
      req.session.user_id = req.body.email
      res.redirect('/urls');
    }
  }
  res.statusCode = 403; // Forbidden
  res.end('User cannot be found!');
});

// Log user out
app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/login');
});

// Validate user registration info and Register user
app.post('/register', (req, res) => {
  const id = generateRandomString(8);
  const email = req.body.email;
  const password = req.body.password;
  if (!emailVal(email) || !passwordVal(password)) {
    res.statusCode = 400;
    res.end('Email or Password cannot be empty'); // Bad request
    //res.end('Email or Password cannot be empty');
  }
  if (getUserByEmail(email, users)) {
    res.statusCode  = 400; // Bad request
    res.end('You are already registered. Just log in!');
  }
  const hashedPassword = bcrypt.hashSync(password, 10);
  const newUser = { id, email, password: hashedPassword };
  users[newUser.id] = newUser;
  console.log(newUser);
  req.session.user_id = newUser.email
  res.redirect('/urls');
});

// Add a new route to database
app.post('/urls', (req, res) => {
  const longURL = req.body.longURL;
  if (longURL === '') { // longURL cannot be blank
    res.statusCode = 412 // Precondition failed
    res.end('URL cannot be blank. Please fill in a valid URL');
  } // valid URL found
  const shortURL = generateRandomString(6);
  const email = req.session.user_id;
  if (urlSave (email, shortURL, longURL, users, urlDatabase)) { // the route is saved successfully
    const templateVars = { user_id: email, shortURL,longURL };
    res.render('urls_show', templateVars);
  } else {           // the route already existed
    res.statusCode = 412;  // Precondition failed
    res.end ('The URL already exists. Please review it!');
  }
});

// Delete an existing route from database
app.post('/urls/:shortURL/delete', (req, res) => {
  if (req.session.user_id) {  // Check if user is logged in
    let shortURL = req.params.shortURL;
    let email = req.session.user_id;
    if (urlAuthorized(email, shortURL, users, urlDatabase)) {
      delete urlDatabase[shortURL];
      console.log(`Deleted ${req.body.shortURL}`);  // Log the POST request body to the console 
      res.redirect('/urls');
    }                       // User doesn't have the right to delete the shortURL
    res.statusCode = 401;  // Unauthorized
    res.end('You cannot delete this route!');
  } // No cookie found
  res.redirect('/login');
});

// Update an existing route from database
app.post('/urls/:shortURL', (req, res) => {
  if (req.session.user_id) {  // If user is logged in
    const shortURL = req.params.shortURL;
    const email = req.session.user_id;
    if (urlAuthorized(email, shortURL, users, urlDatabase)) { // If user has the access right
      const longURL = req.body.longURL;
      if (longURL === '') { // If longURL is blank
        res.statusCode = 412 // Precondition failed
        res.end('Please fill in a valid URL');
      }  // If longURL is not blank
      let urls = urlByUser(email, users, urlDatabase);
      if (urlSave(email, shortURL, longURL, users, urlDatabase)) {  // If saved successfully
        console.log(`Updated ${req.params.shortURL}`);  // Log the POST request body to the console
        res.redirect('/urls');
      } // User doesn't have the right to update the shortURL
      res.statusCode = 412 // Precondition failed
      res.end(`The link ${longURL} already existed. No update is done!`);
    } // User doesn't have the right to update the shortURL
    res.statusCode = 401 // Unauthorized
    res.end('You cannot update this URL');
  } // If user is not logged in yet
  res.redirect('/login');
});
////////////////////////////////////////////////////////////
// TinyApp server keeps listening

app.listen (PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});