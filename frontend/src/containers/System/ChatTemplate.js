import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import axios from 'axios';
import './ChatTemplate.scss';

function ChatTemplate({ userId }) { // Thêm userId vào props
    const [query, setQuery] = useState('');
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const messageListRef = useRef(null);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const response = await axios.get(`http://localhost:8080/qna/${userId}`);
                setMessages(response.data.messages);
            } catch (error) {
                console.error('Lỗi khi tải lịch sử:', error);
            }
        };

        fetchHistory();
    }, [userId]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            setLoading(true);
            const response = await axios.post('http://localhost:8080/ask_pdf', { query });
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

    const handleNewChat = () => {
        setMessages([]);
        setQuery('');
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
                    <ul>
                        {messages.map((message, index) => (
                            <li key={index}>{message.text}</li>
                        ))}
                    </ul>
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
