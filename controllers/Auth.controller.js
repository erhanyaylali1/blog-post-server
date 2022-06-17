import User from '../models/user.model.js';
import shortId from 'shortId';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import UserRoles from '../config/UserRoles.js';

dotenv.config();

class AuthController {
  register = async (req, res) => {
    const { full_name, email, password } = req.body;
    User.findOne({ email }).exec((error, user) => {
      if (error) res.status(400).json({ error });

      // Email already registered in database
      if (user) return res.status(400).json({ error: 'This email already registered!' });

      const username = shortId.generate();
      const profile = `${process.env.CLIENT_URL}/profile/${username}`;
      const new_user = new User({
        full_name,
        email,
        password,
        profile,
        username,
        role: UserRoles.User,
      });

      new_user.save((error, user) => {
        if (error) res.status(400).json({ error });
        return res.status(201).json({ user });
      });
    });
  };

  login = async (req, res) => {
    const { email, password } = req.body;
    User.findOne({ email }).exec((err, user) => {
      // No email match with that user
      if (err || !user) return res.status(400).json({ error: 'No user found!' });
      // email password dont match
      if (!user.authenticate(password)) return res.status(400).json({ error: 'Email and password do not match!' });
      // create token
      const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
        expiresIn: '2d',
      });
      res.cookie('token', token, { expiresIn: '1d' });
      const { _id, username, full_name, email, role } = user;
      return res.status(200).json({
        token,
        user: { _id, username, full_name, email, role },
      });
    });
  };

  logout = async (req, res) => {
    res.clearCookie('token');
    res.status(200).json({ message: 'Successfully Signed out!' });
  };
}

export default new AuthController();
