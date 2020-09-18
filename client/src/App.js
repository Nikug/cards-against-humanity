import React, { useState, useEffect } from 'react';
import socketIOClient from "socket.io-client";
import './App.css';

const ENDPOINT = "http://127.0.0.1:4000";

function App() {
    const [state, setState] = useState("");

    useEffect(() => {
        const socket = socketIOClient(ENDPOINT);
        socket.on("FromAPI", data => {
            setState(data);
        });
    }, []);

    return (
        <div className="App">
            <p>{state}</p>
        </div>
    );
}

export default App;
