#!/usr/bin/env node

const program = require('commander');
const { prompt } = require('inquirer');
var clear = require('clear');
var figlet = require('figlet');
var crypto = require('crypto');

clear();
console.log(figlet.textSync('encrypto', { horizontalLayout: 'full' }));
const { 
  addSecretKey,
  changeSecretKey,
  addDir,
  showDirs,
  delDir,
  decrypt,
  encrypt,
  showEncryptedFiles
} = require('./utils/dbutil');

const { 
  addSecretKeyQuestions,
  changeSecretKeyQuestions,
  getAllDirQuestions,
  addDirQuestions,
  delDirQuestions
} = require('./utils/question');

program
  .version('0.0.1')
  .description('File encryption system')

program
  .command('encrypt')
  .alias('encr')
  .description('Encrypt all files')
  .action(() => {
    prompt(getAllDirQuestions).then((answers) =>
      encrypt(answers));
  });

program
  .command('decrypt')
  .alias('dec')
  .description('decrypt all files')
  .action(() => {
    prompt(getAllDirQuestions).then((answers) =>
      decrypt(answers));
  });

program
  .command('addSecretKey')
  .alias('ask')
  .description('Add secret key')
  .action(() => {
    prompt(addSecretKeyQuestions).then((answers) =>
      addSecretKey(answers));
  });


program
  .command('changeSecretKey')
  .alias('a')
  .description('Change secret key')
  .action(() => {
    prompt(changeSecretKeyQuestions).then((answers) =>
      changeSecretKey(answers));
  });

program
  .command('addDir')
  .alias('ad')
  .description('Add dir')
  .action(() => {
    prompt(addDirQuestions).then((answers) =>
      addDir(answers));
  });

program
  .command('delDir')
  .alias('dd')
  .description('Remove dir')
  .action(() => {
    prompt(delDirQuestions).then((answers) =>
      delDir(answers));
  });
program
  .command('showDirs')
  .alias('sd')
  .description('Show all dir')
  .action(() => {
    prompt(getAllDirQuestions).then((answers) =>
      showDirs(answers));
  });
  
program
  .command('displayEncryptedFiles')
  .alias('def')
  .description('Show all encrypted files')
  .action(() => {
    prompt(getAllDirQuestions).then((answers) =>
      showEncryptedFiles(answers));
  });


// Assert that a VALID command is provided 
if (!process.argv.slice(2).length || !/[arudl]/.test(process.argv.slice(2))) {
  program.outputHelp();
  process.exit();
}

program.parse(process.argv)
