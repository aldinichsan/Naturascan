const express = require('express')
const router = express.Router()
const { DaftarUser, LoginUser, postData } = require ('../controller/user.controller')
const {runValidation, validationDaftar,validationLogin} = require ('../validation/index')
const middleware = require('../middleware/middleware')
const multer = require("multer")
const multerStorage = multer.memoryStorage();
const multerUpload = multer({
  storage: multerStorage,
  fileFilter: (req, file, cb) => {
    cb(null, true);
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // Set the maximum file size in bytes (5MB in this example)
  },
});

router.post('/daftar',validationDaftar,runValidation, DaftarUser)

router.post('/login',runValidation,validationLogin, LoginUser)

router.post('/scan',multerUpload.single("image"),middleware,postData)
module.exports = router