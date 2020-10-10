// Documentation for socket messages

type Server2Client =
    | "update_game"             // Updates the whole game
    | "update_game_options"     // Sends the updated game object to players
    | "update_player"           // Sends the updated player object
    | "update_players"          // Updates all players with client players object

type Client2Server =
    | "join_game"               // Player joins a game
    | "update_game_options"     // Update game options
    | "add_card_pack"           // Send the id of card pack to the server
    | "remove_card_pack"        // Remove a card pack from the game
    | "start_game"              // Starts the game from lobby