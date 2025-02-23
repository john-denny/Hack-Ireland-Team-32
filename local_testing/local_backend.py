from fastapi import FastAPI, UploadFile, File
from fastapi.responses import JSONResponse
import sqlite3
import os
from uuid import uuid4
from shutil import copyfileobj
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Створюємо папку для чеків
os.makedirs("images", exist_ok=True)

# Ініціалізуємо SQLite
conn = sqlite3.connect("receipts.db", check_same_thread=False)
cursor = conn.cursor()
cursor.execute("""
CREATE TABLE IF NOT EXISTS receipts (
    id TEXT PRIMARY KEY,
    date TEXT,
    amount TEXT,
    category TEXT,
    subcategory TEXT,
    image_path TEXT
)
""")
conn.commit()

@app.post("/upload")
async def upload_receipt(file: UploadFile = File(...)):
    receipt_id = str(uuid4())
    file_path = f"images/{receipt_id}.jpg"

    with open(file_path, "wb") as buffer:
        copyfileobj(file.file, buffer);

    cursor.execute("INSERT INTO receipts (id, date, amount, category, subcategory, image_path) VALUES (?, ?, ?, ?, ?, ?)",
                   (receipt_id, "2023-02-22", "100.00", "0", "0", file_path))
    conn.commit()

    return JSONResponse({"success": True, "message": "Receipt uploaded"})

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Дозволити всі джерела (можеш замінити на конкретний домен)
    allow_credentials=True,
    allow_methods=["*"],  # Дозволити всі методи (GET, POST, PUT, DELETE)
    allow_headers=["*"],  # Дозволити всі заголовки
)

@app.get("/get_receipts")
async def get_receipts():
    cursor.execute("SELECT id, date, amount, category, subcategory, image_path FROM receipts")
    receipts = cursor.fetchall();

    receipts_list = []
    for id, date, amount, category, subcategory, image_path in receipts:
        receipts_list.append({
            "id": id,
            "date": date,
            "amount": amount,
            "category": category,
            "subcategory": subcategory,
            "image_url": f"http://127.0.0.1:8000/{image_path}"
        })
    return receipts_list

@app.delete("/clear_database")
async def clear_database():
    try:
        cursor.execute("DELETE FROM receipts")  # Видалити всі записи
        conn.commit()
        return {"message": "Database cleared successfully"}
    except Exception as e:
        return {"error": str(e)}

# Додаємо статичний сервер для зображень
app.mount("/images", StaticFiles(directory="images"), name="images")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)

