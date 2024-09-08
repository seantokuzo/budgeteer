import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

interface UserAttrs {
  email: string;
  username: string;
  password: string;
}

export interface UserDoc extends mongoose.Document {
  email: string;
  username: string;
  password: string;
}

interface UserModel extends mongoose.Model<UserDoc> {
  build(attrs: UserAttrs): UserDoc;
}

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    username: {
      type: String,
      minLength: 4,
      maxLength: 25,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
      },
    },
  },
);

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;

  const salt = await bcrypt.genSalt(10);
  const hashedPass = await bcrypt.hash(this.password, salt);
  this.password = hashedPass;
});

userSchema.methods.comparePassword = async function (providedPassword: string) {
  return await bcrypt.compare(providedPassword, this.password);
};

userSchema.statics.build = (attrs: UserAttrs) => {
  return new User(attrs);
};

const User = mongoose.model<UserDoc, UserModel>('User', userSchema);

export { User };
