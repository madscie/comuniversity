// utils/tokenUtils.js
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/constants.js";

export const createAndSendToken = (user, res, role = 'user', isDemo = false) => {
  const token = jwt.sign({ 
    id: user.id, 
    email: user.email,
    role: role,
    isDemo: isDemo
  }, JWT_SECRET, { expiresIn: "24h" });
  
  console.log(`${role} login successful:`, user.email);
  
  const userData = role === 'admin' ? {
    id: user.id,
    username: user.username,
    email: user.email,
    fname: user.fname,
    lname: user.lname,
    isDemo: isDemo
  } : {
    id: user.id,
    firstName: user.first_name,
    lastName: user.last_name,
    email: user.email,
    role: user.role,
    isDemo: isDemo
  };
  
  res.json({
    success: true,
    message: isDemo ? "Demo login successful" : "Login successful",
    token,
    user: userData
  });
};