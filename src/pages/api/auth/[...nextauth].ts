import { PrismaAdapter } from "@next-auth/prisma-adapter";
import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "../../../server/db/prismadb";
import { randomBytes, randomUUID } from "crypto";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials : {
        username:{label: "Username", type: "text"},
        password:{label:"Password",type:"password"},
        email:{label:"Email",type:"email"}
      },
      async authorize(credentials,req) : Promise<any> {

        //check to see if email and password is valid

        if(!credentials?.email || !credentials.password){
           return null;
        }

        //check to see if user exists
        // const user = await prisma.user.findUnique({
        //   where : {
        //     email: credentials?.email
        //   }
        // });

        let checkLoginDetails=`${process.env.NEXT_PUBLIC_API_URL}/login`;

        let response =await fetch(checkLoginDetails, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({data:{email:credentials?.email,password:credentials?.password}}),
            });

        let user = await response.json();


        let {hashedPassword,emailVerified,...newUser} = user.body;

        //here to look up the user from the credentials supplied
        //const user = null;//{ id: 1, name: 'J Smith', email: 'jsmith@example.com' }

        if(!newUser){
          return null;
        }

        //check to see if passwords match
        //const passwordsMatch = await bcrypt.compare(credentials.password,user.hashedPassword);

        // if(!passwordsMatch){
        //   return null;
        // }


        return newUser ;

      }  
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  pages: { 
    signIn: "/signin",
    newUser: "/register"
  },
  session: {
    // Choose how you want to save the user session.
    // The default is `"jwt"`, an encrypted JWT (JWE) stored in the session cookie.
    // If you use an `adapter` however, we default it to `"database"` instead.
    // You can still force a JWT session by explicitly defining `"jwt"`.
    // When using `"database"`, the session cookie will only contain a `sessionToken` value,
    // which is used to look up the session in the database.
    strategy: "jwt",
  
    // Seconds - How long until an idle session expires and is no longer valid.
    maxAge: 30 * 24 * 60 * 60, // 30 days
  
    // Seconds - Throttle how frequently to write to database to extend a session.
    // Use it to limit write operations. Set to 0 to always update the database.
    // Note: This option is ignored if using JSON Web Tokens
    updateAge: 24 * 60 * 60, // 24 hours
    
    // The session token is usually either a random UUID or string, however if you
    // need a more customized session token string, you can define your own generate function.
    generateSessionToken: () => {
      return randomUUID?.() ?? randomBytes(32).toString("hex")
    }
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role; // Add role to token if available
        token.id = user.id; // Add the user id to the token
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.role = token.role; // Pass the role to the session
        session.user.id = token.id; // Add the user id to the session
      }
      return session;
    },
  },
};

// const handler = NextAuth(authOptions);

export default NextAuth(authOptions);//{handler as GET, handler as POST};
