import { describe, expect, it } from "vitest";
import { formatCount, formatPercentage, pluralForm } from "../format";

const ruForms = { one: "ученик", few: "ученика", many: "учеников", other: "ученика" };

describe("statistics format helpers", () => {
  it("renders zero as a real value, not as missing", () => {
    expect(formatCount(0, "en")).toBe("0");
    expect(formatPercentage(0)).toBe("0%");
  });

  it("renders null percentages as an em dash and keeps backend values untouched", () => {
    expect(formatPercentage(null)).toBe("—");
    expect(formatPercentage(78.4)).toBe("78.4%");
  });

  it("groups digits", () => {
    expect(formatCount(1250, "en")).toBe("1,250");
  });

  it("uses Russian plural rules", () => {
    expect(pluralForm(1, "ru", ruForms)).toBe("ученик");
    expect(pluralForm(3, "ru", ruForms)).toBe("ученика");
    expect(pluralForm(5, "ru", ruForms)).toBe("учеников");
  });
});
