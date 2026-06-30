import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  role: { type: String, enum: ['doctor', 'patient'], required: true },
  specialty: { type: String }, // doctor specific
  age: { type: Number },       // patient specific
  condition: { type: String }, // patient specific
  avatar: { type: String }
});

const reportSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  date: { type: String, required: true },
  type: { type: String, required: true },
  summary: { type: String },
  status: { type: String, enum: ['normal', 'warning', 'critical'], default: 'normal' },
  details: { type: String }
});

const prescriptionSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  medicineName: { type: String, required: true },
  dosage: { type: String, required: true },
  frequency: { type: String, required: true },
  duration: { type: String, required: true },
  startDate: { type: String, required: true },
  instructions: { type: String },
  takenDates: [{ type: String }] // Format: YYYY-MM-DD
});

const chatSchema = new mongoose.Schema({
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

const commentSchema = new mongoose.Schema({
  authorName: { type: String, required: true },
  authorAvatar: { type: String },
  text: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

const communityPostSchema = new mongoose.Schema({
  authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  authorName: { type: String, required: true },
  authorAvatar: { type: String },
  title: { type: String, required: true },
  content: { type: String, required: true },
  category: { type: String, required: true },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  comments: [commentSchema],
  timestamp: { type: Date, default: Date.now }
});

export const User = mongoose.model('User', userSchema);
export const Report = mongoose.model('Report', reportSchema);
export const Prescription = mongoose.model('Prescription', prescriptionSchema);
export const Chat = mongoose.model('Chat', chatSchema);
export const CommunityPost = mongoose.model('CommunityPost', communityPostSchema);
