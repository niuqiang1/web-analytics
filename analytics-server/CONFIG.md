# Analytics Server Configuration

The analytics server supports flexible configuration through `config.js` and environment variables.

## Quick Start

### Using Default Configuration

The server works out of the box with sensible defaults defined in `config.js`:
- Port: 3000
- Encryption: ENABLED
- Feishu Alerts: ENABLED

Simply run:
```bash
npm start
```

### Using Environment Variables

For production or custom deployments, create a `.env` file:

```bash
# Copy the example file
cp .env.example .env

# Edit .env with your settings
nano .env
```

## Configuration Options

### Server Settings

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | Server port |
| `CORS_ORIGIN` | `*` | CORS allowed origins |

### Security

| Variable | Default | Description |
|----------|---------|-------------|
| `SECRET_KEY` | `analytics-secret-key` | **IMPORTANT**: Change in production! |

### Feature Toggles

| Variable | Default | Description |
|----------|---------|-------------|
| `ENABLE_ENCRYPTION` | `true` | Enable/disable data encryption |
| `ENABLE_FEISHU_ALERTS` | `true` | Enable/disable Feishu error alerts |

**To disable a feature**, set it to `false`:
```bash
ENABLE_ENCRYPTION=false
ENABLE_FEISHU_ALERTS=false
```

### Feishu Integration

| Variable | Default | Description |
|----------|---------|-------------|
| `FEISHU_WEBHOOK` | (provided) | Feishu webhook URL |
| `FEISHU_MIN_INTERVAL` | `5000` | Min interval between alerts (ms) |
| `FEISHU_MAX_PER_MINUTE` | `10` | Max alerts per minute |

### Database

| Variable | Default | Description |
|----------|---------|-------------|
| `DB_PATH` | `./db/analytics.db` | SQLite database path |

## Examples

### Disable Encryption for Development

```bash
ENABLE_ENCRYPTION=false npm start
```

### Disable Feishu Alerts

```bash
ENABLE_FEISHU_ALERTS=false npm start
```

### Production Setup

```bash
# .env file
PORT=8080
SECRET_KEY=your-super-secret-key-here
FEISHU_WEBHOOK=https://open.feishu.cn/open-apis/bot/v2/hook/your-webhook
ENABLE_ENCRYPTION=true
ENABLE_FEISHU_ALERTS=true
```

## Verification

When the server starts, it will display the active configuration:

```
Analytics server listening on port 3000
Dashboard: http://localhost:3000/dashboard.html

Configuration:
  - Encryption: ENABLED
  - Feishu Alerts: ENABLED
```

## Security Best Practices

1. **Never commit `.env` to version control** - It's already in `.gitignore`
2. **Change `SECRET_KEY` in production** - Use a strong, random key
3. **Rotate secrets regularly** - Update `SECRET_KEY` and `FEISHU_WEBHOOK` periodically
4. **Use environment variables in production** - Don't modify `config.js` directly
