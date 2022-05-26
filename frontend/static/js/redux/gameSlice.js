import {createSlice} from '@reduxjs/toolkit'
import Chess from "../../../node_modules/chess.js/chess";
import {getLastMove} from "../misc/misc.js";


export const gameSlice = createSlice({
  name: 'game',
  initialState: {
    fen: '',
    pgn: '',
    connectionState: 'd-none',
    spectator: false,
    whitePlayer: undefined,
    blackPlayer: undefined,
    end_type: undefined,
    started: false,
    endType: undefined,
    resignConfirmation: false,
    gameInfo: undefined,
    orientation: 'w',
    playingAs: '',
    lastServerMove: '',
    gameLoaded: false,
    drawOffer: false,
    bookmark: false,
    wait: false,
    waitingFor: undefined,
    chat: []
  },
  reducers: {
    connect: (state, action) => {
      const initialChess = new Chess(action.payload['starting_fen']);
      action.payload['pgn'] && action.payload['pgn'] !== '.' && initialChess.load_pgn(action.payload['pgn']);
      state.fen = action.payload['starting_fen'];
      state.pgn = action.payload['pgn'];
      state.orientation = action.payload['playing_as'];
      state.whitePlayer = action.payload['white_player'];
      state.blackPlayer = action.payload['black_player'];
      state.whiteTime = action.payload['white_time'];
      state.blackTime = action.payload['black_time'];
      state.endType = action.payload['end_type'];
      state.started = Boolean(action.payload['started']);
      state.gameInfo = {
        time: parseInt(action.payload['time']),
        created_time: action.payload['created_time'],
        outcome: action.payload['outcome'],
      };
      state.playingAs = action.payload['playing_as'];
      state.lastServerMove = initialChess.history().length !== 0 && getLastMove(initialChess);
      state.gameLoaded = true;
      state.drawOffer = action.payload['draw_offer'];
      state.bookmark = action.payload['bookmark'];
      state.wait = action.payload['wait'];
      state.chat = action.payload['chat'];
    },
    spectate: (state, action) => {
      state.spectator = true;
      const initialChess = new Chess(action.payload['starting_fen']);
      action.payload['pgn'] && action.payload['pgn'] !== '.' && initialChess.load_pgn(action.payload['pgn']);
      state.fen = action.payload['starting_fen'];
      state.pgn = action.payload['pgn'];
      state.orientation = action.payload['playing_as'];
      state.whitePlayer = action.payload['white_player'];
      state.blackPlayer = action.payload['black_player'];
      state.whiteTime = action.payload['white_time'];
      state.blackTime = action.payload['black_time'];
      state.endType = action.payload['end_type'];
      state.started = Boolean(action.payload['started']);
      state.gameInfo = {
        time: parseInt(action.payload['time']),
        created_time: action.payload['created_time'],
        outcome: action.payload['outcome'],
      };
      state.lastServerMove = initialChess.history().length !== 0 && getLastMove(initialChess);
      state.gameLoaded = true;
      state.wait = action.payload['wait'];
      state.chat = action.payload['chat'];
    },
    start: (state) => {
      state.started = true;
    },
    undo: (state, action) => {
      const newChess = new Chess(state.fen);
      newChess.load_pgn(state.pgn);
      newChess.undo();
      state.fen = newChess.fen();
      state.pgn = newChess.pgn();
    },
    move: (state, action) => {
      state.lastServerMove = action.payload['uci'];
      state.pgn = action.payload['pgn'];
      state.whiteTime = action.payload['white_time'];
      state.blackTime = action.payload['black_time'];
    },
    resign_confirmation: (state, action) => {
      state.resignConfirmation = action.payload['resign_confirmation'];
    },
    draw_offer: (state, action) => {
      state.drawOffer = action.payload['draw_offer'];
    },
    end: (state, action) => {
      state.endType = action.payload['end_type'];
    },
    flip: (state) => {
      state.orientation = state.orientation === 'w' ? 'b' : 'w';
    },
    wait_before_start: (state, action) => {
      state.wait = true;
      state.waitingFor = action.payload['waiting_for'];
    },
    stop_waiting: (state, action) => {
      state.wait = false;
      state.whitePlayer = action.payload['white_player'];
      state.blackPlayer = action.payload['black_player'];
    },
     chat_message: (state, action) => {
      state.chat = state.chat.concat([action.payload['chat_message']]);
    },
    setState: (state, action) => {
      Object.keys(action.payload).forEach((key) => state[key] = action.payload[key]);
    },
  },
})

// Action creators are generated for each case reducer function
export const {connect, spectate, start, undo, move, resign_confirmation,
              draw_offer, end, flip, wait_before_start, stop_waiting, chat_message, setState} = gameSlice.actions

export const gameActions = {connect, spectate, start, undo, move, resign_confirmation,
                            draw_offer, end, flip, wait_before_start, stop_waiting, chat_message, setState}

export default gameSlice.reducer
