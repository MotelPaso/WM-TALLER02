from fastapi import FastAPI

app = FastAPI(title="WM-TALLER02 API")

@app.get("/health")
def health_check():
    return {"status": "ok"}