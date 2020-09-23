// Documentation for socket messages

type Server2Client =
    | "updateGame"          // Sends the updated game object to players

type Client2Server =
    | "join"                // Player joins a game
    | "playWhiteCards"      // Player plays cards
    | "kickPlayer"          // Player is kicked