import express from 'express';
import UserController from '../controllers/User.controller.js';
import { parse_form } from '../middlewares/UserEditFormParser.js';

const router = express.Router();

router.get('/:id', UserController.get_profile);
router.put('/:id', parse_form, UserController.update_profile);
router.get('/:id/trends', UserController.get_profile_trends);
router.get('/:id/posts', UserController.get_profile_posts);

export default router;
