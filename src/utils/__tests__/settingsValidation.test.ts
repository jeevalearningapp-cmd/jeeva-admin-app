import { describe, it, expect } from "vitest";
import {
  validateSettings,
  getValidationErrorMessage,
} from "../settingsValidation";

describe("validateSettings", () => {
  describe("Site Name Validation", () => {
    it("should fail when site name is empty", () => {
      const result = validateSettings({ siteName: "" });
      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual({
        field: "siteName",
        message: "Site name is required",
      });
    });

    it("should fail when site name exceeds 255 characters", () => {
      const result = validateSettings({ siteName: "a".repeat(256) });
      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual({
        field: "siteName",
        message: "Site name must be less than 255 characters",
      });
    });

    it("should pass with valid site name", () => {
      const result = validateSettings({ siteName: "Jeeva Learning" });
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });
  });

  describe("Email Validation", () => {
    it("should fail with invalid contact email", () => {
      const result = validateSettings({
        siteName: "Test",
        contactEmail: "invalid-email",
      });
      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual({
        field: "contactEmail",
        message: "Contact email is invalid",
      });
    });

    it("should fail with invalid support email", () => {
      const result = validateSettings({
        siteName: "Test",
        supportEmail: "invalid@",
      });
      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual({
        field: "supportEmail",
        message: "Support email is invalid",
      });
    });

    it("should pass with valid emails", () => {
      const result = validateSettings({
        siteName: "Test",
        contactEmail: "contact@jeeva.com",
        supportEmail: "support@jeeva.com",
      });
      expect(result.isValid).toBe(true);
    });

    it("should pass when emails are not provided", () => {
      const result = validateSettings({ siteName: "Test" });
      expect(result.isValid).toBe(true);
    });
  });

  describe("File Upload Size Validation", () => {
    it("should fail when maxFileUploadSize is empty", () => {
      const result = validateSettings({
        siteName: "Test",
        maxFileUploadSize: "",
      });
      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual({
        field: "maxFileUploadSize",
        message: "File upload size is required",
      });
    });

    it("should fail when maxFileUploadSize is 0", () => {
      const result = validateSettings({
        siteName: "Test",
        maxFileUploadSize: 0,
      });
      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual({
        field: "maxFileUploadSize",
        message: "File upload size is required",
      });
    });

    it("should fail when maxFileUploadSize is less than 1", () => {
      const result = validateSettings({
        siteName: "Test",
        maxFileUploadSize: -5,
      });
      expect(result.isValid).toBe(false);
    });

    it("should fail when maxFileUploadSize exceeds 100", () => {
      const result = validateSettings({
        siteName: "Test",
        maxFileUploadSize: 101,
      });
      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual({
        field: "maxFileUploadSize",
        message: "File upload size cannot exceed 100 MB",
      });
    });

    it("should pass with valid file upload size", () => {
      const result = validateSettings({
        siteName: "Test",
        maxFileUploadSize: 5,
      });
      expect(result.isValid).toBe(true);
    });
  });

  describe("Session Timeout Validation", () => {
    it("should fail when sessionTimeout is empty", () => {
      const result = validateSettings({
        siteName: "Test",
        sessionTimeout: "",
      });
      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual({
        field: "sessionTimeout",
        message: "Session timeout is required",
      });
    });

    it("should fail when sessionTimeout is 0", () => {
      const result = validateSettings({
        siteName: "Test",
        sessionTimeout: 0,
      });
      expect(result.isValid).toBe(false);
    });

    it("should fail when sessionTimeout is less than 5", () => {
      const result = validateSettings({
        siteName: "Test",
        sessionTimeout: 3,
      });
      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual({
        field: "sessionTimeout",
        message: "Session timeout must be at least 5 minutes",
      });
    });

    it("should fail when sessionTimeout exceeds 1440", () => {
      const result = validateSettings({
        siteName: "Test",
        sessionTimeout: 1500,
      });
      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual({
        field: "sessionTimeout",
        message: "Session timeout cannot exceed 1440 minutes (24 hours)",
      });
    });

    it("should pass with valid session timeout", () => {
      const result = validateSettings({
        siteName: "Test",
        sessionTimeout: 60,
      });
      expect(result.isValid).toBe(true);
    });
  });

  describe("Password Length Validation", () => {
    it("should fail when passwordMinLength is empty", () => {
      const result = validateSettings({
        siteName: "Test",
        passwordMinLength: "",
      });
      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual({
        field: "passwordMinLength",
        message: "Password minimum length is required",
      });
    });

    it("should fail when passwordMinLength is less than 6", () => {
      const result = validateSettings({
        siteName: "Test",
        passwordMinLength: 4,
      });
      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual({
        field: "passwordMinLength",
        message: "Password minimum length must be at least 6",
      });
    });

    it("should fail when passwordMinLength exceeds 128", () => {
      const result = validateSettings({
        siteName: "Test",
        passwordMinLength: 150,
      });
      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual({
        field: "passwordMinLength",
        message: "Password minimum length cannot exceed 128",
      });
    });

    it("should pass with valid password length", () => {
      const result = validateSettings({
        siteName: "Test",
        passwordMinLength: 8,
      });
      expect(result.isValid).toBe(true);
    });
  });

  describe("Multiple Validation Errors", () => {
    it("should return multiple errors when multiple fields are invalid", () => {
      const result = validateSettings({
        siteName: "",
        contactEmail: "invalid-email",
        maxFileUploadSize: 0,
        sessionTimeout: 2,
      });
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThanOrEqual(4);
    });
  });
});

describe("getValidationErrorMessage", () => {
  it("should return error message for field", () => {
    const errors = [
      { field: "siteName", message: "Site name is required" },
      { field: "contactEmail", message: "Invalid email" },
    ];
    expect(getValidationErrorMessage("siteName", errors)).toBe(
      "Site name is required",
    );
  });

  it("should return undefined when field has no error", () => {
    const errors = [{ field: "siteName", message: "Site name is required" }];
    expect(getValidationErrorMessage("contactEmail", errors)).toBeUndefined();
  });
});
