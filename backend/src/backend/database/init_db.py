from backend.models import Base
from backend.database.session import engine

def main() -> None:
    Base.metadata.create_all(bind=engine)
    engine.dispose()

if __name__ == "__main__":
    main()