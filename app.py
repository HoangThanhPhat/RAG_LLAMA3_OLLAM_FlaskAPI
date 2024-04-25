# -*- encoding: utf-8 -*-
from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from langchain.chains.retrieval import create_retrieval_chain
from langchain_community.llms import Ollama
from langchain_community.vectorstores import Chroma
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.embeddings.fastembed import FastEmbedEmbeddings
from langchain_community.document_loaders import PDFPlumberLoader
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain.prompts import PromptTemplate
from datetime import datetime
from flask import render_template
from pymysql import IntegrityError

app = Flask(__name__)

# --------------------------------------------------------Connect database-----------------------------------------------------------------
# My SQL
app.config["SQLALCHEMY_DATABASE_URI"] = "mysql+pymysql://root:160302@localhost/rag_llama3?charset=utf8mb4"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = True

database = SQLAlchemy(app)
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
              Nếu như bạn không biết câu trả lời, hãy nói không biết, đừng cố tạo ra câu trả lời. [/INST] </s>
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
            "score_threshold": 0.01,
        },
    )

    # Dùng model và đặt promp cho nó
    document_chain = create_stuff_documents_chain(cached_llm, raw_prompt)
    chain = create_retrieval_chain(retriever, document_chain)

    # In result ra api
    result = chain.invoke({"input": query})

# --------------------------------------Add database------------------------------------------
    from crt_db import Qna
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
@app.route("/user", methods=["POST"])
def create_user():
    try:
        # Trích xuất thông tin người dùng từ yêu cầu POST
        data = request.json
        name = data.get("name")

        # Tạo một bản ghi mới trong cơ sở dữ liệu với thông tin người dùng
        from crt_db import User
        new_user = User(name=name)
        database.session.add(new_user)
        database.session.commit()
        return jsonify({"message": "User created successfully"}), 201
    except IntegrityError:
        database.session.rollback()
        return jsonify({"error": "User already exists"}), 400
    except Exception as e:
        database.session.rollback()
        return jsonify({"error": str(e)}), 500
# ---------------------------------------------------------------------------------------------------------------------------------------


def main():
    return render_template('index.html')

def start_app():
    app.run(host= "0.0.0.0", port= 8080, debug=True)
if __name__ == "__main__":
    start_app()



