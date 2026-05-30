import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  providers: [
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),

    ...(process.env.APPLE_ID && process.env.APPLE_SECRET
      ? [
          require("next-auth/providers/apple").default({
            clientId: process.env.APPLE_ID,
            clientSecret: process.env.APPLE_SECRET,
          }),
        ]
      : []),

    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        try {
          const { prisma } = await import("./prisma");
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
          });
          if (!user || !user.password) return null;
          const isValid = await bcrypt.compare(credentials.password, user.password);
          if (!isValid) return null;
          return { id: user.id, email: user.email, name: user.name };
        } catch {
          return null;
        }
      },
    }),
  ],

  // Always use JWT — simpler and works without DB session table
  session: { strategy: "jwt" },

  pages: {
    signIn: "/ja/auth/signin",
    newUser: "/ja/auth/signup",
  },

  callbacks: {
    async jwt({ token, user, account, profile }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.picture = user.image;
      }
      // For Google OAuth — DBにupsertしてIDを確保
      if (account?.provider === "google" && profile) {
        try {
          const { prisma } = await import("./prisma");
          const email = (profile as any).email as string;
          const dbUser = await prisma.user.upsert({
            where: { email },
            update: { name: (profile as any).name, image: (profile as any).picture },
            create: { email, name: (profile as any).name, image: (profile as any).picture },
          });
          token.id = dbUser.id;
        } catch {}
        token.name = (profile as any).name;
        token.picture = (profile as any).picture;
        token.email = (profile as any).email;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        session.user.name = token.name as string;
        session.user.email = token.email as string;
        session.user.image = token.picture as string;
      }
      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
};
