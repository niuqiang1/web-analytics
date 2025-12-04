const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const CryptoJS = require('crypto-js');
const https = require('https');
const config = require('./config');
const { insertEvents, getRecentEvents, getStats, getUserJourney, db } = require('./db/database');

async function sendFeishuAlert(event) {
    try {
        const errorMsg = event.properties?.message || event.properties?.stack || 'Unknown Error';
        const userInfo = event.properties?.distinct_id || 'Unknown User';
        const urlInfo = event.properties?.url || 'N/A';
        const errorType = event.properties?.type || 'runtime';
        const stackTrace = event.properties?.stack || '';

        const message = {
            msg_type: "post",
            content: {
                post: {
                    zh_cn: {
                        title: "🚨 Analytics 错误报警",
                        content: [
                            [
                                {
                                    tag: "text",
                                    text: "错误类型: " + errorType
                                }
                            ],
                            [
                                {
                                    tag: "text",
                                    text: "错误信息: " + errorMsg
                                }
                            ],
                            [
                                {
                                    tag: "text",
                                    text: "用户ID: " + userInfo
                                }
                            ],
                            [
                                {
                                    tag: "text",
                                    text: "页面URL: "
                                },
                                {
                                    tag: "a",
                                    text: urlInfo,
                                    href: urlInfo
                                }
                            ]
                        ]
                    }
                }
            }
        };

        console.log('Sending Feishu alert for event:', userInfo);
        console.log('Message payload:', JSON.stringify(message, null, 2));

        const data = JSON.stringify(message);
        const url = new URL(config.feishu.webhookUrl);

        const options = {
            hostname: url.hostname,
            path: url.pathname + url.search,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(data)
            }
        };

        const req = https.request(options, (res) => {
            let responseBody = '';
            res.on('data', (chunk) => {
                responseBody += chunk;
            });
            res.on('end', () => {
                console.log(`Feishu Webhook Status: ${res.statusCode}`);
                console.log(`Feishu Webhook Response:`, responseBody);
            });
        });

        req.on('error', (error) => {
            console.error('Feishu Webhook Connection Error:', error.message);
        });

        req.write(data);
        req.end();
    } catch (error) {
        console.error('Feishu Webhook Error:', error.message);
    }
}

const app = express();
const port = config.server.port;
const SECRET_KEY = config.security.secretKey;

// Enable CORS for all routes with explicit configuration
app.use(cors({
    origin: true, // Allow any origin
    credentials: true,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Serve static files from public directory
app.use(express.static('public'));

// Parse JSON bodies (as sent by API clients)
app.use(bodyParser.json());

// Parse text bodies (as sent by navigator.sendBeacon sometimes)
app.use(bodyParser.text({ type: 'text/plain' }));

// API: Get list of apps
app.get('/api/apps', (req, res) => {
    const apps = db.prepare(`
    SELECT 
      app_id,
      COUNT(*) as total_events,
      COUNT(DISTINCT distinct_id) as total_users,
      MAX(timestamp) as last_activity
    FROM events
    WHERE app_id IS NOT NULL
    GROUP BY app_id
    ORDER BY last_activity DESC
  `).all();

    res.json(apps);
});

// Collection endpoint
app.post('/collect', (req, res) => {
    let rawData = req.body;
    let events = [];

    try {
        // Check if encryption is enabled
        if (config.features.encryption) {
            let encryptedString = rawData;
            if (typeof rawData === 'object') {
                encryptedString = JSON.stringify(rawData);
            }

            // Attempt to decrypt
            const bytes = CryptoJS.AES.decrypt(encryptedString, SECRET_KEY);
            const decryptedString = bytes.toString(CryptoJS.enc.Utf8);

            if (decryptedString) {
                events = JSON.parse(decryptedString);
            } else {
                // Fallback: maybe it wasn't encrypted?
                if (typeof rawData === 'string') {
                    events = JSON.parse(rawData);
                } else {
                    events = rawData;
                }
            }
        } else {
            // Encryption disabled, parse directly
            if (typeof rawData === 'string') {
                events = JSON.parse(rawData);
            } else {
                events = rawData;
            }
        }
    } catch (e) {
        console.error('Failed to decrypt/parse events:', e.message);
        // Try parsing as plain JSON just in case
        try {
            if (typeof rawData === 'string') events = JSON.parse(rawData);
            else events = rawData;
        } catch (e2) {
            return res.status(400).send('Invalid Data');
        }
    }

    console.log('--- Received Events (Decrypted) ---');
    if (Array.isArray(events)) {
        // Check for error events and send alerts (if enabled)
        if (config.features.feishuAlerts) {
            events.forEach(event => {
                const eventName = event.event_name || event.event;
                if (eventName === 'error') {
                    sendFeishuAlert(event);
                }
            });
        }

        // Save to database
        try {
            insertEvents(events);
            console.log(`Saved ${events.length} events to database`);
        } catch (dbError) {
            console.error('Database error:', dbError);
        }

        events.forEach(event => {
            const time = event.properties && event.properties.time ? event.properties.time : event.timestamp;
            const dateStr = time ? new Date(time).toISOString() : new Date().toISOString();
            const eventName = event.event_name || event.event;
            console.log(`[${dateStr}] ${eventName}:`, JSON.stringify(event.properties || {}, null, 2));
        });
    } else {
        console.log('Received data:', events);
    }
    console.log('-----------------------------------');

    res.status(200).send('OK');
});

// API: Get recent events with pagination and filtering
app.get('/api/events', (req, res) => {
    const limit = parseInt(req.query.limit) || 20;
    const offset = parseInt(req.query.offset) || 0;
    const userId = req.query.userId;
    const appId = req.query.appId;

    let query = 'SELECT * FROM events';
    let countQuery = 'SELECT COUNT(*) as total FROM events';
    let params = [];
    let conditions = [];

    if (userId) {
        conditions.push('distinct_id LIKE ?');
        params.push(`%${userId}%`);
    }

    if (appId) {
        conditions.push('app_id = ?');
        params.push(appId);
    }

    if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
        countQuery += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY timestamp DESC LIMIT ? OFFSET ?';

    const events = db.prepare(query).all(...params, limit, offset).map(row => ({
        ...row,
        properties: JSON.parse(row.properties)
    }));

    const total = db.prepare(countQuery).get(...params).total;

    res.json({
        events,
        total,
        page: Math.floor(offset / limit) + 1,
        pageSize: limit
    });
});

// API: Get statistics
app.get('/api/stats', (req, res) => {
    const appId = req.query.appId;
    const whereClause = appId ? 'WHERE app_id = ?' : '';
    const params = appId ? [appId] : [];

    const totalEvents = db.prepare(`SELECT COUNT(*) as count FROM events ${whereClause}`).get(...params);
    const totalUsers = db.prepare(`SELECT COUNT(*) as count FROM users`).get();
    const totalSessions = db.prepare(`SELECT COUNT(*) as count FROM sessions`).get();

    const eventsByType = db.prepare(`
    SELECT event_name, COUNT(*) as count
    FROM events
    ${whereClause}
    GROUP BY event_name
    ORDER BY count DESC
  `).all(...params);

    const topPages = db.prepare(`
    SELECT url, COUNT(*) as count
    FROM events
    ${whereClause}
    GROUP BY url
    ORDER BY count DESC
    LIMIT 10
  `).all(...params);

    res.json({
        totalEvents: totalEvents.count,
        totalUsers: totalUsers.count,
        totalSessions: totalSessions.count,
        eventsByType,
        topPages
    });
});

// API: Get user journey
app.get('/api/users/:distinctId/journey', (req, res) => {
    const journey = getUserJourney(req.params.distinctId);
    res.json(journey);
});

// API: Search users (fuzzy search)
app.get('/api/users/search', (req, res) => {
    const searchTerm = req.query.q || '';

    if (!searchTerm) {
        return res.json([]);
    }

    const stmt = db.prepare(`
    SELECT * FROM users
    WHERE distinct_id LIKE ?
    ORDER BY last_seen DESC
    LIMIT 20
  `);

    const users = stmt.all(`%${searchTerm}%`);
    res.json(users);
});

app.listen(port, () => {
    console.log(`Analytics server listening on port ${port}`);
    console.log(`Dashboard: http://localhost:${port}/dashboard.html`);
    console.log('\nConfiguration:');
    console.log(`  - Encryption: ${config.features.encryption ? 'ENABLED' : 'DISABLED'}`);
    console.log(`  - Feishu Alerts: ${config.features.feishuAlerts ? 'ENABLED' : 'DISABLED'}`);
});
