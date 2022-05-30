import {chat_message} from "../redux/gameSlice";
import {sendWebsocketMessage} from "../utils/misc";
import React from "react";
import {useDispatch, useSelector} from "react-redux";
import Linkify from 'react-linkify';

function Chat({ws}) {
  const {
    spectator,
    playingAs,
    chat
  } = useSelector((state) => state.game);
  const dispatch = useDispatch();

  const addChatMessage = (e) => {
    const message = e.target.message.value;
    const username = JSON.parse(document.querySelector('#user').textContent);
    const relativeSender = username === 'Anonymous' && !spectator ? `[${playingAs === 'w' ? 'white' : 'black'}]` : username;
    const sender = username;
    if (0 < message.length && message.length <= 128) {
      dispatch(chat_message({chat_message: {message, sender: relativeSender, me: true}}));
      sendWebsocketMessage(ws, {name: 'chat_message', payload: {message, sender}});
      e.target.message.value = '';
    }
    e.preventDefault();
  }

  React.useEffect(() => {
    const messages = document.querySelector('.messages');
    messages.scrollTop = messages.scrollHeight;
  }, [chat]);

  return (
    <div className='chat'>
      <div className='chat-title'>Chat room</div>
      <div className='messages'>
        <Linkify>
          {chat.map((message) => (
            <p className={`message${message.me ? ' me' : ''}`}>
              <span className='chat-username'>{message['sender']}</span>
              <span className='chat-message'>{message['message']}</span>
            </p>
          ))}
        </Linkify>
      </div>
      <form onSubmit={addChatMessage} autoComplete='off'>
        <input type='text' name='message' placeholder='Send a message'/>
      </form>
    </div>
  )
}

export default React.memo(Chat);