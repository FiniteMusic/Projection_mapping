
USE projection_mapping;

CREATE TABLE IF NOT EXISTS users (
    id CHAR(36) PRIMARY KEY,
    created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
        ON UPDATE CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS projects (
    id CHAR(36) PRIMARY KEY,
    owner_id CHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT NULL,
    status ENUM('draft', 'ready', 'archived') NOT NULL DEFAULT 'draft',
    settings JSON NOT NULL,
    created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
        ON UPDATE CURRENT_TIMESTAMP(3),

    INDEX idx_projects_owner (owner_id),
    CONSTRAINT fk_projects_owner
        FOREIGN KEY (owner_id) REFERENCES users(id)
        ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS media (
    id CHAR(36) PRIMARY KEY,
    project_id CHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    type ENUM('image', 'video') NOT NULL,
    mime_type ENUM(
        'image/jpeg',
        'image/png',
        'image/webp',
        'video/mp4'
    ) NOT NULL,
    url TEXT NOT NULL,
    size_bytes BIGINT UNSIGNED NOT NULL,
    dimensions JSON NOT NULL,
    duration_seconds DOUBLE NULL,
    status ENUM('processing', 'ready', 'failed')
        NOT NULL DEFAULT 'processing',
    created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
        ON UPDATE CURRENT_TIMESTAMP(3),

    INDEX idx_media_project (project_id),
    CONSTRAINT fk_media_project
        FOREIGN KEY (project_id) REFERENCES projects(id)
        ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS surfaces (
    id CHAR(36) PRIMARY KEY,
    project_id CHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    corners JSON NOT NULL,
    media_id CHAR(36) NULL,
    visible BOOLEAN NOT NULL DEFAULT TRUE,
    z_index INT NOT NULL DEFAULT 0,
    opacity DOUBLE NOT NULL DEFAULT 1,
    created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
        ON UPDATE CURRENT_TIMESTAMP(3),

    INDEX idx_surfaces_project (project_id),
    INDEX idx_surfaces_media (media_id),
    CONSTRAINT fk_surfaces_project
        FOREIGN KEY (project_id) REFERENCES projects(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_surfaces_media
        FOREIGN KEY (media_id) REFERENCES media(id)
        ON DELETE SET NULL,
    CONSTRAINT chk_surface_opacity
        CHECK (opacity >= 0 AND opacity <= 1)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS sessions (
    id CHAR(36) PRIMARY KEY,
    project_id CHAR(36) NOT NULL,
    status ENUM('waiting', 'active', 'ended')
        NOT NULL DEFAULT 'waiting',
    player_connection_status ENUM('disconnected', 'connected')
        NOT NULL DEFAULT 'disconnected',
    created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
        ON UPDATE CURRENT_TIMESTAMP(3),
    ended_at DATETIME(3) NULL,

    INDEX idx_sessions_project (project_id),
    CONSTRAINT fk_sessions_project
        FOREIGN KEY (project_id) REFERENCES projects(id)
        ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS pending_pairings (
    id CHAR(36) PRIMARY KEY,
    session_id CHAR(36) NULL,
    status ENUM('pending', 'paired', 'expired')
        NOT NULL DEFAULT 'pending',
    pairing_code CHAR(6) NOT NULL,
    pairing_token_hash CHAR(64) NOT NULL,
    created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    expires_at DATETIME(3) NOT NULL,
    failed_attempts INT UNSIGNED NOT NULL DEFAULT 0,

    UNIQUE KEY uq_pairing_token_hash (pairing_token_hash),
    INDEX idx_pairing_code (pairing_code),
    INDEX idx_pairing_expiration (expires_at),
    CONSTRAINT fk_pairing_session
        FOREIGN KEY (session_id) REFERENCES sessions(id)
        ON DELETE SET NULL
) ENGINE=InnoDB;
