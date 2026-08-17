"""reconcile api_logs, chat_messages, chat_sessions, chunks, document_versions,
documents, folders, metadata, permissions with their current ORM models.

Deliberately does NOT touch chunks.content_tsv, idx_chunks_content_tsv,
idx_chunks_embedding, or idx_metadata_value - those are hand-built full-text
and vector search infrastructure that isn't (and shouldn't be) ORM-mapped, not
schema drift. Everything else here is real drift between models and the
migrated schema (models gained soft-delete/starring/audit fields over time
without a matching migration ever being written).

Revision ID: 0005_reconcile_remaining
Revises: 0004_fix_audit_logs_columns
Create Date: 2026-08-17
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
import pgvector.sqlalchemy.vector


revision: str = "0005_reconcile_remaining"
down_revision: Union[str, None] = "0004_fix_audit_logs_columns"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # api_logs: match ApiLog model (indexes on method/path/status_code/created_at,
    # Text columns, and no FK on user_id/tenant_id - logs must outlive their subject)
    op.alter_column("api_logs", "path", existing_type=sa.VARCHAR(), type_=sa.Text(), existing_nullable=False)
    op.alter_column("api_logs", "user_agent", existing_type=sa.VARCHAR(), type_=sa.Text(), existing_nullable=True)
    op.create_index(op.f("ix_api_logs_created_at"), "api_logs", ["created_at"], unique=False)
    op.create_index(op.f("ix_api_logs_method"), "api_logs", ["method"], unique=False)
    op.create_index(op.f("ix_api_logs_path"), "api_logs", ["path"], unique=False)
    op.create_index(op.f("ix_api_logs_status_code"), "api_logs", ["status_code"], unique=False)
    op.drop_constraint("api_logs_tenant_id_fkey", "api_logs", type_="foreignkey")
    op.drop_constraint("api_logs_user_id_fkey", "api_logs", type_="foreignkey")

    # chat_messages / chat_sessions: match ChatMessage/ChatSession models
    op.add_column("chat_messages", sa.Column("results", postgresql.JSONB(astext_type=sa.Text()), nullable=True))
    op.add_column("chat_messages", sa.Column("filters", postgresql.JSONB(astext_type=sa.Text()), nullable=True))
    op.alter_column("chat_messages", "created_at", existing_type=postgresql.TIMESTAMP(), type_=sa.DateTime(timezone=True), existing_nullable=False)
    op.drop_constraint("chat_messages_session_id_fkey", "chat_messages", type_="foreignkey")
    op.create_foreign_key(None, "chat_messages", "chat_sessions", ["session_id"], ["id"], ondelete="CASCADE")
    op.add_column("chat_sessions", sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False))
    op.alter_column("chat_sessions", "created_at", existing_type=postgresql.TIMESTAMP(), type_=sa.DateTime(timezone=True), existing_nullable=False)

    # chunks: only tighten nullability to match the Chunk model - content_tsv and
    # its indexes plus the HNSW embedding index are intentionally left alone
    op.alter_column("chunks", "embedding", existing_type=pgvector.sqlalchemy.vector.VECTOR(dim=1024), nullable=False)
    op.alter_column("chunks", "chunk_metadata", existing_type=postgresql.JSONB(astext_type=sa.Text()), nullable=False)

    # document_versions: match DocumentVersion model
    op.add_column("document_versions", sa.Column("file_hash", sa.String(), nullable=False, server_default=""))
    op.alter_column("document_versions", "file_hash", server_default=None)
    op.add_column("document_versions", sa.Column("original_filename", sa.String(), nullable=False, server_default=""))
    op.alter_column("document_versions", "original_filename", server_default=None)
    op.add_column("document_versions", sa.Column("uploaded_by", postgresql.UUID(as_uuid=True), nullable=True))
    op.create_index(op.f("ix_document_versions_uploaded_by"), "document_versions", ["uploaded_by"], unique=False)
    op.create_foreign_key(None, "document_versions", "users", ["uploaded_by"], ["id"])

    # documents: match Document model (soft-delete/starring, no mime_type/updated_at)
    op.add_column("documents", sa.Column("created_by", postgresql.UUID(as_uuid=True), nullable=True))
    op.add_column("documents", sa.Column("doc_type", sa.String(), nullable=True))
    op.add_column("documents", sa.Column("is_starred", sa.Boolean(), nullable=False, server_default=sa.false()))
    op.alter_column("documents", "is_starred", server_default=None)
    op.add_column("documents", sa.Column("trashed_at", sa.DateTime(), nullable=True))
    op.create_index(op.f("ix_documents_created_by"), "documents", ["created_by"], unique=False)
    op.drop_constraint("documents_folder_id_fkey", "documents", type_="foreignkey")
    op.create_foreign_key(None, "documents", "users", ["created_by"], ["id"])
    op.create_foreign_key(None, "documents", "folders", ["folder_id"], ["id"], ondelete="SET NULL")
    op.drop_column("documents", "updated_at")
    op.drop_column("documents", "mime_type")

    # folders: match Folder model (soft-delete/starring/color, same pattern as documents)
    op.add_column("folders", sa.Column("created_by", postgresql.UUID(as_uuid=True), nullable=True))
    op.add_column("folders", sa.Column("updated_at", sa.DateTime(), nullable=False, server_default=sa.text("now()")))
    op.alter_column("folders", "updated_at", server_default=None)
    op.add_column("folders", sa.Column("is_starred", sa.Boolean(), nullable=False, server_default=sa.false()))
    op.alter_column("folders", "is_starred", server_default=None)
    op.add_column("folders", sa.Column("trashed_at", sa.DateTime(), nullable=True))
    op.add_column("folders", sa.Column("color", sa.String(length=50), nullable=True))
    op.create_index(op.f("ix_folders_created_by"), "folders", ["created_by"], unique=False)
    op.drop_constraint("folders_parent_id_fkey", "folders", type_="foreignkey")
    op.create_foreign_key(None, "folders", "folders", ["parent_id"], ["id"], ondelete="CASCADE")
    op.create_foreign_key(None, "folders", "users", ["created_by"], ["id"])

    # metadata: match MetadataItem model - idx_metadata_value (GIN on value) is
    # intentionally left alone, only the key/source/confidence_score/FK drift is fixed
    op.alter_column("metadata", "key", existing_type=sa.VARCHAR(), type_=sa.Text(), existing_nullable=False)
    op.alter_column("metadata", "source", existing_type=sa.VARCHAR(), type_=sa.Text(), existing_nullable=False)
    op.alter_column("metadata", "confidence_score", existing_type=sa.DOUBLE_PRECISION(precision=53), nullable=True)
    op.create_index(op.f("ix_metadata_key"), "metadata", ["key"], unique=False)
    op.drop_constraint("metadata_document_id_fkey", "metadata", type_="foreignkey")
    op.create_foreign_key(None, "metadata", "documents", ["document_id"], ["id"], ondelete="CASCADE")

    # permissions: model was redesigned from document-specific to generic
    # resource-based permissions (resource_type/resource_id/action); table is
    # empty so this is a safe structural change, not a data migration
    op.add_column("permissions", sa.Column("resource_type", sa.String(), nullable=False, server_default=""))
    op.alter_column("permissions", "resource_type", server_default=None)
    op.add_column("permissions", sa.Column("resource_id", postgresql.UUID(as_uuid=True), nullable=True))
    op.add_column("permissions", sa.Column("action", sa.String(), nullable=False, server_default=""))
    op.alter_column("permissions", "action", server_default=None)
    op.drop_index("ix_permissions_document_id", table_name="permissions")
    op.drop_constraint("permissions_document_id_fkey", "permissions", type_="foreignkey")
    op.drop_column("permissions", "document_id")
    op.drop_column("permissions", "permission_level")
    op.alter_column("permissions", "resource_id", nullable=False)


def downgrade() -> None:
    op.add_column("permissions", sa.Column("permission_level", sa.VARCHAR(), nullable=False, server_default=""))
    op.add_column("permissions", sa.Column("document_id", postgresql.UUID(as_uuid=True), nullable=True))
    op.create_foreign_key("permissions_document_id_fkey", "permissions", "documents", ["document_id"], ["id"])
    op.create_index("ix_permissions_document_id", "permissions", ["document_id"], unique=False)
    op.drop_column("permissions", "action")
    op.drop_column("permissions", "resource_id")
    op.drop_column("permissions", "resource_type")

    op.drop_constraint(None, "metadata", type_="foreignkey")
    op.create_foreign_key("metadata_document_id_fkey", "metadata", "documents", ["document_id"], ["id"])
    op.drop_index(op.f("ix_metadata_key"), table_name="metadata")
    op.alter_column("metadata", "confidence_score", existing_type=sa.DOUBLE_PRECISION(precision=53), nullable=False)
    op.alter_column("metadata", "source", existing_type=sa.Text(), type_=sa.VARCHAR(), existing_nullable=False)
    op.alter_column("metadata", "key", existing_type=sa.Text(), type_=sa.VARCHAR(), existing_nullable=False)

    op.drop_constraint(None, "folders", type_="foreignkey")
    op.drop_constraint(None, "folders", type_="foreignkey")
    op.create_foreign_key("folders_parent_id_fkey", "folders", "folders", ["parent_id"], ["id"])
    op.drop_index(op.f("ix_folders_created_by"), table_name="folders")
    op.drop_column("folders", "color")
    op.drop_column("folders", "trashed_at")
    op.drop_column("folders", "is_starred")
    op.drop_column("folders", "updated_at")
    op.drop_column("folders", "created_by")

    op.add_column("documents", sa.Column("mime_type", sa.VARCHAR(), nullable=False, server_default=""))
    op.add_column("documents", sa.Column("updated_at", postgresql.TIMESTAMP(), nullable=False, server_default=sa.text("now()")))
    op.drop_constraint(None, "documents", type_="foreignkey")
    op.drop_constraint(None, "documents", type_="foreignkey")
    op.create_foreign_key("documents_folder_id_fkey", "documents", "folders", ["folder_id"], ["id"])
    op.drop_index(op.f("ix_documents_created_by"), table_name="documents")
    op.drop_column("documents", "trashed_at")
    op.drop_column("documents", "is_starred")
    op.drop_column("documents", "doc_type")
    op.drop_column("documents", "created_by")

    op.drop_constraint(None, "document_versions", type_="foreignkey")
    op.drop_index(op.f("ix_document_versions_uploaded_by"), table_name="document_versions")
    op.drop_column("document_versions", "uploaded_by")
    op.drop_column("document_versions", "original_filename")
    op.drop_column("document_versions", "file_hash")

    op.alter_column("chunks", "chunk_metadata", existing_type=postgresql.JSONB(astext_type=sa.Text()), nullable=True)
    op.alter_column("chunks", "embedding", existing_type=pgvector.sqlalchemy.vector.VECTOR(dim=1024), nullable=True)

    op.alter_column("chat_sessions", "created_at", existing_type=sa.DateTime(timezone=True), type_=postgresql.TIMESTAMP(), existing_nullable=False)
    op.drop_column("chat_sessions", "updated_at")
    op.drop_constraint(None, "chat_messages", type_="foreignkey")
    op.create_foreign_key("chat_messages_session_id_fkey", "chat_messages", "chat_sessions", ["session_id"], ["id"])
    op.alter_column("chat_messages", "created_at", existing_type=sa.DateTime(timezone=True), type_=postgresql.TIMESTAMP(), existing_nullable=False)
    op.drop_column("chat_messages", "filters")
    op.drop_column("chat_messages", "results")

    op.create_foreign_key("api_logs_user_id_fkey", "api_logs", "users", ["user_id"], ["id"])
    op.create_foreign_key("api_logs_tenant_id_fkey", "api_logs", "tenants", ["tenant_id"], ["id"])
    op.drop_index(op.f("ix_api_logs_status_code"), table_name="api_logs")
    op.drop_index(op.f("ix_api_logs_path"), table_name="api_logs")
    op.drop_index(op.f("ix_api_logs_method"), table_name="api_logs")
    op.drop_index(op.f("ix_api_logs_created_at"), table_name="api_logs")
    op.alter_column("api_logs", "user_agent", existing_type=sa.Text(), type_=sa.VARCHAR(), existing_nullable=True)
    op.alter_column("api_logs", "path", existing_type=sa.Text(), type_=sa.VARCHAR(), existing_nullable=False)
