import mongooes from 'mongoose';

const likeSchema = new mongooes.Schema({
  user_id: {
    type: mongooes.Schema.Types.ObjectId,
    ref: 'User',
  },
});

const commentSchema = new mongooes.Schema(
  {
    user_id: {
      type: mongooes.Schema.Types.ObjectId,
      ref: 'User',
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

const postSchema = new mongooes.Schema({
  title: {
    type: String,
    trim: true,
    required: true,
    min: 3,
    index: true,
  },
  content: {
    type: {},
    required: true,
  },
  user_id: {
    type: mongooes.Schema.Types.ObjectId,
    ref: 'User',
  },
  categories: [
    {
      type: mongooes.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
  ],
  tags: [
    {
      type: mongooes.Schema.Types.ObjectId,
      ref: 'Tag',
    },
  ],
  likes: [likeSchema],
  comments: [commentSchema],
  photo: {
    type: Buffer,
  },
  view: {
    type: Number,
    default: 0,
  },
});
postSchema.set('timestamps', true);

export default mongooes.model('Post', postSchema);
