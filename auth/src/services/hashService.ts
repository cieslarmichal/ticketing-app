import bcrypt from 'bcrypt';

export class HashService {
  static async hash(plainData: string) {
    const salt = await bcrypt.genSalt(8);

    return bcrypt.hash(plainData, salt);
  }

  static compare(plainData: string, hashedData: string) {
    return bcrypt.compare(plainData, hashedData);
  }
}
