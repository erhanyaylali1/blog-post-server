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

  get = async (req, res) => {
    const { slug } = req.params;
    // Check if slug exist
    if (slug) {
      // Find Tag by Slug
      Tag.findOne({ slug }).exec((error, tag) => {
        // If any error happens return 400
        if (error) res.status(400).json({ error });
        // If no tag found then return 404
        if (!tag) res.status(404).json({ error: 'Tag Not Found!' });
        // Return success
        else res.status(200).json({ tag });
      });
    } else {
      res.status(400).json({ error: 'Slug is required!' });
    }
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
