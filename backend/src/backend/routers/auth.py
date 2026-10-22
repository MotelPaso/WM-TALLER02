from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError

from backend.dependencies import CurrentUser, DbSession
from backend.models import Rol, Usuario
from backend.schemas import Token, UsuarioCreate, UsuarioOut
from backend.security import create_access_token, hash_password, verify_password

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register", response_model=UsuarioOut, status_code=status.HTTP_201_CREATED)
def register(data: UsuarioCreate, db: DbSession):
    existing = db.scalars(select(Usuario).where(Usuario.correo == data.correo)).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="El correo ya está registrado")

    user_role = db.scalars(select(Rol).where(Rol.nombre == "usuario")).first()
    if user_role is None:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Falta el rol 'usuario' en la base de datos")

    user = Usuario(
        nombre=data.nombre, correo=data.correo, 
        contrasena_hash=hash_password(data.contrasena), rol=user_role
    )
    db.add(user)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="El correo ya está registrado")
    db.refresh(user)
    return user

@router.post("/login", response_model=Token)
def login(form: Annotated[OAuth2PasswordRequestForm, Depends()], db: DbSession):
    invalid_credentials = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED, detail="Correo o contraseña incorrectos",
        headers={"WWW-Authenticate": "Bearer"},
    )

    email = form.username.strip().lower()
    user = db.scalars(select(Usuario).where(Usuario.correo == email)).first()
    if user is None or not verify_password(form.password, user.contrasena_hash) or not user.activo:
        raise invalid_credentials

    token = create_access_token({"sub": user.id, "rol": user.rol.nombre})
    return Token(access_token=token)

@router.get("/me", response_model=UsuarioOut)
def read_me(user: CurrentUser):
    return user
