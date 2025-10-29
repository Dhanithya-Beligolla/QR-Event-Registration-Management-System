import mongoose from 'mongoose';

const AttendanceSchema = new mongoose.Schema({
  participantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Participant', required: true },
  token: { type: String, index: true, required: true },
  time: { type: Date, default: Date.now }
}, { timestamps: true });

AttendanceSchema.index({ token: 1, time: -1 });

export default mongoose.model('Attendance', AttendanceSchema);
