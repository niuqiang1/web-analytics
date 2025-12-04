const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'analytics.db');
const schemaPath = path.join(__dirname, 'schema.sql');

// Initialize database
const db = new Database(dbPath);

// Run schema
const schema = fs.readFileSync(schemaPath, 'utf8');
db.exec(schema);

console.log('Database initialized at:', dbPath);

/**
 * Insert an event into the database
 */
function insertEvent(event) {
    const stmt = db.prepare(`
    INSERT INTO events (event_name, distinct_id, session_id, app_id, timestamp, url, referrer, properties)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

    const props = event.properties;

    stmt.run(
        event.event_name || event.event,
        event.distinct_id || props.distinct_id,
        event.session_id || props.session_id,
        event.app_id || props.app_id,
        event.timestamp || props.time,
        event.url || props.url,
        event.referrer || props.referrer,
        JSON.stringify(props)
    );

    // Update user stats
    const timestamp = event.timestamp || props.time;
    updateUserStats(event.distinct_id || props.distinct_id, timestamp);

    // Update session stats
    updateSessionStats(event.session_id || props.session_id, event.distinct_id || props.distinct_id, timestamp);
}

/**
 * Insert multiple events (batch)
 */
function insertEvents(events) {
    const insert = db.transaction((events) => {
        for (const event of events) {
            insertEvent(event);
        }
    });

    insert(events);
}

/**
 * Update user statistics
 */
function updateUserStats(distinctId, timestamp) {
    const stmt = db.prepare(`
    INSERT INTO users (distinct_id, first_seen, last_seen, total_events)
    VALUES (?, ?, ?, 1)
    ON CONFLICT(distinct_id) DO UPDATE SET
      last_seen = ?,
      total_events = total_events + 1
  `);

    stmt.run(distinctId, timestamp, timestamp, timestamp);
}

/**
 * Update session statistics
 */
function updateSessionStats(sessionId, distinctId, timestamp) {
    const stmt = db.prepare(`
    INSERT INTO sessions (session_id, distinct_id, start_time, end_time, event_count)
    VALUES (?, ?, ?, ?, 1)
    ON CONFLICT(session_id) DO UPDATE SET
      end_time = ?,
      event_count = event_count + 1
  `);

    stmt.run(sessionId, distinctId, timestamp, timestamp, timestamp);
}

/**
 * Get recent events
 */
function getRecentEvents(limit = 100) {
    const stmt = db.prepare(`
    SELECT * FROM events
    ORDER BY timestamp DESC
    LIMIT ?
  `);

    return stmt.all(limit).map(row => ({
        ...row,
        properties: JSON.parse(row.properties)
    }));
}

/**
 * Get events by user
 */
function getEventsByUser(distinctId, limit = 100) {
    const stmt = db.prepare(`
    SELECT * FROM events
    WHERE distinct_id = ?
    ORDER BY timestamp DESC
    LIMIT ?
  `);

    return stmt.all(distinctId, limit).map(row => ({
        ...row,
        properties: JSON.parse(row.properties)
    }));
}

/**
 * Get statistics
 */
function getStats() {
    const totalEvents = db.prepare('SELECT COUNT(*) as count FROM events').get();
    const totalUsers = db.prepare('SELECT COUNT(*) as count FROM users').get();
    const totalSessions = db.prepare('SELECT COUNT(*) as count FROM sessions').get();

    const eventsByType = db.prepare(`
    SELECT event_name, COUNT(*) as count
    FROM events
    GROUP BY event_name
    ORDER BY count DESC
  `).all();

    const topPages = db.prepare(`
    SELECT url, COUNT(*) as count
    FROM events
    GROUP BY url
    ORDER BY count DESC
    LIMIT 10
  `).all();

    return {
        totalEvents: totalEvents.count,
        totalUsers: totalUsers.count,
        totalSessions: totalSessions.count,
        eventsByType,
        topPages
    };
}

/**
 * Get user journey
 */
function getUserJourney(distinctId) {
    const events = getEventsByUser(distinctId, 1000);

    const sessions = db.prepare(`
    SELECT * FROM sessions
    WHERE distinct_id = ?
    ORDER BY start_time DESC
  `).all(distinctId);

    return {
        user: db.prepare('SELECT * FROM users WHERE distinct_id = ?').get(distinctId),
        sessions,
        events
    };
}

module.exports = {
    db,
    insertEvent,
    insertEvents,
    getRecentEvents,
    getEventsByUser,
    getStats,
    getUserJourney
};
