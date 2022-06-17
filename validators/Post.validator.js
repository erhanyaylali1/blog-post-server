import { body } from 'express-validator';

export const post_create_validator = [
  body('title').not().isEmpty().withMessage('Title is required'),
  body('title')
    .isLength({ min: 3 })
    .withMessage('Title should be at least 3 characters'),
  body('content').not().isEmpty().withMessage('Content is required'),
  body('content')
    .isLength({ min: 50 })
    .withMessage('Content should be at least 50 characters'),
  body('categories').not().isEmpty().withMessage('Categories are required'),
];

export const post_comment_create_validator = [
  body('content').not().isEmpty().withMessage('Content is required'),
];
