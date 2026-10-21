import uvicorn

def main() -> None:
    uvicorn.run("backend.main:app", reload=True)