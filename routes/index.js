import express from 'express';
import AuthRoute from './Auth.route.js';
import UserRoute from './User.route.js';
import CategoryRoute from './Category.route.js';
import TagRoute from './Tag.route.js';
import PostRoute from './Post.route.js';

const router = express.Router();

router.use('/auth', AuthRoute);
router.use('/user', UserRoute);
router.use('/category', CategoryRoute);
router.use('/tag', TagRoute);
router.use('/post', PostRoute);

export default router;
