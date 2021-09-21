module.exports = {
    preset: "ts-jest/presets/default-esm",
    testEnvironment: "node",
    globals: {
        "ts-jest": {
            useESM: true,
        },
    },
    setupFiles: ["./test.env.js"],
};
