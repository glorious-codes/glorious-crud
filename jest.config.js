module.exports = {
  "collectCoverageFrom": ['<rootDir>/src/**/!(app).js'],
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
