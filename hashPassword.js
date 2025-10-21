// hashPassword.js
import bcrypt from "bcryptjs";

const password = "ditiseentest";

const generateHash = async () => {
  const hashedPassword = await bcrypt.hash(password, 10);
  console.log(hashedPassword);
};

generateHash();
