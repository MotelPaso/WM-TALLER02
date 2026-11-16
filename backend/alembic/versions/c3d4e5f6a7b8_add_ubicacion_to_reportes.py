"""add latitud y longitud to reportes

Revision ID: c3d4e5f6a7b8
Revises: b7e2f1c89012
Create Date: 2026-11-15 12:00:00.000000

"""

from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "c3d4e5f6a7b8"
down_revision: str | Sequence[str] | None = "b7e2f1c89012"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column("reportes", sa.Column("latitud", sa.Float(), nullable=True))
    op.add_column("reportes", sa.Column("longitud", sa.Float(), nullable=True))


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column("reportes", "longitud")
    op.drop_column("reportes", "latitud")
