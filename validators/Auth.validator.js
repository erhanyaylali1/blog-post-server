import { check } from 'express-validator';
import expressJwt from 'express-jwt';
import User from '../models/user.model.js';
import UserRoles from '../config/UserRoles.js';

export const auth_register_validator = [
  check('full_name').not().isEmpty().withMessage('Name is required'),
  check('email').not().isEmpty().withMessage('Email is required'),
  check('password').not().isEmpty().withMessage('Email is required'),
  check('email').isEmail().withMessage('Email must be valid'),
  check('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long'),
];

export const auth_login_validator = [
  check('email').not().isEmpty().withMessage('Email is required'),
  check('password').not().isEmpty().withMessage('Password is required'),
  check('email').isEmail().withMessage('Email must be valid'),
  check('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long'),
];

export const requireSignin = expressJwt({
  secret: process.env.JWT_SECRET,
  algorithms: ['HS256'],
  userProperty: 'auth',
  
});

export const auth_middleware = async (req, res, next) => {
  // GET USER_ID IN REQ FROM JWT
  const auth_id = req?.auth?._id;
  if (auth_id) {
    // GET USER BY ID
    const user = await User.findById(auth_id);
    if (user) {
      // SET USER TO REQUEST
      req.user = user;
      next();
    } else {
      // USER NOT FOUND
      res.status(422).json({ error: 'User Not Found!' });
    }
  } else {
    // JWT ID NOT FOUND
    res.status(422).json({ error: 'Action Requires Authentication!' });
  }
};

export const admin_middleware = async (req, res, next) => {
  // GET USER_ID IN REQ FROM JWT
  const admin_id = req?.auth?._id;
  if (admin_id) {
    // GET USER BY ID
    const user = await User.findById(admin_id);
    if (user) {
      // CHECK USER ROLE WHETHER IF IT IS ADMIN OR NOT
      if (user.role !== UserRoles.Admin) {
        res.status(422).json({ error: 'You are not Authorized!' });
      } else {
        // SET USER TO REQUEST
        req.admin = user;
        next();
      }
    } else {
      // USER NOT FOUND
      res.status(422).json({ error: 'User Not Found!' });
    }
  } else {
    // JWT ID NOT FOUND
    res.status(422).json({ error: 'Action Requires Authentication!' });
  }
};
