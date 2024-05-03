# from app import database
from sqlalchemy import Column, String, Integer, ForeignKey
from sqlalchemy.orm import relationship
from flask_sqlalchemy import SQLAlchemy

database = SQLAlchemy()
class User(database.Model):
    __name__    = "user"
    id          = Column(Integer, primary_key=True, autoincrement=True)
    username    = Column(String(50), unique=True, nullable=False)
    password    = Column(String(50), nullable=False)
    firstname   = Column(String(50), nullable=False)
    lastname    = Column(String(50), nullable=False)
    DoB         = Column(String(50), nullable=False)
    phone       = Column(String(50), nullable=False)
    email       = Column(String(100))
    address     = Column(String(200), nullable=False)
    roleID      = Column(Integer, nullable=False)
    qnas        = relationship("Qna", backref="user", lazy= False)

class Qna(database.Model):
    __name__ = "Question&Answer"
    id       = Column(Integer, primary_key=True, autoincrement=True)
    Question = Column(String(1000), nullable=False)
    Answer   = Column(String(5000), nullable=False)
    user_id  = Column(Integer, ForeignKey(User.id), nullable= False )

if __name__ == "__main__":
    database.create_all()
