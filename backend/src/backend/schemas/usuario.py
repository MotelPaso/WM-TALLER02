from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator

from backend.schemas.catalogos import RolOut


class UsuarioCreate(BaseModel):
    nombre: str = Field(min_length=1, max_length=100)
    correo: EmailStr = Field(max_length=254)
    contrasena: str = Field(min_length=8, max_length=128)

    @field_validator("nombre")
    @classmethod
    def strip_nombre(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("El nombre no puede estar vacío")
        return v

    @field_validator("correo")
    @classmethod
    def lowercase_correo(cls, v: str) -> str:
        return v.lower()


class UsuarioResumenOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    nombre: str


class UsuarioOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    nombre: str
    correo: EmailStr
    activo: bool
    rol: RolOut
