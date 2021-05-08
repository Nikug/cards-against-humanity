import * as CAH from "types";
import * as SocketIO from "socket.io";
import * as pg from "pg";

import { getGame, setGame } from "./gameUtil";

import { Password } from "../../consts/gameSettings";
import { sanitizeString } from "../utilities/sanitize";
import { validateHost } from "../utilities/validate";
