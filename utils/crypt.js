const crypto = require('crypto');
const JsonDB = require('node-json-db');
const fs = require('fs');
var async = require('async');
const dbe = new JsonDB("encrypted", true, true);
const dbd = new JsonDB("decrypted", true, true);
const { 
  showEncryptedFiles,
  getDirs
} = require('./dbutil');

const algo = 'aes-256-ctr';
const str = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.>?:;'|[]{}~!@#$%^&*)(_+=-<";

function encryptText(text, key){
  var cipher = crypto.createCipher(algo,key);
  var crypted = cipher.update(text,'utf8','hex');
  crypted += cipher.final('hex');
  return crypted;
}
 
function decryptText(text, key){
  var decipher = crypto.createDecipher(algo,key);
  var dec = decipher.update(text,'hex','utf8');
  dec += decipher.final('utf8');
  return dec;
}

function encryptFile(data, callback){
  try {  
    var cipher = crypto.createCipher(algo, data.key);
    var input = fs.createReadStream(data.path);
    var outputPath = '/home/anspire/.encrypto/.' + randomString();
    var output = fs.createWriteStream(outputPath);
    input.pipe(cipher).pipe(output);
    output.on('finish', function() {
      writeFileInDbe(data.path, outputPath, data.key);
      fs.unlinkSync(data.path);
      callback();
    });
  } catch(err) {
    console.error(err);
  }
}
 
function decryptFile(data, callback){
  try {
    var decipher = crypto.createDecipher(algo, data.key);
    var input = fs.createReadStream(data.newpath);
    var output = fs.createWriteStream(data.path);
    input.pipe(decipher).pipe(output);
    output.on('finish', function() {
      writeFileInDbd(data.path, data.key);
      fs.unlinkSync(data.newpath);
      callback();
    });
  } catch(err) {
    console.error(err);
  }
}

function randomString() {
  var randomTxt = "";
  for (var i = 0; i < 15; i++)
    randomTxt += str.charAt(Math.floor(Math.random() * str.length));
  return randomTxt.trim();
}

var encryptionQueue = async.queue(function(data, callback) {
  encryptFile(data, callback);
  //callback();
}, 1);
encryptionQueue.drain = function() {
    console.log('All completed');
};

var decryptionQueue = async.queue(function(data, callback) {
  decryptFile(data, callback);
  //callback();
}, 1);
decryptionQueue.drain = function() {
    console.log('All completed');
};

function dbdFiles(key){
  var path = "/files";
  try {
     var files = dbd.getData(path);
     if (files.length > 0) {
       for (var i = 0; i < files.length; i++) {
         files[i].path = decryptText(files[i].path, key);
       }
       return files;
     }
  } catch(error) {
     return null;
  };
  return null;
};

function dbeFiles(key){
  var path = "/files";
  try {
     var files = dbe.getData(path);
     if (files.length > 0) {
       for (var i = 0; i < files.length; i++) {
         files[i].path = decryptText(files[i].path, key);
         files[i].newpath = decryptText(files[i].newpath, key);
       }
       return files;
     }
  } catch(error) {
     return null;
  };
  return null;
};


const startEncryption = (key) => {
    try {
      var files = dbdFiles(key);
      if (files != null) {
        for (var i = 0; i < files.length; i++) {
          var data = {
            path: files[i].path,
            key: key
          };
          encryptionQueue.push(data);
        }
      } else {
        console.info('Dir empty.');
      }
    } catch (error) {
      console.log("ERENC");
      console.log(error);
    }
};

const startDecryption = (key) => {
    try {
      var files = dbeFiles(key);
      if (files != null) {
        for (var i = 0; i < files.length; i++) {
          var data = {
            path: files[i].path,
            newpath: files[i].newpath,
            key: key
          };
          decryptionQueue.push(data);
        }
      } else {
        console.info('No file for decryption.');
      }
    } catch (error) {
      console.log("ERDEC");
      console.log(error);
    }
};

const writeFileInDbe = (path, newPath, key) => {
  var filePath = getFilePathInDbd(path, key);
  //console.info(filePath);
  try {
    if (filePath != null) {
      var file = { path : encryptText(path, key), newpath : encryptText(newPath, key) };
      dbe.push("/files[]",file);
      dbd.delete(filePath);
      //console.info('1 file removed from dbd and added to dbe.');
    } else {
      console.info('no file found');
    }
  } catch(error) {
    console.info('ERMOVFILEDBDTODBE');
  };
};

const getFilePathInDbd = (filePath, key) => {
  var path = "/files";
  try {
     var files = dbd.getData(path);
     for (var i = 0; i < files.length; i++) {
       var abc = files[i].path;
       //console.log(abc);
       if (abc == filePath) { 
         return path + '[' + i + ']';
       }
     }
  } catch(error) {
     console.info(error);
     return null;
  };
  return null;
};

const writeFileInDbd = (path, key) => {
  var filePath = getFilePathInDbe(path, key);
  //console.info(filePath);
  try {
    if (filePath != null) {
      var file = { path : encryptText(path, key) };
      dbd.push("/files[]",file);
      dbe.delete(filePath);
      //console.info('1 file removed from dbe and added to dbd.');
    } else {
      console.info('no file found');
    }
  } catch(error) {
    console.info('ERMOVFILEDBETODBD');
  };
};

const getFilePathInDbe = (filePath, key) => {
  var path = "/files";
  try {
     var files = dbe.getData(path);
     for (var i = 0; i < files.length; i++) {
       var abc = files[i].path;
       if (abc == filePath) { 
         return path + '[' + i + ']';
       }
     }
  } catch(error) {
     console.error(error);
     return null;
  };
  return null;
};

module.exports = {  
  encryptText,
  decryptText,
  encryptFile,
  decryptFile,
  randomString,
  startEncryption,
  startDecryption
};
