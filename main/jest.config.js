module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    roots: ['<rootDir>/src'],
    testMatch: ['**/*.spec.ts'],
    collectCoverageFrom: [
        'src/**/*.ts',
        '!src/**/*.spec.ts',
        '!src/main.ts',
        '!src/**/*.module.ts',
    ],
    moduleNameMapper: {
        '^src/(.*)$': '<rootDir>/src/$1',
    },
    moduleFileExtensions: ['js', 'json', 'ts'],
    transform: {
        '^.+\\.(t|j)s$': 'ts-jest',
    },
    coverageDirectory: './coverage',
    testTimeout: 10000,
};
