# from app import database
from sqlalchemy import Column, String, Integer, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

database = SQLAlchemy()
class User(database.Model):
    __name__    = "user"
    id          = Column(Integer, primary_key=True, autoincrement=True)
    username    = Column(String(50), unique=True, nullable=False)
    password    = Column(String(300), nullable=False)
    firstname   = Column(String(50), nullable=False)
    lastname    = Column(String(50), nullable=False)
    DoB         = Column(String(50), nullable=False)
    phone       = Column(String(50), nullable=False)
    email       = Column(String(100))
    address     = Column(String(200), nullable=False)
    roleID      = Column(Integer, nullable=False)
    id_chat        = relationship("Conversation", backref="user", lazy= False)


class Conversation(database.Model):
    __tablename__ = "Conversation"
    id            = Column(Integer, primary_key=True, autoincrement=True)
    user_id       = Column(Integer, ForeignKey(User.id), nullable=False)
    messages      = relationship("Qna", back_populates="conversation")
    created_at    = Column(DateTime, default=datetime.utcnow, nullable=False)

class Qna(database.Model):
    __name__ = "Question&Answer"
    id = Column(Integer, primary_key=True, autoincrement=True)
    Question = Column(String(1000), nullable=False)
    Answer = Column(String(5000), nullable=False)
    conversation_id = Column(Integer, ForeignKey(Conversation.id), nullable=False)
    conversation = relationship("Conversation", back_populates="messages")
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)


# if __name__ == "__main__":
#     database.create_all()
