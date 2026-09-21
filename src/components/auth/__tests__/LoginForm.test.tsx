import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { ApiError } from "@/lib/api/errors";

const replace = vi.fn();
const login = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
  useSearchParams: () => new URLSearchParams("next=/student/profile"),
}));
vi.mock("@/lib/auth/AuthProvider", () => ({ useAuth: () => ({ login }) }));

import { LoginForm } from "../LoginForm";

function fill(label: string, value: string) {
  fireEvent.change(screen.getByLabelText(new RegExp(label)), { target: { value } });
}

describe("LoginForm", () => {
  beforeEach(() => {
    replace.mockReset();
    login.mockReset();
  });

  it("shows required-field errors and does not call the API", () => {
    render(<LoginForm />);

    fireEvent.click(screen.getByRole("button", { name: "Daxil ol" }));

    expect(screen.getAllByText("Bu sahə mütləqdir.")).toHaveLength(2);
    expect(login).not.toHaveBeenCalled();
  });

  it("logs in and redirects to the requested page", async () => {
    login.mockResolvedValue({ role: "STUDENT" });
    render(<LoginForm />);

    fill("E-poçt", "ali@example.com");
    fill("Şifrə", "Correct1Horse");
    fireEvent.click(screen.getByRole("button", { name: "Daxil ol" }));

    await waitFor(() => expect(replace).toHaveBeenCalledWith("/student/profile"));
    expect(login).toHaveBeenCalledWith({ email: "ali@example.com", password: "Correct1Horse" });
  });

  it("shows a translated message for invalid credentials", async () => {
    login.mockRejectedValue(
      new ApiError({
        timestamp: "2026-01-01T00:00:00Z",
        status: 401,
        code: "INVALID_CREDENTIALS",
        message: "Invalid email or password",
        path: "/auth/login",
        errors: [],
      })
    );
    render(<LoginForm />);

    fill("E-poçt", "ali@example.com");
    fill("Şifrə", "Wrong1Password");
    fireEvent.click(screen.getByRole("button", { name: "Daxil ol" }));

    expect(await screen.findByText("E-poçt və ya şifrə yanlışdır.")).toBeInTheDocument();
    expect(replace).not.toHaveBeenCalled();
  });
});
