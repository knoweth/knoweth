module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  // Skip /config/webpack
  testPathIgnorePatterns: ["/config/"],
};
