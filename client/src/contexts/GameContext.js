import { createContext, useContext } from "react";

export const GameContext = createContext();
export const GameContextProvider = GameContext.Provider;

export function useGameContext() {
    return useContext(GameContext);
}
