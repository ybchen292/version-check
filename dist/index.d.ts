/**
 * 通用前端版本检测工具
 * 自动判断检测模式（ETag/版本文件）| 默认自动轮询 | 保留手动检测 | 内置原生confirm提示
 * @module version-check-js
 */
interface StorageApi {
    get: (key: string) => string | null;
    set: (key: string, value: string) => boolean;
}
interface FetchOptions {
    method?: string;
    cache?: RequestCache;
    credentials?: RequestCredentials;
    headers?: Record<string, string>;
    [key: string]: any;
}
interface VersionCheckOptions {
    /** 检测地址（默认/：ETag 模式；传文件路径如/version.json：版本文件模式） */
    url?: string;
    /** 轮询间隔（毫秒），默认 10 分钟 */
    interval?: number;
    /** 更新提示文案 */
    message?: string;
    /** 自定义更新回调（优先级高于默认 confirm） */
    onUpdate?: (() => void) | null;
    /** 错误回调 */
    onError?: ((err: Error) => void) | null;
    /** 日志回调 */
    onLog?: ((message: string) => void) | null;
    /** 自定义存储配置（get/set 方法） */
    storage?: StorageApi | null;
    /** 重新加载时的时间戳参数名，默认't' */
    t?: string;
    /** 存储版本标识的key */
    versionKey?: string;
    /** 启动时是否立即执行一次检测 */
    initialCheck?: boolean;
    /** 是否绑定页面可见性变化监听 */
    bindVisibility?: boolean;
    /** 自定义请求函数，优先级高于内部fetch实现 */
    fetchRequest?: ((url: string, options: FetchOptions) => Promise<any>) | null;
    /** 自定义fetch选项，优先级高于默认值 */
    fetchOptions?: FetchOptions;
}
declare class VersionCheck {
    private config;
    private timer;
    private memoryStorage;
    private storageApi;
    private versionKey;
    private checkMode;
    private isRunning;
    private _visibilityHandler;
    /**
     * 构造函数：初始化配置和存储（极简配置）
     * @param options 配置项
     */
    constructor(options?: VersionCheckOptions);
    /**
     * 日志输出
     * @private
     * @param message 日志信息
     */
    private _log;
    /**
     * 绑定页面可见性变化监听器
     * @private
     */
    private _bindVisibilityListener;
    /**
     * 解绑页面可见性变化监听器
     * @private
     */
    private _unbindVisibilityListener;
    /**
     * 处理页面可见性变化
     * @private
     */
    private _handleVisibilityChange;
    /**
     * 暂停检测（页面隐藏时）
     * @private
     */
    private _pauseDetection;
    /**
     * 恢复检测（页面显示时）
     * @private
     */
    private _resumeDetection;
    /**
     * 初始化存储适配器（优先自定义 → localStorage → 内存）
     * @returns 存储接口（get/set）
     */
    private _initStorage;
    /**
     * 自动判断检测模式
     * @private
     * @returns 'etag' | 'file'
     */
    private _getCheckMode;
    /**
     * 简化的网络请求（依赖循环调用机制）
     * @private
     * @param url 请求地址
     * @param options 请求选项
     * @returns fetch 响应
     */
    private _fetchRequest;
    /**
     * ETag模式检测逻辑
     * @private
     * @returns 是否检测到更新
     */
    private _checkByEtag;
    /**
     * 版本文件模式检测逻辑
     * @private
     * @returns 是否检测到更新
     */
    private _checkByVersionFile;
    /**
     * 对比版本标识
     * @private
     * @param newVersion 最新版本标识
     * @returns 是否检测到更新
     */
    private _compareVersion;
    /**
     * 触发更新回调
     * @private
     */
    private _triggerUpdate;
    /**
     * 重新加载页面（避免缓存）
     */
    reload(): void;
    /**
     * 手动触发单次检测
     * @param isInternal 是否为内部调用
     * @returns 是否检测到更新
     */
    check(isInternal?: boolean): Promise<boolean>;
    /**
     * 启动自动轮询检测
     */
    start(): void;
    /**
     * 停止自动轮询检测
     * @param isInternal 是否为内部调用。用来区分是外部停止还是页面隐藏时停止的
     */
    stop(isInternal?: boolean): void;
    /**
     * 清理定时器
     * @private
     */
    private _clearTimer;
    /**
     * 销毁实例
     */
    destroy(): void;
}
export default VersionCheck;
