import express from 'express';
import UserController from '../controllers/User.controller.js';
import { parse_form } from '../middlewares/UserEditFormParser.js';
import { admin_middleware, requireSignin } from '../validators/Auth.validator.js';

const router = express.Router();

router.get('/', UserController.get);
router.get('/:id', UserController.get_profile);
router.put('/:id', parse_form, UserController.update_profile);
router.put('/:id/role', requireSignin, admin_middleware, UserController.update_user_role);
router.delete('/:id', requireSignin, admin_middleware, UserController.delete_user);
router.get('/:id/trends', UserController.get_profile_trends);
router.get('/:id/posts', UserController.get_profile_posts);
router.get('/:id/likes', UserController.get_user_likes);
router.get('/:id/comments', UserController.get_user_comments);

export default router;
