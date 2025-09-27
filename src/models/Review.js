import { Schema, model } from 'mongoose';

const reviewSchema = new Schema({
  idClient: {
    type: Schema.Types.ObjectId,
    ref: "Client",
    required: true
  },
  idBook: {
    type: Schema.Types.ObjectId,
    ref: "Book",
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Índice para evitar reviews duplicadas 
reviewSchema.index({ idClient: 1, idBook: 1 }, { unique: true });

export default model('Review', reviewSchema);