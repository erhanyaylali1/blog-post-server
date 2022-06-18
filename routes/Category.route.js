import express from 'express';
import CategoryController from '../controllers/Category.controller.js';
import { admin_middleware, requireSignin, auth_middleware } from '../validators/Auth.validator.js';
import { category_create_validator } from '../validators/Category.validator.js';
import runValidators from '../validators/runValidators.js';

const router = express.Router();

router.post('/', category_create_validator, runValidators, requireSignin, admin_middleware, CategoryController.create);
router.get('/', CategoryController.getAll);
router.get('/:id', CategoryController.get);
router.get('/:id/posts', CategoryController.getPostsOfCategory);
router.put('/:slug', category_create_validator, requireSignin, auth_middleware, CategoryController.update);
router.delete('/:slug', requireSignin, admin_middleware, CategoryController.delete);

export default router;
