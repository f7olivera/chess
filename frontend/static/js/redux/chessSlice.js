import { createSlice } from '@reduxjs/toolkit'
import Chess from "../../../node_modules/chess.js/chess";

// export const chessSlice = createSlice({
//   name: 'chess',
//   initialState: {
//     fen: '',
//     pgn: '',
//   },
//   reducers: {
//     update: (state, action) => {
//       // Redux Toolkit allows us to write "mutating" logic in reducers. It
//       // doesn't actually mutate the state because it uses the Immer library,
//       // which detects changes to a "draft state" and produces a brand new
//       // immutable state based off those changes
//       console.log(action)
//       state.fen = action.payload.fen;
//       state.pgn = action.payload.pgn ? action.payload.pgn : state.pgn;
//     }
//   },
// })

// Action creators are generated for each case reducer function
// export const { update } = chessSlice.actions

// export default chessSlice.reducer
