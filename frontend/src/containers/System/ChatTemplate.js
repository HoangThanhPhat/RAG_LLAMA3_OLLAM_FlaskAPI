import React, { useState } from 'react';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import axios from 'axios';
import './ChatTemplate.scss';

function ChatTemplate() {
    const [query, setQuery] = useState('');
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            setLoading(true);
            const response = await axios.post('http://localhost:8080/ask_pdf', { query });
            const answer = response.data.answer;

            // Thêm câu hỏi của người dùng vào danh sách tin nhắn
            setMessages([...messages, { text: query, sender: 'user' }]);

            // Hiển thị từng từ của câu trả lời một cách tuần tự
            for (let i = 0; i < answer.length; i++) {
                await new Promise(resolve => setTimeout(resolve, 100));
                setMessages(prevMessages => [
                    ...prevMessages.slice(0, -1), // Loại bỏ tin nhắn cuối cùng (là câu trả lời)
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

    return (
        <Container fluid className="chat-container">
            <Row className="chat-body">
                <Col md={3} className="left-panel">
                    <h4>History</h4>
                    <ul>
                        <li>Message 1</li>
                        <li>Message 2</li>
                        <li>Message 3</li>
                    </ul>
                    <h4>Setting</h4>
                    <ul>
                        <li>User</li>
                    </ul>
                </Col>
                <Col md={9} className="right-panel" style={{ overflowY: 'auto' }}>
                    <div className="message-list">
                        {messages.map((message, index) => (
                            <div key={index} className={`message ${message.sender}`}>
                                <p>{message.text}</p>
                            </div>
                        ))}
                        {loading && (
                            <div className="message bot">
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








// import React from 'react';
// import { Container, Row, Col, Form, Button } from 'react-bootstrap';
// import './ChatTemplate.scss'; 
// import Typography from '@mui/material/Typography'; // Import Typography component
// import Link from '@mui/material/Link'; // Import Link component

// function ChatTemplate() {
//     return (
//         <Container fluid className="chat-container">
//             <Row className="chat-body">
//                 <Col md={2} className="history">
//                     <h4>History</h4>
//                     <ul>
//                         {/* Danh sách các tin nhắn trước đó */}
//                         <li>Message 1</li>
//                         <li>Message 2</li>
//                         <li>Message 3</li>
//                     </ul>
//                 </Col>
//                 <Col md={10} className="chat">
//                     <h4>Chat</h4>
//                     {/* Vùng hiển thị tin nhắn */}
//                     <div className="message-list">
//                         {/* Tin nhắn mới nhất */}
//                         <div className="message received">
//                             <p>User A: Hello!</p>
//                         </div>
//                         {/* Tin nhắn được gửi đi */}
//                         <div className="message sent">
//                             <p>You: Hi there!</p>
//                         </div>
//                     </div>
//                     {/* Form nhập tin nhắn mới */}
//                     <Form className="message-form">
//                         <Form.Control type="text" placeholder="Type your message..." />
//                         <Button variant="primary" type="submit">Send</Button>
//                     </Form>
//                 </Col>
//             </Row>
//             <Row>
//                 <Col>
//                     {/* My sticky footer can be found here */}
//                     <footer className="footer">
//                         <Container maxWidth="sm">
//                             <p>Copyright © thanhphathoang 2024.</p>
//                             {/* Copyright component */}
//                             <Typography variant="body2" color="text.secondary">
//                                 {'Copyright © '}
//                                 <Link color="inherit" href="https://mui.com/">
//                                     Your Website
//                                 </Link>{' '}
//                                 {new Date().getFullYear()}
//                                 {'.'}
//                             </Typography>
//                         </Container>
//                     </footer>
//                 </Col>
//             </Row>
//         </Container>
//     );
// }

// export default ChatTemplate;

