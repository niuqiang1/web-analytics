let eventTypesChart = null;

// Get appId from URL
const urlParams = new URLSearchParams(window.location.search);
const currentAppId = urlParams.get('appId');

// Tab switching
function switchTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });

    // Remove active class from all buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    // Show selected tab
    document.getElementById(`${tabName}-tab`).classList.add('active');

    // Add active class to clicked button
    event.target.classList.add('active');

    // Load data for specific tabs
    if (tabName === 'users') {
        loadUsersList(1);
    }
}

// Load statistics
async function loadStats() {
    try {
        const url = `/api/stats${currentAppId ? '?appId=' + encodeURIComponent(currentAppId) : ''}`;
        const response = await fetch(url);
        const stats = await response.json();

        // Update header stats
        document.getElementById('totalEvents').textContent = stats.totalEvents.toLocaleString();
        document.getElementById('totalUsers').textContent = stats.totalUsers.toLocaleString();
        document.getElementById('totalSessions').textContent = stats.totalSessions.toLocaleString();
        document.getElementById('totalErrors').textContent = stats.totalErrors.toLocaleString();

        // Check for new errors (errors in last 5 minutes)
        const hasNewErrors = stats.recentErrors.some(error => {
            const errorTime = new Date(error.timestamp);
            const now = new Date();
            return (now - errorTime) < 5 * 60 * 1000; // 5 minutes
        });

        // Show error badge if there are new errors
        const errorCard = document.getElementById('errorStatCard');
        const newErrorBadge = document.getElementById('newErrorBadge');

        if (hasNewErrors) {
            errorCard.classList.add('has-new-error');
            newErrorBadge.style.display = 'block';
        } else {
            errorCard.classList.remove('has-new-error');
            newErrorBadge.style.display = 'none';
        }

        // Display recent errors
        updateRecentErrors(stats.recentErrors);

        // Update event types chart
        updateEventTypesChart(stats.eventsByType);

        // Update top pages
        updateTopPages(stats.topPages);
    } catch (error) {
        console.error('Failed to load stats:', error);
    }
}

// Update event types chart
function updateEventTypesChart(eventsByType) {
    const ctx = document.getElementById('eventTypesChart').getContext('2d');

    if (eventTypesChart) {
        eventTypesChart.destroy();
    }

    eventTypesChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: eventsByType.map(e => e.event_name),
            datasets: [{
                data: eventsByType.map(e => e.count),
                backgroundColor: [
                    '#667eea',
                    '#764ba2',
                    '#f093fb',
                    '#4facfe',
                    '#43e97b',
                    '#fa709a',
                ],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

// Update top pages
function updateTopPages(topPages) {
    const container = document.getElementById('topPages');
    container.innerHTML = '';

    topPages.forEach(page => {
        const item = document.createElement('div');
        item.className = 'list-item';
        item.innerHTML = `
            <span>${page.url}</span>
            <strong>${page.count}</strong>
        `;
        container.appendChild(item);
    });
}

// Pagination state

// Update recent errors
function updateRecentErrors(errors) {
    const card = document.getElementById('recentErrorsCard');
    const container = document.getElementById('recentErrorsList');
    
    if (errors.length === 0) {
        card.style.display = 'none';
        return;
    }
    
    card.style.display = 'block';
    container.innerHTML = '';
    
    errors.forEach(error => {
        const item = document.createElement('div');
        item.className = 'error-item';
        const time = new Date(error.timestamp).toLocaleString('zh-CN');
        const props = error.properties;
        
        item.innerHTML = `
            <div class="error-time">${time}</div>
            <div class="error-message">
                <strong>${props.message || 'Unknown Error'}</strong>
            </div>
            <div class="error-details">
                <span>👤 ${error.distinct_id}</span>
                <span>🔗 ${error.url || 'N/A'}</span>
            </div>
        `;
        
        // Click to view user journey
        item.onclick = () => {
            switchTab('journey');
            document.getElementById('userIdInput').value = error.distinct_id;
            loadUserJourney(error.distinct_id);
        };
        
        container.appendChild(item);
    });
}
let currentPage = 1;
let pageSize = 20;
let currentFilter = '';
let totalEvents = 0;

// Load recent events with pagination
async function loadRecentEvents(page = 1) {
    currentPage = page;

    try {
        const url = `/api/events?limit=${pageSize}&offset=${(page - 1) * pageSize}${currentFilter ? '&userId=' + encodeURIComponent(currentFilter) : ''}${currentAppId ? '&appId=' + encodeURIComponent(currentAppId) : ''}`;
        const response = await fetch(url);
        const data = await response.json();

        const events = data.events || data;
        totalEvents = data.total || events.length;

        const tbody = document.getElementById('eventsTableBody');
        tbody.innerHTML = '';

        events.forEach(event => {
            const row = document.createElement('tr');
            const time = new Date(event.timestamp).toLocaleString();
            const props = event.properties;

            // Add error class for error events
            if (event.event_name === 'error') {
                row.classList.add('error-event');
            }

            row.innerHTML = `
                <td>${time}</td>
                <td><strong>${event.event_name}</strong></td>
                <td><code>${event.distinct_id}</code></td>
                <td>${event.url}</td>
                <td>
                    ${props.tag ? `<span>🏷️ ${props.tag}${props.id ? '#' + props.id : ''}${props.className && typeof props.className === 'string' ? '.' + props.className.split(' ')[0] : ''}</span>` : ''}
                    ${props.text ? `<span>📝 ${props.text.substring(0, 50)}${props.text.length > 50 ? '...' : ''}</span>` : ''}
                    ${props.message ? `<span style="color: #dc3545; font-weight: 600;">⚠️ ${props.message.substring(0, 50)}${props.message.length > 50 ? '...' : ''}</span>` : ''}
                </td>
            `;
            tbody.appendChild(row);
        });

        // Update pagination controls
        updatePaginationControls();
    } catch (error) {
        console.error('Failed to load events:', error);
    }
}

// Update pagination controls
function updatePaginationControls() {
    const totalPages = Math.ceil(totalEvents / pageSize) || 1;
    const pageInfo = document.getElementById('pageInfo');

    if (totalPages > 1) {
        pageInfo.textContent = `第 ${currentPage} 页，共 ${totalPages} 页`;
    } else {
        pageInfo.textContent = `第 ${currentPage} 页`;
    }

    document.getElementById('prevPage').disabled = currentPage === 1;
    document.getElementById('nextPage').disabled = currentPage >= totalPages || totalEvents === 0;
}

// Filter events by user ID
function filterEvents() {
    currentFilter = document.getElementById('userIdFilter').value.trim();
    currentPage = 1;
    autoRefreshEnabled = false;
    loadRecentEvents(1);
}

// Search users with fuzzy matching
async function searchUsers() {
    const searchTerm = document.getElementById('userIdInput').value.trim();
    if (!searchTerm) {
        alert('请输入用户 ID 或部分 ID');
        return;
    }

    try {
        const response = await fetch('/api/users/search?q=' + encodeURIComponent(searchTerm));
        const users = await response.json();

        const resultsContainer = document.getElementById('userSearchResults');
        resultsContainer.innerHTML = '';

        if (users.length === 0) {
            resultsContainer.innerHTML = '<p style="color: #666; padding: 10px;">未找到用户</p>';
            document.getElementById('userJourneyContainer').innerHTML = '';
            return;
        }

        users.forEach(user => {
            const item = document.createElement('div');
            item.className = 'user-result-item';
            item.onclick = () => loadUserJourney(user.distinct_id);

            item.innerHTML = `
                <div class="user-id">${user.distinct_id}</div>
                <div class="user-stats">
                    ${user.total_events} 个事件 | ${user.total_sessions} 个会话 | 
                    最后访问: ${new Date(user.last_seen).toLocaleString('zh-CN')}
                </div>
            `;
            resultsContainer.appendChild(item);
        });
    } catch (error) {
        console.error('Failed to search users:', error);
        alert('搜索用户失败');
    }
}

// Load user journey
let currentTimelinePage = 1;
const timelinePageSize = 20;

async function loadUserJourney(userId) {
    if (!userId) {
        userId = document.getElementById('userIdInput').value.trim();
        if (!userId) {
            alert('请输入用户 ID');
            return;
        }
    }

    try {
        const response = await fetch(`/api/users/${userId}/journey`);
        const journey = await response.json();

        const container = document.getElementById('userJourneyContainer');
        container.innerHTML = '';

        if (!journey.user) {
            container.innerHTML = '<p>未找到用户</p>';
            return;
        }

        // User info
        const userInfo = document.createElement('div');
        userInfo.className = 'user-info';
        userInfo.innerHTML = `
            <div class="user-profile-header">
                <div class="user-avatar-placeholder">
                    ${journey.user.distinct_id.substring(0, 2).toUpperCase()}
                </div>
                <div class="user-identity">
                    <div class="user-id-code">${journey.user.distinct_id}</div>
                    <div class="user-id-label">用户 ID</div>
                </div>
            </div>
            <div class="user-stats-grid">
                <div class="stat-item">
                    <div class="stat-label">首次访问</div>
                    <div class="stat-value small">${new Date(journey.user.first_seen).toLocaleString('zh-CN')}</div>
                </div>
                <div class="stat-item">
                    <div class="stat-label">最后访问</div>
                    <div class="stat-value small">${new Date(journey.user.last_seen).toLocaleString('zh-CN')}</div>
                </div>
                <div class="stat-item">
                    <div class="stat-label">总事件数</div>
                    <div class="stat-value">${journey.user.total_events}</div>
                </div>
                <div class="stat-item">
                    <div class="stat-label">总会话数</div>
                    <div class="stat-value">${journey.user.total_sessions}</div>
                </div>
            </div>
        `;
        container.appendChild(userInfo);


        // Events timeline with pagination
        renderTimeline(journey.events, container);
    } catch (error) {
        console.error('Failed to load user journey:', error);
        alert('加载用户旅程失败');
    }
}

// Render timeline with pagination
function renderTimeline(allEvents, container) {
    const timeline = document.createElement('div');
    timeline.className = 'journey-timeline';

    const totalPages = Math.ceil(allEvents.length / timelinePageSize);

    // Timeline header
    const header = document.createElement('div');
    header.className = 'timeline-header';
    header.innerHTML = `
        <h3>事件时间线 (${allEvents.length} 个事件)</h3>
        <div class="timeline-controls">
            <button onclick="filterTimelineEvents('all')" class="active" id="filter-all">全部</button>
            <button onclick="filterTimelineEvents('click')" id="filter-click">点击</button>
            <button onclick="filterTimelineEvents('pageview')" id="filter-pageview">页面浏览</button>
            <button onclick="filterTimelineEvents('error')" id="filter-error">错误</button>
        </div>
    `;
    timeline.appendChild(header);

    // Store all events for filtering
    timeline.dataset.allEvents = JSON.stringify(allEvents);

    // Render current page
    renderTimelinePage(allEvents, timeline, currentTimelinePage);

    container.appendChild(timeline);
}

// Render timeline page
function renderTimelinePage(events, timeline, page) {
    // Remove old events
    const oldEvents = timeline.querySelectorAll('.journey-event');
    oldEvents.forEach(e => e.remove());

    const oldPagination = timeline.querySelector('.timeline-pagination');
    if (oldPagination) oldPagination.remove();

    const start = (page - 1) * timelinePageSize;
    const end = start + timelinePageSize;
    const pageEvents = events.slice(start, end);

    pageEvents.forEach(event => {
        const eventDiv = document.createElement('div');
        eventDiv.className = 'journey-event';
        if (event.event_name === 'error') {
            eventDiv.classList.add('error-event');
        }

        const props = event.properties;
        const eventTime = new Date(event.timestamp);
        const now = new Date();
        const diffMs = now - eventTime;
        const relativeTime = getRelativeTime(diffMs);

        const eventType = event.event_name;
        let badgeClass = '';
        if (eventType === 'error') badgeClass = 'error';
        else if (eventType === 'pageview') badgeClass = 'pageview';
        else if (eventType === 'click') badgeClass = 'click';

        eventDiv.innerHTML = `
            <div class="event-time-section">
                <div class="event-date">${eventTime.toLocaleDateString()}</div>
                <div class="event-time">${eventTime.toLocaleTimeString()}</div>
                <div class="event-relative-time">${relativeTime}</div>
            </div>
            <div class="event-content-section">
                <div class="event-name">
                    <span class="event-badge ${badgeClass}">${event.event_name}</span>
                </div>
                <div class="event-details">
                    <div class="event-details-item">
                        <strong>URL:</strong>
                        <a href="${event.url}" target="_blank">${event.url}</a>
                    </div>
                    ${props.tag ? `
                        <div class="event-details-item">
                            <strong>Element:</strong>
                            <span>${props.tag}${props.id ? '#' + props.id : ''}${props.className && typeof props.className === 'string' ? '.' + props.className.split(' ')[0] : ''}</span>
                        </div>
                    ` : ''}
                    ${props.text ? `
                        <div class="event-details-item">
                            <strong>Text:</strong>
                            <span>${props.text.substring(0, 100)}${props.text.length > 100 ? '...' : ''}</span>
                        </div>
                    ` : ''}
                    ${props.message ? `
                        <div class="event-details-item">
                            <strong>Error:</strong>
                            <span style="color: #dc3545; font-weight: 600;">${props.message}</span>
                        </div>
                    ` : ''}
                    ${props.path ? `
                        <div class="event-details-item">
                            <strong>Path:</strong>
                            <span>${props.path}</span>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
        timeline.appendChild(eventDiv);
    });

    // Add pagination if needed
    if (events.length > timelinePageSize) {
        const totalPages = Math.ceil(events.length / timelinePageSize);
        const pagination = document.createElement('div');
        pagination.className = 'timeline-pagination';
        pagination.innerHTML = `
            <button onclick="changeTimelinePage(-1)" ${page === 1 ? 'disabled' : ''}>← 上一页</button>
            <span>第 ${page} 页，共 ${totalPages} 页</span>
            <button onclick="changeTimelinePage(1)" ${page >= totalPages ? 'disabled' : ''}>下一页 →</button>
        `;
        timeline.appendChild(pagination);
    }
}

// Change timeline page
function changeTimelinePage(delta) {
    const timeline = document.querySelector('.journey-timeline');
    const allEvents = JSON.parse(timeline.dataset.allEvents);
    currentTimelinePage += delta;
    renderTimelinePage(allEvents, timeline, currentTimelinePage);
}

// Filter timeline events
function filterTimelineEvents(type) {
    const timeline = document.querySelector('.journey-timeline');
    const allEvents = JSON.parse(timeline.dataset.allEvents);

    // Update button states
    document.querySelectorAll('.timeline-controls button').forEach(btn => {
        btn.classList.remove('active');
    });
    document.getElementById(`filter-${type}`).classList.add('active');

    let filteredEvents = allEvents;
    if (type !== 'all') {
        filteredEvents = allEvents.filter(e => e.event_name === type);
    }

    // Update header count
    const header = timeline.querySelector('.timeline-header h3');
    header.textContent = `事件时间线 (${filteredEvents.length} 个事件)`;

    currentTimelinePage = 1;
    renderTimelinePage(filteredEvents, timeline, 1);
}

// Users list pagination state
let currentUsersPage = 1;
const usersPageSize = 20;
let totalUsers = 0;

// Load users list
async function loadUsersList(page = 1) {
    currentUsersPage = page;

    try {
        const url = `/api/users?limit=${usersPageSize}&offset=${(page - 1) * usersPageSize}${currentAppId ? '&appId=' + encodeURIComponent(currentAppId) : ''}`;
        const response = await fetch(url);
        const data = await response.json();

        totalUsers = data.total || 0;

        const container = document.getElementById('usersContainer');
        container.innerHTML = '';

        if (data.users.length === 0) {
            container.innerHTML = '<p style="color: #666; padding: 20px; text-align: center;">暂无用户数据</p>';
        } else {
            data.users.forEach(user => {
                const card = document.createElement('div');
                card.className = 'user-card';
                card.onclick = () => viewUserDetail(user.distinct_id);

                const firstSeen = new Date(user.first_seen).toLocaleDateString('zh-CN');
                const lastSeen = new Date(user.last_seen).toLocaleString('zh-CN');
                const appIds = user.app_ids ? user.app_ids.split(',') : [];

                card.innerHTML = `
                    <div class="user-id">${user.distinct_id}</div>
                    <div class="user-stats">
                        <span>📊 ${user.total_events || 0} 事件</span>
                        <span>🔗 ${user.total_sessions || 0} 会话</span>
                    </div>
                    <div class="user-time">
                        <div>首次访问: ${firstSeen}</div>
                        <div>最后访问: ${lastSeen}</div>
                    </div>
                    ${appIds.length > 0 ? `<div class="user-apps">${appIds.map(id => `<span class="app-badge">${id}</span>`).join('')}</div>` : ''}
                `;
                container.appendChild(card);
            });
        }

        // Update pagination
        updateUsersPaginationControls();
    } catch (error) {
        console.error('Failed to load users list:', error);
        const container = document.getElementById('usersContainer');
        container.innerHTML = '<p style="color: #dc3545; padding: 20px; text-align: center;">加载用户列表失败</p>';
    }
}

// Update users pagination controls
function updateUsersPaginationControls() {
    const totalPages = Math.ceil(totalUsers / usersPageSize) || 1;
    const pageInfo = document.getElementById('usersPageInfo');

    if (totalPages > 1) {
        pageInfo.textContent = `第 ${currentUsersPage} 页，共 ${totalPages} 页 (总共 ${totalUsers} 个用户)`;
    } else {
        pageInfo.textContent = `共 ${totalUsers} 个用户`;
    }

    document.getElementById('usersPrevPage').disabled = currentUsersPage === 1;
    document.getElementById('usersNextPage').disabled = currentUsersPage >= totalPages || totalUsers === 0;
}

// Change users page
function changeUsersPage(delta) {
    loadUsersList(currentUsersPage + delta);
}

// View user detail
function viewUserDetail(userId) {
    switchTab('journey');
    document.getElementById('userIdInput').value = userId;
    loadUserJourney(userId);
}

// Get relative time string
function getRelativeTime(diffMs) {
    const seconds = Math.floor(diffMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} 天前`;
    if (hours > 0) return `${hours} 小时前`;
    if (minutes > 0) return `${minutes} 分钟前`;
    return `${seconds} 秒前`;
}

// Auto-refresh
let autoRefreshEnabled = true;

function startAutoRefresh() {
    loadStats();
    loadRecentEvents();

    setInterval(() => {
        loadStats();
        // Only auto-refresh events if user hasn't manually changed pages
        if (autoRefreshEnabled && currentPage === 1 && !currentFilter) {
            loadRecentEvents(1);
        }
    }, 5000); // Refresh every 5 seconds
}

// Pause auto-refresh when user interacts with pagination
function changePage(delta) {
    autoRefreshEnabled = false;
    loadRecentEvents(currentPage + delta);
}

// Re-enable auto-refresh when clearing filter
function clearFilter() {
    currentFilter = '';
    document.getElementById('userIdFilter').value = '';
    currentPage = 1;
    autoRefreshEnabled = true;
    loadRecentEvents(1);
}

// Initialize
window.addEventListener('DOMContentLoaded', () => {
    // Display app name if selected
    if (currentAppId) {
        document.getElementById('appName').textContent = `- ${currentAppId}`;
    }

    startAutoRefresh();
});
