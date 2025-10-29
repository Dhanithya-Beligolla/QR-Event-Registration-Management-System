import Attendance from '../models/Attendance.js';
export const attendanceService = {
  async record({ participantId, token }){ return Attendance.create({ participantId, token, time: new Date() }); },
  async list({ page=1, limit=20 }){
    const [items, total] = await Promise.all([
      Attendance.find().populate('participantId').sort({ time: -1 }).skip((page-1)*limit).limit(limit),
      Attendance.countDocuments()
    ]);
    return { items, total, page, pages: Math.ceil(total/limit) };
  }
};
