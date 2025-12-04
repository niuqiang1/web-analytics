// Type definitions for codeless-analytics-sdk
// Project: https://github.com/yourusername/codeless-analytics-sdk
// Definitions by: Your Name <your.email@example.com>

export interface AnalyticsOptions {
    /** 应用 ID */
    appId: string;
    /** 服务器 URL */
    serverUrl: string;
    /** 是否自动追踪 (默认: true) */
    autoTrack?: boolean;
    /** 是否开启调试模式 (默认: false) */
    debug?: boolean;
    /** 是否加密数据 (默认: true) */
    encrypt?: boolean;
    /** 缓冲区大小 (默认: 10) */
    bufferSize?: number;
    /** 自动发送间隔，毫秒 (默认: 5000) */
    flushInterval?: number;
}

export interface Tracker {
    /** 追踪自定义事件 */
    track(eventName: string, properties?: Record<string, any>): void;
    /** 手动发送缓冲区中的事件 */
    flush(): void;
}

/**
 * 初始化 Analytics SDK
 * @param options - 配置选项
 * @returns Tracker 实例
 */
export function init(options: AnalyticsOptions): Tracker;

export default {
    init
};
