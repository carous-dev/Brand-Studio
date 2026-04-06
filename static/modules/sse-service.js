/**
 * SSE (Server-Sent Events) Service Module
 * Handles real-time log streaming from backend
 */

export class SSEService {
    constructor() {
        this.eventSource = null;
        this.listeners = new Map();
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 1000;
        this.isConnected = false;
    }

    /**
     * Connect to SSE endpoint for log streaming
     * @param {string} endpoint - SSE endpoint URL
     * @param {Object} options - Connection options
     */
    connect(endpoint = '/api/logs/stream', options = {}) {
        if (this.eventSource) {
            this.disconnect();
        }

        const {
            onOpen = null,
            onMessage = null,
            onError = null,
            onClose = null,
            reconnect = true
        } = options;

        try {
            this.eventSource = new EventSource(endpoint);
            
            this.eventSource.onopen = (event) => {
                console.log('SSE connection opened');
                this.isConnected = true;
                this.reconnectAttempts = 0;
                
                if (onOpen) onOpen(event);
                this.emit('open', event);
            };

            this.eventSource.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    
                    if (onMessage) onMessage(data);
                    this.emit('message', data);
                    this.emit(data.type || 'log', data);
                } catch (error) {
                    console.error('Error parsing SSE message:', error);
                    const fallbackData = { type: 'raw', data: event.data };
                    
                    if (onMessage) onMessage(fallbackData);
                    this.emit('message', fallbackData);
                }
            };

            this.eventSource.onerror = (event) => {
                console.error('SSE connection error:', event);
                this.isConnected = false;
                
                if (onError) onError(event);
                this.emit('error', event);

                // Auto-reconnect logic
                if (reconnect && this.reconnectAttempts < this.maxReconnectAttempts) {
                    this.reconnectAttempts++;
                    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
                    
                    console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`);
                    setTimeout(() => {
                        this.connect(endpoint, options);
                    }, delay);
                }
            };

            // Handle specific event types
            this.eventSource.addEventListener('log', (event) => {
                try {
                    const data = JSON.parse(event.data);
                    this.emit('log', data);
                } catch (error) {
                    this.emit('log', { type: 'raw', data: event.data });
                }
            });

            // Handle all log level events
            ['debug', 'info', 'warning', 'error', 'critical'].forEach(level => {
                this.eventSource.addEventListener(level, (event) => {
                    try {
                        const data = JSON.parse(event.data);
                        this.emit('log', data);
                    } catch (error) {
                        this.emit('log', { type: 'raw', data: event.data });
                    }
                });
            });

            this.eventSource.addEventListener('message', (event) => {
                try {
                    const data = JSON.parse(event.data);
                    this.emit('message', data);
                } catch (error) {
                    this.emit('message', { type: 'raw', data: event.data });
                }
            });

            this.eventSource.addEventListener('error', (event) => {
                try {
                    const data = JSON.parse(event.data);
                    this.emit('server-error', data);
                } catch (error) {
                    this.emit('server-error', { type: 'raw', data: event.data });
                }
            });

            this.eventSource.addEventListener('status', (event) => {
                try {
                    const data = JSON.parse(event.data);
                    this.emit('status', data);
                } catch (error) {
                    this.emit('status', { type: 'raw', data: event.data });
                }
            });

        } catch (error) {
            console.error('Failed to create SSE connection:', error);
            if (onError) onError(error);
            this.emit('error', error);
        }
    }

    /**
     * Disconnect from SSE endpoint
     */
    disconnect() {
        if (this.eventSource) {
            this.eventSource.close();
            this.eventSource = null;
            this.isConnected = false;
            console.log('SSE connection closed');
            this.emit('close');
        }
    }

    /**
     * Add event listener
     * @param {string} event - Event name
     * @param {Function} callback - Event callback
     */
    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
    }

    /**
     * Remove event listener
     * @param {string} event - Event name
     * @param {Function} callback - Event callback
     */
    off(event, callback) {
        if (this.listeners.has(event)) {
            const callbacks = this.listeners.get(event);
            const index = callbacks.indexOf(callback);
            if (index > -1) {
                callbacks.splice(index, 1);
            }
        }
    }

    /**
     * Emit event to all listeners
     * @param {string} event - Event name
     * @param {*} data - Event data
     */
    emit(event, data) {
        if (this.listeners.has(event)) {
            this.listeners.get(event).forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Error in SSE event listener for ${event}:`, error);
                }
            });
        }
    }

    /**
     * Get connection status
     * @returns {boolean} Connection status
     */
    isConnectionOpen() {
        return this.isConnected && this.eventSource && this.eventSource.readyState === EventSource.OPEN;
    }

    /**
     * Send data to server (if server supports bidirectional communication)
     * Note: Standard SSE doesn't support client-to-server communication
     * This would need to be implemented with fetch/XHR alongside SSE
     */
    send(data) {
        // This would need to be implemented with a separate HTTP endpoint
        console.warn('SSE is unidirectional. Use HTTP requests for client-to-server communication.');
    }
}

// Create singleton instance
export const sseService = new SSEService();

// Export convenience functions
export const connectToLogs = (options = {}) => {
    sseService.connect('/api/logs/stream', options);
    return sseService;
};

export const disconnectFromLogs = () => {
    sseService.disconnect();
};

export default sseService;
