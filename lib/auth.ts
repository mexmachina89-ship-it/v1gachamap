import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

const hasDB = !!process.env.DATABASE_URL && !process.env.DATABASE_URL.startsWith("file:");

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
        if (!hasDB) return null;

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

  // Use Prisma adapter + database sessions when DB is configured
  ...(hasDB
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
        session: { strategy: "database" as const },
      }
    : {
        session: { strategy: "jwt" as const },
      }),

  pages: {
    signIn: "/ja/auth/signin",
    newUser: "/ja/auth/signup",
  },

  callbacks: {
    async session({ session, user, token }) {
      if (session.user) {
        // database strategy uses `user`, jwt strategy uses `token`
        (session.user as any).id = user?.id ?? token?.id;
        session.user.name = user?.name ?? token?.name ?? session.user.name;
        session.user.email = user?.email ?? token?.email ?? session.user.email;
        session.user.image = user?.image ?? (token?.picture as string) ?? session.user.image;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
      }
      return token;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
};
