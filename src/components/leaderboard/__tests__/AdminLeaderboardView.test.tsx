import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

const getWeekly = vi.fn();
const getExam = vi.fn();
const getExams = vi.fn();
vi.mock("@/lib/admin/admin-api", () => ({
  adminLeaderboardApi: { getWeekly: (...a: unknown[]) => getWeekly(...a), getExam: (...a: unknown[]) => getExam(...a) },
  adminMonitoringApi: { getExams: (...a: unknown[]) => getExams(...a) },
}));

import { AdminLeaderboardView } from "../AdminLeaderboardView";

const entry = { rank: 1, displayName: "Ali V.", score: 9, maxScore: 10, percentage: 90 };
const page = (content: unknown[]) => ({ content, page: 0, size: 20, totalElements: content.length, totalPages: 1 });

describe("AdminLeaderboardView", () => {
  beforeEach(() => {
    getWeekly.mockReset().mockResolvedValue(page([entry]));
    getExam.mockReset().mockResolvedValue(page([{ ...entry, displayName: "Vüsal M." }]));
    getExams.mockReset().mockResolvedValue(page([{ id: "e1", title: "Riyaziyyat" }]));
  });

  it("shows the weekly ranking by default", async () => {
    render(<AdminLeaderboardView />);
    expect(await screen.findByText("Ali V.")).toBeInTheDocument();
    expect(getWeekly).toHaveBeenCalledWith(0, 20);
    expect(getExams).toHaveBeenCalledWith(0, 100, { status: "PUBLISHED" }, expect.anything());
  });

  it("switches to one exam's ranking from the select", async () => {
    render(<AdminLeaderboardView />);
    await screen.findByText("Ali V.");
    await screen.findByRole("option", { name: "Riyaziyyat" });

    fireEvent.change(screen.getByRole("combobox"), { target: { value: "e1" } });

    expect(await screen.findByText("Vüsal M.")).toBeInTheDocument();
    await waitFor(() => expect(getExam).toHaveBeenCalledWith("e1", 0, 20));
  });
});
