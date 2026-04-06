const nextJest = require("next/jest");

const createJestConfig = nextJest({ dir: "./" });

/** @type {import("jest").Config} */
const customJestConfig = {
  testEnvironment: "jest-environment-jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  testMatch: ["<rootDir>/tests/**/*.test.[jt]s?(x)"],
  moduleDirectories: ["node_modules", "<rootDir>"],
};

module.exports = createJestConfig(customJestConfig);
