import formidable from 'formidable';
import fs from 'fs';

export const parse_form = (req, res, next) => {
  const form = new formidable.IncomingForm();
  form.keepExtension = true;
  form.parse(req, (error, fields, files) => {
    if (error) {
      res.status(400).json({ error });
    } else {
      const { about, domain, country, job, birthday } = fields;
      req.body = {
        about,
        domain,
        country,
        job,
        birthday,
      };

      if (files?.photo) req.body.photo = fs.readFileSync(files.photo.filepath);
      next();
    }
  });
};
