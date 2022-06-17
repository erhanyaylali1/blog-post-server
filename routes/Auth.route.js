import express from 'express';
import AuthController from '../controllers/Auth.controller.js';
import runValidators from '../validators/runValidators.js';
import { auth_register_validator, auth_login_validator } from '../validators/Auth.validator.js';

const router = express.Router();

router.post('/register', auth_register_validator, runValidators, AuthController.register);

router.post('/login', auth_login_validator, runValidators, AuthController.login);

router.get('/logout', AuthController.logout);

export default router;
