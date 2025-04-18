module.exports = {
    testMatch: ['**/test/services/**/*.test.ts'], // Asegúrate de que este patrón sea correcto
    testEnvironment: 'node',
    transform: {
      '^.+\\.ts$': 'ts-jest', // Transforma los archivos .ts a .js
    },
  };