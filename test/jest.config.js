module.exports = {
  rootDir: '../',
  transform: {
    '\\.ts$': 'ts-jest',
  },
  clearMocks: true,
  testEnvironment: 'miniflare',
  setupFilesAfterEnv: ['./test/jest.setup.ts'],
};
