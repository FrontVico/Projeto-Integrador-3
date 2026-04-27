import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type UserRole = 'ADMIN' | 'MOTORISTA' | 'PASSAGEIRO' | null;

export interface AuthUser {
  name: string;
  email: string;
  role: UserRole;
  sub: string;
}

function decodeJWT(token: string): any {
  try {
    const base64 = token.split('.')[1];
    const padded = base64.replace(/-/g, '+').replace(/_/g, '/');
    const decoded = decodeURIComponent(
      Array.from(atob(padded))
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

export function useAuth() {
  const [user, setUser]       = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      try {
        const token = await AsyncStorage.getItem('@vancontrol:token');
        if (!token) return;
        const payload = decodeJWT(token);
        if (!payload) return;
        setUser({
          name:  payload.name  ?? payload.sub ?? 'Usuário',
          email: payload.email ?? '',
          role:  payload.role  ?? payload.perfil ?? 'PASSAGEIRO',
          sub:   payload.sub   ?? '',
        });
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, []);

  return { user, loading };
}
