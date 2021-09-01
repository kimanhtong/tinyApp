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

// Use cookie to remember user id
const cookieParser = require('cookie-parser');
app.use(cookieParser());

////////////////////////////////////////////////////////////
// Database init

// Use urlDatabase object to record shortURL-longURL pairs
const urlDatabase = {
  b2xVn2: { longURL: 'http://www.lighthouselabs.ca', userID: 'userRandomID' },
  '9sm5xK': { longURL: 'http://www.google.com', userID: 'userRandomID' },
  c93ms8: { longURL: 'http://www.test.com', userID: 'userRandomID' },
  ad83UD: { longURL: 'http://www.youtube.com', userID: 'userRandomID' },
  '3343sd': { longURL: 'http://www.microsoft.com', userID: 'userRandomID' },
  b6UTxQ: { longURL: 'https://www.tsn.ca', userID: 'user2RandomID' }
};

// Use users object to record all users registerred
const users = {
  'userRandomID': { id: 'userRandomID', email: 'user@example.com', password: 'purple-monkey-dinosaur' },
  'user2RandomID': { id: 'user2RandomID', email: 'user2@example.com', password: 'dishwasher-funk' },
  '5LeSwOVY': { id: '5LeSwOVY', email: 'a@b.c', password: 'test' },
  'oxbD60ax': { id: 'oxbD60ax', email: 'test@test.com', password: 'test' },
  't3FIWqOZ': { id: 't3FIWqOZ', email: 'c@d.e', password: 'test' }
}

////////////////////////////////////////////////////////////
// Declarations of functions

// Function to get a random shortURL string
const generateRandomString = (length) => {
  let characters = 'abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let string = '';
  for (let i = 0; i < length; i++) {
    let charIndex = Math.floor(62*Math.random());
    string = string + characters[charIndex];
  }
  return string;
};

// Function to read data from urlDatabase filtered by email
const urlsForUser = (email) => {
  let userID = '';
  let userDB = {};
  for (const key in users) {
    if (users[key].email === email) {
      userID = users[key].id;
      break;
    }
  }
  if (userID !== '') {
    for (const key in urlDatabase) {
      if (urlDatabase[key].userID === userID) {
        userDB[key] = urlDatabase[key].longURL;
      }
    }
  }
  console.log(userDB);
  return userDB;
};

// Function to write to urlDatabase based on email
const urlSave = (email, shortURL, longURL) => {
  let userID = '';
  for (const key in users) {
    if (users[key].email === email) {
      userID = users[key].id;
      break;
    }
  }
  if (userID !== '') {
    let currentURLs = urlsForUser(email);
    for (const key in currentURLs) {
      if (currentURLs[key] === longURL) {
        return false;
      }
    }
    urlDatabase[shortURL] = {
      longURL,
      userID
    };
    return true;
  }
  return false;
};

// Function to look up an email. Return true if found and false if not found in DB
const emailLookUp = (email) => {
  for (const key in users) {
    if (users[key].email === email) {
      return true; 
    }
  }
  return false;
};

// Function to validate empty email
const emailVal = (email) => {
  if (email ==='') {
    return false;
  } else {
    return true;
  }
};

// Function to validate empty password
const passwordVal = (password) => {
  if (password ==='') {
    return false;
  } else {
    return true;
  }
};
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
  const templateVars = {
    user_id: req.cookies['user_id']
  }
  res.render('urls_login', templateVars);
});

// Launch Register page
app.get('/register', (req, res) => {
  const templateVars = {
    user_id: req.cookies['user_id']
  }
  res.render('urls_register', templateVars);
});

// Launch the Index page = home page
app.get('/urls', (req, res) => {
  const user_id = req.cookies['user_id'];
  const templateVars = {
    user_id,
    urls: urlsForUser(user_id)
  };
  res.render('urls_index', templateVars);
});

// Launch the New page to add a new short-long URL pair.
app.get('/urls/new', (req, res) => {
  if (req.cookies['user_id']) {
    const templateVars = {
      user_id: req.cookies['user_id']
    }
    res.render('urls_new', templateVars);
  } else {
    res.redirect('/login');
  }
});

// Launch detail page of a shortURL
app.get('/urls/:shortURL', (req, res) => {
  if (req.cookies['user_id']) {
    let user_id = req.cookies['user_id']; // get the user email
    let urls = urlsForUser(user_id); // get the short-long URL pairs which user can access
    let shortURL = req.params.shortURL; // get the shortURL which user requests
    if (urls !== {} && Object.keys(urls).indexOf(shortURL) > -1) {
      const templateVars = { 
        user_id,
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
  if (req.cookies['user_id']) {
    let shortURL = req.params.shortURL; // get the shortURL which user requests
    let email = req.cookies['user_id']; // get the user email
    let urls = urlsForUser(email); // get the short-long URL pairs which user can access
    if (urls !== {} && Object.keys(urls).indexOf(shortURL) > -1) { // user can use the short URL
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
    res.statusCode = 400; // Bad Request
    res.end('Email or Password cannot be empty');
  }
  let userIdArr = Object.keys(users);
  for (let key of userIdArr) {
    if (users[key].email === req.body.email && users[key].password === req.body.password) {
      res.cookie('user_id',req.body.email);
      res.redirect('/urls');
    }
  }
  res.statusCode = 403; // Forbidden
  res.end('User cannot be found!');
});

// Log user out
app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/login');
});

// Validate user registration info and Register user
app.post('/register', (req, res) => {
  const id = generateRandomString(8);
  const email = req.body.email;
  const password = req.body.password;
  if (!emailVal(email) || !passwordVal(password)) {
    res.statusCode(400); // Bad request
    res.end('Email or Password cannot be empty');
  }
  if (emailLookUp(email)) {
    res.statusCode  = 400; // Bad request
    res.end('Duplicate email found. Please log in instead!');
  }
  if (emailVal(email) && passwordVal(password) && !emailLookUp(email)) {
    const newUser = {
      id,
      email,
      password
    };
    users[newUser.id] = newUser;
    res.cookie('user_id', newUser.email);
    res.redirect('/urls');
    console.log(newUser);
  }

  console.log(users);
});

// Add a new route to database
app.post('/urls', (req, res) => {
  const longURL = req.body.longURL;
  if (longURL === '') { // longURL cannot be blank
    res.statusCode = 412 // Precondition failed
    res.end('Please fill in a valid URL');
  } else {
    const shortURL = generateRandomString(6);
    const email = req.cookies['user_id'];
    if (urlSave(email, shortURL, longURL)) { // the route is saved successfully
      const templateVars = { 
        user_id: email,
        shortURL,
        longURL
      };
      console.log(`Added ${req.body}`);  // Log the POST request body to the console
      res.render('urls_show', templateVars);
    } else {                 // the route already existed
      res.statusCode = 412;  // Precondition failed
      res.end ('The URL already exists. Please review it!');
    }
  }
});

// Delete an existing route from database
app.post('/urls/:shortURL/delete', (req, res) => {
  if (req.cookies['user_id']) {  // Check if user is logged in
    let shortURL = req.params.shortURL;
    let email = req.cookies['user_id'];
    let urls = urlsForUser(email);  // Get the list of URL's user can delete
    if (Object.keys(urls).indexOf(shortURL) > -1) {  // User has the right to delete the shortURL
      delete urlDatabase[shortURL];
      console.log(`Deleted ${req.body.shortURL}`);  // Log the POST request body to the console 
      res.redirect('/urls');
    } else {                      // User doesn't have the right to delete the shortURL
      res.statusCode = 401;  // Unauthorized
      res.end('You cannot delete this route!')
    }
  } else {
    res.redirect('/login');
  }
});

// Update an existing route from database
app.post('/urls/:shortURL', (req, res) => {
  let shortURL = req.params.shortURL;
  let longURL = req.body.longURL;
  if (longURL === '') { // longURL cannot be blank
    res.statusCode = 412 // Precondition failed
    res.end('Please fill in a valid URL');
  } else {
    let email = req.cookies['user_id'];
    let urls = urlsForUser(email);
    if (Object.keys(urls).indexOf(shortURL) > -1) { // User has the right to update the shortURL
      urlDatabase[shortURL].longURL = longURL;
      console.log(`Updated ${req.params.shortURL}`);  // Log the POST request body to the console
      res.redirect('/urls');
    } else {      // User doesn't have the right to update the shortURL
      res.statusCode = 412 // Precondition failed
      res.end(' ');
    }
  }
});



////////////////////////////////////////////////////////////
// TinyApp server keeps listening

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
