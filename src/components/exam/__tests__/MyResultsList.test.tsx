import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { MyAttemptSummary } from "@/types/attempt";

const listMine = vi.fn();
vi.mock("@/lib/attempt/attempt-api", () => ({ attemptApi: { listMine: (...args: unknown[]) => listMine(...args) } }));

import { MyResultsList } from "../MyResultsList";

function row(overrides: Partial<MyAttemptSummary> = {}): MyAttemptSummary {
  return {
    attemptId: "att-1",
    examId: "exam-1",
    examTitle: "Riyaziyyat",
    examType: "WEEKLY",
    submittedAt: "2026-09-20T10:00:00Z",
    score: 8,
    maxScore: 10,
    percentage: 80,
    ...overrides,
  };
}

function page(content: MyAttemptSummary[], totalPages = 1) {
  return { content, page: 0, size: 10, totalElements: content.length, totalPages };
}

describe("MyResultsList", () => {
  beforeEach(() => {
    listMine.mockReset();
  });

  it("shows a skeleton while loading", () => {
    listMine.mockReturnValue(new Promise(() => {}));
    render(<MyResultsList />);
    expect(screen.getByTestId("my-results-loading")).toBeInTheDocument();
  });

  it("renders a row per attempt with a link to its result page", async () => {
    listMine.mockResolvedValue(page([row(), row({ attemptId: "att-2", examTitle: "Fizika", score: 5, maxScore: 10, percentage: 50 })]));
    render(<MyResultsList />);

    expect(await screen.findByText("Riyaziyyat")).toBeInTheDocument();
    expect(screen.getByText("Fizika")).toBeInTheDocument();
    expect(screen.getByText("8 / 10")).toBeInTheDocument();
    expect(screen.getByText("80%")).toBeInTheDocument();

    const links = screen.getAllByRole("link", { name: "Nəticəyə bax" });
    expect(links).toHaveLength(2);
    expect(links[0]).toHaveAttribute("href", "/exam/att-1/result");
    expect(links[1]).toHaveAttribute("href", "/exam/att-2/result");
    expect(listMine).toHaveBeenCalledWith(0, 10, expect.anything());
  });

  it("shows the empty state when there are no submitted attempts", async () => {
    listMine.mockResolvedValue(page([]));
    render(<MyResultsList />);

    expect(await screen.findByText("Nəticələr yoxdur")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "İmtahanlara keç" })).toHaveAttribute("href", "/student/exams");
  });

  it("shows an error and retries", async () => {
    listMine.mockRejectedValueOnce(new Error("boom")).mockResolvedValueOnce(page([row()]));
    render(<MyResultsList />);

    const retry = await screen.findByRole("button", { name: "Yenidən cəhd edin" });
    fireEvent.click(retry);

    expect(await screen.findByText("Riyaziyyat")).toBeInTheDocument();
    expect(listMine).toHaveBeenCalledTimes(2);
  });

  it("requests the next page (0-based) when paging", async () => {
    listMine.mockResolvedValue(page([row()], 2));
    render(<MyResultsList />);

    await screen.findByText("Riyaziyyat");
    fireEvent.click(screen.getByRole("button", { name: "Növbəti səhifə" }));

    await waitFor(() => expect(listMine).toHaveBeenLastCalledWith(1, 10, expect.anything()));
  });
});
