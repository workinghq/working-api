import { Injectable, OnModuleInit } from '@nestjs/common';
import argon2 from 'argon2';
import { randomBytes } from 'node:crypto';

@Injectable()
export class HashingService implements OnModuleInit {
  private dummyHash: string;
  private readonly options: argon2.HashOptions = {
    type: argon2.argon2id,
  };

  async onModuleInit() {
    this.dummyHash = await argon2.hash(randomBytes(32).toString('hex'));
  }

  async hash(value: string): Promise<string> {
    return argon2.hash(value);
  }

  async compare(value: string, hashedValue?: string): Promise<boolean> {
    return argon2.verify(hashedValue ?? this.dummyHash, value);
  }

  needsReHash(hash: string) {
    return argon2.needsRehash(hash, this.options);
  }
}
