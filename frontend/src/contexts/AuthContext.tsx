import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type {
  LoginRequest,
  RegisterDonorRequest,
  RegisterOrgRepRequest,
  User,
} from '@/types';
import { authApi } from '@/api/auth';

const STORAGE_KEY = 'donatly.user';

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isOrgRep: boolean;
  isDonor: boolean;
  login: (payload: LoginRequest) => Promise<User>;
  registerDonor: (payload: RegisterDonorRequest) => Promise<User>;
  registerOrgRep: (payload: RegisterOrgRepRequest) => Promise<User>;
  loginWithGoogle: (idToken: string) => Promise<User>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function loadStoredUser(): User | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => loadStoredUser());

  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [user]);

  const login = useCallback(async (payload: LoginRequest) => {
    const loggedIn = await authApi.login(payload);
    setUser(loggedIn);
    return loggedIn;
  }, []);

  const registerDonor = useCallback(async (payload: RegisterDonorRequest) => {
    const created = await authApi.registerDonor(payload);
    setUser(created);
    return created;
  }, []);

  const registerOrgRep = useCallback(async (payload: RegisterOrgRepRequest) => {
    const created = await authApi.registerOrgRep(payload);
    setUser(created);
    return created;
  }, []);

  const loginWithGoogle = useCallback(async (idToken: string) => {
    const loggedIn = await authApi.loginWithGoogle(idToken);
    setUser(loggedIn);
    return loggedIn;
  }, []);

  const logout = useCallback(() => setUser(null), []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: user !== null,
      isAdmin: user?.userType === 'Admin',
      isOrgRep: user?.userType === 'OrganizationRep',
      isDonor: user?.userType === 'Donor',
      login,
      registerDonor,
      registerOrgRep,
      loginWithGoogle,
      logout,
    }),
    [user, login, registerDonor, registerOrgRep, loginWithGoogle, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
