
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from "react";

import type {
  AuthResponse,
  LoginRequest,
  User,
  RegisterRequest
} from "@projection/shared";

import {
  login as loginRequest,
  logout as logoutRequest,
  restoreSession,
  register as registerRequest,
} from "@/services/auth.service";

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (credentials: LoginRequest) => Promise<void>;
  signUp: (credentials: RegisterRequest) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(
  undefined
);

export function AuthProvider({
  children
}: {
  children: ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const signUp = useCallback(
    async (credentials: RegisterRequest) => {
      const response: AuthResponse =
        await registerRequest(credentials);

      setUser(response.user);
    },
    []
  );



  useEffect(() => {
    let active = true;

    async function initialize() {
      try {
        const restoredUser = await restoreSession();

        if (active) {
          setUser(restoredUser);
        }
      } catch (error) {
        console.error(
          "[Mobile] Session restoration failed:",
          error instanceof Error ? error.message : "Unknown error"
        );
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    void initialize();

    return () => {
      active = false;
    };
  }, []);

  const signIn = useCallback(
    async (credentials: LoginRequest) => {
      const response: AuthResponse = await loginRequest(credentials);
      setUser(response.user);
    },
    []
  );

  const signOut = useCallback(async () => {
    try {
      await logoutRequest();
    } finally {
      setUser(null);
    }
  }, []);

  
const value = useMemo<AuthContextValue>(
  () => ({
    user,
    isAuthenticated: user !== null,
    isLoading,
    signIn,
    signUp,
    signOut
  }),
  [user, isLoading, signIn, signUp, signOut]
);


  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );





}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used within AuthProvider"
    );
  }

  return context;
}
    