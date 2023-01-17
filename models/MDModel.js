import { Schema, model, models } from 'mongoose';

const lens2timeUser = new Schema({
  name: {
    type:String,
    required:true,
    unique:true
  },
  data: {
    type: String,
    required: true,
    unique: true,
  },
});

const User = models.User || model('User', lens2timeUser);

export default User;