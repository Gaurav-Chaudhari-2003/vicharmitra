"""fix audit_logs columns to match AuditLog model

The audit_logs table was missing resource_type/resource_id/ip_address/user_agent
columns and had actor_user_id (FK to users, NOT NULL) instead of the model's
actor_id (plain nullable UUID, no FK) - audit logging must survive user deletion
and must not block requests when the model's shape doesn't match a FK-constrained
column. This was blocking every write path that calls the audit service (e.g. signup).

Revision ID: 0004_fix_audit_logs_columns
Revises: 0003_enable_rls
Create Date: 2026-08-17
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision: str = "0004_fix_audit_logs_columns"
down_revision: Union[str, None] = "0003_enable_rls"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.drop_index("ix_audit_logs_actor_user_id", table_name="audit_logs")
    op.drop_constraint("audit_logs_actor_user_id_fkey", "audit_logs", type_="foreignkey")
    op.alter_column("audit_logs", "actor_user_id", new_column_name="actor_id", nullable=True)
    op.alter_column("audit_logs", "actor_tenant_id", nullable=True)
    op.add_column("audit_logs", sa.Column("resource_type", sa.String(), nullable=True))
    op.add_column("audit_logs", sa.Column("resource_id", postgresql.UUID(as_uuid=True), nullable=True))
    op.add_column("audit_logs", sa.Column("ip_address", sa.String(), nullable=True))
    op.add_column("audit_logs", sa.Column("user_agent", sa.String(), nullable=True))


def downgrade() -> None:
    op.drop_column("audit_logs", "user_agent")
    op.drop_column("audit_logs", "ip_address")
    op.drop_column("audit_logs", "resource_id")
    op.drop_column("audit_logs", "resource_type")
    op.alter_column("audit_logs", "actor_tenant_id", nullable=False)
    op.alter_column("audit_logs", "actor_id", new_column_name="actor_user_id", nullable=False)
    op.create_foreign_key(
        "audit_logs_actor_user_id_fkey", "audit_logs", "users", ["actor_user_id"], ["id"]
    )
    op.create_index("ix_audit_logs_actor_user_id", "audit_logs", ["actor_user_id"], unique=False)
