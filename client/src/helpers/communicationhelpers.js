import { socket } from "../sockets/socket";
import axios from "axios";

export function socketEmit(method, paramsObject) {
    socket.emit(method, paramsObject);
}

export function axiosPost(route) {
    axios.post("/g").then((res) => {
        return res;
    });
}
