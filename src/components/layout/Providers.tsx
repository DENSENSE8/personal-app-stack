"use client";

import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";
import { SmoothScroll } from "./SmoothScroll";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <SmoothScroll>{children}</SmoothScroll>
    </SessionProvider>
  );
}
