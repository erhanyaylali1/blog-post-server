import Category from '../models/category.model.js';
import postModel from '../models/post.model.js';
import Post from '../models/post.model.js';

class CategoryController {
  create = async (req, res) => {
    const { name } = req.body;
    // Create slug but replacing space with _ and convert to lower case
    const slug = name.replace(' ', '_').toLowerCase();

    Category.findOne({ slug }).exec((error, category) => {
      if (error) res.status(400).json({ error });

      // Category already exist in database
      if (category) return res.status(400).json({ error: 'This Category already exists!' });

      // Create new category
      const new_category = new Category({
        name,
        slug,
      });

      // Save new category to database
      new_category.save((error) => {
        // If any error happens, return 400
        if (error) res.status(400).json({ error });
        // Return success
        return res.status(201).json({ message: 'Category succesfully created!' });
      });
    });
  };

  getAll = async (req, res) => {
    Category.find({}).exec((error, categories) => {
      // If any error happens return 500
      if (error) res.status(500).json({ error });
      // Return all categories
      else {
        const promises = [];
        categories.forEach((category) => {
          promises.push(
            new Promise((resolve) => {
              Post.find({ categories: category._id }).count((err, count) => {
                if (err) console.error(err.message);
                resolve({ ...category._doc, count });
              });
            })
          );
        });
        Promise.all(promises).then((categories) => res.status(200).json({ categories }));
      }
    });
  };

  get = (req, res) => {
    const { id } = req.params;
    // Check if slug exist
    if (id) {
      // Find Category by Slug
      Category.findById(id).exec(async (error, category) => {
        // If any error happens return 400
        if (error) res.status(400).json({ error });
        // If no category found then return 404
        if (!category) res.status(404).json({ error: 'Category Not Found!' });
        // Return success
        else {
          const promises = [];
          promises.push(
            new Promise((resolve, reject) => {
              Post.find({ categories: category._id }).count((err, count) => {
                if (err) reject({ err });
                resolve(count);
              });
            })
          );
          promises.push(
            new Promise((resolve, reject) => {
              Post.aggregate([{ $match: { categories: category._id } }, { $group: { _id: null, amount: { $sum: '$view' } } }]).exec((err, view) => {
                if (err) reject({ err });
                resolve(view?.[0]?.amount);
              });
            })
          );
          promises.push(
            new Promise((resolve, reject) => {
              Post.aggregate([
                { $match: { categories: category._id } },
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
                { $match: { categories: category._id } },
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

          res.status(200).json({ category: { ...category._doc, count, view, likes, comments } });
        }
      });
    } else {
      res.status(400).json({ error: 'Slug is required!' });
    }
  };

  getPostsOfCategory = (req, res) => {
    const { id } = req.params;
    const filter = req.query.filter;
    const [field, sort] = filter.split(' ');
    const sortObject = {};
    sortObject[field] = sort;

    Post.find({ categories: id })
      .select({ _id: 1, title: 1, content: 1, photo: 1, createdAt: 1 })
      .populate({ path: 'user_id', select: ['_id', 'full_name', 'photo'] })
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
      Category.findOneAndDelete({ slug }).exec((error, category) => {
        // If any error happens return 400
        if (error) res.status(400).json({ error });
        // If no category found then return 404
        if (!category) res.status(404).json({ error: 'Category Not Found!' });
        // Return Category
        else res.status(200).json({ message: 'Category succesfully deleted!' });
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
      const { name } = req.body;

      const new_slug = name.replace(' ', '_').toLowerCase();

      Category.findOneAndUpdate({ slug }, { name, slug: new_slug }).exec((error, category) => {
        // If any error happens return 400
        if (error) res.status(400).json({ error });
        // If no category found then return 404
        if (!category) res.status(404).json({ error: 'Category not found!' });
        // Return success
        else res.status(201).json({ message: 'Category successfully updated!' });
      });
    } else {
      res.status(400).json({ error: 'Slug is required!' });
    }
  };
}

export default new CategoryController();
