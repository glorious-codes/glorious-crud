module.exports = {
  "collectCoverageFrom": ['<rootDir>/src/**/*.js'],
  "coverageDirectory": "./coverage/",
  "coverageReporters": ["html"],
  "coverageThreshold": {
      "global": {
        "branches": 100,
        "functions": 100,
        "lines": 100,
        "statements": 100
      }
    }
}
