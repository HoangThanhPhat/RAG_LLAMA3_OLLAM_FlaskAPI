import React from 'react';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import './ChatTemplate.scss'; 

function ChatTemplate() {
    return (
        <Container fluid className="chat-container">
            <Row className="chat-header">
                <Col className="text-center">
                    <h2>Chat Room</h2>
                </Col>
            </Row>
            <Row className="chat-body">
                <Col md={4} className="history">
                    <h4>History</h4>
                    <ul>
                        {/* Danh sách các tin nhắn trước đó */}
                        <li>Message 1</li>
                        <li>Message 2</li>
                        <li>Message 3</li>
                    </ul>
                </Col>
                <Col md={8} className="chat">
                    <h4>Chat</h4>
                    {/* Vùng hiển thị tin nhắn */}
                    <div className="message-list">
                        {/* Tin nhắn mới nhất */}
                        <div className="message received">
                            <p>User A: Hello!</p>
                        </div>
                        {/* Tin nhắn được gửi đi */}
                        <div className="message sent">
                            <p>You: Hi there!</p>
                        </div>
                    </div>
                    {/* Form nhập tin nhắn mới */}
                    <Form className="message-form">
                        <Form.Control type="text" placeholder="Type your message..." />
                        <Button variant="primary" type="submit">Send</Button>
                    </Form>
                </Col>
            </Row>
        </Container>
    );
}

export default ChatTemplate;
