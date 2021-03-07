import { createContext, useContext } from "react";

export const NotificationContext = createContext();
export const NotificationContextProvider = NotificationContext.Provider;

export function useNotification() {
    return useContext(NotificationContext);
}
