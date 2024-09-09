import jwt, { JwtPayload } from 'jsonwebtoken';

interface UserPayload extends JwtPayload {
  userId: string;
}

export abstract class JwtUtils {
  static createJwt(userId: string) {
    return jwt.sign({ userId }, process.env.JWT_SECRET!, {
      expiresIn: process.env.JWT_LIFETIME,
    });
  }

  static decodeJwt(token: string) {
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET!) as UserPayload;

      return payload;
    } catch (err) {
      if (err instanceof Error) {
        if (err.message === 'jwt malformed') return 'malformed';
        if (err.message === 'jwt expired') return 'expired';
      }
      return false;
    }
  }

  static jwtLifetimeToMs(lifetime: string) {
    const numberRegex = /[0-9]/;

    let num: string | number = '';
    let timeUnit: string = '';
    for (const char of lifetime) {
      if (numberRegex.test(char)) {
        num += char;
      } else {
        timeUnit += char;
      }
    }

    switch (timeUnit) {
      case 'd':
        return +num * 1000 * 60 * 60 * 24;
      case 'h':
        return +num * 1000 * 60 * 60;
      case 'm':
        return +num * 1000 * 60;
      case 's':
        return +num * 1000;
      default:
        return 0;
    }
  }
}
