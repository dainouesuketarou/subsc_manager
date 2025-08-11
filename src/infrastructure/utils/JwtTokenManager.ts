import jwt from 'jsonwebtoken';

export interface JwtPayload {
  userId: string;
  email: string;
}

export class JwtTokenManager {
  private static readonly SECRET_KEY =
    process.env.JWT_SECRET_KEY || 'your-secret-key';
  private static readonly EXPIRES_IN = '24h';

  /**
   * JWTトークンを生成する
   */
  static generateToken(payload: JwtPayload): string {
    return jwt.sign(payload, this.SECRET_KEY, {
      expiresIn: this.EXPIRES_IN,
    });
  }

  /**
   * JWTトークンを検証してペイロードを取得する
   */
  static verifyToken(token: string): JwtPayload {
    try {
      return jwt.verify(token, this.SECRET_KEY) as JwtPayload;
    } catch {
      throw new Error('Invalid token');
    }
  }

  /**
   * トークンからペイロードを取得する（検証なし）
   */
  static decodeToken(token: string): JwtPayload | null {
    try {
      return jwt.decode(token) as JwtPayload;
    } catch {
      return null;
    }
  }
}
