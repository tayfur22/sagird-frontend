import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ToastProvider } from "@/components/ui/Toast";
import { AuthProvider } from "@/lib/auth/AuthProvider";
import { LocaleProvider } from "@/lib/i18n/LocaleProvider";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "Şagird.az",
  description: "Onlayn imtahan platforması",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="az">
      <body>
        <LocaleProvider>
          <ToastProvider>
            <AuthProvider>{children}</AuthProvider>
          </ToastProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
