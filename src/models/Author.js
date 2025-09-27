import { Schema, model } from 'mongoose';

const authorSchema = new Schema({
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  bio: {
    type: String,
    trim: true
  },
  birthDate: {
    type: Date
  }
}, {
  timestamps: true
});

export default model('Author', authorSchema);