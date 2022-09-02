import { configureStore } from '@reduxjs/toolkit'
import gameReducer from "./gameSlice.js";

export default configureStore({
  reducer: {
    game: gameReducer,
  },
})
