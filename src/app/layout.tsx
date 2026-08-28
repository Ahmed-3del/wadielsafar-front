import type { ReactNode } from "react";

// The [locale] segment covers every route, so it owns <html>/<body>;
// this root layout only exists to satisfy the App Router's file convention.
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
