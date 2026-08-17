"""set server_default now() on chat_sessions.created_at and chat_messages.created_at

0005's alter_column type change (TIMESTAMP -> DateTime(timezone=True)) dropped
the server_default those columns need to satisfy ChatSession/ChatMessage models,
which rely on the DB to fill created_at via server_default=func.now() rather
than a client-side default. This was blocking every chat session/message insert.

Revision ID: 0006_fix_chat_created_at
Revises: 0005_reconcile_remaining
Create Date: 2026-08-17
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "0006_fix_chat_created_at"
down_revision: Union[str, None] = "0005_reconcile_remaining"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.alter_column("chat_sessions", "created_at", server_default=sa.text("now()"))
    op.alter_column("chat_messages", "created_at", server_default=sa.text("now()"))


def downgrade() -> None:
    op.alter_column("chat_messages", "created_at", server_default=None)
    op.alter_column("chat_sessions", "created_at", server_default=None)
