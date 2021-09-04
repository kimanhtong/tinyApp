const { assert } = require('chai');
const bcrypt = require('bcrypt');

const {
  generateRandomString,
  emailVal,
  passwordVal,
  getUserByEmail,
  urlsForUser,
  urlAuthorized,
  urlSave
} = require('../helpers.js');

const testUsers = {
  userRandomID: { id: 'userRandomID', email: 'user@example.com', password: bcrypt.hashSync('purple-monkey-dinosaur', 10) },
  user2RandomID: { id: 'user2RandomID', email: 'user2@example.com', password: bcrypt.hashSync('dishwasher-funk', 10) },
  '5LeSwOVY': { id: '5LeSwOVY', email: 'a@b.c', password: bcrypt.hashSync('test', 10) },
  oxbD60ax: { id: 'oxbD60ax', email: 'test@test.com', password: bcrypt.hashSync('test', 10) },
  t3FIWqOZ: { id: 't3FIWqOZ', email: 'c@d.e', password: bcrypt.hashSync('test', 10) }
}
const testURLDatabase = {
  b2xVn2: { longURL: 'http://www.lighthouselabs.ca', userID: 'userRandomID' },
  '9sm5xK': { longURL: 'http://www.google.com', userID: '5LeSwOVY' },
  c93ms8: { longURL: 'http://www.test.com', userID: 'oxbD60ax' },
  ad83UD: { longURL: 'http://www.youtube.com', userID: 't3FIWqOZ' },
  '3343sd': { longURL: 'http://www.microsoft.com', userID: '5LeSwOVY' },
  b6UTxQ: { longURL: 'https://www.tsn.ca', userID: '5LeSwOVY' }
};

describe('generateRandomString', () => {
  it('should generate a random string of 6 characters', () => {
    const testString = generateRandomString(6);
    const expected = testString.length === 6 && typeof (testString) === 'string';
    assert.equal(expected, true);
  });

  it('should generate a random string of 8 characters', () => {
    const testString = generateRandomString(8);
    const expected = testString.length === 8 && typeof (testString) === 'string';
    assert.equal(expected, true);
  });

  it('should not generate duplicate shorlURL of 6 characters during 1000 runs', () => {
    const randomString = [];
    let duplicated = false;
    for (let i = 0; i < 1000; i++) {
      const testString = generateRandomString(6);
      if (randomString.indexOf(testString) === -1) {
        randomString.push(testString);
      } else {
        duplicated = true;
        break;
      }
    }
    assert.notEqual(duplicated, true);
  });

  it('should not generate duplicate user id of 8 characters during 1000 runs', () => {
    const randomString = [];
    let duplicated = false;
    for (let i = 0; i < 1000; i++) {
      const testString = generateRandomString(8);
      if (randomString.indexOf(testString) === -1) {
        randomString.push(testString);
      } else {
        duplicated = true;
        break;
      }
    }
    assert.notEqual(duplicated, true);
  });
})

describe('emailVal', () => {
  it('should return true for not-empty email', function () {
    const user = emailVal('a@break.c');
    assert.equal(user, true);
  });

  it('should return false for empty email', function () {
    const user = emailVal('');
    assert.equal(user, false);
  });

  it('should return false for null email', function () {
    const user = emailVal(null);
    assert.equal(user, false);
  });

  it('should return false for undefined email', function () {
    const user = emailVal(undefined);
    assert.equal(user, false);
  });
})

describe('passwordVal', () => {
  it('should return true for not-empty password', function () {
    const user = passwordVal('Hh8!#@#');
    assert.equal(user, true);
  });

  it('should return false for empty password', function () {
    const user = passwordVal('');
    assert.equal(user, false);
  });

  it('should return false for null password', function () {
    const user = passwordVal(null);
    assert.equal(user, false);
  });

  it('should return false for undefined password', function () {
    const user = passwordVal(undefined);
    assert.equal(user, false);
  });
})

describe('getUserByEmail', function () {
  it('should return the user with the specified email', function () {
    const user = getUserByEmail('user@example.com', testUsers);
    const expectedOutput = testUsers.userRandomID;
    assert.equal(user, expectedOutput);
  });

  it('should return false if no user has the specified email', function () {
    const user = getUserByEmail('user9@example.com', testUsers);
    assert.equal(user, false);
  });

  it('should return false for empty email', function () {
    const user = getUserByEmail('', testUsers);
    assert.equal(user, false);
  });

  it('should return false for null email', function () {
    const user = getUserByEmail(null, testUsers);
    assert.equal(user, false);
  });

  it('should return false for undefined email', function () {
    const user = getUserByEmail(undefined, testUsers);
    assert.equal(user, false);
  });
});

describe('urlsForUser', function () {
  it('should return a list of accessible short-longURL pairs to a specified email', function () {
    const actual = urlsForUser('a@b.c', testUsers, testURLDatabase);
    const expectedOutput = {
      '9sm5xK': 'http://www.google.com',
      '3343sd': 'http://www.microsoft.com',
      b6UTxQ: 'https://www.tsn.ca'
    }
    assert.deepEqual(actual, expectedOutput);
  });

  it('should return an empty list if user value is falsy', function () {
    const actual = urlsForUser(false, testUsers, testURLDatabase);
    assert.deepEqual(actual, {});
  });

  it('should return an empty list for non-existent user', function () {
    const actual = urlsForUser('a@b.d', testUsers, testURLDatabase);
    assert.deepEqual(actual, {});
  });
});

describe('urlAuthorized', function () {
  it('should recognize that user is allowed to access his/ her shortURL', function () {
    const authorized = urlAuthorized('user@example.com', 'b2xVn2', testUsers, testURLDatabase);
    assert.equal(authorized, true);
  });

  it('should recognize that user is NOT allowed to access a shortURL', function () {
    const authorized = urlAuthorized('a@b.c', 'b2xVn2', testUsers, testURLDatabase);
    assert.notEqual(authorized, true);
  });

  it('should recognize a falsy user value', function () {
    const authorized = urlAuthorized(false, 'b2xVn2', testUsers, testURLDatabase);
    assert.notEqual(authorized, true);
  });
});

describe('urlSave', function () {
  it('should save a valid URL successfully', function () {
    const saveStatus = urlSave('user@example.com', 'test2', 'http://www.yahoo.com', testUsers, testURLDatabase);
    assert.equal(saveStatus, true);
  });

  it('should not save a duplicate URL', function () {
    const saveStatus = urlSave('user@example.com', 'test3', 'http://www.lighthouselabs.ca', testUsers, testURLDatabase);
    assert.notEqual(saveStatus, true);
  });

  it('should not save for a falsy user', function () {
    const saveStatus = urlSave(false, 'test3', 'http://www.lighthouselabs.ca', testUsers, testURLDatabase);
    assert.notEqual(saveStatus, true);
  });
});
