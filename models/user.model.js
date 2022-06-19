import mongooes from 'mongoose';
import crypto from 'crypto';

const userSchema = new mongooes.Schema(
  {
    username: {
      type: String,
      trim: true,
      required: true,
      unique: true,
      index: true,
      lowercase: true,
    },
    full_name: {
      type: String,
      trim: true,
      required: true,
    },
    email: {
      type: String,
      trim: true,
      required: true,
      unique: true,
    },
    profile: {
      type: String,
      required: true,
    },
    hashed_password: {
      type: String,
      required: true,
    },
    salt: String,
    about: String,
    role: {
      type: Number,
      trim: true,
    },
    photo: {
      type: Buffer,
    },
    reset_password_link: {
      type: String,
      default: '',
    },
    about: {
      type: String,
    },
    country: {
      type: String,
    },
    domain: {
      type: String,
    },
    job: {
      type: String,
    },
    birthday: {
      type: String,
    },
  },
  { timestamp: true }
);
userSchema.set('timestamps', true);

userSchema
  .virtual('password')
  .set(function (password) {
    this._password = password;
    this.salt = this.makeSalt();
    this.hashed_password = this.encrpytPassword(password);
  })
  .get(function () {
    return this._password;
  });

userSchema.methods = {
  authenticate: function (input_password) {
    return this.encrpytPassword(input_password) === this.hashed_password;
  },
  encrpytPassword: function (password) {
    if (!password) return '';
    try {
      return crypto.createHmac('sha1', this.salt).update(password).digest('hex');
    } catch (err) {
      return '';
    }
  },
  makeSalt: function () {
    return Math.round(new Date().valueOf() * Math.random()) + '';
  },
};

export default mongooes.models.User || mongooes.model('User', userSchema);
