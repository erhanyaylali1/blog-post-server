import express from 'express';
import UserController from '../controllers/User.controller.js';

const router = express.Router();

router.get('/:id', UserController.get_profile);
router.get('/:id/trends', UserController.get_profile_trends);
router.get('/:id/posts', UserController.get_profile_posts);

export default router;
