'use client';

import { CLIENTE_DEMO } from '@/data/mock/cliente';
import type { Cliente } from '@/lib/types';

const STORAGE_KEY = 'forklift-mock-auth';

export function login(_email: string, _senha: string): Cliente {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(STORAGE_KEY, '1');
  }
  return CLIENTE_DEMO;
}

export function logout(): void {
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem(STORAGE_KEY);
  }
}

export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;
  return window.localStorage.getItem(STORAGE_KEY) === '1';
}

export function getCurrentCliente(): Cliente | null {
  if (!isAuthenticated()) return null;
  return CLIENTE_DEMO;
}
