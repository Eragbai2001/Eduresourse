"use client";
import React, { createContext, useState, useEffect, useContext } from "react";
import { supabase } from "@/lib/supabase";
import { Session, User } from "@supabase/supabase-js";

type AuthContextType = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        console.error("Error getting session:", error);
      }

      if (session?.user) {
        // Get the latest user data to ensure we have the most recent metadata
        const {
          data: { user },
        } = await supabase.auth.getUser();
        console.log("Full user data:", user);

        // Check for full_name in user metadata for email signup users
        if (user && !user.user_metadata.full_name && user.email) {
          console.log("Email user without full_name detected, handling...");
          // Extract a name from email as fallback
      
         

          // We don't need to set an avatar_url anymore since we're using initials in the Header component
          console.log(
            "User without full_name detected, will use initials in Header"
          );
        }

        // Ensure we have consistent user data before updating state
        const finalUser = user || session?.user || null;

        // The Header component will check for avatar_url and if not present,
        // display initials with our brand color background

        setSession(session);
        setUser(finalUser);
      } else {
        setSession(null);
        setUser(null);
      }
      setLoading(false);
    };

    getSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log("Auth state changed:", _event);
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const value = {
    session,
    user,
    loading,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
