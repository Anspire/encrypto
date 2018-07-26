var key = null;
const {
  validateKey,
  checkDir
} = require('./dbutil');

const addSecretKeyQuestions = [
  {
    type : 'password',
    name : 'key',
    message : 'Enter secret code ..',
    validate: function(value) {
          if (value.length > 5) {
            key = value;
            return true;
          } else {
            return 'Please enter valid secret code.';
          }
        }
  },
  {
    type : 'password',
    name : 'rs_key',
    message : 'Enter secret code again ..',
    validate: function(value) {
          if (value == key) {
            return true;
          } else {
            return 'Please enter valid password.';
          }
        }
  }
];


const changeSecretKeyQuestions = [
  {
    type : 'password',
    name : 'oldKey',
    message : 'Enter old secret code ..',
    validate: function(value) {
          if (validateKey(value)) {
            return true;
          } else {
            return 'incorrect Secret code.';
          }
        }
  },
  {
    type : 'password',
    name : 'key',
    message : 'Enter new secret code ..',
    validate: function(value) {
          if (value.length > 5) {
            key = value;
            return true;
          } else {
            return 'Please enter valid secret code.';
          }
        }
  },
  {
    type : 'password',
    name : 'rs_key',
    message : 'Enter new secret code again ..',
    validate: function(value) {
          if (value == key) {
            return true;
          } else {
            return 'Please enter valid password.';
          }
        }

  }
];

const addDirQuestions = [
  {
    type : 'password',
    name : 'key',
    message : 'Enter secret code ..',
    validate: function(value) {
          if (validateKey(value)) {
            key = value;
            return true;
          } else {
            return 'incorrect Secret code.';
          }
        }
  },
  {
    type : 'input',
    name : 'dirpath',
    message : 'Enter dir path ..',
    validate: function(value) {
          if (checkDir(key, value) != true) {
            return true;
          } else {
            return 'Dir name already in db.';
          }
        }
  }
];

const delDirQuestions = [
  {
    type : 'password',
    name : 'key',
    message : 'Enter secret code ..',
    validate: function(value) {
          if (validateKey(value)) {
            key = value;
            return true;
          } else {
            return 'incorrect Secret code.';
          }
        }
  },
  {
    type : 'input',
    name : 'dirpath',
    message : 'Enter dir path ..',
    validate: function(value) {
          if (checkDir(value, key)) {
            return true;
          } else {
            return 'Please enter valid dir path.';
          }
        }
  }
];


const getAllDirQuestions = [
  {
    type : 'password',
    name : 'key',
    message : 'Enter secret code ..',
    validate: function(value) {
          if (validateKey(value)) {
            return true;
          } else {
            return 'incorrect Secret code.';
          }
        }
  }
];

module.exports = {  addSecretKeyQuestions, changeSecretKeyQuestions, addDirQuestions, getAllDirQuestions, delDirQuestions };
