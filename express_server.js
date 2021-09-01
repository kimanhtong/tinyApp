////////////////////////////////////////////////////////////
// Settings and Default parameters

// Use Express for web server
const express = require("express");
const app = express();

const PORT = 8080; // default port 8080

// Use EJS for templates
app.set("view engine", "ejs");

// Use body-parser for POST methods
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

// Use cookie to remember user id
const cookieParser = require('cookie-parser');
app.use(cookieParser());

////////////////////////////////////////////////////////////
// Database init

// Use urlDatabase object to record shortURL-longURL pairs
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// Use users object to record all users registerred
const users = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
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
}

// Function to look up an email. Return true if found and false if not found in DB
const emailLookUp = (email) => {
  for (const key in users) {
    if (users[key].email === email) {
      return true; 
    }
  }
  return false;
}

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

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

////////////////////////////////////////////////////////////
// TinyApp -GET requests and responses

// Launch Log In page
app.get("/login", (req, res) => {
  const templateVars = {
    user_id: req.cookies["user_id"]
  }
  res.render("urls_login", templateVars);
});

// Launch Register page
app.get("/register", (req, res) => {
  const templateVars = {
    user_id: req.cookies["user_id"]
  }
  res.render("urls_register", templateVars);
});

// Launch the Index page = home page
app.get("/urls", (req, res) => {
  const templateVars = {
    user_id: req.cookies["user_id"],
    urls: urlDatabase 
  };
  res.render("urls_index", templateVars);
});

// Launch the New page to add a new short-long URL pair.
app.get("/urls/new", (req, res) => {
  const templateVars = {
    user_id: req.cookies["user_id"]
  }
  res.render("urls_new", templateVars);
});

// Launch detail page of a shortURL
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { 
    user_id: req.cookies["user_id"],
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL]
  };
  res.render("urls_show", templateVars);
});

// Launch the website where the shortURL/longURL points
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

////////////////////////////////////////////////////////////
// TinyApp -POST requests and responses

// Log user in
app.post("/login", (req, res) => {
  if (!emailVal(req.body.email) || !passwordVal(req.body.password)) {
    res.statusCode = 400;
    res.end("Email or Password cannot be empty");
  }
  let userIdArr = Object.keys(users);
  for (let key of userIdArr) {
    if (users[key].email === req.body.email && users[key].password === req.body.password) {
      res.cookie("user_id",req.body.email);
      res.redirect("/urls");
    }
  }
  res.statusCode = 403;
  res.end("User cannot be found!");
});

// Log user out
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/login");
});

// Validate user registration info and Register user
app.post("/register", (req, res) => {
  const id = generateRandomString(8);
  const email = req.body.email;
  const password = req.body.password;
  if (!emailVal(email) || !passwordVal(password)) {
    res.statusCode(400);
    res.end("Email or Password cannot be empty");
  }
  if (emailLookUp(email)) {
    res.statusCode  = 400;
    res.end("Duplicate email found. Please log in instead!");
  }
  if (emailVal(email) && passwordVal(password) && !emailLookUp(email)) {
    const newUser = {
      id,
      email,
      password
    };
    users[newUser.id] = newUser;
    res.cookie("user_id", newUser.email);
    res.redirect("/urls");
    console.log(newUser);
  }

  console.log(users);
});

// Add a new route to database
app.post("/urls", (req, res) => {
  console.log(req.body);  // Log the POST request body to the console
  let shortURL = generateRandomString(6);
  urlDatabase[shortURL] = req.body.longURL;
  const templateVars = { 
    user_id: req.cookies["user_id"],
    shortURL,
    longURL: req.body.longURL
  };
  res.render("urls_show", templateVars);
});

// Delete an existing route from database
app.post("/urls/:shortURL/delete", (req, res) => {
  console.log(`Deleted ${req.body.shortURL}`);  // Log the POST request body to the console
  let shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

// Update an existing route from database
app.post("/urls/:shortURL", (req, res) => {
  console.log(`Updated ${req.params.shortURL}`);  // Log the POST request body to the console
  let shortURL = req.params.shortURL;
  urlDatabase[shortURL] = req.body.longURL;;
  res.redirect("/urls");
});



////////////////////////////////////////////////////////////
// TinyApp server keeps listening

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
