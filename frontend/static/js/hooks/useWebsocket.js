import React from "react";
import Chess from "chess.js";
import {useDispatch, useSelector} from "react-redux";
import {gameActions, setState} from "../redux/gameSlice";
import {verbose2uci} from "../utils/misc.js";


export default function useWebsocket({chessState: [chess, setChess],
                                      whitTimeState: [whiteTime, setWhiteTime],
                                      blackTimeState: [blackTime, setBlackTime]}) {
  const ws = React.useRef(null);
  const [connected, setConnected] = React.useState(true);
  const state = useSelector((state) => state.game);
  const dispatch = useDispatch();

  const getWebsocket = () => {
    const roomName = JSON.parse(document.querySelector('#room-name').textContent);
    const websocket = new WebSocket(
      'wss://'
      + window.location.host
      + '/ws/game/'
      + roomName
      + '/'
    );

    websocket.onopen = () => {
      console.log("Websocket opened.");
      state.connectionState !== 'd-none' && dispatch(setState({connectionState: 'reconnected'}));
      setConnected(true);
    };
    websocket.onclose = () => {
      console.log("Websocket closed, trying to reconnect...");
      dispatch(setState({connectionState: 'reconnecting'}));
      setConnected(false);
    }
    return websocket;
  }

  // Connects websocket 
  React.useEffect(() => {
    const websocket = getWebsocket();
    ws.current = websocket;

    return () => websocket.close();
  }, []);

  // Reconnects websocket
  React.useEffect(() => {
    if (!connected && ws.current !== null) {
      const reconnectInterval = setInterval(() => {
        if (ws.current && ws.current.readyState === 1) {
          clearInterval(reconnectInterval);
          setConnected(true);
        } else {
          ws.current = getWebsocket();
        }
      }, 1000);
    }
  }, [connected]);

  React.useEffect(() => {
    if (!ws.current) return;

    // Sends new moves to websockets
    const moveVerbose = chess.history({verbose: true})
      ? chess.history({verbose: true})[chess.history().length - 1]
      : null;
    const move_san = chess.history() ? chess.history()[chess.history().length - 1] : null;
    if (move_san) {
      const move_uci = verbose2uci(moveVerbose);
      if (state.lastServerMove !== move_uci) {
        if (ws.current.readyState === 1) {
          ws.current.send(JSON.stringify({
            'move': move_san,
            'start_ts': Date.now()
          }));
        } else {
          const chessCopy = new Chess(chess.fen());
          chessCopy.load_pgn(chess.pgn());
          chessCopy.undo();
          setChess(chessCopy);
        }
      }
    }

    // Executes actions from server
    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      // Object.keys(data).forEach((key) => console.log(key + '\n', data[key]));
      if (['connect', 'start', 'move', 'draw_offer', 'end', 'undo', 'stop_waiting',
           'spectate', 'wait_before_start', 'chat_message'].includes(data['action'])) {
        dispatch(gameActions[data['action']](data))
      }
      if (data['action'] === 'connect') {
        setWhiteTime(parseFloat(data['white_time']))
        setBlackTime(parseFloat(data['black_time']))
      }
    };

    if (chess.game_over()) {
      dispatch(gameActions.end({end_type: chess.in_checkmate() ? `Checkmate. ${chess.turn() === 'w' ? 'Black' : 'White'} wins.` : 'Draw.'}));
    }
  }, [chess, connected]);

  // Checks for timeouts
  React.useEffect(() => {
    if (!ws.current || ws.current.readyState !== ws.current.OPEN) return;
    if (whiteTime <= 0 || blackTime <= 0) {
      ws.current.send(JSON.stringify({
        'timeout': true,
      }));
    }
  }, [whiteTime, blackTime]);

  return ws.current;
}
