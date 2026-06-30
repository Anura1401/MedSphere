import React, { createContext, useState, useEffect } from 'react';

export const AppContext = createContext();

const MOCK_DOCTOR = {
  id: 'doc_1',
  name: 'Dr. Sarah Jenkins',
  role: 'doctor',
  specialty: 'Cardiologist',
  avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=150'
};

const MOCK_PATIENTS = [
  {
    id: 'pat_1',
    name: 'John Doe',
    role: 'patient',
    age: 42,
    condition: 'Hypertension & Lipid Management',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150'
  },
  {
    id: 'pat_2',
    name: 'Alice Smith',
    role: 'patient',
    age: 29,
    condition: 'Type 2 Diabetes',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150'
  },
  {
    id: 'pat_3',
    name: 'Robert Johnson',
    role: 'patient',
    age: 61,
    condition: 'Post-Myocardial Infarction Recovery',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150'
  }
];

export const AppProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('med_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [patients, setPatients] = useState(MOCK_PATIENTS);
  const [doctorUser, setDoctorUser] = useState(MOCK_DOCTOR);
  const [reports, setReports] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [chats, setChats] = useState([]);
  const [communityPosts, setCommunityPosts] = useState([]);

  // Fetch initial data from Express API
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const usersRes = await fetch('/api/users');
        const users = await usersRes.json();
        
        const patientsList = users.filter(u => u.role === 'patient');
        const doc = users.find(u => u.role === 'doctor');
        
        if (patientsList.length > 0) setPatients(patientsList);
        if (doc) setDoctorUser(doc);
        
        // Align local storage user with MongoDB IDs to avoid stale ID reference mismatches
        const saved = localStorage.getItem('med_user');
        if (saved) {
          const parsedSaved = JSON.parse(saved);
          const matchedUser = users.find(u => u.name === parsedSaved.name && u.role === parsedSaved.role);
          if (matchedUser) {
            setCurrentUser(matchedUser);
          } else {
            setCurrentUser(null);
          }
        }

        const reportsRes = await fetch('/api/reports');
        setReports(await reportsRes.json());

        const rxRes = await fetch('/api/prescriptions');
        setPrescriptions(await rxRes.json());

        const chatsRes = await fetch('/api/chats');
        setChats(await chatsRes.json());

        const postsRes = await fetch('/api/posts');
        setCommunityPosts(await postsRes.json());
      } catch (error) {
        console.error('Error loading initial data from API:', error);
      }
    };
    
    loadInitialData();
  }, []);

  // Poll database for updates every 3 seconds to keep chat & community live
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const chatsRes = await fetch('/api/chats');
        const chatsData = await chatsRes.json();
        setChats(chatsData);

        const postsRes = await fetch('/api/posts');
        const postsData = await postsRes.json();
        setCommunityPosts(postsData);
      } catch (error) {
        console.error('Error polling chats/posts:', error);
      }
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Sync currentUser changes to localStorage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('med_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('med_user');
    }
  }, [currentUser]);

  // Actions
  const switchUser = (user) => {
    setCurrentUser(user);
  };

  const addPatient = async (patientData) => {
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: 'patient',
          ...patientData
        })
      });
      const newPatient = await response.json();
      setPatients((prev) => [...prev, newPatient]);
      return newPatient;
    } catch (error) {
      console.error('Error adding patient:', error);
    }
  };

  const addReport = async (reportData) => {
    try {
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doctorId: doctorUser.id,
          date: new Date().toISOString().split('T')[0],
          ...reportData
        })
      });
      const newReport = await response.json();
      setReports((prev) => [newReport, ...prev]);
      return newReport;
    } catch (error) {
      console.error('Error adding report:', error);
    }
  };

  const addPrescription = async (prescriptionData) => {
    try {
      const response = await fetch('/api/prescriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doctorId: doctorUser.id,
          startDate: new Date().toISOString().split('T')[0],
          takenDates: [],
          ...prescriptionData
        })
      });
      const newRx = await response.json();
      setPrescriptions((prev) => [newRx, ...prev]);
      return newRx;
    } catch (error) {
      console.error('Error adding prescription:', error);
    }
  };

  const deletePrescription = async (prescriptionId) => {
    try {
      await fetch(`/api/prescriptions/${prescriptionId}`, {
        method: 'DELETE'
      });
      setPrescriptions((prev) => prev.filter((rx) => rx.id !== prescriptionId));
    } catch (error) {
      console.error('Error deleting prescription:', error);
    }
  };

  const sendMessage = async (senderId, receiverId, text) => {
    try {
      const response = await fetch('/api/chats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ senderId, receiverId, text })
      });
      const newChat = await response.json();
      setChats((prev) => [...prev, newChat]);

      // If sending to a doctor, trigger fetch sync for the auto-response after 1.8 seconds
      const receiver = patients.find(p => p.id === receiverId) || (doctorUser.id === receiverId ? doctorUser : null);
      if (receiver && receiver.role === 'doctor') {
        setTimeout(async () => {
          const res = await fetch('/api/chats');
          const data = await res.json();
          setChats(data);
        }, 1800);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const addCommunityPost = async (postData) => {
    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          authorId: currentUser.id,
          authorName: currentUser.name,
          authorAvatar: currentUser.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150',
          likes: [],
          comments: [],
          ...postData
        })
      });
      const newPost = await response.json();
      setCommunityPosts((prev) => [newPost, ...prev]);
    } catch (error) {
      console.error('Error adding post:', error);
    }
  };

  const addComment = async (postId, text) => {
    try {
      const response = await fetch(`/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          authorName: currentUser.name,
          authorAvatar: currentUser.avatar,
          text
        })
      });
      const updatedPost = await response.json();
      setCommunityPosts((prev) =>
        prev.map((post) => (post.id === postId ? updatedPost : post))
      );
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const toggleLikePost = async (postId) => {
    try {
      const response = await fetch(`/api/posts/${postId}/like`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id })
      });
      const updatedPost = await response.json();
      setCommunityPosts((prev) =>
        prev.map((post) => (post.id === postId ? updatedPost : post))
      );
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const togglePrescriptionTracker = async (prescriptionId, dateStr) => {
    try {
      const response = await fetch(`/api/prescriptions/${prescriptionId}/toggle`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dateStr })
      });
      const updatedRx = await response.json();
      setPrescriptions((prev) =>
        prev.map((rx) => (rx.id === prescriptionId ? updatedRx : rx))
      );
    } catch (error) {
      console.error('Error toggling prescription:', error);
    }
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        doctorUser,
        patients,
        reports,
        prescriptions,
        chats,
        communityPosts,
        switchUser,
        addPatient,
        addReport,
        addPrescription,
        deletePrescription,
        sendMessage,
        addCommunityPost,
        addComment,
        toggleLikePost,
        togglePrescriptionTracker
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
