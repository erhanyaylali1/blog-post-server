import express from 'express';
import TagController from '../controllers/Tag.controller.js';
import { admin_middleware, requireSignin, auth_middleware } from '../validators/Auth.validator.js';
import { tag_create_validator } from '../validators/Tag.validator.js';
import runValidators from '../validators/runValidators.js';

const router = express.Router();

router.post('/', tag_create_validator, runValidators, requireSignin, auth_middleware, TagController.create);
router.get('/', TagController.getAll);
router.get('/:id', TagController.get);
router.get('/:id/posts', TagController.getPostsOfTag);
router.put('/:slug', requireSignin, auth_middleware, TagController.update);
router.delete('/:slug', requireSignin, admin_middleware, TagController.delete);

export default router;
