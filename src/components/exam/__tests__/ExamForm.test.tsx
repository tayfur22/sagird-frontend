import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { ExamForm } from "../ExamForm";
import type { ExamResponse } from "@/types/exam";

function exam(overrides: Partial<ExamResponse> = {}): ExamResponse {
  return {
    id: "e1",
    title: "Weekly 1",
    description: null,
    type: "WEEKLY",
    status: "DRAFT",
    durationMinutes: 60,
    price: 0,
    currency: "AZN",
    subscriptionRequired: false,
    registrationStartAt: null,
    registrationEndAt: null,
    publishAt: null,
    createdAt: "2026-09-01T00:00:00Z",
    updatedAt: "2026-09-01T00:00:00Z",
    antiCheatEnabled: false,
    fullscreenRequired: false,
    maxAttempts: null,
    ...overrides,
  };
}

const LABEL = /Maksimum cəhd sayı/;

afterEach(cleanup);

describe("ExamForm maxAttempts", () => {
  it("pre-fills the existing limit on edit and submits it unchanged", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<ExamForm initialValue={exam({ maxAttempts: 3 })} submitLabel="Yadda saxla" onSubmit={onSubmit} />);

    expect((screen.getByLabelText(LABEL) as HTMLInputElement).value).toBe("3");
    fireEvent.click(screen.getByRole("button", { name: "Yadda saxla" }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit.mock.calls[0][0].maxAttempts).toBe(3);
  });

  it("sends an explicit null (not undefined) when the limit is empty", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<ExamForm initialValue={exam()} submitLabel="Yadda saxla" onSubmit={onSubmit} />);

    expect((screen.getByLabelText(LABEL) as HTMLInputElement).value).toBe("");
    fireEvent.click(screen.getByRole("button", { name: "Yadda saxla" }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    const request = onSubmit.mock.calls[0][0];
    expect("maxAttempts" in request).toBe(true);
    expect(request.maxAttempts).toBeNull();
  });

  it.each(["0", "-2", "1.5"])("rejects %s without calling onSubmit", (value) => {
    const onSubmit = vi.fn();
    render(<ExamForm initialValue={exam()} submitLabel="Yadda saxla" onSubmit={onSubmit} />);

    fireEvent.change(screen.getByLabelText(LABEL), { target: { value } });
    fireEvent.click(screen.getByRole("button", { name: "Yadda saxla" }));

    expect(screen.getByText("Cəhd sayı 1 və ya daha böyük tam ədəd olmalıdır.")).toBeTruthy();
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
