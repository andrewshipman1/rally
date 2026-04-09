-- ============================================================
-- 012_activity_log.sql
-- Notification-grade event log. Powers the buzz feed (§5.26)
-- and future notification channels (push, email, in-app badges).
--
-- Each row records one discrete event in a trip's lifecycle.
-- Write paths (server actions that INSERT) ship in Session 3C.
-- This session (3B) creates the table and reads from it.
-- ============================================================

CREATE TABLE activity_log (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id     uuid NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  actor_id    uuid REFERENCES users(id) ON DELETE SET NULL,
  event_type  text NOT NULL,
  target_id   uuid,
  target_type text,
  metadata    jsonb NOT NULL DEFAULT '{}',
  is_read     boolean NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- Primary read path: buzz feed (reverse-chron per trip)
CREATE INDEX idx_activity_log_trip_time ON activity_log (trip_id, created_at DESC);

-- Notification routing: "what did user X do?"
CREATE INDEX idx_activity_log_actor ON activity_log (actor_id) WHERE actor_id IS NOT NULL;

-- Filter by event type (notification channel routing)
CREATE INDEX idx_activity_log_type ON activity_log (event_type);

-- Badge counts: unread events per trip
CREATE INDEX idx_activity_log_unread ON activity_log (trip_id, is_read) WHERE is_read = false;
