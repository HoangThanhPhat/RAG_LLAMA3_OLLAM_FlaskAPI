import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Form, Button, ListGroup } from 'react-bootstrap';
import axios from 'axios';
import './ChatTemplate.scss';

function ChatTemplate() { 
    const [query, setQuery] = useState('');
    const [messages, setMessages] = useState([]);
    const [chats, setChats] = useState([]);
    const [selectedChatId, setSelectedChatId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [userId, setUserId] = useState(null);
    const messageListRef = useRef(null);

    useEffect(() => {
        // Get user_id and access_token from localStorage
        const user_id = localStorage.getItem('user_id');
        const token = localStorage.getItem('token');
        if (!user_id || !token) {
            console.error('User not logged in or token not available');
            setError('User not logged in or token not available');
        } else {
            setUserId(user_id);
        }
    }, []);

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            setLoading(true);
            const response = await axios.post('http://localhost:8080/ask_pdf', { query, chatId: selectedChatId });
            const answer = response.data.answer;

            setMessages([...messages, { text: query, sender: 'user' }, { text: '', sender: 'bot' }]);

            for (let i = 0; i < answer.length; i++) {
                await new Promise(resolve => setTimeout(resolve, 100));
                setMessages(prevMessages => [
                    ...prevMessages.slice(0, -1),
                    { text: prevMessages[prevMessages.length - 1].text + answer[i], sender: 'bot' }
                ]);
            }

            setLoading(false);
            setQuery('');
        } catch (error) {
            console.error('Lỗi:', error);
            setLoading(false);
        }
    };

    const handleNewChat = async () => {
        try {
            console.log('handleNewChat called');
            const user_id = localStorage.getItem('user_id');
            const token = localStorage.getItem('token'); // Lấy token từ localStorage
            if (!user_id) {
                setError('User ID not available');
                console.error('User ID not available');
                return;
            }
    
            // Log dữ liệu gửi đi để kiểm tra
            const requestData = {
                user_id: user_id,
            };
            console.log('Request Data:', requestData);
            console.log('Token:', token);
    
            const response = await axios.post('http://localhost:8080/C_conversation', requestData, {
                headers: {
                    'Authorization': `Bearer ${token}`, 
                    'Content-Type': 'application/json'
                },
                withCredentials: true
            });
    
            if (response.status === 201) {
                console.log('New chat created successfully', response.data);
                const newChat = response.data;
                setChats([...chats, newChat]);
                setMessages([]);
                setQuery('');
                setSelectedChatId(newChat.id);
            } else {
                setError('Failed to create a new conversation');
                console.error('Failed to create a new conversation', response);
            }
        } catch (error) {
            console.error('An error occurred while creating a new conversation:', error);
            setError('An error occurred while creating a new conversation');
        }
    };
    

    const handleSelectChat = (chatId) => {
        setSelectedChatId(chatId);
    };

    useEffect(() => {
        if (messageListRef.current) {
            messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
        }
    }, [messages]);

    return (
        <Container fluid className="chat-container">
            <Row className="chat-body">
                <Col md={3} className="left-panel">
                    <Button variant="primary" onClick={handleNewChat} className="new-chat-button">
                        New Chat
                    </Button>
                    <h4>History</h4>
                    <ListGroup>
                        {chats.map((chat, index) => (
                            <ListGroup.Item 
                                key={index} 
                                action 
                                onClick={() => handleSelectChat(chat.id)}
                                active={chat.id === selectedChatId}
                            >
                                {chat.name}
                            </ListGroup.Item>
                        ))}
                    </ListGroup>
                    <h4>Setting</h4>
                    <ul>
                        <li>User</li>
                    </ul>
                </Col>
                <Col md={9} className="right-panel">
                    <div className="message-list" ref={messageListRef}>
                        {messages.map((message, index) => (
                            <div key={index} className={`message ${message.sender === 'user' ? 'sent' : 'received'}`}>
                                <p>{message.text}</p>
                            </div>
                        ))}
                        {loading && (
                            <div className="message received">
                                <p>...</p>
                            </div>
                        )}
                    </div>
                    <Form className="message-form" onSubmit={handleSubmit}>
                        <Form.Control
                            type="text"
                            placeholder="Nhập câu hỏi của bạn..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            as="textarea"
                            rows="1"
                            style={{ resize: 'none', overflow: 'hidden' }}
                            onInput={(e) => {
                                e.target.style.height = 'auto';
                                e.target.style.height = e.target.scrollHeight + 'px';
                            }}
                        />
                        <Button variant="primary" type="submit">Gửi</Button>
                    </Form>
                </Col>
            </Row>
            <footer className="footer">
                <p>Copyright © thanhphathoang 2024.</p>
            </footer>
        </Container>
    );
}

export default ChatTemplate;
