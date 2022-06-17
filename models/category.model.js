import mongooes from 'mongoose';

const categorySchema = new mongooes.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  slug: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    index: true,
  },
});
categorySchema.set('timestamps', true);

export default mongooes.model('Category', categorySchema);
