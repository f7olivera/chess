import React from "react";
import ReactDOM from 'react-dom';
import App from "./App.js";
import * as newGameValidationFunctions from "./js/utils/newGameForm.js";
import * as registerValidationFunctions from "./js/utils/registerForm.js";
// import {fetchMoreGames, saveGames} from "./js/components/Games.jsx";

Object.entries(newGameValidationFunctions).forEach(([name, exported]) => window[name] = exported);
Object.entries(registerValidationFunctions).forEach(([name, exported]) => window[name] = exported);
// window[fetchMoreGames.name] = fetchMoreGames
// window[saveGames.name] = saveGames

ReactDOM.render(<App />, document.querySelector('#root'));
