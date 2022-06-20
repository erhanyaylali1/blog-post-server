import User from '../models/user.model.js';
import Post from '../models/post.model.js';
import mongooes from 'mongoose';
import UserRoles from '../config/UserRoles.js';
import nodeoutlook from 'nodejs-nodemailer-outlook';
import { nanoid } from 'nanoid';

class AuthController {
  get = (req, res) => {
    User.find({})
      .select({ _id: 1, full_name: 1, photo: 1, email: 1, role: 1, birthday: 1, createdAt: 1 })
      .exec((err, users) => {
        if (err) res.status(500).json({ error: err.message });
        else res.status(200).json({ users });
      });
  };

  get_profile = (req, res) => {
    const id = req.params.id;
    User.findById(id).exec(async (err, user) => {
      if (err) return res.status(400).json({ error: err });
      if (!user) return res.status(404).json({ error: 'User not found' });
      else {
        const promises = [];

        promises.push(
          new Promise((resolve, reject) => {
            Post.find({ user_id: id }).count((err, count) => {
              if (err) reject({ err });
              resolve(count);
            });
          })
        );

        promises.push(
          new Promise((resolve, reject) => {
            Post.aggregate([{ $match: { user_id: new mongooes.Types.ObjectId(id) } }, { $group: { _id: null, amount: { $sum: '$view' } } }]).exec(
              (err, view) => {
                if (err) reject({ err });
                resolve(view?.[0]?.amount);
              }
            );
          })
        );

        promises.push(
          new Promise((resolve, reject) => {
            Post.aggregate([
              { $match: { user_id: new mongooes.Types.ObjectId(id) } },
              {
                $project: {
                  likes: { $size: '$likes' },
                },
              },
              {
                $group: {
                  _id: null,
                  amount: {
                    $sum: '$likes',
                  },
                },
              },
            ]).exec((err, view) => {
              if (err) reject({ err });
              resolve(view?.[0]?.amount);
            });
          })
        );

        promises.push(
          new Promise((resolve, reject) => {
            Post.aggregate([
              { $match: { user_id: new mongooes.Types.ObjectId(id) } },
              {
                $project: {
                  comments: { $size: '$comments' },
                },
              },
              {
                $group: {
                  _id: null,
                  amount: {
                    $sum: '$comments',
                  },
                },
              },
            ]).exec((err, view) => {
              if (err) reject({ err });
              resolve(view?.[0]?.amount);
            });
          })
        );
        const [count, view, likes, comments] = await Promise.all(promises).catch((err) => console.log(err));

        return res.status(200).json({ user, count, view, likes, comments });
      }
    });
  };

  get_profile_trends = (req, res) => {
    const id = req.params.id;
    Post.find({ user_id: id })
      .select({ _id: 1, title: 1, content: 1, createdAt: 1, view: 1 })
      .sort({ view: -1 })
      .limit(5)
      .exec(async (err, posts) => {
        if (err) return res.status(400).json({ error: err });
        if (!posts) return res.status(404).json({ error: 'User not found' });
        else {
          return res.status(200).json({ posts });
        }
      });
  };

  get_profile_posts = (req, res) => {
    const id = req.params.id;
    Post.find({ user_id: id })
      .select({ _id: 1, title: 1, content: 1, createdAt: 1, photo: 1 })
      .sort({ createdAt: -1 })
      .exec(async (err, posts) => {
        if (err) return res.status(400).json({ error: err });
        if (!posts) return res.status(404).json({ error: 'User not found' });
        else {
          return res.status(200).json({ posts });
        }
      });
  };

  update_profile = (req, res) => {
    const id = req.params.id;
    const { photo, about, domain, country, job, birthday } = req.body;
    User.findById(id).exec(async (err, user) => {
      if (err) return res.status(400).json({ error: err });
      if (!user) return res.status(404).json({ error: 'User not found' });
      else {
        if (photo) user.photo = photo;
        if (about) user.about = about;
        if (domain) user.domain = domain;
        if (country) user.country = country;
        if (job) user.job = job;
        if (birthday) user.birthday = birthday;

        user.save((err) => {
          if (err) return res.status(400).json({ error: err });
          return res.status(200).json({ message: 'User profile updated' });
        });
      }
    });
  };

  get_user_likes = (req, res) => {
    const user_id = req.params.id;
    Post.find({ 'likes.user_id': { $eq: user_id } })
      .select({ title: 1, content: 1, createdAt: 1, photo: 1 })
      .sort({ createdAt: -1 })
      .populate({ path: 'user_id', select: ['_id', 'full_name', 'photo'] })
      .exec((err, posts) => {
        if (err) return res.status(400).json({ error: err });
        if (!res) return res.status(404).json({ error: 'User not found' });
        else {
          return res.status(200).json({ posts });
        }
      });
  };

  get_user_comments = (req, res) => {
    const user_id = req.params.id;
    Post.find({ 'comments.user_id': { $eq: user_id } })
      .select({ title: 1, content: 1, createdAt: 1, photo: 1 })
      .sort({ createdAt: -1 })
      .populate({ path: 'user_id', select: ['_id', 'full_name', 'photo'] })
      .exec((err, posts) => {
        if (err) return res.status(400).json({ error: err });
        if (!res) return res.status(404).json({ error: 'User not found' });
        else {
          return res.status(200).json({ posts });
        }
      });
  };

  update_user_role = (req, res) => {
    const id = req.params.id;
    const { role } = req.body;
    console.log(role);
    User.findByIdAndUpdate(id, { role }).exec((err, user) => {
      if (err) return res.status(400).json({ error: err });
      if (!user) return res.status(404).json({ error: 'User not found' });
      else {
        return res.status(200).json({ message: 'User role updated' });
      }
    });
  };

  delete_user = (req, res) => {
    const id = req.params.id;
    User.findByIdAndDelete(id).exec((err, user) => {
      if (err) return res.status(400).json({ error: err });
      if (!user) return res.status(404).json({ error: 'User not found' });
      else {
        return res.status(200).json({ message: 'User deleted' });
      }
    });
  };

  update_account = (req, res) => {
    const session_user = req.user;
    const id = req.params.id;
    if (session_user.role === UserRoles.Admin || session_user._id.toString() === id) {
      const { full_name, email, password } = req.body;
      User.findById(id).exec((err, user) => {
        if (err) return res.status(400).json({ error: err });
        if (!user) return res.status(404).json({ error: 'User not found' });
        else {
          if (full_name) user.full_name = full_name;
          if (email) user.email = email;
          if (password) user.password = password;
          user.save((err) => {
            if (err) return res.status(400).json({ error: err });
            else return res.status(200).json({ message: 'User account updated' });
          });
        }
      });
    } else {
      return res.status(403).json({ error: 'You are not authorized to update this account.' });
    }
  };

  send_password_reset_link = (req, res) => {
    const { email } = req.body;
    User.findOne({ email }).exec((err, user) => {
      if (err) return res.status(400).json({ error: err });
      if (!user) return res.status(404).json({ error: 'User not found' });
      else {
        const token = nanoid();
        const link = `${process.env.CLIENT_URL}/reset-password/${token}`;
        const html = `<h1>Password Reset</h1>
            <p>You are receiving this email because you (or someone else) have requested the reset of the password for your account.
            Please click on the following link, or paste this into your browser to complete the process:</p>
            <a href=${link}>${link}</a>
            <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>`;
        this.#sendEmail(email, 'Password Reset', html);
        user.reset_password_link = token;
        user.save((err) => {
          if (err) return res.status(400).json({ error: err });
          else return res.status(200).json({ message: 'Password reset link sent' });
        });
      }
    });
  };

  check_password_reset_link = (req, res) => {
    const { token } = req.params;
    User.findOne({ reset_password_link: token }).exec((err, user) => {
      if (err) return res.status(400).json({ error: err });
      if (!user) return res.status(404).json({ error: 'User not found' });
      else return res.status(200).json({ message: 'Correct!' });
    });
  };

  reset_password = (req, res) => {
    const { password, token } = req.body;
    User.findOne({ reset_password_link: token }).exec((err, user) => {
      if (err) return res.status(400).json({ error: err });
      if (!user) return res.status(404).json({ error: 'Incorrect Token!' });
      else {
        user.password = password;
        user.reset_password_link = '';
        user.save((err) => {
          if (err) return res.status(400).json({ error: err });
          return res.status(200).json({ message: 'Correct!' });
        });
      }
    });
  };

  #sendEmail = (email, title, content) => {
    nodeoutlook.sendEmail({
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
      },
      from: process.env.EMAIL,
      to: email,
      subject: title,
      html: content,
      onError: (e) => console.error(e),
    });
  };
}

export default new AuthController();
