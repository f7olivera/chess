import React from 'react';
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import Index from './js/components/Index.jsx'
import Game from './js/components/Game.jsx'
import OfflineGame from "./js/components/OfflineGame.jsx";
import StockfishGame from "./js/components/StockfishGame.jsx";
import Games from './js/components/Games.jsx'
import Editor from './js/components/Editor.jsx'
import Analysis from './js/components/Analysis.jsx'
import Miniboard from "./js/components/Miniboard.jsx";
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
        <Routes>
          <Route path='' element={<Index/>}/>
          <Route path='play/offline' element={<OfflineGame/>}/>
          <Route path='play/stockfish'
                 element={<StockfishGame
                   fen={
                     JSON.parse(document.getElementById('stockfish-fen').textContent)
                   }
                   playingAs={
                     JSON.parse(document.getElementById('playing-as').textContent) === 'random' ?
                       (Math.round(Math.random()) ? 'w' : 'b') :
                       JSON.parse(document.getElementById('playing-as').textContent)
                   }
                   skillLevel={
                     JSON.parse(document.getElementById('stockfish-skill-level').textContent)
                   }
                   thinkingTime={
                     JSON.parse(document.getElementById('stockfish-thinking-time').textContent)
                   }/>
                 }/>
          <Route path='play/:room_name' element={<Game/>}/>
          <Route path='editor'
                 element={<Editor postFen={JSON.parse(document.getElementById('post-fen').textContent)}/>}/>
          <Route path='games/:filter_option' element={<Games/>}/>
          <Route path='favorites'/>
          <Route path='analysis'
                 element={<Analysis postFen={JSON.parse(document.getElementById('post-fen').textContent)}
                                    postPgn={JSON.parse(document.getElementById('post-pgn').textContent)}/>}>
            <Route path="*" element={<Analysis/>} postFen={JSON.parse(document.getElementById('post-fen').textContent)}
                   postPgn={JSON.parse(document.getElementById('post-pgn').textContent)}/>} />
          </Route>
        </Routes>
      </Router>
    </Provider>
  );
}
