import bcrypt from "bcryptjs";
import { query } from "./config/database.js"; // adjust path if your database.js is elsewhere

const hashAdminPasswords = async () => {
  try {
    // Get all admins
    const admins = await query("SELECT id, password FROM admins");

    for (const admin of admins) {
      // Skip if password already hashed (bcrypt hash starts with $2b$)
      if (!admin.password.startsWith("$2b$")) {
        const hashed = await bcrypt.hash(admin.password, 10);
        await query("UPDATE admins SET password = ? WHERE id = ?", [hashed, admin.id]);
        console.log(`Hashed password for admin ID ${admin.id}`);
      }
    }

    console.log("All admin passwords hashed successfully.");
    process.exit(0);
  } catch (err) {
    console.error("Error hashing admin passwords:", err);
    process.exit(1);
  }
};

hashAdminPasswords();
