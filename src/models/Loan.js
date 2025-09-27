import { Schema, model } from 'mongoose';

const loanSchema = new Schema({
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
  loanDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  dueDate: {
    type: Date,
    required: true
  },
  returnDate: {
    type: Date
  },
  status: {
    type: String,
    enum: ['active', 'returned', 'overdue'],
    default: 'active'
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

export default model('Loan', loanSchema);