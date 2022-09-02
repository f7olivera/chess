import React from 'react';
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import Index from './js/components/Index.jsx'
import Navbar from "./js/components/Navbar.jsx";
import Game from './js/components/Game.jsx'
import OfflineGame from "./js/components/OfflineGame.jsx";
import StockfishGame from "./js/components/StockfishGame.jsx";
import Games from './js/components/Games.jsx'
import Editor from './js/components/Editor.jsx'
import Analysis from './js/components/Analysis.jsx'
import Miniboard from "./js/components/Miniboard.jsx";
import Authentication from "./js/components/Authentication.jsx";
import store from "./js/redux/store.js";
import {Provider} from 'react-redux'


export default function App() {
  if (window.Cypress) {
    window.store = store
  }

  return (
    <Provider store={store}>
      <Miniboard container={document.querySelector('.create-board')}/>
      <Miniboard container={document.querySelector('.create-stockfish-board')}/>
      <Router>
        <Navbar />
        <Routes>
          <Route path='' element={<Index/>}/>
          <Route path='play/offline' element={<OfflineGame/>}/>
          <Route path='play/stockfish' element={<StockfishGame />} />
          <Route path='play/:room_name' element={<Game/>}/>
          <Route path='editor' element={<Editor />}/>
          <Route path='games/:filter_option' element={<Games/>}/>
          <Route path='favorites'/>
          <Route path='register' element={<Authentication />}/>
          <Route path='login' element={<Authentication />}/>
          <Route path='analysis' element={<Analysis />}>
            <Route path="*" element={<Analysis/>} />} />
          </Route>
        </Routes>
      </Router>
    </Provider>
  );
}
