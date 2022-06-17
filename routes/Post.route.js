import express from 'express';
import PostController from '../controllers/Post.controller.js';
import runValidators from '../validators/runValidators.js';
import { post_create_validator, post_comment_create_validator } from '../validators/Post.validator.js';
import { auth_middleware, requireSignin } from '../validators/Auth.validator.js';
import { parse_form } from '../middlewares/PostCreateFormParser.js';

const router = express.Router();

router.post('/', parse_form, post_create_validator, runValidators, requireSignin, auth_middleware, PostController.create);
router.get('/', PostController.get_all);
router.get('/:id', PostController.get);
router.put('/:id', parse_form, requireSignin, auth_middleware, PostController.update);
router.delete('/:id', requireSignin, auth_middleware, PostController.delete);
router.patch('/:id/like', requireSignin, auth_middleware, PostController.like);
router.patch('/:id/unlike', requireSignin, auth_middleware, PostController.unlike);
router.post('/:id/comment', post_comment_create_validator, runValidators, requireSignin, auth_middleware, PostController.comment);
router.delete('/:id/comment/:commentId', requireSignin, auth_middleware, PostController.delete_comment);
router.patch('/:id/view', PostController.increase_post_view_counts);

export default router;
