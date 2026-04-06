/**
 * Log Viewer Component - Real-time log display with SSE
 */

export class LogViewer {
    constructor(container, options = {}) {
        this.container = typeof container === 'string' ? document.querySelector(container) : container;
        this.options = {
            maxLogs: 1000,
            autoScroll: true,
            showTimestamp: true,
            showSource: true,
            levelColors: {
                debug: '#6b7280',
                info: '#3b82f6',
                warning: '#f59e0b',
                error: '#ef4444',
                critical: '#dc2626'
            },
            levelIcons: {
                debug: '🔍',
                info: 'ℹ️',
                warning: '⚠️',
                error: '❌',
                critical: '🚨'
            },
            ...options
        };
        
        this.logs = [];
        this.filters = {
            levels: new Set(['info', 'warning', 'error', 'critical']),
            sources: new Set(),
            search: ''
        };
        
        this.init();
    }
    
    init() {
        this.createUI();
        this.bindEvents();
    }
    
    createUI() {
        this.container.innerHTML = `
            <div class="log-viewer">
                <div class="log-viewer-header">
                    <div class="log-viewer-controls">
                        <div class="log-filters">
                            <div class="level-filters">
                                <label class="filter-checkbox">
                                    <input type="checkbox" data-level="debug" checked>
                                    <span class="level-indicator debug"></span>
                                    Debug
                                </label>
                                <label class="filter-checkbox">
                                    <input type="checkbox" data-level="info" checked>
                                    <span class="level-indicator info"></span>
                                    Info
                                </label>
                                <label class="filter-checkbox">
                                    <input type="checkbox" data-level="warning" checked>
                                    <span class="level-indicator warning"></span>
                                    Warning
                                </label>
                                <label class="filter-checkbox">
                                    <input type="checkbox" data-level="error" checked>
                                    <span class="level-indicator error"></span>
                                    Error
                                </label>
                                <label class="filter-checkbox">
                                    <input type="checkbox" data-level="critical" checked>
                                    <span class="level-indicator critical"></span>
                                    Critical
                                </label>
                            </div>
                            <div class="search-filter">
                                <input type="text" placeholder="Search logs..." class="search-input">
                            </div>
                        </div>
                        <div class="log-actions">
                            <button class="btn btn-sm btn-secondary" id="clearLogs">Clear</button>
                            <button class="btn btn-sm btn-secondary" id="exportLogs">Export</button>
                            <button class="btn btn-sm btn-secondary" id="toggleAutoScroll">Auto-scroll: ON</button>
                        </div>
                    </div>
                    <div class="log-stats">
                        <span class="stat">Total: <span id="logCount">0</span></span>
                        <span class="stat">Filtered: <span id="filteredCount">0</span></span>
                        <span class="stat">Connected: <span id="connectionStatus">🔴</span></span>
                    </div>
                </div>
                <div class="log-viewer-content" id="logContainer">
                    <div class="log-placeholder">Waiting for logs...</div>
                </div>
            </div>
        `;
        
        // Add CSS styles
        this.addStyles();
    }
    
    addStyles() {
        if (document.getElementById('log-viewer-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'log-viewer-styles';
        style.textContent = `
            .log-viewer {
                border: 1px solid var(--border-primary, #e5e7eb);
                border-radius: var(--radius-lg, 0.5rem);
                background: var(--bg-card, #ffffff);
                font-family: var(--font-family-mono, 'JetBrains Mono', monospace);
                font-size: 0.875rem;
                height: 400px;
                display: flex;
                flex-direction: column;
            }
            
            .log-viewer-header {
                border-bottom: 1px solid var(--border-primary, #e5e7eb);
                padding: 0.75rem;
                background: var(--bg-secondary, #f9fafb);
            }
            
            .log-viewer-controls {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 0.5rem;
            }
            
            .log-filters {
                display: flex;
                align-items: center;
                gap: 1rem;
            }
            
            .level-filters {
                display: flex;
                gap: 0.5rem;
            }
            
            .filter-checkbox {
                display: flex;
                align-items: center;
                gap: 0.25rem;
                font-size: 0.75rem;
                cursor: pointer;
            }
            
            .filter-checkbox input {
                margin: 0;
            }
            
            .level-indicator {
                width: 8px;
                height: 8px;
                border-radius: 50%;
                display: inline-block;
            }
            
            .level-indicator.debug { background: #6b7280; }
            .level-indicator.info { background: #3b82f6; }
            .level-indicator.warning { background: #f59e0b; }
            .level-indicator.error { background: #ef4444; }
            .level-indicator.critical { background: #dc2626; }
            
            .search-filter input {
                padding: 0.25rem 0.5rem;
                border: 1px solid var(--border-primary, #e5e7eb);
                border-radius: var(--radius-sm, 0.25rem);
                font-size: 0.75rem;
                width: 200px;
            }
            
            .log-actions {
                display: flex;
                gap: 0.5rem;
            }
            
            .btn {
                padding: 0.25rem 0.5rem;
                border: 1px solid var(--border-primary, #e5e7eb);
                border-radius: var(--radius-sm, 0.25rem);
                background: var(--bg-primary, #ffffff);
                cursor: pointer;
                font-size: 0.75rem;
            }
            
            .btn:hover {
                background: var(--bg-hover, #f3f4f6);
            }
            
            .log-stats {
                display: flex;
                gap: 1rem;
                font-size: 0.75rem;
                color: var(--text-secondary, #6b7280);
            }
            
            .log-viewer-content {
                flex: 1;
                overflow-y: auto;
                padding: 0.5rem;
            }
            
            .log-entry {
                display: flex;
                align-items: flex-start;
                padding: 0.25rem 0;
                border-bottom: 1px solid var(--border-primary, #e5e7eb);
                opacity: 0;
                animation: fadeIn 0.3s forwards;
            }
            
            @keyframes fadeIn {
                to { opacity: 1; }
            }
            
            .log-entry:hover {
                background: var(--bg-hover, #f9fafb);
            }
            
            .log-entry.hidden {
                display: none;
            }
            
            .log-level {
                width: 60px;
                font-weight: 600;
                text-align: center;
                margin-right: 0.5rem;
            }
            
            .log-timestamp {
                color: var(--text-secondary, #6b7280);
                margin-right: 0.5rem;
                font-size: 0.75rem;
            }
            
            .log-source {
                color: var(--text-secondary, #6b7280);
                margin-right: 0.5rem;
                font-size: 0.75rem;
                background: var(--bg-secondary, #f3f4f6);
                padding: 0.125rem 0.25rem;
                border-radius: var(--radius-sm, 0.25rem);
            }
            
            .log-message {
                flex: 1;
                word-break: break-word;
            }
            
            .log-placeholder {
                text-align: center;
                color: var(--text-secondary, #6b7280);
                padding: 2rem;
            }
            
            /* Dark theme support */
            @media (prefers-color-scheme: dark) {
                .log-viewer {
                    background: var(--bg-card, #1f2937);
                    border-color: var(--border-primary, #374151);
                }
                
                .log-viewer-header {
                    background: var(--bg-secondary, #111827);
                    border-color: var(--border-primary, #374151);
                }
                
                .search-filter input,
                .btn {
                    background: var(--bg-tertiary, #374151);
                    border-color: var(--border-primary, #4b5563);
                    color: var(--text-primary, #f9fafb);
                }
                
                .btn:hover {
                    background: var(--bg-hover, #4b5563);
                }
                
                .log-entry:hover {
                    background: var(--bg-hover, #374151);
                }
                
                .log-source {
                    background: var(--bg-tertiary, #374151);
                }
            }
        `;
        
        document.head.appendChild(style);
    }
    
    bindEvents() {
        // Level filters
        this.container.querySelectorAll('[data-level]').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const level = e.target.dataset.level;
                if (e.target.checked) {
                    this.filters.levels.add(level);
                } else {
                    this.filters.levels.delete(level);
                }
                this.applyFilters();
            });
        });
        
        // Search filter
        const searchInput = this.container.querySelector('.search-input');
        searchInput.addEventListener('input', (e) => {
            this.filters.search = e.target.value.toLowerCase();
            this.applyFilters();
        });
        
        // Action buttons
        this.container.querySelector('#clearLogs').addEventListener('click', () => {
            this.clearLogs();
        });
        
        this.container.querySelector('#exportLogs').addEventListener('click', () => {
            this.exportLogs();
        });
        
        this.container.querySelector('#toggleAutoScroll').addEventListener('click', (e) => {
            this.options.autoScroll = !this.options.autoScroll;
            e.target.textContent = `Auto-scroll: ${this.options.autoScroll ? 'ON' : 'OFF'}`;
        });
    }
    
    addLog(logData) {
        const log = {
            id: Date.now() + Math.random(),
            timestamp: logData.timestamp || new Date().toISOString(),
            level: logData.level || 'info',
            message: logData.message || '',
            source: logData.source || 'unknown',
            metadata: logData.metadata || {}
        };
        
        this.logs.unshift(log);
        
        // Keep only the most recent logs
        if (this.logs.length > this.options.maxLogs) {
            this.logs = this.logs.slice(0, this.options.maxLogs);
        }
        
        this.renderLog(log);
        this.updateStats();
        this.applyFilters();
        
        // Auto-scroll if enabled
        if (this.options.autoScroll) {
            this.scrollToBottom();
        }
    }
    
    renderLog(log) {
        const logContainer = this.container.querySelector('#logContainer');
        
        // Remove placeholder if this is the first log
        const placeholder = logContainer.querySelector('.log-placeholder');
        if (placeholder) {
            placeholder.remove();
        }
        
        const logElement = document.createElement('div');
        logElement.className = `log-entry level-${log.level}`;
        logElement.dataset.logId = log.id;
        
        const levelColor = this.options.levelColors[log.level] || '#6b7280';
        const levelIcon = this.options.levelIcons[log.level] || 'ℹ️';
        
        logElement.innerHTML = `
            <div class="log-level" style="color: ${levelColor}">
                ${levelIcon} ${log.level.toUpperCase()}
            </div>
            ${this.options.showTimestamp ? `<div class="log-timestamp">${this.formatTimestamp(log.timestamp)}</div>` : ''}
            ${this.options.showSource ? `<div class="log-source">${log.source}</div>` : ''}
            <div class="log-message">${this.escapeHtml(log.message)}</div>
        `;
        
        logContainer.appendChild(logElement);
    }
    
    applyFilters() {
        const logEntries = this.container.querySelectorAll('.log-entry');
        let visibleCount = 0;
        
        logEntries.forEach(entry => {
            const logId = entry.dataset.logId;
            const log = this.logs.find(l => l.id == logId);
            
            if (!log) return;
            
            let visible = true;
            
            // Level filter
            if (!this.filters.levels.has(log.level)) {
                visible = false;
            }
            
            // Search filter
            if (this.filters.search && !log.message.toLowerCase().includes(this.filters.search)) {
                visible = false;
            }
            
            if (visible) {
                entry.classList.remove('hidden');
                visibleCount++;
            } else {
                entry.classList.add('hidden');
            }
        });
        
        this.container.querySelector('#filteredCount').textContent = visibleCount;
    }
    
    updateStats() {
        this.container.querySelector('#logCount').textContent = this.logs.length;
    }
    
    scrollToBottom() {
        const logContainer = this.container.querySelector('#logContainer');
        logContainer.scrollTop = logContainer.scrollHeight;
    }
    
    clearLogs() {
        this.logs = [];
        const logContainer = this.container.querySelector('#logContainer');
        logContainer.innerHTML = '<div class="log-placeholder">Waiting for logs...</div>';
        this.updateStats();
        this.container.querySelector('#filteredCount').textContent = '0';
    }
    
    exportLogs() {
        const logsText = this.logs.map(log => 
            `[${log.timestamp}] [${log.level.toUpperCase()}] [${log.source}] ${log.message}`
        ).join('\n');
        
        const blob = new Blob([logsText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `logs-${new Date().toISOString().split('T')[0]}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    }
    
    setConnectionStatus(connected) {
        const statusElement = this.container.querySelector('#connectionStatus');
        statusElement.textContent = connected ? '🟢' : '🔴';
    }
    
    formatTimestamp(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleTimeString();
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

export default LogViewer;
