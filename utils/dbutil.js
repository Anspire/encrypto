const JsonDB = require('node-json-db');
const fs = require('fs');

const db = new JsonDB("encrypto", true, true);
const dbe = new JsonDB("encrypted", true, true);
const dbd = new JsonDB("decrypted", true, true);
const { 
  encryptText,
  decryptText,
  startEncryption,
  startDecryption
} = require('./crypt');

const addSecretKey = (data) => {
  if (checkKey()) { 
    console.info('Secret key is already added.(You can change your secret key.)');
  } else {
    var encKey = encryptText(data.key, data.key);
    var key = { 'key' : encKey };
    db.push("/encrypto/key/",key);
    console.info('Secret key added.');
  }
};

const changeSecretKey = (data) => {
  if (checkEncrypted()) {
    console.info('First decrypt your files then change your secret key');
  } else {
    var encKey = encryptText(data.key, data.key);
    var key = { 'key' : encKey };
    db.push("/encrypto/key/",key);
    console.info('Secret key changed.'); 
    encryptDirWithNewKey(data.oldKey, data.key);
    encryptDbdWithNewKey(data.oldKey , data.key);
  }
};

const checkKey = () => {
  var path = "/encrypto/key";
  try {
     var key = db.getData(path);
     return true;
  } catch(error) {
     //console.info(error);
     return false;
  };
  return false;
};

const checkEncrypted = () => {
  var path = "/files";
  try {
     var files = dbe.getData(path);
     if (files.length > 0) { 
       return true;
     }
  } catch(error) {
     return false;
  };
  return false;
};

const encryptDirWithNewKey = (oldKey,key) => {
  var path = "/encrypto/dirs";
  try {
     var dirs = db.getData(path);
     for (var i = 0; i < dirs.length; i++) {
       db.push("/encrypto/dirs[" + i + "]/dirpath",encryptText(decryptText(dirs[i].dirpath, oldKey), key));
     }
  } catch(error) {
     console.error('ERNODIR');
  };
};

const encryptDbdWithNewKey = (oldKey,key) => {
  var path = "/files";
  try {
     var files = dbd.getData(path);
     for (var i = 0; i < files.length; i++) {
       dbd.push("/files[" + i + "]/path",encryptText(decryptText(files[i].path, oldKey), key));
     }
  } catch(error) {
     console.error('ERENCDBD');
  };
};

const addDir = (data) => {
  var encPath = encryptText(data.dirpath, data.key);
  var dir = { 'dirpath': encPath };
  db.push("/encrypto/dirs[]",dir);
  console.info(data.dirpath);
  console.info('Dir added.');
};

const delDir = (data) => {
  var dir = getDirPath(data);
  try {
    if (dir != null) {
      db.delete(dir);
      console.info(data.dirpath);
      console.info('1 dir removed.');
    } else {
      console.info('No dir found');
    }
  } catch(error) {
    console.error('ERNODIR');
  };
};

const showDirs = (data) => {
  var path = "/encrypto/dirs";
  try {
     var dirs = db.getData(path);
     for (var i = 0; i < dirs.length; i++) {
       dirs[i].dirpath = decryptText(dirs[i].dirpath, data.key);
     }
     console.info(dirs);
     console.info(dirs.length + ' dir found.');
  } catch(error) {
     console.error('ERNODIR');
  };
};

const getDirs = (data) => {
  var path = "/encrypto/dirs";
  try {
     var dirs = db.getData(path);
     for (var i = 0; i < dirs.length; i++) {
       dirs[i].dirpath = decryptText(dirs[i].dirpath, data.key);
     }
     return dirs;
  } catch(error) {
     console.error('ERNODIR');
     console.error(error);
     return null;
  };
};

const getDirPath = (data) => {
  var path = "/encrypto/dirs";
  try {
     var dirs = db.getData(path);
     for (var i = 0; i < dirs.length; i++) {
       if (decryptText(dirs[i].dirpath, data.key) == data.dirpath) { 
         return path + '[' + i + ']';
       }
     }
  } catch(error) {
     console.error('ERDIRPATH');
     return null;
  };
  return null;
};

const checkDir = (dirpath, key) => {
  var path = "/encrypto/dirs";
  try {
     var dirs = db.getData(path);
     for (var i = 0; i < dirs.length; i++) {
       if (decryptText(dirs[i].dirpath, key) == dirpath) { 
         return true;
       }
     }
  } catch(error) {
     //console.info('ERCHKDIR');
     return false;
  };
  return false;
};

const validateKey = (key) => {
 var path = "/encrypto/key";
  try {
     var val = db.getData(path);
     if (decryptText(val.key, key) == key) {
       return true;
     }
  } catch(error) {
    return false;
  };
return false;
};

const encrypt = (data) => {
  var dirs = getDirs(data);
  if (dirs != null) {
    for (var i = 0; i < dirs.length; i++) {
      traverseDirs(dirs[i].dirpath, data.key);
    }
    startEncryption(data.key);
  } else {
    console.info('Dir list is empty.');
  }
  
};

const decrypt = (data) => {
  startDecryption(data.key);
};

var traverseDirs = function (currentPath, key) {
  var files = fs.readdirSync(currentPath);
  for (var i in files) {
    var currentFile = currentPath + '/' + files[i];
    var stats = fs.statSync(currentFile);
    if (stats.isFile()) {
      checkFile(currentFile, key);
    }
    else if (stats.isDirectory()) {
      traverseDirs(currentFile);
    }
  }
};

const checkFile = (filePath, key) => {
  var path = "/files";
  var found = false;
  try {
     var files = dbe.getData(path);
     for (var i = 0; i < files.length; i++) {
       if (decryptText(files[i].path, key) == filePath) { 
         found = true;
       }
     }
  } catch(error) {
    console.info('ERCHKFILE');
    console.info(error);
  };
  if (!found) {
    if (!checkFileInDbd(filePath, key)) {
      var file = { path : encryptText(filePath, key) };
      dbd.push("/files[]",file);
    } 
  }
};

const checkFileInDbd = (filePath, key) => {
  var path = "/files";
  try {
     var files = dbd.getData(path);
     for (var i = 0; i < files.length; i++) {
       if (decryptText(files[i].path, key) == filePath) { 
         return true;
       }
     }
  } catch(error) {
     return false;
  };
  return false;
};


const showEncryptedFiles = (data) => {
  var path = "/files";
  try {
     var files = dbe.getData(path);
     for (var i = 0; i < files.length; i++) {
       console.info('\nFile path : ' + decryptText(files[i].path, data.key));
       console.info('File new path : ' + decryptText(files[i].newpath, data.key));
     }
     console.info(files.length + ' file found.');
  } catch(error) {
     //console.error(error);
     console.error('ERNOFILE');
  };
};

module.exports = {  
  addSecretKey,
  changeSecretKey,
  addDir,
  showDirs,
  delDir,
  decrypt,
  encrypt,
  validateKey,
  checkDir,
  showEncryptedFiles,
  getDirs,
};
