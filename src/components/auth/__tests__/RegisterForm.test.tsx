import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { ApiError } from "@/lib/api/errors";

const replace = vi.fn();
const register = vi.fn();

vi.mock("next/navigation", () => ({ useRouter: () => ({ replace }) }));
vi.mock("@/lib/auth/AuthProvider", () => ({ useAuth: () => ({ register }) }));

import { RegisterForm } from "../RegisterForm";

function fill(label: string, value: string) {
  fireEvent.change(screen.getByLabelText(new RegExp(`^${label}\\*?$`)), { target: { value } });
}

function fillValid(password = "Correct1Horse", confirm = password) {
  fill("Ad", "Ali");
  fill("Soyad", "Aliyev");
  fill("E-poçt", "ali@example.com");
  fill("Şifrə", password);
  fill("Şifrənin təkrarı", confirm);
}

describe("RegisterForm", () => {
  beforeEach(() => {
    replace.mockReset();
    register.mockReset();
  });

  it("enforces the password policy on the client", () => {
    render(<RegisterForm />);
    fillValid("abc", "abc");

    fireEvent.click(screen.getByRole("button", { name: "Hesab yarat" }));

    expect(screen.getByText("Şifrə ən azı 8 simvol olmalıdır.")).toBeInTheDocument();
    expect(register).not.toHaveBeenCalled();
  });

  it("requires matching passwords", () => {
    render(<RegisterForm />);
    fillValid("Correct1Horse", "Different1Horse");

    fireEvent.click(screen.getByRole("button", { name: "Hesab yarat" }));

    expect(screen.getByText("Şifrələr uyğun gəlmir.")).toBeInTheDocument();
    expect(register).not.toHaveBeenCalled();
  });

  it("updates the live password checklist", () => {
    render(<RegisterForm />);

    fill("Şifrə", "Abcdefg1");

    const items = screen.getAllByRole("listitem");
    expect(items).toHaveLength(4);
    items.forEach((item) => expect(item).toHaveAttribute("data-met", "true"));
  });

  it("registers and redirects to the student dashboard", async () => {
    register.mockResolvedValue({ role: "STUDENT" });
    render(<RegisterForm />);
    fillValid();

    fireEvent.click(screen.getByRole("button", { name: "Hesab yarat" }));

    await waitFor(() => expect(replace).toHaveBeenCalledWith("/student/dashboard"));
    expect(register).toHaveBeenCalledWith({
      firstName: "Ali",
      lastName: "Aliyev",
      email: "ali@example.com",
      password: "Correct1Horse",
    });
  });

  it("shows a duplicate-email error on the email field", async () => {
    register.mockRejectedValue(
      new ApiError({
        timestamp: "2026-01-01T00:00:00Z",
        status: 409,
        code: "EMAIL_ALREADY_EXISTS",
        message: "exists",
        path: "/auth/register",
        errors: [],
      })
    );
    render(<RegisterForm />);
    fillValid();

    fireEvent.click(screen.getByRole("button", { name: "Hesab yarat" }));

    expect(await screen.findByText("Bu e-poçt ilə artıq hesab mövcuddur.")).toBeInTheDocument();
  });
});
