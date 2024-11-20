import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL as string);

export async function fetchUserByUsername( username: string ) {
    
    const data = await sql`
        SELECT * 
        FROM users 
        WHERE username = ${username};
      `;
      
      return data.length > 0 ? data[0] : null;
}