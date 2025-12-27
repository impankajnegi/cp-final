import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export function hashPassword(password) {
  return bcrypt.hashSync(password, 10);
}

export function verifyPassword(password, hash) {
  return bcrypt.compareSync(password, hash);
}

export function generateToken(user) {
  return jwt.sign(
    { 
      id: user.id, 
      email: user.email, 
      role: user.role 
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

export function maskPhoneNumber(phone) {
  if (!phone || phone.length < 10) return phone;
  const start = phone.slice(0, 2);
  const end = phone.slice(-2);
  const masked = '*'.repeat(phone.length - 4);
  return `${start}${masked}${end}`;
}

export function sendOTP(phoneNumber) {
  // For development, return static OTP
  if (process.env.NODE_ENV === 'development') {
    return Promise.resolve({
      success: true,
      otp: process.env.DEV_OTP || '123456'
    });
  }
  
  // TODO: Implement Twilio integration for production
  // const twilio = require('twilio');
  // const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  // return client.messages.create({
  //   body: `Your Chaarpaisa verification OTP is: ${otp}`,
  //   from: process.env.TWILIO_PHONE_NUMBER,
  //   to: phoneNumber
  // });
  
  return Promise.resolve({ success: true, otp: '123456' });
}

export function verifyOTP(inputOTP) {
  if (process.env.NODE_ENV === 'development') {
    return inputOTP === (process.env.DEV_OTP || '123456');
  }
  // TODO: Implement actual OTP verification logic
  return false;
}
