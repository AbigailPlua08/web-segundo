import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  moduleFileExtensions: ['ts', 'js', 'json'],
  coverageDirectory: '../coverage',
  moduleNameMapper: {
    '^@arquitectura/shared$': '<rootDir>/../../shared',
    '^@arquitectura/shared/(.*)$': '<rootDir>/../../shared/$1',
  },
  clearMocks: true,
  transform: {
    '^.+\\.(t|j)s$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/../tsconfig.spec.json',
      },
    ],
  },
};

export default config;
