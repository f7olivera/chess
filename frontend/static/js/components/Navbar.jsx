import React from "react";
import ReactDOM from "react-dom";
import {Link} from "react-router-dom";


export default function Navbar() {
  const content = (
    <>
      <li className="nav-item dropdown">
        <a className="nav-link" href="#" id="navbarDropdown" role="button"
           data-bs-toggle="dropdown" aria-expanded="false">
          Play
        </a>
        <ul className="dropdown-menu" aria-labelledby="navbarDropdown">
          <li>
            <a href="#" className="dropdown-item" type="button" data-bs-toggle="modal" data-bs-target="#exampleModal"
               id="create_button">
              With a friend
            </a>
          </li>
          <li>
            <Link to="play/stockfish"
               id="launch-stockfish-settings"
               className="nav-link btn btn-primary dropdown-item"
               data-bs-toggle="modal"
               data-bs-target="#stockfishModal">With the computer</Link>
          </li>
          <li>
            <Link className="dropdown-item" to="play/offline">Over the board</Link>
          </li>
        </ul>
      </li>

      <li className="nav-item">
        <Link className='nav-link' id='editor' to={'editor'}>Editor</Link>
      </li>
      {JSON.parse(document.getElementById('user').textContent) !== 'Anonymous' ?
        (
          <li className="nav-item dropdown user">
            <a className="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button"
               data-bs-toggle="dropdown" aria-expanded="false">
              {JSON.parse(document.getElementById('user').textContent)}
            </a>
            <ul className="dropdown-menu" aria-labelledby="navbarDropdown">
              <li><Link className="dropdown-item" to="games/all">My games</Link></li>
              <li><Link className="dropdown-item"
                        to="games/bookmarks">Favorites</Link></li>
              <li>
                <hr className="dropdown-divider"/>
              </li>
              <li><a className="dropdown-item" href="/logout">Logout</a></li>
            </ul>
          </li>
        ) :
        (
          <li className="nav-item login">
            <a className="nav-link" href="/login">Log In</a>
          </li>
        )}
    </>
  );
  return ReactDOM.createPortal(content, document.querySelector('#navbar-links'));
}
