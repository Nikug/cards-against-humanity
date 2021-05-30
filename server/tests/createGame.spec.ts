// import { createGame } from "../modules/games/createGame";

const createGame = () => {
    return "Created game!";
};

describe("Create game", () => {
    test("it should create game", () => {
        expect(createGame()).toEqual("Created game!");
    });
});
