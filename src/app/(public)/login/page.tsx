import { Suspense } from "react";
import type { Metadata } from "next";
import { GuestOnly } from "@/components/auth/GuestOnly";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = { title: "Daxil ol | Şagird.az" };

export default function LoginPage() {
  // useSearchParams (in GuestOnly/LoginForm) requires a Suspense boundary.
  return (
    <Suspense>
      <GuestOnly>
        <LoginForm />
      </GuestOnly>
    </Suspense>
  );
}
