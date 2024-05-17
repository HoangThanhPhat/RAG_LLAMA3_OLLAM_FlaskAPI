import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Form, Button, ListGroup } from 'react-bootstrap';
import axios from 'axios';
import './ChatTemplate.scss';

function ChatTemplate() { 
    const [query, setQuery] = useState('');
    const [messages, setMessages] = useState([]);
    const [chats, setChats] = useState([]); // Danh sách các cuộc trò chuyện
    const [selectedChatId, setSelectedChatId] = useState(null); // ID cuộc trò chuyện được chọn
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [userId, setUserId] = useState(null);
    const messageListRef = useRef(null);

    useEffect(() => {
        const fetchUserId = async () => {
            try {
                const response = await axios.get('http://localhost:8080/login');
                setUserId(response.data.user_id);
            } catch (error) {
                console.error('Lỗi khi lấy user_id:', error);
            }
        };

        fetchUserId();
    }, []);

    useEffect(() => {
        const fetchChats = async () => {
            if (!userId) return; // Ensure userId is available
            try {
                const response = await axios.get(`http://localhost:8080/chats/${userId}`);
                setChats(response.data.chats);
            } catch (error) {
                console.error('Lỗi khi tải danh sách cuộc trò chuyện:', error);
            }
        };

        fetchChats();
    }, [userId]);

    useEffect(() => {
        const fetchHistory = async () => {
            if (!selectedChatId) return; // Ensure selectedChatId is available
            try {
                const response = await axios.get(`http://localhost:8080/qna/${selectedChatId}`);
                setMessages(response.data.messages);
            } catch (error) {
                console.error('Lỗi khi tải lịch sử:', error);
            }
        };

        fetchHistory();
    }, [selectedChatId]);

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
            const response = await axios.post('http://localhost:8080/C_conversation', {
                user_id: userId,
            });

            if (response.status === 201) {
                const newChat = response.data;
                setChats([...chats, newChat]);
                setMessages([]);
                setQuery('');
                setSelectedChatId(newChat.id); // Giả sử API trả về conversation ID dưới thuộc tính `id`
            } else {
                setError('Failed to create a new conversation');
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
                            placeholder="Nhập tin nhắn của bạn..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
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

