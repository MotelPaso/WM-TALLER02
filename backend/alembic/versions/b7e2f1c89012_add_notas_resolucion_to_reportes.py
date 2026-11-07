"""add notas_resolucion to reportes

Revision ID: b7e2f1c89012
Revises: a9cf0de0e7b1
Create Date: 2026-11-07 14:55:00.000000

"""

from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "b7e2f1c89012"
down_revision: str | Sequence[str] | None = "a9cf0de0e7b1"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column("reportes", sa.Column("notas_resolucion", sa.Text(), nullable=True))


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column("reportes", "notas_resolucion")
