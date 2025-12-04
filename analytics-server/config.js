/**
 * Analytics Server Configuration
 * 
 * This file contains all configurable parameters for the analytics server.
 * Environment variables can override these defaults for production deployments.
 */

module.exports = {
    // Server Settings
    server: {
        port: process.env.PORT || 3000,
        corsOrigin: process.env.CORS_ORIGIN || '*'
    },

    // Security Settings
    security: {
        // Secret key for encrypting analytics data
        // IMPORTANT: Change this in production and use environment variables
        secretKey: process.env.SECRET_KEY || 'analytics-secret-key'
    },

    // Feature Toggles
    features: {
        // Enable/disable data encryption
        encryption: process.env.ENABLE_ENCRYPTION !== 'false', // Default: true

        // Enable/disable Feishu error alerts
        feishuAlerts: process.env.ENABLE_FEISHU_ALERTS !== 'false' // Default: true
    },

    // Feishu Integration
    feishu: {
        // Feishu webhook URL for error alerts
        webhookUrl: process.env.FEISHU_WEBHOOK,

        // Rate limiting settings (to avoid hitting Feishu's rate limits)
        rateLimit: {
            // Minimum interval between alerts in milliseconds
            minInterval: parseInt(process.env.FEISHU_MIN_INTERVAL) || 5000, // 5 seconds

            // Maximum alerts per minute
            maxPerMinute: parseInt(process.env.FEISHU_MAX_PER_MINUTE) || 10
        }
    },

    // Database Settings
    database: {
        path: process.env.DB_PATH || './db/analytics.db'
    }
};
