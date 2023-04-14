module.exports = (function() {
var __MODS__ = {};
var __DEFINE__ = function(modId, func, req) { var m = { exports: {}, _tempexports: {} }; __MODS__[modId] = { status: 0, func: func, req: req, m: m }; };
var __REQUIRE__ = function(modId, source) { if(!__MODS__[modId]) return require(source); if(!__MODS__[modId].status) { var m = __MODS__[modId].m; m._exports = m._tempexports; var desp = Object.getOwnPropertyDescriptor(m, "exports"); if (desp && desp.configurable) Object.defineProperty(m, "exports", { set: function (val) { if(typeof val === "object" && val !== m._exports) { m._exports.__proto__ = val.__proto__; Object.keys(val).forEach(function (k) { m._exports[k] = val[k]; }); } m._tempexports = val }, get: function () { return m._tempexports; } }); __MODS__[modId].status = 1; __MODS__[modId].func(__MODS__[modId].req, m, m.exports); } return __MODS__[modId].m.exports; };
var __REQUIRE_WILDCARD__ = function(obj) { if(obj && obj.__esModule) { return obj; } else { var newObj = {}; if(obj != null) { for(var k in obj) { if (Object.prototype.hasOwnProperty.call(obj, k)) newObj[k] = obj[k]; } } newObj.default = obj; return newObj; } };
var __REQUIRE_DEFAULT__ = function(obj) { return obj && obj.__esModule ? obj.default : obj; };
__DEFINE__(1680795427436, function(require, module, exports) {

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Subscription = exports.Centrifuge = void 0;
const centrifuge_1 = require("./centrifuge");
Object.defineProperty(exports, "Centrifuge", { enumerable: true, get: function () { return centrifuge_1.Centrifuge; } });
const subscription_1 = require("./subscription");
Object.defineProperty(exports, "Subscription", { enumerable: true, get: function () { return subscription_1.Subscription; } });
__exportStar(require("./types"), exports);
//# sourceMappingURL=index.js.map
}, function(modId) {var map = {"./centrifuge":1680795427437,"./subscription":1680795427438,"./types":1680795427440}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1680795427437, function(require, module, exports) {

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Centrifuge = void 0;
const subscription_1 = require("./subscription");
const codes_1 = require("./codes");
const transport_sockjs_1 = require("./transport_sockjs");
const transport_websocket_1 = require("./transport_websocket");
const transport_http_stream_1 = require("./transport_http_stream");
const transport_sse_1 = require("./transport_sse");
const transport_webtransport_1 = require("./transport_webtransport");
const json_1 = require("./json");
const utils_1 = require("./utils");
const types_1 = require("./types");
const events_1 = __importDefault(require("events"));
const defaults = {
    protocol: 'json',
    token: null,
    getToken: null,
    data: null,
    debug: false,
    name: 'js',
    version: '',
    fetch: null,
    readableStream: null,
    websocket: null,
    eventsource: null,
    sockjs: null,
    sockjsOptions: {},
    emulationEndpoint: '/emulation',
    minReconnectDelay: 500,
    maxReconnectDelay: 20000,
    timeout: 5000,
    maxServerPingDelay: 10000,
    networkEventTarget: null,
};
/** Centrifuge is a Centrifuge/Centrifugo bidirectional client. */
class Centrifuge extends events_1.default {
    /** Constructs Centrifuge client. Call connect() method to start connecting. */
    constructor(endpoint, options) {
        super();
        this._reconnectTimeout = null;
        this._refreshTimeout = null;
        this._serverPingTimeout = null;
        this.state = types_1.State.Disconnected;
        this._endpoint = endpoint;
        this._emulation = false;
        this._transports = [];
        this._currentTransportIndex = 0;
        this._triedAllTransports = false;
        this._transportWasOpen = false;
        this._transport = null;
        this._transportClosed = true;
        this._encoder = null;
        this._decoder = null;
        this._reconnecting = false;
        this._reconnectTimeout = null;
        this._reconnectAttempts = 0;
        this._client = null;
        this._session = '';
        this._node = '';
        this._subs = {};
        this._serverSubs = {};
        this._commandId = 0;
        this._commands = [];
        this._batching = false;
        this._refreshRequired = false;
        this._refreshTimeout = null;
        this._callbacks = {};
        this._token = undefined;
        this._dispatchPromise = Promise.resolve();
        this._serverPing = 0;
        this._serverPingTimeout = null;
        this._sendPong = false;
        this._promises = {};
        this._promiseId = 0;
        this._debugEnabled = false;
        this._config = Object.assign(Object.assign({}, defaults), options);
        this._configure();
        if (this._debugEnabled) {
            this.on('state', (ctx) => {
                this._debug('client state', ctx.oldState, '->', ctx.newState);
            });
            this.on('error', (ctx) => {
                this._debug('client error', ctx);
            });
        }
        else {
            // Avoid unhandled exception in EventEmitter for non-set error handler.
            this.on('error', function () { Function.prototype(); });
        }
    }
    /** newSubscription allocates new Subscription to a channel. Since server only allows
     * one subscription per channel per client this method throws if client already has
     * channel subscription in internal registry.
     * */
    newSubscription(channel, options) {
        if (this.getSubscription(channel) !== null) {
            throw new Error('Subscription to the channel ' + channel + ' already exists');
        }
        const sub = new subscription_1.Subscription(this, channel, options);
        this._subs[channel] = sub;
        return sub;
    }
    /** getSubscription returns Subscription if it's registered in the internal
     * registry or null. */
    getSubscription(channel) {
        return this._getSub(channel);
    }
    /** removeSubscription allows removing Subcription from the internal registry. Subscrption
     * must be in unsubscribed state. */
    removeSubscription(sub) {
        if (!sub) {
            return;
        }
        if (sub.state !== types_1.SubscriptionState.Unsubscribed) {
            sub.unsubscribe();
        }
        this._removeSubscription(sub);
    }
    /** Get a map with all current client-side subscriptions. */
    subscriptions() {
        return this._subs;
    }
    /** ready returns a Promise which resolves upon client goes to Connected
     * state and rejects in case of client goes to Disconnected or Failed state.
     * Users can provide optional timeout in milliseconds. */
    ready(timeout) {
        if (this.state === types_1.State.Disconnected) {
            return Promise.reject({ code: codes_1.errorCodes.clientDisconnected, message: 'client disconnected' });
        }
        if (this.state === types_1.State.Connected) {
            return Promise.resolve();
        }
        return new Promise((res, rej) => {
            const ctx = {
                resolve: res,
                reject: rej
            };
            if (timeout) {
                ctx.timeout = setTimeout(function () {
                    rej({ code: codes_1.errorCodes.timeout, message: 'timeout' });
                }, timeout);
            }
            this._promises[this._nextPromiseId()] = ctx;
        });
    }
    /** connect to a server. */
    connect() {
        if (this._isConnected()) {
            this._debug('connect called when already connected');
            return;
        }
        if (this._isConnecting()) {
            this._debug('connect called when already connecting');
            return;
        }
        this._reconnectAttempts = 0;
        this._startConnecting();
    }
    /** disconnect from a server. */
    disconnect() {
        this._disconnect(codes_1.disconnectedCodes.disconnectCalled, 'disconnect called', false);
    }
    /** send asynchronous data to a server (without any response from a server
     * expected, see rpc method if you need response). */
    send(data) {
        const cmd = {
            send: {
                data: data
            }
        };
        const self = this;
        return this._methodCall().then(function () {
            const sent = self._transportSendCommands([cmd]); // can send message to server without id set
            if (!sent) {
                return Promise.reject(self._createErrorObject(codes_1.errorCodes.transportWriteError, 'transport write error'));
            }
            return Promise.resolve();
        });
    }
    /** rpc to a server - i.e. a call which waits for a response with data. */
    rpc(method, data) {
        const cmd = {
            rpc: {
                method: method,
                data: data
            }
        };
        const self = this;
        return this._methodCall().then(function () {
            return self._callPromise(cmd, function (reply) {
                return {
                    'data': reply.rpc.data
                };
            });
        });
    }
    /** publish data to a channel. */
    publish(channel, data) {
        const cmd = {
            publish: {
                channel: channel,
                data: data
            }
        };
        const self = this;
        return this._methodCall().then(function () {
            return self._callPromise(cmd, function () {
                return {};
            });
        });
    }
    /** history for a channel. By default it does not return publications (only current
     *  StreamPosition data) – provide an explicit limit > 0 to load publications.*/
    history(channel, options) {
        const cmd = {
            history: this._getHistoryRequest(channel, options)
        };
        const self = this;
        return this._methodCall().then(function () {
            return self._callPromise(cmd, function (reply) {
                const result = reply.history;
                const publications = [];
                if (result.publications) {
                    for (let i = 0; i < result.publications.length; i++) {
                        publications.push(self._getPublicationContext(channel, result.publications[i]));
                    }
                }
                return {
                    'publications': publications,
                    'epoch': result.epoch || '',
                    'offset': result.offset || 0
                };
            });
        });
    }
    /** presence for a channel. */
    presence(channel) {
        const cmd = {
            presence: {
                channel: channel
            }
        };
        const self = this;
        return this._methodCall().then(function () {
            return self._callPromise(cmd, function (reply) {
                const clients = reply.presence.presence;
                for (const clientId in clients) {
                    if (clients.hasOwnProperty(clientId)) {
                        const connInfo = clients[clientId]['conn_info'];
                        const chanInfo = clients[clientId]['chan_info'];
                        if (connInfo) {
                            clients[clientId].connInfo = connInfo;
                        }
                        if (chanInfo) {
                            clients[clientId].chanInfo = chanInfo;
                        }
                    }
                }
                return {
                    'clients': clients
                };
            });
        });
    }
    /** presence stats for a channel. */
    presenceStats(channel) {
        const cmd = {
            'presence_stats': {
                channel: channel
            }
        };
        const self = this;
        return this._methodCall().then(function () {
            return self._callPromise(cmd, function (reply) {
                const result = reply.presence_stats;
                return {
                    'numUsers': result.num_users,
                    'numClients': result.num_clients
                };
            });
        });
    }
    /** start command batching (collect into temporary buffer without sending to a server)
     * until stopBatching called.*/
    startBatching() {
        // start collecting messages without sending them to Centrifuge until flush
        // method called
        this._batching = true;
    }
    /** stop batching commands and flush collected commands to the
     * network (all in one request/frame).*/
    stopBatching() {
        const self = this;
        // Why so nested? Two levels here requred to deal with promise resolving queue.
        // In Subscription case we wait 2 futures before sending data to connection.
        // Otherwise _batching becomes false before batching decision has a chance to be executed.
        Promise.resolve().then(function () {
            Promise.resolve().then(function () {
                self._batching = false;
                self._flush();
            });
        });
    }
    _debug(...args) {
        if (!this._debugEnabled) {
            return;
        }
        (0, utils_1.log)('debug', args);
    }
    /** @internal */
    _setFormat(format) {
        if (this._formatOverride(format)) {
            return;
        }
        if (format === 'protobuf') {
            throw new Error('not implemented by JSON-only Centrifuge client, use client with Protobuf support');
        }
        this._encoder = new json_1.JsonEncoder();
        this._decoder = new json_1.JsonDecoder();
    }
    /** @internal */
    _formatOverride(_format) {
        return false;
    }
    _configure() {
        if (!('Promise' in globalThis)) {
            throw new Error('Promise polyfill required');
        }
        if (!this._endpoint) {
            throw new Error('endpoint configuration required');
        }
        if (this._config.protocol !== 'json' && this._config.protocol !== 'protobuf') {
            throw new Error('unsupported protocol ' + this._config.protocol);
        }
        if (this._config.token !== null) {
            this._token = this._config.token;
        }
        this._setFormat('json');
        if (this._config.protocol === 'protobuf') {
            this._setFormat('protobuf');
        }
        if (this._config.debug === true ||
            (typeof localStorage !== 'undefined' && localStorage.getItem('centrifuge.debug'))) {
            this._debugEnabled = true;
        }
        this._debug('config', this._config);
        if (typeof this._endpoint === 'string') {
            // Single address.
        }
        else if (typeof this._endpoint === 'object' && this._endpoint instanceof Array) {
            this._transports = this._endpoint;
            this._emulation = true;
            for (const i in this._transports) {
                const transportConfig = this._transports[i];
                if (!transportConfig.endpoint || !transportConfig.transport) {
                    throw new Error('malformed transport configuration');
                }
                const transportName = transportConfig.transport;
                if (['websocket', 'http_stream', 'sse', 'sockjs', 'webtransport'].indexOf(transportName) < 0) {
                    throw new Error('unsupported transport name: ' + transportName);
                }
            }
        }
        else {
            throw new Error('unsupported url configuration type: only string or array of objects are supported');
        }
    }
    _setState(newState) {
        if (this.state !== newState) {
            this._reconnecting = false;
            const oldState = this.state;
            this.state = newState;
            this.emit('state', { newState, oldState });
            return true;
        }
        return false;
    }
    _isDisconnected() {
        return this.state === types_1.State.Disconnected;
    }
    _isConnecting() {
        return this.state === types_1.State.Connecting;
    }
    _isConnected() {
        return this.state === types_1.State.Connected;
    }
    _nextCommandId() {
        return ++this._commandId;
    }
    _setNetworkEvents() {
        let eventTarget = null;
        if (this._config.networkEventTarget !== null) {
            eventTarget = this._config.networkEventTarget;
        }
        else if (typeof globalThis.addEventListener !== 'undefined') {
            eventTarget = globalThis;
        }
        if (eventTarget) {
            eventTarget.addEventListener('offline', () => {
                this._debug('offline event triggered');
                if (this.state === types_1.State.Connected && this._transport && !this._transportClosed) {
                    this._transportClosed = true;
                    this._transport.close();
                }
            });
            eventTarget.addEventListener('online', () => {
                this._debug('online event triggered');
                if (this.state === types_1.State.Connecting) {
                    this._clearReconnectTimeout();
                    this._startReconnecting();
                }
            });
        }
    }
    _getReconnectDelay() {
        const delay = (0, utils_1.backoff)(this._reconnectAttempts, this._config.minReconnectDelay, this._config.maxReconnectDelay);
        this._reconnectAttempts += 1;
        return delay;
    }
    _clearOutgoingRequests() {
        // fire errbacks of registered outgoing calls.
        for (const id in this._callbacks) {
            if (this._callbacks.hasOwnProperty(id)) {
                const callbacks = this._callbacks[id];
                clearTimeout(callbacks.timeout);
                const errback = callbacks.errback;
                if (!errback) {
                    continue;
                }
                errback({ error: this._createErrorObject(codes_1.errorCodes.connectionClosed, 'connection closed') });
            }
        }
        this._callbacks = {};
    }
    _clearConnectedState() {
        this._client = null;
        this._clearServerPingTimeout();
        this._clearRefreshTimeout();
        // fire events for client-side subscriptions.
        for (const channel in this._subs) {
            if (!this._subs.hasOwnProperty(channel)) {
                continue;
            }
            const sub = this._subs[channel];
            if (sub.state === types_1.SubscriptionState.Subscribed) {
                // @ts-ignore – we are hiding some symbols from public API autocompletion.
                sub._setSubscribing(codes_1.subscribingCodes.transportClosed, 'transport closed');
            }
        }
        // fire events for server-side subscriptions.
        for (const channel in this._serverSubs) {
            if (this._serverSubs.hasOwnProperty(channel)) {
                this.emit('subscribing', { channel: channel });
            }
        }
    }
    _handleWriteError(commands) {
        for (const command of commands) {
            const id = command.id;
            if (!(id in this._callbacks)) {
                continue;
            }
            const callbacks = this._callbacks[id];
            clearTimeout(this._callbacks[id].timeout);
            delete this._callbacks[id];
            const errback = callbacks.errback;
            errback({ error: this._createErrorObject(codes_1.errorCodes.transportWriteError, 'transport write error') });
        }
    }
    _transportSendCommands(commands) {
        if (!commands.length) {
            return true;
        }
        if (!this._transport) {
            return false;
        }
        try {
            this._transport.send(this._encoder.encodeCommands(commands), this._session, this._node);
        }
        catch (e) {
            this._debug('error writing commands', e);
            this._handleWriteError(commands);
            return false;
        }
        return true;
    }
    _initializeTransport() {
        let websocket;
        if (this._config.websocket !== null) {
            websocket = this._config.websocket;
        }
        else {
            if (!(typeof globalThis.WebSocket !== 'function' && typeof globalThis.WebSocket !== 'object')) {
                websocket = globalThis.WebSocket;
            }
        }
        let sockjs = null;
        if (this._config.sockjs !== null) {
            sockjs = this._config.sockjs;
        }
        else {
            if (typeof globalThis.SockJS !== 'undefined') {
                sockjs = globalThis.SockJS;
            }
        }
        let eventsource = null;
        if (this._config.eventsource !== null) {
            eventsource = this._config.eventsource;
        }
        else {
            if (typeof globalThis.EventSource !== 'undefined') {
                eventsource = globalThis.EventSource;
            }
        }
        let fetchFunc = null;
        if (this._config.fetch !== null) {
            fetchFunc = this._config.fetch;
        }
        else {
            if (typeof globalThis.fetch !== 'undefined') {
                fetchFunc = globalThis.fetch;
            }
        }
        let readableStream = null;
        if (this._config.readableStream !== null) {
            readableStream = this._config.readableStream;
        }
        else {
            if (typeof globalThis.ReadableStream !== 'undefined') {
                readableStream = globalThis.ReadableStream;
            }
        }
        if (!this._emulation) {
            if ((0, utils_1.startsWith)(this._endpoint, 'http')) {
                throw new Error('Provide explicit transport endpoints configuration in case of using HTTP (i.e. using array of TransportEndpoint instead of a single string), or use ws(s):// scheme in an endpoint if you aimed using WebSocket transport');
            }
            else {
                this._debug('client will use websocket');
                this._transport = new transport_websocket_1.WebsocketTransport(this._endpoint, {
                    websocket: websocket
                });
                if (!this._transport.supported()) {
                    throw new Error('WebSocket not available');
                }
            }
        }
        else {
            if (this._currentTransportIndex >= this._transports.length) {
                this._triedAllTransports = true;
                this._currentTransportIndex = 0;
            }
            let count = 0;
            while (true) {
                if (count >= this._transports.length) {
                    throw new Error('no supported transport found');
                }
                const transportConfig = this._transports[this._currentTransportIndex];
                const transportName = transportConfig.transport;
                const transportEndpoint = transportConfig.endpoint;
                if (transportName === 'websocket') {
                    this._debug('trying websocket transport');
                    this._transport = new transport_websocket_1.WebsocketTransport(transportEndpoint, {
                        websocket: websocket
                    });
                    if (!this._transport.supported()) {
                        this._debug('websocket transport not available');
                        this._currentTransportIndex++;
                        count++;
                        continue;
                    }
                }
                else if (transportName === 'webtransport') {
                    this._debug('trying webtransport transport');
                    this._transport = new transport_webtransport_1.WebtransportTransport(transportEndpoint, {
                        webtransport: globalThis.WebTransport,
                        decoder: this._decoder,
                        encoder: this._encoder
                    });
                    if (!this._transport.supported()) {
                        this._debug('webtransport transport not available');
                        this._currentTransportIndex++;
                        count++;
                        continue;
                    }
                }
                else if (transportName === 'http_stream') {
                    this._debug('trying http_stream transport');
                    this._transport = new transport_http_stream_1.HttpStreamTransport(transportEndpoint, {
                        fetch: fetchFunc,
                        readableStream: readableStream,
                        emulationEndpoint: this._config.emulationEndpoint,
                        decoder: this._decoder,
                        encoder: this._encoder
                    });
                    if (!this._transport.supported()) {
                        this._debug('http_stream transport not available');
                        this._currentTransportIndex++;
                        count++;
                        continue;
                    }
                }
                else if (transportName === 'sse') {
                    this._debug('trying sse transport');
                    this._transport = new transport_sse_1.SseTransport(transportEndpoint, {
                        eventsource: eventsource,
                        fetch: fetchFunc,
                        emulationEndpoint: this._config.emulationEndpoint,
                    });
                    if (!this._transport.supported()) {
                        this._debug('sse transport not available');
                        this._currentTransportIndex++;
                        count++;
                        continue;
                    }
                }
                else if (transportName === 'sockjs') {
                    this._debug('trying sockjs');
                    this._transport = new transport_sockjs_1.SockjsTransport(transportEndpoint, {
                        sockjs: sockjs,
                        sockjsOptions: this._config.sockjsOptions
                    });
                    if (!this._transport.supported()) {
                        this._debug('sockjs transport not available');
                        this._currentTransportIndex++;
                        count++;
                        continue;
                    }
                }
                else {
                    throw new Error('unknown transport ' + transportName);
                }
                break;
            }
        }
        const self = this;
        let transportName;
        let wasOpen = false;
        let optimistic = true;
        if (this._transport.name() === 'sse') {
            // Avoid using optimistic subscriptions with SSE/EventSource as we are sending
            // initial data in URL params. URL is recommended to be 2048 chars max – so adding
            // subscription data may be risky.
            optimistic = false;
        }
        const initialCommands = [];
        if (this._transport.emulation()) {
            const connectCommand = self._sendConnect(true);
            initialCommands.push(connectCommand);
            if (optimistic) {
                const subscribeCommands = self._sendSubscribeCommands(true, true);
                for (const i in subscribeCommands) {
                    initialCommands.push(subscribeCommands[i]);
                }
            }
        }
        const initialData = this._encoder.encodeCommands(initialCommands);
        this._transport.initialize(this._config.protocol, {
            onOpen: function () {
                wasOpen = true;
                transportName = self._transport.subName();
                self._debug(transportName, 'transport open');
                self._transportWasOpen = true;
                self._transportClosed = false;
                if (self._transport.emulation()) {
                    return;
                }
                self.startBatching();
                self._sendConnect(false);
                if (optimistic) {
                    self._sendSubscribeCommands(true, false);
                }
                self.stopBatching();
            },
            onError: function (e) {
                self._debug('transport level error', e);
            },
            onClose: function (closeEvent) {
                self._debug(self._transport.name(), 'transport closed');
                self._transportClosed = true;
                let reason = 'connection closed';
                let needReconnect = true;
                let code = 0;
                if (closeEvent && 'code' in closeEvent && closeEvent.code) {
                    code = closeEvent.code;
                }
                if (closeEvent && closeEvent.reason) {
                    try {
                        const advice = JSON.parse(closeEvent.reason);
                        reason = advice.reason;
                        needReconnect = advice.reconnect;
                    }
                    catch (e) {
                        reason = closeEvent.reason;
                        if ((code >= 3500 && code < 4000) || (code >= 4500 && code < 5000)) {
                            needReconnect = false;
                        }
                    }
                }
                if (code < 3000) {
                    if (code === 1009) {
                        code = codes_1.disconnectedCodes.messageSizeLimit;
                        reason = 'message size limit exceeded';
                        needReconnect = false;
                    }
                    else {
                        code = codes_1.connectingCodes.transportClosed;
                        reason = 'transport closed';
                    }
                    if (self._emulation && !self._transportWasOpen) {
                        self._currentTransportIndex++;
                        if (self._currentTransportIndex >= self._transports.length) {
                            self._triedAllTransports = true;
                            self._currentTransportIndex = 0;
                        }
                    }
                }
                else {
                    // Codes >= 3000 are sent from a server application level.
                    self._transportWasOpen = true;
                }
                let isInitialHandshake = false;
                if (self._emulation && !self._transportWasOpen && !self._triedAllTransports) {
                    isInitialHandshake = true;
                }
                if (self._isConnecting() && !wasOpen) {
                    self.emit('error', {
                        type: 'transport',
                        error: {
                            code: codes_1.errorCodes.transportClosed,
                            message: 'transport closed'
                        },
                        transport: self._transport.name()
                    });
                }
                self._disconnect(code, reason, needReconnect);
                if (self._isConnecting()) {
                    let delay = self._getReconnectDelay();
                    if (isInitialHandshake) {
                        delay = 0;
                    }
                    self._debug('reconnect after ' + delay + ' milliseconds');
                    self._reconnecting = false;
                    self._reconnectTimeout = setTimeout(() => {
                        self._startReconnecting();
                    }, delay);
                }
            },
            onMessage: function (data) {
                self._dataReceived(data);
            }
        }, initialData);
    }
    _sendConnect(skipSending) {
        const connectCommand = this._constructConnectCommand();
        const self = this;
        this._call(connectCommand, skipSending).then(resolveCtx => {
            // @ts-ignore = improve later.
            const result = resolveCtx.reply.connect;
            self._connectResponse(result);
            // @ts-ignore - improve later.
            if (resolveCtx.next) {
                // @ts-ignore - improve later.
                resolveCtx.next();
            }
        }, rejectCtx => {
            self._connectError(rejectCtx.error);
            if (rejectCtx.next) {
                rejectCtx.next();
            }
        });
        return connectCommand;
    }
    _startReconnecting() {
        if (!this._isConnecting() || this._reconnecting) {
            return;
        }
        this._reconnecting = true;
        const needTokenRefresh = this._refreshRequired || (!this._token && this._config.getToken !== null);
        if (!needTokenRefresh) {
            this._initializeTransport();
            return;
        }
        const self = this;
        this._getToken().then(function (token) {
            if (!self._isConnecting()) {
                return;
            }
            if (!token) {
                self._failUnauthorized();
                return;
            }
            self._token = token;
            self._debug('connection token refreshed');
            self._initializeTransport();
        }).catch(function (e) {
            if (!self._isConnecting()) {
                return;
            }
            self.emit('error', {
                'type': 'connectToken',
                'error': {
                    code: codes_1.errorCodes.clientConnectToken,
                    message: e !== undefined ? e.toString() : ''
                }
            });
            const delay = self._getReconnectDelay();
            self._debug('error on connection token refresh, reconnect after ' + delay + ' milliseconds', e);
            self._reconnecting = false;
            self._reconnectTimeout = setTimeout(() => {
                self._startReconnecting();
            }, delay);
        });
    }
    _connectError(err) {
        if (this.state !== types_1.State.Connecting) {
            return;
        }
        if (err.code === 109) { // token expired.
            // next connect attempt will try to refresh token.
            this._refreshRequired = true;
        }
        if (err.code < 100 || err.temporary === true || err.code === 109) {
            this.emit('error', {
                'type': 'connect',
                'error': err
            });
            // Not yet connected, closing transport is enough.
            if (this._transport && !this._transportClosed) {
                this._transportClosed = true;
                this._transport.close();
            }
        }
        else {
            this._disconnect(err.code, err.message, false);
        }
    }
    _constructConnectCommand() {
        const req = {};
        if (this._token) {
            req.token = this._token;
        }
        if (this._config.data) {
            req.data = this._config.data;
        }
        if (this._config.name) {
            req.name = this._config.name;
        }
        if (this._config.version) {
            req.version = this._config.version;
        }
        const subs = {};
        let hasSubs = false;
        for (const channel in this._serverSubs) {
            if (this._serverSubs.hasOwnProperty(channel) && this._serverSubs[channel].recoverable) {
                hasSubs = true;
                const sub = {
                    'recover': true
                };
                if (this._serverSubs[channel].offset) {
                    sub['offset'] = this._serverSubs[channel].offset;
                }
                if (this._serverSubs[channel].epoch) {
                    sub['epoch'] = this._serverSubs[channel].epoch;
                }
                subs[channel] = sub;
            }
        }
        if (hasSubs) {
            req.subs = subs;
        }
        return {
            connect: req
        };
    }
    _getHistoryRequest(channel, options) {
        const req = {
            channel: channel
        };
        if (options !== undefined) {
            if (options.since) {
                req.since = {
                    offset: options.since.offset
                };
                if (options.since.epoch) {
                    req.since.epoch = options.since.epoch;
                }
            }
            if (options.limit !== undefined) {
                req.limit = options.limit;
            }
            if (options.reverse === true) {
                req.reverse = true;
            }
        }
        return req;
    }
    _methodCall() {
        if (this._isConnected()) {
            return Promise.resolve();
        }
        return new Promise((res, rej) => {
            const timeout = setTimeout(function () {
                rej({ code: codes_1.errorCodes.timeout, message: 'timeout' });
            }, this._config.timeout);
            this._promises[this._nextPromiseId()] = {
                timeout: timeout,
                resolve: res,
                reject: rej
            };
        });
    }
    _callPromise(cmd, resultCB) {
        return new Promise((resolve, reject) => {
            this._call(cmd, false).then(resolveCtx => {
                // @ts-ignore - improve later.
                resolve(resultCB(resolveCtx.reply));
                // @ts-ignore - improve later.
                if (resolveCtx.next) {
                    // @ts-ignore - improve later.
                    resolveCtx.next();
                }
            }, rejectCtx => {
                reject(rejectCtx.error);
                if (rejectCtx.next) {
                    rejectCtx.next();
                }
            });
        });
    }
    _dataReceived(data) {
        if (this._serverPing > 0) {
            this._waitServerPing();
        }
        const replies = this._decoder.decodeReplies(data);
        // We have to guarantee order of events in replies processing - i.e. start processing
        // next reply only when we finished processing of current one. Without syncing things in
        // this way we could get wrong publication events order as reply promises resolve
        // on next loop tick so for loop continues before we finished emitting all reply events.
        this._dispatchPromise = this._dispatchPromise.then(() => {
            let finishDispatch;
            this._dispatchPromise = new Promise(resolve => {
                finishDispatch = resolve;
            });
            this._dispatchSynchronized(replies, finishDispatch);
        });
    }
    _dispatchSynchronized(replies, finishDispatch) {
        let p = Promise.resolve();
        for (const i in replies) {
            if (replies.hasOwnProperty(i)) {
                p = p.then(() => {
                    return this._dispatchReply(replies[i]);
                });
            }
        }
        p = p.then(() => {
            finishDispatch();
        });
    }
    _dispatchReply(reply) {
        let next;
        const p = new Promise(resolve => {
            next = resolve;
        });
        if (reply === undefined || reply === null) {
            this._debug('dispatch: got undefined or null reply');
            next();
            return p;
        }
        const id = reply.id;
        if (id && id > 0) {
            this._handleReply(reply, next);
        }
        else {
            if (!reply.push) {
                this._handleServerPing(next);
            }
            else {
                this._handlePush(reply.push, next);
            }
        }
        return p;
    }
    _call(cmd, skipSending) {
        return new Promise((resolve, reject) => {
            cmd.id = this._nextCommandId();
            this._registerCall(cmd.id, resolve, reject);
            if (!skipSending) {
                this._addCommand(cmd);
            }
        });
    }
    _startConnecting() {
        this._debug('start connecting');
        if (this._setState(types_1.State.Connecting)) {
            this.emit('connecting', { code: codes_1.connectingCodes.connectCalled, reason: 'connect called' });
        }
        this._client = null;
        this._startReconnecting();
    }
    _disconnect(code, reason, reconnect) {
        if (this._isDisconnected()) {
            return;
        }
        const previousState = this.state;
        const ctx = {
            code: code,
            reason: reason
        };
        let needEvent = false;
        if (reconnect) {
            needEvent = this._setState(types_1.State.Connecting);
        }
        else {
            needEvent = this._setState(types_1.State.Disconnected);
            this._rejectPromises({ code: codes_1.errorCodes.clientDisconnected, message: 'disconnected' });
        }
        this._clearOutgoingRequests();
        if (previousState === types_1.State.Connecting) {
            this._clearReconnectTimeout();
        }
        if (previousState === types_1.State.Connected) {
            this._clearConnectedState();
        }
        if (needEvent) {
            if (this._isConnecting()) {
                this.emit('connecting', ctx);
            }
            else {
                this.emit('disconnected', ctx);
            }
        }
        if (this._transport && !this._transportClosed) {
            this._transportClosed = true;
            this._transport.close();
        }
    }
    _failUnauthorized() {
        this._disconnect(codes_1.disconnectedCodes.unauthorized, 'unauthorized', false);
    }
    _getToken() {
        this._debug('get connection token');
        if (!this._config.getToken) {
            throw new Error('provide a function to get connection token');
        }
        return this._config.getToken({});
    }
    _refresh() {
        const clientId = this._client;
        const self = this;
        this._getToken().then(function (token) {
            if (clientId !== self._client) {
                return;
            }
            if (!token) {
                self._failUnauthorized();
                return;
            }
            self._token = token;
            self._debug('connection token refreshed');
            if (!self._isConnected()) {
                return;
            }
            const cmd = {
                refresh: { token: self._token }
            };
            self._call(cmd, false).then(resolveCtx => {
                // @ts-ignore - improve later.
                const result = resolveCtx.reply.refresh;
                self._refreshResponse(result);
                // @ts-ignore - improve later.
                if (resolveCtx.next) {
                    // @ts-ignore - improve later.
                    resolveCtx.next();
                }
            }, rejectCtx => {
                self._refreshError(rejectCtx.error);
                if (rejectCtx.next) {
                    rejectCtx.next();
                }
            });
        }).catch(function (e) {
            self.emit('error', {
                type: 'refreshToken',
                error: {
                    code: codes_1.errorCodes.clientRefreshToken,
                    message: e !== undefined ? e.toString() : ''
                }
            });
            self._refreshTimeout = setTimeout(() => self._refresh(), self._getRefreshRetryDelay());
        });
    }
    _refreshError(err) {
        if (err.code < 100 || err.temporary === true) {
            this.emit('error', {
                type: 'refresh',
                error: err
            });
            this._refreshTimeout = setTimeout(() => this._refresh(), this._getRefreshRetryDelay());
        }
        else {
            this._disconnect(err.code, err.message, false);
        }
    }
    _getRefreshRetryDelay() {
        return (0, utils_1.backoff)(0, 5000, 10000);
    }
    _refreshResponse(result) {
        if (this._refreshTimeout) {
            clearTimeout(this._refreshTimeout);
            this._refreshTimeout = null;
        }
        if (result.expires) {
            this._client = result.client;
            this._refreshTimeout = setTimeout(() => this._refresh(), (0, utils_1.ttlMilliseconds)(result.ttl));
        }
    }
    _removeSubscription(sub) {
        if (sub === null) {
            return;
        }
        delete this._subs[sub.channel];
    }
    _unsubscribe(sub) {
        if (!this._isConnected()) {
            return;
        }
        const req = {
            channel: sub.channel
        };
        const cmd = { unsubscribe: req };
        const self = this;
        this._call(cmd, false).then(resolveCtx => {
            // @ts-ignore - improve later.
            if (resolveCtx.next) {
                // @ts-ignore - improve later.
                resolveCtx.next();
            }
        }, rejectCtx => {
            if (rejectCtx.next) {
                rejectCtx.next();
            }
            self._disconnect(codes_1.connectingCodes.unsubscribeError, 'unsubscribe error', true);
        });
    }
    _getSub(channel) {
        const sub = this._subs[channel];
        if (!sub) {
            return null;
        }
        return sub;
    }
    _isServerSub(channel) {
        return this._serverSubs[channel] !== undefined;
    }
    _sendSubscribeCommands(optimistic, skipSending) {
        const commands = [];
        for (const channel in this._subs) {
            if (!this._subs.hasOwnProperty(channel)) {
                continue;
            }
            const sub = this._subs[channel];
            // @ts-ignore – we are hiding some symbols from public API autocompletion.
            if (sub._inflight === true) {
                continue;
            }
            if (sub.state === types_1.SubscriptionState.Subscribing) {
                // @ts-ignore – we are hiding some symbols from public API autocompletion.
                const cmd = sub._subscribe(optimistic, skipSending);
                if (cmd) {
                    commands.push(cmd);
                }
            }
        }
        return commands;
    }
    _connectResponse(result) {
        this._transportWasOpen = true;
        this._reconnectAttempts = 0;
        this._refreshRequired = false;
        if (this._isConnected()) {
            return;
        }
        this._client = result.client;
        this._setState(types_1.State.Connected);
        this._setNetworkEvents();
        if (this._refreshTimeout) {
            clearTimeout(this._refreshTimeout);
        }
        if (result.expires) {
            this._refreshTimeout = setTimeout(() => this._refresh(), (0, utils_1.ttlMilliseconds)(result.ttl));
        }
        this._session = result.session;
        this._node = result.node;
        this.startBatching();
        this._sendSubscribeCommands(false, false);
        this.stopBatching();
        const ctx = {
            client: result.client,
            transport: this._transport.subName()
        };
        if (result.data) {
            ctx.data = result.data;
        }
        this.emit('connected', ctx);
        this._resolvePromises();
        this._processServerSubs(result.subs || {});
        if (result.ping && result.ping > 0) {
            this._serverPing = result.ping * 1000;
            this._sendPong = result.pong === true;
            this._waitServerPing();
        }
        else {
            this._serverPing = 0;
        }
    }
    _processServerSubs(subs) {
        for (const channel in subs) {
            if (!subs.hasOwnProperty(channel)) {
                continue;
            }
            const sub = subs[channel];
            this._serverSubs[channel] = {
                'offset': sub.offset,
                'epoch': sub.epoch,
                'recoverable': sub.recoverable || false
            };
            const subCtx = this._getSubscribeContext(channel, sub);
            this.emit('subscribed', subCtx);
        }
        for (const channel in subs) {
            if (!subs.hasOwnProperty(channel)) {
                continue;
            }
            const sub = subs[channel];
            if (sub.recovered) {
                const pubs = sub.publications;
                if (pubs && pubs.length > 0) {
                    for (const i in pubs) {
                        if (pubs.hasOwnProperty(i)) {
                            this._handlePublication(channel, pubs[i]);
                        }
                    }
                }
            }
        }
        for (const channel in this._serverSubs) {
            if (!this._serverSubs.hasOwnProperty(channel)) {
                continue;
            }
            if (!subs[channel]) {
                this.emit('unsubscribed', { channel: channel });
                delete this._serverSubs[channel];
            }
        }
    }
    _clearRefreshTimeout() {
        if (this._refreshTimeout !== null) {
            clearTimeout(this._refreshTimeout);
            this._refreshTimeout = null;
        }
    }
    _clearReconnectTimeout() {
        if (this._reconnectTimeout !== null) {
            clearTimeout(this._reconnectTimeout);
            this._reconnectTimeout = null;
        }
    }
    _clearServerPingTimeout() {
        if (this._serverPingTimeout !== null) {
            clearTimeout(this._serverPingTimeout);
            this._serverPingTimeout = null;
        }
    }
    _waitServerPing() {
        if (this._config.maxServerPingDelay === 0) {
            return;
        }
        if (!this._isConnected()) {
            return;
        }
        this._clearServerPingTimeout();
        this._serverPingTimeout = setTimeout(() => {
            if (!this._isConnected()) {
                return;
            }
            this._disconnect(codes_1.connectingCodes.noPing, 'no ping', true);
        }, this._serverPing + this._config.maxServerPingDelay);
    }
    _getSubscribeContext(channel, result) {
        const ctx = {
            channel: channel,
            positioned: false,
            recoverable: false,
            wasRecovering: false,
            recovered: false
        };
        if (result.recovered) {
            ctx.recovered = true;
        }
        if (result.positioned) {
            ctx.positioned = true;
        }
        if (result.recoverable) {
            ctx.recoverable = true;
        }
        if (result.was_recovering) {
            ctx.wasRecovering = true;
        }
        let epoch = '';
        if ('epoch' in result) {
            epoch = result.epoch;
        }
        let offset = 0;
        if ('offset' in result) {
            offset = result.offset;
        }
        if (ctx.positioned || ctx.recoverable) {
            ctx.streamPosition = {
                'offset': offset,
                'epoch': epoch
            };
        }
        if (result.data) {
            ctx.data = result.data;
        }
        return ctx;
    }
    _handleReply(reply, next) {
        const id = reply.id;
        if (!(id in this._callbacks)) {
            next();
            return;
        }
        const callbacks = this._callbacks[id];
        clearTimeout(this._callbacks[id].timeout);
        delete this._callbacks[id];
        if (!(0, utils_1.errorExists)(reply)) {
            const callback = callbacks.callback;
            if (!callback) {
                return;
            }
            callback({ reply, next });
        }
        else {
            const errback = callbacks.errback;
            if (!errback) {
                next();
                return;
            }
            const error = reply.error;
            errback({ error, next });
        }
    }
    _handleJoin(channel, join) {
        const sub = this._getSub(channel);
        if (!sub) {
            if (this._isServerSub(channel)) {
                const ctx = { channel: channel, info: this._getJoinLeaveContext(join.info) };
                this.emit('join', ctx);
            }
            return;
        }
        // @ts-ignore – we are hiding some symbols from public API autocompletion.
        sub._handleJoin(join);
    }
    _handleLeave(channel, leave) {
        const sub = this._getSub(channel);
        if (!sub) {
            if (this._isServerSub(channel)) {
                const ctx = { channel: channel, info: this._getJoinLeaveContext(leave.info) };
                this.emit('leave', ctx);
            }
            return;
        }
        // @ts-ignore – we are hiding some symbols from public API autocompletion.
        sub._handleLeave(leave);
    }
    _handleUnsubscribe(channel, unsubscribe) {
        const sub = this._getSub(channel);
        if (!sub) {
            if (this._isServerSub(channel)) {
                delete this._serverSubs[channel];
                this.emit('unsubscribed', { channel: channel });
            }
            return;
        }
        if (unsubscribe.code < 2500) {
            // @ts-ignore – we are hiding some symbols from public API autocompletion.
            sub._setUnsubscribed(unsubscribe.code, unsubscribe.reason, false);
        }
        else {
            // @ts-ignore – we are hiding some symbols from public API autocompletion.
            sub._setSubscribing(unsubscribe.code, unsubscribe.reason);
        }
    }
    _handleSubscribe(channel, sub) {
        this._serverSubs[channel] = {
            'offset': sub.offset,
            'epoch': sub.epoch,
            'recoverable': sub.recoverable || false
        };
        this.emit('subscribed', this._getSubscribeContext(channel, sub));
    }
    _handleDisconnect(disconnect) {
        const code = disconnect.code;
        let reconnect = true;
        if ((code >= 3500 && code < 4000) || (code >= 4500 && code < 5000)) {
            reconnect = false;
        }
        this._disconnect(code, disconnect.reason, reconnect);
    }
    _getPublicationContext(channel, pub) {
        const ctx = {
            channel: channel,
            data: pub.data
        };
        if (pub.offset) {
            ctx.offset = pub.offset;
        }
        if (pub.info) {
            ctx.info = this._getJoinLeaveContext(pub.info);
        }
        if (pub.tags) {
            ctx.tags = pub.tags;
        }
        return ctx;
    }
    _getJoinLeaveContext(clientInfo) {
        const info = {
            client: clientInfo.client,
            user: clientInfo.user
        };
        if (clientInfo.conn_info) {
            info.connInfo = clientInfo.conn_info;
        }
        if (clientInfo.chan_info) {
            info.chanInfo = clientInfo.chan_info;
        }
        return info;
    }
    _handlePublication(channel, pub) {
        const sub = this._getSub(channel);
        if (!sub) {
            if (this._isServerSub(channel)) {
                const ctx = this._getPublicationContext(channel, pub);
                this.emit('publication', ctx);
                if (pub.offset !== undefined) {
                    this._serverSubs[channel].offset = pub.offset;
                }
            }
            return;
        }
        // @ts-ignore – we are hiding some symbols from public API autocompletion.
        sub._handlePublication(pub);
    }
    _handleMessage(message) {
        this.emit('message', { data: message.data });
    }
    _handleServerPing(next) {
        if (this._sendPong) {
            const cmd = {};
            this._transportSendCommands([cmd]);
        }
        next();
    }
    _handlePush(data, next) {
        const channel = data.channel;
        if (data.pub) {
            this._handlePublication(channel, data.pub);
        }
        else if (data.message) {
            this._handleMessage(data.message);
        }
        else if (data.join) {
            this._handleJoin(channel, data.join);
        }
        else if (data.leave) {
            this._handleLeave(channel, data.leave);
        }
        else if (data.unsubscribe) {
            this._handleUnsubscribe(channel, data.unsubscribe);
        }
        else if (data.subscribe) {
            this._handleSubscribe(channel, data.subscribe);
        }
        else if (data.disconnect) {
            this._handleDisconnect(data.disconnect);
        }
        next();
    }
    _flush() {
        const commands = this._commands.slice(0);
        this._commands = [];
        this._transportSendCommands(commands);
    }
    _createErrorObject(code, message, temporary) {
        const errObject = {
            code: code,
            message: message
        };
        if (temporary) {
            errObject.temporary = true;
        }
        return errObject;
    }
    _registerCall(id, callback, errback) {
        this._callbacks[id] = {
            callback: callback,
            errback: errback,
            timeout: null
        };
        this._callbacks[id].timeout = setTimeout(() => {
            delete this._callbacks[id];
            if ((0, utils_1.isFunction)(errback)) {
                errback({ error: this._createErrorObject(codes_1.errorCodes.timeout, 'timeout') });
            }
        }, this._config.timeout);
    }
    _addCommand(command) {
        if (this._batching) {
            this._commands.push(command);
        }
        else {
            this._transportSendCommands([command]);
        }
    }
    _nextPromiseId() {
        return ++this._promiseId;
    }
    _resolvePromises() {
        for (const id in this._promises) {
            if (this._promises[id].timeout) {
                clearTimeout(this._promises[id].timeout);
            }
            this._promises[id].resolve();
            delete this._promises[id];
        }
    }
    _rejectPromises(err) {
        for (const id in this._promises) {
            if (this._promises[id].timeout) {
                clearTimeout(this._promises[id].timeout);
            }
            this._promises[id].reject(err);
            delete this._promises[id];
        }
    }
}
exports.Centrifuge = Centrifuge;
Centrifuge.SubscriptionState = types_1.SubscriptionState;
Centrifuge.State = types_1.State;
//# sourceMappingURL=centrifuge.js.map
}, function(modId) { var map = {"./subscription":1680795427438,"./codes":1680795427439,"./transport_sockjs":1680795427442,"./transport_websocket":1680795427443,"./transport_http_stream":1680795427444,"./transport_sse":1680795427445,"./transport_webtransport":1680795427446,"./json":1680795427447,"./utils":1680795427441,"./types":1680795427440}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1680795427438, function(require, module, exports) {

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Subscription = void 0;
const events_1 = __importDefault(require("events"));
const codes_1 = require("./codes");
const types_1 = require("./types");
const utils_1 = require("./utils");
/** Subscription to a channel */
class Subscription extends events_1.default {
    /** Subscription constructor should not be used directly, create subscriptions using Client method. */
    constructor(centrifuge, channel, options) {
        super();
        this._resubscribeTimeout = null;
        this._refreshTimeout = null;
        this.channel = channel;
        this.state = types_1.SubscriptionState.Unsubscribed;
        this._centrifuge = centrifuge;
        this._token = null;
        this._getToken = null;
        this._data = null;
        this._recover = false;
        this._offset = null;
        this._epoch = null;
        this._recoverable = false;
        this._positioned = false;
        this._joinLeave = false;
        this._minResubscribeDelay = 500;
        this._maxResubscribeDelay = 20000;
        this._resubscribeTimeout = null;
        this._resubscribeAttempts = 0;
        this._promises = {};
        this._promiseId = 0;
        this._inflight = false;
        this._refreshTimeout = null;
        this._setOptions(options);
        // @ts-ignore – we are hiding some symbols from public API autocompletion.
        if (this._centrifuge._debugEnabled) {
            this.on('state', (ctx) => {
                // @ts-ignore – we are hiding some symbols from public API autocompletion.
                this._centrifuge._debug('subscription state', channel, ctx.oldState, '->', ctx.newState);
            });
            this.on('error', (ctx) => {
                // @ts-ignore – we are hiding some symbols from public API autocompletion.
                this._centrifuge._debug('subscription error', channel, ctx);
            });
        }
        else {
            // Avoid unhandled exception in EventEmitter for non-set error handler.
            this.on('error', function () { Function.prototype(); });
        }
    }
    /** ready returns a Promise which resolves upon subscription goes to Subscribed
     * state and rejects in case of subscription goes to Unsubscribed state.
     * Optional timeout can be passed.*/
    ready(timeout) {
        if (this.state === types_1.SubscriptionState.Unsubscribed) {
            return Promise.reject({ code: codes_1.errorCodes.subscriptionUnsubscribed, message: this.state });
        }
        if (this.state === types_1.SubscriptionState.Subscribed) {
            return Promise.resolve();
        }
        return new Promise((res, rej) => {
            const ctx = {
                resolve: res,
                reject: rej
            };
            if (timeout) {
                ctx.timeout = setTimeout(function () {
                    rej({ code: codes_1.errorCodes.timeout, message: 'timeout' });
                }, timeout);
            }
            this._promises[this._nextPromiseId()] = ctx;
        });
    }
    /** subscribe to a channel.*/
    subscribe() {
        if (this._isSubscribed()) {
            return;
        }
        this._resubscribeAttempts = 0;
        this._setSubscribing(codes_1.subscribingCodes.subscribeCalled, 'subscribe called');
    }
    /** unsubscribe from a channel, keeping position state.*/
    unsubscribe() {
        this._setUnsubscribed(codes_1.unsubscribedCodes.unsubscribeCalled, 'unsubscribe called', true);
    }
    /** publish data to a channel.*/
    publish(data) {
        const self = this;
        return this._methodCall().then(function () {
            return self._centrifuge.publish(self.channel, data);
        });
    }
    /** get online presence for a channel.*/
    presence() {
        const self = this;
        return this._methodCall().then(function () {
            return self._centrifuge.presence(self.channel);
        });
    }
    /** presence stats for a channel (num clients and unique users).*/
    presenceStats() {
        const self = this;
        return this._methodCall().then(function () {
            return self._centrifuge.presenceStats(self.channel);
        });
    }
    /** history for a channel. By default it does not return publications (only current
     *  StreamPosition data) – provide an explicit limit > 0 to load publications.*/
    history(opts) {
        const self = this;
        return this._methodCall().then(function () {
            return self._centrifuge.history(self.channel, opts);
        });
    }
    _methodCall() {
        if (this._isSubscribed()) {
            return Promise.resolve();
        }
        if (this._isUnsubscribed()) {
            return Promise.reject({ code: codes_1.errorCodes.subscriptionUnsubscribed, message: this.state });
        }
        return new Promise((res, rej) => {
            const timeout = setTimeout(function () {
                rej({ code: codes_1.errorCodes.timeout, message: 'timeout' });
                // @ts-ignore – we are hiding some symbols from public API autocompletion.
            }, this._centrifuge._config.timeout);
            this._promises[this._nextPromiseId()] = {
                timeout: timeout,
                resolve: res,
                reject: rej
            };
        });
    }
    _nextPromiseId() {
        return ++this._promiseId;
    }
    _needRecover() {
        return this._recover === true;
    }
    _isUnsubscribed() {
        return this.state === types_1.SubscriptionState.Unsubscribed;
    }
    _isSubscribing() {
        return this.state === types_1.SubscriptionState.Subscribing;
    }
    _isSubscribed() {
        return this.state === types_1.SubscriptionState.Subscribed;
    }
    _setState(newState) {
        if (this.state !== newState) {
            const oldState = this.state;
            this.state = newState;
            this.emit('state', { newState, oldState, channel: this.channel });
            return true;
        }
        return false;
    }
    _usesToken() {
        return this._token !== null || this._getToken !== null;
    }
    _clearSubscribingState() {
        this._resubscribeAttempts = 0;
        this._clearResubscribeTimeout();
    }
    _clearSubscribedState() {
        this._clearRefreshTimeout();
    }
    _setSubscribed(result) {
        if (!this._isSubscribing()) {
            return;
        }
        this._clearSubscribingState();
        if (result.recoverable) {
            this._recover = true;
            this._offset = result.offset || 0;
            this._epoch = result.epoch || '';
        }
        this._setState(types_1.SubscriptionState.Subscribed);
        // @ts-ignore – we are hiding some methods from public API autocompletion.
        const ctx = this._centrifuge._getSubscribeContext(this.channel, result);
        this.emit('subscribed', ctx);
        this._resolvePromises();
        const pubs = result.publications;
        if (pubs && pubs.length > 0) {
            for (const i in pubs) {
                if (!pubs.hasOwnProperty(i)) {
                    continue;
                }
                this._handlePublication(pubs[i]);
            }
        }
        if (result.expires === true) {
            this._refreshTimeout = setTimeout(() => this._refresh(), (0, utils_1.ttlMilliseconds)(result.ttl));
        }
    }
    _setSubscribing(code, reason) {
        if (this._isSubscribing()) {
            return;
        }
        if (this._isSubscribed()) {
            this._clearSubscribedState();
        }
        if (this._setState(types_1.SubscriptionState.Subscribing)) {
            this.emit('subscribing', { channel: this.channel, code: code, reason: reason });
        }
        this._subscribe(false, false);
    }
    _subscribe(optimistic, skipSending) {
        // @ts-ignore – we are hiding some symbols from public API autocompletion.
        this._centrifuge._debug('subscribing on', this.channel);
        if (this._centrifuge.state !== types_1.State.Connected && !optimistic) {
            // @ts-ignore – we are hiding some symbols from public API autocompletion.
            this._centrifuge._debug('delay subscribe on', this.channel, 'till connected');
            // subscribe will be called later automatically.
            return null;
        }
        if (this._usesToken()) {
            // token channel, need to get token before sending subscribe.
            if (this._token) {
                return this._sendSubscribe(this._token, skipSending);
            }
            else {
                if (optimistic) {
                    return null;
                }
                const self = this;
                this._getSubscriptionToken().then(function (token) {
                    if (!self._isSubscribing()) {
                        return;
                    }
                    if (!token) {
                        self._failUnauthorized();
                        return;
                    }
                    self._token = token;
                    self._sendSubscribe(token, false);
                }).catch(function (e) {
                    if (!self._isSubscribing()) {
                        return;
                    }
                    self.emit('error', {
                        type: 'subscribeToken',
                        channel: self.channel,
                        error: {
                            code: codes_1.errorCodes.subscriptionSubscribeToken,
                            message: e !== undefined ? e.toString() : ''
                        }
                    });
                    self._scheduleResubscribe();
                });
                return null;
            }
        }
        else {
            return this._sendSubscribe('', skipSending);
        }
    }
    _sendSubscribe(token, skipSending) {
        const channel = this.channel;
        const req = {
            channel: channel
        };
        if (token) {
            req.token = token;
        }
        if (this._data) {
            req.data = this._data;
        }
        if (this._positioned) {
            req.positioned = true;
        }
        if (this._recoverable) {
            req.recoverable = true;
        }
        if (this._joinLeave) {
            req.join_leave = true;
        }
        if (this._needRecover()) {
            req.recover = true;
            const offset = this._getOffset();
            if (offset) {
                req.offset = offset;
            }
            const epoch = this._getEpoch();
            if (epoch) {
                req.epoch = epoch;
            }
        }
        const cmd = { subscribe: req };
        this._inflight = true;
        // @ts-ignore – we are hiding some symbols from public API autocompletion.
        this._centrifuge._call(cmd, skipSending).then(resolveCtx => {
            this._inflight = false;
            // @ts-ignore - improve later.
            const result = resolveCtx.reply.subscribe;
            this._handleSubscribeResponse(result);
            // @ts-ignore - improve later.
            if (resolveCtx.next) {
                // @ts-ignore - improve later.
                resolveCtx.next();
            }
        }, rejectCtx => {
            this._inflight = false;
            this._handleSubscribeError(rejectCtx.error);
            if (rejectCtx.next) {
                rejectCtx.next();
            }
        });
        return cmd;
    }
    _handleSubscribeError(error) {
        if (!this._isSubscribing()) {
            return;
        }
        if (error.code === codes_1.errorCodes.timeout) {
            // @ts-ignore – we are hiding some symbols from public API autocompletion.
            this._centrifuge._disconnect(codes_1.connectingCodes.subscribeTimeout, 'subscribe timeout', true);
            return;
        }
        this._subscribeError(error);
    }
    _handleSubscribeResponse(result) {
        if (!this._isSubscribing()) {
            return;
        }
        this._setSubscribed(result);
    }
    _setUnsubscribed(code, reason, sendUnsubscribe) {
        if (this._isUnsubscribed()) {
            return;
        }
        if (this._isSubscribed()) {
            if (sendUnsubscribe) {
                // @ts-ignore – we are hiding some methods from public API autocompletion.
                this._centrifuge._unsubscribe(this);
            }
            this._clearSubscribedState();
        }
        if (this._isSubscribing()) {
            this._clearSubscribingState();
        }
        if (this._setState(types_1.SubscriptionState.Unsubscribed)) {
            this.emit('unsubscribed', { channel: this.channel, code: code, reason: reason });
        }
        this._rejectPromises({ code: codes_1.errorCodes.subscriptionUnsubscribed, message: this.state });
    }
    _handlePublication(pub) {
        // @ts-ignore – we are hiding some methods from public API autocompletion.
        const ctx = this._centrifuge._getPublicationContext(this.channel, pub);
        this.emit('publication', ctx);
        if (pub.offset) {
            this._offset = pub.offset;
        }
    }
    _handleJoin(join) {
        // @ts-ignore – we are hiding some methods from public API autocompletion.
        const info = this._centrifuge._getJoinLeaveContext(join.info);
        this.emit('join', { channel: this.channel, info: info });
    }
    _handleLeave(leave) {
        // @ts-ignore – we are hiding some methods from public API autocompletion.
        const info = this._centrifuge._getJoinLeaveContext(leave.info);
        this.emit('leave', { channel: this.channel, info: info });
    }
    _resolvePromises() {
        for (const id in this._promises) {
            if (this._promises[id].timeout) {
                clearTimeout(this._promises[id].timeout);
            }
            this._promises[id].resolve();
            delete this._promises[id];
        }
    }
    _rejectPromises(err) {
        for (const id in this._promises) {
            if (this._promises[id].timeout) {
                clearTimeout(this._promises[id].timeout);
            }
            this._promises[id].reject(err);
            delete this._promises[id];
        }
    }
    _scheduleResubscribe() {
        const self = this;
        const delay = this._getResubscribeDelay();
        this._resubscribeTimeout = setTimeout(function () {
            if (self._isSubscribing()) {
                self._subscribe(false, false);
            }
        }, delay);
    }
    _subscribeError(err) {
        if (!this._isSubscribing()) {
            return;
        }
        if (err.code < 100 || err.code === 109 || err.temporary === true) {
            if (err.code === 109) { // Token expired error.
                this._token = null;
            }
            const errContext = {
                channel: this.channel,
                type: 'subscribe',
                error: err
            };
            if (this._centrifuge.state === types_1.State.Connected) {
                this.emit('error', errContext);
            }
            this._scheduleResubscribe();
        }
        else {
            this._setUnsubscribed(err.code, err.message, false);
        }
    }
    _getResubscribeDelay() {
        const delay = (0, utils_1.backoff)(this._resubscribeAttempts, this._minResubscribeDelay, this._maxResubscribeDelay);
        this._resubscribeAttempts++;
        return delay;
    }
    _setOptions(options) {
        if (!options) {
            return;
        }
        if (options.since) {
            this._offset = options.since.offset;
            this._epoch = options.since.epoch;
            this._recover = true;
        }
        if (options.data) {
            this._data = options.data;
        }
        if (options.minResubscribeDelay !== undefined) {
            this._minResubscribeDelay = options.minResubscribeDelay;
        }
        if (options.maxResubscribeDelay !== undefined) {
            this._maxResubscribeDelay = options.maxResubscribeDelay;
        }
        if (options.token) {
            this._token = options.token;
        }
        if (options.getToken) {
            this._getToken = options.getToken;
        }
        if (options.positioned === true) {
            this._positioned = true;
        }
        if (options.recoverable === true) {
            this._recoverable = true;
        }
        if (options.joinLeave === true) {
            this._joinLeave = true;
        }
    }
    _getOffset() {
        const offset = this._offset;
        if (offset !== null) {
            return offset;
        }
        return 0;
    }
    _getEpoch() {
        const epoch = this._epoch;
        if (epoch !== null) {
            return epoch;
        }
        return '';
    }
    _clearRefreshTimeout() {
        if (this._refreshTimeout !== null) {
            clearTimeout(this._refreshTimeout);
            this._refreshTimeout = null;
        }
    }
    _clearResubscribeTimeout() {
        if (this._resubscribeTimeout !== null) {
            clearTimeout(this._resubscribeTimeout);
            this._resubscribeTimeout = null;
        }
    }
    _getSubscriptionToken() {
        // @ts-ignore – we are hiding some methods from public API autocompletion.
        this._centrifuge._debug('get subscription token for channel', this.channel);
        const ctx = {
            channel: this.channel
        };
        const getToken = this._getToken;
        if (getToken === null) {
            throw new Error('provide a function to get channel subscription token');
        }
        return getToken(ctx);
    }
    _refresh() {
        this._clearRefreshTimeout();
        const self = this;
        this._getSubscriptionToken().then(function (token) {
            if (!self._isSubscribed()) {
                return;
            }
            if (!token) {
                self._failUnauthorized();
                return;
            }
            self._token = token;
            const req = {
                channel: self.channel,
                token: token
            };
            const msg = {
                'sub_refresh': req
            };
            // @ts-ignore – we are hiding some symbols from public API autocompletion.
            self._centrifuge._call(msg).then(resolveCtx => {
                // @ts-ignore - improve later.
                const result = resolveCtx.reply.sub_refresh;
                self._refreshResponse(result);
                // @ts-ignore - improve later.
                if (resolveCtx.next) {
                    // @ts-ignore - improve later.
                    resolveCtx.next();
                }
            }, rejectCtx => {
                self._refreshError(rejectCtx.error);
                if (rejectCtx.next) {
                    rejectCtx.next();
                }
            });
        }).catch(function (e) {
            self.emit('error', {
                type: 'refreshToken',
                channel: self.channel,
                error: {
                    code: codes_1.errorCodes.subscriptionRefreshToken,
                    message: e !== undefined ? e.toString() : ''
                }
            });
            self._refreshTimeout = setTimeout(() => self._refresh(), self._getRefreshRetryDelay());
        });
    }
    _refreshResponse(result) {
        if (!this._isSubscribed()) {
            return;
        }
        // @ts-ignore – we are hiding some methods from public API autocompletion.
        this._centrifuge._debug('subscription token refreshed, channel', this.channel);
        this._clearRefreshTimeout();
        if (result.expires === true) {
            this._refreshTimeout = setTimeout(() => this._refresh(), (0, utils_1.ttlMilliseconds)(result.ttl));
        }
    }
    _refreshError(err) {
        if (!this._isSubscribed()) {
            return;
        }
        if (err.code < 100 || err.temporary === true) {
            this.emit('error', {
                type: 'refresh',
                channel: this.channel,
                error: err
            });
            this._refreshTimeout = setTimeout(() => this._refresh(), this._getRefreshRetryDelay());
        }
        else {
            this._setUnsubscribed(err.code, err.message, true);
        }
    }
    _getRefreshRetryDelay() {
        return (0, utils_1.backoff)(0, 10000, 20000);
    }
    _failUnauthorized() {
        this._setUnsubscribed(codes_1.unsubscribedCodes.unauthorized, 'unauthorized', true);
    }
}
exports.Subscription = Subscription;
//# sourceMappingURL=subscription.js.map
}, function(modId) { var map = {"./codes":1680795427439,"./types":1680795427440,"./utils":1680795427441}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1680795427439, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.unsubscribedCodes = exports.subscribingCodes = exports.disconnectedCodes = exports.connectingCodes = exports.errorCodes = void 0;
exports.errorCodes = {
    timeout: 1,
    transportClosed: 2,
    clientDisconnected: 3,
    clientClosed: 4,
    clientConnectToken: 5,
    clientRefreshToken: 6,
    subscriptionUnsubscribed: 7,
    subscriptionSubscribeToken: 8,
    subscriptionRefreshToken: 9,
    transportWriteError: 10,
    connectionClosed: 11
};
exports.connectingCodes = {
    connectCalled: 0,
    transportClosed: 1,
    noPing: 2,
    subscribeTimeout: 3,
    unsubscribeError: 4
};
exports.disconnectedCodes = {
    disconnectCalled: 0,
    unauthorized: 1,
    badProtocol: 2,
    messageSizeLimit: 3
};
exports.subscribingCodes = {
    subscribeCalled: 0,
    transportClosed: 1
};
exports.unsubscribedCodes = {
    unsubscribeCalled: 0,
    unauthorized: 1,
    clientClosed: 2
};
//# sourceMappingURL=codes.js.map
}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1680795427440, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionState = exports.State = void 0;
/** State of client. */
var State;
(function (State) {
    State["Disconnected"] = "disconnected";
    State["Connecting"] = "connecting";
    State["Connected"] = "connected";
})(State = exports.State || (exports.State = {}));
/** State of Subscription */
var SubscriptionState;
(function (SubscriptionState) {
    SubscriptionState["Unsubscribed"] = "unsubscribed";
    SubscriptionState["Subscribing"] = "subscribing";
    SubscriptionState["Subscribed"] = "subscribed";
})(SubscriptionState = exports.SubscriptionState || (exports.SubscriptionState = {}));
//# sourceMappingURL=types.js.map
}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1680795427441, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.ttlMilliseconds = exports.errorExists = exports.backoff = exports.log = exports.isFunction = exports.startsWith = void 0;
/** @internal */
function startsWith(value, prefix) {
    return value.lastIndexOf(prefix, 0) === 0;
}
exports.startsWith = startsWith;
/** @internal */
function isFunction(value) {
    if (value === undefined || value === null) {
        return false;
    }
    return typeof value === 'function';
}
exports.isFunction = isFunction;
/** @internal */
function log(level, args) {
    if (globalThis.console) {
        const logger = globalThis.console[level];
        if (isFunction(logger)) {
            logger.apply(globalThis.console, args);
        }
    }
}
exports.log = log;
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}
/** @internal */
function backoff(step, min, max) {
    // Full jitter technique, see:
    // https://aws.amazon.com/blogs/architecture/exponential-backoff-and-jitter/
    if (step > 31) {
        step = 31;
    }
    const interval = randomInt(0, Math.min(max, min * Math.pow(2, step)));
    return Math.min(max, min + interval);
}
exports.backoff = backoff;
/** @internal */
function errorExists(data) {
    return 'error' in data && data.error !== null;
}
exports.errorExists = errorExists;
/** @internal */
function ttlMilliseconds(ttl) {
    // https://stackoverflow.com/questions/12633405/what-is-the-maximum-delay-for-setinterval
    return Math.min(ttl * 1000, 2147483647);
}
exports.ttlMilliseconds = ttlMilliseconds;
//# sourceMappingURL=utils.js.map
}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1680795427442, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.SockjsTransport = void 0;
/** @internal */
class SockjsTransport {
    constructor(endpoint, options) {
        this.endpoint = endpoint;
        this.options = options;
        this._transport = null;
    }
    name() {
        return 'sockjs';
    }
    subName() {
        return 'sockjs-' + this._transport.transport;
    }
    emulation() {
        return false;
    }
    supported() {
        return this.options.sockjs !== null;
    }
    initialize(_protocol, callbacks) {
        this._transport = new this.options.sockjs(this.endpoint, null, this.options.sockjsOptions);
        this._transport.onopen = () => {
            callbacks.onOpen();
        };
        this._transport.onerror = e => {
            callbacks.onError(e);
        };
        this._transport.onclose = closeEvent => {
            callbacks.onClose(closeEvent);
        };
        this._transport.onmessage = event => {
            callbacks.onMessage(event.data);
        };
    }
    close() {
        this._transport.close();
    }
    send(data) {
        this._transport.send(data);
    }
}
exports.SockjsTransport = SockjsTransport;
//# sourceMappingURL=transport_sockjs.js.map
}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1680795427443, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.WebsocketTransport = void 0;
/** @internal */
class WebsocketTransport {
    constructor(endpoint, options) {
        this.endpoint = endpoint;
        this.options = options;
        this._transport = null;
    }
    name() {
        return 'websocket';
    }
    subName() {
        return 'websocket';
    }
    emulation() {
        return false;
    }
    supported() {
        return this.options.websocket !== undefined && this.options.websocket !== null;
    }
    initialize(protocol, callbacks) {
        let subProtocol = '';
        if (protocol === 'protobuf') {
            subProtocol = 'centrifuge-protobuf';
        }
        if (subProtocol !== '') {
            this._transport = new this.options.websocket(this.endpoint, subProtocol);
        }
        else {
            this._transport = new this.options.websocket(this.endpoint);
        }
        if (protocol === 'protobuf') {
            this._transport.binaryType = 'arraybuffer';
        }
        this._transport.onopen = () => {
            callbacks.onOpen();
        };
        this._transport.onerror = e => {
            callbacks.onError(e);
        };
        this._transport.onclose = closeEvent => {
            callbacks.onClose(closeEvent);
        };
        this._transport.onmessage = event => {
            callbacks.onMessage(event.data);
        };
    }
    close() {
        this._transport.close();
    }
    send(data) {
        this._transport.send(data);
    }
}
exports.WebsocketTransport = WebsocketTransport;
//# sourceMappingURL=transport_websocket.js.map
}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1680795427444, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpStreamTransport = void 0;
/** @internal */
class HttpStreamTransport {
    constructor(endpoint, options) {
        this.endpoint = endpoint;
        this.options = options;
        this._abortController = null;
        this._utf8decoder = new TextDecoder();
        this._protocol = 'json';
    }
    name() {
        return 'http_stream';
    }
    subName() {
        return 'http_stream';
    }
    emulation() {
        return true;
    }
    _handleErrors(response) {
        if (!response.ok)
            throw new Error(response.status);
        return response;
    }
    _fetchEventTarget(self, endpoint, options) {
        const eventTarget = new EventTarget();
        // fetch with connection timeout maybe? https://github.com/github/fetch/issues/175
        const fetchFunc = self.options.fetch;
        fetchFunc(endpoint, options)
            .then(self._handleErrors)
            .then(response => {
            eventTarget.dispatchEvent(new Event('open'));
            let jsonStreamBuf = '';
            let jsonStreamPos = 0;
            let protoStreamBuf = new Uint8Array();
            const reader = response.body.getReader();
            return new self.options.readableStream({
                start(controller) {
                    function pump() {
                        return reader.read().then(({ done, value }) => {
                            // When no more data needs to be consumed, close the stream
                            if (done) {
                                eventTarget.dispatchEvent(new Event('close'));
                                controller.close();
                                return;
                            }
                            try {
                                if (self._protocol === 'json') {
                                    jsonStreamBuf += self._utf8decoder.decode(value);
                                    while (jsonStreamPos < jsonStreamBuf.length) {
                                        if (jsonStreamBuf[jsonStreamPos] === '\n') {
                                            const line = jsonStreamBuf.substring(0, jsonStreamPos);
                                            eventTarget.dispatchEvent(new MessageEvent('message', { data: line }));
                                            jsonStreamBuf = jsonStreamBuf.substring(jsonStreamPos + 1);
                                            jsonStreamPos = 0;
                                        }
                                        else {
                                            ++jsonStreamPos;
                                        }
                                    }
                                }
                                else {
                                    const mergedArray = new Uint8Array(protoStreamBuf.length + value.length);
                                    mergedArray.set(protoStreamBuf);
                                    mergedArray.set(value, protoStreamBuf.length);
                                    protoStreamBuf = mergedArray;
                                    while (true) {
                                        const result = self.options.decoder.decodeReply(protoStreamBuf);
                                        if (result.ok) {
                                            const data = protoStreamBuf.slice(0, result.pos);
                                            eventTarget.dispatchEvent(new MessageEvent('message', { data: data }));
                                            protoStreamBuf = protoStreamBuf.slice(result.pos);
                                            continue;
                                        }
                                        break;
                                    }
                                }
                            }
                            catch (error) {
                                // @ts-ignore - improve later.
                                eventTarget.dispatchEvent(new Event('error', { detail: error }));
                                eventTarget.dispatchEvent(new Event('close'));
                                controller.close();
                                return;
                            }
                            pump();
                        }).catch(function (e) {
                            // @ts-ignore - improve later.
                            eventTarget.dispatchEvent(new Event('error', { detail: e }));
                            eventTarget.dispatchEvent(new Event('close'));
                            controller.close();
                            return;
                        });
                    }
                    return pump();
                }
            });
        })
            .catch(error => {
            // @ts-ignore - improve later.
            eventTarget.dispatchEvent(new Event('error', { detail: error }));
            eventTarget.dispatchEvent(new Event('close'));
        });
        return eventTarget;
    }
    supported() {
        return this.options.fetch !== null &&
            this.options.readableStream !== null &&
            typeof TextDecoder !== 'undefined' &&
            typeof AbortController !== 'undefined' &&
            typeof EventTarget !== 'undefined' &&
            typeof Event !== 'undefined' &&
            typeof MessageEvent !== 'undefined' &&
            typeof Error !== 'undefined';
    }
    initialize(protocol, callbacks, initialData) {
        this._protocol = protocol;
        this._abortController = new AbortController();
        let headers;
        let body;
        if (protocol === 'json') {
            headers = {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            };
            body = initialData;
        }
        else {
            headers = {
                'Accept': 'application/octet-stream',
                'Content-Type': 'application/octet-stream'
            };
            body = initialData;
        }
        const fetchOptions = {
            method: 'POST',
            headers: headers,
            body: body,
            mode: 'cors',
            credentials: 'same-origin',
            cache: 'no-cache',
            signal: this._abortController.signal
        };
        const eventTarget = this._fetchEventTarget(this, this.endpoint, fetchOptions);
        eventTarget.addEventListener('open', () => {
            callbacks.onOpen();
        });
        eventTarget.addEventListener('error', (e) => {
            this._abortController.abort();
            callbacks.onError(e);
        });
        eventTarget.addEventListener('close', () => {
            this._abortController.abort();
            callbacks.onClose({
                code: 4,
                reason: 'connection closed'
            });
        });
        eventTarget.addEventListener('message', (e) => {
            callbacks.onMessage(e.data);
        });
    }
    close() {
        this._abortController.abort();
    }
    send(data, session, node) {
        let headers;
        let body;
        const req = {
            session: session,
            node: node,
            data: data
        };
        if (this._protocol === 'json') {
            headers = {
                'Content-Type': 'application/json'
            };
            body = JSON.stringify(req);
        }
        else {
            headers = {
                'Content-Type': 'application/octet-stream'
            };
            body = this.options.encoder.encodeEmulationRequest(req);
        }
        const fetchFunc = this.options.fetch;
        const fetchOptions = {
            method: 'POST',
            headers: headers,
            body: body,
            mode: 'cors',
            credentials: 'same-origin',
            cache: 'no-cache'
        };
        fetchFunc(this.options.emulationEndpoint, fetchOptions);
    }
}
exports.HttpStreamTransport = HttpStreamTransport;
//# sourceMappingURL=transport_http_stream.js.map
}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1680795427445, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.SseTransport = void 0;
/** @internal */
class SseTransport {
    constructor(endpoint, options) {
        this.endpoint = endpoint;
        this.options = options;
        this._protocol = 'json';
        this._transport = null;
        this._onClose = null;
    }
    name() {
        return 'sse';
    }
    subName() {
        return 'sse';
    }
    emulation() {
        return true;
    }
    supported() {
        return this.options.eventsource !== null && this.options.fetch !== null;
    }
    initialize(_protocol, callbacks, initialData) {
        let url;
        if (globalThis && globalThis.document && globalThis.document.baseURI) {
            // Handle case when endpoint is relative, like //example.com/connection/sse
            url = new URL(this.endpoint, globalThis.document.baseURI);
        }
        else {
            url = new URL(this.endpoint);
        }
        url.searchParams.append('cf_connect', initialData);
        const eventsourceOptions = {};
        const eventSource = new this.options.eventsource(url.toString(), eventsourceOptions);
        this._transport = eventSource;
        const self = this;
        eventSource.onopen = function () {
            callbacks.onOpen();
        };
        eventSource.onerror = function (e) {
            eventSource.close();
            callbacks.onError(e);
            callbacks.onClose({
                code: 4,
                reason: 'connection closed'
            });
        };
        eventSource.onmessage = function (e) {
            callbacks.onMessage(e.data);
        };
        self._onClose = function () {
            callbacks.onClose({
                code: 4,
                reason: 'connection closed'
            });
        };
    }
    close() {
        this._transport.close();
        if (this._onClose !== null) {
            this._onClose();
        }
    }
    send(data, session, node) {
        const req = {
            session: session,
            node: node,
            data: data
        };
        const headers = {
            'Content-Type': 'application/json'
        };
        const body = JSON.stringify(req);
        const fetchFunc = this.options.fetch;
        const fetchOptions = {
            method: 'POST',
            headers: headers,
            body: body,
            mode: 'cors',
            credentials: 'same-origin',
            cache: 'no-cache'
        };
        fetchFunc(this.options.emulationEndpoint, fetchOptions);
    }
}
exports.SseTransport = SseTransport;
//# sourceMappingURL=transport_sse.js.map
}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1680795427446, function(require, module, exports) {

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebtransportTransport = void 0;
/** @internal */
class WebtransportTransport {
    constructor(endpoint, options) {
        this.endpoint = endpoint;
        this.options = options;
        this._transport = null;
        this._stream = null;
        this._writer = null;
        this._utf8decoder = new TextDecoder();
        this._protocol = 'json';
    }
    name() {
        return 'webtransport';
    }
    subName() {
        return 'webtransport';
    }
    emulation() {
        return false;
    }
    supported() {
        return this.options.webtransport !== undefined && this.options.webtransport !== null;
    }
    initialize(protocol, callbacks) {
        return __awaiter(this, void 0, void 0, function* () {
            let url;
            if (globalThis && globalThis.document && globalThis.document.baseURI) {
                // Handle case when endpoint is relative, like //example.com/connection/webtransport
                url = new URL(this.endpoint, globalThis.document.baseURI);
            }
            else {
                url = new URL(this.endpoint);
            }
            if (protocol === 'protobuf') {
                url.searchParams.append('cf_protocol', 'protobuf');
            }
            this._protocol = protocol;
            const eventTarget = new EventTarget();
            this._transport = new this.options.webtransport(url.toString());
            this._transport.closed.then(() => {
                callbacks.onClose({
                    code: 4,
                    reason: 'connection closed'
                });
            }).catch(() => {
                callbacks.onClose({
                    code: 4,
                    reason: 'connection closed'
                });
            });
            try {
                yield this._transport.ready;
            }
            catch (_a) {
                this.close();
                return;
            }
            let stream;
            try {
                stream = yield this._transport.createBidirectionalStream();
            }
            catch (_b) {
                this.close();
                return;
            }
            this._stream = stream;
            this._writer = this._stream.writable.getWriter();
            eventTarget.addEventListener('close', () => {
                callbacks.onClose({
                    code: 4,
                    reason: 'connection closed'
                });
            });
            eventTarget.addEventListener('message', (e) => {
                callbacks.onMessage(e.data);
            });
            this._startReading(eventTarget);
            callbacks.onOpen();
        });
    }
    _startReading(eventTarget) {
        return __awaiter(this, void 0, void 0, function* () {
            const reader = this._stream.readable.getReader();
            let jsonStreamBuf = '';
            let jsonStreamPos = 0;
            let protoStreamBuf = new Uint8Array();
            try {
                while (true) {
                    const { done, value } = yield reader.read();
                    if (value.length > 0) {
                        if (this._protocol === 'json') {
                            jsonStreamBuf += this._utf8decoder.decode(value);
                            while (jsonStreamPos < jsonStreamBuf.length) {
                                if (jsonStreamBuf[jsonStreamPos] === '\n') {
                                    const line = jsonStreamBuf.substring(0, jsonStreamPos);
                                    eventTarget.dispatchEvent(new MessageEvent('message', { data: line }));
                                    jsonStreamBuf = jsonStreamBuf.substring(jsonStreamPos + 1);
                                    jsonStreamPos = 0;
                                }
                                else {
                                    ++jsonStreamPos;
                                }
                            }
                        }
                        else {
                            const mergedArray = new Uint8Array(protoStreamBuf.length + value.length);
                            mergedArray.set(protoStreamBuf);
                            mergedArray.set(value, protoStreamBuf.length);
                            protoStreamBuf = mergedArray;
                            while (true) {
                                const result = this.options.decoder.decodeReply(protoStreamBuf);
                                if (result.ok) {
                                    const data = protoStreamBuf.slice(0, result.pos);
                                    eventTarget.dispatchEvent(new MessageEvent('message', { data: data }));
                                    protoStreamBuf = protoStreamBuf.slice(result.pos);
                                    continue;
                                }
                                break;
                            }
                        }
                    }
                    if (done) {
                        break;
                    }
                }
            }
            catch (_a) {
                eventTarget.dispatchEvent(new Event('close'));
            }
        });
    }
    close() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (this._writer) {
                    yield this._writer.close();
                }
                this._transport.close();
            }
            catch (e) {
                // already closed.
            }
        });
    }
    send(data) {
        return __awaiter(this, void 0, void 0, function* () {
            let binary;
            if (this._protocol === 'json') {
                // Need extra \n since WT is non-frame protocol. 
                binary = new TextEncoder().encode(data + '\n');
            }
            else {
                binary = data;
            }
            try {
                yield this._writer.write(binary);
            }
            catch (e) {
                this.close();
            }
        });
    }
}
exports.WebtransportTransport = WebtransportTransport;
//# sourceMappingURL=transport_webtransport.js.map
}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1680795427447, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.JsonDecoder = exports.JsonEncoder = void 0;
/** @internal */
class JsonEncoder {
    encodeCommands(commands) {
        return commands.map(c => JSON.stringify(c)).join('\n');
    }
}
exports.JsonEncoder = JsonEncoder;
/** @internal */
class JsonDecoder {
    decodeReplies(data) {
        return data.trim().split('\n').map(r => JSON.parse(r));
    }
}
exports.JsonDecoder = JsonDecoder;
//# sourceMappingURL=json.js.map
}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
return __REQUIRE__(1680795427436);
})()
//miniprogram-npm-outsideDeps=["events"]
//# sourceMappingURL=index.js.map