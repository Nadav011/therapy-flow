import React, { createContext, useContext, useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [currentTherapist, setCurrentTherapist] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserAndTherapist = async () => {
      try {
        const user = await base44.auth.me();
        setCurrentUser(user);
        
        if (user?.email) {
          const therapists = await base44.entities.Therapist.filter({ email: user.email });
          if (therapists.length > 0) {
            setCurrentTherapist(therapists[0]);
          }
        }
      } catch (error) {
        console.error("Auth error:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserAndTherapist();
  }, []);

  const updateTherapist = (therapist) => {
    setCurrentTherapist(therapist);
  };

  return (
    <AuthContext.Provider value={{ currentUser, currentTherapist, isLoading, updateTherapist }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};