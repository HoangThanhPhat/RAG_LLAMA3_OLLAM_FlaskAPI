# -*- encoding: utf-8 -*-
from flask import Flask, request, jsonify, render_template, redirect, url_for
from werkzeug.security import check_password_hash
from flask_cors import CORS
from flask_bcrypt import generate_password_hash
from langchain.chains.retrieval import create_retrieval_chain
from langchain_community.llms import Ollama
from langchain_community.vectorstores import Chroma
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.embeddings.fastembed import FastEmbedEmbeddings
from langchain_community.document_loaders import PDFPlumberLoader
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain.prompts import PromptTemplate
from datetime import datetime
from pymysql import IntegrityError
from crt_db import database,User,Qna


app = Flask(__name__)
# CORS(app)

# --------------------------------------------------------Connect database-----------------------------------------------------------------
# My SQL
app.config["SQLALCHEMY_DATABASE_URI"] = "mysql+pymysql://root:160302@localhost/rag_llama3?charset=utf8mb4"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

# database = SQLAlchemy(app)
database.init_app(app)
# app.app_context().push()
# Khởi tạo cơ sở dữ liệu
# with app.app_context():
#     database = SQLAlchemy(app)


# Lưu trên sqlite 3 -> vectorstores
folder_path = "db"
# ----------------------------------------------------------------------------------------------------------------------------------------


# ----------------------------------------------------------Setup model-------------------------------------------------------------------
# Model
cached_llm = Ollama(model= "llama3")

# Tạo Prompt
raw_prompt = PromptTemplate.from_template(
    """
    <s>[INST] Bạn là một trợ lý ảo thông minh. 
              Nếu như bạn không biết câu trả lời, hãy nói không biết, đừng cố tạo ra câu trả lời. 
              Chỉ trả lời câu hỏi được đề ra.
              Luôn trả lời bằng tiếng Việt Nam.
              Trả lời chỗ nào cần xuống dòng thì xuống dòng, trình bày thật đẹp cho người dùng dễ hiểu.          
    [/INST] </s>
    [INST] {input}
            Context: {context}
            Answer: 
    [/INST]
    
    """
)

# Embedding
embedding = FastEmbedEmbeddings()

# Tham số tách chữ văn bản
text_splitter = RecursiveCharacterTextSplitter(
    chunk_size= 1024,
    chunk_overlap= 50,
    length_function= len,
    is_separator_regex= False
)
# ----------------------------------------------------------------------------------------------------------------------------------------

# Test talk llama3 base
@app.route("/ai", methods= ["POST"])
def aiPost():
    print("Post /ai called")
    json_content = request.json
    query = json_content.get("query")
    print(f"query: {query}")

    response = cached_llm.invoke(query)
    print(response)

    response_answer = {"answer": response}
    return response_answer

# -----------------------------------------------------------------Talk with bot---------------------------------------------------------
@app.route("/ask_pdf", methods= ["POST"])
def askPDFPost():
# --------------------------------------Question------------------------------------------
    print("Post /ask_pdf called")
    json_content = request.json
    query = json_content.get("query")
    print(f"query: {query}")
# --------------------------------------Answer--------------------------------------------
    # Tải dữ liệu từ vectorstores
    print("Loading vector store")
    vector_store = Chroma(persist_directory=folder_path, embedding_function= embedding)

    # Tạo train với tham số so sánh k=20, temparature = 0.1 (score_threshold)
    print("Creating train")
    retriever = vector_store.as_retriever(
        search_type = "similarity_score_threshold",
        search_kwargs = {
            "k": 3,
            "score_threshold": 0.03,
        },
    )

    # Dùng model và đặt promp cho nó
    document_chain = create_stuff_documents_chain(cached_llm, raw_prompt)
    chain = create_retrieval_chain(retriever, document_chain)

    # In result ra api
    result = chain.invoke({"input": query})

# --------------------------------------Add database------------------------------------------
    # Lấy câu trả lời từ result
    result_answer = result["answer"]

    # Tạo một bản ghi mới cho bảng "qna"
    new_qna = Qna(Question=str(query), Answer=str(result_answer), user_id = "1" )
    try:
        # Thêm bản ghi mới vào cơ sở dữ liệu
        database.session.add(new_qna)
        database.session.commit()
        print("Inserted Q&A into database successfully!")
    except Exception as e:
        print(f"Error inserting Q&A into database: {e}")
        database.session.rollback()
#
    print(result)

    response_answer = {"answer": result["answer"]}
    return response_answer
# --------------------------------------------------------------------------------------------------------------------------------------------------


# ----------------------------------------------------------------Load PDF and Embedding----------------------------------------------------------
@app.route("/pdf", methods=["POST"])
def pdfPost():
#--------------------------------------Load PDF------------------------------------------
    file = request.files["a"]
    file_name = file.filename
    save_file = "pdf/" + file_name
    file.save(save_file)
    print(f"filename: {file_name}")

#--------------------------------------Embedding------------------------------------------
    # Tải thư mục lên để chuẩn bị băm
    loader = PDFPlumberLoader(save_file)
    docs = loader.load_and_split()
    print(f"docs len={len(docs)}")

    # Tách văn bản
    chunks = text_splitter.split_documents(docs)
    print(f"chunks len={len(chunks)}")

    # Embedding và lưu vào vectorstore
    vector_store = Chroma.from_documents(
        documents=chunks, embedding=embedding, persist_directory=folder_path
    )

    vector_store.persist()

    response = {
        "status": "Successfully Uploaded",
        "filename": file_name,
        "doc_len": len(docs),
        "chunks": len(chunks),
    }
    return response
# ---------------------------------------------------------------------------------------------------------------------------------------

# ----------------------------------------------------------------CRUD USER--------------------------------------------------------------

# -----------------Create User--------------------------
@app.route("/create_user", methods=["POST"])
def create_user():
    try:
        # Trích xuất thông tin người dùng từ yêu cầu POST
        data = request.json
        username  = data.get("username")
        password  = data.get("password")
        firstname = data.get("firstname")
        lastname  = data.get("lastname")
        DoB       = data.get("DoB")
        phone     = data.get("phone number")
        email     = data.get("email")
        address   = data.get("address")
        roleID    = data.get("roleID")

        # Hash mật khẩu
        hashed_password = generate_password_hash(password).decode("utf-8")


        # Tạo một bản ghi mới trong cơ sở dữ liệu với thông tin người dùng
        new_user = User(
            username  = username,
            password  = hashed_password,
            firstname = firstname,
            lastname  = lastname,
            DoB       = DoB,
            phone     = phone,
            email     = email,
            address   = address,
            roleID    = roleID
        )
        database.session.add(new_user)
        database.session.commit()
        return jsonify({"message": "User created successfully"}), 201
    except IntegrityError:
        database.session.rollback()
        return jsonify({"error": "User already exists"}), 400
    except Exception as e:
        database.session.rollback()
        return jsonify({"error": str(e)}), 500

# -----------------Get User--------------------------
@app.route("/user/<username>", methods=["GET"])
def get_user(username):
    try:
        # Tìm người dùng trong cơ sở dữ liệu
        user = User.query.filter_by(username=username).first()

        # Kiểm tra xem người dùng có tồn tại hay không
        if user:
            # Nếu tồn tại, trả về thông tin của người dùng
            user_data = {
                "username": user.username,
                "password": user.password,
                "firstname": user.firstname,
                "lastname": user.lastname,
                "DoB": user.DoB,
                "phone": user.phone,
                "email": user.email,
                "address": user.address,
                "roleID": user.roleID
            }
            return jsonify(user_data), 200
        else:
            # Nếu không tồn tại, trả về thông báo lỗi
            return jsonify({"error": "User not found"}), 404
    except Exception as e:
        # Xử lý các ngoại lệ và trả về thông báo lỗi
        return jsonify({"error": str(e)}), 500

# -------------------Get all user-----------------
@app.route("/users", methods=["GET"])
def get_all_users():
    try:
        # Lấy tất cả người dùng từ cơ sở dữ liệu
        all_users = User.query.all()

        # Tạo danh sách chứa thông tin của tất cả người dùng
        users_data = []
        for user in all_users:
            user_data = {
                "id": user.id,
                "username": user.username,
                "password": user.password,
                "firstname": user.firstname,
                "lastname": user.lastname,
                "DoB": user.DoB,
                "phone": user.phone,
                "email": user.email,
                "address": user.address,
                "roleID": user.roleID
            }
            users_data.append(user_data)

        # Trả về danh sách người dùng dưới dạng JSON
        return jsonify(users_data), 200
    except Exception as e:
        # Xử lý các ngoại lệ và trả về thông báo lỗi
        return jsonify({"error": str(e)}), 500


# -----------------Update User--------------------------
@app.route("/user/<username>", methods=["PUT"])
def update_user(username):
    try:
        # Tìm người dùng trong cơ sở dữ liệu
        user = User.query.filter_by(username=username).first()

        # Kiểm tra xem người dùng có tồn tại hay không
        if user:
            # Cập nhật thông tin người dùng với dữ liệu được gửi trong yêu cầu
            data = request.json
            user.username = data.get("username", user.username)
            user.password = data.get("password", user.password)
            user.firstname = data.get("firstname", user.firstname)
            user.lastname = data.get("lastname", user.lastname)
            user.DoB = data.get("DoB", user.DoB)
            user.phone = data.get("phone", user.phone)
            user.email = data.get("email", user.email)
            user.address = data.get("address", user.address)
            user.roleID = data.get("roleID", user.roleID)

            # Lưu thay đổi vào cơ sở dữ liệu
            database.session.commit()
            return jsonify({"message": "User updated successfully"}), 200
        else:
            # Nếu không tồn tại, trả về thông báo lỗi
            return jsonify({"error": "User not found"}), 404
    except Exception as e:
        # Xử lý các ngoại lệ và trả về thông báo lỗi
        return jsonify({"error": str(e)}), 500

# -----------------Delete User--------------------------
@app.route("/user/<username>", methods=["DELETE"])
def delete_user(username):
    try:
        # Tìm người dùng trong cơ sở dữ liệu
        user = User.query.filter_by(username=username).first()

        # Kiểm tra xem người dùng có tồn tại hay không
        if user:
            # Xóa người dùng
            database.session.delete(user)
            database.session.commit()
            return jsonify({"message": "User deleted successfully"}), 200
        else:
            # Nếu không tồn tại, trả về thông báo lỗi
            return jsonify({"error": "User not found"}), 404
    except Exception as e:
        # Xử lý các ngoại lệ và trả về thông báo lỗi
        return jsonify({"error": str(e)}), 500


# ---------------------------------------------------------------------------------------------------------------------------------------


def start_app():
    app.run(host= "0.0.0.0", port= 8080, debug=True)
if __name__ == "__main__":
    start_app()




