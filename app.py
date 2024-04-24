# -*- encoding: utf-8 -*-
from flask import Flask, request
from langchain.chains.retrieval import create_retrieval_chain
from langchain_community.llms import Ollama
from langchain_community.vectorstores import Chroma
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.embeddings.fastembed import FastEmbedEmbeddings
from langchain_community.document_loaders import PDFPlumberLoader
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain.prompts import PromptTemplate

app = Flask(__name__)

# Lưu trên sqlite3
folder_path = "db"

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

@app.route("/ask_pdf", methods= ["POST"])
def askPDFPost():
    print("Post /ask_pdf called")
    json_content = request.json
    query = json_content.get("query")
    print(f"query: {query}")

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

    result = chain.invoke({"input": query})

    print(result)

    response_answer = {"answer": result["answer"]}
    return response_answer

@app.route("/pdf", methods=["POST"])
def pdfPost():
    file = request.files["a"]
    file_name = file.filename
    save_file = "pdf/" + file_name
    file.save(save_file)
    print(f"filename: {file_name}")

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


def start_app():
    app.run(host= "0.0.0.0", port= 8080, debug=True)
if __name__ == "__main__":
    start_app()






















    # try:
    #     file = request.files["file"]
    #     file_name = file.filename
    #     save_file = "pdf/" + file_name
    #     file.save(save_file)
    #     print(f"filename: {file_name}")
    #
    #     loader = PDFPlumberLoader(save_file)
    #     docs = loader.load_and_split()
    #     print(f"docs len: {len(docs)}")
    #
    #     chunks = text_splitter.split_documents(docs)
    #     print(f"chunks len: {len(chunks)}")
    #
    #     vector_stores = Chroma.from_documents(
    #         documents= chunks,
    #         embedding= embedding,
    #         persist_directory= folder_path
    #     )
    #     vector_stores.persist()
    #
    #     response = {
    #         "status": "Successful Uploaded",
    #         "filename": file_name,
    #         "doc len": len(docs),
    #         "chunks len": len(chunks)
    #     }
    #
    # except Exception as e:
    #     response = {"status": "Failed", "reason": str(e)}
    # return response