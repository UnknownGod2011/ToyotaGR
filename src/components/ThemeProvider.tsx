import { ReactNode } from 'react';

interface ThemeProviderProps {
  children: ReactNode;
}

export default function ThemeProvider({ children }: ThemeProviderProps) {
  return (
    <div className="min-h-screen bg-gr-black text-white">
      {children}
    </div>
  );
}
