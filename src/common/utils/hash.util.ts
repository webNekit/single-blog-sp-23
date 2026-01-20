import * as argon2 from 'argon2';

export const hashString = async (plain: string): Promise<string> => {
  return argon2.hash(plain, {
    type: argon2.argon2id,
    memoryCost: 2 ** 16,
    timeCost: 3,
    parallelism: 1,
  });
};

export const verifyString = async (hash: string, plain: string): Promise<boolean> => {
  return argon2.verify(hash, plain);
};