const express = require('express');
const { loginUser } = require('../controllers/userController.js');
const userRouter = express.Router();

userRouter.post('/login',loginUser);

module.exports = userRouter;