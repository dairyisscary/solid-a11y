module.exports = {
  clearMocks: true,
  moduleFileExtensions: ["tsx", "ts", "js"],
  resolver: "jest-node-exports-resolver",
  testEnvironment: require.resolve("./jest.env.cjs"),
  transform: {
    "^.+\\.tsx?$": "babel-jest",
  },
};
