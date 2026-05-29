import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  providers: [
    // Google OAuth — only enabled when credentials are set
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),

    // Apple OAuth — only enabled when credentials are set
    ...(process.env.APPLE_ID && process.env.APPLE_SECRET
      ? [
          // Dynamic import to avoid build-time errors
          require("next-auth/providers/apple").default({
            clientId: process.env.APPLE_ID,
            clientSecret: process.env.APPLE_SECRET,
          }),
        ]
      : []),

    // Email + Password
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        if (!process.env.DATABASE_URL) return null;

        try {
          const { prisma } = await import("./prisma");
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
          });
          if (!user || !user.password) return null;

          const isValid = await bcrypt.compare(
            credentials.password,
            user.password
          );
          if (!isValid) return null;

          return { id: user.id, email: user.email, name: user.name };
        } catch {
          return null;
        }
      },
    }),
  ],

  // Use Prisma adapter only when DATABASE_URL is configured
  ...(process.env.DATABASE_URL
    ? {
        adapter: (() => {
          try {
            const { PrismaAdapter } = require("@auth/prisma-adapter");
            const { prisma } = require("./prisma");
            return PrismaAdapter(prisma);
          } catch {
            return undefined;
          }
        })(),
      }
    : {}),

  session: { strategy: "jwt" },

  pages: {
    signIn: "/ja/auth/signin",
    newUser: "/ja/auth/signup",
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    async session({ session, token }) {
      if (session.user) (session.user as any).id = token.id;
      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
};
