import { Suspense } from "react";
import type { Metadata } from "next";
import { GuestOnly } from "@/components/auth/GuestOnly";
import { RegisterForm } from "@/components/auth/RegisterForm";

export const metadata: Metadata = { title: "Qeydiyyat | Şagird.az" };

export default function RegisterPage() {
  return (
    <Suspense>
      <GuestOnly>
        <RegisterForm />
      </GuestOnly>
    </Suspense>
  );
}
