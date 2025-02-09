import bcrypt from "bcrypt";

export async function saltAndHashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10);
}