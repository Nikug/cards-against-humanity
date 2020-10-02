// Documentation for socket messages

type Server2Client =
    | "update_game_options"     // Sends the updated game object to players

type Client2Server =
    | "join_game"               // Player joins a game
    | "update_game_options"     // Update game options
    | "playWhiteCards"          // Player plays cards
    | "kickPlayer"              // Player is kicked