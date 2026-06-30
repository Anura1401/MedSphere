import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './db.js';
import { User, Report, Prescription, Chat, CommunityPost } from './models.js';
import seedData from './seed.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Helper to map Mongoose _id to virtual id for frontend compatibility
function formatDoc(doc) {
  if (!doc) return doc;
  if (Array.isArray(doc)) return doc.map(formatDoc);
  
  const obj = doc.toObject ? doc.toObject({ virtuals: true }) : doc;
  
  if (obj._id) {
    obj.id = obj._id.toString();
  }
  
  // Recursively map comments
  if (obj.comments && Array.isArray(obj.comments)) {
    obj.comments = obj.comments.map(c => {
      const commentObj = c.toObject ? c.toObject({ virtuals: true }) : c;
      if (commentObj._id) {
        commentObj.id = commentObj._id.toString();
      }
      return commentObj;
    });
  }
  
  return obj;
}

// Connect to Database and Auto-seed if empty
const initializeApp = async () => {
  await connectDB();
  
  const userCount = await User.countDocuments();
  if (userCount === 0) {
    console.log('Database is empty. Running auto-seeding...');
    await seedData();
  }
};

initializeApp();

// --- API Routes ---

// USERS
// GET /api/users - Get all users
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find();
    res.json(formatDoc(users));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/users - Create new user
app.post('/api/users', async (req, res) => {
  try {
    const newUser = new User(req.body);
    const savedUser = await newUser.save();
    res.status(201).json(formatDoc(savedUser));
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// REPORTS
// GET /api/reports - Get all reports
app.get('/api/reports', async (req, res) => {
  try {
    const reports = await Report.find();
    res.json(formatDoc(reports));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/reports - Create new report
app.post('/api/reports', async (req, res) => {
  try {
    const newReport = new Report(req.body);
    const savedReport = await newReport.save();
    res.status(201).json(formatDoc(savedReport));
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// PRESCRIPTIONS
// GET /api/prescriptions - Get all prescriptions
app.get('/api/prescriptions', async (req, res) => {
  try {
    const prescriptions = await Prescription.find();
    res.json(formatDoc(prescriptions));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/prescriptions - Create new prescription
app.post('/api/prescriptions', async (req, res) => {
  try {
    const newRx = new Prescription(req.body);
    const savedRx = await newRx.save();
    res.status(201).json(formatDoc(savedRx));
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE /api/prescriptions/:id - Delete a prescription
app.delete('/api/prescriptions/:id', async (req, res) => {
  try {
    const deletedRx = await Prescription.findByIdAndDelete(req.params.id);
    if (!deletedRx) {
      return res.status(404).json({ message: 'Prescription not found' });
    }
    res.json({ message: 'Prescription deleted successfully', id: req.params.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH /api/prescriptions/:id/toggle - Toggle medication intake log for a specific date
app.patch('/api/prescriptions/:id/toggle', async (req, res) => {
  try {
    const { dateStr } = req.body;
    const rx = await Prescription.findById(req.params.id);
    if (!rx) {
      return res.status(404).json({ message: 'Prescription not found' });
    }
    
    const index = rx.takenDates.indexOf(dateStr);
    if (index > -1) {
      rx.takenDates.splice(index, 1);
    } else {
      rx.takenDates.push(dateStr);
    }
    
    await rx.save();
    res.json(formatDoc(rx));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// CHATS
// GET /api/chats - Get all chats
app.get('/api/chats', async (req, res) => {
  try {
    const chats = await Chat.find().sort({ timestamp: 1 });
    res.json(formatDoc(chats));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/chats - Send a message and handle mock doctor auto-reply
app.post('/api/chats', async (req, res) => {
  try {
    const { senderId, receiverId, text } = req.body;
    const newChat = new Chat({ senderId, receiverId, text });
    const savedChat = await newChat.save();
    
    // Broadcast message response immediately
    res.status(201).json(formatDoc(savedChat));

    // Simple Auto-responder for Doctor:
    // If the receiver is a doctor, trigger a delayed doctor response
    const receiver = await User.findById(receiverId);
    if (receiver && receiver.role === 'doctor') {
      setTimeout(async () => {
        try {
          const docResponses = [
            "Thank you for the update. I've reviewed your latest reports and everything looks consistent. Let me know if you experience any side effects.",
            "I suggest keeping a log of your symptoms for the next week. If it doesn't improve, let's schedule an appointment.",
            "Be sure to take your prescriptions regularly. Consistent dosing is very important for this plan.",
            "I will review this in detail before our next consultation. In the meantime, try to follow the active diet and exercise recommendations."
          ];
          const randomResponse = docResponses[Math.floor(Math.random() * docResponses.length)];
          const docReply = new Chat({
            senderId: receiverId, // doctor
            receiverId: senderId, // patient
            text: randomResponse
          });
          await docReply.save();
          console.log(`Auto-response sent from doctor (${receiverId}) to patient (${senderId}).`);
        } catch (err) {
          console.error('Error sending doctor auto-reply:', err);
        }
      }, 1500);
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// COMMUNITY POSTS
// GET /api/posts - Get all community posts
app.get('/api/posts', async (req, res) => {
  try {
    const posts = await CommunityPost.find().sort({ timestamp: -1 });
    res.json(formatDoc(posts));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/posts - Create new post
app.post('/api/posts', async (req, res) => {
  try {
    const newPost = new CommunityPost(req.body);
    const savedPost = await newPost.save();
    res.status(201).json(formatDoc(savedPost));
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// POST /api/posts/:id/comments - Add comment to post
app.post('/api/posts/:id/comments', async (req, res) => {
  try {
    const { authorName, authorAvatar, text } = req.body;
    const post = await CommunityPost.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    post.comments.push({ authorName, authorAvatar, text });
    await post.save();
    res.json(formatDoc(post));
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// PATCH /api/posts/:id/like - Toggle like on post
app.patch('/api/posts/:id/like', async (req, res) => {
  try {
    const { userId } = req.body;
    const post = await CommunityPost.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    const hasLiked = post.likes.some(id => id.toString() === userId);
    if (hasLiked) {
      post.likes = post.likes.filter(id => id.toString() !== userId);
    } else {
      post.likes.push(userId);
    }
    
    await post.save();
    res.json(formatDoc(post));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
