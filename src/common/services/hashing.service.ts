import { Injectable } from '@nestjs/common';
import argon2 from 'argon2';

@Injectable()
export class HashingService {
  private readonly options: argon2.HashOptions = {
    type: argon2.argon2id,
  };

  async hash(value: string): Promise<string> {
    return argon2.hash(value);
  }

  async compare(value: string, hashedValue?: string): Promise<boolean> {
    return argon2.verify(hashedValue || 'dummyhash', value);
  }

  needsReHash(hash: string) {
    return argon2.needsRehash(hash, this.options);
  }
}
