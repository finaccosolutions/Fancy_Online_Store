// src/context/AuthContext.tsx
import React, { createContext, useContext } from 'react';
import { useSupabaseAuth } from '../hooks/useSupabaseAuth';

// Define the shape of your authentication context
interface AuthContextType {
  user: ReturnType<typeof useSupabaseAuth>['user'];
  userProfile: ReturnType<typeof useSupabaseAuth>['userProfile'];
  session: ReturnType<typeof useSupabaseAuth>['session'];
  loading: ReturnType<typeof useSupabaseAuth>['loading'];
  signUp: ReturnType<typeof useSupabaseAuth>['signUp'];
  signIn: ReturnType<typeof useSupabaseAuth>['signIn'];
  signOut: ReturnType<typeof useSupabaseAuth>['signOut'];
  updateProfile: ReturnType<typeof useSupabaseAuth>['updateProfile'];
  isAdmin: ReturnType<typeof useSupabaseAuth>['isAdmin'];
}

// Create the context with a default undefined value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// AuthProvider component to wrap your application
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const auth = useSupabaseAuth(); // Call the original hook here

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to consume the AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
