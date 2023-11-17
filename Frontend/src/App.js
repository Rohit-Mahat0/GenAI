import React, { useState, useRef, useEffect } from 'react';
import bulb1 from './bulb1.png';
import bulb2 from './bulb2.png';
import './App.css';
import SendIcon from '@mui/icons-material/Send';

const MyDocumentUploader = () => {
  const [file, setFile] = useState(null);
  const [question, setQuestion] = useState('');
  const [uploaded, setUploaded] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const fileInputRef = useRef(null);
  const chatHistoryRef = useRef(null);

  const handleFileUpload = (event) => {
    const uploadedFile = event.target.files[0];
    setFile(uploadedFile);
    setUploaded(true);
  };

  const handleQuestionInput = (event) => {
    setQuestion(event.target.value);
  };

  const handleGetAnswer = () => {
    if (!file || !question) {
      alert('Please select a file and enter a question.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('question', question);

    fetch('http://localhost:5000/get_answer', {
      method: 'POST',
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        const updatedChatHistory = [
          ...chatHistory,
          { type: 'question', content: question },
          { type: 'answer', content: data.answer },
        ];
        setChatHistory(updatedChatHistory);
        setQuestion('');
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  };

  const handleImageClick = () => {
    fileInputRef.current.click();
  };

  // Automatically scroll to the bottom of the chat history when it updates
  useEffect(() => {
    if (chatHistoryRef.current) {
      chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
    }
  }, [chatHistory]);

  return (
    <div className="app-container">
      <div className="bulb">
        {!uploaded ? (
          <img
            src={bulb2}
            alt="Bulb2"
            onClick={handleImageClick}
            className="bulb"
            style={{ width: '200px', height: '300px'}}
          />
        ) : (
          <img
            src={bulb1}
            alt="Bulb1"
            style={{ width: '200px', height: '300px'}}
          />
        )}
      </div>
      <div className="chat-container chat_box_align_cntr" >
        {uploaded && (
          <div className="chat-history" ref={chatHistoryRef}>
            {chatHistory.map((chat, index) => (
              <div
                key={index}
                className={chat.type === 'question' ? 'question' : 'answer'}
              >
                {chat.content}
              </div>
            ))}
          </div>
        )}<br/>        
        <div className="input-area" style={{display:"inline-flex"}}>
          <div className="input-container">
            <textarea
              className="textarea" 
              value={question}
              onChange={handleQuestionInput}
              placeholder="Enter your question"
              style={{ height: '20px', resize: 'none', width: "80%", borderRadius: '10px' }}
            />
            <SendIcon className="send-icon" onClick={handleGetAnswer} />
          </div>
        </div>
        {!uploaded && (
          <input
            ref={fileInputRef}
            type="file"
            accept=".docx"
            onChange={handleFileUpload}
            style={{ display: 'none' }}
          />
        )}
      </div>
    </div>
  );
};

export default MyDocumentUploader;
