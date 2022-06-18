import Tag from '../models/tag.model.js';
import Post from '../models/post.model.js';

class TagController {
  create = async (req, res) => {
    const { name, color } = req.body;
    // Create slug but replacing space with _ and convert to lower case
    const slug = name.replace(' ', '_').toLowerCase();

    Tag.findOne({ slug }).exec((error, tag) => {
      if (error) res.status(400).json({ error });

      // Tag already exist in database
      if (tag) return res.status(400).json({ error: 'This Tag already exists!' });

      // Create new tag
      const new_tag = new Tag({
        name,
        slug,
        color,
      });

      // Save new tag to database
      new_tag.save((error) => {
        // If any error happens, return 400
        if (error) res.status(400).json({ error });
        // Return success
        return res.status(201).json({ message: 'Tag succesfully created!' });
      });
    });
  };

  getAll = async (req, res) => {
    Tag.find({}).exec((error, tags) => {
      // If any error happens return 500
      if (error) res.status(500).json({ error });
      // Return all tags
      else {
        const promises = [];
        tags.forEach((tag) => {
          promises.push(
            new Promise((resolve) => {
              Post.find({ tags: tag._id }).count((err, count) => {
                if (err) console.error(err.message);
                resolve({ ...tag._doc, count });
              });
            })
          );
        });
        Promise.all(promises).then((tags) => res.status(200).json({ tags }));
      }
    });
  };

  get = (req, res) => {
    const { id } = req.params;
    // Check if slug exist
    if (id) {
      // Find Tag by id
      Tag.findById(id).exec(async (error, tag) => {
        // If any error happens return 400
        if (error) res.status(400).json({ error });
        // If no tag found then return 404
        if (!tag) res.status(404).json({ error: 'Tag Not Found!' });
        // Return success
        else {
          const promises = [];
          promises.push(
            new Promise((resolve, reject) => {
              Post.find({ tags: tag._id }).count((err, count) => {
                if (err) reject({ err });
                resolve(count);
              });
            })
          );
          promises.push(
            new Promise((resolve, reject) => {
              Post.aggregate([{ $match: { tags: tag._id } }, { $group: { _id: null, amount: { $sum: '$view' } } }]).exec((err, view) => {
                if (err) reject({ err });
                resolve(view?.[0]?.amount);
              });
            })
          );
          promises.push(
            new Promise((resolve, reject) => {
              Post.aggregate([
                { $match: { tags: tag._id } },
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
                { $match: { tags: tag._id } },
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

          res.status(200).json({ tag: { ...tag._doc, count, view, likes, comments } });
        }
      });
    } else {
      res.status(400).json({ error: 'Id is required!' });
    }
  };

  getPostsOfTag = (req, res) => {
    const { id } = req.params;
    const filter = req.query.filter;
    const [field, sort] = filter.split(' ');
    const sortObject = {};
    sortObject[field] = sort;

    Post.find({ tags: id })
      .populate('user_id')
      .sort(sortObject)
      .limit(10)
      .exec((error, posts) => {
        if (error) res.status(400).json({ error });
        else res.status(200).json({ posts });
      });
  };

  delete = async (req, res) => {
    const { slug } = req.params;
    // Check if slug exist
    if (slug) {
      Tag.findOneAndDelete({ slug }).exec((error, tag) => {
        // If any error happens return 400
        if (error) res.status(400).json({ error });
        // If no tag found then return 404
        if (!tag) res.status(404).json({ error: 'Tag Not Found!' });
        // Return tag
        else res.status(200).json({ message: 'Tag succesfully deleted!' });
      });
    } else {
      res.status(400).json({ error: 'Slug is required!' });
    }
  };

  update = async (req, res) => {
    const { slug } = req.params;
    // Check if slug exist
    if (slug) {
      // Get name and color
      const { name, color } = req.body;

      // Object that update the category
      const updated_tag = {};

      // If name exist, then update name and slug
      if (name) {
        updated_tag.name = name;
        updated_tag.slug = name.replace(' ', '_').toLowerCase();
      }

      // If color exist, then update color
      if (color) updated_tag.color = color;

      // If color or name or slug is placed in updated_tag object, then update the object
      if (Object.keys(updated_tag).length > 0) {
        Tag.findOneAndUpdate({ slug }, updated_tag).exec((error, tag) => {
          // If any error happens return 400
          if (error) res.status(400).json({ error });
          // If no tag found then return 404
          if (!tag) res.status(404).json({ error: 'Tag not found!' });
          // Return success
          else res.status(201).json({ message: 'Tag successfully updated!' });
        });
      } else {
        res.status(400).json({ error: 'No changes made!' });
      }
    } else {
      res.status(400).json({ error: 'Slug is required!' });
    }
  };
}

export default new TagController();
