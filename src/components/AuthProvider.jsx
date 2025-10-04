// in src/components/AuthProvider.jsx
"use client";

import { SessionProvider } from "next-auth/react";

export default function AuthProvider({ children }) {
  // The SessionProvider component from next-auth holds the user session state.
  // By wrapping our app in it, we make the session available everywhere.
  return <SessionProvider>{children}</SessionProvider>;
}