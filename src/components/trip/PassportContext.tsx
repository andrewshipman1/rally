'use client';

// Context bridge for the passport drawer. Wraps the trip page so any
// nested client component can call openPassport(user) to slide up the
// drawer. The provider holds state + renders the PassportDrawer portal.

import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import type { User } from '@/types';
import { PassportDrawer } from './PassportDrawer';

type PassportCtx = {
  openPassport: (user: User) => void;
};

const Ctx = createContext<PassportCtx>({ openPassport: () => {} });

export function usePassport() {
  return useContext(Ctx);
}

export function PassportProvider({ children }: { children: ReactNode }) {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [open, setOpen] = useState(false);

  const openPassport = useCallback((user: User) => {
    setSelectedUser(user);
    setOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    setOpen(false);
  }, []);

  return (
    <Ctx.Provider value={{ openPassport }}>
      {children}
      <PassportDrawer open={open} onClose={handleClose} user={selectedUser} />
    </Ctx.Provider>
  );
}
