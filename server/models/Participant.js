import mongoose from 'mongoose';

const ParticipantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String },
  phone: { type: String },
  department: { type: String },
  ticketType: { type: String, enum: ['Regular','VIP','Student'], default: 'Regular' },
  category: { type: String, enum: ['Onsite','Online'], default: 'Onsite' },
  eventDateTime: { type: Date },
  token: { type: String, required: true, index: true, unique: true },
  attendedAt: { type: Date, default: null }
}, { timestamps: true });

export default mongoose.model('Participant', ParticipantSchema);
