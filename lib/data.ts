"use server";

import { prisma } from "./prisma";


export async function fetchUserByEmail( email: string ) {
    
   const user = await prisma.user.findUnique({
    where: {
      email: email,
    }
   })

   return user;
}