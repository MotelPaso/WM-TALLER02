from pydantic import BaseModel, ConfigDict, computed_field

class EdificioOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    nombre: str

class SalaOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    numero: str
    edificio: EdificioOut

    @computed_field
    @property
    def codigo(self) -> str:
        return f"{self.edificio.nombre}-{self.numero}"
