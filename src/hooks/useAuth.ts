import { useState, useEffect } from 'react';
import { User } from '../types';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('veloraUser');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = (email: string, password: string): Promise<boolean> => {
    return new Promise((resolve) => {
      // Simulate API call
      setTimeout(() => {
        const mockUser: User = {
          id: '1',
          name: 'John Doe',
          email,
          phone: '+91 9876543210',
          address: {
            street: '123 Main Street',
            city: 'Mumbai',
            state: 'Maharashtra',
            zipCode: '400001',
            country: 'India'
          }
        };
        setUser(mockUser);
        localStorage.setItem('veloraUser', JSON.stringify(mockUser));
        resolve(true);
      }, 1000);
    });
  };

  const register = (userData: Omit<User, 'id'>): Promise<boolean> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newUser: User = {
          ...userData,
          id: Date.now().toString()
        };
        setUser(newUser);
        localStorage.setItem('veloraUser', JSON.stringify(newUser));
        resolve(true);
      }, 1000);
    });
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('veloraUser');
  };

  const updateProfile = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem('veloraUser', JSON.stringify(updatedUser));
    }
  };

  return {
    user,
    isLoading,
    login,
    register,
    logout,
    updateProfile
  };
};