/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: "jest-environment-jsdom",
  testMatch: ["<rootDir>/tests/**/*.test.{ts,tsx}"],
  transform: {
    "^.+\\.(ts|tsx|js|jsx)$": ["babel-jest", { configFile: "./babel.config.test.js" }],
  },
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
    "^next/link$": "<rootDir>/tests/__mocks__/next/link.tsx",
    "\\.(css|less|scss|sass)$": "<rootDir>/tests/__mocks__/styleMock.js",
  },
  setupFilesAfterEnv: ["<rootDir>/tests/jest.setup.ts"],
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json"],
};
