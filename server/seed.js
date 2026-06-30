import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './db.js';
import { User, Report, Prescription, Chat, CommunityPost } from './models.js';

dotenv.config();

const seedData = async () => {
  try {
    await connectDB();

    // Clear existing collections
    await User.deleteMany();
    await Report.deleteMany();
    await Prescription.deleteMany();
    await Chat.deleteMany();
    await CommunityPost.deleteMany();

    console.log('Cleared existing database collections.');

    // 1. Insert Users
    const doctorData = {
      name: 'Dr. Sarah Jenkins',
      role: 'doctor',
      specialty: 'Cardiologist',
      avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=150'
    };

    const patientsData = [
      {
        name: 'John Doe',
        role: 'patient',
        age: 42,
        condition: 'Hypertension & Lipid Management',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150'
      },
      {
        name: 'Alice Smith',
        role: 'patient',
        age: 29,
        condition: 'Type 2 Diabetes',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150'
      },
      {
        name: 'Robert Johnson',
        role: 'patient',
        age: 61,
        condition: 'Post-Myocardial Infarction Recovery',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150'
      }
    ];

    const doctorDoc = await User.create(doctorData);
    const patientDocs = await User.insertMany(patientsData);

    console.log('Seeded Users (1 doctor, 3 patients)');

    // Map mock IDs to real MongoDB ObjectIds
    const userMap = {
      'doc_1': doctorDoc._id,
      'pat_1': patientDocs[0]._id,
      'pat_2': patientDocs[1]._id,
      'pat_3': patientDocs[2]._id
    };

    // 2. Insert Reports
    const reportsData = [
      {
        patientId: userMap['pat_1'],
        doctorId: userMap['doc_1'],
        title: 'Lipid Profile Panel',
        date: '2026-06-05',
        type: 'Blood Test',
        summary: 'Elevated LDL cholesterol. HDL and Triglycerides within normal limits.',
        status: 'warning',
        details: 'Detailed cholesterol breakdown:\n- Total Cholesterol: 245 mg/dL (High)\n- LDL: 160 mg/dL (High)\n- HDL: 52 mg/dL (Optimal)\n- Triglycerides: 165 mg/dL (Borderline High)\n\nRecommendation:\nInitiate low-fat diet, target 150 mins of moderate cardio per week, and re-test lipid profile in 90 days. Statin therapy may be discussed if LDL remains >140 mg/dL.'
      },
      {
        patientId: userMap['pat_2'],
        doctorId: userMap['doc_1'],
        title: 'HbA1c Glycemic Report',
        date: '2026-06-08',
        type: 'Blood Test',
        summary: 'HbA1c level is 7.2%. Indicated moderate glucose control range.',
        status: 'warning',
        details: 'HbA1c Profile:\n- A1C Level: 7.2% (Estimated Average Glucose: 160 mg/dL)\n- Fasting Blood Sugar: 126 mg/dL\n\nRecommendation:\nContinue Metformin regimen. Reduce carbohydrate intake. Monitor blood sugar daily (fasting and 2 hours post-meals).'
      },
      {
        patientId: userMap['pat_3'],
        doctorId: userMap['doc_1'],
        title: '12-Lead Electrocardiogram (ECG)',
        date: '2026-06-01',
        type: 'ECG Report',
        summary: 'Sinus rhythm, normal axis. Resolved ST-elevation with minor T-wave inversion.',
        status: 'normal',
        details: 'ECG Analysis:\n- Heart Rate: 68 bpm (Regular Sinus Rhythm)\n- PR Interval: 156ms\n- QRS Duration: 92ms\n- QT/QTc: 380/404ms\n\nObservations:\nNo acute ischemic changes. Consistent with stable post-recovery cardiac tissue. Continue beta-blockers and anti-platelets as directed.'
      }
    ];

    await Report.insertMany(reportsData);
    console.log('Seeded Reports');

    // 3. Insert Prescriptions
    const prescriptionsData = [
      {
        patientId: userMap['pat_1'],
        doctorId: userMap['doc_1'],
        medicineName: 'Atorvastatin',
        dosage: '20mg',
        frequency: 'Once daily (at bedtime)',
        duration: '90 days',
        startDate: '2026-06-05',
        instructions: 'Avoid eating grapefruit or drinking grapefruit juice while on this medication.',
        takenDates: ['2026-06-08', '2026-06-09', '2026-06-10']
      },
      {
        patientId: userMap['pat_1'],
        doctorId: userMap['doc_1'],
        medicineName: 'Lisinopril',
        dosage: '10mg',
        frequency: 'Once daily (in the morning)',
        duration: '180 days',
        startDate: '2026-06-05',
        instructions: 'Monitor blood pressure. Take consistently at the same time.',
        takenDates: ['2026-06-09', '2026-06-10']
      },
      {
        patientId: userMap['pat_2'],
        doctorId: userMap['doc_1'],
        medicineName: 'Metformin HCl',
        dosage: '500mg',
        frequency: 'Twice daily (with breakfast & dinner)',
        duration: '90 days',
        startDate: '2026-06-08',
        instructions: 'Take with food to minimize gastrointestinal discomfort.',
        takenDates: ['2026-06-08', '2026-06-09', '2026-06-10']
      },
      {
        patientId: userMap['pat_3'],
        doctorId: userMap['doc_1'],
        medicineName: 'Carvedilol',
        dosage: '6.25mg',
        frequency: 'Twice daily',
        duration: '120 days',
        startDate: '2026-06-01',
        instructions: 'Do not abruptly stop taking. Monitor pulse rate.',
        takenDates: ['2026-06-09', '2026-06-10']
      }
    ];

    await Prescription.insertMany(prescriptionsData);
    console.log('Seeded Prescriptions');

    // 4. Insert Chats
    const chatsData = [
      {
        senderId: userMap['pat_1'],
        receiverId: userMap['doc_1'],
        text: 'Hello Dr. Jenkins, I reviewed my cholesterol report. Should I start taking the atorvastatin immediately?',
        timestamp: new Date('2026-06-06T10:15:00Z')
      },
      {
        senderId: userMap['doc_1'],
        receiverId: userMap['pat_1'],
        text: 'Yes, John. Please start taking it tonight at bedtime. Let me know if you experience any muscle aches.',
        timestamp: new Date('2026-06-06T11:02:00Z')
      },
      {
        senderId: userMap['pat_1'],
        receiverId: userMap['doc_1'],
        text: 'Understood. I have logged taking it for the last 3 days and feel fine so far.',
        timestamp: new Date('2026-06-10T14:30:00Z')
      }
    ];

    await Chat.insertMany(chatsData);
    console.log('Seeded Chats');

    // 5. Insert Community Posts
    const communityPostsData = [
      {
        authorId: userMap['pat_1'],
        authorName: 'John Doe',
        authorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150',
        title: 'Tips for reducing sodium in meals?',
        content: 'Hey everyone, I was recently diagnosed with hypertension. Finding it really hard to eat out or even buy groceries without sodium overloading. Does anyone have good seasoning recommendations that do not use salt?',
        category: 'Nutrition',
        likes: [userMap['pat_2']],
        comments: [
          {
            authorName: 'Alice Smith',
            authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
            text: 'Try garlic powder, lemon juice, and smoked paprika! Garlic and acidity from lemons makes a huge difference in mimicking saltiness.',
            timestamp: new Date('2026-06-09T08:45:00Z')
          },
          {
            authorName: 'Robert Johnson',
            authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150',
            text: 'Mrs. Dash is a great store-bought salt-free seasoning. I use their Garlic & Herb blend on everything.',
            timestamp: new Date('2026-06-09T09:12:00Z')
          }
        ],
        timestamp: new Date('2026-06-09T08:30:00Z')
      },
      {
        authorId: userMap['pat_2'],
        authorName: 'Alice Smith',
        authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
        title: 'Staying positive with daily insulin/med monitoring',
        content: 'It gets exhausting checking blood sugar multiple times a day. Some days I just want to forget it all. Sending love to anyone else feeling burnout. We got this!',
        category: 'Mental Health',
        likes: [userMap['pat_1'], userMap['pat_3']],
        comments: [
          {
            authorName: 'John Doe',
            authorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150',
            text: 'Stay strong Alice! The exhaustion is very real, but taking care of ourselves is the ultimate goal. Celebrate the small victories.',
            timestamp: new Date('2026-06-10T10:02:00Z')
          }
        ],
        timestamp: new Date('2026-06-10T09:00:00Z')
      }
    ];

    await CommunityPost.insertMany(communityPostsData);
    console.log('Seeded Community Posts');

    console.log('Database seeding successfully finished!');
    await mongoose.connection.close();
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

// If run directly
if (import.meta.url === `file://${process.argv[1]}`.replace(/\\/g, '/')) {
  seedData();
}

export default seedData;
