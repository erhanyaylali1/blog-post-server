import mongooes from 'mongoose';

const tagSchema = new mongooes.Schema({
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
  color: {
    type: String,
    default: '#000',
  },
});
tagSchema.set('timestamps', true);

export default mongooes.models.Tag || mongooes.model('Tag', tagSchema);
