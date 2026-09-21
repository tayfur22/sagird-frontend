import { describe, expect, it } from "vitest";
import { homePathForRole, isValidEmail, isValidPhone, passwordIssues, safeNextPath } from "../validation";

describe("passwordIssues", () => {
  it("accepts a password meeting all rules", () => {
    expect(passwordIssues("Abcdefg1")).toEqual([]);
  });

  it("flags each missing rule", () => {
    expect(passwordIssues("Abc1234")).toEqual(["PASSWORD_TOO_SHORT"]);
    expect(passwordIssues("abcdefg1")).toEqual(["PASSWORD_NEEDS_UPPERCASE"]);
    expect(passwordIssues("ABCDEFG1")).toEqual(["PASSWORD_NEEDS_LOWERCASE"]);
    expect(passwordIssues("Abcdefgh")).toEqual(["PASSWORD_NEEDS_DIGIT"]);
  });

  it("reports several issues at once and the BCrypt length limit", () => {
    expect(passwordIssues("abc")).toEqual(["PASSWORD_TOO_SHORT", "PASSWORD_NEEDS_UPPERCASE", "PASSWORD_NEEDS_DIGIT"]);
    expect(passwordIssues("Aa1" + "x".repeat(70))).toEqual(["PASSWORD_TOO_LONG"]);
  });
});

describe("isValidEmail / isValidPhone", () => {
  it("validates emails", () => {
    expect(isValidEmail("ali@example.com")).toBe(true);
    expect(isValidEmail("ali@example")).toBe(false);
    expect(isValidEmail("not an email")).toBe(false);
  });

  it("validates phone numbers", () => {
    expect(isValidPhone("+994 50 123 45 67")).toBe(true);
    expect(isValidPhone("abc")).toBe(false);
  });
});

describe("safeNextPath", () => {
  it("allows only same-site relative paths", () => {
    expect(safeNextPath("/student/profile")).toBe("/student/profile");
    expect(safeNextPath("https://evil.example")).toBeNull();
    expect(safeNextPath("//evil.example")).toBeNull();
    expect(safeNextPath("/\\evil.example")).toBeNull();
    expect(safeNextPath(null)).toBeNull();
  });
});

describe("homePathForRole", () => {
  it("maps roles to their dashboards", () => {
    expect(homePathForRole("STUDENT")).toBe("/student/dashboard");
    expect(homePathForRole("ADMIN")).toBe("/admin/dashboard");
  });
});
