import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from './prisma'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        })

        if (!user) {
          return null
        }

        const isValid = await bcrypt.compare(credentials.password, user.password)

        if (!isValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          status: user.status,
          isBetaTester: user.isBetaTester,
          isAdmin: user.isAdmin,
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.status = (user as any).status
        token.isBetaTester = (user as any).isBetaTester
        token.isAdmin = (user as any).isAdmin
      }
      return token
    },
    async session({ session, token }) {
      if (session?.user && token) {
        (session.user as any).id = token.id as string
        (session.user as any).status = token.status as string
        (session.user as any).isBetaTester = token.isBetaTester as boolean
        (session.user as any).isAdmin = token.isAdmin as boolean
      }
      return session
    },
  },
  debug: true,
  secret: process.env.NEXTAUTH_SECRET,
}
