// in src/app/api/auth/[...nextauth]/route.js
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

// Initialize Prisma Client
const prisma = new PrismaClient();

export const authOptions = {
  // Configure one or more authentication providers
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },

      // This is the core logic for authenticating a user
      async authorize(credentials) {
        // 1. Check if email and password were provided
        if (!credentials.email || !credentials.password) {
          throw new Error("Please enter an email and password");
        }

        // 2. Find the user in our PostgreSQL database using Prisma
        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
        });

        if (!user || !user.password) {
          // No user found with this email
          throw new Error("Invalid credentials");
        }

        // 3. Compare the provided password with the hashed password in the database
        const isPasswordCorrect = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordCorrect) {
          throw new Error("Invalid credentials");
        }

        // 4. If everything is correct, return the user object
        return user;
      },
    }),
  ],
  // Define session strategy (JWT is recommended)
  session: {
    strategy: "jwt",
  },
  // Callbacks are used to customize the token and session object
  callbacks: {
    async jwt({ token, user }) {
      // Add user's id and role to the JWT token
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      // Add user's id and role to the session object from the token
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },
  // A secret is required to sign and encrypt JWTs
  secret: process.env.NEXTAUTH_SECRET,
  // Define the custom login page
  pages: {
    signIn: "/login",
  },
};

// Initialize NextAuth
const handler = NextAuth(authOptions);

// Export the handler for GET and POST requests
export { handler as GET, handler as POST };