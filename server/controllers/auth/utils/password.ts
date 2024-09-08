import crypto from 'crypto';
import bcrypt from 'bcryptjs';

export abstract class Password {
  static async hashPassword(password: string) {
    const SALT = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, SALT);
  }

  static async comparePassword(providedPassword: string, userPassword: string) {
    const isMatch = await bcrypt.compare(providedPassword, userPassword);
    return isMatch;
  }

  static createPasswordResetToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  static hashToken(token: string) {
    return crypto.createHash('sha256').update(token).digest('hex');
  }
}
