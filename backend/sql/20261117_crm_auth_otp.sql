-- Apply once to the intended MySQL/MariaDB database BEFORE running the CRM OTP API.
-- Additive, no existing tables altered. Never run against an unverified target.
CREATE TABLE IF NOT EXISTS crm_auth_otp (
  email VARCHAR(255) PRIMARY KEY,
  code_hash CHAR(64) NULL,
  expires_at BIGINT NOT NULL DEFAULT 0,
  requested_at BIGINT NOT NULL DEFAULT 0,
  attempts INT NOT NULL DEFAULT 0
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS crm_auth_limits (
  limit_key CHAR(64) PRIMARY KEY,
  window_start BIGINT NOT NULL DEFAULT 0,
  attempts INT NOT NULL DEFAULT 0,
  lock_until BIGINT NOT NULL DEFAULT 0,
  INDEX idx_crm_auth_limits_window (window_start)
) ENGINE=InnoDB;
