import { Schema, model } from 'mongoose';

const bookSchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  summary: {
    type: String,
    trim: true
  },
  isbn: {
    type: String,
    unique: true,
    sparse: true,
    trim: true
  },
  idAuthors: [{
    type: Schema.Types.ObjectId,
    ref: "Author",
    required: true
  }],
  tags: [{
    type: String,
    trim: true
  }],
  coverUrl: {
    type: String,
    trim: true
  },
  publishedDate: {
    type: Date
  },
  copiesAvailable: {
    type: Number,
    required: true,
    min: 0,
    default: 1
  },
  idCategories: [{
    type: Schema.Types.ObjectId,
    ref: "Category",
    required: true
  }]
}, {
  timestamps: true
});

export default model('Book', bookSchema);