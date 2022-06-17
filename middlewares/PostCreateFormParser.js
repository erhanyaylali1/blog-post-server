import formidable from 'formidable';
import fs from 'fs';
import mongoose from 'mongoose';

export const parse_form = (req, res, next) => {
  const form = new formidable.IncomingForm();
  form.keepExtension = true;
  form.parse(req, (error, fields, files) => {
    if (error) {
      console.log(error);
      res.status(400).json({ error });
    } else {
      const { title, content, tags, categories } = fields;
      req.body = {
        title,
        content,
        categories: categories?.split(',').map(mongoose.Types.ObjectId),
      };
      if (tags) req.body.tags = tags.split(',');
      if (files?.photo) req.body.photo = fs.readFileSync(files.photo.filepath);
      next();
    }
  });
};
