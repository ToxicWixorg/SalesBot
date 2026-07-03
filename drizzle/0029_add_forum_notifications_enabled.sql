-- Add the master on/off switch for sending notifications to the forum group.
-- Default OFF so the bot stays silent in the group until an admin enables it.
ALTER TABLE "forum_settings"
	ADD COLUMN IF NOT EXISTS "notifications_enabled" boolean NOT NULL DEFAULT false;
