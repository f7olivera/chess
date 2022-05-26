import { configureStore } from '@reduxjs/toolkit'
import chessReducer from "./chessSlice";
import gameReducer from "./gameSlice.js";

export default configureStore({
  reducer: {
    // chess: chessReducer,
    game: gameReducer,
  },
})
