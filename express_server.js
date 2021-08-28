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

// Use cookie to remember username
const cookieParser = require('cookie-parser');
app.use(cookieParser());

// Use urlDatabase object to record shortURL-longURL pairs
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

////////////////////////////////////////////////////////////
// Declarations of functions

// Function to get a random shortURL string
function generateRandomString(length) {
  let characters = 'abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let string = '';
  for (let i = 0; i < length; i++) {
    let charIndex = Math.floor(62*Math.random());
    string = string + characters[charIndex];
  }
  return string;
}
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

// Launch the New page to add a new short-long URL pair.
app.get("/urls/new", (req, res) => {
  const templateVars = {
    username: req.cookies["username"]
  }
  res.render("urls_new", templateVars);
  //res.render("urls_new");

});

// Launch the Index page = home page
app.get("/urls", (req, res) => {
  const templateVars = {
    username: req.cookies["username"],
    urls: urlDatabase 
  };
  res.render("urls_index", templateVars);
});

// Launch detail page of a shortURL
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { 
    username: req.cookies["username"],
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL]
  };
  res.render("urls_show", templateVars);
});

// Launch the long URL website where the shortURL points
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

////////////////////////////////////////////////////////////
// TinyApp -POST requests and responses

// Add a new route to database
app.post("/urls", (req, res) => {
  console.log(req.body);  // Log the POST request body to the console
  let shortURL = generateRandomString(6);
  urlDatabase[shortURL] = req.body.longURL;
  const templateVars = { 
    username: req.cookies["username"],
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
  /* const templateVars = { 
    username: req.cookies["username"],
  };
  res.redirect("/urls", templateVars);
  */
});

// Log user in
app.post("/urls/login", (req, res) => {
  res.cookie("username",req.body.username);
  //res.send ("Server Error");
  res.redirect("/urls");
});

// Log user out
app.post("/urls/logout", (req, res) => {
  //res.cookie("username", "")
  res.clearCookie("username");
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
