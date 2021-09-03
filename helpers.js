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

// Function to validate empty email
const emailVal = (email) => { return email !=='' && email !== null};

// Function to validate empty password
const passwordVal = (password) => { return password !=='' && password != null};

// Function to look up user by email
const getUserByEmail = (email, users) => {
  if (!emailVal(email)) return false;
  for (const key in users) {
    const user = users[key];
    if (user.email === email) return user; 
  }
  return false;
};

// Function to filter shortURL-longURL pairs by user
const urlByUser = (email, users, urlDatabase) => {
  const user = getUserByEmail(email, users);
  let urls = {};
  if (!user) return urls;
  for (const key in urlDatabase) {
    if (urlDatabase[key].userID === user.id) {
      urls[key] = urlDatabase[key].longURL; }
  }
  console.log(urls);
  return urls;
};

// Function to validate user access right to a URL in urlDatabase
const urlAuthorized = (email, shortURL, users, urlDatabase) => {
  const user = getUserByEmail(email, users);
  if (!user) return false;
  const urls = urlByUser(email, users, urlDatabase); // get the short-long URL pairs which user can access
  if (Object.keys(urls).indexOf(shortURL) > -1) return true; // User has the right to access the URL
  return false;
}

// Function to save shortURL-longURL pairs by user email
const urlSave = (email, shortURL, longURL, users, urlDatabase) => {
  const user = getUserByEmail(email, users);
  if (!user) return false;
  const urls = urlByUser(email, users, urlDatabase);
  for (const key in urls) {
    if (urls[key] === longURL) return false; } // the long URL already exists
  urlDatabase[shortURL] = { longURL, userID: user.id };
  return true;
};
module.exports = {  generateRandomString,
                    emailVal,
                    passwordVal,
                    getUserByEmail,
                    urlByUser,
                    urlAuthorized,
                    urlSave,
                  };