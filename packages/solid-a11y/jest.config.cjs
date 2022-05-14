module.exports = {
  clearMocks: true,
  moduleFileExtensions: ["tsx", "ts", "js"],
  testEnvironment: "jest-environment-jsdom",
  transform: {
    "^.+\\.tsx?$": "babel-jest",
  },
};
