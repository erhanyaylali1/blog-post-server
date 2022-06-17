import { check } from 'express-validator';

export const tag_create_validator = [
  check('name').not().isEmpty().withMessage('Name is required'),
];
