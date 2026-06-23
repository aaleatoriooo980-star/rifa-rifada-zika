import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { mockUsers } from "@/mocks/mockUsers";
import type { User } from "@/lib/types";

interface AuthContextValue {
  user: User | null;
  login: (email: string, password: string) => User | null;
  register: (data: Omit<User, "id" | "role">) => User;
  logout: () => void;
  users: User[];
}

const AuthContext = createContext<AuthContextValue | null>(null);
const SESSION_KEY = "rifas_session_v1";
const USERS_KEY = "rifas_users_v1";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    try {
      const u = localStorage.getItem(USERS_KEY);
      if (u) setUsers(JSON.parse(u));
      const s = localStorage.getItem(SESSION_KEY);
      if (s) setUser(JSON.parse(s));
    } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }, [users]);

  const login = (email: string, password: string) => {
    const found = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password,
    );
    if (found) {
      setUser(found);
      localStorage.setItem(SESSION_KEY, JSON.stringify(found));
      return found;
    }
    return null;
  };

  const register = (data: Omit<User, "id" | "role">) => {
    const newUser: User = {
      ...data,
      id: `u-${Date.now()}`,
      role: "cliente",
    };
    setUsers((prev) => [...prev, newUser]);
    setUser(newUser);
    localStorage.setItem(SESSION_KEY, JSON.stringify(newUser));
    return newUser;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(SESSION_KEY);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, users }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
