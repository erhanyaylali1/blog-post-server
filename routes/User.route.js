import express from 'express';
import UserController from '../controllers/User.controller.js';
import {
  auth_middleware,
  requireSignin,
} from '../validators/Auth.validator.js';

const router = express.Router();

router.get('/', requireSignin, auth_middleware, UserController.get_profile);

export default router;
