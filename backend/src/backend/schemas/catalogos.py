from pydantic import BaseModel, ConfigDict

class RolOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    nombre: str