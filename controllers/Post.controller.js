import mongooes from 'mongoose';
import UserRoles from '../config/UserRoles.js';
import Post from '../models/post.model.js';
import Tag from '../models/tag.model.js';

class PostController {
  create = async (req, res) => {
    const user_id = req.auth._id;
    // Extract data from req body
    const { title, content, tags, categories, photo } = req.body;
    const promises = [];
    // For each tag name
    tags?.forEach((new_tag) => {
      promises.push(
        new Promise((resolve, reject) => {
          // Checks if it exists in db
          Tag.findOne({ slug: new_tag.replace(' ', '_').toLowerCase() }).exec((err, tag) => {
            if (err) reject(err);
            if (tag) {
              // if it is then returns the id
              resolve(tag._id);
            } else {
              // if not create new ones and returns the id
              const newTag = new Tag({
                name: new_tag,
                slug: new_tag.replace(' ', '_').toLowerCase(),
              });
              newTag.save((err, tag) => {
                if (err) reject(err);
                if (tag) resolve(tag._id);
              });
            }
          });
        })
      );
    });

    const tag_ids = await Promise.all(promises);

    // Create a new post
    const post = new Post({
      title,
      content,
      categories,
      tags: tag_ids,
      photo,
      user_id,
    });
    post.save((err) => {
      if (err) {
        // If any error happens, return 400
        res.status(400).json({ error: err });
      } else {
        // Return success
        res.status(201).json({ message: 'Post created successfully' });
      }
    });
  };

  get_all = (req, res) => {
    // Get All Posts
    Post.find({})
      .populate({ path: 'user_id', select: ['_id', 'full_name', 'photo'] })
      .sort({ createdAt: 'desc' })
      .limit(50)
      .exec(async (error, posts) => {
        // If any error happens, return 500
        if (error) res.status(500).json({ error });
        else {
          // Return success
          res.status(200).json({ posts });
        }
      });
  };

  get = (req, res) => {
    // Get Post by Id
    Post.findById(req.params.id)
      .populate({ path: 'user_id', select: ['_id', 'full_name', 'photo'] })
      .populate('tags')
      .populate('categories')
      .populate('likes')
      .populate({
        path: 'comments',
        populate: { path: 'user_id', select: ['_id', 'full_name', 'photo'] },
      })
      .exec((error, post) => {
        // If any error happens, return 400
        if (error) res.status(400).json({ error });
        else {
          // Check if post exists
          if (post) {
            // Return POST
            res.status(200).json({ post });
          } else {
            // No Post found by that Id
            res.status(404).json({ error: 'Post Not Found' });
          }
        }
      });
  };

  update = async (req, res) => {
    // Extract data from req body
    const { title, content, tags, categories, photo } = req.body;
    const promises = [];
    // For each tag name
    tags.forEach((new_tag) => {
      promises.push(
        new Promise((resolve, reject) => {
          // Checks if it exists in db
          Tag.findOne({ slug: new_tag.replace(' ', '_').toLowerCase() }).exec((err, tag) => {
            if (err) reject(err);
            if (tag) {
              // if it is then returns the id
              resolve(tag._id);
            } else {
              // if not create new ones and returns the id
              const newTag = new Tag({
                name: new_tag,
                slug: new_tag.replace(' ', '_').toLowerCase(),
              });
              newTag.save((err, tag) => {
                if (err) reject(err);
                if (tag) resolve(tag._id);
              });
            }
          });
        })
      );
    });

    const tag_ids = await Promise.all(promises);

    // Get Post by Id
    Post.findById(req.params.id).exec((error, post) => {
      // If any error happens, return 400
      if (error) res.status(400).json({ error });
      else {
        // Check if post exists
        if (post) {
          // Check if the user who sent request is owner of the post or admin
          if ((post.user_id.toString() === req.auth._id) | (req.user.role === UserRoles.Admin)) {
            // Update fields
            if (title) post.title = title;
            if (content) post.content = content;
            if (tags) post.tags = tag_ids;
            if (categories) post.categories = categories;
            if (photo) post.photo = photo;

            post.save((error) => {
              // If any error happens, return 400
              if (error) res.status(400).json({ error });
              else {
                // Return success
                res.status(200).json({ message: 'Post updated successfully' });
              }
            });
          } else {
            // User is not admin nor owner of the post
            res.status(401).json({ error: 'You are not allowed to update this post!' });
          }
        } else {
          // No Post found by that Id
          res.status(404).json({ error: 'Post Not Found' });
        }
      }
    });
  };

  delete = (req, res) => {
    // Get Post by Id
    Post.findById(req.params.id).exec((error, post) => {
      // If any error happens, return 400
      if (error) res.status(400).json({ error });
      else {
        // Check if post exists
        if (post) {
          // Check if the user who sent request is owner of the post or admin
          if ((post.user_id.toString() === req.auth._id) | (req.user.role === UserRoles.Admin)) {
            post.remove((error) => {
              // If any error happens, return 400
              if (error) res.status(400).json({ error });
              else {
                // Return success
                res.status(200).json({ message: 'Post deleted successfully' });
              }
            });
          } else {
            // User is not admin nor owner of the post
            res.status(401).json({ error: 'You are not allowed to delete this post!' });
          }
        } else {
          // No Post found by that Id
          res.status(404).json({ error: 'Post Not Found' });
        }
      }
    });
  };

  like = async (req, res) => {
    const user_id = req.auth._id;
    const post_id = req.params.id;

    // Finds the post by id and not liked by this user because user can only like this post one time.
    // So if he/she liked, so he/she wont be able to like it again
    Post.updateOne(
      {
        _id: post_id,
        'likes.user_id': { $ne: user_id },
      },
      {
        // Pushes user_id to likes array of this post
        $push: {
          likes: { user_id },
        },
      }
    ).exec((err, post) => {
      // If any error happens, return 400
      if (err) return res.status(400).json({ error: err.message });
      // No Post found by that Id
      if (!post) return res.status(404).json({ error: 'Post Not Found!' });
      // Return success
      return res.status(200).json({ message: 'Post liked successfully' });
    });
  };

  unlike = (req, res) => {
    const user_id = req.auth._id;
    const post_id = req.params.id;

    // Finds the post by id
    Post.findOneAndUpdate(
      {
        _id: post_id,
      },
      {
        // Removes user_id from likes array of this post
        $pull: {
          likes: { user_id: mongooes.Types.ObjectId(user_id) },
        },
      }
    ).exec((err, post) => {
      // If any error happens, return 400
      if (err) return res.status(404).json({ error: err.message });
      // No Post found by that Id
      if (!post) return res.status(400).json({ error: 'Post Not Found!' });
      // Return success
      return res.status(200).json({ message: 'Post unliked successfully' });
    });
  };

  comment = (req, res) => {
    const user_id = req.auth._id;
    const post_id = req.params.id;
    const content = req.body.content;

    // Finds the post by id
    Post.updateOne(
      { _id: post_id },
      {
        // Pushes user_id and content of comment to likes array of this post
        $push: {
          comments: { user_id, content },
        },
      }
    ).exec((err, post) => {
      // If any error happens, return 400
      if (err) return res.status(404).json({ error: err.message });
      // No Post found by that Id
      if (!post) return res.status(400).json({ error: 'Post Not Found!' });
      // Return success
      return res.status(200).json({ message: 'Comment posted successfully' });
    });
  };

  delete_comment = (req, res) => {
    const post_id = req.params.id;
    const comment_id = req.params.commentId;

    // Finds the post by id
    Post.findByIdAndUpdate(post_id, {
      // Removes comment from likes array of this post by comment_id
      $pull: {
        comments: { _id: comment_id },
      },
    }).exec((err, post) => {
      // If any error happens, return 400
      if (err) return res.status(404).json({ error: err.message });
      // No Post found by that Id
      if (!post) return res.status(404).json({ error: 'Post not found!' });
      // Return success
      return res.status(200).json({ message: 'Comment deleted successfully!' });
    });
  };

  increase_post_view_counts = (req, res) => {
    const post_id = req.params.id;

    // Finds the post by id and increase view by one
    Post.findByIdAndUpdate(post_id, { $inc: { view: 1 } }).exec((err, post) => {
      // If any error happens, return 400
      if (err) return res.status(404).json({ error: err.message });
      // No Post found by that Id
      if (!post) return res.status(404).json({ error: 'Post not found' });
      // Return success
      return res.status(200).json({ message: 'Post viewed successfully!' });
    });
  };
}

export default new PostController();
