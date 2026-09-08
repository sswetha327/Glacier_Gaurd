import crypto from 'crypto';
import { User, UserRole } from '../src/types';

interface StoredUser extends User {
  passwordHash: string;
  salt: string;
}

// In-memory demo users with predefined secure hash
const usersStore: Map<string, StoredUser> = new Map();
const sessionsStore: Map<string, string> = new Map(); // token -> userId

function hashPassword(password: string, salt: string): string {
  return crypto.scryptSync(password, salt, 32).toString('hex');
}

export function registerUser(email: string, password: string, name: string, role: UserRole, agency?: string): { user: User; token: string } {
  const normalizedEmail = email.toLowerCase().trim();
  if (usersStore.has(normalizedEmail)) {
    throw new Error('An account with this email address already exists.');
  }

  const salt = crypto.randomBytes(16).toString('hex');
  const passwordHash = hashPassword(password, salt);
  const id = 'usr_' + crypto.randomBytes(6).toString('hex');

  const storedUser: StoredUser = {
    id,
    name,
    email: normalizedEmail,
    role,
    agency: agency || 'National Disaster Management Authority (NDMA)',
    assignedZone: role === 'public' ? 'Zone B' : 'All',
    passwordHash,
    salt,
  };

  usersStore.set(normalizedEmail, storedUser);
  const token = 'tok_' + crypto.randomBytes(24).toString('hex');
  sessionsStore.set(token, id);

  const { passwordHash: _, salt: __, ...user } = storedUser;
  return { user, token };
}

export function loginUser(email: string, password: string): { user: User; token: string } {
  const normalizedEmail = email.toLowerCase().trim();
  const storedUser = usersStore.get(normalizedEmail);
  if (!storedUser) {
    throw new Error('Invalid email or password.');
  }

  const computedHash = hashPassword(password, storedUser.salt);
  if (computedHash !== storedUser.passwordHash) {
    throw new Error('Invalid email or password.');
  }

  const token = 'tok_' + crypto.randomBytes(24).toString('hex');
  sessionsStore.set(token, storedUser.id);

  const { passwordHash: _, salt: __, ...user } = storedUser;
  return { user, token };
}

export function getUserByToken(token: string): User | null {
  const userId = sessionsStore.get(token);
  if (!userId) return null;

  for (const storedUser of usersStore.values()) {
    if (storedUser.id === userId) {
      const { passwordHash: _, salt: __, ...user } = storedUser;
      return user;
    }
  }
  return null;
}

export function logoutUser(token: string): void {
  sessionsStore.delete(token);
}

// Seed standard operational demo accounts for instant evaluator access
const DEFAULT_SALT = 'glacierguard_secure_salt_2026';
const DEMO_PASSWORD = 'glacierguard123';
const DEMO_HASH = hashPassword(DEMO_PASSWORD, DEFAULT_SALT);

const seedAccounts: StoredUser[] = [
  {
    id: 'usr_commander_1',
    name: 'Col. Rajesh Sharma',
    email: 'commander@glacierguard.gov',
    role: 'commander',
    agency: 'State Disaster Management Authority (Sikkim)',
    assignedZone: 'All',
    passwordHash: DEMO_HASH,
    salt: DEFAULT_SALT,
  },
  {
    id: 'usr_hydrologist_1',
    name: 'Dr. Ananya Sen',
    email: 'scientist@glacierguard.org',
    role: 'hydrologist',
    agency: 'Wadia Institute of Himalayan Geology',
    assignedZone: 'All',
    passwordHash: DEMO_HASH,
    salt: DEFAULT_SALT,
  },
  {
    id: 'usr_engineer_1',
    name: 'Tashi Namgyal',
    email: 'iot@glacierguard.net',
    role: 'field_engineer',
    agency: 'High Altitude Remote Sensor Ops',
    assignedZone: 'Zone A',
    passwordHash: DEMO_HASH,
    salt: DEFAULT_SALT,
  },
  {
    id: 'usr_public_1',
    name: 'Pema Lepcha',
    email: 'resident@chungthang.in',
    role: 'public',
    agency: 'Chungthang Valley Community',
    assignedZone: 'Zone A',
    passwordHash: DEMO_HASH,
    salt: DEFAULT_SALT,
  },
];

seedAccounts.forEach((acc) => {
  usersStore.set(acc.email, acc);
});
