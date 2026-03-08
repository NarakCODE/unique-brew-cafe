import bcrypt from 'bcrypt';

const DEFAULT_HASH_ROUNDS = 10;
const BCRYPT_PREFIX = '$2';

const getHashRounds = (): number => {
  const configuredRounds = Number(process.env.SECRET_HASH_ROUNDS);

  if (
    Number.isInteger(configuredRounds) &&
    configuredRounds >= 4 &&
    configuredRounds <= 15
  ) {
    return configuredRounds;
  }

  return DEFAULT_HASH_ROUNDS;
};

export const hashSecret = async (value: string): Promise<string> => {
  return bcrypt.hash(value, getHashRounds());
};

export const verifySecret = async (
  plainValue: string,
  storedValue: string
): Promise<boolean> => {
  // Support legacy plaintext records until they expire or are rotated.
  if (!storedValue.startsWith(BCRYPT_PREFIX)) {
    return plainValue === storedValue;
  }

  return bcrypt.compare(plainValue, storedValue);
};
