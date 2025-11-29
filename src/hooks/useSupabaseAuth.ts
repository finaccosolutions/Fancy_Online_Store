// src/hooks/useSupabaseAuth.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, supabaseUrl, supabaseAnonKey } from '../lib/supabase';

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  // REMOVE: is_admin: boolean;
}

export const useSupabaseAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    console.log('useSupabaseAuth: User state changed:', user);
    console.log('useSupabaseAuth: UserProfile state changed:', userProfile);
    console.log('useSupabaseAuth: isAdmin state changed:', isAdmin); // Log isAdmin
  }, [user, userProfile, isAdmin]); // Add isAdmin to dependencies

  // Internal helper function to fetch user profile
  const _fetchUserProfile = async (authUser: User, currentSession: Session | null): Promise<UserProfile | null> => {
    console.log('_fetchUserProfile: Attempting to fetch profile for userId:', authUser.id);
    try {
      console.log('_fetchUserProfile: Before Supabase query for profile. authUser:', authUser);

      const profileEndpoint = `${supabaseUrl}/rest/v1/users?id=eq.${authUser.id}&select=*`;
      console.log('_fetchUserProfile: Attempting raw fetch to:', profileEndpoint);

      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        'apikey': supabaseAnonKey,
      };

      if (currentSession?.access_token) {
        headers['Authorization'] = `Bearer ${currentSession.access_token}`;
        console.log('_fetchUserProfile: Using access token (first 5 chars):', currentSession.access_token.substring(0, 5) + '...');
      } else {
        console.log('_fetchUserProfile: No session access token for profile fetch.');
      }

      const response = await Promise.race([
        fetch(profileEndpoint, {
          method: 'GET',
          headers: headers,
        }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Profile raw fetch timed out after 5 seconds')), 5000)
        )
      ]);

      if (!response.ok) {
        const errorText = await response.text();
        if (response.status === 406) {
          console.warn('_fetchUserProfile: No user profile found in public.users via direct fetch (406). Attempting to create one.');
        } else {
          throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
        }
      }

      let data = null;
      if (response.ok) {
        const responseData = await response.json();
        data = responseData.length > 0 ? responseData[0] : null;
      }

      if (!data) {
        console.warn('_fetchUserProfile: No user profile found in public.users. Attempting to create one.');
        console.log('_fetchUserProfile: authUser.user_metadata:', authUser.user_metadata);

        const { data: newProfile, error: insertError } = await supabase
          .from('users')
          .insert({
            id: authUser.id,
            email: authUser.email!,
            full_name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'New User',
            phone: authUser.user_metadata?.phone || null,
            // REMOVE: is_admin: false,
          })
          .select()
          .single();

        if (insertError) {
          console.error('_fetchUserProfile: Error creating new user profile:', JSON.stringify(insertError, null, 2));
          console.log('_fetchUserProfile: Returning null due to insert error.');
          return null;
        } else {
          console.log('_fetchUserProfile: New user profile created successfully. Returning:', newProfile);
          console.log('_fetchUserProfile: Returning newProfile after successful insert.');
          return newProfile;
        }
      } else {
        console.log('_fetchUserProfile: User profile fetched successfully. Returning:', data);
        console.log('_fetchUserProfile: Returning fetched data.');
        return data;
      }
    } catch (outerError: any) {
      console.error('_fetchUserProfile: Caught unexpected exception in outer catch block:', JSON.stringify(outerError, Object.getOwnPropertyNames(outerError), 2));
      console.log('_fetchUserProfile: Returning null due to outer exception.');
      return null;
    }
  };

  // NEW: Function to check if user is an admin
  const checkAdminStatus = async (userId: string, currentSession: Session | null) => {
    console.log('checkAdminStatus: Checking admin status for userId:', userId);
    try {
      const adminCheckEndpoint = `${supabaseUrl}/rest/v1/admin_users?user_id=eq.${userId}&select=id`;
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        'apikey': supabaseAnonKey,
      };
      if (currentSession?.access_token) {
        headers['Authorization'] = `Bearer ${currentSession.access_token}`;
      }

      const response = await Promise.race([
        fetch(adminCheckEndpoint, {
          method: 'GET',
          headers: headers,
        }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Admin check timed out after 5 seconds')), 5000)
        )
      ]);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
      }

      const data = await response.json();
      const isUserAdmin = data && data.length > 0;
      console.log('checkAdminStatus: User is admin:', isUserAdmin);
      setIsAdmin(isUserAdmin);
    } catch (error) {
      console.error('checkAdminStatus: Error checking admin status:', error);
      setIsAdmin(false); // Default to false on error
    }
  };

  const handleAuth = async (currentSession: Session | null, eventType: string = 'INITIAL_LOAD') => {
    console.log(`handleAuth: Event Type: ${eventType}, Session received:`, currentSession);
    setLoading(true);
    setSession(currentSession);
    setUser(currentSession?.user ?? null);
    console.log(`handleAuth: User set to:`, currentSession?.user ?? null);

    let profile: UserProfile | null = null;
    if (currentSession?.user) {
      console.log('handleAuth: User present, proceeding to fetch profile.');
      profile = await _fetchUserProfile(currentSession.user, currentSession);
      if (profile) {
        await checkAdminStatus(currentSession.user.id, currentSession); // Check admin status after profile is fetched
      } else {
        setIsAdmin(false); // Clear admin status if profile fetch fails
      }
    } else {
      console.log('handleAuth: No user session found, clearing profile and admin status.');
      setIsAdmin(false); // Clear admin status if no user
    }
    setUserProfile(profile);

    setLoading(false);
    console.log('handleAuth: Auth process completed. Loading set to false.');
    console.log('handleAuth: Final user state (from currentSession):', currentSession?.user ?? null);
    console.log('handleAuth: Final userProfile state (from local variable):', profile);
    console.log('handleAuth: Final isAdmin state:', isAdmin); // Log final isAdmin state
    console.log('handleAuth: After setLoading(false) - Current user state:', user, 'Current userProfile state:', userProfile);
  };

  useEffect(() => {
    console.log('Auth useEffect: Initializing Supabase auth listener...');
    const setupAuth = async () => {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        console.log('Auth useEffect: getSession result (initial load):', initialSession);
        await handleAuth(initialSession, 'INITIAL_GET_SESSION');
      } catch (error) {
        console.error('Auth useEffect: Error during initial session check:', error);
        await handleAuth(null, 'INITIAL_GET_SESSION_ERROR');
      }
    };

    setupAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth State Change Listener: Event:', event, 'Session:', session);
    
        // Only handle specific events, ignore TOKEN_REFRESHED to prevent unnecessary reloads
        if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'USER_UPDATED') {
          (async () => {
            await handleAuth(session, event);
          })();
        } else if (event === 'TOKEN_REFRESHED') {
          // Do nothing - don't even update session state to prevent cascading re-renders
          console.log('Auth State Change: Token refreshed - ignoring to prevent page reload');
        }
      }
    );



    return () => {
      console.log('Auth useEffect: Cleaning up auth subscription.');
      subscription.unsubscribe();
    };
  }, []);


  const signUp = async (email: string, password: string, fullName: string, phone?: string) => {
    try {
      console.log('signUp: Attempting to sign up user:', email);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            phone: phone || null,
          }
        }
      });

      console.log('signUp: Supabase signUp result - Data:', data, 'Error:', error);

      if (error) {
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error: any) {
      console.error('signUp: Caught unexpected error during sign up:', error);
      return { data: null, error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log('signIn: Attempting to sign in user:', email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      console.log('signIn: Supabase signIn result - Data:', data, 'Error:', error);
      return { data, error };
    } catch (error: any) {
      console.error('signIn: Caught unexpected error during sign in:', error);
      return { data: null, error };
    }
  };

  const signOut = async () => {
    let signOutError = null;
    try {
      console.log('signOut: Attempting to sign out user from Supabase.');
      console.log('signOut: ABOUT TO EXECUTE SUPABASE AUTH SIGN OUT.');

      setUser(null);
      setSession(null);
      setUserProfile(null);
      setLoading(false);
      setIsAdmin(false); // Clear isAdmin status on logout

      const { error } = await supabase.auth.signOut();

      console.log('signOut: Result of supabase.auth.signOut() - Error:', error);
      if (error) {
        console.error('signOut: Error during sign out:', error);
        console.error('signOut: Error details:', JSON.stringify(error, null, 2));
        signOutError = error;
      } else {
        console.log('signOut: User signed out successfully from Supabase.');
      }
    } catch (error: any) {
      console.error('signOut: Caught unexpected error during sign out:', error.message);
      console.error('signOut: Caught unexpected error details:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
      signOutError = error;
    }
    return { error: signOutError };
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) {
      console.error('updateProfile: No user logged in to update profile.');
      return { error: new Error('No user logged in') };
    }

    try {
      console.log('updateProfile: Attempting to update profile for user:', user.id, updates);
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;
      console.log('updateProfile: Profile updated successfully:', data);
      setUserProfile(data);
      return { data, error: null };
    } catch (error: any) {
      console.error('updateProfile: Error during profile update:', error);
      return { data: null, error };
    }
  };

  return {
    user,
    userProfile,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
    isAdmin,
  };
};
