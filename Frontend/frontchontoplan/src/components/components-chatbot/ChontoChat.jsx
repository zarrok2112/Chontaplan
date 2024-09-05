import React, { useState, useEffect, useRef } from 'react';
import './Chontochat.css';
import pingui from '../../assets/pingui.png';
import { useSelector } from 'react-redux';
import services from '../../services/services';


const Sidebar = ({ onNewChat, chatHistory, onDeleteChat }) => (
  <div className="sidebar">
    <button className="sidebar-button" onClick={onNewChat}>
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="5" x2="12" y2="19"></line>
        <line x1="5" y1="12" x2="19" y2="12"></line>
      </svg>
      New chat
    </button>
    <div className="chat-list">
      {chatHistory.map((chat, index) => (
        <div key={index} className="chat-list-item">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
          {chat.title}
          <button className="delete-chat-button" onClick={() => onDeleteChat(index)}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              <line x1="10" y1="11" x2="10" y2="17"></line>
              <line x1="14" y1="11" x2="14" y2="17"></line>
            </svg>
          </button>
        </div>
      ))}
    </div>
  </div>
);

const ChatMessage = ({ message }) => (
  <div className={`message ${message.role}`}>
    <img 
      src={message.role === 'user' ? pingui : 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/11590438-EWeCIDQnYUKIO0022fK7pwTwHVjdVs.png'} 
      alt={message.role} 
      className="avatar" 
    />
    <div className="message-content">
      {message.content}
    </div>
  </div>
);

const ChatInput = ({ onSendMessage, isLoading }) => {
  const [inputMessage, setInputMessage] = useState('');

  const handleSend = () => {
    if (inputMessage.trim() !== '' && !isLoading) {
      onSendMessage(inputMessage);
      setInputMessage('');
    }
  };

  return (
    <div className="input-area">
      <div className="input-container">
        <input
          type="text"
          className="message-input"
          placeholder="Escribi ve..."
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          disabled={isLoading}
        />
        <button className="send-button" onClick={handleSend} disabled={isLoading}>
          {isLoading ? (
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          )}
        </button>
      </div>
    </div>
  );
};

const ChatGPTClone = () => {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Contame ve, que necesitas?' },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [webSocket, setWebSocket] = useState(null); // Estado para la conexión WebSocket
  const messagesEndRef = useRef(null);
  const token = useSelector((state) => state.token.value);

  useEffect(() => {
    // Obtener el token de acceso desde localStorage o desde donde lo tengas guardado
    const accessToken = token;
    /* const accessToken = localStorage.getItem('access_token'); */

    if (!accessToken) {
      console.error('No se encontró el token de acceso. Por favor, inicia sesión primero.');
      return;
    }

    services.createChat(accessToken).then((response)=> {
      console.log(response);
      
      if(response.status === 201 && response !== undefined) {

        // Crear la conexión WebSocket
        /* const ws = new WebSocket(`ws://localhost:8000/ws/chat/?token=${accessToken}`); */
        const ws = new WebSocket(`ws://localhost:8000/ws/chat/${response.data.token}/`);
        
        ws.onopen = () => {
          console.log('Conexión WebSocket establecida');
          // Enviar el token de autenticación en la cabecera
          /* ws.send(JSON.stringify({ type: 'auth', token: response.data.token })); */
          ws.send(JSON.stringify({  "message": "como te encuentras","sender": "usuario" }));
        };
    
        ws.onmessage = (event) => {
          const data = JSON.parse(event.data);
          setMessages((prevMessages) => [...prevMessages, { role: data.sender, content: data.message }]);
        };
    
        ws.onclose = () => {
          console.log('Conexión WebSocket cerrada');
        };
    
        ws.onerror = (error) => {
          console.error('Error en la conexión WebSocket:', error);
        };
    
        setWebSocket(ws);
    
        return () => {
          // Cerrar la conexión al desmontar el componente
          ws.close();
        };
      } else {
        console.log('error en la creacion del chat');
      }
    }).catch((error)=>{
      console.log(error);
    })

  }, []);

  useEffect(() => {
    const savedChatHistory = localStorage.getItem('chatHistory');
    if (savedChatHistory) {
      setChatHistory(JSON.parse(savedChatHistory));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
  }, [chatHistory]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (message) => {
    setMessages(prev => [...prev, { role: 'user', content: message }]);
    setIsLoading(true);

    // Enviar mensaje al servidor WebSocket
    if (webSocket) {
      webSocket.send(JSON.stringify({ message: message, sender: 'user' }));
    }
  };

  const handleNewChat = () => {
    const newChatTitle = messages.length > 1 ? messages[1].content.slice(0, 30) + '...' : 'New Chat';
    setChatHistory(prev => [...prev, { title: newChatTitle, messages: messages }]);
    setMessages([{ role: 'assistant', content: 'Otra cosa ve?' }]);
  };

  const handleDeleteChat = (index) => {
    setChatHistory(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="chat-container">
      <Sidebar onNewChat={handleNewChat} chatHistory={chatHistory} onDeleteChat={handleDeleteChat} />
      <div className="main-content">
        <header className="header">
          <button className="menu-button">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
          <h1>Chontochat</h1>
        </header>
        <div className="chat-messages">
          {messages.map((message, index) => (
            <ChatMessage key={index} message={message} />
          ))}
          <div ref={messagesEndRef} />
        </div>
        <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
      </div>
    </div>
  );
};

export default ChatGPTClone;
