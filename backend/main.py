from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
import sqlite3

app = FastAPI(title="Leo Library API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DB_NAME = "library.db"


def connect_db():
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = connect_db()
    cur = conn.cursor()

    cur.execute("""
        CREATE TABLE IF NOT EXISTS books (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title_en TEXT NOT NULL,
            title_ar TEXT NOT NULL,
            author_en TEXT NOT NULL,
            author_ar TEXT NOT NULL,
            year INTEGER,
            topic_en TEXT,
            topic_ar TEXT,
            keywords TEXT,
            available INTEGER,
            shelf TEXT,
            x REAL,
            y REAL,
            description_en TEXT,
            description_ar TEXT
        )
    """)

    cur.execute("SELECT COUNT(*) AS count FROM books")
    count = cur.fetchone()["count"]

    if count == 0:
        sample_books = [
    (
        "Artificial Intelligence Engines",
        "محركات الذكاء الاصطناعي",
        "James Stone",
        "جيمس ستون",
        2024,
        "Artificial Intelligence",
        "الذكاء الاصطناعي",
        "ai,artificial intelligence,machine learning,deep learning,neural networks,robotics,ذكاء,ذكاء اصطناعي,تعلم الآلة",
        1,
        "AI-03",
        0.2,
        0.0,
        "A beginner-friendly introduction to artificial intelligence concepts, learning systems, and modern AI applications.",
        "مقدمة مبسطة في مفاهيم الذكاء الاصطناعي وأنظمة التعلم وتطبيقات الذكاء الاصطناعي الحديثة."
    ),
    (
        "Deep Learning",
        "التعلم العميق",
        "Ian Goodfellow",
        "إيان جودفيلو",
        2016,
        "Machine Learning",
        "تعلم الآلة",
        "ai,deep learning,machine learning,neural network,tensorflow,keras,ذكاء,تعلم عميق,شبكات عصبية",
        1,
        "CS-12",
        0.4,
        0.0,
        "A detailed book about neural networks, optimization, representation learning, and deep learning models.",
        "كتاب تفصيلي عن الشبكات العصبية والتحسين وتمثيل البيانات ونماذج التعلم العميق."
    ),
    (
        "Database System Concepts",
        "مفاهيم أنظمة قواعد البيانات",
        "Abraham Silberschatz",
        "أبراهام سيلبرشاتز",
        2020,
        "Databases",
        "قواعد البيانات",
        "database,databases,sql,mysql,data,db,query,tables,قواعد بيانات,بيانات,استعلام",
        1,
        "DB-08",
        0.6,
        0.2,
        "Covers relational databases, SQL, database design, transactions, recovery, and storage systems.",
        "يتناول قواعد البيانات العلائقية ولغة SQL وتصميم قواعد البيانات والمعاملات والاسترجاع وأنظمة التخزين."
    ),
    (
        "Computer Networks",
        "شبكات الحاسوب",
        "Andrew Tanenbaum",
        "أندرو تانينباوم",
        2021,
        "Networking",
        "الشبكات",
        "network,networks,networking,tcp,ip,internet,routing,protocol,شبكات,انترنت,بروتوكولات",
        0,
        "NET-04",
        0.8,
        0.1,
        "Explains network layers, protocols, routing, transport systems, and internet architecture.",
        "يشرح طبقات الشبكات والبروتوكولات والتوجيه وأنظمة النقل وبنية الإنترنت."
    ),
    (
        "Clean Code",
        "الكود النظيف",
        "Robert C. Martin",
        "روبرت سي. مارتن",
        2008,
        "Software Engineering",
        "هندسة البرمجيات",
        "software,engineering,programming,code,clean code,coding,development,برمجة,كود,هندسة البرمجيات",
        1,
        "SE-02",
        1.0,
        0.2,
        "A practical guide to writing readable, maintainable, and clean software code.",
        "دليل عملي لكتابة كود واضح وقابل للصيانة ومنظم."
    )
]

        cur.executemany("""
            INSERT INTO books (
                title_en, title_ar, author_en, author_ar, year,
                topic_en, topic_ar, keywords, available, shelf,
                x, y, description_en, description_ar
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, sample_books)

    conn.commit()
    conn.close()


@app.on_event("startup")
def startup():
    init_db()


@app.get("/")
def home():
    return {"message": "Leo Library API is running"}


@app.get("/api/books/search")
def search_books(
    q: str = Query("", description="Search query"),
    mode: str = Query("all", description="all, title, author, topic")
):
    q_clean = q.strip().lower()

    if q_clean == "":
        return []

    conn = connect_db()
    cur = conn.cursor()

    like = f"%{q_clean}%"

    if mode == "title":
        sql = """
            SELECT * FROM books
            WHERE lower(title_en) LIKE ?
            OR title_ar LIKE ?
        """
        params = (like, like)

    elif mode == "author":
        sql = """
            SELECT * FROM books
            WHERE lower(author_en) LIKE ?
            OR author_ar LIKE ?
        """
        params = (like, like)

    elif mode == "topic":
        sql = """
            SELECT * FROM books
            WHERE lower(topic_en) LIKE ?
            OR topic_ar LIKE ?
            OR lower(keywords) LIKE ?
        """
        params = (like, like, like)

    else:
        sql = """
            SELECT * FROM books
            WHERE lower(title_en) LIKE ?
            OR title_ar LIKE ?
            OR lower(author_en) LIKE ?
            OR author_ar LIKE ?
            OR lower(topic_en) LIKE ?
            OR topic_ar LIKE ?
            OR lower(keywords) LIKE ?
        """
        params = (like, like, like, like, like, like, like)

    cur.execute(sql, params)
    rows = cur.fetchall()
    conn.close()

    results = []

    for row in rows:
        book = dict(row)
        book["available"] = bool(book["available"])
        book["keywords"] = book["keywords"].split(",") if book["keywords"] else []
        results.append(book)

    return results