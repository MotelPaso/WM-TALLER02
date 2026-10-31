def main() -> None:
    import uvicorn

    uvicorn.run("backend.main:app", reload=True)
