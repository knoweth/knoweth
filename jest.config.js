module.exports = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  // Skip /config/webpack
  testPathIgnorePatterns: ["/config/"],
};
