// ============================================
// NextAuth.js v5 Configuration — Google OAuth Only
// ============================================

import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import dbConnect from '@/lib/db';
import User from '@/models/User';

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        try {
          await dbConnect();

          const existingUser = await User.findOne({ email: user.email });

          if (!existingUser) {
            await User.create({
              email: user.email,
              name: user.name,
              image: user.image,
              googleId: account.providerAccountId,
              isOnboarded: false,
              preferredPartySize: 2,
              hardLimits: [],
              participantNames: [],
              savedFavorites: [],
            });
          } else {
            // Update avatar/name if changed
            existingUser.name = user.name || existingUser.name;
            existingUser.image = user.image || existingUser.image;
            if (!existingUser.googleId) {
              existingUser.googleId = account.providerAccountId;
            }
            await existingUser.save();
          }
        } catch (error) {
          console.error('Error during sign in callback:', error);
          return false;
        }
      }
      return true;
    },

    async jwt({ token }) {
      if (token?.email) {
        await dbConnect();
        const dbUser = await User.findOne({ email: token.email });
        if (dbUser) {
          token.userId = dbUser._id.toString();
          token.isOnboarded = dbUser.isOnboarded;
        }
      }
      return token;
    },

    async session({ session, token }) {
      if (token) {
        session.user.id = token.userId as string;
        (session as any).isOnboarded = token.isOnboarded as boolean;
      }
      return session;
    },
  },
  pages: {
    signIn: '/',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
});
