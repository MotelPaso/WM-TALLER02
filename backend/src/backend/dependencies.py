from typing import Annotated

from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models import Usuario
from backend.security import oauth2_scheme, verify_access_token

DbSession = Annotated[Session, Depends(get_db)]

def get_current_user(
    token: Annotated[str, Depends(oauth2_scheme)], db: DbSession) -> Usuario:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="No se pudieron validar las credenciales",
        headers={"WWW-Authenticate": "Bearer"},
    )

    sub = verify_access_token(token)
    if sub is None:
        raise credentials_exception
    try:
        user_id = int(sub)
    except ValueError:
        raise credentials_exception

    user = db.get(Usuario, user_id)
    if user is None or not user.activo:
        raise credentials_exception
    return user

CurrentUser = Annotated[Usuario, Depends(get_current_user)]

def require_technician(user: CurrentUser) -> Usuario:
    if user.rol.nombre != "tecnico":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Se requiere rol técnico",
        )
    return user

TechnicianUser = Annotated[Usuario, Depends(require_technician)]