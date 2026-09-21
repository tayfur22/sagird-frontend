import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

const replace = vi.fn();
let authState: { status: string; user: { role: string } | null; endedBy: string | null };

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
  usePathname: () => "/student/profile",
}));
vi.mock("@/lib/auth/AuthProvider", () => ({ useAuth: () => authState }));

import { RequireAuth } from "../RequireAuth";

describe("RequireAuth", () => {
  beforeEach(() => {
    replace.mockReset();
  });

  it("shows a spinner and does not redirect while the session is loading", () => {
    authState = { status: "loading", user: null, endedBy: null };
    render(<RequireAuth role="STUDENT">secret</RequireAuth>);

    expect(screen.queryByText("secret")).not.toBeInTheDocument();
    expect(replace).not.toHaveBeenCalled();
  });

  it("redirects anonymous visitors to login, remembering the page", () => {
    authState = { status: "unauthenticated", user: null, endedBy: null };
    render(<RequireAuth role="STUDENT">secret</RequireAuth>);

    expect(screen.queryByText("secret")).not.toBeInTheDocument();
    expect(replace).toHaveBeenCalledWith("/login?next=%2Fstudent%2Fprofile");
  });

  it("does not remember the page after an explicit logout", () => {
    authState = { status: "unauthenticated", user: null, endedBy: "logout" };
    render(<RequireAuth role="STUDENT">secret</RequireAuth>);

    expect(replace).toHaveBeenCalledWith("/login");
  });

  it("sends a user with the wrong role to their own dashboard", () => {
    authState = { status: "authenticated", user: { role: "ADMIN" }, endedBy: null };
    render(<RequireAuth role="STUDENT">secret</RequireAuth>);

    expect(screen.queryByText("secret")).not.toBeInTheDocument();
    expect(replace).toHaveBeenCalledWith("/admin/dashboard");
  });

  it("renders children for the right role", () => {
    authState = { status: "authenticated", user: { role: "STUDENT" }, endedBy: null };
    render(<RequireAuth role="STUDENT">secret</RequireAuth>);

    expect(screen.getByText("secret")).toBeInTheDocument();
    expect(replace).not.toHaveBeenCalled();
  });
});
