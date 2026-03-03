/**
 * 通用前端版本检测工具
 * 自动判断检测模式（ETag/版本文件）| 默认自动轮询 | 保留手动检测 | 内置原生confirm提示
 * @module version-check-js
 * @version 1.1.0
 */
class VersionCheck {
  /**
   * 构造函数：初始化配置和存储（极简配置）
   * @param {Object} options 配置项
   * @param {string} [options.url='/'] 检测地址（默认/：ETag 模式；传文件路径如/version.json：版本文件模式）
   * @param {number} [options.interval=10 * 60 * 1000] 轮询间隔（毫秒），默认 10 分钟
   * @param {string} [options.message='检测到新版本，是否立即刷新？'] 更新提示文案
   * @param {Function} [options.onUpdate=null] 自定义更新回调（优先级高于默认 confirm）
   * @param {Function} [options.onError=(err)=>console.error(err)] 错误回调
   * @param {Function} [options.onLog=null] 日志回调
   * @param {Object} [options.storage=null] 自定义存储配置（get/set 方法）
   * @param {string} [options.t='t'] 重新加载时的时间戳参数名，默认't'
   */
  constructor(options = {}) {
    // 验证输入参数类型
    if (typeof options !== 'object' || options === null) {
      throw new TypeError('options 必须是对象类型');
    }

    // 定义默认配置
    this.config = {
      url: '/',
      interval: 10 * 60 * 1000,
      message: '检测到新版本，是否立即刷新？',
      onUpdate: null,
      onError: err => console.error('VersionCheck 失败：', err),
      onLog: null,
      storage: null,
      t: 't',
      ...options,
    };

    // 初始化核心状态
    this.timer = null; // 轮询定时器
    this.memoryStorage = null; // 内存存储降级
    this.storageApi = this._initStorage(); // 存储适配器
    this.versionKey = 'version_check_key'; // 存储版本标识的key
    this.checkMode = this._getCheckMode(); // 自动判断检测模式
    this.isRunning = false; // 检测状态

    this._bindVisibilityListener(); // 绑定可见性变化监听器
  }

  /**
   * 日志输出
   * @private
   * @param {string} message 日志信息
   */
  _log(message) {
    if (typeof this.config.onLog === 'function') {
      this.config.onLog(message);
    }
  }

  /**
   * 绑定页面可见性变化监听器
   * @private
   */
  _bindVisibilityListener() {
    this._unbindVisibilityListener();
    this._visibilityHandler = this._handleVisibilityChange.bind(this);
    document.addEventListener('visibilitychange', this._visibilityHandler);
  }

  /**
   * 解绑页面可见性变化监听器
   * @private
   */
  _unbindVisibilityListener() {
    if (this._visibilityHandler) {
      document.removeEventListener('visibilitychange', this._visibilityHandler);
      this._visibilityHandler = null;
    }
  }

  /**
   * 处理页面可见性变化
   * @private
   */
  _handleVisibilityChange() {
    if (!this.isRunning) return;

    if (document.hidden) {
      this._pauseDetection();
    } else {
      this._resumeDetection();
    }
  }

  /**
   * 暂停检测（页面隐藏时）
   * @private
   */
  _pauseDetection() {
    this.stop(true);
    this._log('页面隐藏，暂停VersionCheck');
  }

  /**
   * 恢复检测（页面显示时）
   * @private
   */
  _resumeDetection() {
    this.start();
    this._log('页面显示，恢复VersionCheck');
  }

  /**
   * 初始化存储适配器（优先自定义 → localStorage → 内存）
   * @private
   * @returns {Object} 存储接口（get/set）
   */
  _initStorage() {
    const defaultStorage = {
      get: key => {
        if (typeof key !== 'string') {
          this.config.onError(new Error('存储键必须是字符串'));
          return null;
        }

        try {
          if (window.localStorage) {
            return localStorage.getItem(key);
          }
        } catch (e) {
          this.config.onError(new Error(`localStorage get 失败: ${e.message}`));
        }

        return this.memoryStorage;
      },

      set: (key, value) => {
        if (typeof key !== 'string') {
          this.config.onError(new Error('存储键必须是字符串'));
          return false;
        }

        try {
          if (window.localStorage) {
            localStorage.setItem(key, String(value));
            return true;
          }
        } catch (e) {
          this.config.onError(new Error(`localStorage set 失败: ${e.message}`));
        }

        this.memoryStorage = String(value);
        return true;
      },
    };

    return this.config.storage || defaultStorage;
  }

  /**
   * 自动判断检测模式
   * @private
   * @returns {string} 'etag' | 'file'
   */
  _getCheckMode() {
    const { url } = this.config;
    const isVersionFile = url !== '/' && /\.\w+$/.test(url);
    return isVersionFile ? 'file' : 'etag';
  }

  /**
   * 简化的网络请求（依赖循环调用机制）
   * @private
   * @param {string} url 请求地址
   * @param {Object} options 请求选项
   * @returns {Promise<Response>} fetch 响应
   */
  async _fetchRequest(url, options) {
    try {
      const response = await fetch(url, options);

      // 4xx 错误记录但不重试（客户端错误）
      if (response.status >= 400 && response.status < 500) {
        this.config.onError(new Error(`客户端错误 HTTP ${response.status}: ${response.statusText}`));
        return response;
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return response;
    } catch (error) {
      this.config.onError(new Error(`网络请求失败: ${error.message}`));
      throw error;
    }
  }

  /**
   * ETag模式检测逻辑
   * @private
   * @returns {Promise<boolean>} 是否检测到更新
   */
  async _checkByEtag() {
    const { url } = this.config;

    try {
      const response = await this._fetchRequest(url, {
        method: 'HEAD',
        cache: 'no-cache',
        credentials: 'same-origin',
      });

      if (!response.ok) {
        throw new Error(`ETag 请求失败，状态码：${response.status}`);
      }

      const newVersion = response.headers.get('ETag');
      if (!newVersion) {
        throw new Error('服务器未返回 ETag，检测失败');
      }

      return this._compareVersion(newVersion);
    } catch (error) {
      this.config.onError(error);
      return false;
    }
  }

  /**
   * 版本文件模式检测逻辑
   * @private
   * @returns {Promise<boolean>} 是否检测到更新
   */
  async _checkByVersionFile() {
    const { url } = this.config;

    try {
      const response = await this._fetchRequest(url, {
        method: 'GET',
        cache: 'no-cache',
        credentials: 'same-origin',
        headers: {
          Accept: 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`版本文件请求失败，状态码：${response.status}`);
      }

      const result = await response.json();

      if (!result || typeof result !== 'object') {
        throw new Error('版本文件格式错误，必须返回对象');
      }

      if (!result.version) {
        throw new Error('版本文件格式错误，缺少 version 字段');
      }

      return this._compareVersion(result.version);
    } catch (error) {
      this.config.onError(error);
      return false;
    }
  }

  /**
   * 对比版本标识
   * @private
   * @param {string} newVersion 最新版本标识
   * @returns {boolean} 是否检测到更新
   */
  _compareVersion(newVersion) {
    const oldVersion = this.storageApi.get(this.versionKey);

    if (!oldVersion) {
      this.storageApi.set(this.versionKey, newVersion);
      return false;
    }

    if (newVersion == oldVersion) return false;

    this._triggerUpdate(newVersion);
    return true;
  }

  /**
   * 触发更新回调
   * @private
   */
  _triggerUpdate(newVersion) {
    const { onUpdate, message } = this.config;

    if (typeof onUpdate === 'function') {
      this.storageApi.set(this.versionKey, newVersion);
      onUpdate();
      return;
    }

    // 检测到更新时暂停轮询
    this.stop();
    setTimeout(() => {
      const isConfirm = window.confirm(message);
      if (isConfirm) {
        this.storageApi.set(this.versionKey, newVersion);
        this.reload();
      } else {
        this.start();
      }
    }, 0);
  }

  /**
   * 重新加载页面（避免缓存）
   */
  reload() {
    let currentUrl = window.location.href;
    const param = this.config.t;
    currentUrl = currentUrl.replace(new RegExp(`[?&]${param}=\\d+`, 'g'), '');
    const separator = currentUrl.includes('?') ? '&' : '?';
    const newUrl = `${currentUrl}${separator}${param}=${Date.now()}`;
    window.location.replace(newUrl);
  }

  /**
   * 手动触发单次检测
   * @param {boolean} isInternal 是否为内部调用
   * @returns {Promise<boolean>} 是否检测到更新
   */
  async check(isInternal = false) {
    this._log(`开始执行${isInternal ? '检测' : '手动检测'}，模式: ${this.checkMode}`);

    try {
      const hasUpdate = this.checkMode === 'etag' ? await this._checkByEtag() : await this._checkByVersionFile();
      this._log(`${isInternal ? '检测' : '手动检测'}完成，检测到更新状态: ${hasUpdate}`);
      return hasUpdate;
    } catch (error) {
      this._log(`${isInternal ? '检测' : '手动检测'}失败: ${error.message}`);
      throw error;
    }
  }

  /**
   * 启动自动轮询检测
   */
  start() {
    if (this.isRunning && this.timer) {
      this._log('VersionCheck已在运行中');
      return;
    }

    this.isRunning = true;
    this._clearTimer();

    // 启动轮询
    const poll = async () => {
      try {
        await this.check(true);
      } catch (error) {
        this.config.onError(new Error(`轮询检测失败: ${error.message}`));
      }
      if (this.isRunning && this.timer) {
        this.timer = setTimeout(poll, this.config.interval);
      }
    };
    this.timer = setTimeout(poll, this.config.interval);

    this._log('VersionCheck已启动');
  }

  /**
   * 停止自动轮询检测
   * @param {boolean} isInternal 是否为内部调用
   */
  stop(isInternal = false) {
    this._clearTimer();

    if (!isInternal) {
      this.isRunning = false;
    }
    this._log('VersionCheck已停止');
  }

  /**
   * 清理定时器
   * @private
   */
  _clearTimer() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  /**
   * 销毁实例
   */
  destroy() {
    this.stop();
    this._unbindVisibilityListener();
    this.memoryStorage = null;
    this.timer = null;
    this.storageApi = null;
    this.checkMode = null;
    this.isRunning = false;
    this._log('VersionCheck实例已销毁');
    this.config = null;
  }
}

export default VersionCheck;
