// Documentation for socket messages

type Server2Client =
    | "update_game" // Updates the whole game
    | "update_game_options" // Sends the updated game object to players
    | "update_player" // Sends the updated player object
    | "update_players" // Updates all players with client players object
    | "deal_black_cards" // Server deals a black card to card czar
    | "notification" // Send messages that are shown as notifications to client
    | "show_white_card" // Sends a white card to be shown
    | "update_game_and_players" // Updates game and players
    | "upgraded_to_host" // Receiver is now host
    | "update_timers"; // Updates just the timers

type Client2Server =
    | "join_game" // Player joins a game
    | "update_game_options" // Update game options
    | "add_card_pack" // Send the id of card pack to the server
    | "remove_card_pack" // Remove a card pack from the game
    | "start_game" // Starts the game from lobby
    | "draw_black_cards" // New socket calls for black cards
    | "select_black_card" // Returns the selected black card and the other not selected blackcards
    | "play_white_cards" // Client sends white cards it wants to play that turn
    | "show_next_white_card" // In the reading phase returns the cards played by one player
    | "pick_winning_card" // Card Czar picks the winner and sends the winning card IDs back
    | "start_round" // Start new round after earlier round has ended
    | "return_to_lobby" // Returns back to lobby and resets game
    | "toggle_player_mode" // Used to switch between spectator and active player
    | "kick_player" // Used to kick player or force them to spectator
    | "set_player_name" // Used to select player name
    | "set_player_avatar"; // Used to update player avatar
