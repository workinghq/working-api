import { Injectable } from '@nestjs/common';
import argon2 from 'argon2';

@Injectable()
export class HashingService {
  async hash(value: string): Promise<string> {
    return argon2.hash(value);
  }

  async compare(value: string, hashedValue: string): Promise<boolean> {
    return argon2.verify(hashedValue, value);
  }
}
