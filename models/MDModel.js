import { Schema, model, models } from 'mongoose';

const lens2timeUser = new Schema({
  name: {
    type:String,
    required:true,
    unique:true
  },
  avatarUrl:{
    type: String,
    required: false,
    unique: false,
  },
  data: {
    type: String,
    required: false,
    unique: false,
  },
});

const User = models.User || model('User', lens2timeUser);

export default User;