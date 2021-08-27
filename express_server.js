////////////////////////////////////////////////////////////
// Settings and Default parameters

const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};
////////////////////////////////////////////////////////////
// Declarations of functions

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

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});
  
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]};
  res.render("urls_show", templateVars);
});

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
  const templateVars = { shortURL, longURL: req.body.longURL};
  res.render("urls_show", templateVars);
});

// Delete an existing route from database
app.post("/urls/:shortURL/delete", (req, res) => {
  console.log(`Deleted ${req.body.shortURL}`);  // Log the POST request body to the console
  let shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

////////////////////////////////////////////////////////////
// TinyApp end

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
            