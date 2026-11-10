"use strict";
var spackle = function() {
    // src/define.ts
    var mark = function mark(fn) {
        try {
            Object.defineProperty(fn, "__polyfilled", {
                value: true
            });
        } catch (e) {}
    };
    var define = function define(owner, key, value, name) {
        try {
            Object.defineProperty(owner, key, {
                value: value,
                writable: true,
                enumerable: false,
                configurable: true
            });
            try {
                Object.defineProperty(value, "name", {
                    value: name === void 0 ? key : name,
                    configurable: true
                });
            } catch (e) {}
            mark(value);
        } catch (e) {}
    };
    var defineGetter = function defineGetter(owner, key, getter, name) {
        try {
            mark(getter);
            try {
                Object.defineProperty(getter, "name", {
                    value: name === void 0 ? "get " + key : name,
                    configurable: true
                });
            } catch (e) {}
            Object.defineProperty(owner, key, {
                configurable: true,
                enumerable: false,
                get: getter
            });
        } catch (e) {}
    };
    // src/modules/es.symbol.ts
    var isSupported = function isSupported() {
        try {
            if (typeof Symbol !== "function") {
                return false;
            }
            var testSymbol = /* @__PURE__ */ Symbol("test");
            if (typeof testSymbol !== "symbol") {
                return false;
            }
            if (typeof Symbol.iterator !== "symbol") {
                return false;
            }
            var testSymbol1 = /* @__PURE__ */ Symbol("key");
            var testSymbol2 = /* @__PURE__ */ Symbol("key");
            if (testSymbol1 === testSymbol2) {
                return false;
            }
            if (typeof Symbol.for !== "function") {
                return false;
            }
            if (/* @__PURE__ */ Symbol.for("registry") !== /* @__PURE__ */ Symbol.for("registry")) {
                return false;
            }
            return true;
        } catch (unused) {
            return false;
        }
    };
    var defineProperty = Object.defineProperty;
    var symbolCounter = 0;
    var hideSymbolKeys = function hideSymbolKeys() {
        var replace2 = function replace2(owner, key, value) {
            defineProperty(value, "__polyfilled", {
                value: true
            });
            try {
                defineProperty(value, "name", {
                    value: key,
                    configurable: true
                });
            } catch (e) {}
            owner[key] = value;
        };
        var nativeKeys2 = Object.keys;
        replace2(Object, "keys", function keys3(target) {
            var keys4 = nativeKeys2(target);
            var firstHit = -1;
            for(var i = 0; i < keys4.length; i++){
                var key = keys4[i];
                if (typeof key === "string" && key.charCodeAt(0) === 64 && key.charCodeAt(1) === 64) {
                    firstHit = i;
                    break;
                }
            }
            if (firstHit === -1) return keys4;
            var out = [];
            for(var before = 0; before < firstHit; before++)out[out.length] = keys4[before];
            for(var after = firstHit + 1; after < keys4.length; after++){
                var key1 = keys4[after];
                if (!(typeof key1 === "string" && key1.charCodeAt(0) === 64 && key1.charCodeAt(1) === 64)) out[out.length] = key1;
            }
            return out;
        });
        var nativeNames = Object.getOwnPropertyNames;
        if (typeof nativeNames === "function") {
            replace2(Object, "getOwnPropertyNames", function getOwnPropertyNames(target) {
                var keys3 = nativeNames(target);
                var firstHit = -1;
                for(var i = 0; i < keys3.length; i++){
                    var key = keys3[i];
                    if (typeof key === "string" && key.charCodeAt(0) === 64 && key.charCodeAt(1) === 64) {
                        firstHit = i;
                        break;
                    }
                }
                if (firstHit === -1) return keys3;
                var out = [];
                for(var before = 0; before < firstHit; before++)out[out.length] = keys3[before];
                for(var after = firstHit + 1; after < keys3.length; after++){
                    var key1 = keys3[after];
                    if (!(typeof key1 === "string" && key1.charCodeAt(0) === 64 && key1.charCodeAt(1) === 64)) out[out.length] = key1;
                }
                return out;
            });
        }
        var isEnumerable4 = Object.prototype.propertyIsEnumerable;
        var toObject5 = Object;
        var listDesc = {
            value: void 0,
            writable: true,
            enumerable: true,
            configurable: true
        };
        if (typeof Object.entries === "function") {
            replace2(Object, "entries", function entries4(target) {
                if (target === null || target === void 0) throw new TypeError("Cannot convert undefined or null to object");
                var object = toObject5(target);
                var names = nativeNames(object);
                var out = [];
                var count = 0;
                for(var i = 0; i < names.length; i++){
                    var key = names[i];
                    if (!(typeof key === "string" && key.charCodeAt(0) === 64 && key.charCodeAt(1) === 64) && isEnumerable4.call(object, key)) {
                        listDesc.value = [
                            key,
                            object[key]
                        ];
                        defineProperty(out, count++, listDesc);
                    }
                }
                listDesc.value = void 0;
                return out;
            });
        }
        if (typeof Object.values === "function") {
            replace2(Object, "values", function values4(target) {
                if (target === null || target === void 0) throw new TypeError("Cannot convert undefined or null to object");
                var object = toObject5(target);
                var names = nativeNames(object);
                var out = [];
                var count = 0;
                for(var i = 0; i < names.length; i++){
                    var key = names[i];
                    if (!(typeof key === "string" && key.charCodeAt(0) === 64 && key.charCodeAt(1) === 64) && isEnumerable4.call(object, key)) {
                        listDesc.value = object[key];
                        defineProperty(out, count++, listDesc);
                    }
                }
                listDesc.value = void 0;
                return out;
            });
        }
        var nativeAssign = Object.assign;
        if (typeof nativeAssign === "function") {
            var copyingAssign = function assign(target, _source) {
                if (target === null || target === void 0) {
                    throw new TypeError("Cannot convert undefined or null to object");
                }
                var to = toObject5(target);
                var stringLength = typeof target === "string" ? target.length : -1;
                for(var i = 1; i < arguments.length; i++){
                    var source = arguments[i];
                    if (source === null || source === void 0) continue;
                    var from4 = toObject5(source);
                    var keys3 = nativeNames(from4);
                    for(var k = 0; k < keys3.length; k++){
                        var key = keys3[k];
                        if (!isEnumerable4.call(from4, key)) continue;
                        if (stringLength > 0 && String(+key >>> 0) === key && +key < stringLength) {
                            throw new TypeError("Cannot assign to read only property '" + key + "' of string");
                        }
                        to[key] = from4[key];
                    }
                }
                return to;
            };
            replace2(Object, "assign", copyingAssign);
        }
        if (typeof JSON !== "undefined" && typeof JSON.stringify === "function") {
            var nativeStringify = JSON.stringify;
            replace2(JSON, "stringify", function stringify(value, replacer, space) {
                if (Object.prototype.toString.call(replacer) === "[object Array]") {
                    return nativeStringify(value, replacer, space);
                }
                return nativeStringify(value, function(key, val) {
                    if (typeof key === "string" && key.charCodeAt(0) === 64 && key.charCodeAt(1) === 64) return void 0;
                    return typeof replacer === "function" ? replacer.call(this, key, val) : val;
                }, space);
            });
        }
    };
    var symbolProto = {};
    var hasOwnProp = Object.prototype.hasOwnProperty;
    var objectIsPrototypeOf = Object.prototype.isPrototypeOf;
    var descriptionGetter = function descriptionGetter() {
        if (this === null || typeof this !== "object" || Object.getPrototypeOf(this) !== symbolProto || !hasOwnProp.call(this, "__name__")) {
            throw new TypeError("Symbol.prototype.description requires that 'this' be a Symbol");
        }
        return this.__description__;
    };
    var METHOD = {
        value: void 0,
        writable: true,
        enumerable: false,
        configurable: true
    };
    METHOD.value = function toString() {
        if (this === null || typeof this !== "object" || Object.getPrototypeOf(this) !== symbolProto || !hasOwnProp.call(this, "__name__")) {
            throw new TypeError("Symbol.prototype.toString requires that 'this' be a Symbol");
        }
        return this.__name__;
    };
    defineProperty(symbolProto, "toString", METHOD);
    METHOD.value = function valueOf() {
        if (this === null || typeof this !== "object" || Object.getPrototypeOf(this) !== symbolProto || !hasOwnProp.call(this, "__name__")) {
            throw new TypeError("Symbol.prototype.valueOf requires that 'this' be a Symbol");
        }
        return this;
    };
    defineProperty(symbolProto, "valueOf", METHOD);
    METHOD.value = void 0;
    defineProperty(symbolProto, "description", {
        configurable: true,
        enumerable: false,
        get: descriptionGetter
    });
    var SLOT = {
        value: void 0
    };
    var SymbolPolyfill = function Symbol2() {
        if (this instanceof SymbolPolyfill) {
            throw new TypeError("Symbol is not a constructor");
        }
        var description = arguments.length > 0 ? arguments[0] : void 0;
        if (description !== null && typeof description === "object" && Object.getPrototypeOf(description) === symbolProto && hasOwnProp.call(description, "__name__")) {
            throw new TypeError("Cannot convert a Symbol value to a string");
        }
        var symbol = Object.create(symbolProto);
        var desc = description === void 0 ? void 0 : String(description);
        SLOT.value = desc;
        defineProperty(symbol, "__description__", SLOT);
        SLOT.value = "@@" + (desc === void 0 ? "" : desc) + "_" + ++symbolCounter;
        defineProperty(symbol, "__name__", SLOT);
        SLOT.value = void 0;
        return symbol;
    };
    var SP = SymbolPolyfill.prototype;
    METHOD.value = function toString2() {
        if (this === null || typeof this !== "object" || Object.getPrototypeOf(this) !== symbolProto || !hasOwnProp.call(this, "__name__")) {
            throw new TypeError("Symbol.prototype.toString requires that 'this' be a Symbol");
        }
        var desc = this.__description__;
        return "Symbol(" + (desc === void 0 ? "" : desc) + ")";
    };
    defineProperty(SP, "toString", METHOD);
    METHOD.value = function valueOf2() {
        if (this === null || typeof this !== "object" || Object.getPrototypeOf(this) !== symbolProto || !hasOwnProp.call(this, "__name__")) {
            throw new TypeError("Symbol.prototype.valueOf requires that 'this' be a Symbol");
        }
        return this;
    };
    defineProperty(SP, "valueOf", METHOD);
    METHOD.value = void 0;
    try {
        defineProperty(descriptionGetter, "name", {
            value: "get description",
            configurable: true
        });
    } catch (e) {}
    defineProperty(SP, "description", {
        configurable: true,
        enumerable: false,
        get: descriptionGetter
    });
    var wellKnown = [
        "hasInstance",
        "isConcatSpreadable",
        "iterator",
        "asyncIterator",
        "match",
        "matchAll",
        "replace",
        "search",
        "species",
        "split",
        "toPrimitive",
        "toStringTag",
        "unscopables",
        "dispose",
        "asyncDispose"
    ];
    for(var i = 0; i < wellKnown.length; i++){
        defineProperty(SymbolPolyfill, wellKnown[i], {
            value: SymbolPolyfill(wellKnown[i])
        });
    }
    var symbolToPrimitive = function symbolToPrimitive(_hint) {
        if (this === null || typeof this !== "object" || Object.getPrototypeOf(this) !== symbolProto || !hasOwnProp.call(this, "__name__")) {
            throw new TypeError("Symbol.prototype[Symbol.toPrimitive] requires that 'this' be a Symbol");
        }
        return this;
    };
    try {
        defineProperty(symbolToPrimitive, "name", {
            value: "[Symbol.toPrimitive]",
            configurable: true
        });
    } catch (e) {}
    defineProperty(SP, SymbolPolyfill.toPrimitive, {
        value: symbolToPrimitive,
        writable: false,
        enumerable: false,
        configurable: true
    });
    defineProperty(SP, SymbolPolyfill.toStringTag, {
        value: "Symbol",
        writable: false,
        enumerable: false,
        configurable: true
    });
    var registry = /* @__PURE__ */ Object.create(null);
    METHOD.value = function(key) {
        if (key !== null && typeof key === "object" && Object.getPrototypeOf(key) === symbolProto && hasOwnProp.call(key, "__name__")) throw new TypeError("Cannot convert a Symbol value to a string");
        var k = String(key);
        var existing = registry[k];
        if (existing) {
            return existing;
        }
        var symbol = SymbolPolyfill(k);
        SLOT.value = k;
        defineProperty(symbol, "__registryKey__", SLOT);
        SLOT.value = void 0;
        registry[k] = symbol;
        return symbol;
    };
    try {
        defineProperty(METHOD.value, "name", {
            value: "for",
            configurable: true
        });
    } catch (e) {}
    defineProperty(SymbolPolyfill, "for", METHOD);
    METHOD.value = function keyFor(symbol) {
        if (symbol === null || typeof symbol !== "object" || Object.getPrototypeOf(symbol) !== symbolProto || !hasOwnProp.call(symbol, "__name__")) throw new TypeError(String(symbol) + " is not a symbol");
        return hasOwnProp.call(symbol, "__registryKey__") ? symbol.__registryKey__ : void 0;
    };
    defineProperty(SymbolPolyfill, "keyFor", METHOD);
    METHOD.value = void 0;
    var installSymbolPolyfill = function installSymbolPolyfill() {
        window.Symbol = null;
        delete window.Symbol;
        define(window, "Symbol", SymbolPolyfill);
    };
    var emptyDescriptions = {};
    var installSymbolExtensionsOnNative = function installSymbolExtensionsOnNative() {
        var NativeSymbol = window.Symbol;
        for(var i = 0; i < wellKnown.length; i++){
            var key = wellKnown[i];
            if (typeof NativeSymbol[key] !== "undefined") {
                continue;
            }
            try {
                defineProperty(NativeSymbol, key, {
                    value: NativeSymbol("Symbol." + key)
                });
            } catch (e) {}
        }
        var SymbolPrototype = NativeSymbol.prototype;
        var nativeValueOf = SymbolPrototype.valueOf;
        try {
            if (!hasOwnProp.call(SymbolPrototype, NativeSymbol.toPrimitive)) {
                var nativeSymbolToPrimitive = function nativeSymbolToPrimitive(_hint) {
                    return nativeValueOf.call(this);
                };
                try {
                    defineProperty(nativeSymbolToPrimitive, "name", {
                        value: "[Symbol.toPrimitive]",
                        configurable: true
                    });
                } catch (e) {}
                defineProperty(SymbolPrototype, NativeSymbol.toPrimitive, {
                    value: nativeSymbolToPrimitive,
                    writable: false,
                    enumerable: false,
                    configurable: true
                });
            }
            if (!hasOwnProp.call(SymbolPrototype, NativeSymbol.toStringTag)) {
                defineProperty(SymbolPrototype, NativeSymbol.toStringTag, {
                    value: "Symbol",
                    writable: false,
                    enumerable: false,
                    configurable: true
                });
            }
        } catch (e) {}
        try {
            if ("description" in SymbolPrototype && NativeSymbol().description === void 0) return;
        } catch (e) {
            return;
        }
        var SymbolWrapper = function Symbol3() {
            var arg = arguments[0];
            var description;
            if (arguments.length > 0 && arg !== void 0) {
                if (typeof arg === "symbol") throw new TypeError("Cannot convert a Symbol value to a string");
                description = String(arg);
            }
            if (this !== void 0 && this !== null && objectIsPrototypeOf.call(SymbolPrototype, this)) return new NativeSymbol(description);
            var result = description === void 0 ? NativeSymbol() : NativeSymbol(description);
            if (description === "") emptyDescriptions[result] = true;
            return result;
        };
        var names = Object.getOwnPropertyNames(NativeSymbol);
        for(var i1 = 0; i1 < names.length; i1++){
            if (hasOwnProp.call(SymbolWrapper, names[i1])) continue;
            try {
                defineProperty(SymbolWrapper, names[i1], Object.getOwnPropertyDescriptor(NativeSymbol, names[i1]));
            } catch (e) {}
        }
        var nativeFor = NativeSymbol["for"];
        var symbolFor = function symbolFor(key) {
            var stringKey = String(key);
            var symbol = nativeFor.call(NativeSymbol, stringKey);
            if (stringKey === "") emptyDescriptions[symbol] = true;
            return symbol;
        };
        try {
            defineProperty(symbolFor, "name", {
                value: "for",
                configurable: true
            });
        } catch (e) {}
        try {
            defineProperty(SymbolWrapper, "for", {
                value: symbolFor,
                writable: true,
                enumerable: false,
                configurable: true
            });
            SymbolWrapper.prototype = SymbolPrototype;
            defineProperty(SymbolPrototype, "constructor", {
                value: SymbolWrapper,
                writable: true,
                enumerable: false,
                configurable: true
            });
            defineProperty(window, "Symbol", {
                value: SymbolWrapper,
                writable: true,
                enumerable: false,
                configurable: true
            });
        } catch (e) {}
    };
    var install = function install() {
        if (!isSupported()) installSymbolPolyfill();
        else installSymbolExtensionsOnNative();
        installDescription();
    };
    var descriptionValueOf;
    var symbolDescription = function symbolDescription() {
        var symbol = descriptionValueOf.call(this);
        if (hasOwnProp.call(emptyDescriptions, symbol)) return "";
        var text = Symbol.prototype.toString.call(symbol);
        var description = text.slice(7, text.length - 1);
        return description === "" ? void 0 : description;
    };
    var installDescription = function installDescription() {
        try {
            if (typeof Symbol === "undefined" || (/* @__PURE__ */ Symbol("probe")).description === "probe" && (/* @__PURE__ */ Symbol()).description === void 0) {
                return;
            }
            descriptionValueOf = Symbol.prototype.valueOf;
        } catch (e) {
            return;
        }
        try {
            defineProperty(symbolDescription, "__polyfilled", {
                value: true
            });
            defineProperty(Symbol.prototype, "description", {
                configurable: true,
                enumerable: false,
                get: symbolDescription
            });
        } catch (e) {}
    };
    var applySymbolKeyFilters = function applySymbolKeyFilters() {
        try {
            var live = window.Symbol;
            if (typeof live === "function" && live.__polyfilled === true) {
                hideSymbolKeys();
            }
        } catch (e) {}
    };
    try {
        install();
    } catch (e) {}
    // src/modules/web.structured-clone.ts
    var clonesErrors = function clonesErrors(E) {
        var error = new E();
        var test = window.structuredClone({
            a: error,
            b: error
        });
        return !!test && test.a === test.b && test.a instanceof E && test.a.stack === error.stack;
    };
    var isSupported2 = function isSupported2() {
        try {
            if (typeof window.structuredClone !== "function") return false;
            var source = {
                a: 1,
                nested: {
                    b: 2
                },
                when: /* @__PURE__ */ new Date(0)
            };
            var copy = window.structuredClone(source);
            return copy !== source && copy.nested !== source.nested && copy.a === 1 && copy.nested.b === 2 && copy.when instanceof Date && copy.when.getTime() === 0 && // core-js checkErrorsCloning: errors clone, keep their stack, and a shared
            // one stays shared (Chrome < 102 returned null; old Safari can't clone errors)
            clonesErrors(Error) && (typeof window.DOMException !== "function" || clonesErrors(window.DOMException));
        } catch (unused) {
            return false;
        }
    };
    var hasOwn = Object.prototype.hasOwnProperty;
    var nativeToString = Object.prototype.toString;
    var tagKey = typeof Symbol !== "undefined" ? Symbol.toStringTag : void 0;
    var classOf = function classOf(value) {
        var tag = tagKey ? value[tagKey] : void 0;
        return typeof tag === "string" ? "[object " + tag + "]" : nativeToString.call(value);
    };
    var EngineMap = typeof Map === "function" ? Map : null;
    var ERROR_NAMES = {
        Error: true,
        EvalError: true,
        RangeError: true,
        ReferenceError: true,
        SyntaxError: true,
        TypeError: true,
        URIError: true
    };
    var STACK = {
        value: void 0,
        writable: true,
        enumerable: false,
        configurable: true
    };
    var hasOwnOrInherited = function hasOwnOrInherited(value, key) {
        try {
            return key in value;
        } catch (e) {
            return false;
        }
    };
    var makeSeenFallback = function makeSeenFallback() {
        var keys3 = [];
        var values4 = [];
        return {
            has: function has(key) {
                return keys3.indexOf(key) !== -1;
            },
            get: function get(key) {
                return values4[keys3.indexOf(key)];
            },
            set: function set(key, value) {
                keys3.push(key);
                values4.push(value);
            }
        };
    };
    var cloneError = function cloneError(message) {
        try {
            var error2 = new window.DOMException(message, "DataCloneError");
            if (error2 && error2.name === "DataCloneError") return error2;
        } catch (e) {}
        var error = new TypeError(message);
        error.name = "DataCloneError";
        return error;
    };
    var copyProperties = function copyProperties(source, target, seen) {
        for(var key in source){
            if (hasOwn.call(source, key)) {
                if (Array.isArray(source)) {
                    var index = +key;
                    if (index >= 0 && index < source.length && Math.floor(index) === index && String(index) === key) {
                        continue;
                    }
                }
                var value = cloneValue(source[key], seen);
                if (key === "__proto__" && typeof Object.defineProperty === "function") {
                    Object.defineProperty(target, key, {
                        value: value,
                        writable: true,
                        enumerable: true,
                        configurable: true
                    });
                } else {
                    target[key] = value;
                }
            }
        }
    };
    var cloneValue = function cloneValue1(value, seen) {
        if (value === null || typeof value !== "object" && typeof value !== "function") {
            if (typeof value === "symbol") throw cloneError("Cannot clone a Symbol");
            return value;
        }
        if (typeof value === "function") throw cloneError("Cannot clone a function");
        if (seen.has(value)) return seen.get(value);
        if (Array.isArray(value)) {
            var copy2 = new Array(value.length);
            seen.set(value, copy2);
            for(var i = 0; i < value.length; i++){
                if (i in value) copy2[i] = cloneValue(value[i], seen);
            }
            copyProperties(value, copy2, seen);
            return copy2;
        }
        if (classOf(value) === "[object Object]" && !(typeof Promise === "function" && value instanceof Promise)) {
            var copy21 = {};
            seen.set(value, copy21);
            copyProperties(value, copy21, seen);
            return copy21;
        }
        if (typeof Map === "function" && value instanceof Map) {
            var copy22 = /* @__PURE__ */ new Map();
            seen.set(value, copy22);
            value.forEach(function(entryValue, key) {
                copy22.set(cloneValue(key, seen), cloneValue(entryValue, seen));
            });
            return copy22;
        }
        if (typeof Set === "function" && value instanceof Set) {
            var copy23 = /* @__PURE__ */ new Set();
            seen.set(value, copy23);
            value.forEach(function(entryValue) {
                copy23.add(cloneValue(entryValue, seen));
            });
            return copy23;
        }
        if (typeof WeakMap === "function" && value instanceof WeakMap || typeof WeakSet === "function" && value instanceof WeakSet || typeof Promise === "function" && value instanceof Promise) {
            throw cloneError("Cannot clone this value");
        }
        if (value instanceof Date) {
            var copy24 = new Date(value.getTime());
            seen.set(value, copy24);
            return copy24;
        }
        if (value instanceof RegExp) {
            var flags = value.flags;
            var copy25 = new RegExp(value.source, typeof flags === "string" ? flags : (value.global ? "g" : "") + (value.ignoreCase ? "i" : "") + (value.multiline ? "m" : "") + (value.sticky ? "y" : "") + (value.unicode ? "u" : ""));
            seen.set(value, copy25);
            return copy25;
        }
        if (typeof ArrayBuffer !== "undefined" && value instanceof ArrayBuffer) {
            var bufferCopy = seen.get(value);
            if (!seen.has(value)) {
                bufferCopy = new ArrayBuffer(value.byteLength);
                seen.set(value, bufferCopy);
                var sourceBytes = new Uint8Array(value);
                var targetBytes = new Uint8Array(bufferCopy);
                for(var i1 = 0; i1 < sourceBytes.length; i1++)targetBytes[i1] = sourceBytes[i1];
            }
            return bufferCopy;
        }
        if (typeof ArrayBuffer !== "undefined" && typeof ArrayBuffer.isView === "function" && ArrayBuffer.isView(value)) {
            var buffer = seen.get(value.buffer);
            if (!seen.has(value.buffer)) {
                buffer = new ArrayBuffer(value.buffer.byteLength);
                seen.set(value.buffer, buffer);
                var sourceBytes1 = new Uint8Array(value.buffer);
                var targetBytes1 = new Uint8Array(buffer);
                for(var i2 = 0; i2 < sourceBytes1.length; i2++)targetBytes1[i2] = sourceBytes1[i2];
            }
            var copy26 = classOf(value) === "[object DataView]" ? new DataView(buffer, value.byteOffset, value.byteLength) : new value.constructor(buffer, value.byteOffset, value.length);
            seen.set(value, copy26);
            return copy26;
        }
        var DOMExceptionCtor = window.DOMException;
        var isDOMException2 = typeof DOMExceptionCtor === "function" && value instanceof DOMExceptionCtor || classOf(value) === "[object DOMException]";
        if (isDOMException2 && typeof DOMExceptionCtor === "function") {
            var copy27 = new DOMExceptionCtor(hasOwnOrInherited(value, "message") ? String(value.message) : "", String(value.name));
            seen.set(value, copy27);
            if (value.stack) {
                STACK.value = value.stack;
                Object.defineProperty(copy27, "stack", STACK);
                STACK.value = void 0;
            }
            return copy27;
        }
        if (value instanceof Error || isDOMException2) {
            var name = String(value.name);
            var ErrorCtor = ERROR_NAMES[name] === true ? window[name] : Error;
            var hasMessage = hasOwn.call(value, "message");
            var copy28 = hasMessage ? new ErrorCtor(String(value.message)) : new ErrorCtor();
            seen.set(value, copy28);
            if (value.stack) {
                STACK.value = value.stack;
                Object.defineProperty(copy28, "stack", STACK);
                STACK.value = void 0;
            }
            if (hasOwn.call(value, "cause")) {
                STACK.value = cloneValue(value.cause, seen);
                Object.defineProperty(copy28, "cause", STACK);
                STACK.value = void 0;
            }
            return copy28;
        }
        var tag = classOf(value);
        if (tag === "[object Number]" || tag === "[object String]" || tag === "[object Boolean]") {
            var copy29 = Object(value.valueOf());
            seen.set(value, copy29);
            return copy29;
        }
        if (typeof value.nodeType === "number" && typeof value.nodeName === "string" || value.window === value) {
            throw cloneError("Cannot clone a platform object");
        }
        var copy = {};
        seen.set(value, copy);
        copyProperties(value, copy, seen);
        return copy;
    };
    var structuredClone = function structuredClone(value, _options) {
        if (arguments.length === 0) throw new TypeError("Failed to execute 'structuredClone' on 'Window': 1 argument required, but only 0 present.");
        return cloneValue(value, EngineMap ? new EngineMap() : makeSeenFallback());
    };
    // src/modules/install-typed-array.ts
    var isSupported3 = function isSupported3() {
        try {
            if (typeof Uint8Array === "undefined") {
                return false;
            }
            var prototype = Uint8Array.prototype;
            var allPresent = typeof prototype.find === "function" && typeof prototype.findIndex === "function" && typeof prototype.every === "function" && typeof prototype.some === "function" && typeof prototype.forEach === "function" && typeof prototype.map === "function" && typeof prototype.filter === "function" && typeof prototype.indexOf === "function" && typeof prototype.lastIndexOf === "function" && typeof prototype.join === "function" && typeof prototype.reduce === "function" && typeof prototype.reduceRight === "function" && typeof prototype.reverse === "function" && typeof prototype.slice === "function" && typeof prototype.sort === "function" && typeof prototype.copyWithin === "function" && typeof prototype.fill === "function" && typeof prototype.keys === "function" && typeof prototype.values === "function" && typeof prototype.entries === "function" && prototype.toString !== Object.prototype.toString && prototype.toLocaleString !== Object.prototype.toLocaleString;
            if (!allPresent) {
                return false;
            }
            var sample = new Int32Array([
                1,
                2,
                3
            ]);
            var mapped = sample.map(function(v) {
                return v * 2;
            });
            if (!mapped || mapped.length !== 3 || mapped[0] !== 2 || mapped[2] !== 6) {
                return false;
            }
            var filtered = sample.filter(function(v) {
                return v > 1;
            });
            if (!filtered || filtered.length !== 2 || filtered[0] !== 2) {
                return false;
            }
            if (sample.find(function(v) {
                return v > 1;
            }) !== 2) {
                return false;
            }
            if (sample.reduce(function(a, b) {
                return a + b;
            }, 0) !== 6) {
                return false;
            }
            if (sample.slice(1).length !== 2) {
                return false;
            }
            if (sample.join("-") !== "1-2-3") {
                return false;
            }
            if (sample.indexOf(3) !== 2) {
                return false;
            }
            var iter = sample.values();
            if (!iter || typeof iter.next !== "function" || iter.next().value !== 1) {
                return false;
            }
            var seen = 0;
            sample.forEach(function() {
                seen++;
            });
            return seen === 3;
        } catch (unused) {
            return false;
        }
    };
    var objectToString = Object.prototype.toString;
    var hasOwn2 = Object.prototype.hasOwnProperty;
    var isObject = function isObject(value) {
        return value !== null && (typeof value === "object" || typeof value === "function");
    };
    var getterOf = function getterOf(owner, key) {
        try {
            var desc = owner && Object.getOwnPropertyDescriptor(owner, key);
            return desc && typeof desc.get === "function" ? desc.get : void 0;
        } catch (e) {
            return void 0;
        }
    };
    var TA_NAMES = [
        "Int8Array",
        "Uint8Array",
        "Uint8ClampedArray",
        "Int16Array",
        "Uint16Array",
        "Int32Array",
        "Uint32Array",
        "Float32Array",
        "Float64Array",
        "Float16Array"
    ];
    var globalObject = typeof window !== "undefined" ? window : typeof globalThis !== "undefined" ? globalThis : {};
    var intrinsicByName = {};
    var nameByTag = /* @__PURE__ */ Object.create(null);
    for(var i1 = 0; i1 < TA_NAMES.length; i1++){
        var C = globalObject[TA_NAMES[i1]];
        if (C !== null && (typeof C === "function" || typeof C === "object") && C.prototype) {
            intrinsicByName[TA_NAMES[i1]] = C;
            nameByTag["[object " + TA_NAMES[i1] + "]"] = TA_NAMES[i1];
        }
    }
    var typedArrayProto = typeof Int8Array !== "undefined" && Object.getPrototypeOf(Int8Array.prototype) !== Object.prototype ? Object.getPrototypeOf(Int8Array.prototype) : void 0;
    var tagKey2 = typeof Symbol !== "undefined" ? Symbol.toStringTag : void 0;
    var nativeTagGetter = typedArrayProto && tagKey2 ? getterOf(typedArrayProto, tagKey2) : void 0;
    var nativeLengthGetter = typedArrayProto ? getterOf(typedArrayProto, "length") : void 0;
    var nativeBufferGetter = typedArrayProto ? getterOf(typedArrayProto, "buffer") : void 0;
    var detachedGetter = typeof ArrayBuffer !== "undefined" ? getterOf(ArrayBuffer.prototype, "detached") : void 0;
    var sharedTypedArray = typedArrayProto ? Object.getPrototypeOf(Int8Array) : void 0;
    var unparented = [];
    var synthesiseTypedArray = function synthesiseTypedArray() {
        if (sharedTypedArray || typeof Int8Array === "undefined") return;
        var TypedArray = function TypedArray2() {
            throw new TypeError("Abstract class TypedArray not directly constructable");
        };
        try {
            Object.defineProperty(TypedArray, "name", {
                value: "TypedArray",
                configurable: true
            });
        } catch (e) {}
        var proto2 = TypedArray.prototype;
        var adopted = 0;
        for(var i = 0; i < TA_NAMES.length - 1; i++){
            var C = intrinsicByName[TA_NAMES[i]];
            if (!C) continue;
            try {
                C.prototype.__proto__ = proto2;
                C.__proto__ = TypedArray;
            } catch (e) {}
            if (Object.getPrototypeOf(C.prototype) === proto2 && Object.getPrototypeOf(C) === TypedArray) adopted++;
            else unparented.push(C);
        }
        if (adopted) sharedTypedArray = TypedArray;
    };
    var clearOwn = function clearOwn(name, value) {
        for(var i = 0; i < TA_NAMES.length - 1; i++){
            var C = intrinsicByName[TA_NAMES[i]];
            if (!C || !hasOwn2.call(C.prototype, name)) continue;
            try {
                delete C.prototype[name];
            } catch (e) {
                try {
                    C.prototype[name] = value;
                } catch (e2) {}
            }
        }
    };
    var typedArrayName = function typedArrayName(O) {
        if (!isObject(O)) return void 0;
        if (nativeTagGetter) return nativeTagGetter.call(O);
        return nameByTag[objectToString.call(O)];
    };
    var lengthOf = function lengthOf(O) {
        return nativeLengthGetter ? nativeLengthGetter.call(O) : O.length;
    };
    var isDetached = function isDetached(O) {
        return !!(detachedGetter && detachedGetter.call(nativeBufferGetter ? nativeBufferGetter.call(O) : O.buffer));
    };
    var validate = function validate(O, method) {
        var name = O === null || typeof O !== "object" && typeof O !== "function" ? void 0 : nativeTagGetter ? nativeTagGetter.call(O) : nameByTag[objectToString.call(O)];
        if (name === void 0) {
            throw new TypeError("%TypedArray%.prototype." + method + ": this is not a typed array");
        }
        if (detachedGetter && detachedGetter.call(nativeBufferGetter ? nativeBufferGetter.call(O) : O.buffer)) {
            throw new TypeError("%TypedArray%.prototype." + method + ": the buffer is detached");
        }
        return nativeLengthGetter ? nativeLengthGetter.call(O) : O.length;
    };
    var relativeIndex = function relativeIndex(value, len) {
        var rel = +value;
        rel = rel !== rel ? 0 : rel === Infinity || rel === -Infinity ? rel : rel < 0 ? Math.ceil(rel) : Math.floor(rel);
        return rel < 0 ? Math.max(len + rel, 0) : Math.min(rel, len);
    };
    var isConstructor = function isConstructor(C) {
        return typeof C === "function" && (hasOwn2.call(C, "prototype") || /^bound /.test(C.name || "")) || typeof C === "object" && C !== null && isIntrinsicObject(C);
    };
    function isIntrinsicObject(C) {
        for(var i = 0; i < TA_NAMES.length; i++)if (intrinsicByName[TA_NAMES[i]] === C) return true;
        return false;
    }
    var createFromConstructor = function createFromConstructor(C, length) {
        var created = new C(length);
        if (typedArrayName(created) === void 0) throw new TypeError("the constructor did not make a typed array");
        if (isDetached(created)) throw new TypeError("the constructed typed array is detached");
        if (lengthOf(created) < length) throw new TypeError("the constructed typed array is too short");
        return created;
    };
    var speciesCreate = function speciesCreate(O, length) {
        var defaultCtor = intrinsicByName[typedArrayName(O)];
        var C = O.constructor;
        if (C === void 0) {
            C = defaultCtor;
        } else {
            if (!isObject(C)) throw new TypeError("the typed array constructor is not an object");
            var S = typeof Symbol !== "undefined" && Symbol.species ? C[Symbol.species] : void 0;
            if (S === void 0 || S === null) C = defaultCtor;
            else if (isConstructor(S)) C = S;
            else throw new TypeError("the typed array @@species is not a constructor");
        }
        return createFromConstructor(C, length);
    };
    var createSameType = function createSameType(O, length) {
        return new intrinsicByName[typedArrayName(O)](length);
    };
    var defaultSortCompare = function defaultSortCompare(x, y) {
        if (x !== x) return y !== y ? 0 : 1;
        if (y !== y) return -1;
        if (x < y) return -1;
        if (x > y) return 1;
        if (x === 0 && y === 0) {
            if (1 / x < 0 && 1 / y > 0) return -1;
            if (1 / x > 0 && 1 / y < 0) return 1;
        }
        return 0;
    };
    var activeCompareFn;
    var userCompare = function userCompare(a, b) {
        var v = +activeCompareFn(a, b);
        return v === v ? v : 0;
    };
    var sortList = function sortList(items, length, compare) {
        if (length < 2) return items;
        var source = items;
        var target = /* @__PURE__ */ Object.create(null);
        for(var width = 1; width < length; width *= 2){
            for(var start = 0; start < length; start += width * 2){
                var left = start;
                var middle = start + width < length ? start + width : length;
                var right = middle;
                var end = start + width * 2 < length ? start + width * 2 : length;
                var out = start;
                while(left < middle && right < end){
                    if (compare(source[left], source[right]) <= 0) target[out++] = source[left++];
                    else target[out++] = source[right++];
                }
                while(left < middle)target[out++] = source[left++];
                while(right < end)target[out++] = source[right++];
            }
            var swap = source;
            source = target;
            target = swap;
        }
        return source;
    };
    var sortedList = function sortedList(O, len, comparefn) {
        var items = /* @__PURE__ */ Object.create(null);
        for(var i = 0; i < len; i++)items[i] = O[i];
        if (comparefn === void 0) return sortList(items, len, defaultSortCompare);
        var saved = activeCompareFn;
        activeCompareFn = comparefn;
        try {
            items = sortList(items, len, userCompare);
        } catch (error) {
            activeCompareFn = saved;
            throw error;
        }
        activeCompareFn = saved;
        return items;
    };
    var typedArrayFind = function find(callbackfn) {
        var len = validate(this, "find");
        if (typeof callbackfn !== "function") throw new TypeError("callback is not a function");
        var thisArg = arguments.length > 1 ? arguments[1] : void 0;
        for(var k = 0; k < len; k++){
            var kValue = this[k];
            if (callbackfn.call(thisArg, kValue, k, this)) return kValue;
        }
        return void 0;
    };
    var typedArrayFindIndex = function findIndex(callbackfn) {
        var len = validate(this, "findIndex");
        if (typeof callbackfn !== "function") throw new TypeError("callback is not a function");
        var thisArg = arguments.length > 1 ? arguments[1] : void 0;
        for(var k = 0; k < len; k++){
            if (callbackfn.call(thisArg, this[k], k, this)) return k;
        }
        return -1;
    };
    var typedArrayIncludes = function includes(searchElement) {
        var len = validate(this, "includes");
        if (len === 0) return false;
        var n = +(arguments.length > 1 ? arguments[1] : void 0);
        n = n !== n ? 0 : n === Infinity || n === -Infinity ? n : n < 0 ? Math.ceil(n) : Math.floor(n);
        if (n === Infinity) return false;
        if (n === -Infinity) n = 0;
        for(var k = n >= 0 ? n : Math.max(len + n, 0); k < len; k++){
            var el = this[k];
            if (el === searchElement || el !== el && searchElement !== searchElement) return true;
        }
        return false;
    };
    var typedArrayAt = function at(index) {
        var len = validate(this, "at");
        var rel = +index;
        rel = rel !== rel ? 0 : rel === Infinity || rel === -Infinity ? rel : rel < 0 ? Math.ceil(rel) : Math.floor(rel);
        var k = rel >= 0 ? rel : len + rel;
        if (k < 0 || k >= len) return void 0;
        return this[k];
    };
    var typedArrayEvery = function every(callbackfn) {
        var len = validate(this, "every");
        if (typeof callbackfn !== "function") throw new TypeError("callback is not a function");
        var thisArg = arguments.length > 1 ? arguments[1] : void 0;
        for(var k = 0; k < len; k++){
            if (!callbackfn.call(thisArg, this[k], k, this)) return false;
        }
        return true;
    };
    var typedArraySome = function some(callbackfn) {
        var len = validate(this, "some");
        if (typeof callbackfn !== "function") throw new TypeError("callback is not a function");
        var thisArg = arguments.length > 1 ? arguments[1] : void 0;
        for(var k = 0; k < len; k++){
            if (callbackfn.call(thisArg, this[k], k, this)) return true;
        }
        return false;
    };
    var typedArrayForEach = function forEach(callbackfn) {
        var len = validate(this, "forEach");
        if (typeof callbackfn !== "function") throw new TypeError("callback is not a function");
        var thisArg = arguments.length > 1 ? arguments[1] : void 0;
        for(var k = 0; k < len; k++)callbackfn.call(thisArg, this[k], k, this);
        return void 0;
    };
    var typedArrayMap = function map(callbackfn) {
        var len = validate(this, "map");
        if (typeof callbackfn !== "function") throw new TypeError("callback is not a function");
        var thisArg = arguments.length > 1 ? arguments[1] : void 0;
        var A = speciesCreate(this, len);
        for(var k = 0; k < len; k++){
            A[k] = callbackfn.call(thisArg, this[k], k, this);
        }
        return A;
    };
    var typedArrayFilter = function filter(callbackfn) {
        var len = validate(this, "filter");
        if (typeof callbackfn !== "function") throw new TypeError("callback is not a function");
        var thisArg = arguments.length > 1 ? arguments[1] : void 0;
        var kept = /* @__PURE__ */ Object.create(null);
        var captured = 0;
        for(var k = 0; k < len; k++){
            var kValue = this[k];
            if (callbackfn.call(thisArg, kValue, k, this)) kept[captured++] = kValue;
        }
        var A = speciesCreate(this, captured);
        for(var n = 0; n < captured; n++)A[n] = kept[n];
        return A;
    };
    var typedArrayIndexOf = function indexOf(searchElement) {
        var len = validate(this, "indexOf");
        if (len === 0) return -1;
        var n = +(arguments.length > 1 ? arguments[1] : void 0);
        n = n !== n ? 0 : n === Infinity || n === -Infinity ? n : n < 0 ? Math.ceil(n) : Math.floor(n);
        if (n === Infinity) return -1;
        if (n === -Infinity) n = 0;
        for(var k = n >= 0 ? n : Math.max(len + n, 0); k < len; k++){
            if (k in this && this[k] === searchElement) return k + 0;
        }
        return -1;
    };
    var typedArrayLastIndexOf = function lastIndexOf(searchElement) {
        var len = validate(this, "lastIndexOf");
        if (len === 0) return -1;
        var n = len - 1;
        if (arguments.length > 1) {
            n = +arguments[1];
            n = n !== n ? 0 : n === Infinity || n === -Infinity ? n : n < 0 ? Math.ceil(n) : Math.floor(n);
        }
        if (n === -Infinity) return -1;
        for(var k = n >= 0 ? Math.min(n, len - 1) : len + n; k >= 0; k--){
            if (k in this && this[k] === searchElement) return k + 0;
        }
        return -1;
    };
    var typedArrayJoin = function join(separator) {
        var len = validate(this, "join");
        if (typeof separator === "symbol") throw new TypeError("Cannot convert a Symbol value to a string");
        var sep = separator === void 0 ? "," : typeof separator === "string" ? separator : String(separator);
        var out = "";
        for(var k = 0; k < len; k++){
            if (k > 0) out += sep;
            var element = this[k];
            if (element !== void 0) {
                if (typeof element === "symbol") throw new TypeError("Cannot convert a Symbol value to a string");
                out += typeof element === "string" ? element : String(element);
            }
        }
        return out;
    };
    var typedArrayToLocaleString = function toLocaleString() {
        var len = validate(this, "toLocaleString");
        var out = "";
        for(var k = 0; k < len; k++){
            if (k > 0) out += ",";
            var element = this[k];
            if (element !== void 0 && element !== null) {
                var local = element.toLocaleString();
                if (typeof local === "symbol") throw new TypeError("Cannot convert a Symbol value to a string");
                out += typeof local === "string" ? local : String(local);
            }
        }
        return out;
    };
    var typedArrayReduce = function reduce(callbackfn) {
        var len = validate(this, "reduce");
        if (typeof callbackfn !== "function") throw new TypeError("callback is not a function");
        var k = 0;
        var accumulator;
        if (arguments.length > 1) {
            accumulator = arguments[1];
        } else {
            if (len === 0) throw new TypeError("Reduce of empty array with no initial value");
            accumulator = this[0];
            k = 1;
        }
        for(; k < len; k++)accumulator = callbackfn(accumulator, this[k], k, this);
        return accumulator;
    };
    var typedArrayReduceRight = function reduceRight(callbackfn) {
        var len = validate(this, "reduceRight");
        if (typeof callbackfn !== "function") throw new TypeError("callback is not a function");
        var k = len - 1;
        var accumulator;
        if (arguments.length > 1) {
            accumulator = arguments[1];
        } else {
            if (len === 0) throw new TypeError("Reduce of empty array with no initial value");
            accumulator = this[k];
            k--;
        }
        for(; k >= 0; k--)accumulator = callbackfn(accumulator, this[k], k, this);
        return accumulator;
    };
    var typedArrayReverse = function reverse() {
        var len = validate(this, "reverse");
        for(var lower = 0, upper = len - 1; lower < upper; lower++, upper--){
            var tmp = this[lower];
            this[lower] = this[upper];
            this[upper] = tmp;
        }
        return this;
    };
    var typedArraySlice = function slice(start, end) {
        var len = validate(this, "slice");
        var from4 = relativeIndex(start, len);
        var to = end === void 0 ? len : relativeIndex(end, len);
        var count = Math.max(to - from4, 0);
        var A = speciesCreate(this, count);
        if (count > 0) {
            if (isDetached(this)) throw new TypeError("%TypedArray%.prototype.slice: the buffer was detached");
            var finalIndex = Math.min(to, lengthOf(this));
            for(var k = from4, n = 0; k < finalIndex; k++, n++)A[n] = this[k];
        }
        return A;
    };
    var typedArraySort = function sort(comparefn) {
        if (comparefn !== void 0 && typeof comparefn !== "function") {
            throw new TypeError("The comparison function must be either a function or undefined");
        }
        var len = validate(this, "sort");
        var items = sortedList(this, len, comparefn);
        for(var k = 0; k < len; k++)this[k] = items[k];
        return this;
    };
    var typedArrayCopyWithin = function copyWithin(target, start) {
        var len = validate(this, "copyWithin");
        var to = relativeIndex(target, len);
        var from4 = relativeIndex(start, len);
        var end = arguments.length > 2 ? arguments[2] : void 0;
        var final = end === void 0 ? len : relativeIndex(end, len);
        var count = Math.min(final - from4, len - to);
        if (count > 0) {
            if (isDetached(this)) throw new TypeError("%TypedArray%.prototype.copyWithin: the buffer was detached");
            count = Math.min(count, lengthOf(this) - from4, lengthOf(this) - to);
            if (from4 < to && to < from4 + count) {
                for(var i = count - 1; i >= 0; i--)this[to + i] = this[from4 + i];
            } else {
                for(var i1 = 0; i1 < count; i1++)this[to + i1] = this[from4 + i1];
            }
        }
        return this;
    };
    var typedArrayFill = function fill(value) {
        var len = validate(this, "fill");
        var numericValue = +value;
        var start = arguments.length > 1 ? arguments[1] : void 0;
        var end = arguments.length > 2 ? arguments[2] : void 0;
        var k = relativeIndex(start, len);
        var final = end === void 0 ? len : relativeIndex(end, len);
        if (isDetached(this)) throw new TypeError("%TypedArray%.prototype.fill: the buffer was detached");
        var stop = Math.min(final, lengthOf(this));
        for(var i = k; i < stop; i++)this[i] = numericValue;
        return this;
    };
    var arrayIteratorMethod = function arrayIteratorMethod(name) {
        var fn = Array.prototype[name];
        return typeof fn === "function" ? fn : void 0;
    };
    var returnSelfIterator = function returnSelfIterator() {
        return this;
    };
    var TypedArrayIteratorPrototype = {};
    Object.defineProperty(TypedArrayIteratorPrototype, "next", {
        value: function next() {
            if (this === null || typeof this !== "object" || !hasOwn2.call(this, "_kind")) {
                throw new TypeError("next method called on an object that is not an Array Iterator");
            }
            var ta = this._ta;
            if (ta === null || this._index >= lengthOf(ta)) {
                this._ta = null;
                return {
                    value: void 0,
                    done: true
                };
            }
            var index = this._index++;
            var kind = this._kind;
            if (kind === 0) return {
                value: index,
                done: false
            };
            if (kind === 1) return {
                value: ta[index],
                done: false
            };
            return {
                value: [
                    index,
                    ta[index]
                ],
                done: false
            };
        },
        writable: true,
        enumerable: false,
        configurable: true
    });
    if (typeof Symbol !== "undefined" && Symbol.iterator) {
        Object.defineProperty(TypedArrayIteratorPrototype, Symbol.iterator, {
            value: returnSelfIterator,
            writable: true,
            enumerable: false,
            configurable: true
        });
    }
    var ITER_SLOT = {
        value: void 0,
        writable: true,
        enumerable: false,
        configurable: false
    };
    var makeIterator = function makeIterator(O, kind) {
        var iterator = Object.create(TypedArrayIteratorPrototype);
        ITER_SLOT.value = O;
        Object.defineProperty(iterator, "_ta", ITER_SLOT);
        ITER_SLOT.value = 0;
        Object.defineProperty(iterator, "_index", ITER_SLOT);
        ITER_SLOT.value = kind;
        Object.defineProperty(iterator, "_kind", ITER_SLOT);
        ITER_SLOT.value = void 0;
        return iterator;
    };
    var typedArrayKeys = function keys() {
        validate(this, "keys");
        var fn = arrayIteratorMethod("keys");
        return fn ? fn.call(this) : makeIterator(this, 0);
    };
    var typedArrayValues = function values() {
        validate(this, "values");
        var fn = arrayIteratorMethod("values");
        return fn ? fn.call(this) : makeIterator(this, 1);
    };
    var typedArrayEntries = function entries() {
        validate(this, "entries");
        var fn = arrayIteratorMethod("entries");
        return fn ? fn.call(this) : makeIterator(this, 2);
    };
    var installTypedArrayPolyfill = function installTypedArrayPolyfill() {
        if (!isSupported3()) {
            var typedArrayTypes = [
                typeof Uint8Array !== "undefined" ? Uint8Array : null,
                typeof Int8Array !== "undefined" ? Int8Array : null,
                typeof Uint16Array !== "undefined" ? Uint16Array : null,
                typeof Int16Array !== "undefined" ? Int16Array : null,
                typeof Uint32Array !== "undefined" ? Uint32Array : null,
                typeof Int32Array !== "undefined" ? Int32Array : null,
                typeof Float32Array !== "undefined" ? Float32Array : null,
                typeof Float64Array !== "undefined" ? Float64Array : null,
                typeof Uint8ClampedArray !== "undefined" ? Uint8ClampedArray : null
            ];
            var typedArrayMethods = [
                [
                    "find",
                    typedArrayFind
                ],
                [
                    "findIndex",
                    typedArrayFindIndex
                ],
                [
                    "includes",
                    typedArrayIncludes
                ],
                [
                    "at",
                    typedArrayAt
                ],
                [
                    "every",
                    typedArrayEvery
                ],
                [
                    "some",
                    typedArraySome
                ],
                [
                    "forEach",
                    typedArrayForEach
                ],
                [
                    "map",
                    typedArrayMap
                ],
                [
                    "filter",
                    typedArrayFilter
                ],
                [
                    "indexOf",
                    typedArrayIndexOf
                ],
                [
                    "lastIndexOf",
                    typedArrayLastIndexOf
                ],
                [
                    "join",
                    typedArrayJoin
                ],
                [
                    "reduce",
                    typedArrayReduce
                ],
                [
                    "reduceRight",
                    typedArrayReduceRight
                ],
                [
                    "reverse",
                    typedArrayReverse
                ],
                [
                    "slice",
                    typedArraySlice
                ],
                [
                    "sort",
                    typedArraySort
                ],
                [
                    "copyWithin",
                    typedArrayCopyWithin
                ],
                [
                    "fill",
                    typedArrayFill
                ],
                [
                    "keys",
                    typedArrayKeys
                ],
                [
                    "values",
                    typedArrayValues
                ],
                [
                    "entries",
                    typedArrayEntries
                ]
            ];
            var typedArrayTypesTargets = sharedTypedArray ? [
                sharedTypedArray
            ].concat(unparented) : typedArrayTypes;
            for(var i = 0; i < typedArrayTypesTargets.length; i++){
                var TypedArray = typedArrayTypesTargets[i];
                if (!TypedArray) continue;
                var proto2 = TypedArray.prototype;
                for(var m = 0; m < typedArrayMethods.length; m++){
                    var name = typedArrayMethods[m][0];
                    {
                        try {
                            Object.defineProperty(typedArrayMethods[m][1], "name", {
                                value: name,
                                configurable: true
                            });
                        } catch (e) {}
                        Object.defineProperty(proto2, name, {
                            value: typedArrayMethods[m][1],
                            writable: true,
                            enumerable: false,
                            configurable: true
                        });
                        Object.defineProperty(proto2[name], "__polyfilled", {
                            value: true
                        });
                    }
                }
                if (proto2.toString === Object.prototype.toString) {
                    Object.defineProperty(proto2, "toString", {
                        value: Array.prototype.toString,
                        writable: true,
                        enumerable: false,
                        configurable: true
                    });
                }
                if (proto2.toLocaleString === Object.prototype.toLocaleString) {
                    Object.defineProperty(proto2, "toLocaleString", {
                        value: typedArrayToLocaleString,
                        writable: true,
                        enumerable: false,
                        configurable: true
                    });
                    try {
                        Object.defineProperty(proto2.toLocaleString, "name", {
                            value: "toLocaleString",
                            configurable: true
                        });
                    } catch (e) {}
                    Object.defineProperty(proto2.toLocaleString, "__polyfilled", {
                        value: true
                    });
                }
                if (typeof Symbol !== "undefined" && Symbol.iterator) {
                    Object.defineProperty(proto2, Symbol.iterator, {
                        value: proto2.values,
                        writable: true,
                        enumerable: false,
                        configurable: true
                    });
                    Object.defineProperty(proto2[Symbol.iterator], "__polyfilled", {
                        value: true
                    });
                }
            }
        }
    };
    var isModernSupported = function isModernSupported() {
        try {
            if (typeof Uint8Array === "undefined") {
                return false;
            }
            var prototype = Uint8Array.prototype;
            if (// at (ES2022) and includes (ES2016) live here, not in the ES2015 gate:
            // requiring them there failed Safari 10-15.3 and replaced 22 working
            // natives to supply two missing ones.
            typeof prototype.at !== "function" || typeof prototype.includes !== "function" || typeof prototype.findLast !== "function" || typeof prototype.findLastIndex !== "function" || typeof prototype.toReversed !== "function" || typeof prototype.toSorted !== "function" || typeof prototype.with !== "function" || typeof Uint8Array.from !== "function" || typeof Uint8Array.of !== "function") {
                return false;
            }
            try {
                new Uint8Array(2).set([
                    1,
                    2,
                    3
                ]);
                return false;
            } catch (unused) {}
            try {
                var clamped = new Uint8ClampedArray(2);
                clamped.set({
                    length: 1,
                    0: 3
                }, 1);
                var int8 = new Int8Array(2);
                int8.set(1);
                int8.set("2", 1);
                if (clamped[1] !== 3 || int8[0] !== 0 || int8[1] !== 2) return false;
            } catch (unused) {
                return false;
            }
            try {
                var count = 0;
                new Int8Array(2).fill({
                    valueOf: function valueOf() {
                        return count++;
                    }
                });
                if (count !== 1) return false;
            } catch (unused) {
                return false;
            }
            var nativeSort = Uint16Array.prototype.sort;
            var threwNull = false;
            var threwObject = false;
            try {
                nativeSort.call(new Uint16Array(2), null);
            } catch (e) {
                threwNull = true;
            }
            try {
                nativeSort.call(new Uint16Array(2), {});
            } catch (e) {
                threwObject = true;
            }
            if (!threwNull || !threwObject) return false;
            try {
                var array = new Uint16Array(516);
                for(var index = 0; index < 516; index++)array[index] = 515 - index;
                nativeSort.call(array, function(a, b) {
                    return (a / 4 | 0) - (b / 4 | 0);
                });
                for(var index1 = 0; index1 < 516; index1++){
                    if (array[index1] !== index1 - 2 * (index1 % 4) + 3) return false;
                }
            } catch (unused) {
                return false;
            }
            return true;
        } catch (unused) {
            return false;
        }
    };
    var typedArrayFindLast = function findLast(callbackfn) {
        var len = validate(this, "findLast");
        if (typeof callbackfn !== "function") throw new TypeError("callback is not a function");
        var thisArg = arguments.length > 1 ? arguments[1] : void 0;
        for(var k = len - 1; k >= 0; k--){
            var kValue = this[k];
            if (callbackfn.call(thisArg, kValue, k, this)) return kValue;
        }
        return void 0;
    };
    var typedArrayFindLastIndex = function findLastIndex(callbackfn) {
        var len = validate(this, "findLastIndex");
        if (typeof callbackfn !== "function") throw new TypeError("callback is not a function");
        var thisArg = arguments.length > 1 ? arguments[1] : void 0;
        for(var k = len - 1; k >= 0; k--){
            if (callbackfn.call(thisArg, this[k], k, this)) return k;
        }
        return -1;
    };
    var typedArrayToReversed = function toReversed() {
        var len = validate(this, "toReversed");
        var A = createSameType(this, len);
        for(var k = 0; k < len; k++)A[k] = this[len - k - 1];
        return A;
    };
    var typedArrayToSorted = function toSorted(comparefn) {
        if (comparefn !== void 0 && typeof comparefn !== "function") {
            throw new TypeError("The comparison function must be either a function or undefined");
        }
        var len = validate(this, "toSorted");
        var A = createSameType(this, len);
        var items = sortedList(this, len, comparefn);
        for(var k = 0; k < len; k++)A[k] = items[k];
        return A;
    };
    var typedArrayWith = function typedArrayWith(index, value) {
        var len = validate(this, "with");
        var rel = +index;
        rel = rel !== rel ? 0 : rel === Infinity || rel === -Infinity ? rel : rel < 0 ? Math.ceil(rel) : Math.floor(rel);
        var actual = rel >= 0 ? rel : len + rel;
        var numericValue = +value;
        if (actual < 0 || actual >= lengthOf(this) || isDetached(this)) {
            throw new RangeError("Invalid typed array index");
        }
        var A = createSameType(this, len);
        for(var k = 0; k < len; k++)A[k] = k === actual ? numericValue : this[k];
        return A;
    };
    var typedArraySet = function typedArraySet(source) {
        if (typedArrayName(this) === void 0) {
            throw new TypeError("%TypedArray%.prototype.set: this is not a typed array");
        }
        var targetOffset = +(arguments.length > 1 ? arguments[1] : void 0);
        targetOffset = targetOffset !== targetOffset ? 0 : targetOffset === Infinity || targetOffset === -Infinity ? targetOffset : targetOffset < 0 ? Math.ceil(targetOffset) : Math.floor(targetOffset);
        if (targetOffset < 0) throw new RangeError("offset is out of bounds");
        if (isDetached(this)) throw new TypeError("%TypedArray%.prototype.set: the buffer is detached");
        var targetLength = lengthOf(this);
        if (typedArrayName(source) !== void 0) {
            if (isDetached(source)) throw new TypeError("%TypedArray%.prototype.set: the source buffer is detached");
            var srcLength2 = lengthOf(source);
            if (targetOffset === Infinity || srcLength2 + targetOffset > targetLength) throw new RangeError("offset is out of bounds");
            var values4 = /* @__PURE__ */ Object.create(null);
            for(var k = 0; k < srcLength2; k++)values4[k] = source[k];
            for(var k1 = 0; k1 < srcLength2; k1++)this[targetOffset + k1] = values4[k1];
            return void 0;
        }
        var src = Object(source);
        var srcLength = +src.length;
        srcLength = srcLength !== srcLength || srcLength <= 0 ? 0 : srcLength > 9007199254740991 ? 9007199254740991 : Math.floor(srcLength);
        if (targetOffset === Infinity || srcLength + targetOffset > targetLength) throw new RangeError("offset is out of bounds");
        for(var k2 = 0; k2 < srcLength; k2++)this[targetOffset + k2] = src[k2];
        return void 0;
    };
    var typedArrayOf = function of() {
        var C = this;
        if (!isConstructor(C)) throw new TypeError("%TypedArray%.of: this is not a constructor");
        var len = arguments.length;
        var newObj = createFromConstructor(C, len);
        for(var k = 0; k < len; k++)newObj[k] = arguments[k];
        return newObj;
    };
    var typedArrayFrom = function from(source) {
        var C = this;
        if (!isConstructor(C)) throw new TypeError("%TypedArray%.from: this is not a constructor");
        var mapfn = arguments.length > 1 ? arguments[1] : void 0;
        var thisArg = arguments.length > 2 ? arguments[2] : void 0;
        if (mapfn !== void 0 && typeof mapfn !== "function") throw new TypeError("mapfn is not a function");
        var iteratorKey4 = typeof Symbol !== "undefined" && Symbol.iterator ? Symbol.iterator : void 0;
        var usingIterator = iteratorKey4 && source !== null && source !== void 0 ? source[iteratorKey4] : void 0;
        if (usingIterator === null) usingIterator = void 0;
        if (usingIterator !== void 0) {
            if (typeof usingIterator !== "function") throw new TypeError("%TypedArray%.from: @@iterator is not a function");
            var iterator = usingIterator.call(source);
            if (!isObject(iterator)) throw new TypeError("Result of the Symbol.iterator method is not an object");
            var next8 = iterator.next;
            var values4 = /* @__PURE__ */ Object.create(null);
            var len2 = 0;
            for(;;){
                var step = next8.call(iterator);
                if (!isObject(step)) throw new TypeError("Iterator result is not an object");
                if (step.done) break;
                values4[len2++] = step.value;
            }
            var target2 = createFromConstructor(C, len2);
            for(var k = 0; k < len2; k++)target2[k] = mapfn !== void 0 ? mapfn.call(thisArg, values4[k], k) : values4[k];
            return target2;
        }
        if (source === null || source === void 0) throw new TypeError("%TypedArray%.from: source is null or undefined");
        var arrayLike = Object(source);
        var len = +arrayLike.length;
        len = len !== len || len <= 0 ? 0 : len > 9007199254740991 ? 9007199254740991 : Math.floor(len);
        var target = createFromConstructor(C, len);
        for(var k1 = 0; k1 < len; k1++){
            var kValue = arrayLike[k1];
            target[k1] = mapfn !== void 0 ? mapfn.call(thisArg, kValue, k1) : kValue;
        }
        return target;
    };
    var installTypedArrayExtensionsOnNative = function installTypedArrayExtensionsOnNative() {
        if (!isModernSupported()) {
            var modernTypes = [
                typeof Uint8Array !== "undefined" ? Uint8Array : null,
                typeof Int8Array !== "undefined" ? Int8Array : null,
                typeof Uint16Array !== "undefined" ? Uint16Array : null,
                typeof Int16Array !== "undefined" ? Int16Array : null,
                typeof Uint32Array !== "undefined" ? Uint32Array : null,
                typeof Int32Array !== "undefined" ? Int32Array : null,
                typeof Float32Array !== "undefined" ? Float32Array : null,
                typeof Float64Array !== "undefined" ? Float64Array : null,
                typeof Uint8ClampedArray !== "undefined" ? Uint8ClampedArray : null
            ];
            var modernMethods = [
                [
                    "at",
                    typedArrayAt
                ],
                [
                    "includes",
                    typedArrayIncludes
                ],
                [
                    "findLast",
                    typedArrayFindLast
                ],
                [
                    "findLastIndex",
                    typedArrayFindLastIndex
                ],
                [
                    "toReversed",
                    typedArrayToReversed
                ],
                [
                    "toSorted",
                    typedArrayToSorted
                ],
                [
                    "with",
                    typedArrayWith
                ]
            ];
            var modernStatics = [
                [
                    "from",
                    typedArrayFrom
                ],
                [
                    "of",
                    typedArrayOf
                ]
            ];
            var fillIsBroken = function() {
                if (typeof Int8Array === "undefined") return false;
                try {
                    var count = 0;
                    new Int8Array(2).fill({
                        valueOf: function valueOf() {
                            return count++;
                        }
                    });
                    return count !== 1;
                } catch (e) {
                    return true;
                }
            }();
            var sortIsBroken = function() {
                if (typeof Uint16Array === "undefined") return false;
                var nativeSort = Uint16Array.prototype.sort;
                if (typeof nativeSort !== "function") return false;
                var threwNull = false;
                var threwObject = false;
                try {
                    nativeSort.call(new Uint16Array(2), null);
                } catch (e) {
                    threwNull = true;
                }
                try {
                    nativeSort.call(new Uint16Array(2), {});
                } catch (e) {
                    threwObject = true;
                }
                if (!threwNull || !threwObject) return true;
                try {
                    var array = new Uint16Array(516);
                    for(var index = 0; index < 516; index++)array[index] = 515 - index;
                    nativeSort.call(array, function(a, b) {
                        return (a / 4 | 0) - (b / 4 | 0);
                    });
                    for(var index1 = 0; index1 < 516; index1++){
                        if (array[index1] !== index1 - 2 * (index1 % 4) + 3) return true;
                    }
                    return false;
                } catch (e) {
                    return true;
                }
            }();
            var setIsBroken = function() {
                if (typeof Uint8Array === "undefined") return false;
                try {
                    var clamped = new Uint8ClampedArray(2);
                    clamped.set({
                        length: 1,
                        0: 3
                    }, 1);
                    var int8 = new Int8Array(2);
                    int8.set(1);
                    int8.set("2", 1);
                    if (clamped[1] !== 3 || int8[0] !== 0 || int8[1] !== 2) return true;
                } catch (unused) {
                    return true;
                }
                try {
                    new Uint8Array(2).set([
                        1,
                        2,
                        3
                    ]);
                    return true;
                } catch (unused) {
                    return false;
                }
            }();
            var modernTypesTargets = sharedTypedArray ? [
                sharedTypedArray
            ].concat(unparented) : modernTypes;
            for(var i = 0; i < modernTypesTargets.length; i++){
                var TypedArray = modernTypesTargets[i];
                if (!TypedArray) continue;
                var proto2 = TypedArray.prototype;
                for(var m = 0; m < modernMethods.length; m++){
                    var name = modernMethods[m][0];
                    if (!proto2[name]) {
                        try {
                            Object.defineProperty(modernMethods[m][1], "name", {
                                value: name,
                                configurable: true
                            });
                        } catch (e) {}
                        Object.defineProperty(proto2, name, {
                            value: modernMethods[m][1],
                            writable: true,
                            enumerable: false,
                            configurable: true
                        });
                        Object.defineProperty(proto2[name], "__polyfilled", {
                            value: true
                        });
                    }
                }
                if (setIsBroken) {
                    if (TypedArray === sharedTypedArray) clearOwn("set", typedArraySet);
                    Object.defineProperty(proto2, "set", {
                        value: typedArraySet,
                        writable: true,
                        enumerable: false,
                        configurable: true
                    });
                    try {
                        Object.defineProperty(proto2.set, "name", {
                            value: "set",
                            configurable: true
                        });
                    } catch (e) {}
                    Object.defineProperty(proto2.set, "__polyfilled", {
                        value: true
                    });
                }
                var patches = [
                    [
                        fillIsBroken,
                        "fill",
                        typedArrayFill
                    ],
                    [
                        sortIsBroken,
                        "sort",
                        typedArraySort
                    ]
                ];
                for(var p = 0; p < patches.length; p++){
                    if (!patches[p][0]) continue;
                    var name1 = patches[p][1];
                    if (TypedArray === sharedTypedArray) clearOwn(name1, patches[p][2]);
                    Object.defineProperty(proto2, name1, {
                        value: patches[p][2],
                        writable: true,
                        enumerable: false,
                        configurable: true
                    });
                    try {
                        Object.defineProperty(proto2[name1], "name", {
                            value: name1,
                            configurable: true
                        });
                    } catch (e) {}
                    try {
                        Object.defineProperty(proto2[name1], "__polyfilled", {
                            value: true
                        });
                    } catch (e) {}
                }
                for(var s = 0; s < modernStatics.length; s++){
                    var name2 = modernStatics[s][0];
                    if (!TypedArray[name2]) {
                        try {
                            Object.defineProperty(modernStatics[s][1], "name", {
                                value: name2,
                                configurable: true
                            });
                        } catch (e) {}
                        Object.defineProperty(TypedArray, name2, {
                            value: modernStatics[s][1],
                            writable: true,
                            enumerable: false,
                            configurable: true
                        });
                        Object.defineProperty(TypedArray[name2], "__polyfilled", {
                            value: true
                        });
                    }
                }
            }
        }
    };
    var unifyIterators = function unifyIterators() {
        var arrayValues3 = Array.prototype.values;
        if (!arrayValues3 || arrayValues3.__polyfilled !== true) return;
        var targets = sharedTypedArray ? [
            sharedTypedArray
        ].concat(unparented).map(function(C) {
            return C.prototype;
        }) : TA_NAMES.map(function(name) {
            return intrinsicByName[name] ? intrinsicByName[name].prototype : null;
        });
        var methods2 = [
            [
                "keys",
                typedArrayKeys
            ],
            [
                "values",
                typedArrayValues
            ],
            [
                "entries",
                typedArrayEntries
            ]
        ];
        for(var t = 0; t < targets.length; t++){
            var proto2 = targets[t];
            if (!proto2 || proto2.values && proto2.values.__polyfilled === true) continue;
            for(var m = 0; m < methods2.length; m++){
                try {
                    Object.defineProperty(methods2[m][1], "name", {
                        value: methods2[m][0],
                        configurable: true
                    });
                } catch (e) {}
                Object.defineProperty(proto2, methods2[m][0], {
                    value: methods2[m][1],
                    writable: true,
                    enumerable: false,
                    configurable: true
                });
                try {
                    Object.defineProperty(methods2[m][1], "__polyfilled", {
                        value: true
                    });
                } catch (e) {}
            }
            if (typeof Symbol !== "undefined" && Symbol.iterator) {
                Object.defineProperty(proto2, Symbol.iterator, {
                    value: typedArrayValues,
                    writable: true,
                    enumerable: false,
                    configurable: true
                });
            }
        }
    };
    var installTypedArray = function installTypedArray() {
        synthesiseTypedArray();
        installTypedArrayPolyfill();
        installTypedArrayExtensionsOnNative();
        unifyIterators();
    };
    // src/modules/es.object.to-string.ts
    var isSupported4 = function isSupported4() {
        try {
            var tagKey9 = typeof Symbol !== "undefined" ? Symbol.toStringTag : void 0;
            if (!tagKey9) {
                return true;
            }
            var probe = {};
            probe[tagKey9] = "SpackleProbe";
            return Object.prototype.toString.call(probe) === "[object SpackleProbe]";
        } catch (unused) {
            return true;
        }
    };
    var nativeToString2 = Object.prototype.toString;
    var objectToString2 = function objectToString2() {
        if (this === null) {
            return "[object Null]";
        }
        if (this === void 0) {
            return "[object Undefined]";
        }
        if (typeof Symbol !== "undefined" && Symbol.toStringTag) {
            var tag;
            try {
                tag = this[Symbol.toStringTag];
            } catch (error) {
                if (!error || error.name !== "SecurityError") throw error;
                tag = void 0;
            }
            if (typeof tag === "string") {
                return "[object " + tag + "]";
            }
        }
        return nativeToString2.call(this);
    };
    var install2 = function install2() {
        define(Object.prototype, "toString", objectToString2);
    };
    try {
        if (!isSupported4()) {
            install2();
        }
    } catch (e) {}
    // src/modules/es.aggregate-error.ts
    var isSupported5 = function isSupported5() {
        try {
            var AggregateError3 = window.AggregateError;
            return typeof AggregateError3 === "function";
        } catch (unused) {
            return false;
        }
    };
    var isObject2 = function isObject2(value) {
        return value !== null && (typeof value === "object" || typeof value === "function");
    };
    var HIDDEN = {
        value: void 0,
        writable: true,
        enumerable: false,
        configurable: true
    };
    var LIST = {
        value: void 0,
        writable: true,
        enumerable: true,
        configurable: true
    };
    var setProto = Object.setPrototypeOf || function(o, proto2) {
        o.__proto__ = proto2;
        return o;
    };
    var AggregateError = function AggregateError2(errors, message) {
        var options = arguments.length > 2 ? arguments[2] : void 0;
        var msg;
        if (message === void 0) {
            msg = void 0;
        } else {
            if (typeof message === "symbol") throw new TypeError("Cannot convert a Symbol value to a string");
            msg = typeof message === "string" ? message : String(message);
        }
        var self = msg === void 0 ? new Error() : new Error(msg);
        var proto2 = this instanceof AggregateError2 ? Object.getPrototypeOf(this) : AggregateError2.prototype;
        setProto(self, proto2);
        if (isObject2(options) && "cause" in options) {
            HIDDEN.value = options.cause;
            Object.defineProperty(self, "cause", HIDDEN);
            HIDDEN.value = void 0;
        }
        if (errors === null || errors === void 0) {
            throw new TypeError("AggregateError requires an iterable of errors");
        }
        var out = [];
        var count = 0;
        var iteratorKey4 = typeof Symbol !== "undefined" ? Symbol.iterator : void 0;
        if (iteratorKey4) {
            var method = errors[iteratorKey4];
            if (method === void 0 || method === null) throw new TypeError("AggregateError argument is not iterable");
            var iterator = method.call(errors);
            if (!isObject2(iterator)) throw new TypeError("Result of the Symbol.iterator method is not an object");
            var next8 = iterator.next;
            while(true){
                var step = next8.call(iterator);
                if (!isObject2(step)) throw new TypeError("Iterator result is not an object");
                if (step.done) break;
                LIST.value = step.value;
                Object.defineProperty(out, count++, LIST);
            }
            LIST.value = void 0;
        } else if (typeof errors.length === "number") {
            for(var i = 0; i < errors.length; i++){
                LIST.value = errors[i];
                Object.defineProperty(out, count++, LIST);
            }
            LIST.value = void 0;
        } else {
            throw new TypeError("AggregateError argument is not iterable");
        }
        HIDDEN.value = out;
        Object.defineProperty(self, "errors", HIDDEN);
        HIDDEN.value = void 0;
        return self;
    };
    try {
        setProto(AggregateError, Error);
    } catch (e) {}
    AggregateError.prototype = Object.create(Error.prototype);
    Object.defineProperty(AggregateError.prototype, "constructor", {
        value: AggregateError,
        writable: true,
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(AggregateError.prototype, "name", {
        value: "AggregateError",
        writable: true,
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(AggregateError.prototype, "message", {
        value: "",
        writable: true,
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(AggregateError, "prototype", {
        writable: false,
        enumerable: false,
        configurable: false
    });
    var install3 = function install3() {
        if (!isSupported5()) {
            define(window, "AggregateError", AggregateError);
            return;
        }
        var Native = window.AggregateError;
        try {
            if (new Native([
                1
            ], "m", {
                cause: 7
            }).cause === 7) return;
        } catch (e) {}
        var Wrapped = function Wrapped1(errors, message) {
            var error = message === void 0 ? new Native(errors) : new Native(errors, message);
            var options = arguments.length > 2 ? arguments[2] : void 0;
            if (options !== null && typeof options === "object" && "cause" in options) {
                CAUSE.value = options.cause;
                Object.defineProperty(error, "cause", CAUSE);
                CAUSE.value = void 0;
            }
            if (this instanceof Wrapped && this.constructor !== Wrapped) Object.setPrototypeOf(error, Object.getPrototypeOf(this));
            return error;
        };
        Wrapped.prototype = Native.prototype;
        Object.setPrototypeOf(Wrapped, Object.getPrototypeOf(Native));
        try {
            Object.defineProperty(Wrapped, "name", {
                value: "AggregateError",
                configurable: true
            });
        } catch (e) {}
        Object.defineProperty(Native.prototype, "constructor", {
            value: Wrapped,
            writable: true,
            enumerable: false,
            configurable: true
        });
        define(window, "AggregateError", Wrapped);
    };
    var CAUSE = {
        value: void 0,
        writable: true,
        enumerable: false,
        configurable: true
    };
    // src/modules/es.map.ts
    var hasSymbol = typeof Symbol !== "undefined" && Symbol.iterator != null;
    var returnSelf = function returnSelf() {
        return this;
    };
    var INDEX_AT = 32;
    var HOLE = {};
    var buildIndex = function buildIndex(self) {
        var keys3 = self._keys;
        var si = /* @__PURE__ */ Object.create(null);
        var ni = /* @__PURE__ */ Object.create(null);
        for(var i = 0; i < keys3.length; i++){
            var key = keys3[i];
            if (typeof key === "string") si[key] = i;
            else if (typeof key === "number") ni[key] = i;
        }
        own(self, "_si", si);
        own(self, "_ni", ni);
    };
    var compact = function compact(self) {
        var keys3 = self._keys;
        var vals = self._vals;
        var length = keys3.length;
        if (self._holes === length) {
            keys3.length = 0;
            vals.length = 0;
            if (self._si !== 0) {
                own(self, "_si", 0);
                own(self, "_ni", 0);
            }
            own(self, "_holes", 0);
            own(self, "_remap", 0);
            own(self, "_epoch", self._epoch + 1);
            return;
        }
        var remap = new Array(length + 1);
        var w = 0;
        for(var r = 0; r < length; r++){
            remap[r] = w;
            if (keys3[r] !== HOLE) {
                keys3[w] = keys3[r];
                vals[w] = vals[r];
                w++;
            }
        }
        remap[length] = w;
        keys3.length = w;
        vals.length = w;
        if (self._si !== 0) {
            if (w >= INDEX_AT) {
                buildIndex(self);
            } else {
                own(self, "_si", 0);
                own(self, "_ni", 0);
            }
        }
        own(self, "_holes", 0);
        own(self, "_remap", remap);
        own(self, "_epoch", self._epoch + 1);
    };
    var MapIterator = function MapIterator(self, kind) {
        SLOT2.value = self;
        Object.defineProperty(this, "_self", SLOT2);
        SLOT2.value = 0;
        Object.defineProperty(this, "_index", SLOT2);
        SLOT2.value = kind;
        Object.defineProperty(this, "_kind", SLOT2);
        SLOT2.value = self._epoch;
        Object.defineProperty(this, "_epoch", SLOT2);
        SLOT2.value = void 0;
    };
    var hasOwnSlot = Object.prototype.hasOwnProperty;
    MapIterator.prototype.next = function next2() {
        if (this === null || typeof this !== "object" || !hasOwnSlot.call(this, "_kind")) {
            throw new TypeError("next method called on an object that is not a Map Iterator");
        }
        var self = this._self;
        if (self === null) {
            return {
                value: void 0,
                done: true
            };
        }
        if (this._epoch !== self._epoch) {
            if (this._epoch === self._epoch - 1) {
                var remap = self._remap;
                this._index = remap === 0 ? 0 : remap[this._index < remap.length ? this._index : remap.length - 1];
            } else if (this._index > self._keys.length) {
                this._index = self._keys.length;
            }
        }
        this._epoch = self._epoch;
        var keys3 = self._keys;
        while(this._index < keys3.length && keys3[this._index] === HOLE)this._index++;
        if (this._index < keys3.length) {
            var key = keys3[this._index];
            var value = self._vals[this._index];
            this._index++;
            var result = this._kind === "keys" ? key : this._kind === "values" ? value : [
                key,
                value
            ];
            return {
                value: result,
                done: false
            };
        }
        this._self = null;
        return {
            value: void 0,
            done: true
        };
    };
    if (hasSymbol) {
        Object.defineProperty(MapIterator.prototype, Symbol.iterator, {
            value: returnSelf,
            writable: true,
            enumerable: false,
            configurable: true
        });
        try {
            Object.defineProperty(returnSelf, "name", {
                value: "[Symbol.iterator]",
                configurable: true
            });
        } catch (e) {}
    }
    var SLOT2 = {
        value: void 0,
        writable: true,
        enumerable: false,
        configurable: true
    };
    var own = function own(target, key, value) {
        if (Object.prototype.hasOwnProperty.call(target, key)) {
            target[key] = value;
        } else {
            SLOT2.value = value;
            Object.defineProperty(target, key, SLOT2);
            SLOT2.value = void 0;
        }
    };
    var arrayIterAtLoad = hasSymbol ? Array.prototype[Symbol.iterator] : void 0;
    var closeIterator = function closeIterator(iterator) {
        try {
            var ret = iterator["return"];
            if (ret !== void 0 && ret !== null) ret.call(iterator);
        } catch (e) {}
    };
    var addEntries = function addEntries(target, iterable) {
        var adder = target.set;
        if (typeof adder !== "function") {
            throw new TypeError("Map constructor: this.set is not a function");
        }
        if (Array.isArray(iterable) && (!hasSymbol || iterable[Symbol.iterator] === arrayIterAtLoad && Array.prototype[Symbol.iterator] === arrayIterAtLoad)) {
            for(var i = 0; i < iterable.length; i++){
                var item = iterable[i];
                if (item === null || typeof item !== "object" && typeof item !== "function") {
                    throw new TypeError("Iterator value is not an entry object");
                }
                adder.call(target, item[0], item[1]);
            }
            return;
        }
        var method = hasSymbol ? iterable[Symbol.iterator] : void 0;
        if (typeof method !== "function") {
            throw new TypeError("Map constructor argument is not iterable");
        }
        var iterator = method.call(iterable);
        if (iterator === null || typeof iterator !== "object" && typeof iterator !== "function") {
            throw new TypeError("Result of the Symbol.iterator method is not an object");
        }
        var next8 = iterator.next;
        for(;;){
            var step = next8.call(iterator);
            if (step === null || typeof step !== "object" && typeof step !== "function") {
                throw new TypeError("Iterator result is not an object");
            }
            if (step.done) {
                return;
            }
            var item1 = step.value;
            try {
                if (item1 === null || typeof item1 !== "object" && typeof item1 !== "function") {
                    throw new TypeError("Iterator value is not an entry object");
                }
                adder.call(target, item1[0], item1[1]);
            } catch (error) {
                closeIterator(iterator);
                throw error;
            }
        }
    };
    var Map2 = function Map21() {
        if (!(this instanceof Map2)) {
            throw new TypeError("Constructor Map requires 'new'");
        }
        SLOT2.value = [];
        Object.defineProperty(this, "_keys", SLOT2);
        SLOT2.value = void 0;
        SLOT2.value = [];
        Object.defineProperty(this, "_vals", SLOT2);
        SLOT2.value = void 0;
        var iterable = arguments.length > 0 ? arguments[0] : void 0;
        if (iterable !== null && iterable !== void 0) addEntries(this, iterable);
    };
    Map2.prototype.set = function(key, value) {
        if (this === null || typeof this !== "object" || this._vals === void 0) {
            throw new TypeError("Method Map.prototype.set called on incompatible receiver");
        }
        if (key === 0) {
            key = 0;
        }
        var i = -1;
        if (this._si !== 0 && (typeof key === "string" || typeof key === "number")) {
            var at2 = (typeof key === "string" ? this._si : this._ni)[key];
            if (at2 !== void 0) i = at2;
        } else {
            var list = this._keys;
            for(var k = 0; k < list.length; k++){
                var stored = list[k];
                if (stored === key || stored !== stored && key !== key) {
                    i = k;
                    break;
                }
            }
        }
        if (i === -1) {
            var at21 = this._keys.length;
            this._keys[at21] = key;
            this._vals[at21] = value;
            if (this._si !== 0) {
                if (typeof key === "string") this._si[key] = at21;
                else if (typeof key === "number") this._ni[key] = at21;
            } else if (at21 + 1 >= INDEX_AT) {
                buildIndex(this);
            }
        } else {
            this._vals[i] = value;
        }
        return this;
    };
    Map2.prototype.get = function(key) {
        if (this === null || typeof this !== "object" || this._vals === void 0) {
            throw new TypeError("Method Map.prototype.get called on incompatible receiver");
        }
        var i = -1;
        if (this._si !== 0 && (typeof key === "string" || typeof key === "number")) {
            var at2 = (typeof key === "string" ? this._si : this._ni)[key];
            if (at2 !== void 0) i = at2;
        } else {
            var list = this._keys;
            for(var k = 0; k < list.length; k++){
                var stored = list[k];
                if (stored === key || stored !== stored && key !== key) {
                    i = k;
                    break;
                }
            }
        }
        return i === -1 ? void 0 : this._vals[i];
    };
    Map2.prototype.has = function(key) {
        if (this === null || typeof this !== "object" || this._vals === void 0) {
            throw new TypeError("Method Map.prototype.has called on incompatible receiver");
        }
        var i = -1;
        if (this._si !== 0 && (typeof key === "string" || typeof key === "number")) {
            var at2 = (typeof key === "string" ? this._si : this._ni)[key];
            if (at2 !== void 0) i = at2;
        } else {
            var list = this._keys;
            for(var k = 0; k < list.length; k++){
                var stored = list[k];
                if (stored === key || stored !== stored && key !== key) {
                    i = k;
                    break;
                }
            }
        }
        return i !== -1;
    };
    Map2.prototype.delete = function(key) {
        if (this === null || typeof this !== "object" || this._vals === void 0) {
            throw new TypeError("Method Map.prototype.delete called on incompatible receiver");
        }
        var i = -1;
        if (this._si !== 0 && (typeof key === "string" || typeof key === "number")) {
            var at2 = (typeof key === "string" ? this._si : this._ni)[key];
            if (at2 !== void 0) i = at2;
        } else {
            var list = this._keys;
            for(var k = 0; k < list.length; k++){
                var stored = list[k];
                if (stored === key || stored !== stored && key !== key) {
                    i = k;
                    break;
                }
            }
        }
        if (i === -1) {
            return false;
        }
        if (this._si !== 0) {
            if (typeof key === "string") delete this._si[key];
            else if (typeof key === "number") delete this._ni[key];
        }
        this._keys[i] = HOLE;
        this._vals[i] = void 0;
        var holes = this._holes + 1;
        if (hasOwnSlot.call(this, "_holes")) {
            this._holes = holes;
        } else {
            SLOT2.value = holes;
            Object.defineProperty(this, "_holes", SLOT2);
            SLOT2.value = void 0;
        }
        var live = this._keys.length - holes;
        if (live === 0 || holes > 16 && holes > live) compact(this);
        return true;
    };
    Map2.prototype.clear = function() {
        if (this === null || typeof this !== "object" || this._vals === void 0) {
            throw new TypeError("Method Map.prototype.clear called on incompatible receiver");
        }
        own(this, "_holes", this._keys.length);
        compact(this);
    };
    Map2.prototype.forEach = function(callback) {
        var thisArg = arguments.length > 1 ? arguments[1] : void 0;
        if (this === null || typeof this !== "object" || this._vals === void 0) {
            throw new TypeError("Method Map.prototype.forEach called on incompatible receiver");
        }
        if (typeof callback !== "function") {
            throw new TypeError("Map.prototype.forEach callback is not a function");
        }
        var keys3 = this._keys;
        var vals = this._vals;
        var index = 0;
        var epoch = this._epoch;
        for(;;){
            while(index < keys3.length && keys3[index] === HOLE)index++;
            if (index >= keys3.length) return;
            var i = index++;
            if (thisArg === void 0) callback(vals[i], keys3[i], this);
            else callback.call(thisArg, vals[i], keys3[i], this);
            if (epoch !== this._epoch) {
                if (epoch === this._epoch - 1) {
                    var remap = this._remap;
                    index = remap === 0 ? 0 : remap[index < remap.length ? index : remap.length - 1];
                } else if (index > keys3.length) {
                    index = keys3.length;
                }
                epoch = this._epoch;
            }
        }
    };
    Map2.prototype.keys = function() {
        if (this === null || typeof this !== "object" || this._vals === void 0) {
            throw new TypeError("Method Map.prototype.keys called on incompatible receiver");
        }
        return new MapIterator(this, "keys");
    };
    Map2.prototype.values = function() {
        if (this === null || typeof this !== "object" || this._vals === void 0) {
            throw new TypeError("Method Map.prototype.values called on incompatible receiver");
        }
        return new MapIterator(this, "values");
    };
    Map2.prototype.entries = function() {
        if (this === null || typeof this !== "object" || this._vals === void 0) {
            throw new TypeError("Method Map.prototype.entries called on incompatible receiver");
        }
        return new MapIterator(this, "entries");
    };
    Object.defineProperty(Map2.prototype, "size", {
        configurable: true,
        get: function get() {
            return this._keys.length - this._holes;
        }
    });
    try {
        try {
            Object.defineProperty(Object.getOwnPropertyDescriptor(Map2.prototype, "size").get, "name", {
                value: "get size",
                configurable: true
            });
        } catch (e) {}
    } catch (e) {}
    if (hasSymbol) {
        Object.defineProperty(Map2.prototype, Symbol.iterator, {
            value: Map2.prototype.entries,
            writable: true,
            enumerable: false,
            configurable: true
        });
        if (Symbol.toStringTag) {
            Object.defineProperty(Map2.prototype, Symbol.toStringTag, {
                value: "Map",
                writable: false,
                enumerable: false,
                configurable: true
            });
        }
    }
    var mapMethods = [
        [
            "set",
            2
        ],
        [
            "get",
            1
        ],
        [
            "has",
            1
        ],
        [
            "delete",
            1
        ],
        [
            "clear",
            0
        ],
        [
            "forEach",
            1
        ],
        [
            "keys",
            0
        ],
        [
            "values",
            0
        ],
        [
            "entries",
            0
        ]
    ];
    for(var i2 = 0; i2 < mapMethods.length; i2++){
        var name = mapMethods[i2][0];
        var fn = Map2.prototype[name];
        try {
            Object.defineProperty(fn, "name", {
                value: name,
                configurable: true
            });
        } catch (e) {}
        Object.defineProperty(Map2.prototype, name, {
            value: fn,
            writable: true,
            enumerable: false,
            configurable: true
        });
    }
    try {
        Object.defineProperty(MapIterator.prototype.next, "name", {
            value: "next",
            configurable: true
        });
    } catch (e) {}
    Object.defineProperty(MapIterator.prototype, "next", {
        value: MapIterator.prototype.next,
        writable: true,
        enumerable: false,
        configurable: true
    });
    if (typeof Symbol !== "undefined" && Symbol.species) {
        var speciesGetter = function speciesGetter() {
            return this;
        };
        try {
            Object.defineProperty(speciesGetter, "name", {
                value: "get [Symbol.species]",
                configurable: true
            });
        } catch (e) {}
        Object.defineProperty(Map2, Symbol.species, {
            get: speciesGetter,
            enumerable: false,
            configurable: true
        });
    }
    if (hasSymbol && Symbol.toStringTag) {
        Object.defineProperty(MapIterator.prototype, Symbol.toStringTag, {
            value: "Map Iterator",
            writable: false,
            enumerable: false,
            configurable: true
        });
    }
    var nativeUnusable = function nativeUnusable() {
        try {
            var Native = window.Map;
            if (typeof Native !== "function") return true;
            var proto2 = Native.prototype;
            var names = [
                "set",
                "get",
                "has",
                "delete",
                "clear",
                "forEach",
                "keys",
                "values",
                "entries"
            ];
            for(var i = 0; i < names.length; i++)if (typeof proto2[names[i]] !== "function") return true;
            new Native().entries().next();
            return false;
        } catch (e) {
            return true;
        }
    };
    var installMapPolyfill = function installMapPolyfill() {
        if (!nativeUnusable()) return;
        window.Map = null;
        delete window.Map;
        define(window, "Map", Map2);
    };
    var installMapExtensionsOnNative = function installMapExtensionsOnNative() {
        var Native = window.Map;
        if (typeof Native !== "function" || Native === Map2) return;
        var proto2 = Native.prototype;
        var tag = typeof Symbol !== "undefined" ? Symbol.toStringTag : void 0;
        if (tag) {
            try {
                if (!Object.prototype.hasOwnProperty.call(proto2, tag)) Object.defineProperty(proto2, tag, {
                    value: "Map",
                    writable: false,
                    enumerable: false,
                    configurable: true
                });
                var iterProto = Object.getPrototypeOf(new Native().entries());
                if (!Object.prototype.hasOwnProperty.call(iterProto, tag)) Object.defineProperty(iterProto, tag, {
                    value: "Map Iterator",
                    writable: false,
                    enumerable: false,
                    configurable: true
                });
            } catch (e) {}
        }
        var species = typeof Symbol !== "undefined" ? Symbol.species : void 0;
        if (species && !Object.prototype.hasOwnProperty.call(Native, species)) {
            var speciesGetter = function speciesGetter() {
                return this;
            };
            try {
                Object.defineProperty(speciesGetter, "name", {
                    value: "get [Symbol.species]",
                    configurable: true
                });
            } catch (e) {}
            try {
                Object.defineProperty(Native, species, {
                    get: speciesGetter,
                    enumerable: false,
                    configurable: true
                });
            } catch (e) {}
        }
        var nativeAdder = proto2.set;
        var storesNegativeZero = false;
        var lookupMissesZero = false;
        var hasntChaining = false;
        try {
            var probe = new Native();
            hasntChaining = nativeAdder.call(probe, -0, 1) !== probe;
            probe.forEach(function() {
                var k = arguments[1];
                if (k === 0 && 1 / k < 0) storesNegativeZero = true;
            });
            var zero2 = new Native();
            nativeAdder.call(zero2, 0, 1);
            lookupMissesZero = !zero2.has(-0);
        } catch (e) {
            return;
        }
        if (storesNegativeZero || hasntChaining) define(proto2, "set", function set3(key, value) {
            nativeAdder.call(this, key === 0 ? 0 : key, value);
            return this;
        });
        if (lookupMissesZero) {
            var _loop = function(i) {
                var nativeLookup = proto2[names[i]];
                define(proto2, names[i], function(key) {
                    return nativeLookup.call(this, key === 0 ? 0 : key);
                });
            };
            var names = [
                "has",
                "get",
                "delete"
            ];
            for(var i = 0; i < names.length; i++)_loop(i);
        }
        if (!nativeAcceptsIterables(Native)) wrapNativeConstructor(Native);
    };
    var nativeAcceptsIterables = function nativeAcceptsIterables(Native) {
        try {
            if (new Native([
                [
                    1,
                    2
                ]
            ]).get(1) !== 2) return false;
            var key = typeof Symbol !== "undefined" ? Symbol.iterator : void 0;
            if (typeof key !== "symbol") return true;
            var closed = false;
            var bad = {};
            bad[key] = function() {
                return {
                    next: function next() {
                        return {
                            done: false,
                            value: 1
                        };
                    },
                    "return": function() {
                        closed = true;
                        return {};
                    }
                };
            };
            try {
                new Native(bad);
            } catch (e) {
                return closed;
            }
            return false;
        } catch (e) {
            return false;
        }
    };
    var wrapNativeConstructor = function wrapNativeConstructor(Native) {
        var proto2 = Native.prototype;
        var getProto3 = Object.getPrototypeOf;
        var Wrapped = function Map3() {
            if (!(this instanceof Wrapped)) throw new TypeError("Constructor Map requires 'new'");
            var that = new Native();
            var own4 = getProto3(this);
            if (own4 !== proto2) {
                if (typeof Object.setPrototypeOf === "function") Object.setPrototypeOf(that, own4);
                else that.__proto__ = own4;
            }
            var iterable = arguments.length > 0 ? arguments[0] : void 0;
            if (iterable !== null && iterable !== void 0) addEntries(that, iterable);
            return that;
        };
        Wrapped.prototype = proto2;
        Object.defineProperty(proto2, "constructor", {
            value: Wrapped,
            writable: true,
            enumerable: false,
            configurable: true
        });
        var names = Object.getOwnPropertyNames(Native);
        if (typeof Object.getOwnPropertySymbols === "function") {
            var symbols = Object.getOwnPropertySymbols(Native);
            for(var i = 0; i < symbols.length; i++)names.push(symbols[i]);
        }
        for(var i1 = 0; i1 < names.length; i1++){
            var name = names[i1];
            if (name === "prototype" || name === "length" || name === "name" || name === "arguments" || name === "caller") continue;
            var d = Object.getOwnPropertyDescriptor(Native, name);
            if (d) Object.defineProperty(Wrapped, name, d);
        }
        window.Map = null;
        delete window.Map;
        define(window, "Map", Wrapped);
    };
    var install4 = function install4() {
        installMapPolyfill();
        installMapExtensionsOnNative();
    };
    Object.defineProperty(Map2.prototype, "_holes", {
        value: 0,
        writable: true,
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Map2.prototype, "_epoch", {
        value: 0,
        writable: true,
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Map2.prototype, "_remap", {
        value: 0,
        writable: true,
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Map2.prototype, "_si", {
        value: 0,
        writable: true,
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Map2.prototype, "_ni", {
        value: 0,
        writable: true,
        enumerable: false,
        configurable: true
    });
    // src/modules/es.set.ts
    var hasSymbol2 = typeof Symbol !== "undefined" && Symbol.iterator != null;
    var returnSelf2 = function returnSelf2() {
        return this;
    };
    var INDEX_AT2 = 32;
    var HOLE2 = {};
    var buildIndex2 = function buildIndex2(self) {
        var values4 = self._values;
        var si = /* @__PURE__ */ Object.create(null);
        var ni = /* @__PURE__ */ Object.create(null);
        for(var i = 0; i < values4.length; i++){
            var value = values4[i];
            if (typeof value === "string") si[value] = i;
            else if (typeof value === "number") ni[value] = i;
        }
        own2(self, "_si", si);
        own2(self, "_ni", ni);
    };
    var compact2 = function compact2(self) {
        var values4 = self._values;
        var length = values4.length;
        if (self._holes === length) {
            values4.length = 0;
            if (self._si !== 0) {
                own2(self, "_si", 0);
                own2(self, "_ni", 0);
            }
            own2(self, "_holes", 0);
            own2(self, "_remap", 0);
            own2(self, "_epoch", self._epoch + 1);
            return;
        }
        var remap = new Array(length + 1);
        var w = 0;
        for(var r = 0; r < length; r++){
            remap[r] = w;
            if (values4[r] !== HOLE2) values4[w++] = values4[r];
        }
        remap[length] = w;
        values4.length = w;
        if (self._si !== 0) {
            if (w >= INDEX_AT2) {
                buildIndex2(self);
            } else {
                own2(self, "_si", 0);
                own2(self, "_ni", 0);
            }
        }
        own2(self, "_holes", 0);
        own2(self, "_remap", remap);
        own2(self, "_epoch", self._epoch + 1);
    };
    var SetIterator = function SetIterator(self, kind) {
        SLOT3.value = self;
        Object.defineProperty(this, "_self", SLOT3);
        SLOT3.value = 0;
        Object.defineProperty(this, "_index", SLOT3);
        SLOT3.value = kind;
        Object.defineProperty(this, "_kind", SLOT3);
        SLOT3.value = self._epoch;
        Object.defineProperty(this, "_epoch", SLOT3);
        SLOT3.value = void 0;
    };
    var hasOwnSlot2 = Object.prototype.hasOwnProperty;
    SetIterator.prototype.next = function next3() {
        if (this === null || typeof this !== "object" || !hasOwnSlot2.call(this, "_kind")) {
            throw new TypeError("next method called on an object that is not a Set Iterator");
        }
        var self = this._self;
        if (self === null) {
            return {
                value: void 0,
                done: true
            };
        }
        if (this._epoch !== self._epoch) {
            if (this._epoch === self._epoch - 1) {
                var remap = self._remap;
                this._index = remap === 0 ? 0 : remap[this._index < remap.length ? this._index : remap.length - 1];
            } else if (this._index > self._values.length) {
                this._index = self._values.length;
            }
        }
        this._epoch = self._epoch;
        var values4 = self._values;
        while(this._index < values4.length && values4[this._index] === HOLE2)this._index++;
        if (this._index < values4.length) {
            var value = values4[this._index];
            this._index++;
            var result = this._kind === "entries" ? [
                value,
                value
            ] : value;
            return {
                value: result,
                done: false
            };
        }
        this._self = null;
        return {
            value: void 0,
            done: true
        };
    };
    if (hasSymbol2) {
        Object.defineProperty(SetIterator.prototype, Symbol.iterator, {
            value: returnSelf2,
            writable: true,
            enumerable: false,
            configurable: true
        });
        try {
            Object.defineProperty(returnSelf2, "name", {
                value: "[Symbol.iterator]",
                configurable: true
            });
        } catch (e) {}
    }
    var SLOT3 = {
        value: void 0,
        writable: true,
        enumerable: false,
        configurable: true
    };
    var own2 = function own2(target, key, value) {
        if (Object.prototype.hasOwnProperty.call(target, key)) {
            target[key] = value;
        } else {
            SLOT3.value = value;
            Object.defineProperty(target, key, SLOT3);
            SLOT3.value = void 0;
        }
    };
    var arrayIterAtLoad2 = hasSymbol2 ? Array.prototype[Symbol.iterator] : void 0;
    var closeIterator2 = function closeIterator2(iterator) {
        try {
            var ret = iterator["return"];
            if (ret !== void 0 && ret !== null) ret.call(iterator);
        } catch (e) {}
    };
    var addValues = function addValues(target, iterable) {
        var adder = target.add;
        if (typeof adder !== "function") {
            throw new TypeError("Set constructor: this.add is not a function");
        }
        if (Array.isArray(iterable) && (!hasSymbol2 || iterable[Symbol.iterator] === arrayIterAtLoad2 && Array.prototype[Symbol.iterator] === arrayIterAtLoad2)) {
            for(var i = 0; i < iterable.length; i++){
                var item = iterable[i];
                adder.call(target, item);
            }
            return;
        }
        var method = hasSymbol2 ? iterable[Symbol.iterator] : void 0;
        if (typeof method !== "function") {
            throw new TypeError("Set constructor argument is not iterable");
        }
        var iterator = method.call(iterable);
        if (iterator === null || typeof iterator !== "object" && typeof iterator !== "function") {
            throw new TypeError("Result of the Symbol.iterator method is not an object");
        }
        var next8 = iterator.next;
        for(;;){
            var step = next8.call(iterator);
            if (step === null || typeof step !== "object" && typeof step !== "function") {
                throw new TypeError("Iterator result is not an object");
            }
            if (step.done) {
                return;
            }
            var item1 = step.value;
            try {
                adder.call(target, item1);
            } catch (error) {
                closeIterator2(iterator);
                throw error;
            }
        }
    };
    var Set2 = function Set21() {
        if (!(this instanceof Set2)) {
            throw new TypeError("Constructor Set requires 'new'");
        }
        SLOT3.value = [];
        Object.defineProperty(this, "_values", SLOT3);
        SLOT3.value = void 0;
        var iterable = arguments.length > 0 ? arguments[0] : void 0;
        if (iterable !== null && iterable !== void 0) addValues(this, iterable);
    };
    Set2.prototype.add = function(value) {
        if (this === null || typeof this !== "object" || this._values === void 0) {
            throw new TypeError("Method Set.prototype.add called on incompatible receiver");
        }
        if (value === 0) {
            value = 0;
        }
        var found = -1;
        if (this._si !== 0 && (typeof value === "string" || typeof value === "number")) {
            var at2 = (typeof value === "string" ? this._si : this._ni)[value];
            if (at2 !== void 0) found = at2;
        } else {
            var list = this._values;
            for(var k = 0; k < list.length; k++){
                var stored = list[k];
                if (stored === value || stored !== stored && value !== value) {
                    found = k;
                    break;
                }
            }
        }
        if (found === -1) {
            var at21 = this._values.length;
            this._values[at21] = value;
            if (this._si !== 0) {
                if (typeof value === "string") this._si[value] = at21;
                else if (typeof value === "number") this._ni[value] = at21;
            } else if (at21 + 1 >= INDEX_AT2) {
                buildIndex2(this);
            }
        }
        return this;
    };
    Set2.prototype.has = function(value) {
        if (this === null || typeof this !== "object" || this._values === void 0) {
            throw new TypeError("Method Set.prototype.has called on incompatible receiver");
        }
        var i = -1;
        if (this._si !== 0 && (typeof value === "string" || typeof value === "number")) {
            var at2 = (typeof value === "string" ? this._si : this._ni)[value];
            if (at2 !== void 0) i = at2;
        } else {
            var list = this._values;
            for(var k = 0; k < list.length; k++){
                var stored = list[k];
                if (stored === value || stored !== stored && value !== value) {
                    i = k;
                    break;
                }
            }
        }
        return i !== -1;
    };
    Set2.prototype.delete = function(value) {
        if (this === null || typeof this !== "object" || this._values === void 0) {
            throw new TypeError("Method Set.prototype.delete called on incompatible receiver");
        }
        var i = -1;
        if (this._si !== 0 && (typeof value === "string" || typeof value === "number")) {
            var at2 = (typeof value === "string" ? this._si : this._ni)[value];
            if (at2 !== void 0) i = at2;
        } else {
            var list = this._values;
            for(var k = 0; k < list.length; k++){
                var stored = list[k];
                if (stored === value || stored !== stored && value !== value) {
                    i = k;
                    break;
                }
            }
        }
        if (i === -1) {
            return false;
        }
        if (this._si !== 0) {
            if (typeof value === "string") delete this._si[value];
            else if (typeof value === "number") delete this._ni[value];
        }
        this._values[i] = HOLE2;
        var holes = this._holes + 1;
        if (hasOwnSlot2.call(this, "_holes")) {
            this._holes = holes;
        } else {
            SLOT3.value = holes;
            Object.defineProperty(this, "_holes", SLOT3);
            SLOT3.value = void 0;
        }
        var live = this._values.length - holes;
        if (live === 0 || holes > 16 && holes > live) compact2(this);
        return true;
    };
    Set2.prototype.clear = function() {
        if (this === null || typeof this !== "object" || this._values === void 0) {
            throw new TypeError("Method Set.prototype.clear called on incompatible receiver");
        }
        own2(this, "_holes", this._values.length);
        compact2(this);
    };
    Set2.prototype.forEach = function(callback) {
        var thisArg = arguments.length > 1 ? arguments[1] : void 0;
        if (this === null || typeof this !== "object" || this._values === void 0) {
            throw new TypeError("Method Set.prototype.forEach called on incompatible receiver");
        }
        if (typeof callback !== "function") {
            throw new TypeError("Set.prototype.forEach callback is not a function");
        }
        var values4 = this._values;
        var index = 0;
        var epoch = this._epoch;
        for(;;){
            while(index < values4.length && values4[index] === HOLE2)index++;
            if (index >= values4.length) return;
            var i = index++;
            if (thisArg === void 0) callback(values4[i], values4[i], this);
            else callback.call(thisArg, values4[i], values4[i], this);
            if (epoch !== this._epoch) {
                if (epoch === this._epoch - 1) {
                    var remap = this._remap;
                    index = remap === 0 ? 0 : remap[index < remap.length ? index : remap.length - 1];
                } else if (index > values4.length) {
                    index = values4.length;
                }
                epoch = this._epoch;
            }
        }
    };
    Set2.prototype.values = function() {
        if (this === null || typeof this !== "object" || this._values === void 0) {
            throw new TypeError("Method Set.prototype.values called on incompatible receiver");
        }
        return new SetIterator(this, "values");
    };
    Set2.prototype.keys = Set2.prototype.values;
    Set2.prototype.entries = function() {
        if (this === null || typeof this !== "object" || this._values === void 0) {
            throw new TypeError("Method Set.prototype.entries called on incompatible receiver");
        }
        return new SetIterator(this, "entries");
    };
    Object.defineProperty(Set2.prototype, "size", {
        configurable: true,
        get: function get() {
            if (this === null || typeof this !== "object" || this._values === void 0) {
                throw new TypeError("get Set.prototype.size called on incompatible receiver");
            }
            return this._values.length - this._holes;
        }
    });
    try {
        try {
            Object.defineProperty(Object.getOwnPropertyDescriptor(Set2.prototype, "size").get, "name", {
                value: "get size",
                configurable: true
            });
        } catch (e) {}
    } catch (e) {}
    if (hasSymbol2) {
        Object.defineProperty(Set2.prototype, Symbol.iterator, {
            value: Set2.prototype.values,
            writable: true,
            enumerable: false,
            configurable: true
        });
        if (Symbol.toStringTag) {
            Object.defineProperty(Set2.prototype, Symbol.toStringTag, {
                value: "Set",
                writable: false,
                enumerable: false,
                configurable: true
            });
        }
    }
    var setMethods = [
        [
            "add",
            1
        ],
        [
            "has",
            1
        ],
        [
            "delete",
            1
        ],
        [
            "clear",
            0
        ],
        [
            "forEach",
            1
        ],
        [
            "values",
            0
        ],
        [
            "entries",
            0
        ]
    ];
    for(var i3 = 0; i3 < setMethods.length; i3++){
        var name1 = setMethods[i3][0];
        var fn1 = Set2.prototype[name1];
        try {
            Object.defineProperty(fn1, "name", {
                value: name1,
                configurable: true
            });
        } catch (e) {}
        Object.defineProperty(Set2.prototype, name1, {
            value: fn1,
            writable: true,
            enumerable: false,
            configurable: true
        });
    }
    Object.defineProperty(Set2.prototype, "keys", {
        value: Set2.prototype.values,
        writable: true,
        enumerable: false,
        configurable: true
    });
    try {
        Object.defineProperty(SetIterator.prototype.next, "name", {
            value: "next",
            configurable: true
        });
    } catch (e) {}
    Object.defineProperty(SetIterator.prototype, "next", {
        value: SetIterator.prototype.next,
        writable: true,
        enumerable: false,
        configurable: true
    });
    if (typeof Symbol !== "undefined" && Symbol.species) {
        var speciesGetter1 = function speciesGetter() {
            return this;
        };
        try {
            Object.defineProperty(speciesGetter1, "name", {
                value: "get [Symbol.species]",
                configurable: true
            });
        } catch (e) {}
        Object.defineProperty(Set2, Symbol.species, {
            get: speciesGetter1,
            enumerable: false,
            configurable: true
        });
    }
    if (hasSymbol2 && Symbol.toStringTag) {
        Object.defineProperty(SetIterator.prototype, Symbol.toStringTag, {
            value: "Set Iterator",
            writable: false,
            enumerable: false,
            configurable: true
        });
    }
    var nativeUnusable2 = function nativeUnusable2() {
        try {
            var Native = window.Set;
            if (typeof Native !== "function") return true;
            var proto2 = Native.prototype;
            var names = [
                "add",
                "has",
                "delete",
                "clear",
                "forEach",
                "keys",
                "values",
                "entries"
            ];
            for(var i = 0; i < names.length; i++)if (typeof proto2[names[i]] !== "function") return true;
            new Native().entries().next();
            return false;
        } catch (e) {
            return true;
        }
    };
    var installSetPolyfill = function installSetPolyfill() {
        if (!nativeUnusable2()) return;
        window.Set = null;
        delete window.Set;
        define(window, "Set", Set2);
    };
    var installSetExtensionsOnNative = function installSetExtensionsOnNative() {
        var Native = window.Set;
        if (typeof Native !== "function" || Native === Set2) return;
        var proto2 = Native.prototype;
        var tag = typeof Symbol !== "undefined" ? Symbol.toStringTag : void 0;
        if (tag) {
            try {
                if (!Object.prototype.hasOwnProperty.call(proto2, tag)) Object.defineProperty(proto2, tag, {
                    value: "Set",
                    writable: false,
                    enumerable: false,
                    configurable: true
                });
                var iterProto = Object.getPrototypeOf(new Native().values());
                if (!Object.prototype.hasOwnProperty.call(iterProto, tag)) Object.defineProperty(iterProto, tag, {
                    value: "Set Iterator",
                    writable: false,
                    enumerable: false,
                    configurable: true
                });
            } catch (e) {}
        }
        var species = typeof Symbol !== "undefined" ? Symbol.species : void 0;
        if (species && !Object.prototype.hasOwnProperty.call(Native, species)) {
            var speciesGetter = function speciesGetter() {
                return this;
            };
            try {
                Object.defineProperty(speciesGetter, "name", {
                    value: "get [Symbol.species]",
                    configurable: true
                });
            } catch (e) {}
            try {
                Object.defineProperty(Native, species, {
                    get: speciesGetter,
                    enumerable: false,
                    configurable: true
                });
            } catch (e) {}
        }
        var nativeAdder = proto2.add;
        var storesNegativeZero = false;
        var lookupMissesZero = false;
        var hasntChaining = false;
        try {
            var probe = new Native();
            hasntChaining = nativeAdder.call(probe, -0) !== probe;
            probe.forEach(function() {
                var k = arguments[0];
                if (k === 0 && 1 / k < 0) storesNegativeZero = true;
            });
            var zero2 = new Native();
            nativeAdder.call(zero2, 0);
            lookupMissesZero = !zero2.has(-0);
        } catch (e) {
            return;
        }
        if (storesNegativeZero || hasntChaining) define(proto2, "add", function add(value) {
            nativeAdder.call(this, value === 0 ? 0 : value);
            return this;
        });
        if (lookupMissesZero) {
            var _loop = function(i) {
                var nativeLookup = proto2[names[i]];
                define(proto2, names[i], function(key) {
                    return nativeLookup.call(this, key === 0 ? 0 : key);
                });
            };
            var names = [
                "has",
                "delete"
            ];
            for(var i = 0; i < names.length; i++)_loop(i);
        }
        if (!nativeAcceptsIterables2(Native)) wrapNativeConstructor2(Native);
    };
    var nativeAcceptsIterables2 = function nativeAcceptsIterables2(Native) {
        try {
            if (!new Native([
                1
            ]).has(1)) return false;
            var key = typeof Symbol !== "undefined" ? Symbol.iterator : void 0;
            if (typeof key !== "symbol") return true;
            var R = typeof Reflect !== "undefined" ? Reflect : void 0;
            if (!R || typeof R.construct !== "function") return false;
            var closed = false;
            var STOP8 = {};
            var Sub = function Sub() {};
            Sub.prototype = Object.create(Native.prototype);
            Sub.prototype.add = function() {
                throw STOP8;
            };
            var bad = {};
            bad[key] = function() {
                return {
                    next: function next() {
                        return {
                            done: false,
                            value: 1
                        };
                    },
                    "return": function() {
                        closed = true;
                        return {};
                    }
                };
            };
            try {
                R.construct(Native, [
                    bad
                ], Sub);
            } catch (e) {
                return e === STOP8 && closed;
            }
            return false;
        } catch (e) {
            return false;
        }
    };
    var wrapNativeConstructor2 = function wrapNativeConstructor2(Native) {
        var proto2 = Native.prototype;
        var getProto3 = Object.getPrototypeOf;
        var Wrapped = function Set3() {
            if (!(this instanceof Wrapped)) throw new TypeError("Constructor Set requires 'new'");
            var that = new Native();
            var own4 = getProto3(this);
            if (own4 !== proto2) {
                if (typeof Object.setPrototypeOf === "function") Object.setPrototypeOf(that, own4);
                else that.__proto__ = own4;
            }
            var iterable = arguments.length > 0 ? arguments[0] : void 0;
            if (iterable !== null && iterable !== void 0) addValues(that, iterable);
            return that;
        };
        Wrapped.prototype = proto2;
        Object.defineProperty(proto2, "constructor", {
            value: Wrapped,
            writable: true,
            enumerable: false,
            configurable: true
        });
        var names = Object.getOwnPropertyNames(Native);
        if (typeof Object.getOwnPropertySymbols === "function") {
            var symbols = Object.getOwnPropertySymbols(Native);
            for(var i = 0; i < symbols.length; i++)names.push(symbols[i]);
        }
        for(var i1 = 0; i1 < names.length; i1++){
            var name = names[i1];
            if (name === "prototype" || name === "length" || name === "name" || name === "arguments" || name === "caller") continue;
            var d = Object.getOwnPropertyDescriptor(Native, name);
            if (d) Object.defineProperty(Wrapped, name, d);
        }
        window.Set = null;
        delete window.Set;
        define(window, "Set", Wrapped);
    };
    var install5 = function install5() {
        installSetPolyfill();
        installSetExtensionsOnNative();
    };
    Object.defineProperty(Set2.prototype, "_holes", {
        value: 0,
        writable: true,
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Set2.prototype, "_epoch", {
        value: 0,
        writable: true,
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Set2.prototype, "_remap", {
        value: 0,
        writable: true,
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Set2.prototype, "_si", {
        value: 0,
        writable: true,
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Set2.prototype, "_ni", {
        value: 0,
        writable: true,
        enumerable: false,
        configurable: true
    });
    // src/modules/es.weak-map.ts
    var isSupported6 = function isSupported6() {
        try {
            var WeakMap3 = window.WeakMap;
            if (typeof WeakMap3 !== "function") {
                return false;
            }
            var weakMap = new WeakMap3();
            if (Object.prototype.toString.call(weakMap) !== "[object WeakMap]") {
                return false;
            }
            var key = {};
            weakMap.set(key, 1);
            if (weakMap.get(key) !== 1 || weakMap.has(key) !== true) {
                return false;
            }
            if (weakMap.delete(key) !== true || weakMap.has(key) !== false) {
                return false;
            }
            try {
                weakMap.set("x", 1);
                return false;
            } catch (unused) {}
            return true;
        } catch (unused) {
            return false;
        }
    };
    var hasSymbol3 = typeof Symbol !== "undefined" && Symbol.toStringTag != null;
    var iteratorKey = typeof Symbol !== "undefined" ? Symbol.iterator : void 0;
    var hasOwn3 = Object.prototype.hasOwnProperty;
    var counter = 0;
    var SLOT4 = {
        value: void 0,
        writable: true,
        enumerable: false,
        configurable: true
    };
    var isRegisteredSymbol = function isRegisteredSymbol(value) {
        try {
            return Symbol.keyFor(value) !== void 0;
        } catch (e) {
            return false;
        }
    };
    var symbolIndex = function symbolIndex(self, key) {
        var keys3 = self._skeys;
        if (keys3 === void 0) return -1;
        for(var i = 0; i < keys3.length; i++)if (keys3[i] === key) return i;
        return -1;
    };
    var closeIterator3 = function closeIterator3(iterator) {
        try {
            var ret = iterator["return"];
            if (ret !== void 0 && ret !== null) ret.call(iterator);
        } catch (e) {}
    };
    var arrayIterAtLoad3 = iteratorKey ? Array.prototype[iteratorKey] : void 0;
    var WeakMap2 = function WeakMap21() {
        if (!(this instanceof WeakMap2)) {
            throw new TypeError("Constructor WeakMap requires 'new'");
        }
        counter++;
        SLOT4.value = "__wm$".concat(counter, "$").concat(Math.random().toString(36).substring(2));
        Object.defineProperty(this, "_id", SLOT4);
        SLOT4.value = void 0;
        var iterable = arguments.length > 0 ? arguments[0] : void 0;
        if (iterable === null || iterable === void 0) {
            return;
        }
        var adder = this.set;
        if (typeof adder !== "function") {
            throw new TypeError("WeakMap constructor: this.set is not a function");
        }
        if (Array.isArray(iterable) && (!iteratorKey || iterable[iteratorKey] === arrayIterAtLoad3 && Array.prototype[iteratorKey] === arrayIterAtLoad3)) {
            for(var i = 0; i < iterable.length; i++){
                var item = iterable[i];
                if (item === null || typeof item !== "object" && typeof item !== "function") throw new TypeError("Iterator value is not an entry object");
                adder.call(this, item[0], item[1]);
            }
            return;
        }
        var method = iteratorKey ? iterable[iteratorKey] : void 0;
        if (typeof method !== "function") {
            throw new TypeError("WeakMap constructor argument is not iterable");
        }
        var iterator = method.call(iterable);
        if (iterator === null || typeof iterator !== "object" && typeof iterator !== "function") throw new TypeError("Result of the Symbol.iterator method is not an object");
        var next8 = iterator.next;
        for(;;){
            var step = next8.call(iterator);
            if (step === null || typeof step !== "object" && typeof step !== "function") throw new TypeError("Iterator result is not an object");
            if (step.done) return;
            var item1 = step.value;
            try {
                if (item1 === null || typeof item1 !== "object" && typeof item1 !== "function") throw new TypeError("Iterator value is not an entry object");
                adder.call(this, item1[0], item1[1]);
            } catch (error) {
                closeIterator3(iterator);
                throw error;
            }
        }
    };
    var SET_SLOT = {
        value: void 0,
        writable: true,
        enumerable: false,
        configurable: true
    };
    WeakMap2.prototype.set = function(key, value) {
        if (this === null || typeof this !== "object" || this._id === void 0) {
            throw new TypeError("Method WeakMap.prototype.set called on incompatible receiver");
        }
        if (key === null || typeof key !== "object" && typeof key !== "function") {
            if (typeof key !== "symbol" || isRegisteredSymbol(key)) throw new TypeError("Invalid value used as weak map key");
        }
        if (typeof key === "symbol") {
            var at2 = symbolIndex(this, key);
            if (at2 !== -1) {
                this._svals[at2] = value;
            } else {
                if (this._skeys === void 0) {
                    SLOT4.value = [];
                    Object.defineProperty(this, "_skeys", SLOT4);
                    SLOT4.value = [];
                    Object.defineProperty(this, "_svals", SLOT4);
                    SLOT4.value = void 0;
                }
                this._skeys.push(key);
                this._svals.push(value);
            }
            return this;
        }
        var id = this._id;
        if (hasOwn3.call(key, id)) {
            key[id] = value;
            return this;
        }
        if (!Object.isExtensible(key)) {
            console.warn("[spackle] WeakMap: frozen / non-extensible keys are not supported by the hidden-property strategy \u2014 this set() will throw");
            throw new TypeError("Cannot add a WeakMap entry to a non-extensible key");
        }
        SET_SLOT.value = value;
        Object.defineProperty(key, id, SET_SLOT);
        SET_SLOT.value = void 0;
        return this;
    };
    WeakMap2.prototype.get = function(key) {
        if (this === null || typeof this !== "object" || this._id === void 0) {
            throw new TypeError("Method WeakMap.prototype.get called on incompatible receiver");
        }
        if (typeof key === "symbol") {
            var at2 = symbolIndex(this, key);
            return at2 === -1 ? void 0 : this._svals[at2];
        }
        if (key === null || typeof key !== "object" && typeof key !== "function" || !hasOwn3.call(key, this._id)) {
            return void 0;
        }
        return key[this._id];
    };
    WeakMap2.prototype.has = function(key) {
        if (this === null || typeof this !== "object" || this._id === void 0) {
            throw new TypeError("Method WeakMap.prototype.has called on incompatible receiver");
        }
        if (typeof key === "symbol") return symbolIndex(this, key) !== -1;
        return key !== null && (typeof key === "object" || typeof key === "function") && hasOwn3.call(key, this._id);
    };
    WeakMap2.prototype.delete = function(key) {
        if (this === null || typeof this !== "object" || this._id === void 0) {
            throw new TypeError("Method WeakMap.prototype.delete called on incompatible receiver");
        }
        if (typeof key === "symbol") {
            var at2 = symbolIndex(this, key);
            if (at2 === -1) return false;
            this._skeys.splice(at2, 1);
            this._svals.splice(at2, 1);
            return true;
        }
        if (key === null || typeof key !== "object" && typeof key !== "function" || !hasOwn3.call(key, this._id)) {
            return false;
        }
        delete key[this._id];
        return true;
    };
    var weakMapMethods = [
        "set",
        "get",
        "has",
        "delete"
    ];
    for(var i4 = 0; i4 < weakMapMethods.length; i4++){
        var fn2 = WeakMap2.prototype[weakMapMethods[i4]];
        try {
            Object.defineProperty(fn2, "name", {
                value: weakMapMethods[i4],
                configurable: true
            });
        } catch (e) {}
        Object.defineProperty(WeakMap2.prototype, weakMapMethods[i4], {
            value: fn2,
            writable: true,
            enumerable: false,
            configurable: true
        });
    }
    if (hasSymbol3) {
        Object.defineProperty(WeakMap2.prototype, Symbol.toStringTag, {
            value: "WeakMap",
            writable: false,
            enumerable: false,
            configurable: true
        });
    }
    var installWeakMapPolyfill = function installWeakMapPolyfill() {
        if (!isSupported6()) {
            window.WeakMap = null;
            delete window.WeakMap;
            define(window, "WeakMap", WeakMap2);
        }
    };
    var nativeClosesIteratorWeakMap = function nativeClosesIteratorWeakMap(Native) {
        var key = typeof Symbol !== "undefined" ? Symbol.iterator : void 0;
        if (typeof key !== "symbol") return true;
        var closed = false;
        var steps = 0;
        var bad = {};
        bad[key] = function() {
            return {
                // one rejected item, then done: a native that accepts it can't loop forever
                next: function next() {
                    return steps++ ? {
                        done: true,
                        value: void 0
                    } : {
                        done: false,
                        value: 1
                    };
                },
                "return": function() {
                    closed = true;
                    return {};
                }
            };
        };
        try {
            new Native(bad);
        } catch (e) {
            return closed;
        }
        return true;
    };
    var wrapNativeWeakMap = function wrapNativeWeakMap(Native) {
        var proto2 = Native.prototype;
        var getProto3 = Object.getPrototypeOf;
        var Wrapped = function Wrapped1() {
            if (!(this instanceof Wrapped)) throw new TypeError("Constructor WeakMap requires 'new'");
            var that = new Native();
            var own4 = getProto3(this);
            if (own4 !== proto2) {
                if (typeof Object.setPrototypeOf === "function") Object.setPrototypeOf(that, own4);
                else that.__proto__ = own4;
            }
            var iterable = arguments.length > 0 ? arguments[0] : void 0;
            if (iterable === null || iterable === void 0) return that;
            var adder = that.set;
            if (typeof adder !== "function") throw new TypeError("WeakMap constructor: this.set is not a function");
            var method = iterable[Symbol.iterator];
            if (typeof method !== "function") throw new TypeError("WeakMap constructor argument is not iterable");
            var iterator = method.call(iterable);
            if (iterator === null || typeof iterator !== "object" && typeof iterator !== "function") {
                throw new TypeError("Result of the Symbol.iterator method is not an object");
            }
            var next8 = iterator.next;
            for(;;){
                var step = next8.call(iterator);
                if (step === null || typeof step !== "object" && typeof step !== "function") {
                    throw new TypeError("Iterator result is not an object");
                }
                if (step.done) return that;
                var item = step.value;
                try {
                    if (item === null || typeof item !== "object" && typeof item !== "function") {
                        throw new TypeError("Iterator value is not an entry object");
                    }
                    adder.call(that, item[0], item[1]);
                } catch (error) {
                    try {
                        var ret = iterator["return"];
                        if (ret !== void 0 && ret !== null) ret.call(iterator);
                    } catch (e) {}
                    throw error;
                }
            }
        };
        try {
            Object.defineProperty(Wrapped, "name", {
                value: "WeakMap",
                configurable: true
            });
        } catch (e) {}
        Wrapped.prototype = proto2;
        Object.defineProperty(proto2, "constructor", {
            value: Wrapped,
            writable: true,
            enumerable: false,
            configurable: true
        });
        window.WeakMap = null;
        delete window.WeakMap;
        define(window, "WeakMap", Wrapped);
    };
    var install6 = function install6() {
        installWeakMapPolyfill();
        var Native = window.WeakMap;
        var tag = typeof Symbol !== "undefined" ? Symbol.toStringTag : void 0;
        if (tag && typeof Native === "function" && Native !== WeakMap2) {
            try {
                if (!Object.prototype.hasOwnProperty.call(Native.prototype, tag)) Object.defineProperty(Native.prototype, tag, {
                    value: "WeakMap",
                    writable: false,
                    enumerable: false,
                    configurable: true
                });
            } catch (e) {}
        }
        if (typeof Native === "function" && Native !== WeakMap2 && !nativeClosesIteratorWeakMap(Native)) wrapNativeWeakMap(Native);
    };
    // src/modules/es.promise.ts
    var isSupported7 = function isSupported7() {
        try {
            if (typeof Promise !== "function" || typeof Promise.prototype.then !== "function" || typeof Promise.prototype.catch !== "function" || typeof Promise.resolve !== "function" || typeof Promise.reject !== "function") {
                return false;
            }
            if (Promise.__polyfilled === true) {
                return true;
            }
            var w = window;
            if (typeof w.PromiseRejectionEvent !== "function") {
                return false;
            }
            if (/Chrome\/66\./.test(w.navigator && w.navigator.userAgent || "")) {
                return false;
            }
            var chrome = /Chrome\/(\d+)/.exec(w.navigator && w.navigator.userAgent || "");
            if (chrome && +chrome[1] >= 51 && /native code/.test(Function.prototype.toString.call(Promise))) {
                return true;
            }
            var species = typeof Symbol !== "undefined" ? Symbol.species : void 0;
            if (!species) {
                return false;
            }
            var Fake = function Fake(executor) {
                executor(function() {}, function() {});
            };
            var probe = new Promise(function(resolve) {
                resolve(1);
            });
            probe.constructor = {};
            probe.constructor[species] = Fake;
            return probe.then(function() {}) instanceof Fake;
        } catch (unused) {
            return false;
        }
    };
    var hasOwn4 = Object.prototype.hasOwnProperty;
    var isConstructor2 = function isConstructor2(C) {
        return typeof C === "function" && (hasOwn4.call(C, "prototype") || /^bound /.test(C.name || ""));
    };
    var isObject3 = function isObject3(value) {
        return value !== null && (typeof value === "object" || typeof value === "function");
    };
    var PENDING = 0;
    var FULFILLED = 1;
    var REJECTED = 2;
    var HANDLED = 1;
    var UNHANDLED = 2;
    var STATE = "__promiseState";
    var STATE_IS_SYMBOL = false;
    try {
        var key = typeof Symbol === "function" ? /* @__PURE__ */ Symbol("promiseState") : void 0;
        if (typeof key === "symbol") {
            STATE = key;
            STATE_IS_SYMBOL = true;
        }
    } catch (e) {}
    var SLOT5 = {
        value: void 0,
        writable: false,
        enumerable: false,
        configurable: false
    };
    var w0 = typeof window !== "undefined" ? window : {};
    var ArrayProto = Array.prototype;
    var LIST2 = {
        value: void 0,
        writable: true,
        enumerable: true,
        configurable: true
    };
    var NOTIFY = 0;
    var REACTION = 1;
    var THENABLE = 2;
    var jobs = [];
    var jobHead = 0;
    var hostQueueMicrotask = null;
    var enqueueJob = function enqueueJob(kind, a, b, c) {
        jobs.push(kind, a, b, c);
        if (hostQueueMicrotask !== null) hostQueueMicrotask.call(w0, runNextJob);
        else w0.setTimeout(runNextJob, 0);
    };
    var handlerAttributeIsWired = false;
    var dispatchRejectionEvent = function dispatchRejectionEvent(type, promise, reason) {
        var w = window;
        var prevented = false;
        try {
            var doc = w.document;
            if (doc && typeof doc.createEvent === "function" && typeof w.dispatchEvent === "function") {
                var event = doc.createEvent("Event");
                event.initEvent(type, false, true);
                event.promise = promise;
                event.reason = reason;
                prevented = w.dispatchEvent(event) === false;
                var handler = w["on" + type];
                if (!handlerAttributeIsWired && typeof handler === "function") {
                    handler.call(w, event);
                    prevented = prevented || event.defaultPrevented === true;
                }
            } else if (typeof w["on" + type] === "function") {
                w["on" + type]({
                    promise: promise,
                    reason: reason
                });
            }
        } catch (e) {}
        return prevented;
    };
    var reportUnhandledRejection = function reportUnhandledRejection(reason, promise) {
        var prevented = dispatchRejectionEvent("unhandledrejection", promise === void 0 ? null : promise, reason);
        if (!prevented && typeof console !== "undefined" && console.warn) {
            console.warn("Unhandled promise rejection:", reason);
        }
    };
    var pendingRejections = [];
    var rejectionCheckScheduled = false;
    var checkRejections = function checkRejections1() {
        rejectionCheckScheduled = false;
        var count = pendingRejections.length;
        for(var i = 0; i < count; i++){
            var state = pendingRejections[i];
            pendingRejections[i] = void 0;
            if (state.rejection !== HANDLED && !state.parent) {
                reportUnhandledRejection(state.value, state.facade);
                state.rejection = state.rejection !== HANDLED && !state.parent ? UNHANDLED : HANDLED;
            }
        }
        var rest = pendingRejections.length - count;
        for(var i1 = 0; i1 < rest; i1++)pendingRejections[i1] = pendingRejections[count + i1];
        pendingRejections.length = rest;
        if (rest > 0) {
            rejectionCheckScheduled = true;
            w0.setTimeout(checkRejections, 0);
        }
    };
    var onHandleUnhandled = function onHandleUnhandled(state) {
        w0.setTimeout(function() {
            dispatchRejectionEvent("rejectionhandled", state.facade, state.value);
        }, 0);
    };
    var newState = function newState(promise) {
        var state = {
            state: PENDING,
            value: void 0,
            reactions: null,
            notified: false,
            parent: false,
            rejection: 0,
            facade: promise
        };
        if (STATE_IS_SYMBOL) {
            promise[STATE] = state;
        } else {
            SLOT5.value = state;
            Object.defineProperty(promise, STATE, SLOT5);
            SLOT5.value = void 0;
        }
        return state;
    };
    var notify = function notify(state, isReject) {
        if (state.notified) return;
        state.notified = true;
        enqueueJob(NOTIFY, state, isReject, void 0);
    };
    var fulfillState = function fulfillState(state, value) {
        state.value = value;
        state.state = FULFILLED;
        notify(state, false);
    };
    var rejectState = function rejectState(state, reason) {
        state.value = reason;
        state.state = REJECTED;
        notify(state, true);
    };
    var THREW = {};
    var thenError;
    var getThen = function getThen(value) {
        try {
            return value.then;
        } catch (error) {
            thenError = error;
            return THREW;
        }
    };
    var resolveState = function resolveState(state, value) {
        if (value === state.facade) {
            rejectState(state, new TypeError("Promise can't be resolved itself"));
            return;
        }
        if (value === null || typeof value !== "object" && typeof value !== "function") {
            fulfillState(state, value);
            return;
        }
        var then2 = getThen(value);
        if (then2 === THREW) {
            var error = thenError;
            thenError = void 0;
            rejectState(state, error);
        } else if (typeof then2 === "function") {
            enqueueJob(THENABLE, state, value, then2);
        } else {
            fulfillState(state, value);
        }
    };
    var callThen = function callThen(then2, thenable, resolveFn, rejectFn) {
        try {
            then2.call(thenable, resolveFn, rejectFn);
        } catch (error) {
            rejectFn(error);
        }
    };
    var resolveThenable = function resolveThenable(state, thenable, then2) {
        var done = false;
        callThen(then2, thenable, function(value) {
            if (done) return;
            done = true;
            resolveState(state, value);
        }, function(reason) {
            if (done) return;
            done = true;
            rejectState(state, reason);
        });
    };
    var handlerThrew = false;
    var callHandler = function callHandler(handler, value) {
        try {
            return handler(value);
        } catch (error) {
            handlerThrew = true;
            return error;
        }
    };
    var callReaction = function callReaction(reaction, state) {
        var ok = state.state === FULFILLED;
        var record = reaction.record;
        if (record !== null) {
            var capability = record.capability;
            if (!ok) {
                if (state.rejection === UNHANDLED) onHandleUnhandled(state);
                state.rejection = HANDLED;
                capability.reject(state.value);
            } else if (record.race) {
                capability.resolve(state.value);
            } else {
                var values4 = record.values;
                var index = reaction.index;
                if (index in ArrayProto) {
                    LIST2.value = state.value;
                    Object.defineProperty(values4, index, LIST2);
                    LIST2.value = void 0;
                } else {
                    values4[index] = state.value;
                }
                if (--record.remaining === 0) capability.resolve(values4);
            }
            return;
        }
        var handler = ok ? reaction.ok : reaction.fail;
        var value = state.value;
        var threw = !ok;
        if (handler !== false) {
            if (!ok) {
                if (state.rejection === UNHANDLED) onHandleUnhandled(state);
                state.rejection = HANDLED;
            }
            handlerThrew = false;
            value = callHandler(handler, value);
            threw = handlerThrew;
            handlerThrew = false;
        }
        var target = reaction.target;
        if (target !== null) {
            if (threw) rejectState(target, value);
            else resolveState(target, value);
        } else if (threw) {
            reaction.reject(value);
        } else {
            reaction.resolve(value);
        }
    };
    var runNextJob = function runNextJob() {
        var kind = jobs[jobHead];
        var a = jobs[jobHead + 1];
        var b = jobs[jobHead + 2];
        var c = jobs[jobHead + 3];
        jobs[jobHead] = jobs[jobHead + 1] = jobs[jobHead + 2] = jobs[jobHead + 3] = void 0;
        jobHead += 4;
        if (jobHead === jobs.length) {
            jobs.length = 0;
            jobHead = 0;
        } else if (jobHead > 4096) {
            var rest = jobs.length - jobHead;
            for(var i = 0; i < rest; i++)jobs[i] = jobs[jobHead + i];
            jobs.length = rest;
            jobHead = 0;
        }
        if (kind === NOTIFY) {
            var reactions = a.reactions;
            a.reactions = null;
            a.notified = false;
            if (reactions !== null) {
                if (reactions.length === void 0) callReaction(reactions, a);
                else for(var i1 = 0; i1 < reactions.length; i1++)callReaction(reactions[i1], a);
            }
            if (b && !a.rejection) {
                pendingRejections[pendingRejections.length] = a;
                if (!rejectionCheckScheduled) {
                    rejectionCheckScheduled = true;
                    w0.setTimeout(checkRejections, 0);
                }
            }
        } else if (kind === REACTION) {
            callReaction(a, b);
        } else {
            resolveThenable(a, b, c);
        }
    };
    var runExecutor = function runExecutor(executor, resolveFn, rejectFn) {
        try {
            executor(resolveFn, rejectFn);
        } catch (error) {
            rejectFn(error);
        }
    };
    var PromisePolyfill = function Promise2(executor) {
        if (!(this instanceof PromisePolyfill)) {
            throw new TypeError("Promise constructor cannot be invoked without 'new'");
        }
        if (typeof executor !== "function") {
            throw new TypeError("Promise resolver " + (isObject3(executor) ? "is not a function" : String(executor) + " is not a function"));
        }
        var state = newState(this);
        var done = false;
        runExecutor(executor, function(value) {
            if (done) return;
            done = true;
            resolveState(state, value);
        }, function(reason) {
            if (done) return;
            done = true;
            rejectState(state, reason);
        });
    };
    var PromisePrototype = PromisePolyfill.prototype;
    var Internal = function Promise3() {};
    Internal.prototype = PromisePrototype;
    var newPromiseCapability = function newPromiseCapability(C) {
        if (C === PromisePolyfill) {
            var promise = new Internal();
            var state = newState(promise);
            var done = false;
            var capability2 = {
                promise: promise,
                resolve: void 0,
                reject: void 0
            };
            capability2.resolve = function(value) {
                if (done) return;
                done = true;
                resolveState(state, value);
            };
            capability2.reject = function(reason) {
                if (done) return;
                done = true;
                rejectState(state, reason);
            };
            return capability2;
        }
        if (!isConstructor2(C)) throw new TypeError("Promise capability: not a constructor");
        var capability = {
            promise: void 0,
            resolve: void 0,
            reject: void 0
        };
        var executor = function executor(resolveFn, rejectFn) {
            if (capability.resolve !== void 0 || capability.reject !== void 0) {
                throw new TypeError("Promise executor has already been invoked with non-undefined arguments");
            }
            capability.resolve = resolveFn;
            capability.reject = rejectFn;
        };
        capability.promise = new C(executor);
        if (typeof capability.resolve !== "function") throw new TypeError("Promise resolve function is not callable");
        if (typeof capability.reject !== "function") throw new TypeError("Promise reject function is not callable");
        return capability;
    };
    var promiseThen = function then(onFulfilled, onRejected) {
        var promise = this;
        var state = promise !== null && promise !== void 0 ? promise[STATE] : void 0;
        if (state === void 0 || state === null || state.facade !== promise) {
            throw new TypeError("Method Promise.prototype.then called on incompatible receiver " + String(promise));
        }
        var C = promise.constructor;
        if (C === void 0) {
            C = PromisePolyfill;
        } else {
            if (!isObject3(C)) throw new TypeError("Promise constructor is not an object");
            var speciesKey = typeof Symbol !== "undefined" ? Symbol.species : void 0;
            var S = speciesKey ? C[speciesKey] : void 0;
            if (S === void 0 || S === null) C = PromisePolyfill;
            else if (isConstructor2(S)) C = S;
            else throw new TypeError("Promise @@species is not a constructor");
        }
        var ok = typeof onFulfilled === "function" ? onFulfilled : false;
        var fail = typeof onRejected === "function" ? onRejected : false;
        var reaction;
        if (C === PromisePolyfill) {
            var child = new Internal();
            reaction = {
                ok: ok,
                fail: fail,
                target: newState(child),
                resolve: null,
                reject: null,
                promise: child,
                record: null,
                index: 0
            };
        } else {
            var capability = newPromiseCapability(C);
            reaction = {
                ok: ok,
                fail: fail,
                target: null,
                resolve: capability.resolve,
                reject: capability.reject,
                promise: capability.promise,
                record: null,
                index: 0
            };
        }
        state.parent = true;
        if (state.state === PENDING) {
            var reactions = state.reactions;
            if (reactions === null) state.reactions = reaction;
            else if (reactions.length === void 0) state.reactions = [
                reactions,
                reaction
            ];
            else reactions.push(reaction);
        } else {
            enqueueJob(REACTION, reaction, state, void 0);
        }
        return reaction.promise;
    };
    var promiseCatch = function promiseCatch(onRejected) {
        return this.then(void 0, onRejected);
    };
    var staticResolve = function staticResolve(value) {
        var C = this;
        if (!isObject3(C)) throw new TypeError("Promise.resolve called on non-object");
        if (isObject3(value)) {
            var own4 = value[STATE];
            if (own4 !== void 0 && own4 !== null && own4.facade === value && value.constructor === C) return value;
        }
        if (C === PromisePolyfill) {
            var promise = new Internal();
            resolveState(newState(promise), value);
            return promise;
        }
        var capability = newPromiseCapability(C);
        capability.resolve(value);
        return capability.promise;
    };
    var staticReject = function staticReject(reason) {
        var C = this;
        if (C === PromisePolyfill) {
            var promise = new Internal();
            rejectState(newState(promise), reason);
            return promise;
        }
        var capability = newPromiseCapability(C);
        capability.reject(reason);
        return capability.promise;
    };
    var closeIterator4 = function closeIterator4(iterator) {
        try {
            var ret = iterator["return"];
            if (ret !== void 0 && ret !== null) ret.call(iterator);
        } catch (e) {}
    };
    var allElement = function allElement(record, index) {
        var alreadyCalled = false;
        return function(x) {
            if (alreadyCalled) return;
            alreadyCalled = true;
            var values4 = record.values;
            if (index in ArrayProto) {
                LIST2.value = x;
                Object.defineProperty(values4, index, LIST2);
                LIST2.value = void 0;
            } else {
                values4[index] = x;
            }
            if (--record.remaining === 0) record.capability.resolve(values4);
        };
    };
    var combinator = function combinator(C, iterable, race) {
        var capability = newPromiseCapability(C);
        var iterator = null;
        var iteratorOpen = false;
        try {
            var promiseResolveFn = C.resolve;
            if (typeof promiseResolveFn !== "function") throw new TypeError("Promise resolve is not callable");
            if (iterable === null || iterable === void 0) throw new TypeError(String(iterable) + " is not iterable");
            var iteratorKey4 = typeof Symbol !== "undefined" ? Symbol.iterator : void 0;
            var method = iteratorKey4 ? iterable[iteratorKey4] : void 0;
            var next8 = null;
            var arrayLike = null;
            if (typeof method === "function") {
                iterator = method.call(iterable);
                if (!isObject3(iterator)) throw new TypeError("Result of the Symbol.iterator method is not an object");
                next8 = iterator.next;
            } else if (!iteratorKey4 && typeof iterable.length === "number") {
                arrayLike = iterable;
            } else {
                throw new TypeError("object is not iterable");
            }
            var values4 = [];
            var record = {
                values: values4,
                remaining: 1,
                capability: capability,
                race: race
            };
            var fast2 = C === PromisePolyfill && promiseResolveFn === staticResolve;
            var index = 0;
            for(;;){
                var value = void 0;
                if (arrayLike !== null) {
                    if (index >= arrayLike.length) break;
                    value = arrayLike[index];
                } else {
                    iteratorOpen = false;
                    var result = next8.call(iterator);
                    if (!isObject3(result)) throw new TypeError("Iterator result " + String(result) + " is not an object");
                    if (result.done) break;
                    value = result.value;
                    iteratorOpen = true;
                }
                var nextPromise = promiseResolveFn.call(C, value);
                if (!race) {
                    if (index in ArrayProto) Object.defineProperty(values4, index, LIST2);
                    else values4[index] = void 0;
                    record.remaining++;
                }
                var elementState = fast2 ? nextPromise[STATE] : void 0;
                var then2 = nextPromise.then;
                if (elementState !== void 0 && elementState !== null && elementState.facade === nextPromise && then2 === promiseThen) {
                    var reaction = {
                        ok: false,
                        fail: false,
                        target: null,
                        resolve: null,
                        reject: null,
                        promise: null,
                        record: record,
                        index: index
                    };
                    elementState.parent = true;
                    if (elementState.state === PENDING) {
                        var reactions = elementState.reactions;
                        if (reactions === null) elementState.reactions = reaction;
                        else if (reactions.length === void 0) elementState.reactions = [
                            reactions,
                            reaction
                        ];
                        else reactions.push(reaction);
                    } else {
                        enqueueJob(REACTION, reaction, elementState, void 0);
                    }
                } else if (race) {
                    then2.call(nextPromise, capability.resolve, capability.reject);
                } else {
                    then2.call(nextPromise, allElement(record, index), capability.reject);
                }
                index++;
            }
            iteratorOpen = false;
            if (!race && --record.remaining === 0) capability.resolve(values4);
        } catch (error) {
            if (iteratorOpen) closeIterator4(iterator);
            capability.reject(error);
        }
        return capability.promise;
    };
    var staticAll = function staticAll(iterable) {
        return combinator(this, iterable, false);
    };
    var staticRace = function staticRace(iterable) {
        return combinator(this, iterable, true);
    };
    define(PromisePrototype, "then", promiseThen);
    define(PromisePrototype, "catch", promiseCatch);
    define(PromisePolyfill, "resolve", staticResolve);
    define(PromisePolyfill, "reject", staticReject);
    define(PromisePolyfill, "all", staticAll);
    define(PromisePolyfill, "race", staticRace);
    Object.defineProperty(PromisePolyfill, "prototype", {
        writable: false
    });
    var adoptNative = function adoptNative(Native) {
        var NativePrototype = Native.prototype;
        if (!NativePrototype || NativePrototype === Object.prototype || NativePrototype === PromisePrototype) return;
        try {
            var nativeThen2 = NativePrototype.then;
            var subclassing = false;
            var speciesKey = typeof Symbol !== "undefined" ? Symbol.species : void 0;
            if (speciesKey) {
                try {
                    var Fake = function Fake(executor) {
                        executor(function() {}, function() {});
                    };
                    var probe = new Native(function(resolveFn) {
                        resolveFn(1);
                    });
                    probe.constructor = {};
                    probe.constructor[speciesKey] = Fake;
                    subclassing = nativeThen2.call(probe, function() {}) instanceof Fake;
                } catch (e) {
                    subclassing = false;
                }
            }
            if (!subclassing && typeof nativeThen2 === "function") {
                define(NativePrototype, "then", function then2(onFulfilled, onRejected) {
                    var that = this;
                    return new PromisePolyfill(function(resolveFn, rejectFn) {
                        nativeThen2.call(that, resolveFn, rejectFn);
                    }).then(onFulfilled, onRejected);
                });
            }
            delete NativePrototype.constructor;
            if (typeof Object.setPrototypeOf === "function") Object.setPrototypeOf(NativePrototype, PromisePrototype);
            else NativePrototype.__proto__ = PromisePrototype;
        } catch (e) {}
    };
    var install7 = function install7() {
        var w = window;
        if (typeof w.queueMicrotask === "function") hostQueueMicrotask = w.queueMicrotask;
        handlerAttributeIsWired = "onunhandledrejection" in w;
        var species = typeof Symbol === "function" ? Symbol.species : void 0;
        if (species && !hasOwn4.call(PromisePolyfill, species)) {
            Object.defineProperty(PromisePolyfill, species, {
                get: function get() {
                    return this;
                },
                enumerable: false,
                configurable: true
            });
        }
        var toStringTag = typeof Symbol === "function" ? Symbol.toStringTag : void 0;
        if (toStringTag && !hasOwn4.call(PromisePrototype, toStringTag)) {
            Object.defineProperty(PromisePrototype, toStringTag, {
                value: "Promise",
                writable: false,
                enumerable: false,
                configurable: true
            });
        }
        var Native = w.Promise;
        if (typeof Native === "function" && Native !== PromisePolyfill && !isSupported7()) adoptNative(Native);
        w.Promise = null;
        delete w.Promise;
        define(w, "Promise", PromisePolyfill);
    };
    // src/modules/install-disposable.ts
    var ensureSymbol = function ensureSymbol(name) {
        if (typeof Symbol === "undefined") {
            return void 0;
        }
        var existing = Symbol[name];
        if (existing !== void 0) {
            return existing;
        }
        try {
            Object.defineProperty(Symbol, name, {
                value: /* @__PURE__ */ Symbol("Symbol." + name)
            });
        } catch (unused) {
            return void 0;
        }
        return Symbol[name];
    };
    var def = function def(target, key, value) {
        if (typeof value === "function" && typeof key === "string" && key !== "constructor") {
            try {
                Object.defineProperty(value, "name", {
                    value: key,
                    configurable: true
                });
            } catch (e) {}
        }
        Object.defineProperty(target, key, {
            value: value,
            writable: true,
            enumerable: false,
            configurable: true
        });
    };
    var SuppressedError = function SuppressedError1(error, suppressed, message) {
        var self = this instanceof SuppressedError ? this : Object.create(SuppressedError.prototype);
        if (message !== void 0) {
            if (typeof message === "symbol") {
                throw new TypeError("Cannot convert a Symbol value to a string");
            }
            def(self, "message", String(message));
        }
        def(self, "error", error);
        def(self, "suppressed", suppressed);
        if (typeof Error.captureStackTrace === "function") {
            Error.captureStackTrace(self, SuppressedError);
        } else {
            var stack = new Error().stack;
            if (stack) self.stack = stack;
        }
        return self;
    };
    SuppressedError.prototype = Object.create(Error.prototype);
    def(SuppressedError.prototype, "constructor", SuppressedError);
    def(SuppressedError.prototype, "name", "SuppressedError");
    def(SuppressedError.prototype, "message", "");
    var suppress = function suppress(existing, hasExisting, thrown) {
        return hasExisting ? new SuppressedError(thrown, existing) : thrown;
    };
    var DisposableStack = function DisposableStack1() {
        if (!(this instanceof DisposableStack)) {
            throw new TypeError("Constructor DisposableStack requires 'new'");
        }
        this._brand = "DisposableStack";
        this._stack = [];
        this._disposed = false;
    };
    var disposablestackDisposedGetter = function disposablestackDisposedGetter() {
        if (this === null || typeof this !== "object" || this._brand !== "DisposableStack") {
            throw new TypeError("DisposableStack.prototype.disposed called on incompatible receiver");
        }
        return this._disposed;
    };
    try {
        try {
            Object.defineProperty(disposablestackDisposedGetter, "name", {
                value: "get disposed",
                configurable: true
            });
        } catch (e) {}
    } catch (e) {}
    Object.defineProperty(DisposableStack.prototype, "disposed", {
        configurable: true,
        get: disposablestackDisposedGetter
    });
    def(DisposableStack.prototype, "use", function(value) {
        if (this === null || typeof this !== "object" || this._brand !== "DisposableStack") {
            throw new TypeError("DisposableStack.prototype.use called on incompatible receiver");
        }
        if (this._disposed) throw new ReferenceError("DisposableStack already disposed: use");
        if (value === null || value === void 0) {
            return value;
        }
        var target = Object(value);
        var method = void 0;
        var methodKey = ensureSymbol("dispose");
        if (methodKey !== void 0) {
            var found = target[methodKey];
            if (found !== null && found !== void 0) {
                if (typeof found !== "function") throw new TypeError("dispose method is not callable");
                method = found;
            }
        }
        if (method === void 0) {
            throw new TypeError("value is not disposable");
        }
        this._stack.push(function() {
            method.call(value);
        });
        return value;
    });
    def(DisposableStack.prototype, "adopt", function(value, onDispose) {
        if (this === null || typeof this !== "object" || this._brand !== "DisposableStack") {
            throw new TypeError("DisposableStack.prototype.adopt called on incompatible receiver");
        }
        if (this._disposed) throw new ReferenceError("DisposableStack already disposed: adopt");
        if (typeof onDispose !== "function") {
            throw new TypeError("onDispose is not a function");
        }
        this._stack.push(function() {
            onDispose(value);
        });
        return value;
    });
    def(DisposableStack.prototype, "defer", function(onDispose) {
        if (this === null || typeof this !== "object" || this._brand !== "DisposableStack") {
            throw new TypeError("DisposableStack.prototype.defer called on incompatible receiver");
        }
        if (this._disposed) throw new ReferenceError("DisposableStack already disposed: defer");
        if (typeof onDispose !== "function") {
            throw new TypeError("onDispose is not a function");
        }
        this._stack.push(onDispose);
    });
    def(DisposableStack.prototype, "move", function() {
        if (this === null || typeof this !== "object" || this._brand !== "DisposableStack") {
            throw new TypeError("DisposableStack.prototype.move called on incompatible receiver");
        }
        if (this._disposed) throw new ReferenceError("DisposableStack already disposed: move");
        var moved = new DisposableStack();
        moved._stack = this._stack;
        this._stack = [];
        this._disposed = true;
        return moved;
    });
    def(DisposableStack.prototype, "dispose", function() {
        if (this === null || typeof this !== "object" || this._brand !== "DisposableStack") {
            throw new TypeError("DisposableStack.prototype.dispose called on incompatible receiver");
        }
        if (this._disposed) return;
        this._disposed = true;
        var pending = this._stack;
        this._stack = [];
        var hasError = false;
        var error;
        for(var i = pending.length - 1; i >= 0; i--){
            try {
                pending[i]();
            } catch (thrown) {
                error = suppress(error, hasError, thrown);
                hasError = true;
            }
        }
        if (hasError) throw error;
    });
    var AsyncDisposableStack = function AsyncDisposableStack1() {
        if (!(this instanceof AsyncDisposableStack)) {
            throw new TypeError("Constructor AsyncDisposableStack requires 'new'");
        }
        this._brand = "AsyncDisposableStack";
        this._stack = [];
        this._disposed = false;
    };
    var asyncdisposablestackDisposedGetter = function asyncdisposablestackDisposedGetter() {
        if (this === null || typeof this !== "object" || this._brand !== "AsyncDisposableStack") {
            throw new TypeError("AsyncDisposableStack.prototype.disposed called on incompatible receiver");
        }
        return this._disposed;
    };
    try {
        try {
            Object.defineProperty(asyncdisposablestackDisposedGetter, "name", {
                value: "get disposed",
                configurable: true
            });
        } catch (e) {}
    } catch (e) {}
    Object.defineProperty(AsyncDisposableStack.prototype, "disposed", {
        configurable: true,
        get: asyncdisposablestackDisposedGetter
    });
    def(AsyncDisposableStack.prototype, "use", function(value) {
        if (this === null || typeof this !== "object" || this._brand !== "AsyncDisposableStack") {
            throw new TypeError("AsyncDisposableStack.prototype.use called on incompatible receiver");
        }
        if (this._disposed) throw new ReferenceError("DisposableStack already disposed: use");
        if (value === null || value === void 0) {
            this._stack.push(null);
            return value;
        }
        var boxed = Object(value);
        var method = void 0;
        var methodKey = ensureSymbol("asyncDispose");
        if (methodKey !== void 0) {
            var found = boxed[methodKey];
            if (found !== null && found !== void 0) {
                if (typeof found !== "function") throw new TypeError("dispose method is not callable");
                method = found;
            }
        }
        if (method === void 0) {
            var syncMethod = void 0;
            var syncMethodKey = ensureSymbol("dispose");
            if (syncMethodKey !== void 0) {
                var found1 = boxed[syncMethodKey];
                if (found1 !== null && found1 !== void 0) {
                    if (typeof found1 !== "function") throw new TypeError("dispose method is not callable");
                    syncMethod = found1;
                }
            }
            if (syncMethod !== void 0) {
                this._stack.push(function() {
                    syncMethod.call(value);
                    return void 0;
                });
                return value;
            }
        }
        if (method === void 0) {
            throw new TypeError("value is not async disposable");
        }
        this._stack.push(function() {
            return method.call(value);
        });
        return value;
    });
    def(AsyncDisposableStack.prototype, "adopt", function(value, onDispose) {
        if (this === null || typeof this !== "object" || this._brand !== "AsyncDisposableStack") {
            throw new TypeError("AsyncDisposableStack.prototype.adopt called on incompatible receiver");
        }
        if (this._disposed) throw new ReferenceError("DisposableStack already disposed: adopt");
        if (typeof onDispose !== "function") {
            throw new TypeError("onDispose is not a function");
        }
        this._stack.push(function() {
            return onDispose(value);
        });
        return value;
    });
    def(AsyncDisposableStack.prototype, "defer", function(onDispose) {
        if (this === null || typeof this !== "object" || this._brand !== "AsyncDisposableStack") {
            throw new TypeError("AsyncDisposableStack.prototype.defer called on incompatible receiver");
        }
        if (this._disposed) throw new ReferenceError("DisposableStack already disposed: defer");
        if (typeof onDispose !== "function") {
            throw new TypeError("onDispose is not a function");
        }
        this._stack.push(onDispose);
    });
    def(AsyncDisposableStack.prototype, "move", function() {
        if (this === null || typeof this !== "object" || this._brand !== "AsyncDisposableStack") {
            throw new TypeError("AsyncDisposableStack.prototype.move called on incompatible receiver");
        }
        if (this._disposed) throw new ReferenceError("DisposableStack already disposed: move");
        var moved = new AsyncDisposableStack();
        moved._stack = this._stack;
        this._stack = [];
        this._disposed = true;
        return moved;
    });
    def(AsyncDisposableStack.prototype, "disposeAsync", function() {
        if (typeof Promise === "undefined") {
            throw new TypeError("AsyncDisposableStack requires Promise");
        }
        if (this === null || typeof this !== "object" || this._brand !== "AsyncDisposableStack") {
            return Promise.reject(new TypeError("AsyncDisposableStack.prototype.disposeAsync called on incompatible receiver"));
        }
        if (this._disposed) {
            return Promise.resolve(void 0);
        }
        this._disposed = true;
        var pending = this._stack;
        this._stack = [];
        return new Promise(function(resolve, reject) {
            var index = pending.length - 1;
            var hasError = false;
            var error;
            var needsAwait = false;
            var hasAwaited = false;
            var finish = function finish() {
                if (hasError) reject(error);
                else resolve(void 0);
            };
            var record = function record(thrown) {
                error = suppress(error, hasError, thrown);
                hasError = true;
            };
            var loop = function loop1() {
                while(index >= 0){
                    var disposer = pending[index];
                    pending[index--] = null;
                    if (disposer === null) {
                        needsAwait = true;
                        continue;
                    }
                    var result = void 0;
                    try {
                        result = disposer();
                    } catch (thrown) {
                        record(thrown);
                        continue;
                    }
                    hasAwaited = true;
                    Promise.resolve(result).then(loop, function(thrown) {
                        record(thrown);
                        loop();
                    });
                    return;
                }
                if (needsAwait && !hasAwaited) {
                    needsAwait = false;
                    hasAwaited = true;
                    Promise.resolve(void 0).then(finish);
                    return;
                }
                finish();
            };
            loop();
        });
    });
    var setProto2 = Object.setPrototypeOf || function(target, proto2) {
        target.__proto__ = proto2;
        return target;
    };
    try {
        setProto2(SuppressedError, Error);
    } catch (unused) {}
    for(var i5 = 0; i5 < 3; i5++){
        var ctor = [
            SuppressedError,
            DisposableStack,
            AsyncDisposableStack
        ][i5];
        try {
            Object.defineProperty(ctor, "prototype", {
                writable: false,
                enumerable: false,
                configurable: false
            });
        } catch (unused) {}
    }
    var disposeKey = ensureSymbol("dispose");
    var asyncDisposeKey = ensureSymbol("asyncDispose");
    var tagKey3 = typeof Symbol !== "undefined" ? Symbol.toStringTag : void 0;
    var defTag = function defTag(target, value) {
        Object.defineProperty(target, tagKey3, {
            value: value,
            writable: false,
            enumerable: false,
            configurable: true
        });
    };
    var installDisposable = function installDisposable() {
        if (tagKey3) {
            defTag(DisposableStack.prototype, "DisposableStack");
            defTag(AsyncDisposableStack.prototype, "AsyncDisposableStack");
            defTag(SuppressedError.prototype, "SuppressedError");
        }
        if (disposeKey !== void 0) {
            def(DisposableStack.prototype, disposeKey, DisposableStack.prototype.dispose);
        }
        if (asyncDisposeKey !== void 0) {
            def(AsyncDisposableStack.prototype, asyncDisposeKey, AsyncDisposableStack.prototype.disposeAsync);
        }
        var target = typeof window !== "undefined" ? window : globalThis;
        if (!target.SuppressedError) define(target, "SuppressedError", SuppressedError);
        if (!target.DisposableStack) define(target, "DisposableStack", DisposableStack);
        if (!target.AsyncDisposableStack) define(target, "AsyncDisposableStack", AsyncDisposableStack);
        if (asyncDisposeKey !== void 0) {
            try {
                var makeAsyncGen = Function("return (async function* () {})");
                var asyncGenFn = makeAsyncGen();
                var asyncIteratorProto = Object.getPrototypeOf(Object.getPrototypeOf(Object.getPrototypeOf(asyncGenFn())));
                if (asyncIteratorProto && !asyncIteratorProto[asyncDisposeKey]) {
                    var asyncIteratorDispose = function asyncIteratorDispose() {
                        var self = this;
                        return Promise.resolve().then(function() {
                            var method = self.return;
                            return typeof method === "function" ? method.call(self) : void 0;
                        });
                    };
                    define(asyncIteratorProto, asyncDisposeKey, asyncIteratorDispose, "[Symbol.asyncDispose]");
                }
            } catch (unused) {}
        }
    };
    // src/modules/web.url-search-params.ts
    var isSupported8 = function isSupported8() {
        try {
            var Native = window.URLSearchParams;
            if (typeof Native === "undefined") {
                return false;
            }
            if (new Native({
                a: "1"
            }).toString() !== "a=1") {
                return false;
            }
            if (new Native("?a=1").toString() !== "a=1") {
                return false;
            }
            if (new Native("a=1&b=2&a=3").toString() !== "a=1&b=2&a=3") {
                return false;
            }
            if (new Native("a=1").get("a") !== "1") return false;
            var NativeURL = window.URL;
            if (typeof NativeURL !== "function") return true;
            var probe = new NativeURL("b?a=1&b=2&c=3", "https://a");
            var params = probe.searchParams;
            var result = "";
            probe.pathname = "c%20d";
            params.forEach(function(value, key) {
                params["delete"]("b");
                result += key + value;
            });
            var iteratorKey4 = typeof Symbol === "function" ? Symbol.iterator : void 0;
            return !(!params.sort || probe.href !== "https://a/c%20d?a=1&c=3" || params.get("c") !== "3" || String(new Native("?a=1")) !== "a=1" || iteratorKey4 && !params[iteratorKey4] || new NativeURL("https://a@b").username !== "a" || new Native(new Native("a=b")).get("a") !== "b" || new NativeURL("https://\u0442\u0435\u0441\u0442").host !== "xn--e1aybc" || new NativeURL("https://a#\u0431").hash !== "#%D0%B1" || result !== "a1c3" || new NativeURL("https://x", void 0).host !== "x");
        } catch (unused) {
            return false;
        }
    };
    var decodePercent = function decodePercent(str) {
        try {
            return decodeURIComponent(str);
        } catch (e) {
            return decodeLenient(str);
        }
    };
    var decodeLenient = function decodeLenient(str) {
        var out = "";
        var needed = 0;
        var seen = 0;
        var cp = 0;
        var lower = 128;
        var upper = 191;
        var flush = function flush() {
            if (needed !== 0) {
                out += "\uFFFD";
                needed = seen = cp = 0;
                lower = 128;
                upper = 191;
            }
        };
        for(var i = 0; i < str.length; i++){
            var ch = str.charCodeAt(i);
            var byte = -1;
            if (ch === 37 && i + 2 < str.length) {
                var hiCode = str.charCodeAt(i + 1);
                var hi = hiCode >= 48 && hiCode <= 57 ? hiCode - 48 : // 0-9
                hiCode >= 65 && hiCode <= 70 ? hiCode - 55 : // A-F
                hiCode >= 97 && hiCode <= 102 ? hiCode - 87 : // a-f
                -1;
                var loCode = str.charCodeAt(i + 2);
                var lo = loCode >= 48 && loCode <= 57 ? loCode - 48 : // 0-9
                loCode >= 65 && loCode <= 70 ? loCode - 55 : // A-F
                loCode >= 97 && loCode <= 102 ? loCode - 87 : // a-f
                -1;
                if (hi !== -1 && lo !== -1) {
                    byte = hi * 16 + lo;
                    i += 2;
                }
            }
            if (byte === -1) {
                flush();
                out += str.charAt(i);
                continue;
            }
            for(;;){
                if (needed === 0) {
                    if (byte <= 127) out += String.fromCharCode(byte);
                    else if (byte >= 194 && byte <= 223) {
                        needed = 1;
                        cp = byte & 31;
                    } else if (byte >= 224 && byte <= 239) {
                        if (byte === 224) lower = 160;
                        if (byte === 237) upper = 159;
                        needed = 2;
                        cp = byte & 15;
                    } else if (byte >= 240 && byte <= 244) {
                        if (byte === 240) lower = 144;
                        if (byte === 244) upper = 143;
                        needed = 3;
                        cp = byte & 7;
                    } else out += "\uFFFD";
                    break;
                }
                if (byte < lower || byte > upper) {
                    flush();
                    continue;
                }
                lower = 128;
                upper = 191;
                cp = cp << 6 | byte & 63;
                if (++seen === needed) {
                    if (cp <= 65535) {
                        out += String.fromCharCode(cp);
                    } else {
                        var offset = cp - 65536;
                        out += String.fromCharCode(55296 + (offset >> 10), 56320 + (offset & 1023));
                    }
                    needed = seen = cp = 0;
                }
                break;
            }
        }
        flush();
        return out;
    };
    var parseString = function parseString(search2) {
        var pairs = [];
        var query = search2.indexOf("?") === 0 ? search2.substring(1) : search2;
        if (!query) {
            return pairs;
        }
        var chunks = query.split("&");
        for(var i = 0; i < chunks.length; i++){
            var chunk = chunks[i];
            if (chunk === "") {
                continue;
            }
            var equalsAt = chunk.indexOf("=");
            var name = equalsAt > -1 ? chunk.substring(0, equalsAt) : chunk;
            if (name.indexOf("+") !== -1) name = name.replace(/\+/g, " ");
            if (name.indexOf("%") !== -1) name = decodePercent(name);
            var value = "";
            if (equalsAt > -1) {
                value = chunk.substring(equalsAt + 1);
                if (value.indexOf("+") !== -1) value = value.replace(/\+/g, " ");
                if (value.indexOf("%") !== -1) value = decodePercent(value);
            }
            pairs.push([
                name,
                value
            ]);
        }
        return pairs;
    };
    var SLOT6 = {
        value: void 0,
        writable: true,
        enumerable: false,
        configurable: true
    };
    var hasOwn5 = Object.prototype.hasOwnProperty;
    var isEnumerable = Object.prototype.propertyIsEnumerable;
    var iteratorKey2 = typeof Symbol !== "undefined" ? Symbol.iterator : void 0;
    var toUSVString = function toUSVString(value) {
        if (typeof value === "symbol") throw new TypeError("Cannot convert a Symbol value to a string");
        var str = typeof value === "string" ? value : String(value);
        var out = null;
        for(var i = 0; i < str.length; i++){
            var c = str.charCodeAt(i);
            if (c >= 55296 && c <= 57343) {
                var next8 = i + 1 < str.length ? str.charCodeAt(i + 1) : 0;
                if (c <= 56319 && next8 >= 56320 && next8 <= 57343) {
                    if (out !== null) out += str.charAt(i) + str.charAt(i + 1);
                    i++;
                    continue;
                }
                if (out === null) out = str.substring(0, i);
                out += "\uFFFD";
            } else if (out !== null) {
                out += str.charAt(i);
            }
        }
        return out === null ? str : out;
    };
    var toPair = function toPair(entry) {
        if (entry === null || typeof entry !== "object" && typeof entry !== "function") {
            throw new TypeError("Failed to construct 'URLSearchParams': The provided value cannot be converted to a sequence.");
        }
        var items = [];
        var method = iteratorKey2 ? entry[iteratorKey2] : void 0;
        if (typeof method === "function") {
            var iterator = method.call(entry);
            var next8 = iterator.next;
            for(var step = next8.call(iterator); !step.done; step = next8.call(iterator))items.push(step.value);
        } else if (!iteratorKey2 && typeof entry.length === "number") {
            for(var i = 0; i < entry.length; i++)items.push(entry[i]);
        } else {
            throw new TypeError("Failed to construct 'URLSearchParams': The provided value cannot be converted to a sequence.");
        }
        if (items.length !== 2) {
            throw new TypeError("Failed to construct 'URLSearchParams': Each sequence element must contain exactly two items");
        }
        return [
            toUSVString(items[0]),
            toUSVString(items[1])
        ];
    };
    var URLSearchParams2 = function URLSearchParams21() {
        if (!(this instanceof URLSearchParams2)) {
            throw new TypeError("Failed to construct 'URLSearchParams': Please use the 'new' operator.");
        }
        SLOT6.value = [];
        Object.defineProperty(this, "_pairs", SLOT6);
        SLOT6.value = void 0;
        var init = arguments.length > 0 ? arguments[0] : void 0;
        if (init === void 0 || init === null) {
            if (init === null) this._pairs = parseString("null");
            return;
        }
        var pairs = this._pairs;
        if (typeof init === "object" || typeof init === "function") {
            if (hasOwn5.call(init, "_pairs") && init instanceof URLSearchParams2 && init[iteratorKey2] === URLSearchParams2.prototype.entries) {
                var source = init._pairs;
                for(var i = 0; i < source.length; i++)pairs.push([
                    source[i][0],
                    source[i][1]
                ]);
                return;
            }
            var method = iteratorKey2 ? init[iteratorKey2] : void 0;
            if (method !== void 0 && method !== null) {
                if (typeof method !== "function") throw new TypeError("Failed to construct 'URLSearchParams': @@iterator is not callable");
                var iterator = method.call(init);
                var next8 = iterator.next;
                for(var step = next8.call(iterator); !step.done; step = next8.call(iterator))pairs.push(toPair(step.value));
                return;
            }
            if (!iteratorKey2 && Array.isArray(init)) {
                for(var i1 = 0; i1 < init.length; i1++)pairs.push(toPair(init[i1]));
                return;
            }
            var keys3 = Object.getOwnPropertyNames(init);
            for(var k = 0; k < keys3.length; k++){
                var key = keys3[k];
                if (!isEnumerable.call(init, key)) continue;
                var name = toUSVString(key);
                var value = toUSVString(init[key]);
                var replaced = false;
                for(var i2 = 0; i2 < pairs.length; i2++){
                    if (pairs[i2][0] === name) {
                        pairs[i2][1] = value;
                        replaced = true;
                        break;
                    }
                }
                if (!replaced) pairs.push([
                    name,
                    value
                ]);
            }
            if (typeof Object.getOwnPropertySymbols === "function") {
                var symbols = Object.getOwnPropertySymbols(init);
                for(var k1 = 0; k1 < symbols.length; k1++){
                    if (isEnumerable.call(init, symbols[k1])) toUSVString(symbols[k1]);
                }
            }
            return;
        }
        this._pairs = parseString(toUSVString(init));
    };
    var P = URLSearchParams2.prototype;
    P.append = function append(name, value) {
        if (this === null || typeof this !== "object" || !hasOwn5.call(this, "_pairs")) {
            throw new TypeError("Failed to execute 'append' on 'URLSearchParams': Illegal invocation");
        }
        if (arguments.length < 2) {
            throw new TypeError("Failed to execute 'append' on 'URLSearchParams': 2 arguments required, but only " + arguments.length + " present.");
        }
        this._pairs.push([
            toUSVString(name),
            toUSVString(value)
        ]);
        updateSteps(this);
    };
    P["delete"] = function(name) {
        if (this === null || typeof this !== "object" || !hasOwn5.call(this, "_pairs")) {
            throw new TypeError("Failed to execute 'delete' on 'URLSearchParams': Illegal invocation");
        }
        if (arguments.length < 1) {
            throw new TypeError("Failed to execute 'delete' on 'URLSearchParams': 1 argument required, but only " + arguments.length + " present.");
        }
        var key = toUSVString(name);
        var value = arguments.length > 1 && arguments[1] !== void 0 ? toUSVString(arguments[1]) : void 0;
        var kept = [];
        for(var i = 0; i < this._pairs.length; i++){
            var pair = this._pairs[i];
            if (pair[0] !== key || value !== void 0 && pair[1] !== value) kept.push(pair);
        }
        this._pairs.length = 0;
        for(var i1 = 0; i1 < kept.length; i1++)this._pairs.push(kept[i1]);
        updateSteps(this);
    };
    P.get = function get(name) {
        if (this === null || typeof this !== "object" || !hasOwn5.call(this, "_pairs")) {
            throw new TypeError("Failed to execute 'get' on 'URLSearchParams': Illegal invocation");
        }
        if (arguments.length < 1) {
            throw new TypeError("Failed to execute 'get' on 'URLSearchParams': 1 argument required, but only " + arguments.length + " present.");
        }
        var key = toUSVString(name);
        for(var i = 0; i < this._pairs.length; i++){
            if (this._pairs[i][0] === key) return this._pairs[i][1];
        }
        return null;
    };
    P.getAll = function getAll(name) {
        if (this === null || typeof this !== "object" || !hasOwn5.call(this, "_pairs")) {
            throw new TypeError("Failed to execute 'getAll' on 'URLSearchParams': Illegal invocation");
        }
        if (arguments.length < 1) {
            throw new TypeError("Failed to execute 'getAll' on 'URLSearchParams': 1 argument required, but only " + arguments.length + " present.");
        }
        var key = toUSVString(name);
        var values4 = [];
        for(var i = 0; i < this._pairs.length; i++){
            if (this._pairs[i][0] === key) values4.push(this._pairs[i][1]);
        }
        return values4;
    };
    P.has = function has(name) {
        if (this === null || typeof this !== "object" || !hasOwn5.call(this, "_pairs")) {
            throw new TypeError("Failed to execute 'has' on 'URLSearchParams': Illegal invocation");
        }
        if (arguments.length < 1) {
            throw new TypeError("Failed to execute 'has' on 'URLSearchParams': 1 argument required, but only " + arguments.length + " present.");
        }
        var key = toUSVString(name);
        var value = arguments.length > 1 && arguments[1] !== void 0 ? toUSVString(arguments[1]) : void 0;
        for(var i = 0; i < this._pairs.length; i++){
            if (this._pairs[i][0] === key && (value === void 0 || this._pairs[i][1] === value)) return true;
        }
        return false;
    };
    P.set = function set(name, value) {
        if (this === null || typeof this !== "object" || !hasOwn5.call(this, "_pairs")) {
            throw new TypeError("Failed to execute 'set' on 'URLSearchParams': Illegal invocation");
        }
        if (arguments.length < 2) {
            throw new TypeError("Failed to execute 'set' on 'URLSearchParams': 2 arguments required, but only " + arguments.length + " present.");
        }
        var key = toUSVString(name);
        var next8 = toUSVString(value);
        var replaced = false;
        var kept = [];
        for(var i = 0; i < this._pairs.length; i++){
            if (this._pairs[i][0] !== key) {
                kept.push(this._pairs[i]);
            } else if (!replaced) {
                kept.push([
                    key,
                    next8
                ]);
                replaced = true;
            }
        }
        if (!replaced) kept.push([
            key,
            next8
        ]);
        this._pairs.length = 0;
        for(var i1 = 0; i1 < kept.length; i1++)this._pairs.push(kept[i1]);
        updateSteps(this);
    };
    P.sort = function sort2() {
        if (this === null || typeof this !== "object" || !hasOwn5.call(this, "_pairs")) {
            throw new TypeError("Failed to execute 'sort' on 'URLSearchParams': Illegal invocation");
        }
        var list = this._pairs;
        for(var i = 1; i < list.length; i++){
            var pair = list[i];
            var j = i - 1;
            while(j >= 0 && list[j][0] > pair[0]){
                list[j + 1] = list[j];
                j--;
            }
            list[j + 1] = pair;
        }
        updateSteps(this);
    };
    var formEncode = function formEncode(value) {
        return encodeURIComponent(value).replace(/[!\x27()~]/g, function(c) {
            return "%" + c.charCodeAt(0).toString(16).toUpperCase();
        }).replace(/%20/g, "+");
    };
    var serializePairs = function serializePairs(pairs) {
        var out = "";
        for(var i = 0; i < pairs.length; i++){
            if (i > 0) out += "&";
            out += formEncode(pairs[i][0]) + "=" + formEncode(pairs[i][1]);
        }
        return out;
    };
    var updateSteps = function updateSteps(self) {
        var record = self._url;
        if (record === void 0 || record === null) return;
        var query = serializePairs(self._pairs);
        record.query = query === "" ? null : query;
        if (record.query === null && record.fragment === null && typeof record.path === "string") {
            record.path = record.path.replace(/ +$/, "");
        }
    };
    Object.defineProperty(P, "toString", {
        writable: true,
        enumerable: true,
        configurable: true,
        value: function toString3() {
            if (this === null || typeof this !== "object" || !hasOwn5.call(this, "_pairs")) {
                throw new TypeError("Failed to execute 'toString' on 'URLSearchParams': Illegal invocation");
            }
            return serializePairs(this._pairs);
        }
    });
    P.forEach = function forEach2(callback) {
        if (this === null || typeof this !== "object" || !hasOwn5.call(this, "_pairs")) {
            throw new TypeError("Failed to execute 'forEach' on 'URLSearchParams': Illegal invocation");
        }
        if (arguments.length < 1) {
            throw new TypeError("Failed to execute 'forEach' on 'URLSearchParams': 1 argument required, but only " + arguments.length + " present.");
        }
        if (typeof callback !== "function") {
            throw new TypeError("Failed to execute 'forEach' on 'URLSearchParams': The callback provided as parameter 1 is not a function.");
        }
        var thisArg = arguments.length > 1 ? arguments[1] : void 0;
        for(var i = 0; i < this._pairs.length; i++){
            var pair = this._pairs[i];
            callback.call(thisArg, pair[1], pair[0], this);
        }
    };
    Object.defineProperty(P, "size", {
        enumerable: true,
        configurable: true,
        get: function get() {
            if (this === null || typeof this !== "object" || !hasOwn5.call(this, "_pairs")) {
                throw new TypeError("Failed to execute 'size' on 'URLSearchParams': Illegal invocation");
            }
            return this._pairs.length;
        }
    });
    try {
        Object.defineProperty(Object.getOwnPropertyDescriptor(P, "size").get, "name", {
            value: "get size",
            configurable: true
        });
    } catch (e) {}
    var IteratorPrototype = function() {
        try {
            return iteratorKey2 ? Object.getPrototypeOf(Object.getPrototypeOf([][iteratorKey2]())) : Object.prototype;
        } catch (e) {
            return Object.prototype;
        }
    }();
    var ParamsIteratorPrototype = Object.create(IteratorPrototype);
    var ITER_SLOT2 = {
        value: void 0,
        writable: true,
        enumerable: false,
        configurable: false
    };
    Object.defineProperty(ParamsIteratorPrototype, "next", {
        writable: true,
        enumerable: true,
        configurable: true,
        value: function next4() {
            if (this === null || typeof this !== "object" || !hasOwn5.call(this, "_params")) {
                throw new TypeError("Failed to execute 'next' on 'URLSearchParams Iterator': Illegal invocation");
            }
            var params = this._params;
            if (params === null || this._index >= params._pairs.length) {
                this._params = null;
                return {
                    value: void 0,
                    done: true
                };
            }
            var pair = params._pairs[this._index++];
            var kind = this._kind;
            return {
                value: kind === 0 ? pair[0] : kind === 1 ? pair[1] : [
                    pair[0],
                    pair[1]
                ],
                done: false
            };
        }
    });
    if (typeof Symbol !== "undefined" && Symbol.toStringTag) {
        Object.defineProperty(ParamsIteratorPrototype, Symbol.toStringTag, {
            value: "URLSearchParams Iterator",
            writable: false,
            enumerable: false,
            configurable: true
        });
    }
    if (iteratorKey2 && typeof ParamsIteratorPrototype[iteratorKey2] !== "function") {
        Object.defineProperty(ParamsIteratorPrototype, iteratorKey2, {
            value: function value() {
                return this;
            },
            writable: true,
            enumerable: false,
            configurable: true
        });
    }
    var makeIterator2 = function makeIterator2(params, kind) {
        var iterator = Object.create(ParamsIteratorPrototype);
        ITER_SLOT2.value = params;
        Object.defineProperty(iterator, "_params", ITER_SLOT2);
        ITER_SLOT2.value = 0;
        Object.defineProperty(iterator, "_index", ITER_SLOT2);
        ITER_SLOT2.value = kind;
        Object.defineProperty(iterator, "_kind", ITER_SLOT2);
        ITER_SLOT2.value = void 0;
        return iterator;
    };
    P.keys = function keys2() {
        if (this === null || typeof this !== "object" || !hasOwn5.call(this, "_pairs")) {
            throw new TypeError("Failed to execute 'keys' on 'URLSearchParams': Illegal invocation");
        }
        return makeIterator2(this, 0);
    };
    P.values = function values2() {
        if (this === null || typeof this !== "object" || !hasOwn5.call(this, "_pairs")) {
            throw new TypeError("Failed to execute 'values' on 'URLSearchParams': Illegal invocation");
        }
        return makeIterator2(this, 1);
    };
    P.entries = function entries2() {
        if (this === null || typeof this !== "object" || !hasOwn5.call(this, "_pairs")) {
            throw new TypeError("Failed to execute 'entries' on 'URLSearchParams': Illegal invocation");
        }
        return makeIterator2(this, 2);
    };
    var paramMethods = [
        "append",
        "delete",
        "get",
        "getAll",
        "has",
        "set",
        "sort",
        "toString",
        "forEach",
        "keys",
        "values",
        "entries"
    ];
    for(var i6 = 0; i6 < paramMethods.length; i6++){
        try {
            Object.defineProperty(P[paramMethods[i6]], "name", {
                value: paramMethods[i6],
                configurable: true
            });
        } catch (e) {}
    }
    if (iteratorKey2) {
        Object.defineProperty(P, iteratorKey2, {
            value: P.entries,
            writable: true,
            enumerable: false,
            configurable: true
        });
    }
    if (typeof Symbol !== "undefined" && Symbol.toStringTag) {
        Object.defineProperty(P, Symbol.toStringTag, {
            value: "URLSearchParams",
            writable: false,
            enumerable: false,
            configurable: true
        });
    }
    var wrapRequestInit = function wrapRequestInit(init) {
        if (init === null || typeof init !== "object") return init;
        var body = init.body;
        if (!(body instanceof URLSearchParams2) || !hasOwn5.call(body, "_pairs")) return init;
        var headers = init.headers ? new window.Headers(init.headers) : new window.Headers();
        if (!headers.has("content-type")) headers.set("content-type", "application/x-www-form-urlencoded;charset=UTF-8");
        return Object.create(init, {
            body: {
                value: body.toString()
            },
            headers: {
                value: headers
            }
        });
    };
    var install8 = function install8() {
        var w = window;
        define(w, "URLSearchParams", URLSearchParams2);
        if (w.URLSearchParams !== URLSearchParams2 || typeof w.Headers !== "function") return;
        var nativeFetch = w.fetch;
        if (typeof nativeFetch === "function" && !nativeFetch.__polyfilled) {
            define(w, "fetch", function fetch(input) {
                return arguments.length > 1 ? nativeFetch.call(w, input, wrapRequestInit(arguments[1])) : nativeFetch.call(w, input);
            });
        }
        var NativeRequest = w.Request;
        if (typeof NativeRequest === "function" && !NativeRequest.__polyfilled) {
            var Request = function Request2(input) {
                if (!(this instanceof Request2)) {
                    throw new TypeError("Failed to construct 'Request': Please use the 'new' operator, this DOM object constructor cannot be called as a function.");
                }
                return arguments.length > 1 ? new NativeRequest(input, wrapRequestInit(arguments[1])) : new NativeRequest(input);
            };
            Request.prototype = NativeRequest.prototype;
            define(NativeRequest.prototype, "constructor", Request, "Request");
            define(w, "Request", Request);
        }
    };
    // src/modules/web.url.ts
    var isSupported9 = function isSupported9() {
        try {
            var url = new URL("b", "http://a");
            url.pathname = "c d";
            if (url.href !== "http://a/c%20d" || url.searchParams === void 0) {
                return false;
            }
            if (url.searchParams !== url.searchParams) {
                return false;
            }
            var live = new URL("http://a/?x=1");
            live.searchParams.set("x", "2");
            if (live.search !== "?x=2") return false;
            if (new URL("http://u:p@a/?#").href !== "http://u:p@a/?#") return false;
            if (new URL("c.png", "file:///a/b/../index.html").href !== "file:///a/c.png") return false;
            var probe = new URL("b?a=1&b=2&c=3", "https://a");
            var params = probe.searchParams;
            var result = "";
            probe.pathname = "c%20d";
            params.forEach(function(value, key) {
                params["delete"]("b");
                result += key + value;
            });
            var iteratorKey4 = typeof Symbol === "function" ? Symbol.iterator : void 0;
            return !(!params.sort || probe.href !== "https://a/c%20d?a=1&c=3" || params.get("c") !== "3" || String(new URLSearchParams("?a=1")) !== "a=1" || iteratorKey4 && !params[iteratorKey4] || new URL("https://a@b").username !== "a" || // throws in Edge
            new URLSearchParams(new URLSearchParams("a=b")).get("a") !== "b" || new URL("https://\u0442\u0435\u0441\u0442").host !== "xn--e1aybc" || // not punycoded in Edge
            new URL("https://a#\u0431").hash !== "#%D0%B1" || // not escaped in Chrome 62-
            result !== "a1c3" || // fails in Chrome 66-
            new URL("https://x", void 0).host !== "x");
        } catch (unused) {
            return false;
        }
    };
    var hasOwn6 = Object.prototype.hasOwnProperty;
    var FAILURE = {};
    var SPECIAL = {
        ftp: 21,
        file: null,
        http: 80,
        https: 443,
        ws: 80,
        wss: 443
    };
    var isSpecialScheme = function isSpecialScheme(scheme) {
        return hasOwn6.call(SPECIAL, scheme);
    };
    var SCHEME_START = 1;
    var SCHEME = 2;
    var NO_SCHEME = 3;
    var SPECIAL_RELATIVE_OR_AUTHORITY = 4;
    var PATH_OR_AUTHORITY = 5;
    var RELATIVE = 6;
    var RELATIVE_SLASH = 7;
    var SPECIAL_AUTHORITY_SLASHES = 8;
    var SPECIAL_AUTHORITY_IGNORE_SLASHES = 9;
    var AUTHORITY = 10;
    var HOST = 11;
    var HOSTNAME = 12;
    var PORT = 13;
    var FILE = 14;
    var FILE_SLASH = 15;
    var FILE_HOST = 16;
    var PATH_START = 17;
    var PATH = 18;
    var OPAQUE_PATH = 19;
    var QUERY = 20;
    var FRAGMENT = 21;
    var SET_C0 = 0;
    var SET_FRAGMENT = 1;
    var SET_QUERY = 2;
    var SET_SPECIAL_QUERY = 3;
    var SET_PATH = 4;
    var SET_USERINFO = 5;
    var inSet = function inSet(code, set3) {
        if (code < 32 || code > 126) return true;
        if (set3 === SET_C0) return false;
        if (set3 === SET_FRAGMENT) return code === 32 || code === 34 || code === 60 || code === 62 || code === 96;
        if (code === 32 || code === 34 || code === 35 || code === 60 || code === 62) return true;
        if (set3 === SET_QUERY) return false;
        if (set3 === SET_SPECIAL_QUERY) return code === 39;
        if (code === 63 || code === 94 || code === 96 || code === 123 || code === 125) return true;
        if (set3 === SET_PATH) return false;
        return code === 47 || code === 58 || code === 59 || code === 61 || code === 64 || code >= 91 && code <= 93 || code === 124;
    };
    var percentEncode = function percentEncode(s, set3) {
        var i = 0;
        while(i < s.length && !inSet(s.charCodeAt(i), set3))i++;
        if (i === s.length) return s;
        var out = s.substring(0, i);
        for(; i < s.length; i++){
            var code = s.charCodeAt(i);
            if (!inSet(code, set3)) {
                out += s.charAt(i);
            } else if (code < 128) {
                out += (code < 16 ? "%0" : "%") + code.toString(16).toUpperCase();
            } else if (code >= 55296 && code <= 56319 && i + 1 < s.length) {
                out += encodeURIComponent(s.charAt(i) + s.charAt(i + 1));
                i++;
            } else {
                out += encodeURIComponent(s.charAt(i));
            }
        }
        return out;
    };
    var isHex = function isHex(c) {
        var n = c.charCodeAt(0);
        return n >= 48 && n <= 57 || n >= 65 && n <= 70 || n >= 97 && n <= 102;
    };
    var RE_SURROGATE = /[\ud800-\udfff]/;
    var RE_ALL_DIGITS = /^[0-9]+$/;
    var RE_ALL_HEX = /^[0-9A-Fa-f]+$/;
    var RE_ALL_OCTAL = /^[0-7]+$/;
    var RE_NON_ASCII = /[^\u0000-\u007f]/;
    var RE_NON_BASIC = /[^\0-~]/;
    var RE_FORBIDDEN_HOST = /[\u0000\t\n\r #/:<>?@[\\\]^|]/;
    var RE_FORBIDDEN_DOMAIN = /[\u0000-\u0020#%/:<>?@[\\\]^|\u007f]/;
    var percentDecodeUtf8 = function percentDecodeUtf8(s) {
        if (s.indexOf("%") === -1) return s;
        var bytes = [];
        for(var i = 0; i < s.length; i++){
            var c = s.charAt(i);
            if (c === "%" && i + 2 < s.length && isHex(s.charAt(i + 1)) && isHex(s.charAt(i + 2))) {
                bytes.push(parseInt(s.substr(i + 1, 2), 16));
                i += 2;
            } else {
                var code = s.charCodeAt(i);
                if (code < 128) {
                    bytes.push(code);
                } else {
                    var ch = c;
                    if (code >= 55296 && code <= 56319 && i + 1 < s.length) ch += s.charAt(++i);
                    var enc = encodeURIComponent(ch);
                    for(var k = 0; k < enc.length; k += 3)bytes.push(parseInt(enc.substr(k + 1, 2), 16));
                }
            }
        }
        var out = "";
        for(var i1 = 0; i1 < bytes.length;){
            var b = bytes[i1];
            if (b < 128) {
                out += String.fromCharCode(b);
                i1++;
                continue;
            }
            var need = 0, cp = 0, lower = 128, upper = 191;
            if (b >= 194 && b <= 223) {
                need = 1;
                cp = b & 31;
            } else if (b >= 224 && b <= 239) {
                need = 2;
                cp = b & 15;
                if (b === 224) lower = 160;
                if (b === 237) upper = 159;
            } else if (b >= 240 && b <= 244) {
                need = 3;
                cp = b & 7;
                if (b === 240) lower = 144;
                if (b === 244) upper = 143;
            } else {
                out += "\uFFFD";
                i1++;
                continue;
            }
            var j = i1 + 1;
            var ok = true;
            for(var k1 = 0; k1 < need; k1++, j++){
                var n = bytes[j];
                if (n === void 0 || n < lower || n > upper) {
                    ok = false;
                    break;
                }
                lower = 128;
                upper = 191;
                cp = cp << 6 | n & 63;
            }
            if (!ok) {
                out += "\uFFFD";
                i1 = j;
                continue;
            }
            if (cp > 65535) {
                cp -= 65536;
                out += String.fromCharCode(55296 + (cp >> 10), 56320 + (cp & 1023));
            } else {
                out += String.fromCharCode(cp);
            }
            i1 = j;
        }
        return out;
    };
    var toUSV = function toUSV(value) {
        if (typeof value === "symbol") throw new TypeError("Cannot convert a Symbol value to a string");
        var s = String(value);
        return RE_SURROGATE.test(s) ? s.replace(/[\ud800-\udbff][\udc00-\udfff]|[\ud800-\udfff]/g, function(m) {
            return m.length === 2 ? m : "\uFFFD";
        }) : s;
    };
    var parseIPv4Number = function parseIPv4Number(input) {
        if (input === "") return FAILURE;
        var radix = 10;
        if (input.length >= 2 && input.charAt(0) === "0" && (input.charAt(1) === "x" || input.charAt(1) === "X")) {
            input = input.substring(2);
            radix = 16;
        } else if (input.length >= 2 && input.charAt(0) === "0") {
            input = input.substring(1);
            radix = 8;
        }
        if (input === "") return 0;
        var valid = radix === 10 ? RE_ALL_DIGITS : radix === 16 ? RE_ALL_HEX : RE_ALL_OCTAL;
        if (!valid.test(input)) return FAILURE;
        return parseInt(input, radix);
    };
    var endsInANumber = function endsInANumber(input) {
        var parts = input.split(".");
        if (parts[parts.length - 1] === "") {
            if (parts.length === 1) return false;
            parts.pop();
        }
        var last = parts[parts.length - 1];
        if (last !== "" && RE_ALL_DIGITS.test(last)) return true;
        return parseIPv4Number(last) !== FAILURE;
    };
    var parseIPv4 = function parseIPv4(input) {
        var parts = input.split(".");
        if (parts[parts.length - 1] === "" && parts.length > 1) parts.pop();
        if (parts.length > 4) return FAILURE;
        var numbers = [];
        for(var i = 0; i < parts.length; i++){
            var n = parseIPv4Number(parts[i]);
            if (n === FAILURE) return FAILURE;
            numbers.push(n);
        }
        for(var i1 = 0; i1 < numbers.length - 1; i1++)if (numbers[i1] > 255) return FAILURE;
        if (numbers[numbers.length - 1] >= Math.pow(256, 5 - numbers.length)) return FAILURE;
        var ipv4 = numbers[numbers.length - 1];
        for(var i2 = 0; i2 < numbers.length - 1; i2++)ipv4 += numbers[i2] * Math.pow(256, 3 - i2);
        var out = "";
        for(var i3 = 3; i3 >= 0; i3--){
            out += Math.floor(ipv4 / Math.pow(256, i3)) % 256;
            if (i3 > 0) out += ".";
        }
        return out;
    };
    var parseIPv6 = function parseIPv6(input) {
        var address = [
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0
        ];
        var pieceIndex = 0;
        var compress = -1;
        var pointer = 0;
        if (input.charAt(0) === ":") {
            if (input.charAt(1) !== ":") return FAILURE;
            pointer += 2;
            pieceIndex++;
            compress = pieceIndex;
        }
        while(pointer < input.length){
            if (pieceIndex === 8) return FAILURE;
            if (input.charAt(pointer) === ":") {
                if (compress !== -1) return FAILURE;
                pointer++;
                pieceIndex++;
                compress = pieceIndex;
                continue;
            }
            var value = 0;
            var length = 0;
            while(length < 4 && pointer < input.length && isHex(input.charAt(pointer))){
                value = value * 16 + parseInt(input.charAt(pointer), 16);
                pointer++;
                length++;
            }
            if (input.charAt(pointer) === ".") {
                if (length === 0) return FAILURE;
                pointer -= length;
                if (pieceIndex > 6) return FAILURE;
                var numbersSeen = 0;
                while(pointer < input.length){
                    var ipv4Piece = -1;
                    if (numbersSeen > 0) {
                        if (input.charAt(pointer) === "." && numbersSeen < 4) pointer++;
                        else return FAILURE;
                    }
                    var digit = input.charCodeAt(pointer);
                    if (!(digit >= 48 && digit <= 57)) return FAILURE;
                    while((digit = input.charCodeAt(pointer)) >= 48 && digit <= 57){
                        var number = +input.charAt(pointer);
                        if (ipv4Piece === -1) ipv4Piece = number;
                        else if (ipv4Piece === 0) return FAILURE;
                        else ipv4Piece = ipv4Piece * 10 + number;
                        if (ipv4Piece > 255) return FAILURE;
                        pointer++;
                    }
                    address[pieceIndex] = address[pieceIndex] * 256 + ipv4Piece;
                    numbersSeen++;
                    if (numbersSeen === 2 || numbersSeen === 4) pieceIndex++;
                }
                if (numbersSeen !== 4) return FAILURE;
                break;
            } else if (input.charAt(pointer) === ":") {
                pointer++;
                if (pointer >= input.length) return FAILURE;
            } else if (pointer < input.length) {
                return FAILURE;
            }
            address[pieceIndex] = value;
            pieceIndex++;
        }
        if (compress !== -1) {
            var swaps = pieceIndex - compress;
            pieceIndex = 7;
            while(pieceIndex !== 0 && swaps > 0){
                var t = address[pieceIndex];
                address[pieceIndex] = address[compress + swaps - 1];
                address[compress + swaps - 1] = t;
                pieceIndex--;
                swaps--;
            }
        } else if (pieceIndex !== 8) {
            return FAILURE;
        }
        var bestStart = -1, bestLen = 1;
        for(var i = 0; i < 8;){
            if (address[i] !== 0) {
                i++;
                continue;
            }
            var j = i;
            while(j < 8 && address[j] === 0)j++;
            if (j - i > bestLen) {
                bestStart = i;
                bestLen = j - i;
            }
            i = j;
        }
        var out = "";
        var ignore0 = false;
        for(var i1 = 0; i1 < 8; i1++){
            if (ignore0 && address[i1] === 0) continue;
            ignore0 = false;
            if (bestStart === i1) {
                out += i1 === 0 ? "::" : ":";
                ignore0 = true;
                continue;
            }
            out += address[i1].toString(16);
            if (i1 !== 7) out += ":";
        }
        return "[" + out + "]";
    };
    var MAPPED_ONTO_FORBIDDEN = "\xA8\xAF\xB4\xB8\u02D8\u02D9\u02DA\u02DB\u02DC\u02DD\u037A\u0384\u0385\u1FBD\u1FBF\u1FC0\u1FC1\u1FCD\u1FCE\u1FCF\u1FDD\u1FDE\u1FDF\u1FED\u1FEE\u1FFD\u1FFE\u2017\u203E\u2047\u2048\u2049\u2100\u2101\u2105\u2106\u2A74\u309B\u309C\uFC5E\uFC5F\uFC60\uFC61\uFC62\uFC63\uFDFA\uFDFB\uFE13\uFE16\uFE47\uFE48\uFE49\uFE4A\uFE4B\uFE4C\uFE55\uFE56\uFE5F\uFE64\uFE65\uFE68\uFE6A\uFE6B\uFE70\uFE72\uFE74\uFE76\uFE78\uFE7A\uFE7C\uFE7E\uFFE3";
    var domainToASCII = function domainToASCII(domain) {
        if (!RE_NON_ASCII.test(domain)) return domain === "" ? FAILURE : domain.toLowerCase();
        var mapped = "";
        for(var i = 0; i < domain.length; i++){
            var code = domain.charCodeAt(i);
            if (code >= 55296 && code <= 56319 && i + 1 < domain.length) {
                var low = domain.charCodeAt(i + 1);
                if ((low & 64512) === 56320) {
                    code = ((code & 1023) << 10) + (low & 1023) + 65536;
                    i++;
                }
            }
            if (code === 65533 || code >= 55296 && code <= 57343 || code >= 128 && code <= 159 || code >= 8206 && code <= 8207 || code >= 8232 && code <= 8233 || code >= 8234 && code <= 8238 || code >= 8293 && code <= 8297 || code >= 64976 && code <= 65007 || (code & 65534) === 65534 || code >= 57344 && code <= 63743 || code >= 983040 && code <= 1114109) return FAILURE;
            if (code === 173 || code === 847 || code === 8203 || code === 12644 || code === 65279 || code === 65440 || code >= 4447 && code <= 4448 || code >= 6068 && code <= 6069 || code >= 6155 && code <= 6159 || code >= 8288 && code <= 8292 || code >= 8298 && code <= 8303 || code >= 65024 && code <= 65039 || code >= 917760 && code <= 917999) continue;
            if (code >= 65281 && code <= 65374) code -= 65248;
            else if (code === 160 || code === 5760 || code === 8239 || code === 8287 || code === 12288 || code >= 8192 && code <= 8202 || code <= 65535 && MAPPED_ONTO_FORBIDDEN.indexOf(String.fromCharCode(code)) !== -1) code = 32;
            mapped += code > 65535 ? String.fromCharCode(55296 + (code - 65536 >> 10), 56320 + (code - 65536 & 1023)) : String.fromCharCode(code);
        }
        if (mapped === "") return FAILURE;
        var labels = mapped.toLowerCase().replace(/[.。．｡]/g, ".").split(".");
        var out = "";
        for(var l = 0; l < labels.length; l++){
            var label = labels[l];
            if (l > 0) out += ".";
            if (!RE_NON_BASIC.test(label)) {
                out += label;
                continue;
            }
            var input = [];
            for(var i1 = 0; i1 < label.length; i1++){
                var value = label.charCodeAt(i1);
                if (value >= 55296 && value <= 56319 && i1 + 1 < label.length) {
                    var extra = label.charCodeAt(i1 + 1);
                    if ((extra & 64512) === 56320) {
                        input.push(((value & 1023) << 10) + (extra & 1023) + 65536);
                        i1++;
                        continue;
                    }
                }
                input.push(value);
            }
            var encoded = "";
            for(var i2 = 0; i2 < input.length; i2++){
                if (input[i2] < 128) encoded += String.fromCharCode(input[i2]);
            }
            var basicLength = encoded.length;
            var handled = basicLength;
            if (basicLength) encoded += "-";
            var n = 128;
            var delta = 0;
            var bias = 72;
            while(handled < input.length){
                var m = 2147483647;
                for(var i3 = 0; i3 < input.length; i3++){
                    if (input[i3] >= n && input[i3] < m) m = input[i3];
                }
                var handledPlusOne = handled + 1;
                if (m - n > Math.floor((2147483647 - delta) / handledPlusOne)) return FAILURE;
                delta += (m - n) * handledPlusOne;
                n = m;
                for(var i4 = 0; i4 < input.length; i4++){
                    var current = input[i4];
                    if (current < n && ++delta > 2147483647) return FAILURE;
                    if (current === n) {
                        var q = delta;
                        for(var k2 = 36;; k2 += 36){
                            var t = k2 <= bias ? 1 : k2 >= bias + 26 ? 26 : k2 - bias;
                            if (q < t) break;
                            var qMinusT = q - t;
                            var baseMinusT = 36 - t;
                            var digit = t + qMinusT % baseMinusT;
                            encoded += String.fromCharCode(digit + 22 + (digit < 26 ? 75 : 0));
                            q = Math.floor(qMinusT / baseMinusT);
                        }
                        encoded += String.fromCharCode(q + 22 + (q < 26 ? 75 : 0));
                        var d = handled === basicLength ? Math.floor(delta / 700) : delta >> 1;
                        d += Math.floor(d / handledPlusOne);
                        var k = 0;
                        while(d > 455){
                            d = Math.floor(d / 35);
                            k += 36;
                        }
                        bias = Math.floor(k + 36 * d / (d + 38));
                        delta = 0;
                        handled++;
                    }
                }
                delta++;
                n++;
            }
            out += "xn--" + encoded;
        }
        return out;
    };
    var parseHost = function parseHost(input, isOpaque) {
        if (input.charAt(0) === "[") {
            if (input.charAt(input.length - 1) !== "]") return FAILURE;
            return parseIPv6(input.substring(1, input.length - 1));
        }
        if (isOpaque) {
            if (RE_FORBIDDEN_HOST.test(input)) return FAILURE;
            return percentEncode(input, SET_C0);
        }
        var asciiDomain = domainToASCII(percentDecodeUtf8(input));
        if (asciiDomain === FAILURE) return FAILURE;
        if (RE_FORBIDDEN_DOMAIN.test(asciiDomain)) return FAILURE;
        if (endsInANumber(asciiDomain)) return parseIPv4(asciiDomain);
        return asciiDomain;
    };
    var isAlpha = function isAlpha(c) {
        var n = c.charCodeAt(0);
        return n >= 65 && n <= 90 || n >= 97 && n <= 122;
    };
    var isWindowsDriveLetter = function isWindowsDriveLetter(s) {
        return s.length === 2 && isAlpha(s.charAt(0)) && (s.charAt(1) === ":" || s.charAt(1) === "|");
    };
    var isNormalizedWindowsDriveLetter = function isNormalizedWindowsDriveLetter(s) {
        return s.length === 2 && isAlpha(s.charAt(0)) && s.charAt(1) === ":";
    };
    var startsWithWindowsDriveLetter = function startsWithWindowsDriveLetter(input, at2) {
        if (input.length - at2 < 2) return false;
        if (!isWindowsDriveLetter(input.substr(at2, 2))) return false;
        if (input.length - at2 === 2) return true;
        var third = input.charAt(at2 + 2);
        return third === "/" || third === "\\" || third === "?" || third === "#";
    };
    var isSingleDot = function isSingleDot(s) {
        return s === "." || s.toLowerCase() === "%2e";
    };
    var shortenPath = function shortenPath(url) {
        var path = url.path;
        if (url.scheme === "file" && path.length === 1 && isNormalizedWindowsDriveLetter(path[0])) return;
        path.pop();
    };
    var includesCredentials = function includesCredentials(url) {
        return url.username !== "" || url.password !== "";
    };
    function basicParse(input, base, url, stateOverride) {
        if (url === null) {
            url = {
                scheme: "",
                username: "",
                password: "",
                host: null,
                port: null,
                path: [],
                query: null,
                fragment: null
            };
            input = input.replace(/^[\u0000-\u0020]+|[\u0000-\u0020]+$/g, "");
        }
        input = input.replace(/[\t\n\r]/g, "");
        var state = stateOverride || SCHEME_START;
        var buffer = "";
        var atSignSeen = false, insideBrackets = false, passwordTokenSeen = false;
        var len = input.length;
        var pointer = 0;
        for(;;){
            var c = pointer < len ? input.charAt(pointer) : "";
            var special = hasOwn6.call(SPECIAL, url.scheme);
            switch(state){
                case SCHEME_START:
                    if (c !== "" && isAlpha(c)) {
                        buffer += c.toLowerCase();
                        state = SCHEME;
                    } else if (!stateOverride) {
                        state = NO_SCHEME;
                        pointer--;
                    } else {
                        return FAILURE;
                    }
                    break;
                case SCHEME:
                    var sc = c.charCodeAt(0);
                    if (sc >= 97 && sc <= 122 || sc >= 65 && sc <= 90 || sc >= 48 && sc <= 57 || sc === 43 || sc === 45 || sc === 46) {
                        buffer += c.toLowerCase();
                    } else if (c === ":") {
                        if (stateOverride) {
                            if (isSpecialScheme(url.scheme) !== isSpecialScheme(buffer)) return url;
                            if ((includesCredentials(url) || url.port !== null) && buffer === "file") return url;
                            if (url.scheme === "file" && url.host === "") return url;
                        }
                        url.scheme = buffer;
                        if (stateOverride) {
                            if (url.port === SPECIAL[url.scheme]) url.port = null;
                            return url;
                        }
                        buffer = "";
                        if (url.scheme === "file") {
                            state = FILE;
                        } else if (isSpecialScheme(url.scheme) && base !== null && base.scheme === url.scheme) {
                            state = SPECIAL_RELATIVE_OR_AUTHORITY;
                        } else if (isSpecialScheme(url.scheme)) {
                            state = SPECIAL_AUTHORITY_SLASHES;
                        } else if (input.charAt(pointer + 1) === "/") {
                            state = PATH_OR_AUTHORITY;
                            pointer++;
                        } else {
                            url.path = "";
                            state = OPAQUE_PATH;
                        }
                    } else if (!stateOverride) {
                        buffer = "";
                        state = NO_SCHEME;
                        pointer = -1;
                    } else {
                        return FAILURE;
                    }
                    break;
                case NO_SCHEME:
                    if (base === null || typeof base.path === "string" && c !== "#") return FAILURE;
                    if (typeof base.path === "string" && c === "#") {
                        url.scheme = base.scheme;
                        url.path = base.path;
                        url.query = base.query;
                        url.fragment = "";
                        state = FRAGMENT;
                    } else if (base.scheme !== "file") {
                        state = RELATIVE;
                        pointer--;
                    } else {
                        state = FILE;
                        pointer--;
                    }
                    break;
                case SPECIAL_RELATIVE_OR_AUTHORITY:
                    if (c === "/" && input.charAt(pointer + 1) === "/") {
                        state = SPECIAL_AUTHORITY_IGNORE_SLASHES;
                        pointer++;
                    } else {
                        state = RELATIVE;
                        pointer--;
                    }
                    break;
                case PATH_OR_AUTHORITY:
                    if (c === "/") {
                        state = AUTHORITY;
                    } else {
                        state = PATH;
                        pointer--;
                    }
                    break;
                case RELATIVE:
                    url.scheme = base.scheme;
                    if (c === "/" || isSpecialScheme(url.scheme) && c === "\\") {
                        state = RELATIVE_SLASH;
                    } else {
                        url.username = base.username;
                        url.password = base.password;
                        url.host = base.host;
                        url.port = base.port;
                        url.path = base.path.slice();
                        url.query = base.query;
                        if (c === "?") {
                            url.query = "";
                            state = QUERY;
                        } else if (c === "#") {
                            url.fragment = "";
                            state = FRAGMENT;
                        } else if (c !== "") {
                            url.query = null;
                            shortenPath(url);
                            state = PATH;
                            pointer--;
                        }
                    }
                    break;
                case RELATIVE_SLASH:
                    if (special && (c === "/" || c === "\\")) {
                        state = SPECIAL_AUTHORITY_IGNORE_SLASHES;
                    } else if (c === "/") {
                        state = AUTHORITY;
                    } else {
                        url.username = base.username;
                        url.password = base.password;
                        url.host = base.host;
                        url.port = base.port;
                        state = PATH;
                        pointer--;
                    }
                    break;
                case SPECIAL_AUTHORITY_SLASHES:
                    if (c === "/" && input.charAt(pointer + 1) === "/") {
                        state = SPECIAL_AUTHORITY_IGNORE_SLASHES;
                        pointer++;
                    } else {
                        state = SPECIAL_AUTHORITY_IGNORE_SLASHES;
                        pointer--;
                    }
                    break;
                case SPECIAL_AUTHORITY_IGNORE_SLASHES:
                    if (c !== "/" && c !== "\\") {
                        state = AUTHORITY;
                        pointer--;
                    }
                    break;
                case AUTHORITY:
                    if (c === "@") {
                        if (atSignSeen) buffer = "%40" + buffer;
                        atSignSeen = true;
                        var colon = passwordTokenSeen ? -1 : buffer.indexOf(":");
                        if (colon === -1) {
                            if (passwordTokenSeen) url.password += percentEncode(buffer, SET_USERINFO);
                            else url.username += percentEncode(buffer, SET_USERINFO);
                        } else {
                            passwordTokenSeen = true;
                            url.username += percentEncode(buffer.substring(0, colon), SET_USERINFO);
                            url.password += percentEncode(buffer.substring(colon + 1), SET_USERINFO);
                        }
                        buffer = "";
                    } else if (c === "" || c === "/" || c === "?" || c === "#" || special && c === "\\") {
                        if (atSignSeen && buffer === "") return FAILURE;
                        pointer -= buffer.length + 1;
                        buffer = "";
                        state = HOST;
                    } else {
                        buffer += c;
                    }
                    break;
                case HOST:
                case HOSTNAME:
                    if (stateOverride && url.scheme === "file") {
                        pointer--;
                        state = FILE_HOST;
                    } else if (c === ":" && !insideBrackets) {
                        if (buffer === "") return FAILURE;
                        if (stateOverride === HOSTNAME) return FAILURE;
                        var host = parseHost(buffer, !special);
                        if (host === FAILURE) return FAILURE;
                        url.host = host;
                        buffer = "";
                        state = PORT;
                    } else if (c === "" || c === "/" || c === "?" || c === "#" || special && c === "\\") {
                        pointer--;
                        if (special && buffer === "") return FAILURE;
                        if (stateOverride && buffer === "" && (includesCredentials(url) || url.port !== null)) return FAILURE;
                        var host1 = parseHost(buffer, !special);
                        if (host1 === FAILURE) return FAILURE;
                        url.host = host1;
                        buffer = "";
                        state = PATH_START;
                        if (stateOverride) return url;
                    } else {
                        if (c === "[") insideBrackets = true;
                        if (c === "]") insideBrackets = false;
                        buffer += c;
                    }
                    break;
                case PORT:
                    var pc = c.charCodeAt(0);
                    if (pc >= 48 && pc <= 57) {
                        buffer += c;
                    } else if (c === "" || c === "/" || c === "?" || c === "#" || special && c === "\\" || stateOverride) {
                        if (buffer !== "") {
                            var port = parseInt(buffer, 10);
                            if (port > 65535) return FAILURE;
                            url.port = port === SPECIAL[url.scheme] ? null : port;
                            buffer = "";
                            if (stateOverride) return url;
                        }
                        if (stateOverride) return FAILURE;
                        state = PATH_START;
                        pointer--;
                    } else {
                        return FAILURE;
                    }
                    break;
                case FILE:
                    url.scheme = "file";
                    url.host = "";
                    if (c === "/" || c === "\\") {
                        state = FILE_SLASH;
                    } else if (base !== null && base.scheme === "file") {
                        url.host = base.host;
                        url.path = base.path.slice();
                        url.query = base.query;
                        if (c === "?") {
                            url.query = "";
                            state = QUERY;
                        } else if (c === "#") {
                            url.fragment = "";
                            state = FRAGMENT;
                        } else if (c !== "") {
                            url.query = null;
                            if (!startsWithWindowsDriveLetter(input, pointer)) shortenPath(url);
                            else url.path = [];
                            state = PATH;
                            pointer--;
                        }
                    } else {
                        state = PATH;
                        pointer--;
                    }
                    break;
                case FILE_SLASH:
                    if (c === "/" || c === "\\") {
                        state = FILE_HOST;
                    } else {
                        if (base !== null && base.scheme === "file") {
                            url.host = base.host;
                            if (!startsWithWindowsDriveLetter(input, pointer) && base.path.length > 0 && isNormalizedWindowsDriveLetter(base.path[0])) {
                                url.path.push(base.path[0]);
                            }
                        }
                        state = PATH;
                        pointer--;
                    }
                    break;
                case FILE_HOST:
                    if (c === "" || c === "/" || c === "\\" || c === "?" || c === "#") {
                        pointer--;
                        if (!stateOverride && isWindowsDriveLetter(buffer)) {
                            state = PATH;
                        } else if (buffer === "") {
                            url.host = "";
                            if (stateOverride) return url;
                            state = PATH_START;
                        } else {
                            var host2 = parseHost(buffer, !special);
                            if (host2 === FAILURE) return FAILURE;
                            if (host2 === "localhost") host2 = "";
                            url.host = host2;
                            if (stateOverride) return url;
                            buffer = "";
                            state = PATH_START;
                        }
                    } else {
                        buffer += c;
                    }
                    break;
                case PATH_START:
                    if (special) {
                        state = PATH;
                        if (c !== "/" && c !== "\\") pointer--;
                    } else if (!stateOverride && c === "?") {
                        url.query = "";
                        state = QUERY;
                    } else if (!stateOverride && c === "#") {
                        url.fragment = "";
                        state = FRAGMENT;
                    } else if (c !== "") {
                        state = PATH;
                        if (c !== "/") pointer--;
                    } else if (stateOverride && url.host === null) {
                        url.path.push("");
                    }
                    break;
                case PATH:
                    if (c === "" || c === "/" || special && c === "\\" || !stateOverride && (c === "?" || c === "#")) {
                        var slash = c === "/" || special && c === "\\";
                        var lowered = buffer.toLowerCase();
                        if (lowered === ".." || lowered === ".%2e" || lowered === "%2e." || lowered === "%2e%2e") {
                            shortenPath(url);
                            if (!slash) url.path.push("");
                        } else if (isSingleDot(buffer) && !slash) {
                            url.path.push("");
                        } else if (!isSingleDot(buffer)) {
                            if (url.scheme === "file" && url.path.length === 0 && isWindowsDriveLetter(buffer)) {
                                buffer = buffer.charAt(0) + ":";
                            }
                            url.path.push(percentEncode(buffer, SET_PATH));
                        }
                        buffer = "";
                        if (c === "?") {
                            url.query = "";
                            state = QUERY;
                        }
                        if (c === "#") {
                            url.fragment = "";
                            state = FRAGMENT;
                        }
                    } else {
                        buffer += c;
                    }
                    break;
                case OPAQUE_PATH:
                    if (c === "?" || c === "#" || c === "") {
                        url.path += percentEncode(buffer, SET_C0);
                        buffer = "";
                        if (c === "?") {
                            url.query = "";
                            state = QUERY;
                        } else if (c === "#") {
                            url.fragment = "";
                            state = FRAGMENT;
                        }
                    } else {
                        buffer += c;
                    }
                    break;
                case QUERY:
                    if (!stateOverride && c === "#" || c === "") {
                        url.query += percentEncode(buffer, special ? SET_SPECIAL_QUERY : SET_QUERY);
                        buffer = "";
                        if (c === "#") {
                            url.fragment = "";
                            state = FRAGMENT;
                        }
                    } else {
                        buffer += c;
                    }
                    break;
                case FRAGMENT:
                    if (c !== "") {
                        buffer += c;
                    } else {
                        url.fragment += percentEncode(buffer, SET_FRAGMENT);
                    }
                    break;
            }
            if (pointer >= len) break;
            pointer++;
        }
        return url;
    }
    var serializePath = function serializePath(url) {
        if (typeof url.path === "string") return url.path;
        var out = "";
        for(var i = 0; i < url.path.length; i++)out += "/" + url.path[i];
        return out;
    };
    var serialize = function serialize(url, excludeFragment) {
        var out = url.scheme + ":";
        if (url.host !== null) {
            out += "//";
            if (includesCredentials(url)) {
                out += url.username;
                if (url.password !== "") out += ":" + url.password;
                out += "@";
            }
            out += url.host;
            if (url.port !== null) out += ":" + url.port;
        }
        if (url.host === null && typeof url.path !== "string" && url.path.length > 1 && url.path[0] === "") out += "/.";
        out += serializePath(url);
        if (url.query !== null) out += "?" + url.query;
        if (!excludeFragment && url.fragment !== null) out += "#" + url.fragment;
        return out;
    };
    var stripTrailingSpaces = function stripTrailingSpaces(url) {
        if (typeof url.path !== "string" || url.fragment !== null || url.query !== null) return;
        url.path = url.path.replace(/ +$/, "");
    };
    var cannotHaveCredentialsOrPort = function cannotHaveCredentialsOrPort(url) {
        return url.host === null || url.host === "" || url.scheme === "file";
    };
    var SLOT7 = {
        value: void 0,
        writable: true,
        enumerable: false,
        configurable: true
    };
    var defineSlot = function defineSlot(target, key, value) {
        SLOT7.value = value;
        Object.defineProperty(target, key, SLOT7);
        SLOT7.value = void 0;
    };
    var recordOf = function recordOf(self, name) {
        if (self === null || typeof self !== "object" || !hasOwn6.call(self, "_url")) {
            throw new TypeError("Failed to execute '" + name + "' on 'URL': Illegal invocation");
        }
        return self._url;
    };
    var refillParams = function refillParams(self) {
        var params = self._params;
        if (params === null) return;
        var record = self._url;
        var query = record.query === null ? "" : record.query;
        if (hasOwn6.call(params, "_pairs")) {
            var fresh = new window.URLSearchParams(query)._pairs;
            params._pairs.length = 0;
            for(var i = 0; i < fresh.length; i++)params._pairs.push(fresh[i]);
        } else {
            var names = [];
            params.forEach(function(_v, name) {
                if (names.indexOf(name) === -1) names.push(name);
            });
            for(var i1 = 0; i1 < names.length; i1++)params["delete"](names[i1]);
            new window.URLSearchParams(query).forEach(function(v, name) {
                params.append(name, v);
            });
        }
        self._paramsSeen = params.toString();
    };
    var syncFromNativeParams = function syncFromNativeParams(self) {
        var params = self._params;
        if (params === null || hasOwn6.call(params, "_pairs")) return;
        var now = params.toString();
        if (now === self._paramsSeen) return;
        self._paramsSeen = now;
        self._url.query = now === "" ? null : now;
        stripTrailingSpaces(self._url);
    };
    var parseOrThrow = function parseOrThrow(input, base) {
        var result = basicParse(input, base, null, 0);
        if (result === FAILURE) throw new TypeError("Failed to construct 'URL': Invalid URL");
        return result;
    };
    var URLPolyfill = function URL2(url) {
        if (!(this instanceof URLPolyfill)) {
            throw new TypeError("Failed to construct 'URL': Please use the 'new' operator.");
        }
        if (arguments.length < 1) {
            throw new TypeError("Failed to construct 'URL': 1 argument required, but only 0 present.");
        }
        var base = arguments.length > 1 && arguments[1] !== void 0 ? parseOrThrow(toUSV(arguments[1]), null) : null;
        defineSlot(this, "_url", parseOrThrow(toUSV(url), base));
        defineSlot(this, "_params", null);
        defineSlot(this, "_paramsSeen", "");
    };
    var UP = URLPolyfill.prototype;
    var accessor = function accessor(name, get3, set3) {
        try {
            Object.defineProperty(get3, "name", {
                value: "get " + name,
                configurable: true
            });
            if (set3) Object.defineProperty(set3, "name", {
                value: "set " + name,
                configurable: true
            });
        } catch (e) {}
        Object.defineProperty(UP, name, {
            get: get3,
            set: set3,
            enumerable: true,
            configurable: true
        });
    };
    accessor("href", function() {
        var record = recordOf(this, "href");
        syncFromNativeParams(this);
        return serialize(record, false);
    }, function(value) {
        recordOf(this, "href");
        var parsed = basicParse(toUSV(value), null, null, 0);
        if (parsed === FAILURE) throw new TypeError("Failed to set the 'href' property on 'URL': Invalid URL");
        this._url = parsed;
        if (this._params !== null && hasOwn6.call(this._params, "_pairs")) this._params._url = parsed;
        refillParams(this);
    });
    accessor("origin", function() {
        var record = recordOf(this, "origin");
        if (record.scheme === "blob" && typeof record.path === "string") {
            var inner = basicParse(record.path, null, null, 0);
            if (inner !== FAILURE && (inner.scheme === "http" || inner.scheme === "https")) {
                return inner.scheme + "://" + inner.host + (inner.port !== null ? ":" + inner.port : "");
            }
            return "null";
        }
        if (!isSpecialScheme(record.scheme) || record.scheme === "file") return "null";
        return record.scheme + "://" + record.host + (record.port !== null ? ":" + record.port : "");
    });
    accessor("protocol", function() {
        return recordOf(this, "protocol").scheme + ":";
    }, function(value) {
        basicParse(toUSV(value) + ":", null, recordOf(this, "protocol"), SCHEME_START);
    });
    accessor("username", function() {
        return recordOf(this, "username").username;
    }, function(value) {
        var record = recordOf(this, "username");
        if (cannotHaveCredentialsOrPort(record)) return;
        record.username = percentEncode(toUSV(value), SET_USERINFO);
    });
    accessor("password", function() {
        return recordOf(this, "password").password;
    }, function(value) {
        var record = recordOf(this, "password");
        if (cannotHaveCredentialsOrPort(record)) return;
        record.password = percentEncode(toUSV(value), SET_USERINFO);
    });
    accessor("host", function() {
        var record = recordOf(this, "host");
        if (record.host === null) return "";
        return record.port === null ? record.host : record.host + ":" + record.port;
    }, function(value) {
        var record = recordOf(this, "host");
        if (typeof record.path === "string") return;
        basicParse(toUSV(value), null, record, HOST);
    });
    accessor("hostname", function() {
        var record = recordOf(this, "hostname");
        return record.host === null ? "" : record.host;
    }, function(value) {
        var record = recordOf(this, "hostname");
        if (typeof record.path === "string") return;
        basicParse(toUSV(value), null, record, HOSTNAME);
    });
    accessor("port", function() {
        var record = recordOf(this, "port");
        return record.port === null ? "" : String(record.port);
    }, function(value) {
        var record = recordOf(this, "port");
        if (cannotHaveCredentialsOrPort(record)) return;
        var input = toUSV(value);
        if (input === "") record.port = null;
        else basicParse(input, null, record, PORT);
    });
    accessor("pathname", function() {
        return serializePath(recordOf(this, "pathname"));
    }, function(value) {
        var record = recordOf(this, "pathname");
        if (typeof record.path === "string") return;
        record.path = [];
        basicParse(toUSV(value), null, record, PATH_START);
    });
    accessor("search", function() {
        var record = recordOf(this, "search");
        syncFromNativeParams(this);
        return record.query === null || record.query === "" ? "" : "?" + record.query;
    }, function(value) {
        var record = recordOf(this, "search");
        var input = toUSV(value);
        if (input === "") {
            record.query = null;
            stripTrailingSpaces(record);
        } else {
            if (input.charAt(0) === "?") input = input.substring(1);
            record.query = "";
            basicParse(input, null, record, QUERY);
        }
        refillParams(this);
    });
    accessor("searchParams", function() {
        var record = recordOf(this, "searchParams");
        if (this._params === null) {
            var params = new window.URLSearchParams(record.query === null ? "" : record.query);
            if (hasOwn6.call(params, "_pairs")) defineSlot(params, "_url", record);
            this._params = params;
            this._paramsSeen = params.toString();
        }
        return this._params;
    });
    accessor("hash", function() {
        var record = recordOf(this, "hash");
        return record.fragment === null || record.fragment === "" ? "" : "#" + record.fragment;
    }, function(value) {
        var record = recordOf(this, "hash");
        var input = toUSV(value);
        if (input === "") {
            record.fragment = null;
            stripTrailingSpaces(record);
            return;
        }
        if (input.charAt(0) === "#") input = input.substring(1);
        record.fragment = "";
        basicParse(input, null, record, FRAGMENT);
    });
    var hrefOf = function hrefOf() {
        recordOf(this, "toString");
        syncFromNativeParams(this);
        return serialize(this._url, false);
    };
    Object.defineProperty(UP, "toString", {
        value: hrefOf,
        writable: true,
        enumerable: true,
        configurable: true
    });
    var toJSON = function toJSON2() {
        recordOf(this, "toJSON");
        syncFromNativeParams(this);
        return serialize(this._url, false);
    };
    Object.defineProperty(UP, "toJSON", {
        value: toJSON,
        writable: true,
        enumerable: true,
        configurable: true
    });
    try {
        Object.defineProperty(hrefOf, "name", {
            value: "toString",
            configurable: true
        });
    } catch (e) {}
    Object.defineProperty(URLPolyfill, "prototype", {
        writable: false
    });
    if (typeof Symbol !== "undefined" && Symbol.toStringTag) {
        Object.defineProperty(UP, Symbol.toStringTag, {
            value: "URL",
            writable: false,
            enumerable: false,
            configurable: true
        });
    }
    var canParse = function canParse2(url) {
        if (arguments.length < 1) throw new TypeError("Failed to execute 'canParse' on 'URL': 1 argument required, but only 0 present.");
        var base = null;
        if (arguments.length > 1 && arguments[1] !== void 0) {
            base = basicParse(toUSV(arguments[1]), null, null, 0);
            if (base === FAILURE) return false;
        }
        return basicParse(toUSV(url), base, null, 0) !== FAILURE;
    };
    var parse = function parse2(url) {
        if (arguments.length < 1) throw new TypeError("Failed to execute 'parse' on 'URL': 1 argument required, but only 0 present.");
        try {
            return arguments.length > 1 ? new URLPolyfill(url, arguments[1]) : new URLPolyfill(url);
        } catch (e) {
            return null;
        }
    };
    Object.defineProperty(URLPolyfill, "canParse", {
        value: canParse,
        writable: true,
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(URLPolyfill, "parse", {
        value: parse,
        writable: true,
        enumerable: true,
        configurable: true
    });
    var alreadyInstalled = false;
    var applyURLPolyfill = function applyURLPolyfill() {
        if (alreadyInstalled) return;
        alreadyInstalled = true;
        if (typeof window === "undefined") return;
        var nativeURL = window.URL || window.webkitURL || null;
        if (nativeURL) {
            if (nativeURL.createObjectURL) {
                URLPolyfill.createObjectURL = function(blob) {
                    return nativeURL.createObjectURL(blob);
                };
            }
            if (nativeURL.revokeObjectURL) {
                URLPolyfill.revokeObjectURL = function(url) {
                    return nativeURL.revokeObjectURL(url);
                };
            }
        }
        define(window, "URL", URLPolyfill);
        if (typeof window.location !== "undefined" && !("origin" in window.location)) {
            var getOrigin = function getOrigin() {
                return window.location.protocol + "//" + window.location.hostname + (window.location.port ? ":" + window.location.port : "");
            };
            try {
                Object.defineProperty(window.location, "origin", {
                    get: getOrigin,
                    enumerable: true
                });
            } catch (unused) {
                window.location.origin = getOrigin();
            }
        }
    };
    var install9 = function install9() {
        applyURLPolyfill();
    };
    // src/modules/es.error.cause.ts
    var isSupported10 = function isSupported10() {
        try {
            var w = window;
            return new w.Error("m", {
                cause: 1
            }).cause === 1 && new w.TypeError("m", {
                cause: 1
            }).cause === 1;
        } catch (unused) {
            return false;
        }
    };
    var CAUSE2 = {
        value: void 0,
        writable: true,
        enumerable: false,
        configurable: true
    };
    var build = function build(Native, message, options) {
        var error = message === void 0 ? new Native() : new Native(message);
        if (options !== null && typeof options === "object" && "cause" in options) {
            CAUSE2.value = options.cause;
            Object.defineProperty(error, "cause", CAUSE2);
            CAUSE2.value = void 0;
        }
        return error;
    };
    var SHELLS = {
        Error: function Error1(N) {
            return function Error2(message) {
                return build(N, message, arguments.length > 1 ? arguments[1] : void 0);
            };
        },
        TypeError: function TypeError1(N) {
            return function TypeError2(message) {
                return build(N, message, arguments.length > 1 ? arguments[1] : void 0);
            };
        },
        RangeError: function RangeError1(N) {
            return function RangeError2(message) {
                return build(N, message, arguments.length > 1 ? arguments[1] : void 0);
            };
        },
        SyntaxError: function SyntaxError1(N) {
            return function SyntaxError2(message) {
                return build(N, message, arguments.length > 1 ? arguments[1] : void 0);
            };
        },
        ReferenceError: function ReferenceError1(N) {
            return function ReferenceError2(message) {
                return build(N, message, arguments.length > 1 ? arguments[1] : void 0);
            };
        },
        EvalError: function EvalError(N) {
            return function EvalError(message) {
                return build(N, message, arguments.length > 1 ? arguments[1] : void 0);
            };
        },
        URIError: function URIError(N) {
            return function URIError(message) {
                return build(N, message, arguments.length > 1 ? arguments[1] : void 0);
            };
        }
    };
    var anonymousShell = function anonymousShell(N) {
        return function(message) {
            return build(N, message, arguments.length > 1 ? arguments[1] : void 0);
        };
    };
    var wrapErrorConstructor = function wrapErrorConstructor(Native) {
        var _loop = function(i) {
            var name = names[i];
            if (name === "prototype" || name === "length" || name === "name") return "continue";
            try {
                var descriptor = Object.getOwnPropertyDescriptor(Native, name);
                if (!descriptor) return "continue";
                Object.defineProperty(Wrapped, name, {
                    get: function get() {
                        return Native[name];
                    },
                    set: function set(value) {
                        Native[name] = value;
                    },
                    enumerable: descriptor.enumerable,
                    configurable: true
                });
            } catch (unused) {}
        };
        var shell = Object.prototype.hasOwnProperty.call(SHELLS, Native.name) ? SHELLS[Native.name] : anonymousShell;
        var Wrapped = shell(Native);
        Wrapped.prototype = Native.prototype;
        try {
            Object.defineProperty(Native.prototype, "constructor", {
                value: Wrapped,
                writable: true,
                enumerable: false,
                configurable: true
            });
        } catch (unused) {}
        var names = Object.getOwnPropertyNames(Native);
        for(var i = 0; i < names.length; i++)_loop(i);
        return Wrapped;
    };
    var install10 = function install10() {
        if (typeof window !== "undefined") {
            var targets = [
                "Error",
                "TypeError",
                "RangeError",
                "SyntaxError",
                "ReferenceError",
                "EvalError",
                "URIError"
            ];
            var NativeError = window.Error;
            for(var i = 0; i < targets.length; i++){
                var name = targets[i];
                var Native = window[name];
                if (typeof Native !== "function") continue;
                var Wrapped = wrapErrorConstructor(Native);
                Object.defineProperty(window, name, {
                    value: Wrapped,
                    writable: true,
                    enumerable: false,
                    configurable: true
                });
                Object.defineProperty(Wrapped, "__polyfilled", {
                    value: true
                });
            }
            var WrappedError = window.Error;
            if (NativeError !== WrappedError) {
                var setProto4 = Object.setPrototypeOf || function(target, proto2) {
                    target.__proto__ = proto2;
                    return target;
                };
                var children = targets.slice(1).concat([
                    "AggregateError",
                    "SuppressedError"
                ]);
                for(var i1 = 0; i1 < children.length; i1++){
                    var ctor = window[children[i1]];
                    if (typeof ctor !== "function") continue;
                    var wrapped = i1 < targets.length - 1;
                    try {
                        if (wrapped || Object.getPrototypeOf(ctor) === NativeError) setProto4(ctor, WrappedError);
                    } catch (e) {}
                }
            }
        }
    };
    // src/modules/es.error.is-error.ts
    var isSupported11 = function isSupported11() {
        try {
            var isError2 = Error.isError;
            if (typeof isError2 !== "function") return false;
            var DOMExceptionCtor = window.DOMException;
            if (typeof DOMExceptionCtor === "function" && !isError2(new DOMExceptionCtor("DOMException"))) return false;
            if (!isError2(new Error("Error", {
                cause: function cause() {}
            }))) return false;
            return !isError2(Object.create(Error.prototype));
        } catch (unused) {
            return false;
        }
    };
    var objectToString3 = Object.prototype.toString;
    var hasOwn7 = Object.prototype.hasOwnProperty;
    var getProto = Object.getPrototypeOf;
    var getOwnDesc = Object.getOwnPropertyDescriptor;
    var defineProp = Object.defineProperty;
    var tagKey4 = typeof Symbol !== "undefined" ? Symbol.toStringTag : void 0;
    var shadow = {
        value: void 0,
        writable: true,
        enumerable: false,
        configurable: true
    };
    var domExceptionName = function() {
        try {
            var D = window.DOMException;
            var d = D && getOwnDesc(D.prototype, "name");
            return d && typeof d.get === "function" ? d.get : null;
        } catch (e) {
            return null;
        }
    }();
    var isDOMException = function isDOMException(value) {
        if (domExceptionName === null) return false;
        try {
            domExceptionName.call(value);
            return true;
        } catch (e) {
            return false;
        }
    };
    var isErrorBehindTag = function isErrorBehindTag(value) {
        var own4 = getOwnDesc(value, tagKey4);
        try {
            defineProp(value, tagKey4, shadow);
        } catch (e) {
            return false;
        }
        var result;
        try {
            result = objectToString3.call(value) === "[object Error]";
        } catch (error) {
            if (own4) defineProp(value, tagKey4, own4);
            else delete value[tagKey4];
            throw error;
        }
        if (own4) defineProp(value, tagKey4, own4);
        else delete value[tagKey4];
        return result;
    };
    var errorIsError = function isError(value) {
        if (value === null || typeof value !== "object" && typeof value !== "function") return false;
        if (isDOMException(value)) return true;
        if (!tagKey4) return objectToString3.call(value) === "[object Error]";
        var tagged = false;
        var steps = 0;
        for(var o = value; o !== null && o !== void 0 && steps < 100; o = getProto(o), steps++){
            if (hasOwn7.call(o, tagKey4)) {
                tagged = true;
                break;
            }
        }
        if (!tagged) return objectToString3.call(value) === "[object Error]";
        return isErrorBehindTag(value);
    };
    // src/modules/es.error.to-string.ts
    var isSupported12 = function isSupported12() {
        try {
            return Error.prototype.toString.call({
                name: "x",
                message: "y"
            }) === "x: y" && Error.prototype.toString.call({}) === "Error" && Error.prototype.toString.call({
                name: "x"
            }) === "x" && Error.prototype.toString.call({
                message: "y"
            }) === "Error: y";
        } catch (unused) {
            return false;
        }
    };
    var errorToString = function errorToString() {
        if (this === null || typeof this !== "object") {
            throw new TypeError("Error.prototype.toString called on a non-object");
        }
        var rawName = this.name;
        var name = rawName === void 0 ? "Error" : String(rawName);
        var rawMessage = this.message;
        var message = rawMessage === void 0 ? "" : String(rawMessage);
        if (name === "") {
            return message;
        }
        if (message === "") {
            return name;
        }
        return name + ": " + message;
    };
    // src/modules/es.map.get-or-insert.ts
    var isSupported13 = function isSupported13() {
        try {
            return typeof Map !== "undefined" && typeof Map.prototype.getOrInsert === "function";
        } catch (unused) {
            return false;
        }
    };
    var mapGetOrInsert = function mapGetOrInsert(key, value) {
        var normalized = key === 0 ? 0 : key;
        if (this.has(normalized)) {
            return this.get(normalized);
        }
        this.set(normalized, value);
        return value;
    };
    // src/modules/es.map.get-or-insert-computed.ts
    var isSupported14 = function isSupported14() {
        try {
            return typeof Map !== "undefined" && typeof Map.prototype.getOrInsertComputed === "function";
        } catch (unused) {
            return false;
        }
    };
    var mapGetOrInsertComputed = function mapGetOrInsertComputed(key, callbackfn) {
        if (typeof callbackfn !== "function") {
            throw new TypeError("Map.prototype.getOrInsertComputed: callback is not callable");
        }
        var normalized = key === 0 ? 0 : key;
        if (this.has(normalized)) {
            return this.get(normalized);
        }
        var value = callbackfn(normalized);
        this.set(normalized, value);
        return value;
    };
    // src/modules/es.map.group-by.ts
    var isSupported15 = function isSupported15() {
        try {
            return typeof Map.groupBy === "function" && Map.groupBy("ab", function(it) {
                return it;
            }).get("a").length === 1;
        } catch (unused) {
            return false;
        }
    };
    var LIST3 = {
        value: void 0,
        writable: true,
        enumerable: true,
        configurable: true
    };
    var isObject4 = function isObject4(value) {
        return value !== null && (typeof value === "object" || typeof value === "function");
    };
    var addToGroup = function addToGroup(groups, key, value) {
        var normalized = key === 0 ? 0 : key;
        var elements = groups.get(normalized);
        if (!elements) {
            elements = [];
            groups.set(normalized, elements);
        }
        LIST3.value = value;
        Object.defineProperty(elements, elements.length, LIST3);
        LIST3.value = void 0;
    };
    var mapGroupBy = function groupBy(items, callbackfn) {
        if (items === null || items === void 0) {
            throw new TypeError("Map.groupBy requires an iterable of items");
        }
        if (typeof callbackfn !== "function") {
            throw new TypeError("Map.groupBy callback is not a function");
        }
        var groups = /* @__PURE__ */ new Map();
        var iteratorKey4 = typeof Symbol !== "undefined" ? Symbol.iterator : void 0;
        if (iteratorKey4) {
            var method = items[iteratorKey4];
            if (typeof method !== "function") throw new TypeError("Map.groupBy argument is not iterable");
            var iterator = method.call(items);
            if (!isObject4(iterator)) throw new TypeError("Result of the Symbol.iterator method is not an object");
            var next8 = iterator.next;
            var k = 0;
            for(;;){
                var step = next8.call(iterator);
                if (!isObject4(step)) throw new TypeError("Iterator result is not an object");
                if (step.done) return groups;
                var value = step.value;
                var key = void 0;
                try {
                    if (k >= 9007199254740991) throw new TypeError("Map.groupBy: too many elements");
                    key = callbackfn(value, k);
                } catch (error) {
                    try {
                        var ret = iterator["return"];
                        if (ret !== void 0 && ret !== null) ret.call(iterator);
                    } catch (e) {}
                    throw error;
                }
                addToGroup(groups, key, value);
                k++;
            }
        }
        if (typeof items.length === "number") {
            for(var i = 0; i < items.length; i++)addToGroup(groups, callbackfn(items[i], i), items[i]);
            return groups;
        }
        throw new TypeError("Map.groupBy argument is not iterable");
    };
    // src/modules/es.weak-map.get-or-insert.ts
    var isSupported16 = function isSupported16() {
        try {
            return typeof WeakMap !== "undefined" && typeof WeakMap.prototype.getOrInsert === "function";
        } catch (unused) {
            return false;
        }
    };
    var isRegisteredSymbol2 = function isRegisteredSymbol2(value) {
        if (typeof Symbol === "undefined" || typeof Symbol.keyFor !== "function") return false;
        try {
            return Symbol.keyFor(value) !== void 0;
        } catch (unused) {
            return false;
        }
    };
    var weakMapGetOrInsert = function weakMapGetOrInsert(key, value) {
        var isPolyfilled = this !== null && typeof this === "object" && typeof this._id === "string" && this._id.indexOf("__wm$") === 0;
        if (!isPolyfilled && Object.prototype.toString.call(this) !== "[object WeakMap]") {
            throw new TypeError("WeakMap.prototype.getOrInsert called on incompatible receiver");
        }
        var keyKind = typeof key;
        var mightBeSymbol = keyKind === "symbol" || keyKind === "object" && key !== null && typeof key.__name__ === "string";
        var holdable = key !== null && (keyKind === "object" || keyKind === "function" || keyKind === "symbol") && !(mightBeSymbol && isRegisteredSymbol2(key));
        if (!holdable) {
            throw new TypeError("Invalid value used as weak map key");
        }
        if (this.has(key)) {
            return this.get(key);
        }
        this.set(key, value);
        return value;
    };
    // src/modules/es.weak-map.get-or-insert-computed.ts
    var isSupported17 = function isSupported17() {
        try {
            return typeof WeakMap !== "undefined" && typeof WeakMap.prototype.getOrInsertComputed === "function";
        } catch (unused) {
            return false;
        }
    };
    var isRegisteredSymbol3 = function isRegisteredSymbol3(value) {
        if (typeof Symbol === "undefined" || typeof Symbol.keyFor !== "function") return false;
        try {
            return Symbol.keyFor(value) !== void 0;
        } catch (unused) {
            return false;
        }
    };
    var weakMapGetOrInsertComputed = function weakMapGetOrInsertComputed(key, callbackfn) {
        var isPolyfilled = this !== null && typeof this === "object" && typeof this._id === "string" && this._id.indexOf("__wm$") === 0;
        if (!isPolyfilled && Object.prototype.toString.call(this) !== "[object WeakMap]") {
            throw new TypeError("WeakMap.prototype.getOrInsertComputed called on incompatible receiver");
        }
        var keyKind = typeof key;
        var mightBeSymbol = keyKind === "symbol" || keyKind === "object" && key !== null && typeof key.__name__ === "string";
        var holdable = key !== null && (keyKind === "object" || keyKind === "function" || keyKind === "symbol") && !(mightBeSymbol && isRegisteredSymbol3(key));
        if (!holdable) {
            throw new TypeError("Invalid value used as weak map key");
        }
        if (typeof callbackfn !== "function") {
            throw new TypeError("WeakMap.prototype.getOrInsertComputed: callback is not callable");
        }
        if (this.has(key)) {
            return this.get(key);
        }
        var value = callbackfn(key);
        this.set(key, value);
        return value;
    };
    // src/modules/es.weak-set.ts
    var isSupported18 = function isSupported18() {
        try {
            var WeakSet3 = window.WeakSet;
            return typeof WeakSet3 === "function";
        } catch (unused) {
            return false;
        }
    };
    var SLOT8 = {
        value: void 0,
        writable: true,
        enumerable: false,
        configurable: true
    };
    var MEMBER = {
        value: true,
        writable: true,
        enumerable: false,
        configurable: true
    };
    var hasOwn8 = Object.prototype.hasOwnProperty;
    var iteratorKey3 = typeof Symbol !== "undefined" ? Symbol.iterator : void 0;
    var arrayIterAtLoad4 = iteratorKey3 ? Array.prototype[iteratorKey3] : void 0;
    var counter2 = 0;
    var isRegisteredSymbol4 = function isRegisteredSymbol4(value) {
        try {
            return Symbol.keyFor(value) !== void 0;
        } catch (e) {
            return false;
        }
    };
    var symbolIndex2 = function symbolIndex2(self, value) {
        var list = self._syms;
        if (list === void 0) return -1;
        for(var i = 0; i < list.length; i++)if (list[i] === value) return i;
        return -1;
    };
    var closeIterator5 = function closeIterator5(iterator) {
        try {
            var ret = iterator["return"];
            if (ret !== void 0 && ret !== null) ret.call(iterator);
        } catch (e) {}
    };
    var WeakSet2 = function WeakSet21() {
        if (!(this instanceof WeakSet2)) {
            throw new TypeError("Constructor WeakSet requires 'new'");
        }
        counter2++;
        SLOT8.value = "__ws$".concat(counter2, "$").concat(Math.random().toString(36).substring(2));
        Object.defineProperty(this, "_wsid", SLOT8);
        SLOT8.value = void 0;
        var iterable = arguments.length > 0 ? arguments[0] : void 0;
        if (iterable === null || iterable === void 0) {
            return;
        }
        var adder = this.add;
        if (typeof adder !== "function") {
            throw new TypeError("WeakSet constructor: this.add is not a function");
        }
        if (Array.isArray(iterable) && (!iteratorKey3 || iterable[iteratorKey3] === arrayIterAtLoad4 && Array.prototype[iteratorKey3] === arrayIterAtLoad4)) {
            for(var i = 0; i < iterable.length; i++)adder.call(this, iterable[i]);
            return;
        }
        var method = iteratorKey3 ? iterable[iteratorKey3] : void 0;
        if (typeof method !== "function") {
            throw new TypeError("WeakSet constructor argument is not iterable");
        }
        var iterator = method.call(iterable);
        if (iterator === null || typeof iterator !== "object" && typeof iterator !== "function") throw new TypeError("Result of the Symbol.iterator method is not an object");
        var next8 = iterator.next;
        for(;;){
            var step = next8.call(iterator);
            if (step === null || typeof step !== "object" && typeof step !== "function") throw new TypeError("Iterator result is not an object");
            if (step.done) return;
            var value = step.value;
            try {
                adder.call(this, value);
            } catch (error) {
                closeIterator5(iterator);
                throw error;
            }
        }
    };
    WeakSet2.prototype.add = function(value) {
        if (this === null || typeof this !== "object" || this._wsid === void 0) {
            throw new TypeError("Method WeakSet.prototype.add called on incompatible receiver");
        }
        if (value === null || typeof value !== "object" && typeof value !== "function") {
            if (typeof value !== "symbol" || isRegisteredSymbol4(value)) throw new TypeError("Invalid value used in weak set");
        }
        if (typeof value === "symbol") {
            if (symbolIndex2(this, value) === -1) {
                if (this._syms === void 0) {
                    SLOT8.value = [];
                    Object.defineProperty(this, "_syms", SLOT8);
                    SLOT8.value = void 0;
                }
                this._syms.push(value);
            }
            return this;
        }
        var id = this._wsid;
        if (!hasOwn8.call(value, id)) {
            if (!Object.isExtensible(value)) {
                throw new TypeError("Cannot add a non-extensible object to a WeakSet");
            }
            Object.defineProperty(value, id, MEMBER);
        }
        return this;
    };
    WeakSet2.prototype.has = function(value) {
        if (this === null || typeof this !== "object" || this._wsid === void 0) {
            throw new TypeError("Method WeakSet.prototype.has called on incompatible receiver");
        }
        if (typeof value === "symbol") return symbolIndex2(this, value) !== -1;
        return value !== null && (typeof value === "object" || typeof value === "function") && hasOwn8.call(value, this._wsid);
    };
    WeakSet2.prototype.delete = function(value) {
        if (this === null || typeof this !== "object" || this._wsid === void 0) {
            throw new TypeError("Method WeakSet.prototype.delete called on incompatible receiver");
        }
        if (typeof value === "symbol") {
            var at2 = symbolIndex2(this, value);
            if (at2 === -1) return false;
            this._syms.splice(at2, 1);
            return true;
        }
        if (value === null || typeof value !== "object" && typeof value !== "function" || !hasOwn8.call(value, this._wsid)) return false;
        delete value[this._wsid];
        return true;
    };
    var weakSetMethods = [
        "add",
        "has",
        "delete"
    ];
    for(var i7 = 0; i7 < weakSetMethods.length; i7++){
        var fn3 = WeakSet2.prototype[weakSetMethods[i7]];
        try {
            Object.defineProperty(fn3, "name", {
                value: weakSetMethods[i7],
                configurable: true
            });
        } catch (e) {}
        Object.defineProperty(WeakSet2.prototype, weakSetMethods[i7], {
            value: fn3,
            writable: true,
            enumerable: false,
            configurable: true
        });
    }
    if (typeof Symbol !== "undefined" && Symbol.toStringTag) {
        Object.defineProperty(WeakSet2.prototype, Symbol.toStringTag, {
            value: "WeakSet",
            writable: false,
            enumerable: false,
            configurable: true
        });
    }
    var nativeClosesIteratorWeakSet = function nativeClosesIteratorWeakSet(Native) {
        var key = typeof Symbol !== "undefined" ? Symbol.iterator : void 0;
        if (typeof key !== "symbol") return true;
        var closed = false;
        var steps = 0;
        var bad = {};
        bad[key] = function() {
            return {
                // one rejected item, then done: a native that accepts it can't loop forever
                next: function next() {
                    return steps++ ? {
                        done: true,
                        value: void 0
                    } : {
                        done: false,
                        value: 1
                    };
                },
                "return": function() {
                    closed = true;
                    return {};
                }
            };
        };
        try {
            new Native(bad);
        } catch (e) {
            return closed;
        }
        return true;
    };
    var wrapNativeWeakSet = function wrapNativeWeakSet(Native) {
        var proto2 = Native.prototype;
        var getProto3 = Object.getPrototypeOf;
        var Wrapped = function Wrapped1() {
            if (!(this instanceof Wrapped)) throw new TypeError("Constructor WeakSet requires 'new'");
            var that = new Native();
            var own4 = getProto3(this);
            if (own4 !== proto2) {
                if (typeof Object.setPrototypeOf === "function") Object.setPrototypeOf(that, own4);
                else that.__proto__ = own4;
            }
            var iterable = arguments.length > 0 ? arguments[0] : void 0;
            if (iterable === null || iterable === void 0) return that;
            var adder = that.add;
            if (typeof adder !== "function") throw new TypeError("WeakSet constructor: this.add is not a function");
            var method = iterable[Symbol.iterator];
            if (typeof method !== "function") throw new TypeError("WeakSet constructor argument is not iterable");
            var iterator = method.call(iterable);
            if (iterator === null || typeof iterator !== "object" && typeof iterator !== "function") {
                throw new TypeError("Result of the Symbol.iterator method is not an object");
            }
            var next8 = iterator.next;
            for(;;){
                var step = next8.call(iterator);
                if (step === null || typeof step !== "object" && typeof step !== "function") {
                    throw new TypeError("Iterator result is not an object");
                }
                if (step.done) return that;
                var item = step.value;
                try {
                    adder.call(that, item);
                } catch (error) {
                    try {
                        var ret = iterator["return"];
                        if (ret !== void 0 && ret !== null) ret.call(iterator);
                    } catch (e) {}
                    throw error;
                }
            }
        };
        try {
            Object.defineProperty(Wrapped, "name", {
                value: "WeakSet",
                configurable: true
            });
        } catch (e) {}
        Wrapped.prototype = proto2;
        Object.defineProperty(proto2, "constructor", {
            value: Wrapped,
            writable: true,
            enumerable: false,
            configurable: true
        });
        window.WeakSet = null;
        delete window.WeakSet;
        define(window, "WeakSet", Wrapped);
    };
    var tagNativeWeakSet = function tagNativeWeakSet() {
        var Native = window.WeakSet;
        var tag = typeof Symbol !== "undefined" ? Symbol.toStringTag : void 0;
        if (typeof Native !== "function" || Native === WeakSet2) return;
        if (tag) try {
            if (!Object.prototype.hasOwnProperty.call(Native.prototype, tag)) Object.defineProperty(Native.prototype, tag, {
                value: "WeakSet",
                writable: false,
                enumerable: false,
                configurable: true
            });
        } catch (e) {}
        if (!nativeClosesIteratorWeakSet(Native)) wrapNativeWeakSet(Native);
    };
    // src/modules/es.function.has-instance.ts
    var hasInstanceKey = typeof Symbol !== "undefined" ? Symbol.hasInstance : void 0;
    var isSupported19 = function isSupported19() {
        try {
            return !hasInstanceKey || typeof Function.prototype[hasInstanceKey] === "function";
        } catch (unused) {
            return true;
        }
    };
    var functionHasInstance = function functionHasInstance(value) {
        if (typeof this !== "function") {
            return false;
        }
        if (value === null || typeof value !== "object" && typeof value !== "function") {
            return false;
        }
        var target = this.prototype;
        if (target === null || typeof target !== "object" && typeof target !== "function") {
            if (!("prototype" in this)) return value instanceof this;
            throw new TypeError("Function has non-object prototype in instanceof check");
        }
        var proto2 = Object.getPrototypeOf(value);
        while(proto2 !== null){
            if (proto2 === target) {
                return true;
            }
            proto2 = Object.getPrototypeOf(proto2);
        }
        return false;
    };
    var install11 = function install11() {
        if (hasInstanceKey) {
            try {
                Object.defineProperty(Function.prototype, hasInstanceKey, {
                    value: functionHasInstance,
                    writable: false,
                    enumerable: false,
                    configurable: false
                });
            } catch (e) {}
            try {
                Object.defineProperty(functionHasInstance, "name", {
                    value: "[Symbol.hasInstance]",
                    configurable: true
                });
            } catch (e) {}
            Object.defineProperty(functionHasInstance, "__polyfilled", {
                value: true
            });
        }
    };
    // src/modules/es.global-this.ts
    var isSupported20 = function isSupported20() {
        try {
            return typeof globalThis !== "undefined" && globalThis.globalThis === globalThis;
        } catch (unused) {
            return false;
        }
    };
    var install12 = function install12() {
        Object.defineProperty(window, "globalThis", {
            value: window,
            writable: true,
            enumerable: false,
            configurable: true
        });
    };
    // src/modules/es.object.assign.ts
    var isSupported21 = function isSupported21() {
        try {
            if (typeof Object.assign !== "function") {
                return false;
            }
            if (typeof Object.defineProperty === "function") {
                var first = {};
                Object.defineProperty(first, "a", {
                    enumerable: true,
                    get: function get() {
                        Object.defineProperty(this, "b", {
                            value: 3,
                            enumerable: false
                        });
                        return 0;
                    }
                });
                if (Object.assign({
                    b: 1
                }, Object.assign(first, {
                    b: 2
                })).b !== 1) return false;
            }
            var ordered = {};
            var alphabet = "abcdefghijklmnopqrst";
            for(var i = 0; i < alphabet.length; i++)ordered[alphabet.charAt(i)] = i;
            if (Object.keys(Object.assign({}, ordered)).join("") !== alphabet) return false;
            if (typeof Symbol === "function" && typeof /* @__PURE__ */ Symbol("assign detection") === "symbol" && typeof Object.getOwnPropertySymbols === "function") {
                var symbol = /* @__PURE__ */ Symbol("assign detection");
                var source = {};
                source[symbol] = 7;
                if (Object.assign({}, source)[symbol] !== 7) return false;
            }
            return true;
        } catch (unused) {
            return false;
        }
    };
    var hasOwn9 = Object.prototype.hasOwnProperty;
    var propIsEnumerable = Object.prototype.propertyIsEnumerable;
    var nativeGetOwnPropertySymbols = Object.getOwnPropertySymbols;
    var NATIVE_SYMBOLS = typeof Symbol === "function" && typeof /* @__PURE__ */ Symbol() === "symbol" && typeof nativeGetOwnPropertySymbols === "function";
    var objectAssign = function objectAssign(target, _source) {
        if (target == null) {
            throw new TypeError("Cannot convert undefined or null to object");
        }
        var to = Object(target);
        var stringLength = typeof target === "string" ? target.length : -1;
        for(var index = 1; index < arguments.length; index++){
            var nextSource = arguments[index];
            if (nextSource == null) {
                continue;
            }
            for(var key in nextSource){
                if (hasOwn9.call(nextSource, key)) {
                    if (stringLength > 0 && String(+key >>> 0) === key && +key < stringLength) {
                        throw new TypeError("Cannot assign to read only property '" + key + "' of string");
                    }
                    to[key] = nextSource[key];
                }
            }
            if (NATIVE_SYMBOLS) {
                var symbols = nativeGetOwnPropertySymbols(Object(nextSource));
                for(var symbolIndex3 = 0; symbolIndex3 < symbols.length; symbolIndex3++){
                    var symbolKey = symbols[symbolIndex3];
                    if (propIsEnumerable.call(nextSource, symbolKey)) {
                        to[symbolKey] = nextSource[symbolKey];
                    }
                }
            }
        }
        return to;
    };
    // src/modules/es.object.define-getter.ts
    var nativeDefineSetter = Object.prototype.__defineSetter__;
    var isSupported22 = function isSupported22() {
        try {
            if (typeof Object.prototype.__defineGetter__ !== "function" || typeof nativeDefineSetter !== "function") return false;
            var key = "__spackle_probe__" + Math.random();
            try {
                nativeDefineSetter.call(null, key, function() {});
            } catch (e) {
                return true;
            }
            delete window[key];
            return false;
        } catch (unused) {
            return false;
        }
    };
    var ACCESSOR = {
        get: void 0,
        enumerable: true,
        configurable: true
    };
    var objectDefineGetter = function objectDefineGetter(key, getter) {
        if (this === null || this === void 0) {
            throw new TypeError("Object.prototype.__defineGetter__ called on null or undefined");
        }
        if (typeof getter !== "function") {
            throw new TypeError("Getter must be a function");
        }
        ACCESSOR.get = getter;
        Object.defineProperty(Object(this), key, ACCESSOR);
        ACCESSOR.get = void 0;
    };
    // src/modules/es.object.define-setter.ts
    var nativeDefineSetter2 = Object.prototype.__defineSetter__;
    var isSupported23 = function isSupported23() {
        try {
            if (typeof Object.prototype.__defineSetter__ !== "function" || typeof nativeDefineSetter2 !== "function") return false;
            var key = "__spackle_probe__" + Math.random();
            try {
                nativeDefineSetter2.call(null, key, function() {});
            } catch (e) {
                return true;
            }
            delete window[key];
            return false;
        } catch (unused) {
            return false;
        }
    };
    var ACCESSOR2 = {
        set: void 0,
        enumerable: true,
        configurable: true
    };
    var objectDefineSetter = function objectDefineSetter(key, setter) {
        if (this === null || this === void 0) {
            throw new TypeError("Object.prototype.__defineSetter__ called on null or undefined");
        }
        if (typeof setter !== "function") {
            throw new TypeError("Setter must be a function");
        }
        ACCESSOR2.set = setter;
        Object.defineProperty(Object(this), key, ACCESSOR2);
        ACCESSOR2.set = void 0;
    };
    // src/modules/es.object.entries.ts
    var isSupported24 = function isSupported24() {
        try {
            return typeof Object.entries === "function";
        } catch (unused) {
            return false;
        }
    };
    var ownKeys = Object.keys;
    var toObject = Object;
    var isEnumerable2 = Object.prototype.propertyIsEnumerable;
    var dataDesc = {
        value: void 0,
        writable: true,
        enumerable: true,
        configurable: true
    };
    var ArrayProto2 = Array.prototype;
    var objectEntries = function entries3(obj) {
        if (obj === null || obj === void 0) {
            throw new TypeError("Cannot convert undefined or null to object");
        }
        var object = toObject(obj);
        var keys3 = ownKeys(object);
        var pairs = [];
        var count = 0;
        for(var i = 0; i < keys3.length; i++){
            var key = keys3[i];
            if (isEnumerable2.call(object, key)) {
                if (!(count in ArrayProto2)) pairs[count++] = [
                    key,
                    object[key]
                ];
                else {
                    dataDesc.value = [
                        key,
                        object[key]
                    ];
                    Object.defineProperty(pairs, count++, dataDesc);
                }
            }
        }
        dataDesc.value = void 0;
        return pairs;
    };
    // src/modules/es.object.freeze.ts
    var isSupported25 = function isSupported25() {
        try {
            var _Object;
            (_Object = Object) === null || _Object === void 0 ? void 0 : _Object.freeze(1);
            return true;
        } catch (unused) {
            return false;
        }
    };
    var nativeFreeze = Object.freeze;
    var objectFreeze = function objectFreeze(obj) {
        if (Object(obj) !== obj) return obj;
        return nativeFreeze(obj);
    };
    // src/modules/es.object.from-entries.ts
    var isSupported26 = function isSupported26() {
        try {
            return typeof Object.fromEntries === "function";
        } catch (unused) {
            return false;
        }
    };
    var ENTRY = {
        value: void 0,
        writable: true,
        enumerable: true,
        configurable: true
    };
    var ObjectPrototype = Object.prototype;
    var closeQuietly = function closeQuietly(iterator) {
        try {
            var ret = iterator.return;
            if (typeof ret === "function") ret.call(iterator);
        } catch (e) {}
    };
    var objectFromEntries = function objectFromEntries(iterable) {
        if (iterable === null || iterable === void 0) {
            throw new TypeError("Object.fromEntries requires an iterable");
        }
        var result = {};
        var iteratorKey4 = typeof Symbol !== "undefined" && Symbol.iterator ? Symbol.iterator : "@@iterator";
        var method = iterable[iteratorKey4];
        if (Array.isArray(iterable) && method === Array.prototype.values) {
            for(var i = 0; i < iterable.length; i++){
                var entry = iterable[i];
                if (entry === null || typeof entry !== "object" && typeof entry !== "function") {
                    throw new TypeError("Iterator value " + String(entry) + " is not an entry object");
                }
                var key = entry[0];
                var value = entry[1];
                var propertyKey = typeof key === "symbol" ? key : String(key);
                if (!(propertyKey in ObjectPrototype)) {
                    result[propertyKey] = value;
                } else {
                    ENTRY.value = value;
                    Object.defineProperty(result, propertyKey, ENTRY);
                    ENTRY.value = void 0;
                }
            }
            return result;
        }
        if (typeof method !== "function") {
            throw new TypeError("Object.fromEntries requires an iterable");
        }
        var iterator = method.call(iterable);
        for(;;){
            var step = iterator.next();
            if (step.done) return result;
            var entry1 = step.value;
            if (entry1 === null || typeof entry1 !== "object" && typeof entry1 !== "function") {
                closeQuietly(iterator);
                throw new TypeError("Iterator value " + String(entry1) + " is not an entry object");
            }
            try {
                var key1 = entry1[0];
                var value1 = entry1[1];
                var propertyKey1 = typeof key1 === "symbol" ? key1 : String(key1);
                if (!(propertyKey1 in ObjectPrototype)) {
                    result[propertyKey1] = value1;
                } else {
                    ENTRY.value = value1;
                    Object.defineProperty(result, propertyKey1, ENTRY);
                    ENTRY.value = void 0;
                }
            } catch (error) {
                closeQuietly(iterator);
                throw error;
            }
        }
    };
    // src/modules/es.object.get-own-property-descriptor.ts
    var isSupported27 = function isSupported27() {
        try {
            var descriptor = Object.getOwnPropertyDescriptor("a", 0);
            return !!descriptor && descriptor.value === "a";
        } catch (unused) {
            return false;
        }
    };
    var nativeGetOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
    var objectGetOwnPropertyDescriptor = function objectGetOwnPropertyDescriptor(target, key) {
        if (target === null || target === void 0) {
            throw new TypeError("Cannot convert undefined or null to object");
        }
        return nativeGetOwnPropertyDescriptor(Object(target), key);
    };
    // src/modules/es.object.get-own-property-descriptors.ts
    var isSupported28 = function isSupported28() {
        try {
            return typeof Object.getOwnPropertyDescriptors === "function";
        } catch (unused) {
            return false;
        }
    };
    var nativeGetOwnPropertyNames = Object.getOwnPropertyNames;
    var nativeGetOwnPropertyDescriptor2 = Object.getOwnPropertyDescriptor;
    var nativeGetOwnPropertySymbols2 = Object.getOwnPropertySymbols;
    var objectGetOwnPropertyDescriptors = function objectGetOwnPropertyDescriptors(obj) {
        if (obj === null || obj === void 0) {
            throw new TypeError("Cannot convert undefined or null to object");
        }
        var object = Object(obj);
        var keys3 = nativeGetOwnPropertyNames(object);
        var result = {};
        for(var i = 0; i < keys3.length; i++){
            result[keys3[i]] = nativeGetOwnPropertyDescriptor2(object, keys3[i]);
        }
        if (typeof Symbol !== "undefined" && typeof nativeGetOwnPropertySymbols2 === "function") {
            var symbols = nativeGetOwnPropertySymbols2(object);
            for(var symbolIndex3 = 0; symbolIndex3 < symbols.length; symbolIndex3++){
                result[symbols[symbolIndex3]] = nativeGetOwnPropertyDescriptor2(object, symbols[symbolIndex3]);
            }
        }
        return result;
    };
    // src/modules/es.object.get-own-property-names.ts
    var isSupported29 = function isSupported29() {
        try {
            if (typeof Object.getOwnPropertyNames !== "function") {
                return false;
            }
            var names = Object.getOwnPropertyNames("ab");
            return !!names && names.indexOf("0") !== -1 && names.indexOf("length") !== -1;
        } catch (unused) {
            return false;
        }
    };
    var nativeGetOwnPropertyNames2 = Object.getOwnPropertyNames;
    var toObject2 = Object;
    var objectGetOwnPropertyNames = function objectGetOwnPropertyNames(target) {
        if (target === null || target === void 0) {
            throw new TypeError("Cannot convert undefined or null to object");
        }
        return nativeGetOwnPropertyNames2(toObject2(target));
    };
    // src/modules/es.object.get-prototype-of.ts
    var isSupported30 = function isSupported30() {
        try {
            if (typeof Object.getPrototypeOf !== "function") {
                return false;
            }
            return Object.getPrototypeOf("a") === String.prototype;
        } catch (unused) {
            return false;
        }
    };
    var nativeGetPrototypeOf = Object.getPrototypeOf;
    var toObject3 = Object;
    var objectGetPrototypeOf = function objectGetPrototypeOf(target) {
        if (target === null || target === void 0) {
            throw new TypeError("Cannot convert undefined or null to object");
        }
        return nativeGetPrototypeOf(toObject3(target));
    };
    // src/modules/es.object.group-by.ts
    var isSupported31 = function isSupported31() {
        try {
            return typeof Object.groupBy === "function" && Object.groupBy("ab", function(it) {
                return it;
            }).a.length === 1;
        } catch (unused) {
            return false;
        }
    };
    var objectGroupBy = function objectGroupBy(items, callbackfn) {
        if (items == null) {
            throw new TypeError("Object.groupBy requires an iterable of items");
        }
        if (typeof callbackfn !== "function") {
            throw new TypeError("Object.groupBy callback is not a function");
        }
        var groups = /* @__PURE__ */ Object.create(null);
        if (typeof Symbol !== "undefined" && Symbol.iterator && typeof items[Symbol.iterator] === "function") {
            var it = items[Symbol.iterator]();
            var index = 0;
            var step = it.next();
            while(!step.done){
                var key = callbackfn(step.value, index++);
                var propertyKey = typeof key === "symbol" ? key : String(key);
                if (groups[propertyKey]) groups[propertyKey].push(step.value);
                else groups[propertyKey] = [
                    step.value
                ];
                step = it.next();
            }
            return groups;
        }
        if (typeof items.length === "number") {
            for(var i = 0; i < items.length; i++){
                var key1 = callbackfn(items[i], i);
                var propertyKey1 = typeof key1 === "symbol" ? key1 : String(key1);
                if (groups[propertyKey1]) groups[propertyKey1].push(items[i]);
                else groups[propertyKey1] = [
                    items[i]
                ];
            }
            return groups;
        }
        throw new TypeError("Object.groupBy argument is not iterable");
    };
    // src/modules/es.object.has-own.ts
    var isSupported32 = function isSupported32() {
        try {
            return typeof Object.hasOwn === "function";
        } catch (unused) {
            return false;
        }
    };
    var nativeHasOwnProperty = Object.prototype.hasOwnProperty;
    var objectHasOwn = function objectHasOwn(target, key) {
        if (target === null || target === void 0) {
            throw new TypeError("Cannot convert undefined or null to object");
        }
        return nativeHasOwnProperty.call(Object(target), key);
    };
    // src/modules/es.object.is.ts
    var isSupported33 = function isSupported33() {
        try {
            return typeof Object.is === "function";
        } catch (unused) {
            return false;
        }
    };
    var objectIs = function objectIs(first, second) {
        if (first === second) {
            return first !== 0 || 1 / first === 1 / second;
        }
        return first !== first && second !== second;
    };
    // src/modules/es.object.is-extensible.ts
    var isSupported34 = function isSupported34() {
        try {
            return Object.isExtensible(1) === false;
        } catch (unused) {
            return false;
        }
    };
    var nativeIsExtensible = Object.isExtensible;
    var objectIsExtensible = function objectIsExtensible(target) {
        if (target === null || typeof target !== "object" && typeof target !== "function") {
            return false;
        }
        return nativeIsExtensible ? nativeIsExtensible(target) : true;
    };
    // src/modules/es.object.is-frozen.ts
    var isSupported35 = function isSupported35() {
        try {
            return Object.isFrozen(1) === true;
        } catch (unused) {
            return false;
        }
    };
    var nativeIsFrozen = Object.isFrozen;
    var objectIsFrozen = function objectIsFrozen(target) {
        if (target === null || typeof target !== "object" && typeof target !== "function") {
            return true;
        }
        return nativeIsFrozen ? nativeIsFrozen(target) : false;
    };
    // src/modules/es.object.is-sealed.ts
    var isSupported36 = function isSupported36() {
        try {
            return Object.isSealed(1) === true;
        } catch (unused) {
            return false;
        }
    };
    var nativeIsSealed = Object.isSealed;
    var objectIsSealed = function objectIsSealed(target) {
        if (target === null || typeof target !== "object" && typeof target !== "function") {
            return true;
        }
        return nativeIsSealed ? nativeIsSealed(target) : false;
    };
    // src/modules/es.object.keys.ts
    var isSupported37 = function isSupported37() {
        try {
            if (typeof Object.keys !== "function") {
                return false;
            }
            var keys3 = Object.keys("ab");
            return !!keys3 && keys3.length === 2 && keys3[0] === "0" && keys3[1] === "1";
        } catch (unused) {
            return false;
        }
    };
    var nativeKeys = typeof Object.keys === "function" ? Object.keys : null;
    var objectKeys = function objectKeys(target) {
        if (target === null || target === void 0) {
            throw new TypeError("Cannot convert undefined or null to object");
        }
        var object = Object(target);
        if (nativeKeys) {
            return nativeKeys(object);
        }
        var keys3 = [];
        for(var key in object){
            if (Object.prototype.hasOwnProperty.call(object, key)) {
                keys3.push(key);
            }
        }
        return keys3;
    };
    // src/modules/es.object.lookup-getter.ts
    var nativeDefineSetter3 = Object.prototype.__defineSetter__;
    var isSupported38 = function isSupported38() {
        try {
            if (typeof Object.prototype.__lookupGetter__ !== "function" || typeof nativeDefineSetter3 !== "function") return false;
            var key = "__spackle_probe__" + Math.random();
            try {
                nativeDefineSetter3.call(null, key, function() {});
            } catch (e) {
                return true;
            }
            delete window[key];
            return false;
        } catch (unused) {
            return false;
        }
    };
    var objectLookupGetter = function objectLookupGetter(key) {
        if (this === null || this === void 0) {
            throw new TypeError("Object.prototype.__lookupGetter__ called on null or undefined");
        }
        var object = Object(this);
        var propertyKey = typeof key === "symbol" ? key : String(key);
        do {
            var descriptor = Object.getOwnPropertyDescriptor(object, propertyKey);
            if (descriptor) {
                return descriptor.get;
            }
            object = Object.getPrototypeOf(object);
        }while (object !== null);
        return void 0;
    };
    // src/modules/es.object.lookup-setter.ts
    var nativeDefineSetter4 = Object.prototype.__defineSetter__;
    var isSupported39 = function isSupported39() {
        try {
            if (typeof Object.prototype.__lookupSetter__ !== "function" || typeof nativeDefineSetter4 !== "function") return false;
            var key = "__spackle_probe__" + Math.random();
            try {
                nativeDefineSetter4.call(null, key, function() {});
            } catch (e) {
                return true;
            }
            delete window[key];
            return false;
        } catch (unused) {
            return false;
        }
    };
    var objectLookupSetter = function objectLookupSetter(key) {
        if (this === null || this === void 0) {
            throw new TypeError("Object.prototype.__lookupSetter__ called on null or undefined");
        }
        var object = Object(this);
        var propertyKey = typeof key === "symbol" ? key : String(key);
        do {
            var descriptor = Object.getOwnPropertyDescriptor(object, propertyKey);
            if (descriptor) {
                return descriptor.set;
            }
            object = Object.getPrototypeOf(object);
        }while (object !== null);
        return void 0;
    };
    // src/modules/es.object.prevent-extensions.ts
    var isSupported40 = function isSupported40() {
        try {
            return Object.preventExtensions(1) === 1;
        } catch (unused) {
            return false;
        }
    };
    var nativePreventExtensions = Object.preventExtensions;
    var objectPreventExtensions = function objectPreventExtensions(target) {
        if (target === null || typeof target !== "object" && typeof target !== "function") {
            return target;
        }
        return nativePreventExtensions ? nativePreventExtensions(target) : target;
    };
    // src/modules/es.object.seal.ts
    var isSupported41 = function isSupported41() {
        try {
            return Object.seal(1) === 1;
        } catch (unused) {
            return false;
        }
    };
    var nativeSeal = Object.seal;
    var objectSeal = function objectSeal(target) {
        if (target === null || typeof target !== "object" && typeof target !== "function") {
            return target;
        }
        return nativeSeal ? nativeSeal(target) : target;
    };
    // src/modules/es.object.set-prototype-of.ts
    var isSupported42 = function isSupported42() {
        try {
            return typeof Object.setPrototypeOf === "function";
        } catch (unused) {
            return false;
        }
    };
    var protoSetterWorks = function() {
        try {
            var probe = {};
            probe.__proto__ = Array.prototype;
            return probe instanceof Array;
        } catch (unused) {
            return false;
        }
    }();
    var protoSetter = function() {
        try {
            var descriptor = Object.getOwnPropertyDescriptor(Object.prototype, "__proto__");
            return descriptor && typeof descriptor.set === "function" ? descriptor.set : null;
        } catch (unused) {
            return null;
        }
    }();
    var objectSetPrototypeOf = function objectSetPrototypeOf(target, proto2) {
        if (target === null || target === void 0) {
            throw new TypeError("Object.setPrototypeOf called on null or undefined");
        }
        if (proto2 !== null && typeof proto2 !== "object" && typeof proto2 !== "function") {
            throw new TypeError("Object prototype may only be an Object or null: " + proto2);
        }
        if (typeof target !== "object" && typeof target !== "function") {
            return target;
        }
        if (protoSetter) {
            protoSetter.call(target, proto2);
        } else if (protoSetterWorks) {
            target.__proto__ = proto2;
        }
        if (Object.getPrototypeOf(target) !== proto2) {
            throw new TypeError("Object.setPrototypeOf: cannot set the prototype of this object");
        }
        return target;
    };
    // src/modules/es.object.values.ts
    var isSupported43 = function isSupported43() {
        try {
            return typeof Object.values === "function";
        } catch (unused) {
            return false;
        }
    };
    var ownKeys2 = Object.keys;
    var toObject4 = Object;
    var isEnumerable3 = Object.prototype.propertyIsEnumerable;
    var dataDesc2 = {
        value: void 0,
        writable: true,
        enumerable: true,
        configurable: true
    };
    var ArrayProto3 = Array.prototype;
    var objectValues = function values3(obj) {
        if (obj === null || obj === void 0) {
            throw new TypeError("Cannot convert undefined or null to object");
        }
        var object = toObject4(obj);
        var keys3 = ownKeys2(object);
        var out = [];
        var count = 0;
        for(var i = 0; i < keys3.length; i++){
            var key = keys3[i];
            if (isEnumerable3.call(object, key)) {
                if (!(count in ArrayProto3)) out[count++] = object[key];
                else {
                    dataDesc2.value = object[key];
                    Object.defineProperty(out, count++, dataDesc2);
                }
            }
        }
        dataDesc2.value = void 0;
        return out;
    };
    // src/modules/es.reflect.to-string-tag.ts
    var tagKey5 = typeof Symbol !== "undefined" ? Symbol.toStringTag : void 0;
    var isSupported44 = function isSupported44() {
        try {
            return !tagKey5 || typeof Reflect === "undefined" || Reflect[tagKey5] === "Reflect";
        } catch (unused) {
            return true;
        }
    };
    var install13 = function install13() {
        if (tagKey5 && typeof Reflect !== "undefined") {
            Object.defineProperty(Reflect, tagKey5, {
                configurable: true,
                value: "Reflect"
            });
        }
    };
    // src/modules/es.array.at.ts
    var isSupported45 = function isSupported45() {
        try {
            return typeof Array.prototype.at === "function";
        } catch (unused) {
            return false;
        }
    };
    var MAX_SAFE_LENGTH = 9007199254740991;
    var min = Math.min;
    var ceil = Math.ceil;
    var floor = Math.floor;
    var arrayAt = function arrayAt(index) {
        if (this === null || this === void 0) {
            throw new TypeError("Array.prototype.at called on null or undefined");
        }
        var object = Object(this);
        var length = +object.length;
        length = length !== length || length === 0 ? 0 : length < 0 ? ceil(length) : floor(length);
        length = length > 0 ? min(length, MAX_SAFE_LENGTH) : 0;
        var k = +index;
        k = k !== k || k === 0 ? 0 : k < 0 ? ceil(k) : floor(k);
        if (k < 0) k = length + k;
        if (k < 0 || k >= length) {
            return void 0;
        }
        return object[k];
    };
    // src/modules/es.array.concat.ts
    var isSupported46 = function isSupported46() {
        try {
            if (typeof Array.prototype.concat !== "function") {
                return false;
            }
            var symbols = typeof Symbol !== "undefined" ? Symbol : void 0;
            var key = symbols && symbols.isConcatSpreadable;
            if (!key) {
                return false;
            }
            var species = typeof Symbol !== "undefined" ? Symbol.species : void 0;
            if (!species) return false;
            var speciesDescriptor = Object.getOwnPropertyDescriptor(Array, species);
            if (!speciesDescriptor || typeof speciesDescriptor.get !== "function" || speciesDescriptor.get.__polyfilled === true) return false;
            var blocked = [
                1,
                2
            ];
            blocked[key] = false;
            if ([
                0
            ].concat(blocked).length !== 2) {
                return false;
            }
            var forced = {
                length: 2,
                0: 1,
                1: 2
            };
            forced[key] = true;
            if ([
                0
            ].concat(forced).length !== 3) {
                return false;
            }
            return true;
        } catch (unused) {
            return false;
        }
    };
    var dataDesc3 = {
        value: void 0,
        writable: true,
        enumerable: true,
        configurable: true
    };
    var ArrayProto4 = Array.prototype;
    var arrayConcat = function concat(_item) {
        if (this === null || this === void 0) {
            throw new TypeError("Array.prototype.concat called on null or undefined");
        }
        var object = Object(this);
        var result;
        var plain = true;
        if (!Array.isArray(object)) {
            result = new Array(0);
        } else {
            var ctor = object.constructor;
            if (ctor !== null && (typeof ctor === "object" || typeof ctor === "function")) {
                if (typeof Symbol !== "undefined" && Symbol.species) {
                    ctor = ctor[Symbol.species];
                    if (ctor === null) ctor = void 0;
                }
            } else if (ctor !== void 0) {
                throw new TypeError("Array.prototype.concat: constructor is not an object");
            }
            if (ctor === void 0 || ctor === Array) {
                result = new Array(0);
            } else {
                if (typeof ctor !== "function") throw new TypeError("Array.prototype.concat: @@species is not a constructor");
                result = new ctor(0);
                plain = false;
            }
        }
        var out = 0;
        var source = object;
        var argIndex = 0;
        while(true){
            var spreadable = false;
            if (source !== null && (typeof source === "object" || typeof source === "function")) {
                var flag = typeof Symbol !== "undefined" && Symbol.isConcatSpreadable ? source[Symbol.isConcatSpreadable] : void 0;
                spreadable = flag !== void 0 ? !!flag : Array.isArray(source);
            }
            if (spreadable) {
                var length = +source.length;
                length = length !== length || length <= 0 ? 0 : length > 9007199254740991 ? 9007199254740991 : Math.floor(length);
                if (out + length > 9007199254740991) {
                    throw new TypeError("Array.prototype.concat: result length exceeds 2^53-1");
                }
                for(var i = 0; i < length; i++){
                    if (i in source) {
                        if (plain && !(out in ArrayProto4)) result[out] = source[i];
                        else {
                            dataDesc3.value = source[i];
                            Object.defineProperty(result, out, dataDesc3);
                        }
                    }
                    out++;
                }
            } else {
                if (out >= 9007199254740991) {
                    throw new TypeError("Array.prototype.concat: result length exceeds 2^53-1");
                }
                if (plain && !(out in ArrayProto4)) result[out++] = source;
                else {
                    dataDesc3.value = source;
                    Object.defineProperty(result, out++, dataDesc3);
                }
            }
            if (argIndex >= arguments.length) {
                break;
            }
            source = arguments[argIndex++];
        }
        dataDesc3.value = void 0;
        result.length = out;
        return result;
    };
    // src/modules/es.array.copy-within.ts
    var isSupported47 = function isSupported47() {
        try {
            return typeof Array.prototype.copyWithin === "function";
        } catch (unused) {
            return false;
        }
    };
    var MAX_SAFE_LENGTH2 = 9007199254740991;
    var max = Math.max;
    var min2 = Math.min;
    var ceil2 = Math.ceil;
    var floor2 = Math.floor;
    var arrayCopyWithin = function copyWithin2(target, start) {
        var end = arguments.length > 2 ? arguments[2] : void 0;
        if (this === null || this === void 0) {
            throw new TypeError("Array.prototype.copyWithin called on null or undefined");
        }
        var object = Object(this);
        var length = +object.length;
        length = length !== length || length === 0 ? 0 : length < 0 ? ceil2(length) : floor2(length);
        length = length > 0 ? min2(length, MAX_SAFE_LENGTH2) : 0;
        var to = +target;
        to = to !== to || to === 0 ? 0 : to < 0 ? ceil2(to) : floor2(to);
        to = to < 0 ? max(to + length, 0) : min2(to, length);
        var from4 = +start;
        from4 = from4 !== from4 || from4 === 0 ? 0 : from4 < 0 ? ceil2(from4) : floor2(from4);
        from4 = from4 < 0 ? max(from4 + length, 0) : min2(from4, length);
        var final = length;
        if (end !== void 0) {
            final = +end;
            final = final !== final || final === 0 ? 0 : final < 0 ? ceil2(final) : floor2(final);
            final = final < 0 ? max(final + length, 0) : min2(final, length);
        }
        var count = min2(final - from4, length - to);
        var direction = 1;
        if (from4 < to && to < from4 + count) {
            direction = -1;
            from4 += count - 1;
            to += count - 1;
        }
        while(count-- > 0){
            if (from4 in object) object[to] = object[from4];
            else if (!delete object[to]) throw new TypeError("Cannot delete property");
            to += direction;
            from4 += direction;
        }
        return object;
    };
    // src/modules/es.array.every.ts
    var STOP = {};
    var isSupported48 = function isSupported48() {
        try {
            var method = Array.prototype.every;
            if (typeof method !== "function") return false;
            try {
                method.call(null, function() {
                    return 1;
                }, 1);
                return false;
            } catch (unused) {}
            var o = {
                length: 4294967297,
                0: 0,
                1: 1
            };
            try {
                method.call(o, function(_v, k) {
                    if (k === 1) throw STOP;
                    return true;
                });
                return false;
            } catch (e) {
                return e === STOP;
            }
        } catch (unused) {
            return false;
        }
    };
    var arrayEvery = function every2(callbackfn) {
        if (this === null || this === void 0) throw new TypeError("Array.prototype.every called on null or undefined");
        var O = Object(this);
        var length = +O.length;
        length = length !== length || length <= 0 ? 0 : length > 9007199254740991 ? 9007199254740991 : Math.floor(length);
        if (typeof callbackfn !== "function") throw new TypeError("Array.prototype.every: callback is not a function");
        var thisArg = arguments.length > 1 ? arguments[1] : void 0;
        for(var k = 0; k < length; k++){
            if (k in O && !(thisArg === void 0 ? callbackfn(O[k], k, O) : callbackfn.call(thisArg, O[k], k, O))) return false;
        }
        return true;
    };
    // src/modules/es.array.fill.ts
    var isSupported49 = function isSupported49() {
        try {
            return typeof Array.prototype.fill === "function";
        } catch (unused) {
            return false;
        }
    };
    var MAX_SAFE_LENGTH3 = 9007199254740991;
    var max2 = Math.max;
    var min3 = Math.min;
    var ceil3 = Math.ceil;
    var floor3 = Math.floor;
    var arrayFill = function fill2(value) {
        var start = arguments.length > 1 ? arguments[1] : void 0;
        var end = arguments.length > 2 ? arguments[2] : void 0;
        if (this === null || this === void 0) {
            throw new TypeError("Array.prototype.fill called on null or undefined");
        }
        var object = Object(this);
        var length = +object.length;
        length = length !== length || length === 0 ? 0 : length < 0 ? ceil3(length) : floor3(length);
        length = length > 0 ? min3(length, MAX_SAFE_LENGTH3) : 0;
        var index = +start;
        index = index !== index || index === 0 ? 0 : index < 0 ? ceil3(index) : floor3(index);
        index = index < 0 ? max2(index + length, 0) : min3(index, length);
        var endPosition = length;
        if (end !== void 0) {
            endPosition = +end;
            endPosition = endPosition !== endPosition || endPosition === 0 ? 0 : endPosition < 0 ? ceil3(endPosition) : floor3(endPosition);
            endPosition = endPosition < 0 ? max2(endPosition + length, 0) : min3(endPosition, length);
        }
        while(endPosition > index)object[index++] = value;
        return object;
    };
    // src/modules/es.array.filter.ts
    var isSupported50 = function isSupported50() {
        try {
            if (typeof Array.prototype.filter !== "function") return false;
            var species = typeof Symbol !== "undefined" ? Symbol.species : void 0;
            if (!species) return false;
            var descriptor = Object.getOwnPropertyDescriptor(Array, species);
            return !!descriptor && typeof descriptor.get === "function" && descriptor.get.__polyfilled !== true;
        } catch (unused) {
            return false;
        }
    };
    var dataDesc4 = {
        value: void 0,
        writable: true,
        enumerable: true,
        configurable: true
    };
    var ArrayProto5 = Array.prototype;
    var arrayFilter = function filter2(callbackfn) {
        if (this === null || this === void 0) throw new TypeError("Array.prototype.filter called on null or undefined");
        var O = Object(this);
        var length = +O.length;
        length = length !== length || length <= 0 ? 0 : length > 9007199254740991 ? 9007199254740991 : Math.floor(length);
        if (typeof callbackfn !== "function") throw new TypeError("Array.prototype.filter: callback is not a function");
        var thisArg = arguments.length > 1 ? arguments[1] : void 0;
        var A;
        var plain = true;
        if (!Array.isArray(O)) {
            A = new Array(0);
        } else {
            var C = O.constructor;
            if (C !== null && (typeof C === "object" || typeof C === "function")) {
                if (typeof Symbol !== "undefined" && Symbol.species) {
                    C = C[Symbol.species];
                    if (C === null) C = void 0;
                }
            } else if (C !== void 0) {
                throw new TypeError("Array.prototype.filter: constructor is not an object");
            }
            if (C === void 0 || C === Array) {
                A = new Array(0);
            } else {
                if (typeof C !== "function") throw new TypeError("Array.prototype.filter: @@species is not a constructor");
                A = new C(0);
                plain = false;
            }
        }
        var to = 0;
        for(var k = 0; k < length; k++){
            if (k in O) {
                var kValue = O[k];
                if (thisArg === void 0 ? callbackfn(kValue, k, O) : callbackfn.call(thisArg, kValue, k, O)) {
                    if (plain && !(to in ArrayProto5)) A[to++] = kValue;
                    else {
                        dataDesc4.value = kValue;
                        Object.defineProperty(A, to++, dataDesc4);
                    }
                }
            }
        }
        dataDesc4.value = void 0;
        return A;
    };
    // src/modules/es.array.find.ts
    var isSupported51 = function isSupported51() {
        try {
            if (typeof Array.prototype.find !== "function") return false;
            var skipsHoles = true;
            Array(1).find(function() {
                skipsHoles = false;
                return false;
            });
            return !skipsHoles;
        } catch (unused) {
            return false;
        }
    };
    var arrayFind = function find2(callbackfn) {
        if (this === null || this === void 0) throw new TypeError("Array.prototype.find called on null or undefined");
        var O = Object(this);
        var length = +O.length;
        length = length !== length || length <= 0 ? 0 : length > 9007199254740991 ? 9007199254740991 : Math.floor(length);
        if (typeof callbackfn !== "function") throw new TypeError("Array.prototype.find: callback is not a function");
        var thisArg = arguments.length > 1 ? arguments[1] : void 0;
        for(var k = 0; k < length; k++){
            var kValue = O[k];
            if (thisArg === void 0 ? callbackfn(kValue, k, O) : callbackfn.call(thisArg, kValue, k, O)) return kValue;
        }
        return void 0;
    };
    // src/modules/es.array.find-index.ts
    var isSupported52 = function isSupported52() {
        try {
            if (typeof Array.prototype.findIndex !== "function") return false;
            var skipsHoles = true;
            Array(1).findIndex(function() {
                skipsHoles = false;
                return false;
            });
            return !skipsHoles;
        } catch (unused) {
            return false;
        }
    };
    var arrayFindIndex = function findIndex2(callbackfn) {
        if (this === null || this === void 0) throw new TypeError("Array.prototype.findIndex called on null or undefined");
        var O = Object(this);
        var length = +O.length;
        length = length !== length || length <= 0 ? 0 : length > 9007199254740991 ? 9007199254740991 : Math.floor(length);
        if (typeof callbackfn !== "function") throw new TypeError("Array.prototype.findIndex: callback is not a function");
        var thisArg = arguments.length > 1 ? arguments[1] : void 0;
        for(var k = 0; k < length; k++){
            if (thisArg === void 0 ? callbackfn(O[k], k, O) : callbackfn.call(thisArg, O[k], k, O)) return k;
        }
        return -1;
    };
    // src/modules/es.array.find-last.ts
    var isSupported53 = function isSupported53() {
        try {
            return typeof Array.prototype.findLast === "function";
        } catch (unused) {
            return false;
        }
    };
    var arrayFindLast = function findLast2(callbackfn) {
        if (this === null || this === void 0) throw new TypeError("Array.prototype.findLast called on null or undefined");
        var O = Object(this);
        var length = +O.length;
        length = length !== length || length <= 0 ? 0 : length > 9007199254740991 ? 9007199254740991 : Math.floor(length);
        if (typeof callbackfn !== "function") throw new TypeError("Array.prototype.findLast: callback is not a function");
        var thisArg = arguments.length > 1 ? arguments[1] : void 0;
        for(var k = length - 1; k >= 0; k--){
            var kValue = O[k];
            if (thisArg === void 0 ? callbackfn(kValue, k, O) : callbackfn.call(thisArg, kValue, k, O)) return kValue;
        }
        return void 0;
    };
    // src/modules/es.array.find-last-index.ts
    var isSupported54 = function isSupported54() {
        try {
            return typeof Array.prototype.findLastIndex === "function";
        } catch (unused) {
            return false;
        }
    };
    var arrayFindLastIndex = function findLastIndex2(callbackfn) {
        if (this === null || this === void 0) throw new TypeError("Array.prototype.findLastIndex called on null or undefined");
        var O = Object(this);
        var length = +O.length;
        length = length !== length || length <= 0 ? 0 : length > 9007199254740991 ? 9007199254740991 : Math.floor(length);
        if (typeof callbackfn !== "function") throw new TypeError("Array.prototype.findLastIndex: callback is not a function");
        var thisArg = arguments.length > 1 ? arguments[1] : void 0;
        for(var k = length - 1; k >= 0; k--){
            if (thisArg === void 0 ? callbackfn(O[k], k, O) : callbackfn.call(thisArg, O[k], k, O)) return k;
        }
        return -1;
    };
    // src/modules/es.array.flat.ts
    var isSupported55 = function isSupported55() {
        try {
            return typeof Array.prototype.flat === "function";
        } catch (unused) {
            return false;
        }
    };
    var nativeIsArray = Array.isArray;
    var dataDesc5 = {
        value: void 0,
        writable: true,
        enumerable: true,
        configurable: true
    };
    var ArrayProto6 = Array.prototype;
    var arrayFlat = function flat() {
        if (this === null || this === void 0) {
            throw new TypeError("Array.prototype.flat called on null or undefined");
        }
        var O = Object(this);
        var rootLength = +O.length;
        rootLength = rootLength !== rootLength || rootLength <= 0 ? 0 : rootLength > 9007199254740991 ? 9007199254740991 : Math.floor(rootLength);
        var startDepth = 1;
        var depth3 = arguments.length > 0 ? arguments[0] : void 0;
        if (depth3 !== void 0) {
            startDepth = +depth3;
            startDepth = startDepth !== startDepth ? 0 : startDepth < 0 ? Math.ceil(startDepth) : Math.floor(startDepth);
        }
        var A;
        var plain = true;
        if (!nativeIsArray(O)) {
            A = [];
        } else {
            var C = O.constructor;
            if (C !== null && (typeof C === "object" || typeof C === "function")) {
                if (typeof Symbol !== "undefined" && Symbol.species) {
                    C = C[Symbol.species];
                    if (C === null) C = void 0;
                }
            } else if (C !== void 0) {
                throw new TypeError("Array.prototype.flat: constructor is not an object");
            }
            if (C === void 0 || C === Array) {
                A = [];
            } else {
                if (typeof C !== "function") throw new TypeError("Array.prototype.flat: @@species is not a constructor");
                A = new C(0);
                plain = false;
            }
        }
        var targetIndex = 0;
        var stack = [
            {
                array: O,
                index: 0,
                length: rootLength,
                depth: startDepth
            }
        ];
        while(stack.length > 0){
            var frame = stack[stack.length - 1];
            if (frame.index >= frame.length) {
                stack.pop();
                continue;
            }
            var currentIndex = frame.index++;
            if (!(currentIndex in frame.array)) {
                continue;
            }
            var value = frame.array[currentIndex];
            if (frame.depth > 0 && nativeIsArray(value)) {
                var innerLength = +value.length;
                innerLength = innerLength !== innerLength || innerLength <= 0 ? 0 : innerLength > 9007199254740991 ? 9007199254740991 : Math.floor(innerLength);
                stack.push({
                    array: value,
                    index: 0,
                    length: innerLength,
                    depth: frame.depth - 1
                });
            } else {
                if (targetIndex >= 9007199254740991) throw new TypeError("Array.prototype.flat: result too long");
                if (plain && !(targetIndex in ArrayProto6)) A[targetIndex++] = value;
                else {
                    dataDesc5.value = value;
                    Object.defineProperty(A, targetIndex++, dataDesc5);
                }
            }
        }
        dataDesc5.value = void 0;
        return A;
    };
    // src/modules/es.array.flat-map.ts
    var isSupported56 = function isSupported56() {
        try {
            return typeof Array.prototype.flatMap === "function";
        } catch (unused) {
            return false;
        }
    };
    var nativeIsArray2 = Array.isArray;
    var dataDesc6 = {
        value: void 0,
        writable: true,
        enumerable: true,
        configurable: true
    };
    var ArrayProto7 = Array.prototype;
    var arrayFlatMap = function flatMap(mapper) {
        if (this === null || this === void 0) {
            throw new TypeError("Array.prototype.flatMap called on null or undefined");
        }
        var O = Object(this);
        var length = +O.length;
        length = length !== length || length <= 0 ? 0 : length > 9007199254740991 ? 9007199254740991 : Math.floor(length);
        if (typeof mapper !== "function") {
            throw new TypeError("Array.prototype.flatMap: callback must be a function");
        }
        var thisArg = arguments.length > 1 ? arguments[1] : void 0;
        var A;
        var plain = true;
        if (!nativeIsArray2(O)) {
            A = [];
        } else {
            var C = O.constructor;
            if (C !== null && (typeof C === "object" || typeof C === "function")) {
                if (typeof Symbol !== "undefined" && Symbol.species) {
                    C = C[Symbol.species];
                    if (C === null) C = void 0;
                }
            } else if (C !== void 0) {
                throw new TypeError("Array.prototype.flatMap: constructor is not an object");
            }
            if (C === void 0 || C === Array) {
                A = [];
            } else {
                if (typeof C !== "function") throw new TypeError("Array.prototype.flatMap: @@species is not a constructor");
                A = new C(0);
                plain = false;
            }
        }
        var targetIndex = 0;
        for(var i = 0; i < length; i++){
            if (!(i in O)) {
                continue;
            }
            var mapped = thisArg === void 0 ? mapper(O[i], i, O) : mapper.call(thisArg, O[i], i, O);
            if (nativeIsArray2(mapped)) {
                var mappedLength = +mapped.length;
                mappedLength = mappedLength !== mappedLength || mappedLength <= 0 ? 0 : mappedLength > 9007199254740991 ? 9007199254740991 : Math.floor(mappedLength);
                for(var j = 0; j < mappedLength; j++){
                    if (j in mapped) {
                        if (targetIndex >= 9007199254740991) throw new TypeError("Array.prototype.flatMap: result too long");
                        if (plain && !(targetIndex in ArrayProto7)) A[targetIndex++] = mapped[j];
                        else {
                            dataDesc6.value = mapped[j];
                            Object.defineProperty(A, targetIndex++, dataDesc6);
                        }
                    }
                }
            } else {
                if (targetIndex >= 9007199254740991) throw new TypeError("Array.prototype.flatMap: result too long");
                if (plain && !(targetIndex in ArrayProto7)) A[targetIndex++] = mapped;
                else {
                    dataDesc6.value = mapped;
                    Object.defineProperty(A, targetIndex++, dataDesc6);
                }
            }
        }
        dataDesc6.value = void 0;
        return A;
    };
    // src/modules/es.array.for-each.ts
    var STOP2 = {};
    var isSupported57 = function isSupported57() {
        try {
            var method = Array.prototype.forEach;
            if (typeof method !== "function") return false;
            try {
                method.call(null, function() {
                    return 1;
                }, 1);
                return false;
            } catch (unused) {}
            var o = {
                length: 4294967297,
                0: 0,
                1: 1
            };
            try {
                method.call(o, function(_v, k) {
                    if (k === 1) throw STOP2;
                });
                return false;
            } catch (e) {
                return e === STOP2;
            }
        } catch (unused) {
            return false;
        }
    };
    var arrayForEach = function forEach3(callbackfn) {
        if (this === null || this === void 0) throw new TypeError("Array.prototype.forEach called on null or undefined");
        var O = Object(this);
        var length = +O.length;
        length = length !== length || length <= 0 ? 0 : length > 9007199254740991 ? 9007199254740991 : Math.floor(length);
        if (typeof callbackfn !== "function") throw new TypeError("Array.prototype.forEach: callback is not a function");
        var thisArg = arguments.length > 1 ? arguments[1] : void 0;
        for(var k = 0; k < length; k++){
            if (k in O) thisArg === void 0 ? callbackfn(O[k], k, O) : callbackfn.call(thisArg, O[k], k, O);
        }
    };
    // src/modules/es.array.from.ts
    var isSupported58 = function isSupported58() {
        try {
            if (typeof Array.from !== "function") return false;
            var iteratorKey4 = typeof Symbol !== "undefined" && Symbol.iterator ? Symbol.iterator : "@@iterator";
            var stepped = false;
            var nextCalls = 0;
            var closed = false;
            var iterable = {};
            iterable[iteratorKey4] = function() {
                return {
                    next: function next() {
                        nextCalls++;
                        stepped = true;
                        return {
                            value: 1,
                            done: nextCalls > 1
                        };
                    },
                    return: function _return() {
                        closed = true;
                        return {
                            value: void 0,
                            done: true
                        };
                    }
                };
            };
            try {
                Array.from(iterable, function() {
                    throw new Error("Array.from probe");
                });
            } catch (e) {}
            return stepped && closed;
        } catch (unused) {
            return false;
        }
    };
    var warnedAstralSplit = false;
    var dataDesc7 = {
        value: void 0,
        writable: true,
        enumerable: true,
        configurable: true
    };
    var ArrayProto8 = Array.prototype;
    var nativeConstruct = typeof Reflect !== "undefined" && typeof Reflect.construct === "function" ? Reflect.construct : void 0;
    var noArgs = [];
    var isConstructor3 = function isConstructor3(C) {
        if (typeof C !== "function") return false;
        if (nativeConstruct) {
            try {
                nativeConstruct(String, noArgs, C);
                return true;
            } catch (unused) {
                return false;
            }
        }
        return Object.prototype.hasOwnProperty.call(C, "prototype");
    };
    var arrayValues;
    var arrayIteratorProto;
    var arrayIteratorNext;
    var install14 = function install14() {
        capture();
        define(Array, "from", arrayFrom);
    };
    var capture = function capture() {
        var iteratorKey4 = typeof Symbol !== "undefined" && Symbol.iterator ? Symbol.iterator : "@@iterator";
        var values4 = ArrayProto8[iteratorKey4];
        if (typeof values4 !== "function") return;
        try {
            var proto2 = Object.getPrototypeOf(values4.call([]));
            if (typeof proto2.next !== "function") return;
            arrayValues = values4;
            arrayIteratorProto = proto2;
            arrayIteratorNext = proto2.next;
        } catch (unused) {}
    };
    var mapping = false;
    var fillFromIterator = function fillFromIterator(A, iterator, next8, mapfn, thisArg, plain) {
        var k = 0;
        while(true){
            mapping = false;
            var step = next8.call(iterator);
            if (step === null || typeof step !== "object" && typeof step !== "function") {
                throw new TypeError("Array.from: iterator result is not an object");
            }
            if (step.done) {
                A.length = k;
                return A;
            }
            var value = step.value;
            mapping = true;
            if (k >= 9007199254740991) throw new TypeError("Array.from: too many elements");
            if (plain && !(k in ArrayProto8)) A[k] = mapfn !== void 0 ? mapfn.call(thisArg, value, k) : value;
            else {
                dataDesc7.value = mapfn !== void 0 ? mapfn.call(thisArg, value, k) : value;
                Object.defineProperty(A, k, dataDesc7);
                dataDesc7.value = void 0;
            }
            k++;
        }
    };
    var RE_SURROGATE2 = /[\uD800-\uDFFF]/;
    var arrayFrom = function from2(items) {
        var C = this;
        var mapfn = arguments.length > 1 ? arguments[1] : void 0;
        var thisArg = arguments.length > 2 ? arguments[2] : void 0;
        if (mapfn !== void 0 && typeof mapfn !== "function") {
            throw new TypeError("Array.from: when provided, the second argument must be a function");
        }
        if (items === null || items === void 0) {
            throw new TypeError("Array.from requires an array-like or iterable object");
        }
        var usingIterator = typeof Symbol !== "undefined" && Symbol.iterator ? items[Symbol.iterator] : items["@@iterator"];
        if (usingIterator === null) usingIterator = void 0;
        if (usingIterator !== void 0 && typeof usingIterator !== "function") {
            throw new TypeError("Array.from: @@iterator is not a function");
        }
        if (usingIterator !== void 0) {
            var plain2 = !(C !== Array && isConstructor3(C));
            var A2 = plain2 ? [] : new C();
            if (usingIterator === arrayValues && Array.isArray(items) && arrayIteratorProto.next === arrayIteratorNext && (arrayIteratorProto["return"] === void 0 || arrayIteratorProto["return"] === null)) {
                var k = 0;
                while(true){
                    var length2 = +items.length;
                    length2 = length2 !== length2 || length2 <= 0 ? 0 : length2 > 9007199254740991 ? 9007199254740991 : Math.floor(length2);
                    if (k >= length2) break;
                    var value = items[k];
                    if (plain2 && !(k in ArrayProto8)) A2[k] = mapfn !== void 0 ? mapfn.call(thisArg, value, k) : value;
                    else {
                        dataDesc7.value = mapfn !== void 0 ? mapfn.call(thisArg, value, k) : value;
                        Object.defineProperty(A2, k, dataDesc7);
                        dataDesc7.value = void 0;
                    }
                    k++;
                }
                A2.length = k;
                return A2;
            }
            var iterator = usingIterator.call(items);
            if (iterator === null || typeof iterator !== "object" && typeof iterator !== "function") {
                throw new TypeError("Array.from: iterator is not an object");
            }
            var next8 = iterator.next;
            var saved = mapping;
            var result;
            try {
                result = fillFromIterator(A2, iterator, next8, mapfn, thisArg, plain2);
            } catch (error) {
                var closing = mapping;
                mapping = saved;
                dataDesc7.value = void 0;
                if (closing) {
                    var ret = iterator["return"];
                    if (ret !== void 0 && ret !== null) {
                        try {
                            ret.call(iterator);
                        } catch (unused) {}
                    }
                }
                throw error;
            }
            mapping = saved;
            return result;
        }
        if (typeof items === "string" && !warnedAstralSplit && RE_SURROGATE2.test(items)) {
            warnedAstralSplit = true;
            console.warn("[spackle] Array.from: no Symbol.iterator on this engine, so strings split by UTF-16 unit \u2014 astral characters break into surrogate halves");
        }
        var arrayLike = Object(items);
        var length = +arrayLike.length;
        length = length !== length || length <= 0 ? 0 : length > 9007199254740991 ? 9007199254740991 : Math.floor(length);
        var plain = !(C !== Array && isConstructor3(C));
        var A = plain ? new Array(length) : new C(length);
        for(var k1 = 0; k1 < length; k1++){
            var kValue = arrayLike[k1];
            if (plain && !(k1 in ArrayProto8)) A[k1] = mapfn !== void 0 ? mapfn.call(thisArg, kValue, k1) : kValue;
            else {
                dataDesc7.value = mapfn !== void 0 ? mapfn.call(thisArg, kValue, k1) : kValue;
                Object.defineProperty(A, k1, dataDesc7);
            }
        }
        dataDesc7.value = void 0;
        A.length = length;
        return A;
    };
    // src/modules/es.array.from-async.ts
    var isSupported59 = function isSupported59() {
        try {
            var fromAsync2 = Array.fromAsync;
            if (typeof fromAsync2 !== "function") return false;
            var counter3 = 0;
            fromAsync2.call(function() {
                counter3++;
                return [];
            }, {
                length: 0
            });
            return counter3 === 1;
        } catch (unused) {
            return false;
        }
    };
    var PUT = {
        value: void 0,
        writable: true,
        enumerable: true,
        configurable: true
    };
    var nativeConstruct2 = typeof Reflect !== "undefined" && typeof Reflect.construct === "function" ? Reflect.construct : void 0;
    var noArgs2 = [];
    var isConstructor4 = function isConstructor4(C) {
        if (typeof C !== "function") return false;
        if (nativeConstruct2) {
            try {
                nativeConstruct2(String, noArgs2, C);
                return true;
            } catch (unused) {
                return false;
            }
        }
        return Object.prototype.hasOwnProperty.call(C, "prototype");
    };
    var isObject5 = function isObject5(value) {
        return value !== null && (typeof value === "object" || typeof value === "function");
    };
    var arrayFromAsync = function fromAsync(asyncItems) {
        if (typeof Promise === "undefined") {
            throw new TypeError("Array.fromAsync requires Promise");
        }
        var C = this;
        var mapfn = arguments.length > 1 ? arguments[1] : void 0;
        var thisArg = arguments.length > 2 ? arguments[2] : void 0;
        return new Promise(function(resolve, reject) {
            if (mapfn !== void 0 && typeof mapfn !== "function") {
                throw new TypeError("Array.fromAsync: mapfn is not a function");
            }
            if (asyncItems === null || asyncItems === void 0) {
                throw new TypeError("Array.fromAsync called on null or undefined");
            }
            var asyncKey = typeof Symbol !== "undefined" ? Symbol.asyncIterator : void 0;
            var syncKey = typeof Symbol !== "undefined" ? Symbol.iterator : "@@iterator";
            var usingAsync = asyncKey ? asyncItems[asyncKey] : void 0;
            if (usingAsync === null) usingAsync = void 0;
            if (usingAsync !== void 0 && typeof usingAsync !== "function") {
                throw new TypeError("Array.fromAsync: @@asyncIterator is not a function");
            }
            var usingSync;
            if (usingAsync === void 0 && syncKey) {
                usingSync = asyncItems[syncKey];
                if (usingSync === null) usingSync = void 0;
                if (usingSync !== void 0 && typeof usingSync !== "function") {
                    throw new TypeError("Array.fromAsync: @@iterator is not a function");
                }
            }
            if (usingAsync !== void 0 || usingSync !== void 0) {
                var A2 = isConstructor4(C) ? new C() : [];
                var isAsync = usingAsync !== void 0;
                var iterator = (isAsync ? usingAsync : usingSync).call(asyncItems);
                if (!isObject5(iterator)) throw new TypeError("Array.fromAsync: iterator is not an object");
                var next8 = iterator.next;
                var k2 = 0;
                var closeThenReject = function closeThenReject(error) {
                    var closing;
                    try {
                        var ret = iterator["return"];
                        if (ret !== void 0 && ret !== null) closing = ret.call(iterator);
                    } catch (unused) {}
                    if (isAsync) {
                        Promise.resolve(closing).then(function() {
                            reject(error);
                        }, function() {
                            reject(error);
                        });
                    } else {
                        reject(error);
                    }
                };
                var store2 = function store2(value) {
                    try {
                        if (k2 >= 9007199254740991) throw new TypeError("Array.fromAsync: too many elements");
                        PUT.value = value;
                        Object.defineProperty(A2, k2, PUT);
                        PUT.value = void 0;
                    } catch (error) {
                        PUT.value = void 0;
                        closeThenReject(error);
                        return;
                    }
                    k2++;
                    step2();
                };
                var mapAndStore2 = function mapAndStore2(value) {
                    if (mapfn === void 0) {
                        store2(value);
                        return;
                    }
                    var mapped;
                    try {
                        mapped = mapfn.call(thisArg, value, k2);
                    } catch (error) {
                        closeThenReject(error);
                        return;
                    }
                    Promise.resolve(mapped).then(store2, closeThenReject);
                };
                var onResult = function onResult(result) {
                    try {
                        if (!isObject5(result)) throw new TypeError("Array.fromAsync: iterator result is not an object");
                        if (result.done) {
                            A2.length = k2;
                            resolve(A2);
                            return;
                        }
                        var value = result.value;
                        if (isAsync) {
                            mapAndStore2(value);
                        } else {
                            Promise.resolve(value).then(mapAndStore2, closeThenReject);
                        }
                    } catch (error) {
                        reject(error);
                    }
                };
                var step2 = function step2() {
                    var result;
                    try {
                        result = next8.call(iterator);
                    } catch (error) {
                        reject(error);
                        return;
                    }
                    if (isAsync) Promise.resolve(result).then(onResult, reject);
                    else onResult(result);
                };
                step2();
                return;
            }
            var arrayLike = Object(asyncItems);
            var length = +arrayLike.length;
            length = length !== length || length <= 0 ? 0 : length > 9007199254740991 ? 9007199254740991 : Math.floor(length);
            var A = isConstructor4(C) ? new C(length) : new Array(length);
            var k = 0;
            var store = function store(value) {
                try {
                    PUT.value = value;
                    Object.defineProperty(A, k, PUT);
                    PUT.value = void 0;
                } catch (error) {
                    PUT.value = void 0;
                    reject(error);
                    return;
                }
                k++;
                step();
            };
            var mapAndStore = function mapAndStore(value) {
                if (mapfn === void 0) {
                    store(value);
                    return;
                }
                var mapped;
                try {
                    mapped = mapfn.call(thisArg, value, k);
                } catch (error) {
                    reject(error);
                    return;
                }
                Promise.resolve(mapped).then(store, reject);
            };
            var step = function step() {
                try {
                    if (k >= length) {
                        A.length = length;
                        resolve(A);
                        return;
                    }
                    Promise.resolve(arrayLike[k]).then(mapAndStore, reject);
                } catch (error) {
                    reject(error);
                }
            };
            step();
        });
    };
    // src/modules/es.array.includes.ts
    var isSupported60 = function isSupported60() {
        try {
            return typeof Array.prototype.includes === "function";
        } catch (unused) {
            return false;
        }
    };
    var MAX_SAFE_LENGTH4 = 9007199254740991;
    var floor4 = Math.floor;
    var arrayIncludes = function includes2(searchElement) {
        if (this === null || this === void 0) {
            throw new TypeError("Array.prototype.includes called on null or undefined");
        }
        var O = Object(this);
        var length = +O.length;
        length = length !== length || length <= 0 ? 0 : length > MAX_SAFE_LENGTH4 ? MAX_SAFE_LENGTH4 : floor4(length);
        if (length === 0) {
            return false;
        }
        var position = arguments.length > 1 ? +arguments[1] : 0;
        if (position !== position) {
            position = 0;
        }
        if (position >= 0) {
            position = Math.floor(position);
        } else {
            position = Math.ceil(position);
        }
        var start = position;
        if (position < 0) {
            start = length + position;
        }
        if (start < 0) {
            start = 0;
        }
        for(var i = start; i < length; i++){
            var element = O[i];
            if (element === searchElement || // SameValueZero: NaN matches NaN.
            element !== element && searchElement !== searchElement) {
                return true;
            }
        }
        return false;
    };
    // src/modules/es.array.index-of.ts
    var isSupported61 = function isSupported61() {
        try {
            if (typeof Array.prototype.indexOf !== "function") return false;
            if (1 / Array.prototype.indexOf.call([
                1
            ], 1, -0) < 0) return false;
            var o = {
                length: -1,
                4294967294: "x"
            };
            return Array.prototype.indexOf.call(o, "x", 4294967294) === -1;
        } catch (unused) {
            return false;
        }
    };
    var arrayIndexOf = function indexOf2(searchElement) {
        if (this === null || this === void 0) {
            throw new TypeError("Array.prototype.indexOf called on null or undefined");
        }
        var object = Object(this);
        var length = +object.length;
        length = length !== length || length <= 0 ? 0 : length > 9007199254740991 ? 9007199254740991 : Math.floor(length);
        if (length === 0) {
            return -1;
        }
        var start = arguments.length > 1 ? +arguments[1] : 0;
        start = (start !== start ? 0 : start < 0 ? Math.ceil(start) : Math.floor(start)) + 0;
        if (start >= length) {
            return -1;
        }
        if (start < 0) {
            start = Math.max(length + start, 0);
        }
        for(var i = start; i < length; i++){
            if (i in object && object[i] === searchElement) {
                return i;
            }
        }
        return -1;
    };
    // src/modules/es.array.iterator.ts
    var returnSelf3 = function returnSelf3() {
        return this;
    };
    var findIteratorPrototype = function findIteratorPrototype() {
        var key = typeof Symbol !== "undefined" ? Symbol.iterator : void 0;
        if (!key) return Object.prototype;
        var g = typeof window !== "undefined" ? window : globalThis;
        var samples = [
            function() {
                return ""[key]();
            },
            function() {
                return new g.Map()[key]();
            },
            function() {
                return new g.Set()[key]();
            }
        ];
        for(var i = 0; i < samples.length; i++){
            try {
                var proto2 = Object.getPrototypeOf(Object.getPrototypeOf(samples[i]()));
                if (proto2 && proto2 !== Object.prototype) return proto2;
            } catch (e) {}
        }
        return Object.prototype;
    };
    var ArrayIteratorPrototype = Object.create(findIteratorPrototype());
    var hasOwn10 = Object.prototype.hasOwnProperty;
    var arrayIteratorNext2 = function next5() {
        if (this === null || typeof this !== "object" || !hasOwn10.call(this, "_kind")) {
            throw new TypeError("next method called on an object that is not an Array Iterator");
        }
        var object = this._object;
        if (object === null) {
            return {
                value: void 0,
                done: true
            };
        }
        var length = +object.length;
        length = length !== length || length <= 0 ? 0 : length > 9007199254740991 ? 9007199254740991 : Math.floor(length);
        if (this._index >= length) {
            this._object = null;
            return {
                value: void 0,
                done: true
            };
        }
        var index = this._index++;
        var kind = this._kind;
        if (kind === "keys") {
            return {
                value: index,
                done: false
            };
        }
        if (kind === "values") {
            return {
                value: object[index],
                done: false
            };
        }
        return {
            value: [
                index,
                object[index]
            ],
            done: false
        };
    };
    try {
        Object.defineProperty(arrayIteratorNext2, "name", {
            value: "next",
            configurable: true
        });
    } catch (e) {}
    Object.defineProperty(ArrayIteratorPrototype, "next", {
        value: arrayIteratorNext2,
        writable: true,
        enumerable: false,
        configurable: true
    });
    if (typeof Symbol !== "undefined" && Symbol.toStringTag) {
        Object.defineProperty(ArrayIteratorPrototype, Symbol.toStringTag, {
            value: "Array Iterator",
            writable: false,
            enumerable: false,
            configurable: true
        });
    }
    var slotDesc = {
        value: void 0,
        writable: true,
        enumerable: false,
        configurable: false
    };
    var makeIterator3 = function makeIterator3(object, kind) {
        var iterator = Object.create(ArrayIteratorPrototype);
        slotDesc.value = object;
        Object.defineProperty(iterator, "_object", slotDesc);
        slotDesc.value = 0;
        Object.defineProperty(iterator, "_index", slotDesc);
        slotDesc.value = kind;
        Object.defineProperty(iterator, "_kind", slotDesc);
        slotDesc.value = void 0;
        return iterator;
    };
    if (typeof Symbol !== "undefined" && Symbol.iterator) {
        Object.defineProperty(ArrayIteratorPrototype, Symbol.iterator, {
            value: returnSelf3,
            writable: true,
            enumerable: false,
            configurable: true
        });
    }
    var arrayKeys = function arrayKeys() {
        if (this === null || this === void 0) {
            throw new TypeError("Array.prototype.keys called on null or undefined");
        }
        return makeIterator3(Object(this), "keys");
    };
    var arrayValues2 = function arrayValues2() {
        if (this === null || this === void 0) {
            throw new TypeError("Array.prototype.values called on null or undefined");
        }
        return makeIterator3(Object(this), "values");
    };
    var arrayEntries = function arrayEntries() {
        if (this === null || this === void 0) {
            throw new TypeError("Array.prototype.entries called on null or undefined");
        }
        return makeIterator3(Object(this), "entries");
    };
    var install15 = function install15() {
        var iteratorKey4 = typeof Symbol !== "undefined" ? Symbol.iterator : void 0;
        var buggyNative = false;
        try {
            buggyNative = typeof Array.prototype.keys === "function" && !("next" in Array.prototype.keys.call([]));
        } catch (e) {
            buggyNative = true;
        }
        if (buggyNative) {
            delete Array.prototype.keys;
            delete Array.prototype.values;
            delete Array.prototype.entries;
        }
        var nativeIterator = iteratorKey4 && !buggyNative ? Array.prototype[iteratorKey4] : void 0;
        if (typeof Array.prototype.keys !== "function") {
            Object.defineProperty(Array.prototype, "keys", {
                value: arrayKeys,
                writable: true,
                enumerable: false,
                configurable: true
            });
            try {
                Object.defineProperty(Array.prototype.keys, "name", {
                    value: "keys",
                    configurable: true
                });
            } catch (e) {}
            Object.defineProperty(Array.prototype.keys, "__polyfilled", {
                value: true
            });
        }
        if (typeof Array.prototype.values !== "function") {
            if (typeof nativeIterator === "function") {
                var valuesMethod = nativeIterator.name === "values" ? nativeIterator : ({
                    values: function values() {
                        return nativeIterator.call(this);
                    }
                }).values;
                Object.defineProperty(Array.prototype, "values", {
                    value: valuesMethod,
                    writable: true,
                    enumerable: false,
                    configurable: true
                });
                if (valuesMethod !== nativeIterator) {
                    Object.defineProperty(valuesMethod, "__polyfilled", {
                        value: true
                    });
                    Object.defineProperty(Array.prototype, iteratorKey4, {
                        value: valuesMethod,
                        writable: true,
                        enumerable: false,
                        configurable: true
                    });
                }
            } else {
                Object.defineProperty(Array.prototype, "values", {
                    value: arrayValues2,
                    writable: true,
                    enumerable: false,
                    configurable: true
                });
                try {
                    Object.defineProperty(Array.prototype.values, "name", {
                        value: "values",
                        configurable: true
                    });
                } catch (e) {}
                Object.defineProperty(Array.prototype.values, "__polyfilled", {
                    value: true
                });
            }
        }
        if (typeof Array.prototype.entries !== "function") {
            Object.defineProperty(Array.prototype, "entries", {
                value: arrayEntries,
                writable: true,
                enumerable: false,
                configurable: true
            });
            try {
                Object.defineProperty(Array.prototype.entries, "name", {
                    value: "entries",
                    configurable: true
                });
            } catch (e) {}
            Object.defineProperty(Array.prototype.entries, "__polyfilled", {
                value: true
            });
        }
        if (typeof Symbol !== "undefined" && Symbol.iterator && (buggyNative || !Array.prototype[Symbol.iterator])) {
            Object.defineProperty(Array.prototype, Symbol.iterator, {
                value: Array.prototype.values,
                writable: true,
                enumerable: false,
                configurable: true
            });
        }
        var tag = typeof Symbol !== "undefined" ? Symbol.toStringTag : void 0;
        if (tag && typeof nativeIterator === "function") {
            var proto2 = Object.getPrototypeOf(nativeIterator.call([]));
            if (proto2 !== Object.prototype && !Object.prototype.hasOwnProperty.call(proto2, tag)) {
                Object.defineProperty(proto2, tag, {
                    value: "Array Iterator",
                    writable: false,
                    enumerable: false,
                    configurable: true
                });
            }
        }
    };
    // src/modules/es.array.join.ts
    var nativeJoin = Array.prototype.join;
    var STOP3 = {};
    var isSupported62 = function isSupported62() {
        try {
            if (typeof nativeJoin !== "function") return false;
            if (!Object("z").propertyIsEnumerable(0)) return false;
            try {
                nativeJoin.call(null, ",");
                return false;
            } catch (unused) {}
            var o = {
                length: 4294967297,
                0: "a"
            };
            Object.defineProperty(o, 1, {
                get: function get() {
                    throw STOP3;
                },
                configurable: true
            });
            try {
                nativeJoin.call(o, ",");
                return false;
            } catch (e) {
                return true;
            }
        } catch (unused) {
            return false;
        }
    };
    var toStr = function toStr(value) {
        if (typeof value === "symbol") throw new TypeError("Cannot convert a Symbol value to a string");
        return typeof value === "string" ? value : String(value);
    };
    var joining = [];
    var depth = 0;
    var joinLoop = function joinLoop(O, len, sep) {
        var result = "";
        for(var k = 0; k < len; k++){
            if (k > 0) result += sep;
            var element = O[k];
            if (element !== null && element !== void 0) result += toStr(element);
        }
        return result;
    };
    var arrayJoin = function join2(separator) {
        if (this === null || this === void 0) {
            throw new TypeError("Array.prototype.join called on null or undefined");
        }
        var O = typeof this === "string" ? this.split("") : Object(this);
        if (Array.isArray(O)) return nativeJoin.call(O, separator === void 0 ? "," : separator);
        var len = +O.length;
        len = len !== len || len <= 0 ? 0 : len > 9007199254740991 ? 9007199254740991 : Math.floor(len);
        var sep = separator === void 0 ? "," : toStr(separator);
        for(var i = 0; i < depth; i++){
            if (joining[i] === O) return "";
        }
        joining[depth++] = O;
        var result;
        try {
            result = joinLoop(O, len, sep);
        } catch (error) {
            joining[--depth] = void 0;
            throw error;
        }
        joining[--depth] = void 0;
        return result;
    };
    // src/modules/es.array.last-index-of.ts
    var isSupported63 = function isSupported63() {
        try {
            if (typeof Array.prototype.lastIndexOf !== "function") return false;
            if (1 / Array.prototype.lastIndexOf.call([
                1
            ], 1, -0) < 0) return false;
            try {
                Array.prototype.lastIndexOf.call(null, 1);
                return false;
            } catch (unused) {}
            var o = {
                length: -1,
                4294967294: "x"
            };
            return Array.prototype.lastIndexOf.call(o, "x") === -1;
        } catch (unused) {
            return false;
        }
    };
    var arrayLastIndexOf = function lastIndexOf2(searchElement) {
        if (this === null || this === void 0) {
            throw new TypeError("Array.prototype.lastIndexOf called on null or undefined");
        }
        var object = Object(this);
        var length = +object.length;
        length = length !== length || length <= 0 ? 0 : length > 9007199254740991 ? 9007199254740991 : Math.floor(length);
        if (length === 0) {
            return -1;
        }
        var start = length - 1;
        if (arguments.length > 1) {
            start = +arguments[1];
            start = (start !== start ? 0 : start < 0 ? Math.ceil(start) : Math.floor(start)) + 0;
        }
        if (start >= 0) {
            start = Math.min(start, length - 1);
        } else {
            start = length + start;
        }
        for(var i = start; i >= 0; i--){
            if (i in object && object[i] === searchElement) {
                return i;
            }
        }
        return -1;
    };
    // src/modules/es.array.map.ts
    var isSupported64 = function isSupported64() {
        try {
            if (typeof Array.prototype.map !== "function") return false;
            var species = typeof Symbol !== "undefined" ? Symbol.species : void 0;
            if (!species) return false;
            var descriptor = Object.getOwnPropertyDescriptor(Array, species);
            return !!descriptor && typeof descriptor.get === "function" && descriptor.get.__polyfilled !== true;
        } catch (unused) {
            return false;
        }
    };
    var dataDesc8 = {
        value: void 0,
        writable: true,
        enumerable: true,
        configurable: true
    };
    var ArrayProto9 = Array.prototype;
    var arrayMap = function map2(callbackfn) {
        if (this === null || this === void 0) throw new TypeError("Array.prototype.map called on null or undefined");
        var O = Object(this);
        var length = +O.length;
        length = length !== length || length <= 0 ? 0 : length > 9007199254740991 ? 9007199254740991 : Math.floor(length);
        if (typeof callbackfn !== "function") throw new TypeError("Array.prototype.map: callback is not a function");
        var thisArg = arguments.length > 1 ? arguments[1] : void 0;
        var A;
        var plain = true;
        if (!Array.isArray(O)) {
            A = new Array(length);
        } else {
            var C = O.constructor;
            if (C !== null && (typeof C === "object" || typeof C === "function")) {
                if (typeof Symbol !== "undefined" && Symbol.species) {
                    C = C[Symbol.species];
                    if (C === null) C = void 0;
                }
            } else if (C !== void 0) {
                throw new TypeError("Array.prototype.map: constructor is not an object");
            }
            if (C === void 0 || C === Array) {
                A = new Array(length);
            } else {
                if (typeof C !== "function") throw new TypeError("Array.prototype.map: @@species is not a constructor");
                A = new C(length);
                plain = false;
            }
        }
        for(var k = 0; k < length; k++){
            if (k in O) {
                if (plain && !(k in ArrayProto9)) A[k] = thisArg === void 0 ? callbackfn(O[k], k, O) : callbackfn.call(thisArg, O[k], k, O);
                else {
                    dataDesc8.value = thisArg === void 0 ? callbackfn(O[k], k, O) : callbackfn.call(thisArg, O[k], k, O);
                    Object.defineProperty(A, k, dataDesc8);
                }
            }
        }
        dataDesc8.value = void 0;
        return A;
    };
    // src/modules/es.array.of.ts
    var isSupported65 = function isSupported65() {
        try {
            if (typeof Array.of !== "function") return false;
            var Sub = function Sub() {};
            var result = Array.of.call(Sub, 1, 2);
            return result instanceof Sub && result.length === 2 && result[0] === 1 && result[1] === 2;
        } catch (unused) {
            return false;
        }
    };
    var dataDesc9 = {
        value: void 0,
        writable: true,
        enumerable: true,
        configurable: true
    };
    var ArrayProto10 = Array.prototype;
    var nativeConstruct3 = typeof Reflect !== "undefined" && typeof Reflect.construct === "function" ? Reflect.construct : void 0;
    var noArgs3 = [];
    var isConstructor5 = function isConstructor5(C) {
        if (typeof C !== "function") return false;
        if (nativeConstruct3) {
            try {
                nativeConstruct3(String, noArgs3, C);
                return true;
            } catch (unused) {
                return false;
            }
        }
        return Object.prototype.hasOwnProperty.call(C, "prototype");
    };
    var arrayOf = function of2() {
        var C = this;
        var len = arguments.length;
        var plain = !(C !== Array && isConstructor5(C));
        var A = plain ? new Array(len) : new C(len);
        for(var k = 0; k < len; k++){
            if (plain && !(k in ArrayProto10)) A[k] = arguments[k];
            else {
                dataDesc9.value = arguments[k];
                Object.defineProperty(A, k, dataDesc9);
            }
        }
        dataDesc9.value = void 0;
        A.length = len;
        return A;
    };
    // src/modules/es.array.push.ts
    var nativePush = Array.prototype.push;
    var isSupported66 = function isSupported66() {
        try {
            if (typeof nativePush !== "function") return false;
            if (nativePush.call({
                length: 4294967296
            }, 1) !== 4294967297) return false;
            try {
                Object.defineProperty([], "length", {
                    writable: false
                }).push();
                return false;
            } catch (error) {
                return error instanceof TypeError;
            }
        } catch (unused) {
            return false;
        }
    };
    var SILENT_LENGTH_SET = function() {
        try {
            Object.defineProperty([], "length", {
                writable: false
            }).length = 1;
            return true;
        } catch (e) {
            return false;
        }
    }();
    var arrayPush = function push(_item) {
        if (this === null || this === void 0) throw new TypeError("Cannot convert undefined or null to object");
        var O = Object(this);
        var len = +O.length;
        len = len !== len || len <= 0 ? 0 : len > 9007199254740991 ? 9007199254740991 : Math.floor(len);
        var argCount = arguments.length;
        if (len + argCount > 9007199254740991) throw new TypeError("Maximum allowed index exceeded");
        for(var i = 0; i < argCount; i++){
            O[len] = arguments[i];
            len++;
        }
        if (SILENT_LENGTH_SET && Array.isArray(O) && !Object.getOwnPropertyDescriptor(O, "length").writable) {
            throw new TypeError("Cannot set read only .length");
        }
        O.length = len;
        if (O.length !== len && Array.isArray(O)) throw new TypeError("Cannot set read only .length");
        return len;
    };
    // src/modules/es.array.reduce.ts
    var STOP4 = {};
    var isSupported67 = function isSupported67() {
        try {
            var method = Array.prototype.reduce;
            if (typeof method !== "function") return false;
            var chrome = /Chrome\/(\d+)/.exec(window.navigator && window.navigator.userAgent || "");
            if (chrome && +chrome[1] > 79 && +chrome[1] < 83) return false;
            try {
                method.call(null, function() {
                    return 1;
                }, 1);
                return false;
            } catch (unused) {}
            var o = {
                length: 4294967297,
                0: 0,
                1: 1
            };
            try {
                method.call(o, function(_a, _v, k) {
                    if (k === 1) throw STOP4;
                }, 0);
                return false;
            } catch (e) {
                return e === STOP4;
            }
        } catch (unused) {
            return false;
        }
    };
    var arrayReduce = function reduce2(callbackfn) {
        if (this === null || this === void 0) throw new TypeError("Array.prototype.reduce called on null or undefined");
        var O = Object(this);
        var length = +O.length;
        length = length !== length || length <= 0 ? 0 : length > 9007199254740991 ? 9007199254740991 : Math.floor(length);
        if (typeof callbackfn !== "function") throw new TypeError("Array.prototype.reduce: callback is not a function");
        var k = 0;
        var accumulator;
        if (arguments.length > 1) {
            accumulator = arguments[1];
        } else {
            var present = false;
            for(; !present && k < length; k++){
                if (k in O) {
                    present = true;
                    accumulator = O[k];
                }
            }
            if (!present) throw new TypeError("Reduce of empty array with no initial value");
        }
        for(; k < length; k++){
            if (k in O) accumulator = callbackfn(accumulator, O[k], k, O);
        }
        return accumulator;
    };
    // src/modules/es.array.reduce-right.ts
    var STOP5 = {};
    var isSupported68 = function isSupported68() {
        try {
            var method = Array.prototype.reduceRight;
            if (typeof method !== "function") return false;
            var chrome = /Chrome\/(\d+)/.exec(window.navigator && window.navigator.userAgent || "");
            if (chrome && +chrome[1] > 79 && +chrome[1] < 83) return false;
            try {
                method.call(null, function() {
                    return 1;
                }, 1);
                return false;
            } catch (unused) {}
            var o = {
                length: -1
            };
            Object.defineProperty(o, 4294967294, {
                get: function get() {
                    throw STOP5;
                },
                configurable: true
            });
            return method.call(o, function() {
                return 1;
            }, 0) === 0;
        } catch (unused) {
            return false;
        }
    };
    var arrayReduceRight = function reduceRight2(callbackfn) {
        if (this === null || this === void 0) throw new TypeError("Array.prototype.reduceRight called on null or undefined");
        var O = Object(this);
        var length = +O.length;
        length = length !== length || length <= 0 ? 0 : length > 9007199254740991 ? 9007199254740991 : Math.floor(length);
        if (typeof callbackfn !== "function") throw new TypeError("Array.prototype.reduceRight: callback is not a function");
        var k = length - 1;
        var accumulator;
        if (arguments.length > 1) {
            accumulator = arguments[1];
        } else {
            var present = false;
            for(; !present && k >= 0; k--){
                if (k in O) {
                    present = true;
                    accumulator = O[k];
                }
            }
            if (!present) throw new TypeError("Reduce of empty array with no initial value");
        }
        for(; k >= 0; k--){
            if (k in O) accumulator = callbackfn(accumulator, O[k], k, O);
        }
        return accumulator;
    };
    // src/modules/es.array.reverse.ts
    var nativeReverse = Array.prototype.reverse;
    var reversesCorrectly = function reversesCorrectly() {
        try {
            var test = [
                1,
                2
            ];
            return String(test) !== String(test.reverse());
        } catch (unused) {
            return false;
        }
    };
    var SAFARI_12_BUG = typeof nativeReverse === "function" && !reversesCorrectly();
    var STOP6 = {};
    var isSupported69 = function isSupported69() {
        try {
            if (typeof nativeReverse !== "function" || SAFARI_12_BUG) return false;
            var o = {
                length: 4294967297
            };
            Object.defineProperty(o, 0, {
                get: function get() {
                    throw STOP6;
                },
                configurable: true
            });
            try {
                nativeReverse.call(o);
                return false;
            } catch (e) {
                return e === STOP6;
            }
        } catch (unused) {
            return false;
        }
    };
    var arrayReverse = function reverse2() {
        if (this === null || this === void 0) throw new TypeError("Array.prototype.reverse called on null or undefined");
        var O = Object(this);
        if (Array.isArray(O)) {
            if (SAFARI_12_BUG) O.length = O.length;
            return nativeReverse.call(O);
        }
        var len = +O.length;
        len = len !== len || len <= 0 ? 0 : len > 9007199254740991 ? 9007199254740991 : Math.floor(len);
        var middle = Math.floor(len / 2);
        for(var lower = 0; lower !== middle; lower++){
            var upper = len - lower - 1;
            var lowerExists = lower in O;
            var lowerValue = lowerExists ? O[lower] : void 0;
            var upperExists = upper in O;
            var upperValue = upperExists ? O[upper] : void 0;
            if (lowerExists && upperExists) {
                O[lower] = upperValue;
                O[upper] = lowerValue;
            } else if (upperExists) {
                O[lower] = upperValue;
                delete O[upper];
            } else if (lowerExists) {
                delete O[lower];
                O[upper] = lowerValue;
            }
        }
        return O;
    };
    // src/modules/es.array.slice.ts
    var isSupported70 = function isSupported70() {
        try {
            if (typeof Array.prototype.slice !== "function") return false;
            var species = typeof Symbol !== "undefined" ? Symbol.species : void 0;
            if (!species) return false;
            var speciesDescriptor = Object.getOwnPropertyDescriptor(Array, species);
            if (!speciesDescriptor || typeof speciesDescriptor.get !== "function" || speciesDescriptor.get.__polyfilled === true) return false;
            var o = {
                length: -1,
                4294967294: "x"
            };
            return Array.prototype.slice.call(o, 4294967294).length === 0;
        } catch (unused) {
            return false;
        }
    };
    var dataDesc10 = {
        value: void 0,
        writable: true,
        enumerable: true,
        configurable: true
    };
    var ArrayProto11 = Array.prototype;
    var arraySlice = function slice2(start, end) {
        if (this === null || this === void 0) {
            throw new TypeError("Array.prototype.slice called on null or undefined");
        }
        var object = Object(this);
        var length = +object.length;
        length = length !== length || length <= 0 ? 0 : length > 9007199254740991 ? 9007199254740991 : Math.floor(length);
        var from4 = +start;
        from4 = from4 !== from4 ? 0 : from4 < 0 ? Math.ceil(from4) : Math.floor(from4);
        from4 = from4 < 0 ? Math.max(length + from4, 0) : Math.min(from4, length);
        var to = length;
        if (end !== void 0) {
            to = +end;
            to = to !== to ? 0 : to < 0 ? Math.ceil(to) : Math.floor(to);
        }
        to = to < 0 ? Math.max(length + to, 0) : Math.min(to, length);
        var count = Math.max(to - from4, 0);
        var result;
        var plain = true;
        if (!Array.isArray(object)) {
            result = new Array(count);
        } else {
            var ctor = object.constructor;
            if (ctor !== null && (typeof ctor === "object" || typeof ctor === "function")) {
                if (typeof Symbol !== "undefined" && Symbol.species) {
                    ctor = ctor[Symbol.species];
                    if (ctor === null) ctor = void 0;
                }
            } else if (ctor !== void 0) {
                throw new TypeError("Array.prototype.slice: constructor is not an object");
            }
            if (ctor === void 0 || ctor === Array) {
                result = new Array(count);
            } else {
                if (typeof ctor !== "function") throw new TypeError("Array.prototype.slice: @@species is not a constructor");
                result = new ctor(count);
                plain = false;
            }
        }
        var out = 0;
        for(var i = from4; i < to; i++){
            if (i in object) {
                if (plain && !(out in ArrayProto11)) result[out] = object[i];
                else {
                    dataDesc10.value = object[i];
                    Object.defineProperty(result, out, dataDesc10);
                }
            }
            out++;
        }
        dataDesc10.value = void 0;
        result.length = count;
        return result;
    };
    // src/modules/es.array.some.ts
    var STOP7 = {};
    var isSupported71 = function isSupported71() {
        try {
            var method = Array.prototype.some;
            if (typeof method !== "function") return false;
            try {
                method.call(null, function() {
                    return 1;
                }, 1);
                return false;
            } catch (unused) {}
            var o = {
                length: 4294967297,
                0: 0,
                1: 1
            };
            try {
                method.call(o, function(_v, k) {
                    if (k === 1) throw STOP7;
                    return false;
                });
                return false;
            } catch (e) {
                return e === STOP7;
            }
        } catch (unused) {
            return false;
        }
    };
    var arraySome = function some2(callbackfn) {
        if (this === null || this === void 0) throw new TypeError("Array.prototype.some called on null or undefined");
        var O = Object(this);
        var length = +O.length;
        length = length !== length || length <= 0 ? 0 : length > 9007199254740991 ? 9007199254740991 : Math.floor(length);
        if (typeof callbackfn !== "function") throw new TypeError("Array.prototype.some: callback is not a function");
        var thisArg = arguments.length > 1 ? arguments[1] : void 0;
        for(var k = 0; k < length; k++){
            if (k in O && (thisArg === void 0 ? callbackfn(O[k], k, O) : callbackfn.call(thisArg, O[k], k, O))) return true;
        }
        return false;
    };
    // src/modules/es.array.sort.ts
    var isSupported72 = function isSupported72() {
        try {
            if (typeof Array.prototype.sort !== "function") {
                return false;
            }
            var items = [];
            for(var i = 0; i < 16; i++){
                items.push({
                    key: i % 2,
                    tag: i
                });
            }
            items.sort(function(a, b) {
                return a.key - b.key;
            });
            for(var i1 = 1; i1 < items.length; i1++){
                if (items[i1].key === items[i1 - 1].key && items[i1].tag < items[i1 - 1].tag) {
                    return false;
                }
            }
            var test = [];
            test.sort(void 0);
            try {
                test.sort(null);
                return false;
            } catch (e) {}
            try {
                Array.prototype.sort.call(null, function() {
                    return 1;
                });
                return false;
            } catch (e) {}
            var big = [];
            for(var code = 65; code < 76; code++){
                var chr = String.fromCharCode(code);
                var v = code === 66 || code === 69 || code === 70 || code === 72 ? 3 : code === 68 || code === 71 ? 4 : 2;
                for(var index = 0; index < 47; index++)big.push({
                    k: chr + index,
                    v: v
                });
            }
            big.sort(function(a, b) {
                return b.v - a.v;
            });
            var order = "";
            for(var index1 = 0; index1 < big.length; index1++){
                var chr1 = big[index1].k.charAt(0);
                if (order.charAt(order.length - 1) !== chr1) order += chr1;
            }
            return order === "DGBEFHACIJK";
        } catch (unused) {
            return false;
        }
    };
    var stableSort = function stableSort(items, length, plain, comparefn) {
        if (length < 2) {
            return items;
        }
        if (length <= 10) {
            for(var i = 1; i < length; i++){
                var value = items[i];
                var j = i - 1;
                while(j >= 0){
                    var a = items[j];
                    var order = void 0;
                    if (comparefn !== void 0) {
                        order = +comparefn(a, value);
                        if (order !== order) order = 0;
                    } else {
                        var left = String(a);
                        var right = String(value);
                        order = left < right ? -1 : left > right ? 1 : 0;
                    }
                    if (order <= 0) break;
                    items[j + 1] = a;
                    j--;
                }
                items[j + 1] = value;
            }
            return items;
        }
        var source = items;
        var target = plain ? [] : /* @__PURE__ */ Object.create(null);
        for(var width = 1; width < length; width *= 2){
            for(var start = 0; start < length; start += width * 2){
                var left1 = start;
                var middle = start + width < length ? start + width : length;
                var right1 = middle;
                var end = start + width * 2 < length ? start + width * 2 : length;
                var out = start;
                while(left1 < middle && right1 < end){
                    var a1 = source[left1];
                    var b = source[right1];
                    var order1 = void 0;
                    if (comparefn !== void 0) {
                        order1 = +comparefn(a1, b);
                        if (order1 !== order1) order1 = 0;
                    } else {
                        var sa = String(a1);
                        var sb = String(b);
                        order1 = sa < sb ? -1 : sa > sb ? 1 : 0;
                    }
                    if (order1 <= 0) {
                        target[out++] = source[left1++];
                    } else {
                        target[out++] = source[right1++];
                    }
                }
                while(left1 < middle){
                    target[out++] = source[left1++];
                }
                while(right1 < end){
                    target[out++] = source[right1++];
                }
            }
            var swap = source;
            source = target;
            target = swap;
        }
        return source;
    };
    var arraySort = function sort3(comparefn) {
        if (comparefn !== void 0 && typeof comparefn !== "function") {
            throw new TypeError("The comparison function must be either a function or undefined");
        }
        if (this === null || this === void 0) {
            throw new TypeError("Array.prototype.sort called on null or undefined");
        }
        var object = Object(this);
        var length = +object.length;
        length = length !== length || length <= 0 ? 0 : length > 9007199254740991 ? 9007199254740991 : Math.floor(length);
        var plain = true;
        for(var i = 0; i < length; i++){
            if (i in Array.prototype) {
                plain = false;
                break;
            }
        }
        var items = plain ? [] : /* @__PURE__ */ Object.create(null);
        var itemCount = 0;
        var undefinedCount = 0;
        for(var i1 = 0; i1 < length; i1++){
            if (i1 in object) {
                var value = object[i1];
                if (value === void 0) {
                    undefinedCount++;
                } else {
                    items[itemCount++] = value;
                }
            }
        }
        items = stableSort(items, itemCount, plain, comparefn);
        var index = 0;
        for(var i2 = 0; i2 < itemCount; i2++){
            object[index++] = items[i2];
        }
        for(var u = 0; u < undefinedCount; u++){
            object[index++] = void 0;
        }
        for(; index < length; index++){
            delete object[index];
        }
        return object;
    };
    // src/modules/es.array.species.ts
    var isSupported73 = function isSupported73() {
        try {
            var species = typeof Symbol !== "undefined" && Symbol.species;
            if (!species) return true;
            return !!Array[species];
        } catch (unused) {
            return false;
        }
    };
    var arraySpeciesGetter = function arraySpeciesGetter() {
        return this;
    };
    var install16 = function install16() {
        defineGetter(Array, Symbol.species, arraySpeciesGetter, "get [Symbol.species]");
    };
    // src/modules/es.array.splice.ts
    var isSupported74 = function isSupported74() {
        try {
            if (typeof Array.prototype.splice !== "function") return false;
            var species = typeof Symbol !== "undefined" ? Symbol.species : void 0;
            if (!species) return false;
            var speciesDescriptor = Object.getOwnPropertyDescriptor(Array, species);
            if (!speciesDescriptor || typeof speciesDescriptor.get !== "function" || speciesDescriptor.get.__polyfilled === true) return false;
            var o = {
                length: -1,
                4294967294: "x"
            };
            return Array.prototype.splice.call(o, 4294967294, 1).length === 0;
        } catch (unused) {
            return false;
        }
    };
    var SILENT_LENGTH_SET2 = function() {
        try {
            Object.defineProperty([], "length", {
                writable: false
            }).length = 1;
            return true;
        } catch (e) {
            return false;
        }
    }();
    var dataDesc11 = {
        value: void 0,
        writable: true,
        enumerable: true,
        configurable: true
    };
    var ArrayProto12 = Array.prototype;
    var arraySplice = function arraySplice(_start, _deleteCount) {
        if (this === null || this === void 0) {
            throw new TypeError("Array.prototype.splice called on null or undefined");
        }
        var object = Object(this);
        var length = +object.length;
        length = length !== length || length <= 0 ? 0 : length > 9007199254740991 ? 9007199254740991 : Math.floor(length);
        var argCount = arguments.length;
        var relativeStart = argCount > 0 ? +arguments[0] : 0;
        relativeStart = relativeStart !== relativeStart ? 0 : relativeStart < 0 ? Math.ceil(relativeStart) : Math.floor(relativeStart);
        var actualStart = relativeStart < 0 ? Math.max(length + relativeStart, 0) : Math.min(relativeStart, length);
        var insertCount;
        var actualDeleteCount;
        if (argCount === 0) {
            insertCount = 0;
            actualDeleteCount = 0;
        } else if (argCount === 1) {
            insertCount = 0;
            actualDeleteCount = length - actualStart;
        } else {
            insertCount = argCount - 2;
            var deleteCount = +arguments[1];
            deleteCount = deleteCount !== deleteCount ? 0 : deleteCount < 0 ? Math.ceil(deleteCount) : Math.floor(deleteCount);
            actualDeleteCount = Math.min(Math.max(deleteCount, 0), length - actualStart);
        }
        if (length + insertCount - actualDeleteCount > 9007199254740991) {
            throw new TypeError("Array.prototype.splice: resulting length exceeds 2^53-1");
        }
        var removed;
        var plain = true;
        if (!Array.isArray(object)) {
            removed = new Array(actualDeleteCount);
        } else {
            var ctor = object.constructor;
            if (ctor !== null && (typeof ctor === "object" || typeof ctor === "function")) {
                if (typeof Symbol !== "undefined" && Symbol.species) {
                    ctor = ctor[Symbol.species];
                    if (ctor === null) ctor = void 0;
                }
            } else if (ctor !== void 0) {
                throw new TypeError("Array.prototype.splice: constructor is not an object");
            }
            if (ctor === void 0 || ctor === Array) {
                removed = new Array(actualDeleteCount);
            } else {
                if (typeof ctor !== "function") throw new TypeError("Array.prototype.splice: @@species is not a constructor");
                removed = new ctor(actualDeleteCount);
                plain = false;
            }
        }
        for(var i = 0; i < actualDeleteCount; i++){
            var from4 = actualStart + i;
            if (from4 in object) {
                if (plain && !(i in ArrayProto12)) removed[i] = object[from4];
                else {
                    dataDesc11.value = object[from4];
                    Object.defineProperty(removed, i, dataDesc11);
                }
            }
        }
        dataDesc11.value = void 0;
        removed.length = actualDeleteCount;
        var countDelta = insertCount - actualDeleteCount;
        if (countDelta < 0) {
            for(var i1 = actualStart; i1 < length - actualDeleteCount; i1++){
                var from41 = i1 + actualDeleteCount;
                var to = i1 + insertCount;
                if (from41 in object) {
                    object[to] = object[from41];
                } else {
                    delete object[to];
                }
            }
            for(var i2 = length; i2 > length + countDelta; i2--){
                delete object[i2 - 1];
            }
        } else if (countDelta > 0) {
            for(var i3 = length - actualDeleteCount; i3 > actualStart; i3--){
                var from42 = i3 + actualDeleteCount - 1;
                var to1 = i3 + insertCount - 1;
                if (from42 in object) {
                    object[to1] = object[from42];
                } else {
                    delete object[to1];
                }
            }
        }
        for(var i4 = 0; i4 < insertCount; i4++){
            object[actualStart + i4] = arguments[i4 + 2];
        }
        if (SILENT_LENGTH_SET2 && Array.isArray(object) && !Object.getOwnPropertyDescriptor(object, "length").writable) {
            throw new TypeError("Cannot set read only .length");
        }
        object.length = length + countDelta;
        return removed;
    };
    // src/modules/es.array.to-reversed.ts
    var isSupported75 = function isSupported75() {
        try {
            return typeof Array.prototype.toReversed === "function";
        } catch (unused) {
            return false;
        }
    };
    var dataDesc12 = {
        value: void 0,
        writable: true,
        enumerable: true,
        configurable: true
    };
    var ArrayProto13 = Array.prototype;
    var arrayToReversed = function toReversed2() {
        if (this === null || this === void 0) {
            throw new TypeError("Array.prototype.toReversed called on null or undefined");
        }
        var object = Object(this);
        var length = +object.length;
        length = length !== length || length <= 0 ? 0 : length > 9007199254740991 ? 9007199254740991 : Math.floor(length);
        var result = new Array(length);
        for(var i = 0; i < length; i++){
            if (!(i in ArrayProto13)) result[i] = object[length - 1 - i];
            else {
                dataDesc12.value = object[length - 1 - i];
                Object.defineProperty(result, i, dataDesc12);
            }
        }
        dataDesc12.value = void 0;
        return result;
    };
    // src/modules/es.array.to-sorted.ts
    var isSupported76 = function isSupported76() {
        try {
            return typeof Array.prototype.toSorted === "function";
        } catch (unused) {
            return false;
        }
    };
    var dataDesc13 = {
        value: void 0,
        writable: true,
        enumerable: true,
        configurable: true
    };
    var ArrayProto14 = Array.prototype;
    var stableSort2 = function stableSort2(items, length, compareFn) {
        if (length < 2) {
            return items;
        }
        var source = items;
        var target = /* @__PURE__ */ Object.create(null);
        for(var width = 1; width < length; width *= 2){
            for(var start = 0; start < length; start += width * 2){
                var left = start;
                var middle = start + width < length ? start + width : length;
                var right = middle;
                var end = start + width * 2 < length ? start + width * 2 : length;
                var out = start;
                while(left < middle && right < end){
                    var a = source[left];
                    var b = source[right];
                    var order = void 0;
                    if (a === void 0) {
                        order = b === void 0 ? 0 : 1;
                    } else if (b === void 0) {
                        order = -1;
                    } else if (compareFn) {
                        order = +compareFn(a, b) || 0;
                    } else {
                        var sa = String(a);
                        var sb = String(b);
                        order = sa < sb ? -1 : sa > sb ? 1 : 0;
                    }
                    if (order <= 0) {
                        target[out++] = source[left++];
                    } else {
                        target[out++] = source[right++];
                    }
                }
                while(left < middle){
                    target[out++] = source[left++];
                }
                while(right < end){
                    target[out++] = source[right++];
                }
            }
            var swap = source;
            source = target;
            target = swap;
        }
        return source;
    };
    var arrayToSorted = function toSorted2(comparefn) {
        if (comparefn !== void 0 && typeof comparefn !== "function") {
            throw new TypeError("The comparison function must be either a function or undefined");
        }
        if (this === null || this === void 0) {
            throw new TypeError("Array.prototype.toSorted called on null or undefined");
        }
        var object = Object(this);
        var length = +object.length;
        length = length !== length || length <= 0 ? 0 : length > 9007199254740991 ? 9007199254740991 : Math.floor(length);
        var result = new Array(length);
        var items = /* @__PURE__ */ Object.create(null);
        for(var i = 0; i < length; i++){
            items[i] = object[i];
        }
        items = stableSort2(items, length, comparefn);
        for(var i1 = 0; i1 < length; i1++){
            if (!(i1 in ArrayProto14)) result[i1] = items[i1];
            else {
                dataDesc13.value = items[i1];
                Object.defineProperty(result, i1, dataDesc13);
            }
        }
        dataDesc13.value = void 0;
        return result;
    };
    // src/modules/es.array.to-spliced.ts
    var isSupported77 = function isSupported77() {
        try {
            return typeof Array.prototype.toSpliced === "function";
        } catch (unused) {
            return false;
        }
    };
    var MAX_SAFE_LENGTH5 = 9007199254740991;
    var dataDesc14 = {
        value: void 0,
        writable: true,
        enumerable: true,
        configurable: true
    };
    var ArrayProto15 = Array.prototype;
    var arrayToSpliced = function toSpliced(start, skipCount) {
        if (this === null || this === void 0) {
            throw new TypeError("Array.prototype.toSpliced called on null or undefined");
        }
        var object = Object(this);
        var length = +object.length;
        length = length !== length || length <= 0 ? 0 : length > 9007199254740991 ? 9007199254740991 : Math.floor(length);
        var argCount = arguments.length;
        var relativeStart = +start;
        relativeStart = relativeStart !== relativeStart ? 0 : relativeStart < 0 ? Math.ceil(relativeStart) : Math.floor(relativeStart);
        var actualStart;
        if (relativeStart === -Infinity) {
            actualStart = 0;
        } else if (relativeStart < 0) {
            actualStart = Math.max(length + relativeStart, 0);
        } else {
            actualStart = Math.min(relativeStart, length);
        }
        var actualSkipCount;
        if (argCount === 0) {
            actualSkipCount = 0;
        } else if (argCount === 1) {
            actualSkipCount = length - actualStart;
        } else {
            var skip = +skipCount;
            skip = skip !== skip ? 0 : skip < 0 ? Math.ceil(skip) : Math.floor(skip);
            actualSkipCount = Math.min(Math.max(skip, 0), length - actualStart);
        }
        var insertCount = argCount > 2 ? argCount - 2 : 0;
        var newLength = length - actualSkipCount + insertCount;
        if (newLength > MAX_SAFE_LENGTH5) {
            throw new TypeError("Array length exceeded");
        }
        var result = new Array(newLength);
        var writeIndex = 0;
        while(writeIndex < actualStart){
            if (!(writeIndex in ArrayProto15)) result[writeIndex] = object[writeIndex];
            else {
                dataDesc14.value = object[writeIndex];
                Object.defineProperty(result, writeIndex, dataDesc14);
            }
            writeIndex++;
        }
        for(var i = 0; i < insertCount; i++){
            if (!(writeIndex in ArrayProto15)) result[writeIndex] = arguments[i + 2];
            else {
                dataDesc14.value = arguments[i + 2];
                Object.defineProperty(result, writeIndex, dataDesc14);
            }
            writeIndex++;
        }
        var readFrom = actualStart + actualSkipCount;
        while(writeIndex < newLength){
            if (!(writeIndex in ArrayProto15)) result[writeIndex] = object[readFrom];
            else {
                dataDesc14.value = object[readFrom];
                Object.defineProperty(result, writeIndex, dataDesc14);
            }
            writeIndex++;
            readFrom++;
        }
        dataDesc14.value = void 0;
        return result;
    };
    // src/modules/es.array.unscopables.flat.ts
    var unscopablesKey = typeof Symbol !== "undefined" ? Symbol.unscopables : void 0;
    var NAMES = [
        "at",
        "copyWithin",
        "entries",
        "fill",
        "find",
        "findIndex",
        "findLast",
        "findLastIndex",
        "flat",
        "flatMap",
        "includes",
        "keys",
        "toReversed",
        "toSorted",
        "toSpliced",
        "values"
    ];
    var isSupported78 = function isSupported78() {
        try {
            if (!unscopablesKey) {
                return true;
            }
            var table = Array.prototype[unscopablesKey];
            if (!table || table.flat !== true) return false;
            for(var i = 0; i < NAMES.length; i++){
                if (typeof Array.prototype[NAMES[i]] === "function" && table[NAMES[i]] !== true) return false;
            }
            return true;
        } catch (unused) {
            return true;
        }
    };
    var install17 = function install17() {
        if (unscopablesKey) {
            var table = Array.prototype[unscopablesKey];
            if (!table) {
                table = /* @__PURE__ */ Object.create(null);
                Object.defineProperty(Array.prototype, unscopablesKey, {
                    configurable: true,
                    value: table
                });
            }
            table.flat = true;
            for(var i = 0; i < NAMES.length; i++){
                if (typeof Array.prototype[NAMES[i]] === "function") table[NAMES[i]] = true;
            }
        }
    };
    // src/modules/es.array.unscopables.flat-map.ts
    var unscopablesKey2 = typeof Symbol !== "undefined" ? Symbol.unscopables : void 0;
    var isSupported79 = function isSupported79() {
        try {
            if (!unscopablesKey2) {
                return true;
            }
            var table = Array.prototype[unscopablesKey2];
            return !!table && table.flatMap === true;
        } catch (unused) {
            return true;
        }
    };
    var install18 = function install18() {
        if (unscopablesKey2) {
            var table = Array.prototype[unscopablesKey2];
            if (!table) {
                table = /* @__PURE__ */ Object.create(null);
                Object.defineProperty(Array.prototype, unscopablesKey2, {
                    configurable: true,
                    value: table
                });
            }
            table.flatMap = true;
        }
    };
    // src/modules/es.array.unshift.ts
    var nativeUnshift = Array.prototype.unshift;
    var isSupported80 = function isSupported80() {
        try {
            if (typeof nativeUnshift !== "function") return false;
            if ([].unshift(0) !== 1) return false;
            if (nativeUnshift.call({
                length: 4294967296
            }) !== 4294967296) return false;
            try {
                Object.defineProperty([], "length", {
                    writable: false
                }).unshift();
                return false;
            } catch (error) {
                return error instanceof TypeError;
            }
        } catch (unused) {
            return false;
        }
    };
    var SILENT_LENGTH_SET3 = function() {
        try {
            Object.defineProperty([], "length", {
                writable: false
            }).length = 1;
            return true;
        } catch (e) {
            return false;
        }
    }();
    var arrayUnshift = function unshift(_item) {
        if (this === null || this === void 0) throw new TypeError("Cannot convert undefined or null to object");
        var O = Object(this);
        var len = +O.length;
        len = len !== len || len <= 0 ? 0 : len > 9007199254740991 ? 9007199254740991 : Math.floor(len);
        var argCount = arguments.length;
        if (argCount) {
            if (len + argCount > 9007199254740991) throw new TypeError("Maximum allowed index exceeded");
            var k = len;
            while(k--){
                var to = k + argCount;
                if (k in O) O[to] = O[k];
                else if (!delete O[to]) throw new TypeError("Cannot delete property " + to + " of " + O);
            }
            for(var j = 0; j < argCount; j++){
                O[j] = arguments[j];
            }
        }
        var newLength = len + argCount;
        if (SILENT_LENGTH_SET3 && Array.isArray(O) && !Object.getOwnPropertyDescriptor(O, "length").writable) {
            throw new TypeError("Cannot set read only .length");
        }
        O.length = newLength;
        if (O.length !== newLength && Array.isArray(O)) throw new TypeError("Cannot set read only .length");
        return newLength;
    };
    // src/modules/es.array.with.ts
    var isSupported81 = function isSupported81() {
        try {
            return typeof Array.prototype.with === "function";
        } catch (unused) {
            return false;
        }
    };
    var dataDesc15 = {
        value: void 0,
        writable: true,
        enumerable: true,
        configurable: true
    };
    var ArrayProto16 = Array.prototype;
    var arrayWith = function arrayWith(index, value) {
        if (this === null || this === void 0) {
            throw new TypeError("Array.prototype.with called on null or undefined");
        }
        var object = Object(this);
        var length = +object.length;
        length = length !== length || length <= 0 ? 0 : length > 9007199254740991 ? 9007199254740991 : Math.floor(length);
        var relativeIndex2 = +index;
        relativeIndex2 = relativeIndex2 !== relativeIndex2 ? 0 : relativeIndex2 < 0 ? Math.ceil(relativeIndex2) : Math.floor(relativeIndex2);
        var actualIndex = relativeIndex2;
        if (relativeIndex2 < 0) {
            actualIndex = length + relativeIndex2;
        }
        if (actualIndex < 0 || actualIndex >= length) {
            throw new RangeError("Array.prototype.with: index out of range");
        }
        var result = new Array(length);
        for(var i = 0; i < length; i++){
            if (!(i in ArrayProto16)) result[i] = i === actualIndex ? value : object[i];
            else {
                dataDesc15.value = i === actualIndex ? value : object[i];
                Object.defineProperty(result, i, dataDesc15);
            }
        }
        dataDesc15.value = void 0;
        return result;
    };
    // src/modules/es.regexp.constructor.ts
    var isSupported82 = function isSupported82() {
        try {
            var regex = new RegExp("a", "y");
            if (regex.sticky !== true) {
                return false;
            }
            regex.lastIndex = 1;
            if (regex.exec("a_a") !== null) return false;
            return new RegExp(".", "s").test("\n");
        } catch (unused) {
            return false;
        }
    };
    var NativeRegExp = RegExp;
    var supportsSticky = true;
    try {
        new NativeRegExp("a", "y");
    } catch (unused) {
        supportsSticky = false;
    }
    var supportsDotAll = true;
    try {
        new NativeRegExp(".", "s");
    } catch (unused) {
        supportsDotAll = false;
    }
    var supportsUnicode = true;
    try {
        new NativeRegExp("a", "u");
    } catch (unused) {
        supportsUnicode = false;
    }
    var warnedUnicode = false;
    var SPEC_FLAG_ORDER = "dgimsuvy";
    var nativeToString3 = Object.prototype.toString;
    var isRegExpObject = function isRegExpObject(x) {
        return x !== null && typeof x === "object" && nativeToString3.call(x) === "[object RegExp]";
    };
    var RE_NEEDS_ESCAPE = /[/\n\r\u2028\u2029]/;
    var RegExpPolyfill = function RegExpPolyfill1(pattern, flags) {
        var patternIsRegExp;
        if (pattern === null || typeof pattern !== "object" && typeof pattern !== "function") {
            patternIsRegExp = false;
        } else {
            var matchKey = typeof Symbol !== "undefined" ? Symbol.match : void 0;
            var matcher = matchKey !== void 0 ? pattern[matchKey] : void 0;
            if (matcher !== void 0) {
                patternIsRegExp = !!matcher;
            } else {
                patternIsRegExp = isRegExpObject(pattern);
            }
        }
        if (!(this instanceof RegExpPolyfill) && patternIsRegExp && flags === void 0) {
            var patternConstructor = pattern.constructor;
            if (patternConstructor === RegExpPolyfill || patternConstructor === NativeRegExp) return pattern;
        }
        var P2 = pattern;
        var F = flags;
        if (isRegExpObject(pattern)) {
            P2 = pattern.source;
            if (flags === void 0) {
                F = pattern.flags !== void 0 ? pattern.flags : (pattern.global ? "g" : "") + (pattern.ignoreCase ? "i" : "") + (pattern.multiline ? "m" : "");
            }
        } else if (patternIsRegExp) {
            P2 = pattern.source;
            if (flags === void 0) F = pattern.flags;
        }
        var source = P2 === void 0 ? "" : String(P2);
        if (RE_NEEDS_ESCAPE.test(source)) {
            var escaped = "";
            var inClass = false;
            for(var i = 0; i < source.length; i++){
                var c = source.charAt(i);
                if (c === "\\") {
                    escaped += c + source.charAt(i + 1);
                    i++;
                } else if (c === "/" && !inClass) {
                    escaped += "\\/";
                } else if (c === "\n") {
                    escaped += "\\n";
                } else if (c === "\r") {
                    escaped += "\\r";
                } else if (c === "\u2028") {
                    escaped += "\\u2028";
                } else if (c === "\u2029") {
                    escaped += "\\u2029";
                } else {
                    if (c === "[") inClass = true;
                    else if (c === "]") inClass = false;
                    escaped += c;
                }
            }
            source = escaped;
        }
        var flagString = F === void 0 ? "" : String(F);
        var allFlags = flagString;
        var dotAll = false;
        if (!supportsDotAll && flagString.indexOf("s") !== -1) {
            if (flagString.indexOf("s") !== flagString.lastIndexOf("s")) throw new SyntaxError("Invalid flags supplied to RegExp constructor '" + flagString + "'");
            dotAll = true;
            flagString = flagString.replace("s", "");
            var rewritten = "";
            var inClass1 = false;
            for(var i1 = 0; i1 < source.length; i1++){
                var c1 = source.charAt(i1);
                if (c1 === "\\") {
                    rewritten += c1 + source.charAt(i1 + 1);
                    i1++;
                } else if (c1 === "." && !inClass1) {
                    rewritten += "[\\s\\S]";
                } else {
                    if (c1 === "[") inClass1 = true;
                    else if (c1 === "]") inClass1 = false;
                    rewritten += c1;
                }
            }
            source = rewritten;
        }
        if (!supportsUnicode && flagString.indexOf("u") !== -1) {
            if (!warnedUnicode) {
                warnedUnicode = true;
                console.warn("[spackle] RegExp: the u flag is not emulated on this engine \u2014 stripping it; astral character classes will misbehave");
            }
            flagString = flagString.replace("u", "");
        }
        if (!supportsSticky && flagString.indexOf("y") !== -1) {
            var bareFlags = flagString.replace("y", "");
            var searcherFlags = bareFlags.indexOf("g") === -1 ? bareFlags + "g" : bareFlags;
            var searcher = new NativeRegExp("(?:" + source + ")|()", searcherFlags);
            var stickyInstance = new NativeRegExp(source, bareFlags);
            stickyInstance.lastIndex = 0;
            try {
                Object.defineProperty(stickyInstance, "sticky", {
                    value: true
                });
                var ordered = "";
                for(var i2 = 0; i2 < SPEC_FLAG_ORDER.length; i2++){
                    if (allFlags.indexOf(SPEC_FLAG_ORDER.charAt(i2)) !== -1) ordered += SPEC_FLAG_ORDER.charAt(i2);
                }
                Object.defineProperty(stickyInstance, "flags", {
                    value: ordered
                });
                if (allFlags.indexOf("s") !== -1) Object.defineProperty(stickyInstance, "dotAll", {
                    value: true
                });
            } catch (unused) {}
            stickyInstance.exec = function(input) {
                var str = String(input);
                searcher.lastIndex = this.lastIndex;
                var match2 = searcher.exec(str);
                if (match2 && match2.index === this.lastIndex && match2[match2.length - 1] === void 0) {
                    match2.length = match2.length - 1;
                    this.lastIndex = searcher.lastIndex;
                    return match2;
                }
                this.lastIndex = 0;
                return null;
            };
            stickyInstance.test = function(input) {
                return this.exec(input) !== null;
            };
            return stickyInstance;
        }
        var instance = new NativeRegExp(source, flagString);
        if (dotAll) {
            try {
                Object.defineProperty(instance, "dotAll", {
                    value: true
                });
                var ordered1 = "";
                for(var i3 = 0; i3 < SPEC_FLAG_ORDER.length; i3++){
                    if (allFlags.indexOf(SPEC_FLAG_ORDER.charAt(i3)) !== -1) ordered1 += SPEC_FLAG_ORDER.charAt(i3);
                }
                Object.defineProperty(instance, "flags", {
                    value: ordered1
                });
            } catch (unused) {}
        }
        return instance;
    };
    RegExpPolyfill.prototype = NativeRegExp.prototype;
    var RegExpProto = NativeRegExp.prototype;
    var regexpStickyGetter = function regexpStickyGetter() {
        if (this === null || typeof this !== "object" && typeof this !== "function") {
            throw new TypeError("RegExp.prototype.sticky getter called on a non-object");
        }
        if (this === RegExpProto) return void 0;
        if (nativeToString3.call(this) !== "[object RegExp]") {
            throw new TypeError("RegExp.prototype.sticky getter called on an object that is not a RegExp");
        }
        return false;
    };
    var install19 = function install19() {
        define(window, "RegExp", RegExpPolyfill);
        if (!supportsSticky && !("sticky" in RegExpProto)) defineGetter(RegExpProto, "sticky", regexpStickyGetter);
        Object.defineProperty(NativeRegExp.prototype, "constructor", {
            value: RegExpPolyfill,
            writable: true,
            enumerable: false,
            configurable: true
        });
    };
    // src/modules/es.regexp.dot-all.ts
    var isSupported83 = function isSupported83() {
        try {
            if (!("dotAll" in RegExp.prototype)) {
                return false;
            }
            if (new RegExp(".", "s").dotAll !== true) return false;
            return new RegExp(".").dotAll === false;
        } catch (unused) {
            return false;
        }
    };
    var objectToString4 = Object.prototype.toString;
    var RegExpProto2 = RegExp.prototype;
    var regexpDotAllGetter = function regexpDotAllGetter() {
        if (this === null || typeof this !== "object" && typeof this !== "function") {
            throw new TypeError("RegExp.prototype.dotAll getter called on a non-object");
        }
        if (this === RegExpProto2) {
            return void 0;
        }
        if (objectToString4.call(this) !== "[object RegExp]") {
            throw new TypeError("RegExp.prototype.dotAll getter called on an object that is not a RegExp");
        }
        return false;
    };
    var install20 = function install20() {
        defineGetter(RegExp.prototype, "dotAll", regexpDotAllGetter);
    };
    // src/modules/es.regexp.escape.ts
    var isSupported84 = function isSupported84() {
        try {
            return typeof RegExp.escape === "function" && /* @__PURE__ */ RegExp.escape("ab") === "\\x61b";
        } catch (unused) {
            return false;
        }
    };
    var SYNTAX_CHARS = "^$\\.*+?()[]{}|/";
    var OTHER_PUNCTUATORS = ",-=<>#&!%:;@~'`\"";
    var regExpEscape = function regExpEscape(str) {
        if (typeof str !== "string") {
            throw new TypeError("RegExp.escape requires a string");
        }
        var out = "";
        for(var i = 0; i < str.length; i++){
            var ch = str.charAt(i);
            var code = str.charCodeAt(i);
            var hex = false;
            if (i === 0 && (code >= 48 && code <= 57 || // 0-9
            code >= 65 && code <= 90 || // A-Z
            code >= 97 && code <= 122)) {
                hex = true;
            } else if (SYNTAX_CHARS.indexOf(ch) !== -1) {
                out += "\\" + ch;
            } else if (code >= 9 && code <= 13) {
                out += "\\" + "tnvfr".charAt(code - 9);
            } else if (OTHER_PUNCTUATORS.indexOf(ch) !== -1 || // inlined: isWhiteSpaceOrLineTerminator(code)
            code >= 9 && code <= 13 || // tab, LF, VT, FF, CR
            code === 32 || code === 160 || code === 5760 || code >= 8192 && code <= 8202 || code === 8232 || code === 8233 || code === 8239 || code === 8287 || code === 12288 || code === 65279) {
                hex = true;
            } else if (code >= 55296 && code <= 56319) {
                var next8 = str.charCodeAt(i + 1);
                if (next8 >= 56320 && next8 <= 57343) {
                    out += ch + str.charAt(i + 1);
                    i++;
                } else {
                    hex = true;
                }
            } else if (code >= 56320 && code <= 57343) {
                hex = true;
            } else {
                out += ch;
            }
            if (hex) {
                var digits = code.toString(16);
                if (code <= 255) {
                    out += "\\x" + (digits.length < 2 ? "0" + digits : digits);
                } else {
                    var padded = digits;
                    while(padded.length < 4)padded = "0" + padded;
                    out += "\\u" + padded;
                }
            }
        }
        return out;
    };
    // src/modules/es.regexp.flags.ts
    var isSupported85 = function isSupported85() {
        try {
            var _loop = function(key) {
                (function(chr) {
                    Object.defineProperty(O, key, {
                        get: function get() {
                            calls += chr;
                            return true;
                        }
                    });
                })(pairs[key]);
            };
            if (typeof RegExp === "undefined" || !("flags" in RegExp.prototype)) {
                return false;
            }
            if (new RegExp("x", "gi").flags !== "gi") return false;
            if (new RegExp("x").flags !== "") return false;
            if (new RegExp("x", "ig").flags !== "gi") return false;
            var indices = true;
            try {
                new RegExp(".", "d");
            } catch (e) {
                indices = false;
            }
            var expected = indices ? "dgimsy" : "gimsy";
            var pairs = {
                dotAll: "s",
                global: "g",
                ignoreCase: "i",
                multiline: "m",
                sticky: "y"
            };
            if (indices) pairs.hasIndices = "d";
            var calls = "";
            var O = {};
            for(var key in pairs)_loop(key);
            var result = Object.getOwnPropertyDescriptor(RegExp.prototype, "flags").get.call(O);
            return result === expected && calls === expected;
        } catch (unused) {
            return false;
        }
    };
    var FLAG_KEYS = [
        "hasIndices",
        "global",
        "ignoreCase",
        "multiline",
        "dotAll",
        "unicode",
        "unicodeSets",
        "sticky"
    ];
    var FLAG_CHARS = "dgimsuvy";
    var regExpFlags = function regExpFlags() {
        if (this === null || typeof this !== "object" && typeof this !== "function") {
            throw new TypeError("RegExp.prototype.flags getter called on a non-object");
        }
        var result = "";
        for(var i = 0; i < FLAG_KEYS.length; i++){
            if (this[FLAG_KEYS[i]]) result += FLAG_CHARS.charAt(i);
        }
        return result;
    };
    var install21 = function install21() {
        defineGetter(RegExp.prototype, "flags", regExpFlags);
    };
    // src/modules/es.regexp.test.ts
    var isSupported86 = function isSupported86() {
        try {
            var regexp = /a/;
            var calledExec = false;
            regexp.exec = function() {
                calledExec = true;
                return null;
            };
            regexp.test("a");
            return calledExec;
        } catch (unused) {
            return false;
        }
    };
    var nativeTest = RegExp.prototype.test;
    var nativeExec = RegExp.prototype.exec;
    var regexpTest = function regexpTest(string) {
        if (this === null || typeof this !== "object") {
            throw new TypeError("RegExp.prototype.test called on a non-object");
        }
        var exec = this.exec;
        if (exec === nativeExec) {
            return nativeTest.call(this, String(string));
        }
        if (typeof exec === "function") {
            var result = exec.call(this, String(string));
            if (result !== null && typeof result !== "object") {
                throw new TypeError("RegExp exec method returned something other than an Object or null");
            }
            return result !== null;
        }
        return nativeTest.call(this, String(string));
    };
    // src/modules/es.regexp.to-string.ts
    var isSupported87 = function isSupported87() {
        try {
            return RegExp.prototype.toString.call({
                source: "a",
                flags: "b"
            }) === "/a/b";
        } catch (unused) {
            return false;
        }
    };
    var regExpToString = function toString4() {
        if (this === null || typeof this !== "object" && typeof this !== "function") {
            throw new TypeError("RegExp.prototype.toString called on a non-object");
        }
        var source = this.source;
        if (typeof source === "symbol") throw new TypeError("Cannot convert a Symbol value to a string");
        var pattern = typeof source === "string" ? source : String(source);
        var flags = this.flags;
        if (typeof flags === "symbol") throw new TypeError("Cannot convert a Symbol value to a string");
        return "/" + pattern + "/" + (typeof flags === "string" ? flags : String(flags));
    };
    // src/modules/es.string.at-alternative.ts
    var isSupported88 = function isSupported88() {
        try {
            return typeof String.prototype.at === "function" && "\uD842\uDFB7".at(-2) === "\uD842";
        } catch (unused) {
            return false;
        }
    };
    var stringAt = function stringAt(index) {
        if (this === null || this === void 0) {
            throw new TypeError("String.prototype.at called on null or undefined");
        }
        if (typeof this === "symbol") throw new TypeError("Cannot convert a Symbol value to a string");
        var source = typeof this === "string" ? this : String(this);
        var length = source.length;
        var relativeIndex2 = +index;
        if (relativeIndex2 !== relativeIndex2) {
            relativeIndex2 = 0;
        }
        relativeIndex2 = relativeIndex2 < 0 ? Math.ceil(relativeIndex2) : Math.floor(relativeIndex2);
        var actualIndex = relativeIndex2 < 0 ? length + relativeIndex2 : relativeIndex2;
        if (actualIndex < 0 || actualIndex >= length) {
            return void 0;
        }
        return source.charAt(actualIndex);
    };
    // src/modules/es.string.code-point-at.ts
    var isSupported89 = function isSupported89() {
        try {
            return typeof String.prototype.codePointAt === "function";
        } catch (unused) {
            return false;
        }
    };
    var stringCodePointAt = function stringCodePointAt(pos) {
        if (this === null || this === void 0) {
            throw new TypeError("String.prototype.codePointAt called on null or undefined");
        }
        if (typeof this === "symbol") throw new TypeError("Cannot convert a Symbol value to a string");
        var source = typeof this === "string" ? this : String(this);
        var length = source.length;
        var index = +pos;
        if (index !== index) {
            index = 0;
        }
        index = index < 0 ? Math.ceil(index) : Math.floor(index);
        if (index < 0 || index >= length) {
            return void 0;
        }
        var first = source.charCodeAt(index);
        if (first >= 55296 && first <= 56319 && index + 1 < length) {
            var second = source.charCodeAt(index + 1);
            if (second >= 56320 && second <= 57343) {
                return (first - 55296) * 1024 + (second - 56320) + 65536;
            }
        }
        return first;
    };
    // src/modules/es.string.ends-with.ts
    var isSupported90 = function isSupported90() {
        try {
            if (typeof String.prototype.endsWith !== "function") return false;
            var matchKey = typeof Symbol !== "undefined" ? Symbol.match : void 0;
            if (!matchKey) return true;
            var regexp = /./;
            try {
                "/./".endsWith(regexp);
                return false;
            } catch (e) {}
            regexp[matchKey] = false;
            return "/./".endsWith(regexp) === true;
        } catch (unused) {
            return false;
        }
    };
    var objectToString5 = Object.prototype.toString;
    var stringEndsWith = function endsWith(search2) {
        var endPosition = arguments.length > 1 ? arguments[1] : void 0;
        if (this === null || this === void 0) {
            throw new TypeError("String.prototype.endsWith called on null or undefined");
        }
        if (typeof this === "symbol") throw new TypeError("Cannot convert a Symbol value to a string");
        var s = typeof this === "string" ? this : String(this);
        var isRegExpValue = false;
        if (search2 !== null && (typeof search2 === "object" || typeof search2 === "function")) {
            var matchKey = typeof Symbol !== "undefined" ? Symbol.match : void 0;
            var matcher = matchKey ? search2[matchKey] : void 0;
            isRegExpValue = matcher !== void 0 ? !!matcher : objectToString5.call(search2) === "[object RegExp]";
        }
        if (isRegExpValue) {
            throw new TypeError("First argument to String.prototype.endsWith must not be a regular expression");
        }
        if (typeof search2 === "symbol") throw new TypeError("Cannot convert a Symbol value to a string");
        var searchString = typeof search2 === "string" ? search2 : String(search2);
        var length = s.length;
        var endIndex = length;
        if (endPosition !== void 0) {
            endIndex = +endPosition;
            endIndex = endIndex !== endIndex ? 0 : endIndex < 0 ? Math.ceil(endIndex) : Math.floor(endIndex);
        }
        if (endIndex < 0) {
            endIndex = 0;
        } else if (endIndex > length) {
            endIndex = length;
        }
        var startIndex = endIndex - searchString.length;
        if (startIndex < 0) {
            return false;
        }
        for(var i = 0; i < searchString.length; i++){
            if (s.charCodeAt(startIndex + i) !== searchString.charCodeAt(i)) {
                return false;
            }
        }
        return true;
    };
    // src/modules/es.string.from-code-point.ts
    var isSupported91 = function isSupported91() {
        try {
            return typeof String.fromCodePoint === "function" && String.fromCodePoint.length === 1;
        } catch (unused) {
            return false;
        }
    };
    var stringFromCodePoint = function stringFromCodePoint(_codePoint) {
        var parts = [];
        for(var i = 0; i < arguments.length; i++){
            var codePoint = +arguments[i];
            if (codePoint < 0 || codePoint > 1114111 || codePoint !== (codePoint | 0)) {
                throw new RangeError("Invalid code point: ".concat(codePoint));
            }
            if (codePoint > 65535) {
                codePoint -= 65536;
                parts[parts.length] = String.fromCharCode((codePoint >> 10) + 55296, // high surrogate = top 10 bits
                (codePoint & 1023) + 56320);
            } else {
                parts[parts.length] = String.fromCharCode(codePoint);
            }
        }
        return parts.join("");
    };
    // src/modules/es.string.includes.ts
    var isSupported92 = function isSupported92() {
        try {
            if (typeof String.prototype.includes !== "function") return false;
            var matchKey = typeof Symbol !== "undefined" ? Symbol.match : void 0;
            if (!matchKey) return true;
            var regexp = /./;
            try {
                "/./".includes(regexp);
                return false;
            } catch (e) {}
            regexp[matchKey] = false;
            return "/./".includes(regexp) === true;
        } catch (unused) {
            return false;
        }
    };
    var objectToString6 = Object.prototype.toString;
    var stringIncludes = function includes3(search2) {
        var start = arguments.length > 1 ? arguments[1] : void 0;
        if (this === null || this === void 0) {
            throw new TypeError("String.prototype.includes called on null or undefined");
        }
        if (typeof this === "symbol") throw new TypeError("Cannot convert a Symbol value to a string");
        var s = typeof this === "string" ? this : String(this);
        var isRegExpValue = false;
        if (search2 !== null && (typeof search2 === "object" || typeof search2 === "function")) {
            var matchKey = typeof Symbol !== "undefined" ? Symbol.match : void 0;
            var matcher = matchKey ? search2[matchKey] : void 0;
            isRegExpValue = matcher !== void 0 ? !!matcher : objectToString6.call(search2) === "[object RegExp]";
        }
        if (isRegExpValue) {
            throw new TypeError("First argument to String.prototype.includes must not be a regular expression");
        }
        if (typeof search2 === "symbol") throw new TypeError("Cannot convert a Symbol value to a string");
        return s.indexOf(typeof search2 === "string" ? search2 : String(search2), start) !== -1;
    };
    // src/modules/es.string.is-well-formed.ts
    var isSupported93 = function isSupported93() {
        try {
            return typeof String.prototype.isWellFormed === "function";
        } catch (unused) {
            return false;
        }
    };
    var stringIsWellFormed = function stringIsWellFormed() {
        if (this === null || this === void 0) {
            throw new TypeError("String.prototype.isWellFormed called on null or undefined");
        }
        if (typeof this === "symbol") throw new TypeError("Cannot convert a Symbol value to a string");
        var str = typeof this === "string" ? this : String(this);
        for(var i = 0; i < str.length; i++){
            var code = str.charCodeAt(i);
            if (code >= 56320 && code <= 57343) {
                return false;
            }
            if (code >= 55296 && code <= 56319) {
                var next8 = str.charCodeAt(i + 1);
                if (!(next8 >= 56320 && next8 <= 57343)) {
                    return false;
                }
                i++;
            }
        }
        return true;
    };
    // src/modules/es.string.match.ts
    var isSupported94 = function isSupported94() {
        try {
            if (typeof String.prototype.match !== "function") return false;
            var symbol = typeof Symbol !== "undefined" ? Symbol.match : void 0;
            if (!symbol) return true;
            var probe = {};
            probe[symbol] = function() {
                return 7;
            };
            if ("".match(probe) !== 7) return false;
            var execCalled = false;
            var re = /a/;
            re.exec = function() {
                execCalled = true;
                return null;
            };
            re[symbol]("");
            return execCalled;
        } catch (unused) {
            return false;
        }
    };
    var nativeMatch = String.prototype.match;
    var objectToStringS = Object.prototype.toString;
    var stringMatch = function match(matcher) {
        if (this === null || this === void 0) {
            throw new TypeError("String.prototype.match called on null or undefined");
        }
        if (matcher !== null && (typeof matcher === "object" || typeof matcher === "function") && typeof Symbol !== "undefined" && Symbol.match) {
            var handler = matcher[Symbol.match];
            if (handler !== void 0 && handler !== null) {
                if (typeof handler !== "function") throw new TypeError("String.prototype.match: @@match is not a function");
                return handler.call(matcher, this);
            }
        }
        if (matcher === null || typeof matcher !== "object" && typeof matcher !== "function" || objectToStringS.call(matcher) !== "[object RegExp]") {
            if (typeof matcher === "symbol") throw new TypeError("Cannot convert a Symbol value to a string");
            matcher = new RegExp(matcher === void 0 ? "" : String(matcher));
        }
        return nativeMatch.call(this, matcher);
    };
    var regExpExecAtLoad = RegExp.prototype.exec;
    var objectToStringR = Object.prototype.toString;
    var symbolKeyMatch = typeof Symbol !== "undefined" ? Symbol.match : void 0;
    var nativeRegExpMatch = symbolKeyMatch ? RegExp.prototype[symbolKeyMatch] : void 0;
    var toStrMatch = function toStrMatch(value) {
        if (typeof value === "symbol") throw new TypeError("Cannot convert a Symbol value to a string");
        return typeof value === "string" ? value : String(value);
    };
    var regExpExecMatch = function regExpExecMatch(R, S) {
        var exec = R.exec;
        if (typeof exec === "function") {
            var result = exec.call(R, S);
            if (result !== null && typeof result !== "object" && typeof result !== "function") {
                throw new TypeError("RegExp exec method returned something other than an Object or null");
            }
            return result;
        }
        if (objectToStringR.call(R) !== "[object RegExp]") throw new TypeError("RegExp#exec called on incompatible receiver");
        return regExpExecAtLoad.call(R, S);
    };
    var regExpMatch = function regExpMatch(string) {
        var rx = this;
        if (rx === null || typeof rx !== "object" && typeof rx !== "function") {
            throw new TypeError("RegExp.prototype[@@match] called on a non-object");
        }
        if (typeof string === "symbol") throw new TypeError("Cannot convert a Symbol value to a string");
        var S = typeof string === "string" ? string : String(string);
        var exec = rx.exec;
        if (exec === regExpExecAtLoad || exec === RegExp.prototype.exec) {
            return nativeRegExpMatch ? nativeRegExpMatch.call(rx, S) : nativeMatch.call(S, rx);
        }
        var flags = toStrMatch(rx.flags);
        if (flags.indexOf("g") === -1) return regExpExecMatch(rx, S);
        var fullUnicode = flags.indexOf("u") !== -1 || flags.indexOf("v") !== -1;
        rx.lastIndex = 0;
        var A = [];
        var n = 0;
        for(;;){
            var result = regExpExecMatch(rx, S);
            if (result === null) return n === 0 ? null : A;
            var matchStr = toStrMatch(result[0]);
            A[n++] = matchStr;
            if (matchStr === "") {
                var thisIndex = +rx.lastIndex;
                thisIndex = thisIndex !== thisIndex || thisIndex <= 0 ? 0 : Math.floor(thisIndex);
                if (thisIndex > 9007199254740991) {
                    thisIndex = 9007199254740991;
                }
                var nextIndex = thisIndex + 1;
                if (fullUnicode && thisIndex + 1 < S.length) {
                    var c = S.charCodeAt(thisIndex);
                    if (c >= 55296 && c <= 56319) {
                        var d = S.charCodeAt(thisIndex + 1);
                        if (d >= 56320 && d <= 57343) {
                            nextIndex = thisIndex + 2;
                        }
                    }
                }
                rx.lastIndex = nextIndex;
            }
        }
    };
    var installRegExpMatch = function installRegExpMatch() {
        if (!symbolKeyMatch) return;
        try {
            Object.defineProperty(RegExp.prototype, symbolKeyMatch, {
                value: regExpMatch,
                writable: true,
                enumerable: false,
                configurable: true
            });
            try {
                Object.defineProperty(regExpMatch, "name", {
                    value: "[Symbol.match]",
                    configurable: true
                });
            } catch (e) {}
            Object.defineProperty(regExpMatch, "__polyfilled", {
                value: true
            });
        } catch (e) {}
    };
    // src/modules/es.string.match-all.ts
    var isSupported95 = function isSupported95() {
        try {
            if (typeof String.prototype.matchAll !== "function") {
                return false;
            }
            try {
                "".matchAll(/./);
                return false;
            } catch (unused) {
                return true;
            }
        } catch (unused) {
            return false;
        }
    };
    var returnSelf4 = function returnSelf4() {
        return this;
    };
    var MatchIteratorPrototype = {};
    MatchIteratorPrototype.next = function() {
        var rx = this._rx;
        if (rx === null) return {
            value: void 0,
            done: true
        };
        var s = this._s;
        var match2;
        var exec = rx.exec;
        if (typeof exec === "function") {
            match2 = exec.call(rx, s);
            if (match2 !== null && typeof match2 !== "object") {
                throw new TypeError("RegExp exec method returned something other than an Object or null");
            }
        } else {
            match2 = RegExp.prototype.exec.call(rx, s);
        }
        if (match2 === null) {
            this._rx = null;
            this._s = null;
            return {
                value: void 0,
                done: true
            };
        }
        if (!this._global) {
            this._rx = null;
            this._s = null;
            return {
                value: match2,
                done: false
            };
        }
        if (String(match2[0]) === "") {
            var index = +rx.lastIndex;
            index = index !== index || index <= 0 ? 0 : index > 9007199254740991 ? 9007199254740991 : Math.floor(index);
            var next8 = index + 1;
            if (this._unicode && index + 1 < s.length) {
                var first = s.charCodeAt(index);
                if (first >= 55296 && first <= 56319) {
                    var second = s.charCodeAt(index + 1);
                    if (second >= 56320 && second <= 57343) next8 = index + 2;
                }
            }
            rx.lastIndex = next8;
        }
        return {
            value: match2,
            done: false
        };
    };
    if (typeof Symbol !== "undefined" && Symbol.iterator) {
        Object.defineProperty(MatchIteratorPrototype, Symbol.iterator, {
            value: returnSelf4,
            writable: true,
            enumerable: false,
            configurable: true
        });
    }
    var objectToString7 = Object.prototype.toString;
    var regExpMatchAll = function regExpMatchAll(R, s) {
        var Default = window.RegExp;
        var C = R.constructor;
        if (C === void 0) {
            C = Default;
        } else {
            if (C === null || typeof C !== "object" && typeof C !== "function") {
                throw new TypeError("RegExp constructor is not an object");
            }
            var speciesKey = typeof Symbol !== "undefined" ? Symbol.species : void 0;
            var species = speciesKey ? C[speciesKey] : void 0;
            C = species === void 0 || species === null ? Default : species;
            if (typeof C !== "function") throw new TypeError("RegExp species is not a constructor");
        }
        var flags = String(R.flags);
        var matcher = C === Default ? new C(R.source, flags) : new C(R, flags);
        var lastIndex = +R.lastIndex;
        lastIndex = lastIndex !== lastIndex || lastIndex <= 0 ? 0 : lastIndex > 9007199254740991 ? 9007199254740991 : Math.floor(lastIndex);
        matcher.lastIndex = lastIndex;
        var iterator = Object.create(MatchIteratorPrototype);
        iterator._rx = matcher;
        iterator._s = s;
        iterator._global = flags.indexOf("g") !== -1;
        iterator._unicode = flags.indexOf("u") !== -1;
        return iterator;
    };
    var stringMatchAll = function matchAll(regexp) {
        if (this === null || this === void 0) {
            throw new TypeError("String.prototype.matchAll called on null or undefined");
        }
        var matchAllKey = typeof Symbol !== "undefined" ? Symbol.matchAll : void 0;
        if (regexp !== null && regexp !== void 0) {
            var isRegExpValue = false;
            if (typeof regexp === "object" || typeof regexp === "function") {
                var matchKey = typeof Symbol !== "undefined" ? Symbol.match : void 0;
                var matcher2 = matchKey ? regexp[matchKey] : void 0;
                isRegExpValue = matcher2 !== void 0 ? !!matcher2 : objectToString7.call(regexp) === "[object RegExp]";
            }
            if (isRegExpValue) {
                var flags = regexp.flags;
                if (flags === null || flags === void 0) {
                    throw new TypeError("String.prototype.matchAll called with a RegExp whose flags are null or undefined");
                }
                if (typeof flags === "symbol") throw new TypeError("Cannot convert a Symbol value to a string");
                if ((typeof flags === "string" ? flags : String(flags)).indexOf("g") === -1) {
                    throw new TypeError("String.prototype.matchAll called with a non-global RegExp argument");
                }
            }
            var matcher = matchAllKey ? regexp[matchAllKey] : void 0;
            if (matcher !== void 0 && matcher !== null) {
                if (typeof matcher !== "function") throw new TypeError("String.prototype.matchAll: @@matchAll is not a function");
                return matcher.call(regexp, this);
            }
            if (objectToString7.call(regexp) === "[object RegExp]" && !(matchAllKey && typeof RegExp.prototype[matchAllKey] === "function")) {
                if (typeof this === "symbol") throw new TypeError("Cannot convert a Symbol value to a string");
                return regExpMatchAll(regexp, typeof this === "string" ? this : String(this));
            }
        }
        if (typeof this === "symbol") throw new TypeError("Cannot convert a Symbol value to a string");
        var s = typeof this === "string" ? this : String(this);
        var rx = new window.RegExp(regexp === void 0 ? "" : regexp, "g");
        var method = matchAllKey ? rx[matchAllKey] : void 0;
        if (typeof method === "function") {
            return method.call(rx, s);
        }
        return regExpMatchAll(rx, s);
    };
    var regExpMatchAllMethod = function regExpMatchAllMethod(string) {
        var R = this;
        if (R === null || typeof R !== "object" && typeof R !== "function") {
            throw new TypeError("RegExp.prototype[@@matchAll] called on a non-object");
        }
        if (typeof string === "symbol") throw new TypeError("Cannot convert a Symbol value to a string");
        return regExpMatchAll(R, typeof string === "string" ? string : String(string));
    };
    var install22 = function install22() {
        var matchAllKey = typeof Symbol !== "undefined" ? Symbol.matchAll : void 0;
        if (matchAllKey && typeof RegExp.prototype[matchAllKey] !== "function") {
            try {
                Object.defineProperty(RegExp.prototype, matchAllKey, {
                    value: regExpMatchAllMethod,
                    writable: true,
                    enumerable: false,
                    configurable: true
                });
                try {
                    Object.defineProperty(regExpMatchAllMethod, "name", {
                        value: "[Symbol.matchAll]",
                        configurable: true
                    });
                } catch (e) {}
                Object.defineProperty(regExpMatchAllMethod, "__polyfilled", {
                    value: true
                });
            } catch (e) {}
        }
        Object.defineProperty(String.prototype, "matchAll", {
            value: stringMatchAll,
            writable: true,
            enumerable: false,
            configurable: true
        });
        try {
            Object.defineProperty(String.prototype.matchAll, "name", {
                value: "matchAll",
                configurable: true
            });
        } catch (e) {}
        Object.defineProperty(String.prototype.matchAll, "__polyfilled", {
            value: true
        });
    };
    // src/modules/es.string.pad-end.ts
    var isSupported96 = function isSupported96() {
        try {
            if (typeof String.prototype.padEnd !== "function") return false;
            var ua = window.navigator && window.navigator.userAgent;
            return !/Version\/10(?:\.\d+){1,2}(?: [\w./]+)?(?: Mobile\/\w+)? Safari\//.test(ua || "");
        } catch (unused) {
            return false;
        }
    };
    var stringPadEnd = function padEnd(maxLength) {
        if (this === null || this === void 0) {
            throw new TypeError("String.prototype.padEnd called on null or undefined");
        }
        if (typeof this === "symbol") throw new TypeError("Cannot convert a Symbol value to a string");
        var source = typeof this === "string" ? this : String(this);
        var intMaxLength = +maxLength;
        intMaxLength = intMaxLength !== intMaxLength || intMaxLength <= 0 ? 0 : intMaxLength > 9007199254740991 ? 9007199254740991 : Math.floor(intMaxLength);
        var stringLength = source.length;
        if (intMaxLength <= stringLength) {
            return source;
        }
        var fillString = arguments.length > 1 ? arguments[1] : void 0;
        if (typeof fillString === "symbol") throw new TypeError("Cannot convert a Symbol value to a string");
        var padWith = fillString === void 0 ? " " : typeof fillString === "string" ? fillString : String(fillString);
        if (padWith.length === 0) {
            return source;
        }
        var charsNeeded = intMaxLength - stringLength;
        var fill3 = padWith;
        while(fill3.length < charsNeeded){
            fill3 = fill3 + fill3;
        }
        return source + fill3.substring(0, charsNeeded);
    };
    // src/modules/es.string.pad-start.ts
    var isSupported97 = function isSupported97() {
        try {
            if (typeof String.prototype.padStart !== "function") return false;
            var ua = window.navigator && window.navigator.userAgent;
            return !/Version\/10(?:\.\d+){1,2}(?: [\w./]+)?(?: Mobile\/\w+)? Safari\//.test(ua || "");
        } catch (unused) {
            return false;
        }
    };
    var stringPadStart = function padStart(maxLength) {
        if (this === null || this === void 0) {
            throw new TypeError("String.prototype.padStart called on null or undefined");
        }
        if (typeof this === "symbol") throw new TypeError("Cannot convert a Symbol value to a string");
        var source = typeof this === "string" ? this : String(this);
        var intMaxLength = +maxLength;
        intMaxLength = intMaxLength !== intMaxLength || intMaxLength <= 0 ? 0 : intMaxLength > 9007199254740991 ? 9007199254740991 : Math.floor(intMaxLength);
        var stringLength = source.length;
        if (intMaxLength <= stringLength) {
            return source;
        }
        var fillString = arguments.length > 1 ? arguments[1] : void 0;
        if (typeof fillString === "symbol") throw new TypeError("Cannot convert a Symbol value to a string");
        var padWith = fillString === void 0 ? " " : typeof fillString === "string" ? fillString : String(fillString);
        if (padWith.length === 0) {
            return source;
        }
        var charsNeeded = intMaxLength - stringLength;
        var fill3 = padWith;
        while(fill3.length < charsNeeded){
            fill3 = fill3 + fill3;
        }
        return fill3.substring(0, charsNeeded) + source;
    };
    // src/modules/es.string.raw.ts
    var isSupported98 = function isSupported98() {
        try {
            return typeof String.raw === "function";
        } catch (unused) {
            return false;
        }
    };
    var stringRaw = function raw(template) {
        if (template === null || template === void 0) {
            throw new TypeError("Cannot convert undefined or null to object");
        }
        var literals = Object(template).raw;
        if (literals === null || literals === void 0) {
            throw new TypeError("Cannot convert undefined or null to object");
        }
        var boxed = Object(literals);
        var literalCount = +boxed.length;
        literalCount = literalCount !== literalCount || literalCount <= 0 ? 0 : literalCount > 9007199254740991 ? 9007199254740991 : Math.floor(literalCount);
        if (literalCount === 0) {
            return "";
        }
        var result = "";
        var substitutionCount = arguments.length - 1;
        for(var i = 0;; i++){
            var literal = boxed[i];
            if (typeof literal === "symbol") throw new TypeError("Cannot convert a Symbol value to a string");
            result += typeof literal === "string" ? literal : String(literal);
            if (i + 1 === literalCount) {
                return result;
            }
            if (i < substitutionCount) {
                var substitution = arguments[i + 1];
                if (typeof substitution === "symbol") throw new TypeError("Cannot convert a Symbol value to a string");
                result += typeof substitution === "string" ? substitution : String(substitution);
            }
        }
    };
    // src/modules/es.string.repeat.ts
    var isSupported99 = function isSupported99() {
        try {
            return typeof String.prototype.repeat === "function";
        } catch (unused) {
            return false;
        }
    };
    var stringRepeat = function stringRepeat(count) {
        if (this === null || this === void 0) {
            throw new TypeError("String.prototype.repeat called on null or undefined");
        }
        if (typeof this === "symbol") throw new TypeError("Cannot convert a Symbol value to a string");
        var source = typeof this === "string" ? this : String(this);
        var times = +count;
        if (times !== times) {
            times = 0;
        }
        times = times < 0 ? Math.ceil(times) : Math.floor(times);
        if (times < 0 || times === Infinity) {
            throw new RangeError("Invalid count value: " + count);
        }
        var result = "";
        var chunk = source;
        while(times > 0){
            if (times % 2 === 1) {
                result += chunk;
            }
            times = Math.floor(times / 2);
            if (times > 0) {
                chunk += chunk;
            }
        }
        return result;
    };
    // src/modules/es.string.replace.ts
    var isSupported100 = function isSupported100() {
        try {
            if (typeof String.prototype.replace !== "function") return false;
            var symbol = typeof Symbol !== "undefined" ? Symbol.replace : void 0;
            if (!symbol) return true;
            var probe = {};
            probe[symbol] = function() {
                return 7;
            };
            if ("".replace(probe) !== 7) return false;
            var execCalled = false;
            var re = /a/;
            re.exec = function() {
                execCalled = true;
                return null;
            };
            re[symbol]("");
            if (!execCalled) return false;
            var named = /./;
            named.exec = function() {
                var result = [];
                result.groups = {
                    a: "7"
                };
                return result;
            };
            if ("".replace(named, "$<a>") !== "7") return false;
            return replaceKeeps$0 && !replaceSubstitutesUndefinedCapture;
        } catch (unused) {
            return false;
        }
    };
    var nativeReplace = String.prototype.replace;
    var objectToString8 = Object.prototype.toString;
    var stringReplace = function replace(searchValue, replaceValue) {
        if (this === null || this === void 0) {
            throw new TypeError("String.prototype.replace called on null or undefined");
        }
        if (searchValue !== null && (typeof searchValue === "object" || typeof searchValue === "function") && typeof Symbol !== "undefined" && Symbol.replace) {
            var handler = searchValue[Symbol.replace];
            if (handler !== void 0 && handler !== null) {
                if (typeof handler !== "function") throw new TypeError("String.prototype.replace: @@replace is not a function");
                return handler.call(searchValue, this, replaceValue);
            }
        }
        if (searchValue !== null && typeof searchValue === "object" && objectToString8.call(searchValue) === "[object RegExp]") {
            return nativeReplace.call(this, searchValue, replaceValue);
        }
        if (typeof this === "symbol") throw new TypeError("Cannot convert a Symbol value to a string");
        var string = typeof this === "string" ? this : String(this);
        if (typeof searchValue === "symbol") throw new TypeError("Cannot convert a Symbol value to a string");
        var searchString = typeof searchValue === "string" ? searchValue : String(searchValue);
        if (typeof replaceValue === "symbol") throw new TypeError("Cannot convert a Symbol value to a string");
        return nativeReplace.call(string, searchString, typeof replaceValue === "function" || typeof replaceValue === "string" ? replaceValue : String(replaceValue));
    };
    var regExpExecAtLoad2 = RegExp.prototype.exec;
    var objectToStringR2 = Object.prototype.toString;
    var symbolKeyReplace = typeof Symbol !== "undefined" ? Symbol.replace : void 0;
    var nativeRegExpReplace = symbolKeyReplace ? RegExp.prototype[symbolKeyReplace] : void 0;
    var toStrReplace = function toStrReplace(value) {
        if (typeof value === "symbol") throw new TypeError("Cannot convert a Symbol value to a string");
        return typeof value === "string" ? value : String(value);
    };
    var toLengthReplace = function toLengthReplace(value) {
        var n = +value;
        n = n !== n || n <= 0 ? 0 : Math.floor(n);
        return n > 9007199254740991 ? 9007199254740991 : n;
    };
    var replaceKeeps$0 = "a".replace(/./, "$0") === "$0";
    var replaceSubstitutesUndefinedCapture = function() {
        try {
            return nativeRegExpReplace ? nativeRegExpReplace.call(/./, "a", "$0") === "" : false;
        } catch (e) {
            return false;
        }
    }();
    var unsafeSubstitute = replaceSubstitutesUndefinedCapture ? "$" : "$0";
    var substitutionWithNames = /\$([$&'\x60]|\d{1,2}|<[^>]*>)/g;
    var substitutionNoNames = /\$([$&'\x60]|\d{1,2})/g;
    var getSubstitution = function getSubstitution(matched, str, position, captures, namedCaptures, replacement) {
        var tailPos = position + matched.length;
        var m = captures.length;
        var symbols = namedCaptures === void 0 ? substitutionNoNames : substitutionWithNames;
        return nativeReplace.call(replacement, symbols, function(match2, ch) {
            var capture2;
            switch(ch.charAt(0)){
                case "$":
                    return "$";
                case "&":
                    return matched;
                case "`":
                    return str.slice(0, position);
                case "'":
                    return str.slice(tailPos);
                case "<":
                    capture2 = namedCaptures[ch.slice(1, -1)];
                    break;
                default:
                    {
                        var n = +ch;
                        if (n === 0) return match2;
                        if (n > m) {
                            var f = Math.floor(n / 10);
                            if (f === 0) return match2;
                            if (f <= m) return captures[f - 1] === void 0 ? ch.charAt(1) : captures[f - 1] + ch.charAt(1);
                            return match2;
                        }
                        capture2 = captures[n - 1];
                    }
            }
            return capture2 === void 0 ? "" : capture2;
        });
    };
    var regExpReplace = function regExpReplace(string, replaceValue) {
        var rx = this;
        if (rx === null || typeof rx !== "object" && typeof rx !== "function") {
            throw new TypeError("RegExp.prototype[@@replace] called on a non-object");
        }
        if (typeof string === "symbol") throw new TypeError("Cannot convert a Symbol value to a string");
        var S = typeof string === "string" ? string : String(string);
        var exec = rx.exec;
        if ((exec === regExpExecAtLoad2 || exec === RegExp.prototype.exec) && (typeof replaceValue === "function" || typeof replaceValue === "string" && replaceValue.indexOf(unsafeSubstitute) === -1 && replaceValue.indexOf("$<") === -1)) {
            return nativeRegExpReplace ? nativeRegExpReplace.call(rx, S, replaceValue) : nativeReplace.call(S, rx, replaceValue);
        }
        var lengthS = S.length;
        var functionalReplace = typeof replaceValue === "function";
        if (!functionalReplace) replaceValue = toStrReplace(replaceValue);
        var flags = toStrReplace(rx.flags);
        var global = flags.indexOf("g") !== -1;
        var fullUnicode = false;
        if (global) {
            fullUnicode = flags.indexOf("u") !== -1 || flags.indexOf("v") !== -1;
            rx.lastIndex = 0;
        }
        var results = [];
        for(;;){
            var stepExec = rx.exec;
            var result = void 0;
            if (typeof stepExec === "function") {
                result = stepExec.call(rx, S);
                if (result !== null && typeof result !== "object" && typeof result !== "function") {
                    throw new TypeError("RegExp exec method returned something other than an Object or null");
                }
            } else {
                if (objectToStringR2.call(rx) !== "[object RegExp]") throw new TypeError("RegExp#exec called on incompatible receiver");
                result = regExpExecAtLoad2.call(rx, S);
            }
            if (result === null) break;
            results[results.length] = result;
            if (!global) break;
            if (toStrReplace(result[0]) === "") {
                var index = toLengthReplace(rx.lastIndex);
                var next8 = index + 1;
                if (fullUnicode && next8 < lengthS) {
                    var c = S.charCodeAt(index);
                    if (c >= 55296 && c <= 56319) {
                        var d = S.charCodeAt(next8);
                        if (d >= 56320 && d <= 57343) next8 = index + 2;
                    }
                }
                rx.lastIndex = next8;
            }
        }
        var accumulated = "";
        var nextSourcePosition = 0;
        for(var i = 0; i < results.length; i++){
            var result1 = results[i];
            var resultLength = toLengthReplace(result1.length);
            var matched = toStrReplace(result1[0]);
            var position = +result1.index;
            position = position !== position ? 0 : position < 0 ? Math.ceil(position) : Math.floor(position);
            position = position < 0 ? 0 : position > lengthS ? lengthS : position;
            var captures = [];
            for(var n = 1; n < resultLength; n++){
                var capN = result1[n];
                captures[n - 1] = capN === void 0 ? void 0 : toStrReplace(capN);
            }
            var namedCaptures = result1.groups;
            var replacement = void 0;
            if (functionalReplace) {
                var args = [
                    matched
                ].concat(captures, [
                    position,
                    S
                ]);
                if (namedCaptures !== void 0) args[args.length] = namedCaptures;
                replacement = toStrReplace(replaceValue.apply(void 0, args));
            } else {
                if (namedCaptures !== void 0) {
                    if (namedCaptures === null) throw new TypeError("Cannot convert undefined or null to object");
                    namedCaptures = Object(namedCaptures);
                }
                replacement = getSubstitution(matched, S, position, captures, namedCaptures, replaceValue);
            }
            if (position >= nextSourcePosition) {
                accumulated += S.slice(nextSourcePosition, position) + replacement;
                nextSourcePosition = position + matched.length;
            }
        }
        return nextSourcePosition >= lengthS ? accumulated : accumulated + S.slice(nextSourcePosition);
    };
    var installRegExpReplace = function installRegExpReplace() {
        if (!symbolKeyReplace) return;
        try {
            Object.defineProperty(RegExp.prototype, symbolKeyReplace, {
                value: regExpReplace,
                writable: true,
                enumerable: false,
                configurable: true
            });
            try {
                Object.defineProperty(regExpReplace, "name", {
                    value: "[Symbol.replace]",
                    configurable: true
                });
            } catch (e) {}
            Object.defineProperty(regExpReplace, "__polyfilled", {
                value: true
            });
        } catch (e) {}
    };
    // src/modules/es.string.replace-all.ts
    var isSupported101 = function isSupported101() {
        try {
            return typeof String.prototype.replaceAll === "function";
        } catch (unused) {
            return false;
        }
    };
    var substitute = function substitute(replacementString, matched, position, source) {
        if (replacementString.indexOf("$") === -1) {
            return replacementString;
        }
        var result = "";
        for(var i = 0; i < replacementString.length; i++){
            var character = replacementString.charAt(i);
            var nextCharacter = i + 1 < replacementString.length ? replacementString.charAt(i + 1) : "";
            if (character === "$" && nextCharacter !== "") {
                if (nextCharacter === "$") {
                    result += "$";
                    i++;
                    continue;
                }
                if (nextCharacter === "&") {
                    result += matched;
                    i++;
                    continue;
                }
                if (nextCharacter === "`") {
                    result += source.substring(0, position);
                    i++;
                    continue;
                }
                if (nextCharacter === "'") {
                    result += source.substring(position + matched.length);
                    i++;
                    continue;
                }
            }
            result += character;
        }
        return result;
    };
    var objectToString9 = Object.prototype.toString;
    var stringReplaceAll = function replaceAll(searchValue, replaceValue) {
        if (this === null || this === void 0) {
            throw new TypeError("String.prototype.replaceAll called on null or undefined");
        }
        var replaceKey = typeof Symbol !== "undefined" ? Symbol.replace : void 0;
        if (searchValue !== null && searchValue !== void 0) {
            var isRegExpValue = false;
            if (typeof searchValue === "object" || typeof searchValue === "function") {
                var matchKey = typeof Symbol !== "undefined" ? Symbol.match : void 0;
                var matcher = matchKey ? searchValue[matchKey] : void 0;
                isRegExpValue = matcher !== void 0 ? !!matcher : objectToString9.call(searchValue) === "[object RegExp]";
            }
            if (isRegExpValue) {
                var flags = searchValue.flags;
                if (flags === null || flags === void 0) {
                    throw new TypeError("replaceAll called with a RegExp whose flags are null or undefined");
                }
                if (typeof flags === "symbol") throw new TypeError("Cannot convert a Symbol value to a string");
                if ((typeof flags === "string" ? flags : String(flags)).indexOf("g") === -1) {
                    throw new TypeError("replaceAll must be called with a global RegExp");
                }
            }
            var replacer = replaceKey ? searchValue[replaceKey] : void 0;
            if (replacer !== void 0 && replacer !== null) {
                if (typeof replacer !== "function") throw new TypeError("replaceAll: @@replace is not a function");
                return replacer.call(searchValue, this, replaceValue);
            }
            if (objectToString9.call(searchValue) === "[object RegExp]" && !(replaceKey && replaceKey in searchValue) && !(replaceKey && typeof RegExp.prototype[replaceKey] === "function")) {
                if (typeof this === "symbol") throw new TypeError("Cannot convert a Symbol value to a string");
                return String.prototype.replace.call(typeof this === "string" ? this : String(this), searchValue, replaceValue);
            }
        }
        if (typeof this === "symbol") throw new TypeError("Cannot convert a Symbol value to a string");
        var source = typeof this === "string" ? this : String(this);
        if (typeof searchValue === "symbol") throw new TypeError("Cannot convert a Symbol value to a string");
        var searchString = typeof searchValue === "string" ? searchValue : String(searchValue);
        var isFunction = typeof replaceValue === "function";
        if (!isFunction && typeof replaceValue === "symbol") throw new TypeError("Cannot convert a Symbol value to a string");
        var replacementString = isFunction ? "" : typeof replaceValue === "string" ? replaceValue : String(replaceValue);
        var hasDollar = replacementString.indexOf("$") !== -1;
        if (searchString === "") {
            var result2;
            if (isFunction) {
                result2 = replaceValue("", 0, source);
                if (typeof result2 === "symbol") throw new TypeError("Cannot convert a Symbol value to a string");
                if (typeof result2 !== "string") result2 = String(result2);
            } else result2 = hasDollar ? substitute(replacementString, "", 0, source) : replacementString;
            for(var i = 0; i < source.length; i++){
                var replacement = void 0;
                if (isFunction) {
                    replacement = replaceValue("", i + 1, source);
                    if (typeof replacement === "symbol") throw new TypeError("Cannot convert a Symbol value to a string");
                    if (typeof replacement !== "string") replacement = String(replacement);
                } else replacement = hasDollar ? substitute(replacementString, "", i + 1, source) : replacementString;
                result2 += source.charAt(i) + replacement;
            }
            return result2;
        }
        var result = "";
        var position = 0;
        var index = source.indexOf(searchString, position);
        while(index !== -1){
            var replacement1 = void 0;
            if (isFunction) {
                replacement1 = replaceValue(searchString, index, source);
                if (typeof replacement1 === "symbol") throw new TypeError("Cannot convert a Symbol value to a string");
                if (typeof replacement1 !== "string") replacement1 = String(replacement1);
            } else replacement1 = hasDollar ? substitute(replacementString, searchString, index, source) : replacementString;
            result += source.substring(position, index) + replacement1;
            position = index + searchString.length;
            index = source.indexOf(searchString, position);
        }
        result += source.substring(position);
        return result;
    };
    // src/modules/es.string.search.ts
    var isSupported102 = function isSupported102() {
        try {
            if (typeof String.prototype.search !== "function") return false;
            var symbol = typeof Symbol !== "undefined" ? Symbol.search : void 0;
            if (!symbol) return true;
            var probe = {};
            probe[symbol] = function() {
                return 7;
            };
            if ("".search(probe) !== 7) return false;
            var execCalled = false;
            var re = /a/;
            re.exec = function() {
                execCalled = true;
                return null;
            };
            re[symbol]("");
            return execCalled;
        } catch (unused) {
            return false;
        }
    };
    var nativeSearch = String.prototype.search;
    var objectToStringS2 = Object.prototype.toString;
    var stringSearch = function search(matcher) {
        if (this === null || this === void 0) {
            throw new TypeError("String.prototype.search called on null or undefined");
        }
        if (matcher !== null && (typeof matcher === "object" || typeof matcher === "function") && typeof Symbol !== "undefined" && Symbol.search) {
            var handler = matcher[Symbol.search];
            if (handler !== void 0 && handler !== null) {
                if (typeof handler !== "function") throw new TypeError("String.prototype.search: @@search is not a function");
                return handler.call(matcher, this);
            }
        }
        if (matcher === null || typeof matcher !== "object" && typeof matcher !== "function" || objectToStringS2.call(matcher) !== "[object RegExp]") {
            if (typeof matcher === "symbol") throw new TypeError("Cannot convert a Symbol value to a string");
            matcher = new RegExp(matcher === void 0 ? "" : String(matcher));
        }
        return nativeSearch.call(this, matcher);
    };
    var regExpExecAtLoad3 = RegExp.prototype.exec;
    var objectToStringR3 = Object.prototype.toString;
    var symbolKeySearch = typeof Symbol !== "undefined" ? Symbol.search : void 0;
    var nativeRegExpSearch = symbolKeySearch ? RegExp.prototype[symbolKeySearch] : void 0;
    var sameValueSearch = function sameValueSearch(a, b) {
        return a === b ? a !== 0 || 1 / a === 1 / b : a !== a && b !== b;
    };
    var regExpSearch = function regExpSearch(string) {
        var rx = this;
        if (rx === null || typeof rx !== "object" && typeof rx !== "function") {
            throw new TypeError("RegExp.prototype[@@search] called on a non-object");
        }
        if (typeof string === "symbol") throw new TypeError("Cannot convert a Symbol value to a string");
        var S = typeof string === "string" ? string : String(string);
        var exec = rx.exec;
        if (exec === regExpExecAtLoad3 || exec === RegExp.prototype.exec) {
            return nativeRegExpSearch ? nativeRegExpSearch.call(rx, S) : nativeSearch.call(S, rx);
        }
        var previousLastIndex = rx.lastIndex;
        if (!sameValueSearch(previousLastIndex, 0)) rx.lastIndex = 0;
        var result;
        var execFn = rx.exec;
        if (typeof execFn === "function") {
            result = execFn.call(rx, S);
            if (result !== null && typeof result !== "object" && typeof result !== "function") {
                throw new TypeError("RegExp exec method returned something other than an Object or null");
            }
        } else {
            if (objectToStringR3.call(rx) !== "[object RegExp]") {
                throw new TypeError("RegExp#exec called on incompatible receiver");
            }
            result = regExpExecAtLoad3.call(rx, S);
        }
        var currentLastIndex = rx.lastIndex;
        if (!sameValueSearch(currentLastIndex, previousLastIndex)) rx.lastIndex = previousLastIndex;
        return result === null ? -1 : result.index;
    };
    var installRegExpSearch = function installRegExpSearch() {
        if (!symbolKeySearch) return;
        try {
            Object.defineProperty(RegExp.prototype, symbolKeySearch, {
                value: regExpSearch,
                writable: true,
                enumerable: false,
                configurable: true
            });
            try {
                Object.defineProperty(regExpSearch, "name", {
                    value: "[Symbol.search]",
                    configurable: true
                });
            } catch (e) {}
            Object.defineProperty(regExpSearch, "__polyfilled", {
                value: true
            });
        } catch (e) {}
    };
    // src/modules/es.string.split.ts
    var isSupported103 = function isSupported103() {
        try {
            if (typeof String.prototype.split !== "function") return false;
            var symbol = typeof Symbol !== "undefined" ? Symbol.split : void 0;
            if (!symbol) return true;
            var probe = {};
            probe[symbol] = function() {
                return 7;
            };
            if ("".split(probe) !== 7) return false;
            var execCalled = false;
            var re = /a/;
            re.exec = function() {
                execCalled = true;
                return null;
            };
            var ctor = {};
            var speciesKey = Symbol.species;
            if (speciesKey) ctor[speciesKey] = function() {
                return re;
            };
            var holder = {
                constructor: ctor,
                flags: ""
            };
            holder[symbol] = /./[symbol];
            holder[symbol]("");
            if (!execCalled) return false;
            var over = /(?:)/;
            var originalExec = over.exec;
            over.exec = function() {
                return originalExec.apply(this, arguments);
            };
            var parts = "ab".split(over);
            if (parts.length !== 2 || parts[0] !== "a" || parts[1] !== "b") return false;
            return !splitBuggy && !splitUnsupportedY;
        } catch (unused) {
            return false;
        }
    };
    var nativeSplit = String.prototype.split;
    var stringSplit = function split(separator, limit) {
        if (this === null || this === void 0) {
            throw new TypeError("String.prototype.split called on null or undefined");
        }
        if (separator !== null && (typeof separator === "object" || typeof separator === "function") && typeof Symbol !== "undefined" && Symbol.split) {
            var handler = separator[Symbol.split];
            if (handler !== void 0 && handler !== null) {
                if (typeof handler !== "function") throw new TypeError("String.prototype.split: @@split is not a function");
                return handler.call(separator, this, limit);
            }
        }
        return nativeSplit.call(this, separator, limit);
    };
    var regExpExecAtLoad4 = RegExp.prototype.exec;
    var objectToStringR4 = Object.prototype.toString;
    var symbolKeySplit = typeof Symbol !== "undefined" ? Symbol.split : void 0;
    var nativeRegExpSplit = symbolKeySplit ? RegExp.prototype[symbolKeySplit] : void 0;
    var regExpExecSplit = function regExpExecSplit(R, S) {
        var exec = R.exec;
        if (typeof exec === "function") {
            var result = exec.call(R, S);
            if (result !== null && typeof result !== "object" && typeof result !== "function") {
                throw new TypeError("RegExp exec method returned something other than an Object or null");
            }
            return result;
        }
        if (objectToStringR4.call(R) !== "[object RegExp]") throw new TypeError("RegExp#exec called on incompatible receiver");
        return regExpExecAtLoad4.call(R, S);
    };
    var toLengthSplit = function toLengthSplit(value) {
        var n = +value;
        n = n !== n || n <= 0 ? 0 : Math.floor(n);
        return n > 9007199254740991 ? 9007199254740991 : n;
    };
    var splitUnsupportedY = function() {
        try {
            var re = new RegExp("a", "y");
            re.lastIndex = 2;
            return re.exec("abcd") !== null;
        } catch (e) {
            return true;
        }
    }();
    var splitBuggy = function() {
        try {
            return "abbc".split(/(b)*/)[1] === "c" || "test".split(/(?:)/, -1).length !== 4 || "ab".split(/(?:ab)*/).length !== 2 || ".".split(/(.?)(.?)/).length !== 4 || ".".split(/()()/).length > 1 || "".split(/.?/).length > 0;
        } catch (e) {
            return true;
        }
    }();
    var internalSplit = function internalSplit(separator, limit) {
        if (separator === void 0 && limit === 0) return [];
        return nativeSplit.call(this, separator, limit);
    };
    var regExpSplit = function regExpSplit(string, limit) {
        var rx = this;
        if (rx === null || typeof rx !== "object" && typeof rx !== "function") {
            throw new TypeError("RegExp.prototype[@@split] called on a non-object");
        }
        if (typeof string === "symbol") throw new TypeError("Cannot convert a Symbol value to a string");
        var S = typeof string === "string" ? string : String(string);
        var exec = rx.exec;
        if (!splitBuggy && (exec === regExpExecAtLoad4 || exec === RegExp.prototype.exec)) {
            return nativeRegExpSplit ? nativeRegExpSplit.call(rx, S, limit) : internalSplit.call(S, rx, limit);
        }
        var defaultCtor = window.RegExp;
        var C = rx.constructor;
        if (C === void 0) C = defaultCtor;
        else {
            if (C === null || typeof C !== "object" && typeof C !== "function") throw new TypeError("RegExp constructor is not an object");
            var speciesKey = typeof Symbol !== "undefined" ? Symbol.species : void 0;
            var species = speciesKey ? C[speciesKey] : void 0;
            if (species === void 0 || species === null) C = defaultCtor;
            else if (typeof species === "function") C = species;
            else throw new TypeError("RegExp @@species is not a constructor");
        }
        var rawFlags = rx.flags;
        if (typeof rawFlags === "symbol") {
            throw new TypeError("Cannot convert a Symbol value to a string");
        }
        var flags = typeof rawFlags === "string" ? rawFlags : String(rawFlags);
        var unicodeMatching = flags.indexOf("u") !== -1 || flags.indexOf("v") !== -1;
        var splitter = new C(rx, flags.indexOf("y") !== -1 ? flags : flags + "y");
        var A = [];
        var lim = limit === void 0 ? 4294967295 : limit >>> 0;
        if (lim === 0) return A;
        var size = S.length;
        if (size === 0) {
            if (regExpExecSplit(splitter, S) !== null) return A;
            A[0] = S;
            return A;
        }
        var p = 0;
        var q = 0;
        while(q < size){
            splitter.lastIndex = q;
            var z = regExpExecSplit(splitter, S);
            var e = void 0;
            if (z === null || (e = Math.min(toLengthSplit(splitter.lastIndex), size)) === p) {
                var nextQ = q + 1;
                if (unicodeMatching && q + 1 < S.length) {
                    var c = S.charCodeAt(q);
                    if (c >= 55296 && c <= 56319) {
                        var d = S.charCodeAt(q + 1);
                        if (d >= 56320 && d <= 57343) {
                            nextQ = q + 2;
                        }
                    }
                }
                q = nextQ;
                continue;
            }
            A[A.length] = S.slice(p, q);
            if (A.length === lim) return A;
            p = e;
            var numberOfCaptures = Math.max(toLengthSplit(z.length) - 1, 0);
            for(var i = 1; i <= numberOfCaptures; i++){
                A[A.length] = z[i];
                if (A.length === lim) return A;
            }
            q = p;
        }
        A[A.length] = S.slice(p, size);
        return A;
    };
    var installRegExpSplit = function installRegExpSplit() {
        if (!symbolKeySplit) return;
        try {
            Object.defineProperty(RegExp.prototype, symbolKeySplit, {
                value: regExpSplit,
                writable: true,
                enumerable: false,
                configurable: true
            });
            try {
                Object.defineProperty(regExpSplit, "name", {
                    value: "[Symbol.split]",
                    configurable: true
                });
            } catch (e) {}
            Object.defineProperty(regExpSplit, "__polyfilled", {
                value: true
            });
        } catch (e) {}
    };
    // src/modules/es.string.starts-with.ts
    var isSupported104 = function isSupported104() {
        try {
            if (typeof String.prototype.startsWith !== "function") return false;
            var matchKey = typeof Symbol !== "undefined" ? Symbol.match : void 0;
            if (!matchKey) return true;
            var regexp = /./;
            try {
                "/./".startsWith(regexp);
                return false;
            } catch (e) {}
            regexp[matchKey] = false;
            return "/./".startsWith(regexp) === true;
        } catch (unused) {
            return false;
        }
    };
    var objectToString10 = Object.prototype.toString;
    var stringStartsWith = function startsWith(search2) {
        var start = arguments.length > 1 ? arguments[1] : void 0;
        if (this === null || this === void 0) {
            throw new TypeError("String.prototype.startsWith called on null or undefined");
        }
        if (typeof this === "symbol") throw new TypeError("Cannot convert a Symbol value to a string");
        var s = typeof this === "string" ? this : String(this);
        var isRegExpValue = false;
        if (search2 !== null && (typeof search2 === "object" || typeof search2 === "function")) {
            var matchKey = typeof Symbol !== "undefined" ? Symbol.match : void 0;
            var matcher = matchKey ? search2[matchKey] : void 0;
            isRegExpValue = matcher !== void 0 ? !!matcher : objectToString10.call(search2) === "[object RegExp]";
        }
        if (isRegExpValue) {
            throw new TypeError("First argument to String.prototype.startsWith must not be a regular expression");
        }
        if (typeof search2 === "symbol") throw new TypeError("Cannot convert a Symbol value to a string");
        var searchString = typeof search2 === "string" ? search2 : String(search2);
        var position = 0;
        if (start !== void 0) {
            position = +start;
            position = position !== position ? 0 : position < 0 ? Math.ceil(position) : Math.floor(position);
        }
        if (position < 0) {
            position = 0;
        } else if (position > s.length) {
            position = s.length;
        }
        if (position + searchString.length > s.length) {
            return false;
        }
        for(var i = 0; i < searchString.length; i++){
            if (s.charCodeAt(position + i) !== searchString.charCodeAt(i)) {
                return false;
            }
        }
        return true;
    };
    // src/modules/es.string.to-well-formed.ts
    var isSupported105 = function isSupported105() {
        try {
            return typeof String.prototype.toWellFormed === "function" && String.prototype.toWellFormed.call(1) === "1";
        } catch (unused) {
            return false;
        }
    };
    var stringToWellFormed = function stringToWellFormed() {
        if (this === null || this === void 0) {
            throw new TypeError("String.prototype.toWellFormed called on null or undefined");
        }
        if (typeof this === "symbol") throw new TypeError("Cannot convert a Symbol value to a string");
        var str = typeof this === "string" ? this : String(this);
        var out = "";
        for(var i = 0; i < str.length; i++){
            var code = str.charCodeAt(i);
            if (code >= 56320 && code <= 57343) {
                out += "\uFFFD";
            } else if (code >= 55296 && code <= 56319) {
                var next8 = str.charCodeAt(i + 1);
                if (next8 >= 56320 && next8 <= 57343) {
                    out += str.charAt(i) + str.charAt(i + 1);
                    i++;
                } else {
                    out += "\uFFFD";
                }
            } else {
                out += str.charAt(i);
            }
        }
        return out;
    };
    // src/modules/es.string.trim.ts
    var WHITESPACE = "	\n\v\f\r \xA0\u1680\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\u2028\u2029\uFEFF";
    var NON = "\u200B\x85\u180E";
    var isSupported106 = function isSupported106() {
        try {
            var fn = String.prototype.trim;
            if (typeof fn !== "function") return false;
            if (fn.call(WHITESPACE) !== "" || fn.call(NON) !== NON) return false;
            return typeof fn.name !== "string" || fn.name === "trim";
        } catch (unused) {
            return false;
        }
    };
    var stringTrim = function stringTrim() {
        if (this === null || this === void 0) {
            throw new TypeError("String.prototype.trim called on null or undefined");
        }
        if (typeof this === "symbol") throw new TypeError("Cannot convert a Symbol value to a string");
        var s = typeof this === "string" ? this : String(this);
        var start = 0;
        var end = s.length;
        while(start < end){
            var c = s.charCodeAt(start);
            if (!(c <= 32 ? c === 32 || c >= 9 && c <= 13 : c >= 160 && (c === 160 || c === 5760 || c >= 8192 && c <= 8202 || c === 8232 || c === 8233 || c === 8239 || c === 8287 || c === 12288 || c === 65279))) break;
            start++;
        }
        while(end > start){
            var c1 = s.charCodeAt(end - 1);
            if (!(c1 <= 32 ? c1 === 32 || c1 >= 9 && c1 <= 13 : c1 >= 160 && (c1 === 160 || c1 === 5760 || c1 >= 8192 && c1 <= 8202 || c1 === 8232 || c1 === 8233 || c1 === 8239 || c1 === 8287 || c1 === 12288 || c1 === 65279))) break;
            end--;
        }
        return start === 0 && end === s.length ? s : s.slice(start, end);
    };
    // src/modules/es.string.trim-end.ts
    var WHITESPACE2 = "	\n\v\f\r \xA0\u1680\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\u2028\u2029\uFEFF";
    var NON2 = "\u200B\x85\u180E";
    var isSupported107 = function isSupported107() {
        try {
            var fn = String.prototype.trimEnd;
            if (typeof fn !== "function") return false;
            if (fn.call(WHITESPACE2) !== "" || fn.call(NON2) !== NON2) return false;
            return typeof fn.name !== "string" || fn.name === "trimEnd";
        } catch (unused) {
            return false;
        }
    };
    var stringTrimEnd = function stringTrimEnd() {
        if (this === null || this === void 0) {
            throw new TypeError("String.prototype.trimEnd called on null or undefined");
        }
        if (typeof this === "symbol") throw new TypeError("Cannot convert a Symbol value to a string");
        var s = typeof this === "string" ? this : String(this);
        var start = 0;
        var end = s.length;
        while(end > start){
            var c = s.charCodeAt(end - 1);
            if (!(c <= 32 ? c === 32 || c >= 9 && c <= 13 : c >= 160 && (c === 160 || c === 5760 || c >= 8192 && c <= 8202 || c === 8232 || c === 8233 || c === 8239 || c === 8287 || c === 12288 || c === 65279))) break;
            end--;
        }
        return start === 0 && end === s.length ? s : s.slice(start, end);
    };
    // src/modules/es.string.trim-start.ts
    var WHITESPACE3 = "	\n\v\f\r \xA0\u1680\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\u2028\u2029\uFEFF";
    var NON3 = "\u200B\x85\u180E";
    var isSupported108 = function isSupported108() {
        try {
            var fn = String.prototype.trimStart;
            if (typeof fn !== "function") return false;
            if (fn.call(WHITESPACE3) !== "" || fn.call(NON3) !== NON3) return false;
            return typeof fn.name !== "string" || fn.name === "trimStart";
        } catch (unused) {
            return false;
        }
    };
    var stringTrimStart = function stringTrimStart() {
        if (this === null || this === void 0) {
            throw new TypeError("String.prototype.trimStart called on null or undefined");
        }
        if (typeof this === "symbol") throw new TypeError("Cannot convert a Symbol value to a string");
        var s = typeof this === "string" ? this : String(this);
        var start = 0;
        var end = s.length;
        while(start < end){
            var c = s.charCodeAt(start);
            if (!(c <= 32 ? c === 32 || c >= 9 && c <= 13 : c >= 160 && (c === 160 || c === 5760 || c >= 8192 && c <= 8202 || c === 8232 || c === 8233 || c === 8239 || c === 8287 || c === 12288 || c === 65279))) break;
            start++;
        }
        return start === 0 && end === s.length ? s : s.slice(start, end);
    };
    // src/modules/es.array-buffer.detached.ts
    var isSupported109 = function isSupported109() {
        try {
            if (typeof ArrayBuffer === "undefined") {
                return false;
            }
            if (!("detached" in ArrayBuffer.prototype)) {
                return false;
            }
            return new ArrayBuffer(0).detached === false;
        } catch (unused) {
            return false;
        }
    };
    var DETACHED_FLAG = "__spackleDetached";
    var arrayBufferDetached = function arrayBufferDetached() {
        if (!this || typeof this !== "object" || Object.prototype.toString.call(this) !== "[object ArrayBuffer]") {
            throw new TypeError("ArrayBuffer.prototype.detached called on a non-ArrayBuffer");
        }
        if (this.byteLength !== 0) {
            return false;
        }
        if (this[DETACHED_FLAG] === true) {
            return true;
        }
        try {
            new DataView(this);
            return false;
        } catch (e) {
            return true;
        }
    };
    var install23 = function install23() {
        if (typeof ArrayBuffer === "undefined") {
            return;
        }
        if ("detached" in ArrayBuffer.prototype) {
            return;
        }
        defineGetter(ArrayBuffer.prototype, "detached", arrayBufferDetached);
    };
    // src/modules/es.array-buffer.transfer.ts
    var isSupported110 = function isSupported110() {
        try {
            if (typeof ArrayBuffer === "undefined") {
                return false;
            }
            var proto2 = ArrayBuffer.prototype;
            if (typeof proto2.transfer !== "function" || typeof proto2.transferToFixedLength !== "function") {
                return false;
            }
            var probe = new ArrayBuffer(2);
            var moved = proto2.transfer.call(probe, 2);
            return moved.byteLength === 2 && probe.byteLength === 0;
        } catch (unused) {
            return false;
        }
    };
    var DETACHED_FLAG2 = "__spackleDetached";
    var DETACHED_DESC = {
        value: true,
        configurable: true
    };
    var markDetached = function markDetached(buffer) {
        try {
            Object.defineProperty(buffer, DETACHED_FLAG2, DETACHED_DESC);
        } catch (e) {}
    };
    var isDetached2 = function isDetached2(buffer) {
        if (buffer.byteLength !== 0) {
            return false;
        }
        if (buffer[DETACHED_FLAG2] === true) {
            return true;
        }
        try {
            new DataView(buffer);
            return false;
        } catch (e) {
            return true;
        }
    };
    var globalRef = typeof window !== "undefined" ? window : typeof globalThis !== "undefined" ? globalThis : void 0;
    var closePorts = function closePorts(channel) {
        try {
            channel.port1.close();
            channel.port2.close();
        } catch (e) {}
    };
    var resolveDetacher = function resolveDetacher() {
        var host = globalRef;
        if (!host) {
            return null;
        }
        try {
            var clone = host.structuredClone;
            if (typeof clone === "function") {
                var probe = new ArrayBuffer(2);
                clone(probe, {
                    transfer: [
                        probe
                    ]
                });
                if (probe.byteLength === 0) {
                    return function(buffer) {
                        clone(buffer, {
                            transfer: [
                                buffer
                            ]
                        });
                    };
                }
            }
        } catch (e) {}
        try {
            var Channel = host.MessageChannel;
            if (Channel && (typeof Channel === "function" || typeof Channel === "object")) {
                var probe1 = new ArrayBuffer(2);
                var channel = new Channel();
                channel.port1.postMessage(null, [
                    probe1
                ]);
                var detached = probe1.byteLength === 0;
                closePorts(channel);
                if (detached) {
                    return function(buffer) {
                        var live = new Channel();
                        live.port1.postMessage(null, [
                            buffer
                        ]);
                        closePorts(live);
                    };
                }
            }
        } catch (e) {}
        return null;
    };
    var detacher = null;
    var detacherResolved = false;
    var getDetacher = function getDetacher() {
        if (!detacherResolved) {
            detacherResolved = true;
            detacher = resolveDetacher();
        }
        return detacher;
    };
    var transferImpl = function transferImpl(source, newLength) {
        if (!source || typeof source !== "object" || Object.prototype.toString.call(source) !== "[object ArrayBuffer]") {
            throw new TypeError("ArrayBuffer.prototype.transfer called on a non-ArrayBuffer");
        }
        if (isDetached2(source)) {
            throw new TypeError("Cannot transfer a detached ArrayBuffer");
        }
        var detach = getDetacher();
        if (!detach) {
            throw new TypeError("This engine cannot detach an ArrayBuffer");
        }
        var oldLength = source.byteLength;
        var length = oldLength;
        if (newLength !== void 0) {
            var numeric = +newLength;
            length = numeric !== numeric ? 0 : numeric >= 0 ? Math.floor(numeric) : Math.ceil(numeric);
            if (length < 0 || length > 9007199254740991) {
                throw new RangeError("Invalid ArrayBuffer length");
            }
        }
        var next8 = new ArrayBuffer(length);
        var copyLength = Math.min(length, oldLength);
        if (copyLength > 0) {
            new Uint8Array(next8).set(new Uint8Array(source, 0, copyLength));
        }
        detach(source);
        markDetached(source);
        return next8;
    };
    var arrayBufferTransfer = function arrayBufferTransfer(newLength) {
        return transferImpl(this, newLength);
    };
    var arrayBufferTransferToFixedLength = function arrayBufferTransferToFixedLength(newLength) {
        return transferImpl(this, newLength);
    };
    var install24 = function install24() {
        if (typeof ArrayBuffer === "undefined") {
            return;
        }
        var proto2 = ArrayBuffer.prototype;
        if (typeof proto2.transfer === "function" && typeof proto2.transferToFixedLength === "function") {
            return;
        }
        if (!getDetacher()) {
            return;
        }
        if (typeof proto2.transfer !== "function") {
            define(proto2, "transfer", arrayBufferTransfer);
        }
        if (typeof proto2.transferToFixedLength !== "function") {
            define(proto2, "transferToFixedLength", arrayBufferTransferToFixedLength);
        }
    };
    // src/modules/install-array-buffer.ts
    var isSupported111 = function isSupported111() {
        try {
            if (typeof ArrayBuffer === "undefined") {
                return false;
            }
            return typeof ArrayBuffer.isView === "function" && typeof ArrayBuffer.prototype.slice === "function";
        } catch (unused) {
            return false;
        }
    };
    var objectToString11 = Object.prototype.toString;
    var isObject6 = function isObject6(value) {
        return value !== null && (typeof value === "object" || typeof value === "function");
    };
    var getterOf2 = function getterOf2(owner, key) {
        try {
            var desc = owner && Object.getOwnPropertyDescriptor(owner, key);
            return desc && typeof desc.get === "function" ? desc.get : void 0;
        } catch (e) {
            return void 0;
        }
    };
    var tagKey6 = typeof Symbol !== "undefined" ? Symbol.toStringTag : void 0;
    var typedArrayTagGetter = typeof Int8Array !== "undefined" && tagKey6 ? getterOf2(Object.getPrototypeOf(Int8Array.prototype), tagKey6) : void 0;
    var dataViewBufferGetter = typeof DataView !== "undefined" ? getterOf2(DataView.prototype, "buffer") : void 0;
    var bufferByteLengthGetter = typeof ArrayBuffer !== "undefined" ? getterOf2(ArrayBuffer.prototype, "byteLength") : void 0;
    var bufferDetachedGetter = typeof ArrayBuffer !== "undefined" ? getterOf2(ArrayBuffer.prototype, "detached") : void 0;
    var VIEW_TAGS = "[object Int8Array][object Uint8Array][object Uint8ClampedArray][object Int16Array][object Uint16Array][object Int32Array][object Uint32Array][object Float32Array][object Float64Array][object Float16Array][object BigInt64Array][object BigUint64Array][object DataView]";
    var arrayBufferIsView = function isView(value) {
        if (!isObject6(value)) return false;
        if (typedArrayTagGetter || dataViewBufferGetter) {
            if (typedArrayTagGetter && typedArrayTagGetter.call(value) !== void 0) return true;
            if (dataViewBufferGetter) {
                try {
                    dataViewBufferGetter.call(value);
                    return true;
                } catch (e) {
                    return false;
                }
            }
            return false;
        }
        var tag = objectToString11.call(value);
        return tag.charAt(tag.length - 1) === "]" && VIEW_TAGS.indexOf(tag) !== -1;
    };
    var requireArrayBuffer = function requireArrayBuffer(O, what) {
        if (!isObject6(O)) throw new TypeError(what + " is not an ArrayBuffer");
        var tag = objectToString11.call(O);
        if (tag === "[object SharedArrayBuffer]") throw new TypeError(what + " is a SharedArrayBuffer");
        if (bufferByteLengthGetter) {
            return bufferByteLengthGetter.call(O);
        }
        if (tag !== "[object ArrayBuffer]") throw new TypeError(what + " is not an ArrayBuffer");
        return O.byteLength;
    };
    var isDetached3 = function isDetached3(O) {
        return !!(bufferDetachedGetter && bufferDetachedGetter.call(O));
    };
    var arrayBufferSlice = function slice3(start, end) {
        var O = this;
        var length = requireArrayBuffer(O, "ArrayBuffer.prototype.slice receiver");
        if (isDetached3(O)) throw new TypeError("ArrayBuffer.prototype.slice called on a detached ArrayBuffer");
        var first = +start;
        first = first !== first ? 0 : first < 0 ? Math.ceil(first) : Math.floor(first);
        first = first < 0 ? Math.max(length + first, 0) : Math.min(first, length);
        var final = length;
        if (end !== void 0) {
            final = +end;
            final = final !== final ? 0 : final < 0 ? Math.ceil(final) : Math.floor(final);
        }
        final = final < 0 ? Math.max(length + final, 0) : Math.min(final, length);
        var newLength = Math.max(final - first, 0);
        var C = O.constructor;
        if (C === void 0) {
            C = ArrayBuffer;
        } else {
            if (!isObject6(C)) throw new TypeError("ArrayBuffer constructor is not an object");
            var S = typeof Symbol !== "undefined" && Symbol.species ? C[Symbol.species] : void 0;
            if (S === void 0 || S === null) C = ArrayBuffer;
            else if (typeof S === "function") C = S;
            else throw new TypeError("ArrayBuffer @@species is not a constructor");
        }
        var created = new C(newLength);
        var createdLength = requireArrayBuffer(created, "ArrayBuffer.prototype.slice species result");
        if (isDetached3(created)) throw new TypeError("ArrayBuffer.prototype.slice species result is detached");
        if (created === O) throw new TypeError("ArrayBuffer.prototype.slice species result is the receiver");
        if (createdLength < newLength) throw new TypeError("ArrayBuffer.prototype.slice species result is too small");
        if (isDetached3(O)) throw new TypeError("ArrayBuffer.prototype.slice: the receiver was detached");
        if (newLength > 0) new Uint8Array(created).set(new Uint8Array(O, first, newLength));
        return created;
    };
    var installArrayBuffer = function installArrayBuffer() {
        if (typeof ArrayBuffer !== "undefined") {
            if (typeof ArrayBuffer.isView !== "function") {
                define(ArrayBuffer, "isView", arrayBufferIsView);
            }
            if (typeof ArrayBuffer.prototype.slice !== "function") {
                define(ArrayBuffer.prototype, "slice", arrayBufferSlice);
            }
        }
    };
    // src/modules/install-float16.ts
    var scratch = typeof ArrayBuffer !== "undefined" && typeof DataView !== "undefined" ? new DataView(new ArrayBuffer(8)) : null;
    var isSupported112 = function isSupported112() {
        try {
            return typeof Math.f16round === "function" && typeof DataView !== "undefined" && typeof DataView.prototype.getFloat16 === "function" && typeof DataView.prototype.setFloat16 === "function";
        } catch (unused) {
            return false;
        }
    };
    var doubleToFloat16Bits = function doubleToFloat16Bits(value) {
        var n = +value;
        if (n !== n) return 32256;
        if (n === Infinity) return 31744;
        if (n === -Infinity) return 64512;
        if (n === 0) {
            return 1 / n === -Infinity ? 32768 : 0;
        }
        var sign = n < 0 || n === 0 && 1 / n < 0 ? 32768 : 0;
        var magnitude = Math.abs(n);
        if (magnitude >= 65520) {
            return sign | 31744;
        }
        if (magnitude < 5960464477539063e-23 / 2) {
            return sign;
        }
        if (magnitude < 6103515625e-14) {
            var scaled = magnitude / 5960464477539063e-23;
            var roundedValue = scaled;
            var roundedFloor = Math.floor(roundedValue);
            var roundedFraction = roundedValue - roundedFloor;
            var rounded = roundedFraction < 0.5 ? roundedFloor : roundedFraction > 0.5 ? roundedFloor + 1 : roundedFloor % 2 === 0 ? roundedFloor : roundedFloor + 1;
            return sign | rounded;
        }
        var exponent = Math.floor(Math.log(magnitude) / Math.LN2);
        if (magnitude < Math.pow(2, exponent)) exponent--;
        if (magnitude >= Math.pow(2, exponent + 1)) exponent++;
        var mantissa = magnitude / Math.pow(2, exponent) - 1;
        var mantissaBitsValue = mantissa * 1024;
        var mantissaBitsFloor = Math.floor(mantissaBitsValue);
        var mantissaBitsFraction = mantissaBitsValue - mantissaBitsFloor;
        var mantissaBits = mantissaBitsFraction < 0.5 ? mantissaBitsFloor : mantissaBitsFraction > 0.5 ? mantissaBitsFloor + 1 : mantissaBitsFloor % 2 === 0 ? mantissaBitsFloor : mantissaBitsFloor + 1;
        if (mantissaBits === 1024) {
            mantissaBits = 0;
            exponent++;
            if (exponent > 15) return sign | 31744;
        }
        return sign | exponent + 15 << 10 | mantissaBits;
    };
    var float16BitsToDouble = function float16BitsToDouble(bits) {
        var sign = bits & 32768 ? -1 : 1;
        var exponent = bits >> 10 & 31;
        var mantissa = bits & 1023;
        if (exponent === 0) {
            return mantissa === 0 ? sign * 0 : sign * mantissa * 5960464477539063e-23;
        }
        if (exponent === 31) {
            return mantissa === 0 ? sign * Infinity : NaN;
        }
        return sign * Math.pow(2, exponent - 15) * (1 + mantissa / 1024);
    };
    var mathF16round = function mathF16round(value) {
        var n = +value;
        if (n !== n) return NaN;
        if (n === 0 || n === Infinity || n === -Infinity) return n;
        return float16BitsToDouble(doubleToFloat16Bits(n));
    };
    var dataViewGetFloat16 = function getFloat16(byteOffset) {
        return float16BitsToDouble(this.getUint16(byteOffset, !!(arguments.length > 1 && arguments[1])));
    };
    var objectToString12 = Object.prototype.toString;
    var dataViewSetFloat16 = function setFloat16(byteOffset, value) {
        if (objectToString12.call(this) !== "[object DataView]") {
            throw new TypeError("DataView.prototype.setFloat16 called on an incompatible receiver");
        }
        var index = +byteOffset;
        index = index !== index ? 0 : index < 0 ? Math.ceil(index) : Math.floor(index);
        if (index < 0 || index > 9007199254740991) {
            throw new RangeError("DataView.prototype.setFloat16: offset is out of bounds");
        }
        var bits = doubleToFloat16Bits(+value);
        this.setUint16(index + 0, bits, !!(arguments.length > 2 && arguments[2]));
    };
    var installFloat16 = function installFloat16() {
        if (scratch) {
            if (typeof Math.f16round !== "function") {
                define(Math, "f16round", mathF16round);
            }
            if (typeof DataView !== "undefined" && DataView.prototype) {
                if (typeof DataView.prototype.getFloat16 !== "function") {
                    Object.defineProperty(DataView.prototype, "getFloat16", {
                        value: dataViewGetFloat16,
                        writable: true,
                        enumerable: false,
                        configurable: true
                    });
                    try {
                        Object.defineProperty(DataView.prototype.getFloat16, "name", {
                            value: "getFloat16",
                            configurable: true
                        });
                    } catch (e) {}
                    Object.defineProperty(DataView.prototype.getFloat16, "__polyfilled", {
                        value: true
                    });
                }
                if (typeof DataView.prototype.setFloat16 !== "function") {
                    Object.defineProperty(DataView.prototype, "setFloat16", {
                        value: dataViewSetFloat16,
                        writable: true,
                        enumerable: false,
                        configurable: true
                    });
                    try {
                        Object.defineProperty(DataView.prototype.setFloat16, "name", {
                            value: "setFloat16",
                            configurable: true
                        });
                    } catch (e) {}
                    Object.defineProperty(DataView.prototype.setFloat16, "__polyfilled", {
                        value: true
                    });
                }
            }
        }
    };
    // src/modules/install-uint8-array.ts
    var BASE64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    var BASE64URL = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
    var NO_OPTIONS = {};
    var HEX = "0123456789abcdef";
    var isSupported113 = function isSupported113() {
        try {
            if (typeof Uint8Array === "undefined") {
                return false;
            }
            return typeof Uint8Array.fromBase64 === "function" && typeof Uint8Array.fromHex === "function" && typeof Uint8Array.prototype.toBase64 === "function" && typeof Uint8Array.prototype.toHex === "function" && typeof Uint8Array.prototype.setFromBase64 === "function" && typeof Uint8Array.prototype.setFromHex === "function";
        } catch (unused) {
            return false;
        }
    };
    var DETACHED_FLAG3 = "__spackleDetached";
    var isDetached4 = function isDetached4(value) {
        var buffer = value.buffer;
        if (buffer && buffer[DETACHED_FLAG3] === true) {
            return true;
        }
        try {
            new Uint8Array(buffer, 0, 0);
            return false;
        } catch (unused) {
            try {
                return buffer.byteLength === 0;
            } catch (unused) {
                return true;
            }
        }
    };
    var decodeBase64 = function decodeBase64(input, chars, maxBytes, lastChunkHandling, target) {
        if (maxBytes === 0) {
            return {
                read: 0,
                written: 0
            };
        }
        var length = input.length;
        var index = 0;
        var read = 0;
        var written = 0;
        var chunk = 0;
        var chunkLength = 0;
        for(;;){
            if (index === length) {
                if (chunkLength > 0) {
                    if (lastChunkHandling === "stop-before-partial") {
                        return {
                            read: read,
                            written: written
                        };
                    }
                    if (chunkLength === 1) {
                        throw new SyntaxError("Invalid base64: a single trailing character");
                    }
                    if (lastChunkHandling === "strict") {
                        throw new SyntaxError("Invalid base64: incomplete final chunk");
                    }
                    if (written + (chunkLength - 1) > maxBytes) {
                        return {
                            read: read,
                            written: written
                        };
                    }
                    if (chunkLength === 2) {
                        target[written++] = chunk >> 4 & 255;
                    } else {
                        target[written++] = chunk >> 10 & 255;
                        target[written++] = chunk >> 2 & 255;
                    }
                }
                return {
                    read: length,
                    written: written
                };
            }
            var ch = input.charAt(index);
            index++;
            if (ch === " " || ch === "	" || ch === "\n" || ch === "\f" || ch === "\r") continue;
            if (ch === "=") {
                if (chunkLength < 2) {
                    throw new SyntaxError("Invalid base64: misplaced padding");
                }
                var sawSecond = false;
                while(index < length){
                    var tail = input.charAt(index);
                    index++;
                    if (tail === " " || tail === "	" || tail === "\n" || tail === "\f" || tail === "\r") continue;
                    if (tail === "=" && chunkLength === 2 && !sawSecond) {
                        sawSecond = true;
                        continue;
                    }
                    throw new SyntaxError("Invalid base64: characters after padding");
                }
                if (chunkLength === 2 && !sawSecond) {
                    if (lastChunkHandling === "stop-before-partial") {
                        return {
                            read: read,
                            written: written
                        };
                    }
                    throw new SyntaxError("Invalid base64: missing padding");
                }
                if (lastChunkHandling === "strict" && (chunkLength === 2 ? (chunk & 15) !== 0 : (chunk & 3) !== 0)) {
                    throw new SyntaxError("Invalid base64: non-zero padding bits");
                }
                if (written + (chunkLength - 1) > maxBytes) {
                    return {
                        read: read,
                        written: written
                    };
                }
                if (chunkLength === 2) {
                    target[written++] = chunk >> 4 & 255;
                } else {
                    target[written++] = chunk >> 10 & 255;
                    target[written++] = chunk >> 2 & 255;
                }
                return {
                    read: length,
                    written: written
                };
            }
            var value = chars.indexOf(ch);
            if (value === -1) {
                throw new SyntaxError("Invalid base64: bad character");
            }
            if (written === maxBytes && chunkLength === 0) {
                return {
                    read: read,
                    written: written
                };
            }
            chunk = chunk * 64 + value;
            chunkLength++;
            if (chunkLength === 4) {
                if (written + 3 > maxBytes) {
                    return {
                        read: read,
                        written: written
                    };
                }
                target[written] = chunk >> 16 & 255;
                target[written + 1] = chunk >> 8 & 255;
                target[written + 2] = chunk & 255;
                written += 3;
                chunk = 0;
                chunkLength = 0;
                read = index;
                if (written === maxBytes) {
                    return {
                        read: read,
                        written: written
                    };
                }
            }
        }
    };
    var decodeHex = function decodeHex(input, maxBytes, target) {
        if (input.length % 2 !== 0) {
            throw new SyntaxError("Invalid hex string: odd length");
        }
        var written = 0;
        var read = 0;
        for(var i = 0; i + 1 < input.length; i += 2){
            if (written >= maxBytes) break;
            var high = HEX.indexOf(input.charAt(i).toLowerCase());
            var low = HEX.indexOf(input.charAt(i + 1).toLowerCase());
            if (high === -1 || low === -1) {
                throw new SyntaxError("Invalid hex string: bad character");
            }
            target[written++] = high * 16 + low;
            read = i + 2;
        }
        return {
            read: read,
            written: written
        };
    };
    var uint8ArrayToBase64 = function uint8ArrayToBase64() {
        var options = arguments.length > 0 ? arguments[0] : void 0;
        if (typeof Uint8Array === "undefined" || !this || typeof this !== "object" || Object.prototype.toString.call(this) !== "[object Uint8Array]" || this.BYTES_PER_ELEMENT !== 1 || typeof this.byteLength !== "number") {
            throw new TypeError("Uint8Array.prototype.toBase64 called on a non-Uint8Array");
        }
        if (options !== void 0 && (options === null || typeof options !== "object")) {
            throw new TypeError("options must be an object or undefined");
        }
        var opts = options === void 0 ? NO_OPTIONS : options;
        var rawAlphabet = opts.alphabet;
        var alphabet = rawAlphabet === void 0 ? "base64" : rawAlphabet;
        if (alphabet !== "base64" && alphabet !== "base64url") {
            throw new TypeError("alphabet must be either 'base64' or 'base64url'");
        }
        var chars = alphabet === "base64url" ? BASE64URL : BASE64;
        var omitPadding = !!opts.omitPadding;
        if (isDetached4(this)) {
            throw new TypeError("Uint8Array.prototype.toBase64 called on a detached buffer");
        }
        var length = this.length;
        var out = "";
        var i = 0;
        for(; i + 2 < length; i += 3){
            var n = this[i] * 65536 + this[i + 1] * 256 + this[i + 2];
            out += chars.charAt(n >> 18 & 63) + chars.charAt(n >> 12 & 63) + chars.charAt(n >> 6 & 63) + chars.charAt(n & 63);
        }
        var remaining = length - i;
        if (remaining === 1) {
            var n1 = this[i];
            out += chars.charAt(n1 >> 2) + chars.charAt(n1 << 4 & 63);
            if (!omitPadding) out += "==";
        } else if (remaining === 2) {
            var n2 = this[i] * 256 + this[i + 1];
            out += chars.charAt(n2 >> 10) + chars.charAt(n2 >> 4 & 63) + chars.charAt(n2 << 2 & 63);
            if (!omitPadding) out += "=";
        }
        return out;
    };
    var uint8ArrayToHex = function uint8ArrayToHex() {
        if (typeof Uint8Array === "undefined" || !this || typeof this !== "object" || Object.prototype.toString.call(this) !== "[object Uint8Array]" || this.BYTES_PER_ELEMENT !== 1 || typeof this.byteLength !== "number") {
            throw new TypeError("Uint8Array.prototype.toHex called on a non-Uint8Array");
        }
        if (isDetached4(this)) {
            throw new TypeError("Uint8Array.prototype.toHex called on a detached buffer");
        }
        var out = "";
        for(var i = 0; i < this.length; i++){
            var byte = this[i];
            out += HEX.charAt(byte >> 4 & 15) + HEX.charAt(byte & 15);
        }
        return out;
    };
    var uint8ArrayFromBase64 = function uint8ArrayFromBase64(input) {
        var options = arguments.length > 1 ? arguments[1] : void 0;
        if (typeof input !== "string") {
            throw new TypeError("argument must be a string");
        }
        if (options !== void 0 && (options === null || typeof options !== "object")) {
            throw new TypeError("options must be an object or undefined");
        }
        var opts = options === void 0 ? NO_OPTIONS : options;
        var rawAlphabet = opts.alphabet;
        var alphabet = rawAlphabet === void 0 ? "base64" : rawAlphabet;
        if (alphabet !== "base64" && alphabet !== "base64url") {
            throw new TypeError("alphabet must be either 'base64' or 'base64url'");
        }
        var chars = alphabet === "base64url" ? BASE64URL : BASE64;
        var rawMode = opts.lastChunkHandling;
        var lastChunkHandling = rawMode === void 0 ? "loose" : rawMode;
        if (lastChunkHandling !== "loose" && lastChunkHandling !== "strict" && lastChunkHandling !== "stop-before-partial") {
            throw new TypeError("lastChunkHandling must be 'loose', 'strict' or 'stop-before-partial'");
        }
        var bytes = [];
        decodeBase64(input, chars, Infinity, lastChunkHandling, bytes);
        var out = new Uint8Array(bytes.length);
        for(var i = 0; i < bytes.length; i++)out[i] = bytes[i];
        return out;
    };
    var uint8ArrayFromHex = function uint8ArrayFromHex(input) {
        if (typeof input !== "string") {
            throw new TypeError("argument must be a string");
        }
        var bytes = [];
        decodeHex(input, Infinity, bytes);
        var out = new Uint8Array(bytes.length);
        for(var i = 0; i < bytes.length; i++)out[i] = bytes[i];
        return out;
    };
    var uint8ArraySetFromBase64 = function uint8ArraySetFromBase64(input) {
        var options = arguments.length > 1 ? arguments[1] : void 0;
        if (typeof Uint8Array === "undefined" || !this || typeof this !== "object" || Object.prototype.toString.call(this) !== "[object Uint8Array]" || this.BYTES_PER_ELEMENT !== 1 || typeof this.byteLength !== "number") {
            throw new TypeError("Uint8Array.prototype.setFromBase64 called on a non-Uint8Array");
        }
        if (typeof input !== "string") {
            throw new TypeError("argument must be a string");
        }
        if (options !== void 0 && (options === null || typeof options !== "object")) {
            throw new TypeError("options must be an object or undefined");
        }
        var opts = options === void 0 ? NO_OPTIONS : options;
        var rawAlphabet = opts.alphabet;
        var alphabet = rawAlphabet === void 0 ? "base64" : rawAlphabet;
        if (alphabet !== "base64" && alphabet !== "base64url") {
            throw new TypeError("alphabet must be either 'base64' or 'base64url'");
        }
        var chars = alphabet === "base64url" ? BASE64URL : BASE64;
        var rawMode = opts.lastChunkHandling;
        var lastChunkHandling = rawMode === void 0 ? "loose" : rawMode;
        if (lastChunkHandling !== "loose" && lastChunkHandling !== "strict" && lastChunkHandling !== "stop-before-partial") {
            throw new TypeError("lastChunkHandling must be 'loose', 'strict' or 'stop-before-partial'");
        }
        if (isDetached4(this)) {
            throw new TypeError("Uint8Array.prototype.setFromBase64 called on a detached buffer");
        }
        return decodeBase64(input, chars, this.length, lastChunkHandling, this);
    };
    var uint8ArraySetFromHex = function uint8ArraySetFromHex(input) {
        if (typeof Uint8Array === "undefined" || !this || typeof this !== "object" || Object.prototype.toString.call(this) !== "[object Uint8Array]" || this.BYTES_PER_ELEMENT !== 1 || typeof this.byteLength !== "number") {
            throw new TypeError("Uint8Array.prototype.setFromHex called on a non-Uint8Array");
        }
        if (isDetached4(this)) {
            throw new TypeError("Uint8Array.prototype.setFromHex called on a detached buffer");
        }
        if (typeof input !== "string") {
            throw new TypeError("argument must be a string");
        }
        return decodeHex(input, this.length, this);
    };
    var SPEC_LENGTH = {
        toBase64: 0,
        toHex: 0,
        setFromBase64: 1,
        setFromHex: 1,
        fromBase64: 1,
        fromHex: 1
    };
    var installUint8Array = function installUint8Array() {
        if (typeof Uint8Array !== "undefined") {
            var proto2 = Uint8Array.prototype;
            var protoMethods = [
                [
                    "toBase64",
                    uint8ArrayToBase64
                ],
                [
                    "toHex",
                    uint8ArrayToHex
                ],
                [
                    "setFromBase64",
                    uint8ArraySetFromBase64
                ],
                [
                    "setFromHex",
                    uint8ArraySetFromHex
                ]
            ];
            for(var i = 0; i < protoMethods.length; i++){
                var name = protoMethods[i][0];
                if (!proto2[name]) {
                    try {
                        Object.defineProperty(protoMethods[i][1], "name", {
                            value: name,
                            configurable: true
                        });
                    } catch (e) {}
                    try {
                        Object.defineProperty(protoMethods[i][1], "length", {
                            value: SPEC_LENGTH[name],
                            configurable: true
                        });
                    } catch (e) {}
                    Object.defineProperty(proto2, name, {
                        value: protoMethods[i][1],
                        writable: true,
                        enumerable: false,
                        configurable: true
                    });
                    Object.defineProperty(proto2[name], "__polyfilled", {
                        value: true
                    });
                }
            }
            var statics = [
                [
                    "fromBase64",
                    uint8ArrayFromBase64
                ],
                [
                    "fromHex",
                    uint8ArrayFromHex
                ]
            ];
            for(var i1 = 0; i1 < statics.length; i1++){
                var name1 = statics[i1][0];
                if (!Uint8Array[name1]) {
                    try {
                        Object.defineProperty(statics[i1][1], "name", {
                            value: name1,
                            configurable: true
                        });
                    } catch (e) {}
                    try {
                        Object.defineProperty(statics[i1][1], "length", {
                            value: SPEC_LENGTH[name1],
                            configurable: true
                        });
                    } catch (e) {}
                    Object.defineProperty(Uint8Array, name1, {
                        value: statics[i1][1],
                        writable: true,
                        enumerable: false,
                        configurable: true
                    });
                    Object.defineProperty(Uint8Array[name1], "__polyfilled", {
                        value: true
                    });
                }
            }
        }
    };
    // src/modules/es.date.to-iso-string.ts
    var nativeToISOString = Date.prototype.toISOString;
    var isSupported114 = function isSupported114() {
        try {
            if (typeof nativeToISOString !== "function") return false;
            if (nativeToISOString.call(new Date(-5e13 - 1)) !== "0385-07-25T07:06:39.999Z") return false;
            try {
                nativeToISOString.call(/* @__PURE__ */ new Date(NaN));
                return false;
            } catch (unused) {
                return true;
            }
        } catch (unused) {
            return false;
        }
    };
    var dateToISOString = function toISOString() {
        var time = Date.prototype.getTime.call(this);
        if (time - time !== 0) throw new RangeError("Invalid time value");
        var year = this.getUTCFullYear();
        var sign = year < 0 ? "-" : year > 9999 ? "+" : "";
        var yearText = String(Math.abs(year));
        var yearWidth = sign ? 6 : 4;
        while(yearText.length < yearWidth)yearText = "0" + yearText;
        var month = this.getUTCMonth() + 1;
        var day = this.getUTCDate();
        var hours = this.getUTCHours();
        var minutes = this.getUTCMinutes();
        var seconds = this.getUTCSeconds();
        var ms = this.getUTCMilliseconds();
        return sign + yearText + "-" + (month < 10 ? "0" : "") + month + "-" + (day < 10 ? "0" : "") + day + "T" + (hours < 10 ? "0" : "") + hours + ":" + (minutes < 10 ? "0" : "") + minutes + ":" + (seconds < 10 ? "0" : "") + seconds + "." + (ms < 10 ? "00" : ms < 100 ? "0" : "") + ms + "Z";
    };
    // src/modules/es.date.to-json.ts
    var nativeToJSON = Date.prototype.toJSON;
    var isSupported115 = function isSupported115() {
        try {
            if (typeof nativeToJSON !== "function") return false;
            if ((/* @__PURE__ */ new Date(NaN)).toJSON() !== null) return false;
            if (nativeToJSON.call({
                toISOString: function toISOString() {
                    return 1;
                }
            }) !== 1) return false;
            return true;
        } catch (unused) {
            return false;
        }
    };
    var dateToJSON = function toJSON3(_key) {
        var object = Object(this);
        var primitive = object;
        if (object !== null && typeof object === "object") {
            var converted = false;
            var valueOf3 = object.valueOf;
            if (typeof valueOf3 === "function") {
                var result = valueOf3.call(object);
                if (result === null || typeof result !== "object") {
                    primitive = result;
                    converted = true;
                }
            }
            if (!converted) {
                var toString5 = object.toString;
                if (typeof toString5 === "function") {
                    var result1 = toString5.call(object);
                    if (result1 === null || typeof result1 !== "object") {
                        primitive = result1;
                        converted = true;
                    }
                }
            }
            if (!converted) throw new TypeError("Cannot convert object to primitive value");
        }
        return typeof primitive === "number" && primitive - primitive !== 0 ? null : object.toISOString();
    };
    // src/modules/es.date.to-primitive.ts
    var isSupported116 = function isSupported116() {
        try {
            return typeof Symbol === "undefined" || !Symbol.toPrimitive || typeof Date.prototype[Symbol.toPrimitive] === "function";
        } catch (unused) {
            return true;
        }
    };
    var dateToPrimitive = function dateToPrimitive(hint) {
        if (this === null || typeof this !== "object" && typeof this !== "function") {
            throw new TypeError("Date.prototype[Symbol.toPrimitive] called on a non-object");
        }
        var stringFirst;
        if (hint === "string" || hint === "default") {
            stringFirst = true;
        } else if (hint === "number") {
            stringFirst = false;
        } else {
            throw new TypeError("Invalid hint: " + String(hint));
        }
        var first = stringFirst ? this.toString : this.valueOf;
        var second = stringFirst ? this.valueOf : this.toString;
        if (typeof first === "function") {
            var result = first.call(this);
            if (result === null || typeof result !== "object" && typeof result !== "function") {
                return result;
            }
        }
        if (typeof second === "function") {
            var result1 = second.call(this);
            if (result1 === null || typeof result1 !== "object" && typeof result1 !== "function") {
                return result1;
            }
        }
        throw new TypeError("Cannot convert object to primitive value");
    };
    var install25 = function install25() {
        if (typeof Symbol !== "undefined" && Symbol.toPrimitive) {
            Object.defineProperty(Date.prototype, Symbol.toPrimitive, {
                value: dateToPrimitive,
                writable: false,
                enumerable: false,
                configurable: true
            });
            try {
                Object.defineProperty(dateToPrimitive, "name", {
                    value: "[Symbol.toPrimitive]",
                    configurable: true
                });
            } catch (e) {}
            Object.defineProperty(Date.prototype[Symbol.toPrimitive], "__polyfilled", {
                value: true
            });
        }
    };
    // src/modules/es.json.to-string-tag.ts
    var tagKey7 = typeof Symbol !== "undefined" ? Symbol.toStringTag : void 0;
    var isSupported117 = function isSupported117() {
        try {
            return !tagKey7 || typeof JSON === "undefined" || JSON[tagKey7] === "JSON";
        } catch (unused) {
            return true;
        }
    };
    var install26 = function install26() {
        if (tagKey7 && typeof JSON !== "undefined") {
            Object.defineProperty(JSON, tagKey7, {
                configurable: true,
                value: "JSON"
            });
        }
    };
    // src/modules/es.math.acosh.ts
    var isSupported118 = function isSupported118() {
        try {
            if (typeof Math.acosh !== "function") {
                return false;
            }
            var big = Math.acosh(17976931348623157e292);
            return Math.floor(big) === 710 && Math.acosh(Infinity) === Infinity;
        } catch (unused) {
            return false;
        }
    };
    var mathAcosh = function mathAcosh(x) {
        var numeric = +x;
        if (numeric !== numeric || numeric < 1) {
            return NaN;
        }
        if (numeric === Infinity) {
            return Infinity;
        }
        if (numeric > 9490626562425156e-8) {
            return Math.log(numeric) + Math.LN2;
        }
        var t = numeric - 1;
        var arg = t + Math.sqrt(t) * Math.sqrt(numeric + 1);
        if (typeof Math.log1p === "function") return Math.log1p(arg);
        return arg > -1e-8 && arg < 1e-8 ? arg - arg * arg / 2 : Math.log(1 + arg);
    };
    // src/modules/es.math.asinh.ts
    var isSupported119 = function isSupported119() {
        try {
            return typeof Math.asinh === "function" && 1 / Math.asinh(0) > 0;
        } catch (unused) {
            return false;
        }
    };
    var mathAsinh = function mathAsinh1(x) {
        var numeric = +x;
        if (numeric !== numeric || numeric === 0 || numeric === Infinity || numeric === -Infinity) {
            return numeric;
        }
        if (numeric < 0) {
            return -mathAsinh(-numeric);
        }
        return Math.log(numeric + Math.sqrt(numeric * numeric + 1));
    };
    // src/modules/es.math.atanh.ts
    var isSupported120 = function isSupported120() {
        try {
            return typeof Math.atanh === "function" && 1 / Math.atanh(-0) < 0;
        } catch (unused) {
            return false;
        }
    };
    var mathAtanh = function mathAtanh(x) {
        var numeric = +x;
        if (numeric !== numeric || numeric === 0) {
            return numeric;
        }
        return Math.log((1 + numeric) / (1 - numeric)) / 2;
    };
    // src/modules/es.math.cbrt.ts
    var isSupported121 = function isSupported121() {
        try {
            return typeof Math.cbrt === "function";
        } catch (unused) {
            return false;
        }
    };
    var mathCbrt = function mathCbrt(x) {
        var numeric = +x;
        if (numeric !== numeric || numeric === 0 || numeric === Infinity || numeric === -Infinity) {
            return numeric;
        }
        var root = Math.pow(Math.abs(numeric), 1 / 3);
        if (numeric < 0) {
            return -root;
        }
        return root;
    };
    // src/modules/es.math.clz32.ts
    var isSupported122 = function isSupported122() {
        try {
            return typeof Math.clz32 === "function";
        } catch (unused) {
            return false;
        }
    };
    var mathClz32 = function mathClz32(x) {
        var uint32 = x >>> 0;
        if (uint32 === 0) {
            return 32;
        }
        return 31 - Math.floor(Math.log(uint32 + 0.5) * Math.LOG2E);
    };
    // src/modules/es.math.cosh.ts
    var isSupported123 = function isSupported123() {
        try {
            return typeof Math.cosh === "function" && Math.cosh(710) !== Infinity;
        } catch (unused) {
            return false;
        }
    };
    var mathCosh = function mathCosh(x) {
        var numeric = +x;
        if (numeric !== numeric) {
            return numeric;
        }
        var t = Math.exp((numeric < 0 ? -numeric : numeric) - 1);
        return (t + 1 / (t * Math.E * Math.E)) * (Math.E / 2);
    };
    // src/modules/es.math.expm1.ts
    var isSupported124 = function isSupported124() {
        try {
            if (typeof Math.expm1 !== "function") {
                return false;
            }
            return Math.expm1(-2e-17) === -2e-17;
        } catch (unused) {
            return false;
        }
    };
    var mathExpm1 = function mathExpm1(x) {
        var numeric = +x;
        if (numeric !== numeric || numeric === 0 || numeric === Infinity) {
            return numeric;
        }
        if (numeric === -Infinity) {
            return -1;
        }
        if (numeric > -1e-6 && numeric < 1e-6) {
            return numeric + numeric * numeric / 2;
        }
        return Math.exp(numeric) - 1;
    };
    // src/modules/es.math.fround.ts
    var isSupported125 = function isSupported125() {
        try {
            return typeof Math.fround === "function";
        } catch (unused) {
            return false;
        }
    };
    var float32 = typeof Float32Array !== "undefined" ? new Float32Array(1) : null;
    var mathFround = function mathFround(x) {
        var numeric = +x;
        if (!float32 || numeric !== numeric || numeric === 0 || numeric === Infinity || numeric === -Infinity) {
            return numeric;
        }
        float32[0] = numeric;
        return float32[0];
    };
    // src/modules/es.math.hypot.ts
    var isSupported126 = function isSupported126() {
        try {
            if (typeof Math.hypot !== "function") {
                return false;
            }
            return Math.hypot(Infinity, NaN) === Infinity;
        } catch (unused) {
            return false;
        }
    };
    var scratch2 = [];
    var depth2 = 0;
    var hypotMany = function hypotMany(args) {
        var count = args.length;
        var values4 = depth2 === 0 ? scratch2 : new Array(count);
        depth2++;
        var max3 = 0;
        var hasInfinity = false;
        var hasNaN = false;
        try {
            for(var i = 0; i < count; i++){
                var numeric = +args[i];
                values4[i] = numeric;
                if (numeric === Infinity || numeric === -Infinity) {
                    hasInfinity = true;
                } else if (numeric !== numeric) {
                    hasNaN = true;
                } else {
                    var magnitude = numeric < 0 ? -numeric : numeric;
                    if (magnitude > max3) {
                        max3 = magnitude;
                    }
                }
            }
        } catch (error) {
            depth2--;
            throw error;
        }
        depth2--;
        if (hasInfinity) {
            return Infinity;
        }
        if (hasNaN) {
            return NaN;
        }
        if (max3 === 0) {
            return 0;
        }
        var sumOfSquares = 0;
        for(var i1 = 0; i1 < count; i1++){
            var scaled = values4[i1] / max3;
            sumOfSquares += scaled * scaled;
        }
        return max3 * Math.sqrt(sumOfSquares);
    };
    var mathHypot = function hypot(_value1, _value2) {
        var count = arguments.length;
        if (count > 3) return hypotMany(arguments);
        var a = count > 0 ? +arguments[0] : 0;
        var b = count > 1 ? +arguments[1] : 0;
        var c = count > 2 ? +arguments[2] : 0;
        if (a === Infinity || a === -Infinity || b === Infinity || b === -Infinity || c === Infinity || c === -Infinity) {
            return Infinity;
        }
        if (a !== a || b !== b || c !== c) {
            return NaN;
        }
        var x = a < 0 ? -a : a;
        var y = b < 0 ? -b : b;
        var z = c < 0 ? -c : c;
        var max3 = x > y ? x : y;
        if (z > max3) max3 = z;
        if (max3 === 0) {
            return 0;
        }
        var sx = x / max3;
        var sy = y / max3;
        var sz = z / max3;
        return max3 * Math.sqrt(sx * sx + sy * sy + sz * sz);
    };
    // src/modules/es.math.imul.ts
    var isSupported127 = function isSupported127() {
        try {
            if (typeof Math.imul !== "function") {
                return false;
            }
            return Math.imul(4294967295, 5) === -5 && Math.imul.length === 2;
        } catch (unused) {
            return false;
        }
    };
    var mathImul = function mathImul(a, b) {
        var aHigh = a >>> 16 & 65535;
        var aLow = a & 65535;
        var bHigh = b >>> 16 & 65535;
        var bLow = b & 65535;
        return aLow * bLow + (aHigh * bLow + aLow * bHigh << 16 >>> 0) | 0;
    };
    // src/modules/es.math.log10.ts
    var isSupported128 = function isSupported128() {
        try {
            return typeof Math.log10 === "function";
        } catch (unused) {
            return false;
        }
    };
    var mathLog10 = function mathLog10(x) {
        return Math.log(x) * Math.LOG10E;
    };
    // src/modules/es.math.log1p.ts
    var isSupported129 = function isSupported129() {
        try {
            return typeof Math.log1p === "function";
        } catch (unused) {
            return false;
        }
    };
    var mathLog1p = function mathLog1p(x) {
        var numeric = +x;
        if (numeric !== numeric || numeric === 0) {
            return numeric;
        }
        if (numeric > -1e-8 && numeric < 1e-8) {
            return numeric - numeric * numeric / 2;
        }
        return Math.log(1 + numeric);
    };
    // src/modules/es.math.log2.ts
    var isSupported130 = function isSupported130() {
        try {
            return Math.log2(8) === 3 && Math.log2(1 / 2) === -1;
        } catch (unused) {
            return false;
        }
    };
    var mathLog2 = function mathLog2(x) {
        var approx = Math.log(x) * Math.LOG2E;
        var rounded = Math.round(approx);
        return Math.pow(2, rounded) === x ? rounded : approx;
    };
    // src/modules/es.math.sign.ts
    var isSupported131 = function isSupported131() {
        try {
            return typeof Math.sign === "function";
        } catch (unused) {
            return false;
        }
    };
    var mathSign = function mathSign(x) {
        var numeric = +x;
        if (numeric === 0 || numeric !== numeric) {
            return numeric;
        }
        return numeric > 0 ? 1 : -1;
    };
    // src/modules/es.math.sinh.ts
    var isSupported132 = function isSupported132() {
        try {
            if (typeof Math.sinh !== "function") {
                return false;
            }
            return Math.sinh(-2e-17) === -2e-17;
        } catch (unused) {
            return false;
        }
    };
    var mathSinh = function mathSinh(x) {
        var numeric = +x;
        if (numeric !== numeric || numeric === 0 || numeric === Infinity || numeric === -Infinity) {
            return numeric;
        }
        if (numeric > -1 && numeric < 1) {
            var hasExpm1 = typeof Math.expm1 === "function";
            var negated = -numeric;
            var a = hasExpm1 ? Math.expm1(numeric) : numeric > -1e-6 && numeric < 1e-6 ? numeric + numeric * numeric / 2 : Math.exp(numeric) - 1;
            var b = hasExpm1 ? Math.expm1(negated) : negated > -1e-6 && negated < 1e-6 ? negated + negated * negated / 2 : Math.exp(negated) - 1;
            return (a - b) / 2;
        }
        return (Math.exp(numeric) - Math.exp(-numeric)) / 2;
    };
    // src/modules/es.math.sum-precise.ts
    var isSupported133 = function isSupported133() {
        try {
            return typeof Math.sumPrecise === "function";
        } catch (unused) {
            return false;
        }
    };
    var LIMB_BITS = 24;
    var LIMB_BASE = 16777216;
    var BIAS = 1074;
    var LIMB_COUNT = 96;
    var scratch3 = typeof ArrayBuffer !== "undefined" && typeof DataView !== "undefined" ? new DataView(new ArrayBuffer(8)) : null;
    var makeAccumulator = function makeAccumulator() {
        var limbs = [];
        for(var i = 0; i < LIMB_COUNT; i++)limbs.push(0);
        return limbs;
    };
    var normalize = function normalize(limbs) {
        var carry = 0;
        for(var i = 0; i < LIMB_COUNT; i++){
            var v = limbs[i] + carry;
            var r = v % LIMB_BASE;
            limbs[i] = r;
            carry = (v - r) / LIMB_BASE;
        }
    };
    var subtract = function subtract(a, b) {
        var borrow = 0;
        for(var i = 0; i < LIMB_COUNT; i++){
            var v = a[i] - b[i] - borrow;
            if (v < 0) {
                v += LIMB_BASE;
                borrow = 1;
            } else {
                borrow = 0;
            }
            a[i] = v;
        }
    };
    var bitAt = function bitAt(limbs, index) {
        var limb = Math.floor(index / LIMB_BITS);
        if (limb < 0 || limb >= LIMB_COUNT) return 0;
        return Math.floor(limbs[limb] / Math.pow(2, index % LIMB_BITS)) % 2;
    };
    var toDouble = function toDouble(limbs) {
        var top = -1;
        for(var i = LIMB_COUNT - 1; i >= 0 && top < 0; i--){
            if (limbs[i] !== 0) {
                for(var b = LIMB_BITS - 1; b >= 0; b--){
                    if (bitAt(limbs, i * LIMB_BITS + b)) {
                        top = i * LIMB_BITS + b;
                        break;
                    }
                }
            }
        }
        if (top < 0) return 0;
        var low = top - 52 > 0 ? top - 52 : 0;
        var mantissa = 0;
        for(var i1 = top; i1 >= low; i1--)mantissa = mantissa * 2 + bitAt(limbs, i1);
        var exp = low - BIAS;
        if (low > 0) {
            var roundBit = bitAt(limbs, low - 1);
            var sticky = 0;
            var stickyIndex = low - 1;
            var stickyLimb = Math.floor(stickyIndex / LIMB_BITS);
            for(var i2 = 0; i2 < stickyLimb && i2 < LIMB_COUNT; i2++){
                if (limbs[i2] !== 0) {
                    sticky = 1;
                    break;
                }
            }
            if (sticky === 0 && stickyLimb < LIMB_COUNT && limbs[stickyLimb] % Math.pow(2, stickyIndex % LIMB_BITS) !== 0) {
                sticky = 1;
            }
            if (roundBit === 1 && (sticky === 1 || mantissa % 2 === 1)) {
                mantissa += 1;
                if (mantissa === 9007199254740992) {
                    mantissa = 4503599627370496;
                    exp += 1;
                }
            }
        }
        return mantissa * Math.pow(2, exp);
    };
    var sharedPositive = makeAccumulator();
    var sharedNegative = makeAccumulator();
    var busy = false;
    var zero = function zero(limbs) {
        for(var i = 0; i < LIMB_COUNT; i++)limbs[i] = 0;
    };
    var mathSumPrecise = function mathSumPrecise(items) {
        if (items === null || items === void 0) {
            throw new TypeError("Math.sumPrecise called on null or undefined");
        }
        var iteratorKey4 = typeof Symbol !== "undefined" ? Symbol.iterator : void 0;
        if (!iteratorKey4 || typeof items[iteratorKey4] !== "function") {
            throw new TypeError("Math.sumPrecise argument is not iterable");
        }
        if (!scratch3) {
            throw new TypeError("Math.sumPrecise requires DataView");
        }
        var reentered = busy;
        var positive = reentered ? makeAccumulator() : sharedPositive;
        var negative = reentered ? makeAccumulator() : sharedNegative;
        if (!reentered) {
            zero(positive);
            zero(negative);
            busy = true;
        }
        var result;
        try {
            result = sumInto(items, iteratorKey4, positive, negative);
        } catch (error) {
            if (!reentered) busy = false;
            throw error;
        }
        if (!reentered) busy = false;
        return result;
    };
    var closeQuietly2 = function closeQuietly2(iterator) {
        try {
            var ret = iterator.return;
            if (typeof ret === "function") ret.call(iterator);
        } catch (unused) {}
    };
    var sumInto = function sumInto(items, iteratorKey4, positive, negative) {
        var count = 0;
        var sinceNormalize = 0;
        var sawNaN = false;
        var sawPosInfinity = false;
        var sawNegInfinity = false;
        var allMinusZero = true;
        var iterator = items[iteratorKey4]();
        for(;;){
            var step = iterator.next();
            if (step.done) break;
            var value = step.value;
            if (typeof value !== "number") {
                closeQuietly2(iterator);
                throw new TypeError("Math.sumPrecise: every element must be a Number");
            }
            count++;
            if (value !== value) {
                sawNaN = true;
                allMinusZero = false;
                continue;
            }
            if (value === Infinity) {
                sawPosInfinity = true;
                allMinusZero = false;
                continue;
            }
            if (value === -Infinity) {
                sawNegInfinity = true;
                allMinusZero = false;
                continue;
            }
            if (value === 0) {
                if (1 / value > 0) allMinusZero = false;
                continue;
            }
            allMinusZero = false;
            var limbs = value > 0 ? positive : negative;
            scratch3.setFloat64(0, Math.abs(value));
            var hi = scratch3.getUint32(0);
            var lo = scratch3.getUint32(4);
            var biasedExp = hi >>> 20 & 2047;
            var mantHi = hi & 1048575;
            var mantissa = void 0;
            var exp = void 0;
            if (biasedExp === 0) {
                mantissa = mantHi * 4294967296 + lo;
                exp = -1074;
            } else {
                mantissa = (mantHi + 1048576) * 4294967296 + lo;
                exp = biasedExp - 1075;
            }
            if (mantissa !== 0) {
                var bit = exp + BIAS;
                var limb = Math.floor(bit / LIMB_BITS);
                var shift = bit % LIMB_BITS;
                var scale = Math.pow(2, shift);
                var c0 = mantissa % LIMB_BASE;
                var c1 = Math.floor(mantissa / LIMB_BASE) % LIMB_BASE;
                var c2 = Math.floor(mantissa / (LIMB_BASE * LIMB_BASE));
                limbs[limb] += c0 * scale;
                limbs[limb + 1] += c1 * scale;
                if (c2 !== 0) limbs[limb + 2] += c2 * scale;
            }
            if (++sinceNormalize >= 32) {
                normalize(positive);
                normalize(negative);
                sinceNormalize = 0;
            }
        }
        if (sawNaN) return NaN;
        if (sawPosInfinity && sawNegInfinity) return NaN;
        if (sawPosInfinity) return Infinity;
        if (sawNegInfinity) return -Infinity;
        if (count === 0 || allMinusZero) return -0;
        normalize(positive);
        normalize(negative);
        var order = 0;
        for(var i = LIMB_COUNT - 1; i >= 0; i--){
            if (positive[i] !== negative[i]) {
                order = positive[i] > negative[i] ? 1 : -1;
                break;
            }
        }
        if (order === 0) return 0;
        if (order > 0) {
            subtract(positive, negative);
            return toDouble(positive);
        }
        subtract(negative, positive);
        return -toDouble(negative);
    };
    // src/modules/es.math.tanh.ts
    var isSupported134 = function isSupported134() {
        try {
            return typeof Math.tanh === "function";
        } catch (unused) {
            return false;
        }
    };
    var mathTanh = function mathTanh(x) {
        var numeric = +x;
        if (numeric !== numeric || numeric === 0) {
            return numeric;
        }
        var hasExpm1 = typeof Math.expm1 === "function";
        var negated = -numeric;
        var a = hasExpm1 ? Math.expm1(numeric) : numeric > -1e-6 && numeric < 1e-6 ? numeric + numeric * numeric / 2 : Math.exp(numeric) - 1;
        if (a === Infinity) {
            return 1;
        }
        var b = hasExpm1 ? Math.expm1(negated) : negated > -1e-6 && negated < 1e-6 ? negated + negated * negated / 2 : Math.exp(negated) - 1;
        if (b === Infinity) {
            return -1;
        }
        return (a - b) / (a + b + 2);
    };
    // src/modules/es.math.to-string-tag.ts
    var tagKey8 = typeof Symbol !== "undefined" ? Symbol.toStringTag : void 0;
    var isSupported135 = function isSupported135() {
        try {
            return !tagKey8 || Math[tagKey8] === "Math";
        } catch (unused) {
            return true;
        }
    };
    var install27 = function install27() {
        if (tagKey8) {
            Object.defineProperty(Math, tagKey8, {
                configurable: true,
                value: "Math"
            });
        }
    };
    // src/modules/es.math.trunc.ts
    var isSupported136 = function isSupported136() {
        try {
            return typeof Math.trunc === "function";
        } catch (unused) {
            return false;
        }
    };
    var mathTrunc = function mathTrunc(x) {
        var numeric = +x;
        if (numeric !== numeric || numeric === 0 || numeric === Infinity || numeric === -Infinity) {
            return numeric;
        }
        if (numeric < 0) {
            return Math.ceil(numeric);
        }
        return Math.floor(numeric);
    };
    // src/modules/es.number.constructor.ts
    var isSupported137 = function isSupported137() {
        try {
            if (Number("0b101") !== 5 || Number("0o17") !== 15 || Number(" 0o1") !== 1) return false;
            var signedHex = Number("+0x1");
            return signedHex !== signedHex;
        } catch (unused) {
            return false;
        }
    };
    var NativeNumber = Number;
    var NumberPolyfill = function NumberPolyfill1(value) {
        var input = arguments.length === 0 ? 0 : value;
        if (arguments.length !== 0 && typeof value === "string") {
            if (value.indexOf("\u180E") !== -1) input = NaN;
            var trimmed = value.replace(/^\s+|\s+$/g, "");
            var sign = trimmed.charAt(0);
            if ((sign === "+" || sign === "-") && (trimmed.charAt(2) === "x" || trimmed.charAt(2) === "X") && trimmed.charAt(1) === "0") {
                input = NaN;
            } else if (trimmed.length > 2 && sign === "0") {
                var marker = trimmed.charAt(1);
                var digits = trimmed.substring(2);
                if (marker === "b" || marker === "B") {
                    input = /^[01]+$/.test(digits) ? parseInt(digits, 2) : NaN;
                } else if (marker === "o" || marker === "O") {
                    input = /^[0-7]+$/.test(digits) ? parseInt(digits, 8) : NaN;
                }
            }
        }
        if (this instanceof NumberPolyfill) {
            return new NativeNumber(NativeNumber(input));
        }
        return NativeNumber(input);
    };
    NumberPolyfill.prototype = NativeNumber.prototype;
    var staticKeys = [
        "MAX_VALUE",
        "MIN_VALUE",
        "NaN",
        "NEGATIVE_INFINITY",
        "POSITIVE_INFINITY",
        "EPSILON",
        "MAX_SAFE_INTEGER",
        "MIN_SAFE_INTEGER",
        "isFinite",
        "isInteger",
        "isNaN",
        "isSafeInteger",
        "parseFloat",
        "parseInt"
    ];
    for(var i8 = 0; i8 < staticKeys.length; i8++){
        var key1 = staticKeys[i8];
        var descriptor = Object.getOwnPropertyDescriptor(NativeNumber, key1);
        if (descriptor) {
            Object.defineProperty(NumberPolyfill, key1, descriptor);
        }
    }
    var install28 = function install28() {
        define(window, "Number", NumberPolyfill);
        Object.defineProperty(NativeNumber.prototype, "constructor", {
            value: NumberPolyfill,
            writable: true,
            enumerable: false,
            configurable: true
        });
    };
    // src/modules/es.number.epsilon.ts
    var isSupported138 = function isSupported138() {
        try {
            return Number.EPSILON === 2220446049250313e-31;
        } catch (unused) {
            return false;
        }
    };
    var install29 = function install29() {
        try {
            Object.defineProperty(Number, "EPSILON", {
                value: 2220446049250313e-31,
                writable: false,
                enumerable: false,
                configurable: false
            });
        } catch (e) {}
    };
    // src/modules/es.number.is-finite.ts
    var isSupported139 = function isSupported139() {
        try {
            return typeof Number.isFinite === "function";
        } catch (unused) {
            return false;
        }
    };
    var numberIsFinite = function numberIsFinite(value) {
        return typeof value === "number" && value - value === 0;
    };
    // src/modules/es.number.is-integer.ts
    var isSupported140 = function isSupported140() {
        try {
            return typeof Number.isInteger === "function";
        } catch (unused) {
            return false;
        }
    };
    var numberIsInteger = function numberIsInteger(value) {
        return typeof value === "number" && value - value === 0 && Math.floor(value) === value;
    };
    // src/modules/es.number.is-nan.ts
    var isSupported141 = function isSupported141() {
        try {
            return typeof Number.isNaN === "function";
        } catch (unused) {
            return false;
        }
    };
    var numberIsNaN = function numberIsNaN(value) {
        return typeof value === "number" && value !== value;
    };
    // src/modules/es.number.is-safe-integer.ts
    var isSupported142 = function isSupported142() {
        try {
            return typeof Number.isSafeInteger === "function";
        } catch (unused) {
            return false;
        }
    };
    var MAX_SAFE_INTEGER = 9007199254740991;
    var numberIsSafeInteger = function numberIsSafeInteger(value) {
        return typeof value === "number" && value - value === 0 && // x - x === 0: false for NaN and ±Infinity, and no global isFinite call
        Math.floor(value) === value && // it's a whole number...
        Math.abs(value) <= MAX_SAFE_INTEGER;
    };
    // src/modules/es.number.max-safe-integer.ts
    var isSupported143 = function isSupported143() {
        try {
            return Number.MAX_SAFE_INTEGER === 9007199254740991;
        } catch (unused) {
            return false;
        }
    };
    var install30 = function install30() {
        try {
            Object.defineProperty(Number, "MAX_SAFE_INTEGER", {
                value: 9007199254740991,
                writable: false,
                enumerable: false,
                configurable: false
            });
        } catch (e) {}
    };
    // src/modules/es.number.min-safe-integer.ts
    var isSupported144 = function isSupported144() {
        try {
            return Number.MIN_SAFE_INTEGER === -9007199254740991;
        } catch (unused) {
            return false;
        }
    };
    var install31 = function install31() {
        try {
            Object.defineProperty(Number, "MIN_SAFE_INTEGER", {
                value: -9007199254740991,
                writable: false,
                enumerable: false,
                configurable: false
            });
        } catch (e) {}
    };
    // src/modules/es.number.parse-float.ts
    var isSupported145 = function isSupported145() {
        try {
            return Number.parseFloat === parseFloat;
        } catch (unused) {
            return false;
        }
    };
    var numberParseFloat = parseFloat;
    // src/modules/es.number.parse-int.ts
    var isSupported146 = function isSupported146() {
        try {
            return Number.parseInt === parseInt;
        } catch (unused) {
            return false;
        }
    };
    var numberParseInt = parseInt;
    // src/modules/es.number.to-exponential.ts
    var nativeToExponential = Number.prototype.toExponential;
    var abs = Math.abs;
    var floor5 = Math.floor;
    var pow = Math.pow;
    var round = Math.round;
    var POW_10_308 = pow(10, 308);
    var ROUNDS_PROPERLY = function() {
        try {
            return typeof nativeToExponential === "function" && nativeToExponential.call(-69e-12, 4) === "-6.9000e-11" && nativeToExponential.call(1.255, 2) === "1.25e+0" && nativeToExponential.call(12345, 3) === "1.235e+4" && nativeToExponential.call(25, 0) === "3e+1";
        } catch (unused) {
            return false;
        }
    }();
    var throwsOn = function throwsOn(thisArg, arg) {
        try {
            nativeToExponential.call(thisArg, arg);
            return false;
        } catch (unused) {
            return true;
        }
    };
    var isSupported147 = function isSupported147() {
        try {
            if (typeof nativeToExponential !== "function") return false;
            if (!ROUNDS_PROPERLY) return false;
            if (!throwsOn(1, Infinity) || !throwsOn(1, -Infinity)) return false;
            nativeToExponential.call(Infinity, Infinity);
            nativeToExponential.call(NaN, Infinity);
            return true;
        } catch (unused) {
            return false;
        }
    };
    var numberToExponential = function toExponential(fractionDigits) {
        var x = Number.prototype.valueOf.call(this);
        if (fractionDigits === void 0) return nativeToExponential.call(x);
        var f = +fractionDigits;
        f = f !== f || f === 0 ? 0 : f > 0 ? floor5(f) : Math.ceil(f);
        if (x - x !== 0) return String(x);
        if (f < 0 || f > 20) throw new RangeError("Incorrect fraction digits");
        if (ROUNDS_PROPERLY) return nativeToExponential.call(x, f);
        var s = "";
        var m;
        var e;
        var c;
        var d;
        var l;
        var n;
        var xScaled;
        if (x < 0) {
            s = "-";
            x = -x;
        }
        if (x === 0) {
            e = 0;
            m = "";
            for(var i = 0; i < f + 1; i++)m += "0";
        } else {
            l = Math.log(x) / Math.LN10;
            e = floor5(l);
            if (f - e >= 308) {
                xScaled = x * POW_10_308 * pow(10, f - e - 308);
            } else {
                xScaled = x / pow(10, e - f);
            }
            n = round(xScaled);
            if (xScaled - n >= 0.5) {
                n += 1;
            }
            if (n >= pow(10, f + 1)) {
                n /= 10;
                e += 1;
            }
            m = String(n);
        }
        if (f !== 0) {
            m = m.slice(0, 1) + "." + m.slice(1);
        }
        if (e === 0) {
            c = "+";
            d = "0";
        } else {
            c = e > 0 ? "+" : "-";
            d = String(abs(e));
        }
        m += "e" + c + d;
        return s + m;
    };
    // src/modules/es.number.to-fixed.ts
    var nativeToFixed = Number.prototype.toFixed;
    var isSupported148 = function isSupported148() {
        try {
            if (typeof nativeToFixed !== "function") return false;
            if (nativeToFixed.call(8e-5, 3) !== "0.000") return false;
            if (nativeToFixed.call(0.9, 0) !== "1") return false;
            if (nativeToFixed.call(1.255, 2) !== "1.25") return false;
            if (nativeToFixed.call(1000000000000000100, 0) !== "1000000000000000128") return false;
            try {
                nativeToFixed.call({});
                return false;
            } catch (unused) {
                return true;
            }
        } catch (unused) {
            return false;
        }
    };
    var floor6 = Math.floor;
    var pow2 = function pow21(x, n, acc) {
        return n === 0 ? acc : n % 2 === 1 ? pow2(x, n - 1, acc * x) : pow2(x * x, n / 2, acc);
    };
    var multiply = function multiply(data, n, c) {
        var index = -1;
        var c2 = c;
        while(++index < 6){
            c2 += n * data[index];
            data[index] = c2 % 1e7;
            c2 = floor6(c2 / 1e7);
        }
    };
    var divide = function divide(data, n) {
        var index = 6;
        var c = 0;
        while(--index >= 0){
            c += data[index];
            data[index] = floor6(c / n);
            c = c % n * 1e7;
        }
    };
    var dataToString = function dataToString(data) {
        var index = 6;
        var s = "";
        while(--index >= 0){
            if (s !== "" || index === 0 || data[index] !== 0) {
                var t = String(data[index]);
                var zeros = "";
                for(var r = 0; r < 7 - t.length; r++)zeros += "0";
                s = s === "" ? t : s + zeros + t;
            }
        }
        return s;
    };
    var numberToFixed = function toFixed(fractionDigits) {
        var number = Number.prototype.valueOf.call(this);
        var fractDigits = +fractionDigits;
        fractDigits = fractDigits !== fractDigits || fractDigits === 0 ? 0 : fractDigits > 0 ? floor6(fractDigits) : Math.ceil(fractDigits);
        var data = [
            0,
            0,
            0,
            0,
            0,
            0
        ];
        var sign = "";
        var result = "0";
        var e;
        var z;
        var j;
        var k;
        if (fractDigits < 0 || fractDigits > 20) throw new RangeError("Incorrect fraction digits");
        if (number !== number) return "NaN";
        if (number <= -1e21 || number >= 1e21) return String(number);
        if (number < 0) {
            sign = "-";
            number = -number;
        }
        if (number > 1e-21) {
            var x2 = number * pow2(2, 69, 1);
            e = 0;
            while(x2 >= 4096){
                e += 12;
                x2 /= 4096;
            }
            while(x2 >= 2){
                e += 1;
                x2 /= 2;
            }
            e -= 69;
            z = e < 0 ? number * pow2(2, -e, 1) : number / pow2(2, e, 1);
            z *= 4503599627370496;
            e = 52 - e;
            if (e > 0) {
                multiply(data, 0, z);
                j = fractDigits;
                while(j >= 7){
                    multiply(data, 1e7, 0);
                    j -= 7;
                }
                multiply(data, pow2(10, j, 1), 0);
                j = e - 1;
                while(j >= 23){
                    divide(data, 1 << 23);
                    j -= 23;
                }
                divide(data, 1 << j);
                multiply(data, 1, 1);
                divide(data, 2);
                result = dataToString(data);
            } else {
                multiply(data, 0, z);
                multiply(data, 1 << -e, 0);
                var zeros = "";
                for(var r = 0; r < fractDigits; r++)zeros += "0";
                result = dataToString(data) + zeros;
            }
        }
        if (fractDigits > 0) {
            k = result.length;
            var zeros1 = "";
            for(var r1 = 0; r1 < fractDigits - k; r1++)zeros1 += "0";
            result = sign + (k <= fractDigits ? "0." + zeros1 + result : result.slice(0, k - fractDigits) + "." + result.slice(k - fractDigits));
        } else {
            result = sign + result;
        }
        return result;
    };
    // src/modules/es.number.to-precision.ts
    var nativeToPrecision = Number.prototype.toPrecision;
    var isSupported149 = function isSupported149() {
        try {
            if (typeof nativeToPrecision !== "function") return false;
            if (nativeToPrecision.call(1, void 0) !== "1") return false;
            try {
                nativeToPrecision.call({});
                return false;
            } catch (unused) {
                return true;
            }
        } catch (unused) {
            return false;
        }
    };
    var numberToPrecision = function toPrecision(precision) {
        var value = Number.prototype.valueOf.call(this);
        return precision === void 0 ? nativeToPrecision.call(value) : nativeToPrecision.call(value, precision);
    };
    // src/modules/es.parse-float.ts
    var WHITESPACE_CODES = [
        9,
        10,
        11,
        12,
        13,
        32,
        160,
        5760,
        8192,
        8193,
        8194,
        8195,
        8196,
        8197,
        8198,
        8199,
        8200,
        8201,
        8202,
        8239,
        8287,
        12288,
        8232,
        8233,
        65279
    ];
    var whitespaces = "";
    for(var i9 = 0; i9 < WHITESPACE_CODES.length; i9++){
        whitespaces += String.fromCharCode(WHITESPACE_CODES[i9]);
    }
    var nativeParseFloat = parseFloat;
    var trimRegExp = new RegExp("^[" + whitespaces + "]+|[" + whitespaces + "]+$", "g");
    var isSupported150 = function isSupported150() {
        try {
            return 1 / nativeParseFloat(whitespaces + "-0") === -Infinity;
        } catch (unused) {
            return false;
        }
    };
    var numberParseFloat2 = function parseFloat2(string) {
        var trimmed = String(string).replace(trimRegExp, "");
        var result = nativeParseFloat(trimmed);
        return result === 0 && trimmed.charAt(0) === "-" ? -0 : result;
    };
    // src/modules/es.parse-int.ts
    var WHITESPACE_CODES2 = [
        9,
        10,
        11,
        12,
        13,
        32,
        160,
        5760,
        8192,
        8193,
        8194,
        8195,
        8196,
        8197,
        8198,
        8199,
        8200,
        8201,
        8202,
        8239,
        8287,
        12288,
        8232,
        8233,
        65279
    ];
    var whitespaces2 = "";
    for(var i10 = 0; i10 < WHITESPACE_CODES2.length; i10++){
        whitespaces2 += String.fromCharCode(WHITESPACE_CODES2[i10]);
    }
    var nativeParseInt = parseInt;
    var trimRegExp2 = new RegExp("^[" + whitespaces2 + "]+|[" + whitespaces2 + "]+$", "g");
    var hexRegExp = /^[+-]?0x/i;
    var isSupported151 = function isSupported151() {
        try {
            return nativeParseInt(whitespaces2 + "08") === 8 && nativeParseInt(whitespaces2 + "0x16") === 22;
        } catch (unused) {
            return false;
        }
    };
    var numberParseInt2 = function parseInt2(string, radix) {
        var S = String(string).replace(trimRegExp2, "");
        return nativeParseInt(S, radix >>> 0 || (hexRegExp.test(S) ? 16 : 10));
    };
    // src/modules/install-iterator.ts
    var iteratorSymbol = typeof Symbol !== "undefined" ? Symbol.iterator : void 0;
    var returnSelf5 = function returnSelf5() {
        return this;
    };
    var getIteratorPrototype = function getIteratorPrototype() {
        if (!iteratorSymbol) return void 0;
        var g = typeof window !== "undefined" ? window : globalThis;
        var samples = [
            function() {
                return [][iteratorSymbol]();
            },
            function() {
                return ""[iteratorSymbol]();
            },
            function() {
                return new g.Map()[iteratorSymbol]();
            },
            function() {
                return new g.Set()[iteratorSymbol]();
            }
        ];
        for(var i = 0; i < samples.length; i++){
            try {
                var proto2 = Object.getPrototypeOf(Object.getPrototypeOf(samples[i]()));
                if (proto2 && proto2 !== Object.prototype) {
                    return proto2;
                }
            } catch (unused) {}
        }
        var synthetic = {};
        Object.defineProperty(synthetic, iteratorSymbol, {
            value: returnSelf5,
            writable: true,
            enumerable: false,
            configurable: true
        });
        return synthetic;
    };
    var IteratorPrototype2 = getIteratorPrototype();
    var brokenHelpers = null;
    var getBrokenHelpers = function getBrokenHelpers() {
        var _loop = function(i) {
            var name = names[i];
            var method = proto2 && proto2[name];
            if (typeof method !== "function") return "continue";
            var limit = name === "take" || name === "drop";
            if (limit || name === "map" || name === "filter" || name === "flatMap") {
                var threw = false;
                try {
                    method.call({
                        next: null
                    }, name === "take" ? 1 : name === "drop" ? 0 : function() {}).next();
                } catch (e) {
                    threw = true;
                }
                if (!threw) {
                    brokenHelpers[name] = true;
                    return "continue";
                }
            }
            var closed = false;
            try {
                method.call({
                    next: function next() {
                        return {
                            done: true
                        };
                    },
                    "return": function() {
                        closed = true;
                    }
                }, -1);
            } catch (e) {
                if (!(e instanceof (limit ? RangeError : TypeError))) closed = false;
            }
            if (!closed) {
                brokenHelpers[name] = true;
                return "continue";
            }
            if (limit) {
                var ranged = false;
                try {
                    method.call({
                        next: function next() {
                            return {
                                done: true
                            };
                        }
                    }, 9007199254740992);
                } catch (e) {
                    ranged = e instanceof RangeError;
                }
                if (!ranged) brokenHelpers[name] = true;
            }
            if (name === "reduce") {
                try {
                    method.call([].keys(), function() {}, void 0);
                } catch (e) {
                    brokenHelpers[name] = true;
                }
            }
        };
        if (brokenHelpers) return brokenHelpers;
        brokenHelpers = {};
        var proto2 = IteratorPrototype2;
        var names = [
            "map",
            "filter",
            "take",
            "drop",
            "flatMap",
            "forEach",
            "reduce",
            "some",
            "every",
            "find"
        ];
        for(var i = 0; i < names.length; i++)_loop(i);
        return brokenHelpers;
    };
    var anyHelperBroken = function anyHelperBroken() {
        var broken = getBrokenHelpers();
        for(var name in broken)if (broken[name]) return true;
        return false;
    };
    var helpersPresent = function helpersPresent() {
        try {
            return typeof globalThis.Iterator === "function" && typeof IteratorPrototype2.map === "function" && typeof IteratorPrototype2.filter === "function" && typeof IteratorPrototype2.take === "function" && typeof IteratorPrototype2.drop === "function" && typeof IteratorPrototype2.flatMap === "function" && typeof IteratorPrototype2.reduce === "function" && typeof IteratorPrototype2.toArray === "function" && typeof IteratorPrototype2.forEach === "function" && typeof IteratorPrototype2.some === "function" && typeof IteratorPrototype2.every === "function" && typeof IteratorPrototype2.find === "function";
        } catch (unused) {
            return false;
        }
    };
    var MAX_SAFE = 9007199254740991;
    var validateLimitOrClose = function validateLimitOrClose(receiver, limit, method) {
        var integerLimit;
        try {
            var numLimit = +limit;
            if (numLimit !== numLimit) {
                throw new RangeError("Iterator.prototype." + method + " limit must not be NaN");
            }
            integerLimit = numLimit === Infinity || numLimit === -Infinity ? numLimit : numLimit >= 0 ? Math.floor(numLimit) : Math.ceil(numLimit);
            if (integerLimit < 0) {
                throw new RangeError("Iterator.prototype." + method + " limit must not be negative");
            }
            if (integerLimit !== Infinity && integerLimit > MAX_SAFE) {
                throw new RangeError("Iterator.prototype." + method + " limit must be a safe integer or Infinity");
            }
        } catch (error) {
            closeIterator6(receiver, true);
            throw error;
        }
        return integerLimit;
    };
    var closeIterator6 = function closeIterator6(iterator, swallowErrors) {
        if (!iterator) return;
        var method;
        try {
            method = iterator.return;
        } catch (error) {
            if (swallowErrors) return;
            throw error;
        }
        if (method === null || method === void 0) return;
        if (typeof method !== "function") {
            if (swallowErrors) return;
            throw new TypeError("iterator.return is not a function");
        }
        var result;
        try {
            result = method.call(iterator);
        } catch (error) {
            if (swallowErrors) return;
            throw error;
        }
        if (!swallowErrors && (result === null || typeof result !== "object")) {
            throw new TypeError("iterator return method returned a non-object");
        }
    };
    var IteratorHelperPrototype = IteratorPrototype2 ? Object.create(IteratorPrototype2) : Object.create(Object.prototype);
    var makeHelper = function makeHelper(underlying, kind, callback, limit, nextMethod) {
        var helper = Object.create(IteratorHelperPrototype);
        helper._isIteratorHelper = true;
        helper._running = false;
        helper._underlying = underlying;
        helper._next = nextMethod === void 0 ? underlying.next : nextMethod;
        helper._innerNext = null;
        helper._kind = kind;
        helper._callback = callback;
        helper._limit = limit;
        helper._counter = 0;
        helper._inner = null;
        return helper;
    };
    IteratorHelperPrototype.next = function() {
        if (this === null || typeof this !== "object" || this._isIteratorHelper !== true) {
            throw new TypeError("Iterator Helper.prototype.next called on incompatible receiver");
        }
        if (this._running) {
            throw new TypeError("Iterator Helper is already running");
        }
        var underlying = this._underlying;
        if (underlying === null) {
            return {
                value: void 0,
                done: true
            };
        }
        var kind = this._kind;
        var callback = this._callback;
        this._running = true;
        var closeOnError = true;
        try {
            for(;;){
                if (kind === "take") {
                    if (this._counter >= this._limit) {
                        this._underlying = null;
                        this._callback = null;
                        this._inner = null;
                        this._next = null;
                        this._innerNext = null;
                        closeIterator6(underlying, false);
                        this._running = false;
                        return {
                            value: void 0,
                            done: true
                        };
                    }
                }
                if (kind === "flatMap" && this._inner) {
                    if (typeof this._innerNext !== "function") throw new TypeError("iterator.next is not a function");
                    var innerStep = this._innerNext.call(this._inner);
                    if (!innerStep.done) {
                        this._running = false;
                        return {
                            value: innerStep.value,
                            done: false
                        };
                    }
                    this._inner = null;
                    this._innerNext = null;
                }
                closeOnError = false;
                if (typeof this._next !== "function") throw new TypeError("iterator.next is not a function");
                var step = this._next.call(underlying);
                if (step === null || typeof step !== "object" && typeof step !== "function") {
                    throw new TypeError("iterator result is not an object");
                }
                if (step.done) {
                    this._underlying = null;
                    this._callback = null;
                    this._inner = null;
                    this._next = null;
                    this._innerNext = null;
                    this._running = false;
                    return {
                        value: void 0,
                        done: true
                    };
                }
                var value = step.value;
                closeOnError = true;
                var index = this._counter++;
                if (kind === "map") {
                    var mapped = callback(value, index);
                    this._running = false;
                    return {
                        value: mapped,
                        done: false
                    };
                }
                if (kind === "filter") {
                    if (callback(value, index)) {
                        this._running = false;
                        return {
                            value: value,
                            done: false
                        };
                    }
                    continue;
                }
                if (kind === "take") {
                    this._running = false;
                    return {
                        value: value,
                        done: false
                    };
                }
                if (kind === "drop") {
                    if (index < this._limit) {
                        continue;
                    }
                    this._running = false;
                    return {
                        value: value,
                        done: false
                    };
                }
                if (kind === "flatMap") {
                    var mapped1 = callback(value, index);
                    this._inner = getInnerIterator(mapped1);
                    this._innerNext = this._inner.next;
                    continue;
                }
                if (kind === "concat") {
                    this._running = false;
                    return {
                        value: value,
                        done: false
                    };
                }
                this._running = false;
                return {
                    value: value,
                    done: false
                };
            }
        } catch (error) {
            var alreadyClosed = this._underlying === null;
            this._underlying = null;
            this._callback = null;
            this._inner = null;
            this._next = null;
            this._innerNext = null;
            if (!alreadyClosed && closeOnError) {
                closeIterator6(underlying, true);
            }
            this._running = false;
            throw error;
        }
    };
    IteratorHelperPrototype.return = function() {
        if (this === null || typeof this !== "object" || this._isIteratorHelper !== true) {
            throw new TypeError("Iterator Helper.prototype.return called on incompatible receiver");
        }
        if (this._running) {
            throw new TypeError("Iterator Helper is already running");
        }
        var underlying = this._underlying;
        if (underlying !== null) {
            var inner = this._inner;
            this._underlying = null;
            this._callback = null;
            this._inner = null;
            this._next = null;
            this._innerNext = null;
            closeIterator6(inner, false);
            closeIterator6(underlying, false);
        }
        return {
            value: void 0,
            done: true
        };
    };
    var helperMethods = [
        "next",
        "return"
    ];
    for(var i11 = 0; i11 < helperMethods.length; i11++){
        var fn4 = IteratorHelperPrototype[helperMethods[i11]];
        try {
            Object.defineProperty(fn4, "name", {
                value: helperMethods[i11],
                configurable: true
            });
        } catch (e) {}
        Object.defineProperty(IteratorHelperPrototype, helperMethods[i11], {
            value: fn4,
            writable: true,
            enumerable: false,
            configurable: true
        });
    }
    if (typeof Symbol !== "undefined" && Symbol.toStringTag && !Object.prototype.hasOwnProperty.call(IteratorHelperPrototype, Symbol.toStringTag)) {
        Object.defineProperty(IteratorHelperPrototype, Symbol.toStringTag, {
            value: "Iterator Helper",
            writable: false,
            enumerable: false,
            configurable: true
        });
    }
    if (iteratorSymbol) {
        Object.defineProperty(IteratorHelperPrototype, iteratorSymbol, {
            value: function value() {
                return this;
            },
            writable: true,
            enumerable: false,
            configurable: true
        });
    }
    var getInnerIterator = function getInnerIterator(value) {
        if (value === null || typeof value !== "object" && typeof value !== "function") {
            throw new TypeError("flatMap callback must return an object");
        }
        if (iteratorSymbol) {
            var method = value[iteratorSymbol];
            if (method !== null && method !== void 0) {
                if (typeof method !== "function") {
                    throw new TypeError("flatMap callback result's Symbol.iterator is not a function");
                }
                return method.call(value);
            }
        }
        if (typeof value.next === "function") {
            return value;
        }
        throw new TypeError("flatMap callback must return an iterable or iterator");
    };
    var iteratorMap = function iteratorMap(mapper) {
        if (this === null || typeof this !== "object") throw new TypeError("Iterator.prototype.map called on a non-object");
        if (typeof mapper !== "function") {
            closeIterator6(this, true);
            throw new TypeError("mapper is not a function");
        }
        var underlying = this;
        return makeHelper(underlying, "map", mapper, 0);
    };
    var iteratorFilter = function iteratorFilter(predicate) {
        if (this === null || typeof this !== "object") throw new TypeError("Iterator.prototype.filter called on a non-object");
        if (typeof predicate !== "function") {
            closeIterator6(this, true);
            throw new TypeError("predicate is not a function");
        }
        var underlying = this;
        return makeHelper(underlying, "filter", predicate, 0);
    };
    var iteratorTake = function iteratorTake(limit) {
        if (this === null || typeof this !== "object") throw new TypeError("Iterator.prototype.take called on a non-object");
        var count = validateLimitOrClose(this, limit, "take");
        var underlying = this;
        return makeHelper(underlying, "take", null, count);
    };
    var iteratorDrop = function iteratorDrop(limit) {
        if (this === null || typeof this !== "object") throw new TypeError("Iterator.prototype.drop called on a non-object");
        var count = validateLimitOrClose(this, limit, "drop");
        var underlying = this;
        return makeHelper(underlying, "drop", null, count);
    };
    var iteratorFlatMap = function iteratorFlatMap(mapper) {
        if (this === null || typeof this !== "object") throw new TypeError("Iterator.prototype.flatMap called on a non-object");
        if (typeof mapper !== "function") {
            closeIterator6(this, true);
            throw new TypeError("mapper is not a function");
        }
        var underlying = this;
        return makeHelper(underlying, "flatMap", mapper, 0);
    };
    var iteratorToArray = function iteratorToArray() {
        if (this === null || typeof this !== "object") throw new TypeError("Iterator.prototype.toArray called on a non-object");
        var underlying = this;
        var nextMethod = underlying.next;
        var out = [];
        for(;;){
            if (typeof nextMethod !== "function") throw new TypeError("iterator.next is not a function");
            var step = nextMethod.call(underlying);
            if (step === null || typeof step !== "object" && typeof step !== "function") {
                throw new TypeError("iterator result is not an object");
            }
            if (step.done) return out;
            out.push(step.value);
        }
    };
    var iteratorForEach = function iteratorForEach(fn) {
        if (this === null || typeof this !== "object") throw new TypeError("Iterator.prototype.forEach called on a non-object");
        if (typeof fn !== "function") {
            closeIterator6(this, true);
            throw new TypeError("fn is not a function");
        }
        var underlying = this;
        var nextMethod = underlying.next;
        var index = 0;
        for(;;){
            if (typeof nextMethod !== "function") throw new TypeError("iterator.next is not a function");
            var step = nextMethod.call(underlying);
            if (step === null || typeof step !== "object" && typeof step !== "function") {
                throw new TypeError("iterator result is not an object");
            }
            if (step.done) return void 0;
            var value = step.value;
            try {
                fn(value, index++);
            } catch (error) {
                closeIterator6(underlying, true);
                throw error;
            }
        }
    };
    var iteratorReduce = function iteratorReduce(reducer) {
        if (this === null || typeof this !== "object") throw new TypeError("Iterator.prototype.reduce called on a non-object");
        if (typeof reducer !== "function") {
            closeIterator6(this, true);
            throw new TypeError("reducer is not a function");
        }
        var underlying = this;
        var nextMethod = underlying.next;
        var accumulator;
        var index = 0;
        if (arguments.length < 2) {
            if (typeof nextMethod !== "function") throw new TypeError("iterator.next is not a function");
            var first = nextMethod.call(underlying);
            if (first === null || typeof first !== "object" && typeof first !== "function") {
                throw new TypeError("iterator result is not an object");
            }
            if (first.done) {
                throw new TypeError("Reduce of empty iterator with no initial value");
            }
            accumulator = first.value;
            index = 1;
        } else {
            accumulator = arguments[1];
        }
        for(;;){
            if (typeof nextMethod !== "function") throw new TypeError("iterator.next is not a function");
            var step = nextMethod.call(underlying);
            if (step === null || typeof step !== "object" && typeof step !== "function") {
                throw new TypeError("iterator result is not an object");
            }
            if (step.done) return accumulator;
            var value = step.value;
            try {
                accumulator = reducer(accumulator, value, index++);
            } catch (error) {
                closeIterator6(underlying, true);
                throw error;
            }
        }
    };
    var iteratorSome = function iteratorSome(predicate) {
        if (this === null || typeof this !== "object") throw new TypeError("Iterator.prototype.some called on a non-object");
        if (typeof predicate !== "function") {
            closeIterator6(this, true);
            throw new TypeError("predicate is not a function");
        }
        var underlying = this;
        var nextMethod = underlying.next;
        var index = 0;
        for(;;){
            if (typeof nextMethod !== "function") throw new TypeError("iterator.next is not a function");
            var step = nextMethod.call(underlying);
            if (step === null || typeof step !== "object" && typeof step !== "function") {
                throw new TypeError("iterator result is not an object");
            }
            if (step.done) return false;
            var value = step.value;
            try {
                if (predicate(value, index++)) {
                    closeIterator6(underlying, false);
                    return true;
                }
            } catch (error) {
                closeIterator6(underlying, true);
                throw error;
            }
        }
    };
    var iteratorEvery = function iteratorEvery(predicate) {
        if (this === null || typeof this !== "object") throw new TypeError("Iterator.prototype.every called on a non-object");
        if (typeof predicate !== "function") {
            closeIterator6(this, true);
            throw new TypeError("predicate is not a function");
        }
        var underlying = this;
        var nextMethod = underlying.next;
        var index = 0;
        for(;;){
            if (typeof nextMethod !== "function") throw new TypeError("iterator.next is not a function");
            var step = nextMethod.call(underlying);
            if (step === null || typeof step !== "object" && typeof step !== "function") {
                throw new TypeError("iterator result is not an object");
            }
            if (step.done) return true;
            var value = step.value;
            try {
                if (!predicate(value, index++)) {
                    closeIterator6(underlying, false);
                    return false;
                }
            } catch (error) {
                closeIterator6(underlying, true);
                throw error;
            }
        }
    };
    var iteratorFind = function iteratorFind(predicate) {
        if (this === null || typeof this !== "object") throw new TypeError("Iterator.prototype.find called on a non-object");
        if (typeof predicate !== "function") {
            closeIterator6(this, true);
            throw new TypeError("predicate is not a function");
        }
        var underlying = this;
        var nextMethod = underlying.next;
        var index = 0;
        for(;;){
            if (typeof nextMethod !== "function") throw new TypeError("iterator.next is not a function");
            var step = nextMethod.call(underlying);
            if (step === null || typeof step !== "object" && typeof step !== "function") {
                throw new TypeError("iterator result is not an object");
            }
            if (step.done) return void 0;
            var value = step.value;
            try {
                if (predicate(value, index++)) {
                    closeIterator6(underlying, false);
                    return value;
                }
            } catch (error) {
                closeIterator6(underlying, true);
                throw error;
            }
        }
    };
    var iteratorConcat = function concat2() {
        var sources = [];
        for(var i = 0; i < arguments.length; i++){
            var item = arguments[i];
            if (item === null || typeof item !== "object" && typeof item !== "function") {
                throw new TypeError("Iterator.concat arguments must be objects");
            }
            var method = iteratorSymbol ? item[iteratorSymbol] : void 0;
            if (typeof method !== "function") {
                throw new TypeError("Iterator.concat argument is not iterable");
            }
            sources.push(method, item);
        }
        var cursor = 0;
        var current = null;
        var currentNext = null;
        var driver = {
            next: function next() {
                for(;;){
                    if (current === null) {
                        if (cursor >= sources.length) {
                            return {
                                value: void 0,
                                done: true
                            };
                        }
                        var method = sources[cursor];
                        var iterable = sources[cursor + 1];
                        sources[cursor] = null;
                        sources[cursor + 1] = null;
                        cursor += 2;
                        var opened = method.call(iterable);
                        if (opened === null || typeof opened !== "object" && typeof opened !== "function") {
                            throw new TypeError("Iterator.concat: @@iterator returned a non-object");
                        }
                        current = opened;
                        currentNext = current.next;
                    }
                    if (typeof currentNext !== "function") throw new TypeError("iterator.next is not a function");
                    var step = currentNext.call(current);
                    if (step === null || typeof step !== "object" && typeof step !== "function") {
                        throw new TypeError("iterator result is not an object");
                    }
                    if (!step.done) {
                        return {
                            value: step.value,
                            done: false
                        };
                    }
                    current = null;
                    currentNext = null;
                }
            },
            return: function _return() {
                closeIterator6(current, false);
                current = null;
                currentNext = null;
                sources.length = 0;
                cursor = 0;
                return {
                    value: void 0,
                    done: true
                };
            }
        };
        return makeHelper(driver, "concat", null, 0);
    };
    var WrapForValidIteratorPrototype = IteratorPrototype2 ? Object.create(IteratorPrototype2) : Object.create(Object.prototype);
    var hasOwnSlot3 = Object.prototype.hasOwnProperty;
    var requireWrapper = function requireWrapper(self, method) {
        if (self === null || typeof self !== "object" || !hasOwnSlot3.call(self, "_iterated")) {
            throw new TypeError("%WrapForValidIteratorPrototype%." + method + " called on incompatible receiver");
        }
    };
    var wrapperMethods = {
        next: function next6() {
            requireWrapper(this, "next");
            return this._nextMethod.call(this._iterated);
        },
        return: function _return() {
            requireWrapper(this, "return");
            var iterator = this._iterated;
            var ret = iterator["return"];
            if (ret === void 0 || ret === null) {
                return {
                    value: void 0,
                    done: true
                };
            }
            return ret.call(iterator);
        }
    };
    for(var name2 in wrapperMethods){
        try {
            Object.defineProperty(wrapperMethods[name2], "name", {
                value: name2,
                configurable: true
            });
        } catch (e) {}
        Object.defineProperty(WrapForValidIteratorPrototype, name2, {
            value: wrapperMethods[name2],
            writable: true,
            enumerable: false,
            configurable: true
        });
    }
    var WRAP_SLOT = {
        value: void 0,
        writable: false,
        enumerable: false,
        configurable: false
    };
    var iteratorFrom = function from3(O) {
        if (O === null || typeof O !== "object" && typeof O !== "function") {
            if (typeof O !== "string") {
                throw new TypeError("Iterator.from called on a non-object");
            }
        }
        var method = iteratorSymbol ? O[iteratorSymbol] : void 0;
        var iterator;
        if (method === void 0 || method === null) {
            iterator = O;
        } else {
            if (typeof method !== "function") throw new TypeError("Iterator.from: @@iterator is not a function");
            iterator = method.call(O);
        }
        if (iterator === null || typeof iterator !== "object" && typeof iterator !== "function") {
            throw new TypeError("Iterator.from: the iterator is not an object");
        }
        var nextMethod = iterator.next;
        if (IteratorPrototype2 && IteratorPrototype2.isPrototypeOf(iterator)) {
            return iterator;
        }
        var wrapper = Object.create(WrapForValidIteratorPrototype);
        WRAP_SLOT.value = iterator;
        Object.defineProperty(wrapper, "_iterated", WRAP_SLOT);
        WRAP_SLOT.value = nextMethod;
        Object.defineProperty(wrapper, "_nextMethod", WRAP_SLOT);
        WRAP_SLOT.value = void 0;
        return wrapper;
    };
    var iteratorDispose = function iteratorDispose() {
        closeIterator6(this);
    };
    var ensureSymbol2 = function ensureSymbol2(name) {
        if (typeof Symbol === "undefined") {
            return void 0;
        }
        var existing = Symbol[name];
        if (existing !== void 0) {
            return existing;
        }
        try {
            Object.defineProperty(Symbol, name, {
                value: /* @__PURE__ */ Symbol("Symbol." + name)
            });
        } catch (unused) {
            return void 0;
        }
        return Symbol[name];
    };
    if (IteratorPrototype2) {
        var disposeKey2 = ensureSymbol2("dispose");
        if (disposeKey2 && !IteratorPrototype2[disposeKey2]) {
            Object.defineProperty(IteratorPrototype2, disposeKey2, {
                value: iteratorDispose,
                writable: true,
                enumerable: false,
                configurable: true
            });
            try {
                try {
                    Object.defineProperty(iteratorDispose, "name", {
                        value: "[Symbol.dispose]",
                        configurable: true
                    });
                } catch (e) {}
            } catch (e) {}
            Object.defineProperty(iteratorDispose, "__polyfilled", {
                value: true
            });
        }
    }
    var MAX_CHAIN = 100;
    var inheritsFrom = function inheritsFrom(value, ancestor) {
        var current = value;
        var steps = 0;
        while(current !== null && current !== void 0){
            if (current === ancestor) {
                return true;
            }
            if (++steps > MAX_CHAIN) {
                return true;
            }
            try {
                current = Object.getPrototypeOf(current);
            } catch (e) {
                return false;
            }
        }
        return false;
    };
    var chainTerminates = function chainTerminates(value) {
        var current = value;
        var steps = 0;
        while(current !== null && current !== void 0){
            if (++steps > MAX_CHAIN) {
                return false;
            }
            try {
                current = Object.getPrototypeOf(current);
            } catch (e) {
                return false;
            }
        }
        return true;
    };
    var setProtoOf = function setProtoOf(target, proto2) {
        var previous;
        try {
            previous = Object.getPrototypeOf(target);
        } catch (e) {
            return;
        }
        try {
            if (typeof Object.setPrototypeOf === "function") {
                Object.setPrototypeOf(target, proto2);
            } else {
                target.__proto__ = proto2;
            }
        } catch (e) {
            return;
        }
        try {
            if (Object.getPrototypeOf(target) === proto2 && chainTerminates(target)) {
                return;
            }
            if (typeof Object.setPrototypeOf === "function") {
                Object.setPrototypeOf(target, previous);
            } else {
                target.__proto__ = previous;
            }
        } catch (e) {}
    };
    var protoOfSample = function protoOfSample(make) {
        try {
            var iterator = make();
            if (!iterator || typeof iterator.next !== "function") {
                return void 0;
            }
            return Object.getPrototypeOf(iterator);
        } catch (e) {
            return void 0;
        }
    };
    var installIteratorExtensionsOnNative = function installIteratorExtensionsOnNative() {
        if (!IteratorPrototype2 || !iteratorSymbol) {
            return;
        }
        var g = typeof window !== "undefined" ? window : globalThis;
        var sources = [
            function() {
                return [].keys();
            },
            function() {
                return [].values();
            },
            function() {
                return [].entries();
            },
            function() {
                return [][iteratorSymbol]();
            },
            function() {
                return ""[iteratorSymbol]();
            },
            function() {
                return new g.Map()[iteratorSymbol]();
            },
            function() {
                return new g.Set()[iteratorSymbol]();
            },
            function() {
                return new g.Uint8Array(1).values();
            },
            function() {
                return "a".matchAll(/a/g);
            },
            function() {
                return g.document.createElement("div").childNodes.values();
            },
            function() {
                return new g.URLSearchParams("a=1").entries();
            }
        ];
        var tags = [
            "Array Iterator",
            "Array Iterator",
            "Array Iterator",
            "Array Iterator",
            "String Iterator",
            "Map Iterator",
            "Set Iterator",
            "Array Iterator",
            "RegExp String Iterator",
            "Array Iterator",
            "URLSearchParams Iterator"
        ];
        var tagKey9 = typeof Symbol !== "undefined" ? Symbol.toStringTag : void 0;
        for(var i = 0; i < sources.length; i++){
            var proto2 = protoOfSample(sources[i]);
            if (!proto2) {
                continue;
            }
            if (proto2 === Object.prototype || inheritsFrom(IteratorPrototype2, proto2)) {
                continue;
            }
            if (tagKey9 && !Object.prototype.hasOwnProperty.call(proto2, tagKey9)) {
                try {
                    Object.defineProperty(proto2, tagKey9, {
                        value: tags[i],
                        writable: false,
                        enumerable: false,
                        configurable: true
                    });
                } catch (e) {}
            }
            if (inheritsFrom(proto2, IteratorPrototype2)) {
                continue;
            }
            setProtoOf(proto2, IteratorPrototype2);
        }
    };
    var installHelpers = function installHelpers() {
        var methods2 = [
            [
                "map",
                iteratorMap
            ],
            [
                "filter",
                iteratorFilter
            ],
            [
                "take",
                iteratorTake
            ],
            [
                "drop",
                iteratorDrop
            ],
            [
                "flatMap",
                iteratorFlatMap
            ],
            [
                "toArray",
                iteratorToArray
            ],
            [
                "forEach",
                iteratorForEach
            ],
            [
                "reduce",
                iteratorReduce
            ],
            [
                "some",
                iteratorSome
            ],
            [
                "every",
                iteratorEvery
            ],
            [
                "find",
                iteratorFind
            ]
        ];
        for(var i = 0; i < methods2.length; i++){
            var name = methods2[i][0];
            if (!IteratorPrototype2[name] || getBrokenHelpers()[name]) {
                try {
                    Object.defineProperty(methods2[i][1], "name", {
                        value: name,
                        configurable: true
                    });
                } catch (e) {}
                Object.defineProperty(IteratorPrototype2, name, {
                    value: methods2[i][1],
                    writable: true,
                    enumerable: false,
                    configurable: true
                });
                Object.defineProperty(IteratorPrototype2[name], "__polyfilled", {
                    value: true
                });
            }
        }
    };
    var installIteratorPolyfill = function installIteratorPolyfill() {
        var tagKey9 = typeof Symbol !== "undefined" ? Symbol.toStringTag : void 0;
        if (IteratorPrototype2 && tagKey9 && !Object.prototype.hasOwnProperty.call(IteratorPrototype2, tagKey9)) {
            try {
                var getTag = function getTag() {
                    return "Iterator";
                };
                var setTag = function setTag(v) {
                    if (this === null || typeof this !== "object" && typeof this !== "function") {
                        throw new TypeError("Iterator.prototype[@@toStringTag] setter called on a non-object");
                    }
                    if (this === IteratorPrototype2) {
                        throw new TypeError("Cannot assign to read only property 'Symbol(Symbol.toStringTag)' of #<Iterator>");
                    }
                    if (Object.prototype.hasOwnProperty.call(this, tagKey9)) {
                        this[tagKey9] = v;
                    } else {
                        Object.defineProperty(this, tagKey9, {
                            value: v,
                            writable: true,
                            enumerable: true,
                            configurable: true
                        });
                    }
                };
                try {
                    Object.defineProperty(getTag, "name", {
                        value: "get [Symbol.toStringTag]",
                        configurable: true
                    });
                } catch (e) {}
                try {
                    Object.defineProperty(setTag, "name", {
                        value: "set [Symbol.toStringTag]",
                        configurable: true
                    });
                } catch (e) {}
                Object.defineProperty(IteratorPrototype2, tagKey9, {
                    get: getTag,
                    set: setTag,
                    enumerable: false,
                    configurable: true
                });
            } catch (e) {}
        }
        if (IteratorPrototype2 && iteratorSymbol && !helpersPresent()) {
            var Iterator = function Iterator() {
                if (this === void 0 || this === null || typeof this !== "object") {
                    throw new TypeError("Constructor Iterator requires 'new'");
                }
                if (Object.getPrototypeOf(this) === IteratorPrototype2) {
                    throw new TypeError("Abstract class Iterator not directly constructable");
                }
            };
            Object.defineProperty(Iterator, "prototype", {
                value: IteratorPrototype2,
                writable: false,
                enumerable: false,
                configurable: false
            });
            try {
                Object.defineProperty(IteratorPrototype2, "constructor", {
                    get: function get() {
                        return Iterator;
                    },
                    set: function set(v) {
                        if (this === null || typeof this !== "object" && typeof this !== "function") {
                            throw new TypeError("Iterator.prototype.constructor setter called on a non-object");
                        }
                        if (this === IteratorPrototype2) {
                            throw new TypeError("Cannot assign to read only property 'constructor' of #<Iterator>");
                        }
                        if (!Object.prototype.hasOwnProperty.call(this, "constructor")) {
                            Object.defineProperty(this, "constructor", {
                                value: v,
                                writable: true,
                                enumerable: true,
                                configurable: true
                            });
                        } else {
                            this.constructor = v;
                        }
                    },
                    enumerable: false,
                    configurable: true
                });
                var ctorDesc = Object.getOwnPropertyDescriptor(IteratorPrototype2, "constructor");
                try {
                    Object.defineProperty(ctorDesc.get, "name", {
                        value: "get constructor",
                        configurable: true
                    });
                } catch (e) {}
                try {
                    Object.defineProperty(ctorDesc.set, "name", {
                        value: "set constructor",
                        configurable: true
                    });
                } catch (e) {}
            } catch (unused) {}
            var statics = [
                [
                    "from",
                    iteratorFrom
                ],
                [
                    "concat",
                    iteratorConcat
                ]
            ];
            for(var i = 0; i < statics.length; i++){
                try {
                    Object.defineProperty(statics[i][1], "name", {
                        value: statics[i][0],
                        configurable: true
                    });
                } catch (e) {}
                Object.defineProperty(Iterator, statics[i][0], {
                    value: statics[i][1],
                    writable: true,
                    enumerable: false,
                    configurable: true
                });
                Object.defineProperty(statics[i][1], "__polyfilled", {
                    value: true
                });
            }
            installHelpers();
            var target = typeof window !== "undefined" ? window : globalThis;
            if (!target.Iterator) {
                Object.defineProperty(target, "Iterator", {
                    value: Iterator,
                    writable: true,
                    enumerable: false,
                    configurable: true
                });
                try {
                    Object.defineProperty(target.Iterator, "name", {
                        value: "Iterator",
                        configurable: true
                    });
                } catch (e) {}
                Object.defineProperty(target.Iterator, "__polyfilled", {
                    value: true
                });
            }
        } else if (IteratorPrototype2 && anyHelperBroken()) {
            installHelpers();
        }
    };
    var installIterator = function installIterator() {
        installIteratorPolyfill();
        installIteratorExtensionsOnNative();
    };
    // src/modules/es.promise.all-settled.ts
    var isSupported152 = function isSupported152() {
        try {
            return typeof Promise !== "undefined" && typeof Promise.allSettled === "function";
        } catch (unused) {
            return false;
        }
    };
    var isObject7 = function isObject7(value) {
        return value !== null && (typeof value === "object" || typeof value === "function");
    };
    var hasOwn11 = Object.prototype.hasOwnProperty;
    var arrowWrap = null;
    try {
        arrowWrap = new Function("f", "return (x) => f(x)");
    } catch (e) {}
    var builtinClosure = function builtinClosure(fn) {
        return arrowWrap ? arrowWrap(fn) : function(x) {
            return fn(x);
        };
    };
    var closeIterator7 = function closeIterator7(iterator) {
        try {
            var ret = iterator["return"];
            if (ret !== void 0 && ret !== null) ret.call(iterator);
        } catch (e) {}
    };
    var DONE = {};
    var stepValue = function stepValue(record) {
        if (record.arrayLike !== null) {
            if (record.index >= record.arrayLike.length) {
                record.done = true;
                return DONE;
            }
            return record.arrayLike[record.index++];
        }
        try {
            var result = record.next.call(record.iterator);
            if (!isObject7(result)) throw new TypeError("Iterator result is not an object");
            if (result.done) {
                record.done = true;
                return DONE;
            }
            return result.value;
        } catch (error) {
            record.done = true;
            throw error;
        }
    };
    var ArrayProto17 = Array.prototype;
    var LIST4 = {
        value: void 0,
        writable: true,
        enumerable: true,
        configurable: true
    };
    var arrayFromList = function arrayFromList(list, length) {
        var out = [];
        for(var i = 0; i < length; i++){
            if (i in ArrayProto17) {
                LIST4.value = list[i];
                Object.defineProperty(out, i, LIST4);
                LIST4.value = void 0;
            } else {
                out[i] = list[i];
            }
        }
        return out;
    };
    var subscribeElement = function subscribeElement(state, index, nextPromise) {
        var alreadyCalled = false;
        var onFulfilled = builtinClosure(function(x) {
            if (alreadyCalled) return void 0;
            alreadyCalled = true;
            state.values[index] = {
                status: "fulfilled",
                value: x
            };
            if (--state.remaining === 0) return state.capability.resolve(arrayFromList(state.values, state.count));
            return void 0;
        });
        var onRejected = builtinClosure(function(x) {
            if (alreadyCalled) return void 0;
            alreadyCalled = true;
            state.values[index] = {
                status: "rejected",
                reason: x
            };
            if (--state.remaining === 0) return state.capability.resolve(arrayFromList(state.values, state.count));
            return void 0;
        });
        nextPromise.then(onFulfilled, onRejected);
    };
    var promiseAllSettled = function allSettled(iterable) {
        var C = this;
        if (!(typeof C === "function" && (hasOwn11.call(C, "prototype") || /^bound /.test(C.name || "")))) {
            throw new TypeError("Promise capability: not a constructor");
        }
        var capability = {
            promise: void 0,
            resolve: void 0,
            reject: void 0
        };
        var executor = function executor(resolve, reject) {
            if (capability.resolve !== void 0) throw new TypeError("Promise executor has already been invoked with non-undefined arguments");
            if (capability.reject !== void 0) throw new TypeError("Promise executor has already been invoked with non-undefined arguments");
            capability.resolve = resolve;
            capability.reject = reject;
        };
        capability.promise = new C(executor);
        if (typeof capability.resolve !== "function") throw new TypeError("Promise resolve function is not callable");
        if (typeof capability.reject !== "function") throw new TypeError("Promise reject function is not callable");
        var record = null;
        try {
            var promiseResolve2 = C.resolve;
            if (typeof promiseResolve2 !== "function") throw new TypeError("Promise resolve is not callable");
            var iteratorKey4 = typeof Symbol !== "undefined" ? Symbol.iterator : void 0;
            if (iteratorKey4) {
                if (iterable === null || iterable === void 0) throw new TypeError("object is not iterable");
                var method = iterable[iteratorKey4];
                if (typeof method !== "function") throw new TypeError("object is not iterable");
                var iterator = method.call(iterable);
                if (!isObject7(iterator)) throw new TypeError("Result of the Symbol.iterator method is not an object");
                record = {
                    iterator: iterator,
                    next: iterator.next,
                    arrayLike: null,
                    index: 0,
                    done: false
                };
            } else {
                if (iterable === null || iterable === void 0 || typeof iterable.length !== "number") {
                    throw new TypeError("object is not iterable");
                }
                record = {
                    iterator: null,
                    next: null,
                    arrayLike: iterable,
                    index: 0,
                    done: false
                };
            }
            var state = {
                values: /* @__PURE__ */ Object.create(null),
                count: 0,
                remaining: 1,
                capability: capability
            };
            for(;;){
                var value = stepValue(record);
                if (value === DONE) {
                    if (--state.remaining === 0) capability.resolve(arrayFromList(state.values, state.count));
                    return capability.promise;
                }
                var index = state.count++;
                state.values[index] = void 0;
                var nextPromise = promiseResolve2.call(C, value);
                state.remaining++;
                subscribeElement(state, index, nextPromise);
            }
        } catch (error) {
            if (record !== null && !record.done && record.iterator !== null) closeIterator7(record.iterator);
            capability.reject(error);
            return capability.promise;
        }
    };
    // src/modules/es.promise.any.ts
    var isSupported153 = function isSupported153() {
        try {
            return typeof Promise !== "undefined" && typeof Promise.any === "function";
        } catch (unused) {
            return false;
        }
    };
    var isObject8 = function isObject8(value) {
        return value !== null && (typeof value === "object" || typeof value === "function");
    };
    var hasOwn12 = Object.prototype.hasOwnProperty;
    var arrowWrap2 = null;
    try {
        arrowWrap2 = new Function("f", "return (x) => f(x)");
    } catch (e) {}
    var builtinClosure2 = function builtinClosure2(fn) {
        return arrowWrap2 ? arrowWrap2(fn) : function(x) {
            return fn(x);
        };
    };
    var closeIterator8 = function closeIterator8(iterator) {
        try {
            var ret = iterator["return"];
            if (ret !== void 0 && ret !== null) ret.call(iterator);
        } catch (e) {}
    };
    var DONE2 = {};
    var stepValue2 = function stepValue2(record) {
        if (record.arrayLike !== null) {
            if (record.index >= record.arrayLike.length) {
                record.done = true;
                return DONE2;
            }
            return record.arrayLike[record.index++];
        }
        try {
            var result = record.next.call(record.iterator);
            if (!isObject8(result)) throw new TypeError("Iterator result is not an object");
            if (result.done) {
                record.done = true;
                return DONE2;
            }
            return result.value;
        } catch (error) {
            record.done = true;
            throw error;
        }
    };
    var ArrayProto18 = Array.prototype;
    var LIST5 = {
        value: void 0,
        writable: true,
        enumerable: true,
        configurable: true
    };
    var arrayFromList2 = function arrayFromList2(list, length) {
        var out = [];
        for(var i = 0; i < length; i++){
            if (i in ArrayProto18) {
                LIST5.value = list[i];
                Object.defineProperty(out, i, LIST5);
                LIST5.value = void 0;
            } else {
                out[i] = list[i];
            }
        }
        return out;
    };
    var subscribeElement2 = function subscribeElement2(state, index, nextPromise) {
        var alreadyCalled = false;
        var onRejected = builtinClosure2(function(x) {
            if (alreadyCalled) return void 0;
            alreadyCalled = true;
            state.errors[index] = x;
            if (--state.remaining === 0) return state.capability.reject(makeAggregateError(arrayFromList2(state.errors, state.count)));
            return void 0;
        });
        nextPromise.then(state.capability.resolve, onRejected);
    };
    var makeAggregateError = function makeAggregateError(errors) {
        var Ctor = window.AggregateError;
        if (typeof Ctor === "function") return new Ctor(errors, "All promises were rejected");
        var err = new Error("All promises were rejected");
        Object.defineProperty(err, "name", {
            value: "AggregateError",
            writable: true,
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(err, "errors", {
            value: errors,
            writable: true,
            enumerable: false,
            configurable: true
        });
        return err;
    };
    var promiseAny = function any(iterable) {
        var C = this;
        if (!(typeof C === "function" && (hasOwn12.call(C, "prototype") || /^bound /.test(C.name || "")))) {
            throw new TypeError("Promise capability: not a constructor");
        }
        var capability = {
            promise: void 0,
            resolve: void 0,
            reject: void 0
        };
        var executor = function executor(resolve, reject) {
            if (capability.resolve !== void 0) throw new TypeError("Promise executor has already been invoked with non-undefined arguments");
            if (capability.reject !== void 0) throw new TypeError("Promise executor has already been invoked with non-undefined arguments");
            capability.resolve = resolve;
            capability.reject = reject;
        };
        capability.promise = new C(executor);
        if (typeof capability.resolve !== "function") throw new TypeError("Promise resolve function is not callable");
        if (typeof capability.reject !== "function") throw new TypeError("Promise reject function is not callable");
        var record = null;
        try {
            var promiseResolve2 = C.resolve;
            if (typeof promiseResolve2 !== "function") throw new TypeError("Promise resolve is not callable");
            var iteratorKey4 = typeof Symbol !== "undefined" ? Symbol.iterator : void 0;
            if (iteratorKey4) {
                if (iterable === null || iterable === void 0) throw new TypeError("object is not iterable");
                var method = iterable[iteratorKey4];
                if (typeof method !== "function") throw new TypeError("object is not iterable");
                var iterator = method.call(iterable);
                if (!isObject8(iterator)) throw new TypeError("Result of the Symbol.iterator method is not an object");
                record = {
                    iterator: iterator,
                    next: iterator.next,
                    arrayLike: null,
                    index: 0,
                    done: false
                };
            } else {
                if (iterable === null || iterable === void 0 || typeof iterable.length !== "number") {
                    throw new TypeError("object is not iterable");
                }
                record = {
                    iterator: null,
                    next: null,
                    arrayLike: iterable,
                    index: 0,
                    done: false
                };
            }
            var state = {
                errors: /* @__PURE__ */ Object.create(null),
                count: 0,
                remaining: 1,
                capability: capability
            };
            for(;;){
                var value = stepValue2(record);
                if (value === DONE2) {
                    if (--state.remaining === 0) capability.reject(makeAggregateError(arrayFromList2(state.errors, state.count)));
                    return capability.promise;
                }
                var index = state.count++;
                state.errors[index] = void 0;
                var nextPromise = promiseResolve2.call(C, value);
                state.remaining++;
                subscribeElement2(state, index, nextPromise);
            }
        } catch (error) {
            if (record !== null && !record.done && record.iterator !== null) closeIterator8(record.iterator);
            capability.reject(error);
            return capability.promise;
        }
    };
    // src/modules/es.promise.finally.ts
    var isSupported154 = function isSupported154() {
        try {
            if (typeof Promise === "undefined" || typeof Promise.prototype.finally !== "function") return false;
            Promise.prototype.finally.call({
                then: function then() {}
            }, function() {});
            return true;
        } catch (unused) {
            return false;
        }
    };
    var isObject9 = function isObject9(value) {
        return value !== null && (typeof value === "object" || typeof value === "function");
    };
    var hasOwn13 = Object.prototype.hasOwnProperty;
    var arrowWrap3 = null;
    try {
        arrowWrap3 = new Function("f", "return (x) => f(x)");
    } catch (e) {}
    var builtinClosure3 = function builtinClosure3(fn) {
        return arrowWrap3 ? arrowWrap3(fn) : function(x) {
            return fn(x);
        };
    };
    var promiseResolve = function promiseResolve(C, x, Intrinsic) {
        if (typeof Intrinsic === "function" && x instanceof Intrinsic && x.constructor === C) return x;
        return new C(function(resolve) {
            resolve(x);
        });
    };
    var promiseFinally = function promiseFinally(onFinally) {
        var promise = this;
        if (!isObject9(promise)) {
            throw new TypeError("Promise.prototype.finally called on a non-object");
        }
        var Default = window.Promise;
        var C = promise.constructor;
        if (C === void 0) {
            C = Default;
        } else {
            if (!isObject9(C)) {
                throw new TypeError("Promise constructor is not an object");
            }
            var speciesKey = typeof Symbol !== "undefined" ? Symbol.species : void 0;
            var species = speciesKey ? C[speciesKey] : void 0;
            if (species === void 0 || species === null) C = Default;
            else if (typeof species === "function" && (hasOwn13.call(species, "prototype") || /^bound /.test(species.name || ""))) C = species;
            else throw new TypeError("Promise @@species is not a constructor");
        }
        if (typeof onFinally !== "function") {
            return promise.then(onFinally, onFinally);
        }
        var thenFinally = builtinClosure3(function(value) {
            var p = promiseResolve(C, onFinally(), Default);
            return p.then(function() {
                return value;
            });
        });
        var catchFinally = builtinClosure3(function(reason) {
            var p = promiseResolve(C, onFinally(), Default);
            return p.then(function() {
                throw reason;
            });
        });
        return promise.then(thenFinally, catchFinally);
    };
    // src/modules/es.promise.try.ts
    var isSupported155 = function isSupported155() {
        try {
            if (typeof Promise === "undefined" || typeof Promise.try !== "function") return false;
            var argument;
            var p = Promise.resolve();
            return Promise.try(function(a) {
                argument = a;
                return p;
            }, 8) === p && argument === 8;
        } catch (unused) {
            return false;
        }
    };
    var isObject10 = function isObject10(value) {
        return value !== null && (typeof value === "object" || typeof value === "function");
    };
    var hasOwn14 = Object.prototype.hasOwnProperty;
    var newPromiseCapability2 = function newPromiseCapability2(C) {
        if (!(typeof C === "function" && (hasOwn14.call(C, "prototype") || /^bound /.test(C.name || "")))) {
            throw new TypeError("Promise capability: not a constructor");
        }
        var capability = {
            promise: void 0,
            resolve: void 0,
            reject: void 0
        };
        var executor = function executor(resolve, reject) {
            if (capability.resolve !== void 0) throw new TypeError("Promise executor has already been invoked with non-undefined arguments");
            if (capability.reject !== void 0) throw new TypeError("Promise executor has already been invoked with non-undefined arguments");
            capability.resolve = resolve;
            capability.reject = reject;
        };
        capability.promise = new C(executor);
        if (typeof capability.resolve !== "function") throw new TypeError("Promise resolve function is not callable");
        if (typeof capability.reject !== "function") throw new TypeError("Promise reject function is not callable");
        return capability;
    };
    var promiseTry = function promiseTry(callbackfn) {
        var C = this;
        if (!isObject10(C)) throw new TypeError("Promise.try called on a non-object");
        var argCount = arguments.length;
        var value;
        try {
            if (typeof callbackfn !== "function") throw new TypeError("Promise.try callback is not a function");
            if (argCount <= 1) {
                value = callbackfn();
            } else {
                var args = [];
                for(var i = 1; i < argCount; i++)args[i - 1] = arguments[i];
                value = callbackfn.apply(void 0, args);
            }
        } catch (error) {
            var rejected = newPromiseCapability2(C);
            rejected.reject(error);
            return rejected.promise;
        }
        if (isObject10(value) && value.constructor === C) return value;
        var capability = newPromiseCapability2(C);
        capability.resolve(value);
        return capability.promise;
    };
    // src/modules/es.promise.with-resolvers.ts
    var isSupported156 = function isSupported156() {
        try {
            return typeof Promise !== "undefined" && typeof Promise.withResolvers === "function";
        } catch (unused) {
            return false;
        }
    };
    var hasOwn15 = Object.prototype.hasOwnProperty;
    var promiseWithResolvers = function withResolvers() {
        var C = this;
        if (!(typeof C === "function" && (hasOwn15.call(C, "prototype") || /^bound /.test(C.name || "")))) {
            throw new TypeError("Promise capability: not a constructor");
        }
        var capability = {
            promise: void 0,
            resolve: void 0,
            reject: void 0
        };
        var executor = function executor(resolve, reject) {
            if (capability.resolve !== void 0) throw new TypeError("Promise executor has already been invoked with non-undefined arguments");
            if (capability.reject !== void 0) throw new TypeError("Promise executor has already been invoked with non-undefined arguments");
            capability.resolve = resolve;
            capability.reject = reject;
        };
        capability.promise = new C(executor);
        if (typeof capability.resolve !== "function") throw new TypeError("Promise resolve function is not callable");
        if (typeof capability.reject !== "function") throw new TypeError("Promise reject function is not callable");
        return {
            promise: capability.promise,
            resolve: capability.resolve,
            reject: capability.reject
        };
    };
    // src/modules/install-dom-exception.ts
    var isSupported157 = function isSupported157() {
        try {
            var exception = new DOMException("test");
            return exception instanceof DOMException;
        } catch (unused) {
            return false;
        }
    };
    var DOMEXCEPTION_CODES = {
        IndexSizeError: 1,
        HierarchyRequestError: 3,
        WrongDocumentError: 4,
        InvalidCharacterError: 5,
        NoModificationAllowedError: 7,
        NotFoundError: 8,
        NotSupportedError: 9,
        InUseAttributeError: 10,
        InvalidStateError: 11,
        SyntaxError: 12,
        InvalidModificationError: 13,
        NamespaceError: 14,
        InvalidAccessError: 15,
        TypeMismatchError: 17,
        SecurityError: 18,
        NetworkError: 19,
        AbortError: 20,
        URLMismatchError: 21,
        QuotaExceededError: 22,
        TimeoutError: 23,
        InvalidNodeTypeError: 24,
        DataCloneError: 25
    };
    var NAME = "_domName";
    var MESSAGE = "_domMessage";
    var CODE = "_domCode";
    var hasOwn16 = Object.prototype.hasOwnProperty;
    function DOMExceptionPolyfill(message, name) {
        if (!(this instanceof DOMExceptionPolyfill)) {
            throw new TypeError("Failed to construct 'DOMException': Please use the 'new' operator");
        }
        var errorMessage = message === void 0 ? "" : "" + message;
        var errorName = name === void 0 ? "Error" : "" + name;
        var err = Error.call(this, errorMessage);
        SLOT9.value = errorMessage;
        Object.defineProperty(this, MESSAGE, SLOT9);
        SLOT9.value = errorName;
        Object.defineProperty(this, NAME, SLOT9);
        SLOT9.value = hasOwn16.call(DOMEXCEPTION_CODES, errorName) ? DOMEXCEPTION_CODES[errorName] : 0;
        Object.defineProperty(this, CODE, SLOT9);
        SLOT9.value = void 0;
        if (err.stack) {
            SLOT9.value = err.stack;
            Object.defineProperty(this, "stack", SLOT9);
            SLOT9.value = void 0;
        }
    }
    var SLOT9 = {
        value: void 0,
        writable: true,
        enumerable: false,
        configurable: true
    };
    var CONSTANTS = [
        "INDEX_SIZE_ERR",
        "DOMSTRING_SIZE_ERR",
        "HIERARCHY_REQUEST_ERR",
        "WRONG_DOCUMENT_ERR",
        "INVALID_CHARACTER_ERR",
        "NO_DATA_ALLOWED_ERR",
        "NO_MODIFICATION_ALLOWED_ERR",
        "NOT_FOUND_ERR",
        "NOT_SUPPORTED_ERR",
        "INUSE_ATTRIBUTE_ERR",
        "INVALID_STATE_ERR",
        "SYNTAX_ERR",
        "INVALID_MODIFICATION_ERR",
        "NAMESPACE_ERR",
        "INVALID_ACCESS_ERR",
        "VALIDATION_ERR",
        "TYPE_MISMATCH_ERR",
        "SECURITY_ERR",
        "NETWORK_ERR",
        "ABORT_ERR",
        "URL_MISMATCH_ERR",
        "QUOTA_EXCEEDED_ERR",
        "TIMEOUT_ERR",
        "INVALID_NODE_TYPE_ERR",
        "DATA_CLONE_ERR"
    ];
    var makeGetter = function makeGetter(slot, nativeGet) {
        return function() {
            if (this !== null && typeof this === "object" && hasOwn16.call(this, CODE)) return this[slot];
            if (nativeGet) return nativeGet.call(this);
            throw new TypeError("Illegal invocation");
        };
    };
    var KEYS = [
        "name",
        "message",
        "code"
    ];
    var SLOTS = [
        NAME,
        MESSAGE,
        CODE
    ];
    var defineShape = function defineShape(proto2, replaced) {
        for(var i = 0; i < KEYS.length; i++){
            var previous = Object.getOwnPropertyDescriptor(proto2, KEYS[i]);
            replaced.push(previous);
            Object.defineProperty(proto2, KEYS[i], {
                get: makeGetter(SLOTS[i], previous && previous.get),
                enumerable: true,
                configurable: true
            });
        }
    };
    var defineStatics = function defineStatics(proto2) {
        for(var i = 0; i < CONSTANTS.length; i++){
            var descriptor = {
                value: i + 1,
                writable: false,
                enumerable: true,
                configurable: false
            };
            if (!hasOwn16.call(DOMExceptionPolyfill, CONSTANTS[i])) Object.defineProperty(DOMExceptionPolyfill, CONSTANTS[i], descriptor);
            if (!hasOwn16.call(proto2, CONSTANTS[i])) {
                try {
                    Object.defineProperty(proto2, CONSTANTS[i], descriptor);
                } catch (e) {}
            }
        }
        var tag = typeof Symbol !== "undefined" ? Symbol.toStringTag : void 0;
        if (tag && !hasOwn16.call(proto2, tag)) {
            try {
                Object.defineProperty(proto2, tag, {
                    value: "DOMException",
                    writable: false,
                    enumerable: false,
                    configurable: true
                });
            } catch (e) {}
        }
    };
    DOMExceptionPolyfill.prototype = Object.create(Error.prototype);
    Object.defineProperty(DOMExceptionPolyfill.prototype, "constructor", {
        value: DOMExceptionPolyfill,
        writable: true,
        enumerable: false,
        configurable: true
    });
    defineShape(DOMExceptionPolyfill.prototype, []);
    var installDomException = function installDomException() {
        var own4 = Object.getOwnPropertyDescriptor(DOMExceptionPolyfill, "prototype");
        if (own4 && own4.writable) {
            var native = window.DOMException;
            if (native && native.prototype) {
                var ownProto = DOMExceptionPolyfill.prototype;
                var nativeProto = native.prototype;
                var replaced = [];
                try {
                    defineShape(nativeProto, replaced);
                    DOMExceptionPolyfill.prototype = nativeProto;
                    var probe = new DOMExceptionPolyfill("m", "SyntaxError");
                    if (probe.message !== "m" || probe.name !== "SyntaxError" || probe.code !== 12) throw 0;
                    String(probe);
                } catch (e) {
                    for(var i = 0; i < replaced.length; i++){
                        try {
                            if (replaced[i]) Object.defineProperty(nativeProto, KEYS[i], replaced[i]);
                            else delete nativeProto[KEYS[i]];
                        } catch (e2) {}
                    }
                    DOMExceptionPolyfill.prototype = ownProto;
                }
            }
            defineStatics(DOMExceptionPolyfill.prototype);
            Object.defineProperty(DOMExceptionPolyfill, "prototype", {
                writable: false
            });
        }
        window.DOMException = null;
        delete window.DOMException;
        define(window, "DOMException", DOMExceptionPolyfill);
    };
    // src/modules/install-set-immediate.ts
    var isSupported158 = function isSupported158() {
        try {
            return typeof window.setImmediate === "function";
        } catch (unused) {
            return false;
        }
    };
    var fns = [];
    var argsQ = [];
    var head = 0;
    var baseHandle = 1;
    var post = null;
    var warnedStringCallback = false;
    var runNext = function runNext() {
        if (head >= fns.length) return;
        var fn = fns[head];
        var args = argsQ[head];
        fns[head] = void 0;
        argsQ[head] = void 0;
        head++;
        if (head === fns.length) {
            fns.length = 0;
            argsQ.length = 0;
            baseHandle += head;
            head = 0;
        } else if (head > 1024) {
            var rest = fns.length - head;
            for(var i = 0; i < rest; i++){
                fns[i] = fns[head + i];
                argsQ[i] = argsQ[head + i];
            }
            fns.length = rest;
            argsQ.length = rest;
            baseHandle += head;
            head = 0;
        }
        if (fn) {
            if (args === void 0) fn();
            else fn.apply(void 0, args);
        }
    };
    var makePost = function makePost() {
        var w = window;
        if (w.MessageChannel && (typeof w.MessageChannel === "function" || typeof w.MessageChannel === "object")) {
            var channel = new w.MessageChannel();
            channel.port1.onmessage = runNext;
            return function() {
                channel.port2.postMessage(0);
            };
        }
        return function() {
            setTimeout(runNext, 0);
        };
    };
    var setImmediate = function setImmediate(callback) {
        if (typeof callback !== "function") {
            if (!warnedStringCallback) {
                warnedStringCallback = true;
                console.warn("[spackle] setImmediate: non-function callbacks (string eval form) are not implemented");
            }
            return 0;
        }
        var slot = fns.length;
        fns[slot] = callback;
        if (arguments.length > 1) {
            var args = [];
            for(var i = 1; i < arguments.length; i++)args[i - 1] = arguments[i];
            argsQ[slot] = args;
        } else {
            argsQ[slot] = void 0;
        }
        if (post === null) post = makePost();
        post();
        return baseHandle + slot;
    };
    var clearImmediate = function clearImmediate(handle) {
        var slot = handle - baseHandle;
        if (slot >= head && slot < fns.length) {
            fns[slot] = void 0;
            argsQ[slot] = void 0;
        }
    };
    var installSetImmediate = function installSetImmediate() {
        define(window, "setImmediate", setImmediate);
        define(window, "clearImmediate", clearImmediate);
    };
    // src/modules/web.atob.ts
    var isSupported159 = function isSupported159() {
        try {
            if (typeof atob !== "function") {
                return false;
            }
            if (atob("aGk=") !== "hi") {
                return false;
            }
            if (atob(" a G k = ") !== "hi") {
                return false;
            }
            try {
                atob("a");
                return false;
            } catch (unused) {}
            return true;
        } catch (unused) {
            return false;
        }
    };
    var ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    var RE_WHITESPACE = /[\t\n\f\r ]/g;
    var RE_PADDING = /==?$/;
    var RE_NOT_BASE64 = /[^+/0-9A-Za-z]/;
    var atobPolyfill = function atobPolyfill(data) {
        if (arguments.length === 0) throw new TypeError("Failed to execute 'atob' on 'Window': 1 argument required, but only 0 present.");
        var input = String(data).replace(RE_WHITESPACE, "");
        if (input.length % 4 === 0) {
            input = input.replace(RE_PADDING, "");
        }
        if (input.length % 4 === 1 || RE_NOT_BASE64.test(input)) {
            var message = "Failed to execute 'atob': The string to be decoded is not correctly encoded.";
            if (typeof DOMException === "function") {
                throw new DOMException(message, "InvalidCharacterError");
            } else {
                var error = new Error(message);
                error.name = "InvalidCharacterError";
                throw error;
            }
        }
        var output = "";
        var bitStorage = 0;
        var bitCounter = 0;
        for(var i = 0; i < input.length; i++){
            var index = ALPHABET.indexOf(input.charAt(i));
            bitStorage = bitCounter % 4 ? bitStorage * 64 + index : index;
            if (bitCounter++ % 4) {
                output += String.fromCharCode(255 & bitStorage >> (-2 * bitCounter & 6));
            }
        }
        return output;
    };
    // src/modules/web.queue-microtask.ts
    var isSupported160 = function isSupported160() {
        try {
            var qm = window.queueMicrotask;
            return typeof qm === "function" && qm.length === 1 && /\[native code\]/.test(Function.prototype.toString.call(qm));
        } catch (unused) {
            return false;
        }
    };
    var NativePromise = typeof Promise === "function" && typeof Promise.resolve === "function" && /\[native code\]/.test(Function.prototype.toString.call(Promise)) ? Promise : null;
    var nativeThen = NativePromise && NativePromise.prototype && NativePromise.prototype.then;
    var CAPACITY = 1024;
    var queue = [];
    var head2 = 0;
    var scheduled = false;
    var fast = null;
    var runCallback = function runCallback(callback) {
        try {
            callback();
        } catch (error) {
            setTimeout(function() {
                throw error;
            }, 0);
        }
    };
    var drain = function drain() {
        scheduled = false;
        while(head2 < queue.length){
            var callback = queue[head2];
            queue[head2] = void 0;
            head2++;
            runCallback(callback);
            if (head2 > CAPACITY) {
                var rest = queue.length - head2;
                for(var i = 0; i < rest; i++)queue[i] = queue[head2 + i];
                queue.length = rest;
                head2 = 0;
            }
        }
        queue.length = 0;
        head2 = 0;
    };
    var makeFast = function makeFast() {
        var w = window;
        var MO = w.MutationObserver || w.WebKitMutationObserver;
        var ua = w.navigator && w.navigator.userAgent || "";
        var brokenObserver = /(?:ipad|iphone|ipod).*applewebkit/i.test(ua) || /web0s(?!.*chrome)/i.test(ua);
        if (typeof nativeThen === "function") {
            var resolved = NativePromise.resolve(void 0);
            resolved.constructor = NativePromise;
            fast = function fast() {
                nativeThen.call(resolved, drain);
            };
        } else if (MO && w.document && !brokenObserver) {
            var toggle = true;
            var node = w.document.createTextNode("");
            new MO(drain).observe(node, {
                characterData: true
            });
            fast = function fast() {
                toggle = !toggle;
                node.data = toggle ? "1" : "0";
            };
        } else {
            fast = function fast() {
                setTimeout(drain, 0);
            };
        }
    };
    var queueMicrotask = function queueMicrotask(callback) {
        if (typeof callback !== "function") {
            throw new TypeError("queueMicrotask requires a function argument");
        }
        queue[queue.length] = callback;
        if (scheduled) {
            return;
        }
        scheduled = true;
        if (fast === null) makeFast();
        fast();
    };
    // src/modules/web.self.ts
    var isSupported161 = function isSupported161() {
        try {
            return typeof window === "undefined" || window.self === window;
        } catch (unused) {
            return true;
        }
    };
    var install32 = function install32() {
        if (typeof window !== "undefined") {
            try {
                window.self = window;
            } catch (unused) {}
        }
    };
    // src/modules/web.url-search-params.delete.ts
    var isSupported162 = function isSupported162() {
        try {
            if (typeof URLSearchParams === "undefined") {
                return true;
            }
            var params = new URLSearchParams("a=1&a=2");
            params.delete("a", "1");
            return params.toString() === "a=2";
        } catch (unused) {
            return false;
        }
    };
    var nativeDelete = function nativeDelete() {
        var Ctor = window.URLSearchParams;
        return Ctor && Ctor.prototype ? Ctor.prototype.delete : void 0;
    };
    var originalDelete;
    var urlSearchParamsDelete = function urlSearchParamsDelete(name, value) {
        var remove = originalDelete || nativeDelete();
        if (!remove) {
            throw new TypeError("URLSearchParams.prototype.delete is not available");
        }
        if (value === void 0) {
            remove.call(this, name);
            return;
        }
        var key = String(name);
        var unwanted = String(value);
        var survivors = [];
        var names = [];
        this.forEach(function(pairValue, pairName) {
            if (pairName !== key || pairValue !== unwanted) {
                survivors.push([
                    pairName,
                    pairValue
                ]);
            }
            if (names.indexOf(pairName) === -1) {
                names.push(pairName);
            }
        });
        for(var i = 0; i < names.length; i++){
            remove.call(this, names[i]);
        }
        for(var i1 = 0; i1 < survivors.length; i1++){
            this.append(survivors[i1][0], survivors[i1][1]);
        }
    };
    var install33 = function install33() {
        originalDelete = nativeDelete();
        if (originalDelete) {
            define(URLSearchParams.prototype, "delete", urlSearchParamsDelete);
        }
    };
    // src/modules/web.url-search-params.has.ts
    var isSupported163 = function isSupported163() {
        try {
            if (typeof URLSearchParams === "undefined") {
                return true;
            }
            return new URLSearchParams("a=1").has("a", "2") === false;
        } catch (unused) {
            return false;
        }
    };
    var nativeHas = function nativeHas() {
        var Ctor = window.URLSearchParams;
        return Ctor && Ctor.prototype ? Ctor.prototype.has : void 0;
    };
    var originalHas;
    var urlSearchParamsHas = function urlSearchParamsHas(name, value) {
        if (value === void 0) {
            var has3 = originalHas || nativeHas();
            if (!has3) {
                throw new TypeError("URLSearchParams.prototype.has is not available");
            }
            return has3.call(this, name);
        }
        var key = String(name);
        var wanted = String(value);
        var found = false;
        this.forEach(function(pairValue, pairName) {
            if (!found && pairName === key && pairValue === wanted) {
                found = true;
            }
        });
        return found;
    };
    var install34 = function install34() {
        originalHas = nativeHas();
        if (originalHas) {
            define(URLSearchParams.prototype, "has", urlSearchParamsHas);
        }
    };
    // src/modules/web.url-search-params.size.ts
    var isSupported164 = function isSupported164() {
        try {
            if (typeof URLSearchParams === "undefined") {
                return true;
            }
            return new URLSearchParams("a=1&a=2").size === 2;
        } catch (unused) {
            return false;
        }
    };
    var urlSearchParamsSizeGetter = function urlSearchParamsSizeGetter() {
        var count = 0;
        this.forEach(function() {
            count++;
        });
        return count;
    };
    var install35 = function install35() {
        if (typeof URLSearchParams !== "undefined" && URLSearchParams.prototype) {
            defineGetter(URLSearchParams.prototype, "size", urlSearchParamsSizeGetter);
        }
    };
    // src/modules/web.url.can-parse.ts
    var isSupported165 = function isSupported165() {
        try {
            if (typeof URL === "undefined") return true;
            var canParse4 = URL.canParse;
            if (typeof canParse4 !== "function" || canParse4.length !== 1) return false;
            try {
                canParse4();
            } catch (e) {
                return true;
            }
            return false;
        } catch (unused) {
            return true;
        }
    };
    var urlCanParse = function canParse3(url) {
        if (arguments.length < 1) throw new TypeError("Failed to execute 'canParse' on 'URL': 1 argument required, but only 0 present.");
        var base = arguments[1];
        try {
            if (base === void 0) {
                new URL(String(url));
            } else {
                new URL(String(url), String(base));
            }
            return true;
        } catch (unused) {
            return false;
        }
    };
    // src/modules/web.url.parse.ts
    var isSupported166 = function isSupported166() {
        try {
            return typeof URL === "undefined" || typeof URL.parse === "function";
        } catch (unused) {
            return true;
        }
    };
    var urlParse = function urlParse(url, base) {
        try {
            return base === void 0 ? new URL(String(url)) : new URL(String(url), String(base));
        } catch (unused) {
            return null;
        }
    };
    // src/modules/web.url.to-json.ts
    var isSupported167 = function isSupported167() {
        try {
            return typeof URL === "undefined" || !URL.prototype || typeof URL.prototype.toJSON === "function";
        } catch (unused) {
            return true;
        }
    };
    var urlToJSON = function urlToJSON() {
        return this.href;
    };
    // src/modules/install-reflect.ts
    var isSupported168 = function isSupported168() {
        try {
            var Native = window.Reflect;
            return typeof Native !== "undefined";
        } catch (unused) {
            return false;
        }
    };
    var hasOwn17 = Object.prototype.hasOwnProperty;
    var getOwnDesc2 = Object.getOwnPropertyDescriptor;
    var defineProp2 = Object.defineProperty;
    var getProto2 = Object.getPrototypeOf || function(o) {
        return o.__proto__ || null;
    };
    var setProto3 = Object.setPrototypeOf || function(o, proto2) {
        o.__proto__ = proto2;
        return o;
    };
    var MAX_CHAIN2 = 100;
    var isObject11 = function isObject11(value) {
        return value !== null && (typeof value === "object" || typeof value === "function");
    };
    var requireObject = function requireObject(target, method) {
        if (!isObject11(target)) throw new TypeError("Reflect." + method + " called on non-object");
    };
    var toPropertyKey = function toPropertyKey(key) {
        if (isObject11(key)) {
            var toPrimitive = typeof Symbol !== "undefined" && Symbol.toPrimitive ? key[Symbol.toPrimitive] : void 0;
            var primitive;
            if (toPrimitive !== void 0 && toPrimitive !== null) {
                primitive = toPrimitive.call(key, "string");
                if (isObject11(primitive)) throw new TypeError("Cannot convert object to primitive value");
            } else {
                var toStringFn = key.toString;
                if (typeof toStringFn === "function") primitive = toStringFn.call(key);
                if (typeof toStringFn !== "function" || isObject11(primitive)) {
                    var valueOfFn = key.valueOf;
                    if (typeof valueOfFn === "function") primitive = valueOfFn.call(key);
                    if (typeof valueOfFn !== "function" || isObject11(primitive)) {
                        throw new TypeError("Cannot convert object to primitive value");
                    }
                }
            }
            key = primitive;
        }
        return typeof key === "symbol" ? key : String(key);
    };
    var listFromArrayLike = function listFromArrayLike(argumentsList) {
        if (!isObject11(argumentsList)) throw new TypeError("CreateListFromArrayLike called on non-object");
        var length = +argumentsList.length;
        length = length !== length || length <= 0 ? 0 : length > 9007199254740991 ? 9007199254740991 : Math.floor(length);
        var list = new Array(length);
        for(var i = 0; i < length; i++)list[i] = argumentsList[i];
        return list;
    };
    var isConstructor6 = function isConstructor6(C) {
        return typeof C === "function" && (hasOwn17.call(C, "prototype") || /^bound /.test(C.name || ""));
    };
    var nativeCodeRe = /\[native code\]/;
    var fnToString = Function.prototype.toString;
    var toPropertyDescriptor = function toPropertyDescriptor(attributes) {
        if (!isObject11(attributes)) throw new TypeError("Property description must be an object");
        var desc = {};
        if ("enumerable" in attributes) desc.enumerable = !!attributes.enumerable;
        if ("configurable" in attributes) desc.configurable = !!attributes.configurable;
        if ("value" in attributes) desc.value = attributes.value;
        if ("writable" in attributes) desc.writable = !!attributes.writable;
        if ("get" in attributes) {
            var getter = attributes.get;
            if (getter !== void 0 && typeof getter !== "function") throw new TypeError("Getter must be a function");
            desc.get = getter;
        }
        if ("set" in attributes) {
            var setter = attributes.set;
            if (setter !== void 0 && typeof setter !== "function") throw new TypeError("Setter must be a function");
            desc.set = setter;
        }
        if (("get" in desc || "set" in desc) && ("value" in desc || "writable" in desc)) {
            throw new TypeError("Invalid property descriptor. Cannot both specify accessors and a value or writable attribute");
        }
        return desc;
    };
    var ordinarySet = function ordinarySet(target, key, value, receiver) {
        var ownDesc = getOwnDesc2(target, key);
        var steps = 0;
        while(ownDesc === void 0){
            var parent = getProto2(target);
            if (parent === null || ++steps > MAX_CHAIN2) {
                ownDesc = {
                    value: void 0,
                    writable: true,
                    enumerable: true,
                    configurable: true
                };
                break;
            }
            target = parent;
            ownDesc = getOwnDesc2(target, key);
        }
        if ("value" in ownDesc || "writable" in ownDesc) {
            if (!ownDesc.writable || !isObject11(receiver)) return false;
            var existing = getOwnDesc2(receiver, key);
            if (existing !== void 0) {
                if (existing.get !== void 0 || existing.set !== void 0 || !("value" in existing)) return false;
                if (!existing.writable) return false;
                try {
                    defineProp2(receiver, key, {
                        value: value
                    });
                    return true;
                } catch (unused) {
                    return false;
                }
            }
            try {
                defineProp2(receiver, key, {
                    value: value,
                    writable: true,
                    enumerable: true,
                    configurable: true
                });
                return true;
            } catch (unused) {
                return false;
            }
        }
        if (ownDesc.set === void 0) return false;
        ownDesc.set.call(receiver, value);
        return true;
    };
    var methods = {
        apply: function apply(target, thisArgument, argumentsList) {
            if (typeof target !== "function") throw new TypeError("Reflect.apply target is not callable");
            return Function.prototype.apply.call(target, thisArgument, listFromArrayLike(argumentsList));
        },
        // Declared (target, argumentsList) for the spec length of 2; newTarget from arguments.
        construct: function construct(target, argumentsList) {
            if (!isConstructor6(target)) throw new TypeError("Reflect.construct target is not a constructor");
            var newTarget = arguments.length > 2 ? arguments[2] : target;
            if (!isConstructor6(newTarget)) throw new TypeError("Reflect.construct newTarget is not a constructor");
            var args = listFromArrayLike(argumentsList);
            if (newTarget === target || nativeCodeRe.test(fnToString.call(target))) {
                var boundArgs = [
                    null
                ];
                for(var i = 0; i < args.length; i++)boundArgs[i + 1] = args[i];
                var Bound = Function.prototype.bind.apply(target, boundArgs);
                var instance = new Bound();
                if (newTarget !== target) {
                    var proto3 = newTarget.prototype;
                    if (isObject11(proto3)) setProto3(instance, proto3);
                }
                return instance;
            }
            var proto2 = newTarget.prototype;
            if (!isObject11(proto2)) proto2 = Object.prototype;
            var object = Object.create(proto2);
            var result = target.apply(object, args);
            return isObject11(result) ? result : object;
        },
        defineProperty: function defineProperty2(target, key, attributes) {
            requireObject(target, "defineProperty");
            var propertyKey = toPropertyKey(key);
            var desc = toPropertyDescriptor(attributes);
            try {
                defineProp2(target, propertyKey, desc);
                return true;
            } catch (e) {
                return false;
            }
        },
        deleteProperty: function deleteProperty(target, key) {
            requireObject(target, "deleteProperty");
            var propertyKey = toPropertyKey(key);
            try {
                return delete target[propertyKey];
            } catch (e) {
                return false;
            }
        },
        // Declared (target, propertyKey) for the spec length of 2; receiver from arguments.
        get: function get2(target, key) {
            requireObject(target, "get");
            var propertyKey = toPropertyKey(key);
            var receiver = arguments.length > 2 ? arguments[2] : target;
            var owner = target;
            var steps = 0;
            while(owner !== null && owner !== void 0){
                var desc = getOwnDesc2(owner, propertyKey);
                if (desc !== void 0) {
                    if ("value" in desc || "writable" in desc) return desc.value;
                    return desc.get === void 0 ? void 0 : desc.get.call(receiver);
                }
                if (++steps > MAX_CHAIN2) break;
                owner = getProto2(owner);
            }
            return void 0;
        },
        getOwnPropertyDescriptor: function getOwnPropertyDescriptor(target, key) {
            requireObject(target, "getOwnPropertyDescriptor");
            return getOwnDesc2(target, toPropertyKey(key));
        },
        getPrototypeOf: function getPrototypeOf(target) {
            requireObject(target, "getPrototypeOf");
            return getProto2(target);
        },
        has: function has2(target, key) {
            requireObject(target, "has");
            return toPropertyKey(key) in target;
        },
        isExtensible: function isExtensible(target) {
            requireObject(target, "isExtensible");
            return Object.isExtensible(target);
        },
        ownKeys: function ownKeys3(target) {
            requireObject(target, "ownKeys");
            var keys3 = Object.getOwnPropertyNames(target);
            if (typeof Object.getOwnPropertySymbols === "function") {
                var symbols = Object.getOwnPropertySymbols(target);
                for(var i = 0; i < symbols.length; i++)keys3.push(symbols[i]);
            }
            return keys3;
        },
        preventExtensions: function preventExtensions(target) {
            requireObject(target, "preventExtensions");
            Object.preventExtensions(target);
            return true;
        },
        // Declared (target, propertyKey, V) for the spec length of 3; receiver from arguments.
        set: function set2(target, key, value) {
            requireObject(target, "set");
            var propertyKey = toPropertyKey(key);
            return ordinarySet(target, propertyKey, value, arguments.length > 3 ? arguments[3] : target);
        },
        setPrototypeOf: function setPrototypeOf(target, proto2) {
            requireObject(target, "setPrototypeOf");
            if (proto2 !== null && !isObject11(proto2)) throw new TypeError("Object prototype may only be an Object or null");
            var current = getProto2(target);
            if (current === proto2) return true;
            if (!Object.isExtensible(target)) return false;
            var steps = 0;
            for(var p = proto2; p !== null && p !== void 0 && ++steps <= MAX_CHAIN2; p = getProto2(p)){
                if (p === target) return false;
            }
            try {
                setProto3(target, proto2);
            } catch (e) {
                return false;
            }
            return getProto2(target) === proto2;
        }
    };
    var Reflect2 = {};
    for(var name3 in methods){
        if (!hasOwn17.call(methods, name3)) continue;
        try {
            defineProp2(methods[name3], "name", {
                value: name3,
                configurable: true
            });
        } catch (e) {}
        defineProp2(methods[name3], "__polyfilled", {
            value: true
        });
        defineProp2(Reflect2, name3, {
            value: methods[name3],
            writable: true,
            enumerable: false,
            configurable: true
        });
    }
    var installReflect = function installReflect() {
        Object.defineProperty(window, "Reflect", {
            value: Reflect2,
            writable: true,
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Reflect2, "__polyfilled", {
            value: true
        });
    };
    // src/modules/install-set-methods.ts
    var SetCtor;
    var proto;
    var sizeGetter;
    var hasFn;
    var addFn;
    var keysFn;
    var bind = function bind() {
        SetCtor = typeof Set !== "undefined" ? Set : null;
        proto = SetCtor ? SetCtor.prototype : null;
        var sizeDescriptor = proto && Object.getOwnPropertyDescriptor(proto, "size");
        sizeGetter = sizeDescriptor ? sizeDescriptor.get : null;
        hasFn = proto ? proto.has : null;
        addFn = proto ? proto.add : null;
        keysFn = proto ? proto.keys : null;
    };
    var setUnion = function union(other) {
        if (proto === void 0) bind();
        hasFn.call(this);
        var O = this;
        if (other === null || typeof other !== "object" && typeof other !== "function") {
            throw new TypeError("Set-like is not an object");
        }
        var rawSize = +other.size;
        if (rawSize !== rawSize) throw new TypeError("Invalid size");
        var intSize = rawSize === 0 ? 0 : rawSize > 0 ? Math.floor(rawSize) : Math.ceil(rawSize);
        if (intSize < 0) throw new RangeError("Invalid size");
        var otherHas = other.has;
        var otherKeys = other.keys;
        if (typeof otherHas !== "function") throw new TypeError("has is not callable");
        if (typeof otherKeys !== "function") throw new TypeError("keys is not callable");
        var result = new SetCtor();
        var cloneIterator = keysFn.call(O);
        var cloneNext = cloneIterator.next;
        var cloneStep;
        while(!(cloneStep = cloneNext.call(cloneIterator)).done)addFn.call(result, cloneStep.value);
        var recordIterator = otherKeys.call(other);
        if (recordIterator === null || typeof recordIterator !== "object") {
            throw new TypeError("keys() did not return an object");
        }
        var recordNext = recordIterator.next;
        var recordStep;
        while(!(recordStep = recordNext.call(recordIterator)).done){
            var value = recordStep.value;
            addFn.call(result, value);
        }
        return result;
    };
    var setIntersection = function intersection(other) {
        if (proto === void 0) bind();
        hasFn.call(this);
        var O = this;
        if (other === null || typeof other !== "object" && typeof other !== "function") {
            throw new TypeError("Set-like is not an object");
        }
        var rawSize = +other.size;
        if (rawSize !== rawSize) throw new TypeError("Invalid size");
        var intSize = rawSize === 0 ? 0 : rawSize > 0 ? Math.floor(rawSize) : Math.ceil(rawSize);
        if (intSize < 0) throw new RangeError("Invalid size");
        var otherSize = intSize;
        var otherHas = other.has;
        var otherKeys = other.keys;
        if (typeof otherHas !== "function") throw new TypeError("has is not callable");
        if (typeof otherKeys !== "function") throw new TypeError("keys is not callable");
        var result = new SetCtor();
        if (sizeGetter.call(O) > otherSize) {
            var recordIterator = otherKeys.call(other);
            if (recordIterator === null || typeof recordIterator !== "object") {
                throw new TypeError("keys() did not return an object");
            }
            var recordNext = recordIterator.next;
            var recordStep;
            while(!(recordStep = recordNext.call(recordIterator)).done){
                var value = recordStep.value;
                if (hasFn.call(O, value)) addFn.call(result, value);
            }
        } else {
            var ownIterator = keysFn.call(O);
            var ownNext = ownIterator.next;
            var ownStep;
            while(!(ownStep = ownNext.call(ownIterator)).done){
                var value1 = ownStep.value;
                if (otherHas.call(other, value1)) addFn.call(result, value1);
            }
        }
        return result;
    };
    var setDifference = function difference(other) {
        if (proto === void 0) bind();
        hasFn.call(this);
        var O = this;
        if (other === null || typeof other !== "object" && typeof other !== "function") {
            throw new TypeError("Set-like is not an object");
        }
        var rawSize = +other.size;
        if (rawSize !== rawSize) throw new TypeError("Invalid size");
        var intSize = rawSize === 0 ? 0 : rawSize > 0 ? Math.floor(rawSize) : Math.ceil(rawSize);
        if (intSize < 0) throw new RangeError("Invalid size");
        var otherSize = intSize;
        var otherHas = other.has;
        var otherKeys = other.keys;
        if (typeof otherHas !== "function") throw new TypeError("has is not callable");
        if (typeof otherKeys !== "function") throw new TypeError("keys is not callable");
        var result = new SetCtor();
        var cloneIterator = keysFn.call(O);
        var cloneNext = cloneIterator.next;
        var cloneStep;
        while(!(cloneStep = cloneNext.call(cloneIterator)).done)addFn.call(result, cloneStep.value);
        if (sizeGetter.call(result) <= otherSize) {
            var ownIterator = keysFn.call(result);
            var ownNext = ownIterator.next;
            var ownStep;
            while(!(ownStep = ownNext.call(ownIterator)).done){
                var value = ownStep.value;
                if (otherHas.call(other, value)) proto["delete"].call(result, value);
            }
        } else {
            var recordIterator = otherKeys.call(other);
            if (recordIterator === null || typeof recordIterator !== "object") {
                throw new TypeError("keys() did not return an object");
            }
            var recordNext = recordIterator.next;
            var recordStep;
            while(!(recordStep = recordNext.call(recordIterator)).done){
                var value1 = recordStep.value;
                if (hasFn.call(result, value1)) proto["delete"].call(result, value1);
            }
        }
        return result;
    };
    var setSymmetricDifference = function symmetricDifference(other) {
        if (proto === void 0) bind();
        hasFn.call(this);
        var O = this;
        if (other === null || typeof other !== "object" && typeof other !== "function") {
            throw new TypeError("Set-like is not an object");
        }
        var rawSize = +other.size;
        if (rawSize !== rawSize) throw new TypeError("Invalid size");
        var intSize = rawSize === 0 ? 0 : rawSize > 0 ? Math.floor(rawSize) : Math.ceil(rawSize);
        if (intSize < 0) throw new RangeError("Invalid size");
        var otherHas = other.has;
        var otherKeys = other.keys;
        if (typeof otherHas !== "function") throw new TypeError("has is not callable");
        if (typeof otherKeys !== "function") throw new TypeError("keys is not callable");
        var result = new SetCtor();
        var cloneIterator = keysFn.call(O);
        var cloneNext = cloneIterator.next;
        var cloneStep;
        while(!(cloneStep = cloneNext.call(cloneIterator)).done)addFn.call(result, cloneStep.value);
        var recordIterator = otherKeys.call(other);
        if (recordIterator === null || typeof recordIterator !== "object") {
            throw new TypeError("keys() did not return an object");
        }
        var recordNext = recordIterator.next;
        var recordStep;
        while(!(recordStep = recordNext.call(recordIterator)).done){
            var value = recordStep.value;
            if (hasFn.call(O, value)) proto["delete"].call(result, value);
            else addFn.call(result, value);
        }
        return result;
    };
    var setIsSubsetOf = function isSubsetOf(other) {
        if (proto === void 0) bind();
        hasFn.call(this);
        var O = this;
        if (other === null || typeof other !== "object" && typeof other !== "function") {
            throw new TypeError("Set-like is not an object");
        }
        var rawSize = +other.size;
        if (rawSize !== rawSize) throw new TypeError("Invalid size");
        var intSize = rawSize === 0 ? 0 : rawSize > 0 ? Math.floor(rawSize) : Math.ceil(rawSize);
        if (intSize < 0) throw new RangeError("Invalid size");
        var otherSize = intSize;
        var otherHas = other.has;
        var otherKeys = other.keys;
        if (typeof otherHas !== "function") throw new TypeError("has is not callable");
        if (typeof otherKeys !== "function") throw new TypeError("keys is not callable");
        if (sizeGetter.call(O) > otherSize) return false;
        var ownIterator = keysFn.call(O);
        var ownNext = ownIterator.next;
        var ownStep;
        while(!(ownStep = ownNext.call(ownIterator)).done){
            var value = ownStep.value;
            if (!otherHas.call(other, value)) return false;
        }
        return true;
    };
    var setIsSupersetOf = function isSupersetOf(other) {
        if (proto === void 0) bind();
        hasFn.call(this);
        var O = this;
        if (other === null || typeof other !== "object" && typeof other !== "function") {
            throw new TypeError("Set-like is not an object");
        }
        var rawSize = +other.size;
        if (rawSize !== rawSize) throw new TypeError("Invalid size");
        var intSize = rawSize === 0 ? 0 : rawSize > 0 ? Math.floor(rawSize) : Math.ceil(rawSize);
        if (intSize < 0) throw new RangeError("Invalid size");
        var otherSize = intSize;
        var otherHas = other.has;
        var otherKeys = other.keys;
        if (typeof otherHas !== "function") throw new TypeError("has is not callable");
        if (typeof otherKeys !== "function") throw new TypeError("keys is not callable");
        if (sizeGetter.call(O) < otherSize) return false;
        var recordIterator = otherKeys.call(other);
        if (recordIterator === null || typeof recordIterator !== "object") {
            throw new TypeError("keys() did not return an object");
        }
        var recordNext = recordIterator.next;
        var recordStep;
        while(!(recordStep = recordNext.call(recordIterator)).done){
            var value = recordStep.value;
            if (!hasFn.call(O, value)) {
                var ret = recordIterator.return;
                if (ret !== void 0 && ret !== null) {
                    if (typeof ret !== "function") throw new TypeError("iterator.return is not a function");
                    var closed = ret.call(recordIterator);
                    if (closed === null || typeof closed !== "object" && typeof closed !== "function") {
                        throw new TypeError("iterator.return() did not return an object");
                    }
                }
                return false;
            }
        }
        return true;
    };
    var setIsDisjointFrom = function isDisjointFrom(other) {
        if (proto === void 0) bind();
        hasFn.call(this);
        var O = this;
        if (other === null || typeof other !== "object" && typeof other !== "function") {
            throw new TypeError("Set-like is not an object");
        }
        var rawSize = +other.size;
        if (rawSize !== rawSize) throw new TypeError("Invalid size");
        var intSize = rawSize === 0 ? 0 : rawSize > 0 ? Math.floor(rawSize) : Math.ceil(rawSize);
        if (intSize < 0) throw new RangeError("Invalid size");
        var otherSize = intSize;
        var otherHas = other.has;
        var otherKeys = other.keys;
        if (typeof otherHas !== "function") throw new TypeError("has is not callable");
        if (typeof otherKeys !== "function") throw new TypeError("keys is not callable");
        if (sizeGetter.call(O) <= otherSize) {
            var ownIterator = keysFn.call(O);
            var ownNext = ownIterator.next;
            var ownStep;
            while(!(ownStep = ownNext.call(ownIterator)).done){
                var value = ownStep.value;
                if (otherHas.call(other, value)) return false;
            }
            return true;
        }
        var recordIterator = otherKeys.call(other);
        if (recordIterator === null || typeof recordIterator !== "object") {
            throw new TypeError("keys() did not return an object");
        }
        var recordNext = recordIterator.next;
        var recordStep;
        while(!(recordStep = recordNext.call(recordIterator)).done){
            var value1 = recordStep.value;
            if (hasFn.call(O, value1)) {
                var ret = recordIterator.return;
                if (ret !== void 0 && ret !== null) {
                    if (typeof ret !== "function") throw new TypeError("iterator.return is not a function");
                    var closed = ret.call(recordIterator);
                    if (closed === null || typeof closed !== "object" && typeof closed !== "function") {
                        throw new TypeError("iterator.return() did not return an object");
                    }
                }
                return false;
            }
        }
        return true;
    };
    var METHODS = [
        [
            "union",
            setUnion
        ],
        [
            "intersection",
            setIntersection
        ],
        [
            "difference",
            setDifference
        ],
        [
            "symmetricDifference",
            setSymmetricDifference
        ],
        [
            "isSubsetOf",
            setIsSubsetOf
        ],
        [
            "isSupersetOf",
            setIsSupersetOf
        ],
        [
            "isDisjointFrom",
            setIsDisjointFrom
        ]
    ];
    if (typeof Set !== "undefined") bind();
    var installSetMethods = function installSetMethods() {
        bind();
        if (!proto) return;
        for(var i = 0; i < METHODS.length; i++){
            var name = METHODS[i][0];
            if (typeof proto[name] !== "function") define(proto, name, METHODS[i][1]);
        }
    };
    // src/modules/es.string.iterator.ts
    var isSupported169 = function isSupported169() {
        try {
            return typeof Symbol === "undefined" || !Symbol.iterator || typeof String.prototype[Symbol.iterator] === "function";
        } catch (unused) {
            return true;
        }
    };
    var returnSelf6 = function returnSelf6() {
        return this;
    };
    var StringIteratorPrototype = {};
    var hasOwn18 = Object.prototype.hasOwnProperty;
    var stringIteratorNext = function next7() {
        if (this === null || typeof this !== "object" || !hasOwn18.call(this, "_index")) {
            throw new TypeError("next method called on an object that is not a String Iterator");
        }
        var string = this._string;
        if (string === null || this._index >= string.length) {
            this._string = null;
            return {
                value: void 0,
                done: true
            };
        }
        var index = this._index;
        var first = string.charCodeAt(index);
        var size = 1;
        if (first >= 55296 && first <= 56319 && index + 1 < string.length) {
            var second = string.charCodeAt(index + 1);
            if (second >= 56320 && second <= 57343) {
                size = 2;
            }
        }
        this._index = index + size;
        return {
            value: string.substring(index, index + size),
            done: false
        };
    };
    try {
        Object.defineProperty(stringIteratorNext, "name", {
            value: "next",
            configurable: true
        });
    } catch (e) {}
    Object.defineProperty(StringIteratorPrototype, "next", {
        value: stringIteratorNext,
        writable: true,
        enumerable: false,
        configurable: true
    });
    if (typeof Symbol !== "undefined" && Symbol.toStringTag) {
        Object.defineProperty(StringIteratorPrototype, Symbol.toStringTag, {
            value: "String Iterator",
            writable: false,
            enumerable: false,
            configurable: true
        });
    }
    if (typeof Symbol !== "undefined" && Symbol.iterator) {
        Object.defineProperty(StringIteratorPrototype, Symbol.iterator, {
            value: returnSelf6,
            writable: true,
            enumerable: false,
            configurable: true
        });
    }
    var slotDesc2 = {
        value: void 0,
        writable: true,
        enumerable: false,
        configurable: false
    };
    var stringIterator = function stringIterator() {
        if (this === null || this === void 0) {
            throw new TypeError("String.prototype[Symbol.iterator] called on null or undefined");
        }
        var iterator = Object.create(StringIteratorPrototype);
        if (typeof this === "symbol") throw new TypeError("Cannot convert a Symbol value to a string");
        slotDesc2.value = typeof this === "string" ? this : String(this);
        Object.defineProperty(iterator, "_string", slotDesc2);
        slotDesc2.value = 0;
        Object.defineProperty(iterator, "_index", slotDesc2);
        slotDesc2.value = void 0;
        return iterator;
    };
    var install36 = function install36() {
        if (typeof Symbol !== "undefined" && Symbol.iterator) {
            define(String.prototype, Symbol.iterator, stringIterator, "[Symbol.iterator]");
        }
    };
    // src/modules/web.dom-collections.for-each.ts
    var domCollectionForEach = function domCollectionForEach(callback, thisArg) {
        if (typeof callback !== "function") {
            throw new TypeError(callback + " is not a function");
        }
        for(var i = 0; i < this.length; i++){
            callback.call(thisArg, this[i], i, this);
        }
    };
    var installForEach = function installForEach(proto2) {
        var arrayForEach2 = Array.prototype.forEach;
        if (proto2.forEach && !(arrayForEach2 && arrayForEach2.__polyfilled === true && proto2.forEach !== arrayForEach2)) return;
        if (typeof arrayForEach2 === "function") {
            Object.defineProperty(proto2, "forEach", {
                value: arrayForEach2,
                writable: true,
                enumerable: true,
                configurable: true
            });
        } else {
            define(proto2, "forEach", domCollectionForEach);
        }
    };
    var install37 = function install37() {
        if (typeof NodeList !== "undefined") installForEach(NodeList.prototype);
        if (typeof DOMTokenList !== "undefined") installForEach(DOMTokenList.prototype);
    };
    // src/modules/web.dom-collections.iterator.ts
    var returnSelf7 = function returnSelf7() {
        return this;
    };
    var CollectionIteratorPrototype = {};
    CollectionIteratorPrototype.next = function() {
        var collection = this._collection;
        if (collection === null || this._index >= collection.length) {
            this._collection = null;
            return {
                value: void 0,
                done: true
            };
        }
        var index = this._index++;
        var kind = this._kind;
        if (kind === 0) return {
            value: index,
            done: false
        };
        if (kind === 1) return {
            value: collection[index],
            done: false
        };
        return {
            value: [
                index,
                collection[index]
            ],
            done: false
        };
    };
    if (typeof Symbol !== "undefined" && Symbol.iterator) {
        Object.defineProperty(CollectionIteratorPrototype, Symbol.iterator, {
            value: returnSelf7,
            writable: true,
            enumerable: false,
            configurable: true
        });
    }
    var domCollectionKeys = function domCollectionKeys() {
        var iterator = Object.create(CollectionIteratorPrototype);
        iterator._collection = this;
        iterator._index = 0;
        iterator._kind = 0;
        return iterator;
    };
    var domCollectionValues = function domCollectionValues() {
        var iterator = Object.create(CollectionIteratorPrototype);
        iterator._collection = this;
        iterator._index = 0;
        iterator._kind = 1;
        return iterator;
    };
    var domCollectionEntries = function domCollectionEntries() {
        var iterator = Object.create(CollectionIteratorPrototype);
        iterator._collection = this;
        iterator._index = 0;
        iterator._kind = 2;
        return iterator;
    };
    var own3 = [
        [
            "keys",
            domCollectionKeys
        ],
        [
            "values",
            domCollectionValues
        ],
        [
            "entries",
            domCollectionEntries
        ]
    ];
    var patchCollection = function patchCollection(proto2, withMethods) {
        if (withMethods) {
            for(var i = 0; i < own3.length; i++){
                var name = own3[i][0];
                var arrayFn = Array.prototype[name];
                if (proto2[name] && !(arrayFn && arrayFn.__polyfilled === true && proto2[name] !== arrayFn)) continue;
                if (typeof arrayFn === "function") {
                    Object.defineProperty(proto2, name, {
                        value: arrayFn,
                        writable: true,
                        enumerable: true,
                        configurable: true
                    });
                } else {
                    Object.defineProperty(proto2, name, {
                        value: own3[i][1],
                        writable: true,
                        enumerable: true,
                        configurable: true
                    });
                    try {
                        Object.defineProperty(own3[i][1], "name", {
                            value: name,
                            configurable: true
                        });
                    } catch (e) {}
                    Object.defineProperty(own3[i][1], "__polyfilled", {
                        value: true
                    });
                }
            }
        }
        var iteratorKey4 = typeof Symbol !== "undefined" ? Symbol.iterator : void 0;
        var arrayValues3 = Array.prototype.values;
        if (iteratorKey4 && (!proto2[iteratorKey4] || arrayValues3 && arrayValues3.__polyfilled === true && proto2[iteratorKey4] !== arrayValues3)) {
            var value = typeof arrayValues3 === "function" ? arrayValues3 : proto2.values || domCollectionValues;
            try {
                Object.defineProperty(proto2, iteratorKey4, {
                    value: value,
                    writable: true,
                    enumerable: false,
                    configurable: true
                });
            } catch (e) {
                try {
                    proto2[iteratorKey4] = value;
                } catch (e2) {}
            }
        }
    };
    var install38 = function install38() {
        if (typeof NodeList !== "undefined") patchCollection(NodeList.prototype, true);
        if (typeof DOMTokenList !== "undefined") patchCollection(DOMTokenList.prototype, true);
        if (typeof HTMLCollection !== "undefined") patchCollection(HTMLCollection.prototype, false);
    };
    // src/install-polyfills.ts
    var installPolyfills = function installPolyfills() {
        if (!isSupported4()) install2();
        install3();
        install4();
        install5();
        install6();
        if (!isSupported160()) define(window, "queueMicrotask", queueMicrotask);
        if (!isSupported7()) install7();
        installDisposable();
        if (!isSupported8()) install8();
        if (!isSupported9()) install9();
        if (!isSupported10()) install10();
        if (!isSupported11()) define(Error, "isError", errorIsError);
        if (!isSupported12()) define(Error.prototype, "toString", errorToString);
        installSetMethods();
        if (typeof Map !== "undefined" && Map.prototype && !isSupported13()) define(Map.prototype, "getOrInsert", mapGetOrInsert);
        if (typeof Map !== "undefined" && Map.prototype && !isSupported14()) define(Map.prototype, "getOrInsertComputed", mapGetOrInsertComputed);
        if (typeof Map !== "undefined" && !isSupported15()) define(Map, "groupBy", mapGroupBy);
        if (typeof WeakMap !== "undefined" && WeakMap.prototype && !isSupported16()) define(WeakMap.prototype, "getOrInsert", weakMapGetOrInsert);
        if (typeof WeakMap !== "undefined" && WeakMap.prototype && !isSupported17()) define(WeakMap.prototype, "getOrInsertComputed", weakMapGetOrInsertComputed);
        if (!isSupported18()) define(window, "WeakSet", WeakSet2);
        else tagNativeWeakSet();
        if (!isSupported19()) install11();
        if (!isSupported20()) install12();
        if (!isSupported21()) define(Object, "assign", objectAssign);
        if (!isSupported22()) define(Object.prototype, "__defineGetter__", objectDefineGetter);
        if (!isSupported23()) define(Object.prototype, "__defineSetter__", objectDefineSetter);
        if (!isSupported24()) define(Object, "entries", objectEntries);
        if (!isSupported25()) define(Object, "freeze", objectFreeze);
        if (!isSupported26()) define(Object, "fromEntries", objectFromEntries);
        if (!isSupported27()) define(Object, "getOwnPropertyDescriptor", objectGetOwnPropertyDescriptor);
        if (!isSupported28()) define(Object, "getOwnPropertyDescriptors", objectGetOwnPropertyDescriptors);
        if (!isSupported29()) define(Object, "getOwnPropertyNames", objectGetOwnPropertyNames);
        if (!isSupported30()) define(Object, "getPrototypeOf", objectGetPrototypeOf);
        if (!isSupported31()) define(Object, "groupBy", objectGroupBy);
        if (!isSupported32()) define(Object, "hasOwn", objectHasOwn);
        if (!isSupported33()) define(Object, "is", objectIs);
        if (!isSupported34()) define(Object, "isExtensible", objectIsExtensible);
        if (!isSupported35()) define(Object, "isFrozen", objectIsFrozen);
        if (!isSupported36()) define(Object, "isSealed", objectIsSealed);
        if (!isSupported37()) define(Object, "keys", objectKeys);
        if (!isSupported38()) define(Object.prototype, "__lookupGetter__", objectLookupGetter);
        if (!isSupported39()) define(Object.prototype, "__lookupSetter__", objectLookupSetter);
        if (!isSupported40()) define(Object, "preventExtensions", objectPreventExtensions);
        if (!isSupported41()) define(Object, "seal", objectSeal);
        if (!isSupported42()) define(Object, "setPrototypeOf", objectSetPrototypeOf);
        if (!isSupported43()) define(Object, "values", objectValues);
        if (!isSupported168()) installReflect();
        if (!isSupported44()) install13();
        if (!isSupported45()) define(Array.prototype, "at", arrayAt);
        if (!isSupported46()) define(Array.prototype, "concat", arrayConcat);
        if (!isSupported47()) define(Array.prototype, "copyWithin", arrayCopyWithin);
        if (!isSupported48()) define(Array.prototype, "every", arrayEvery);
        if (!isSupported49()) define(Array.prototype, "fill", arrayFill);
        if (!isSupported50()) define(Array.prototype, "filter", arrayFilter);
        if (!isSupported51()) define(Array.prototype, "find", arrayFind);
        if (!isSupported52()) define(Array.prototype, "findIndex", arrayFindIndex);
        if (!isSupported53()) define(Array.prototype, "findLast", arrayFindLast);
        if (!isSupported54()) define(Array.prototype, "findLastIndex", arrayFindLastIndex);
        if (!isSupported55()) define(Array.prototype, "flat", arrayFlat);
        if (!isSupported56()) define(Array.prototype, "flatMap", arrayFlatMap);
        if (!isSupported57()) define(Array.prototype, "forEach", arrayForEach);
        if (!isSupported59()) define(Array, "fromAsync", arrayFromAsync);
        if (!isSupported60()) define(Array.prototype, "includes", arrayIncludes);
        if (!isSupported61()) define(Array.prototype, "indexOf", arrayIndexOf);
        install15();
        if (!isSupported58()) install14();
        if (!isSupported62()) define(Array.prototype, "join", arrayJoin);
        if (!isSupported63()) define(Array.prototype, "lastIndexOf", arrayLastIndexOf);
        if (!isSupported64()) define(Array.prototype, "map", arrayMap);
        if (!isSupported65()) define(Array, "of", arrayOf);
        if (!isSupported66()) define(Array.prototype, "push", arrayPush);
        if (!isSupported67()) define(Array.prototype, "reduce", arrayReduce);
        if (!isSupported68()) define(Array.prototype, "reduceRight", arrayReduceRight);
        if (!isSupported69()) define(Array.prototype, "reverse", arrayReverse);
        if (!isSupported70()) define(Array.prototype, "slice", arraySlice);
        if (!isSupported71()) define(Array.prototype, "some", arraySome);
        if (!isSupported72()) define(Array.prototype, "sort", arraySort);
        if (!isSupported73()) install16();
        if (!isSupported74()) define(Array.prototype, "splice", arraySplice);
        if (!isSupported75()) define(Array.prototype, "toReversed", arrayToReversed);
        if (!isSupported76()) define(Array.prototype, "toSorted", arrayToSorted);
        if (!isSupported77()) define(Array.prototype, "toSpliced", arrayToSpliced);
        if (!isSupported78()) install17();
        if (!isSupported79()) install18();
        if (!isSupported80()) define(Array.prototype, "unshift", arrayUnshift);
        if (!isSupported81()) define(Array.prototype, "with", arrayWith);
        if (!isSupported169()) install36();
        if (!isSupported82()) install19();
        if (!isSupported83()) install20();
        if (!isSupported84()) define(RegExp, "escape", regExpEscape);
        if (!isSupported85()) install21();
        if (!isSupported86()) define(RegExp.prototype, "test", regexpTest);
        if (!isSupported87()) define(RegExp.prototype, "toString", regExpToString);
        if (!isSupported88()) define(String.prototype, "at", stringAt);
        if (!isSupported89()) define(String.prototype, "codePointAt", stringCodePointAt);
        if (!isSupported90()) define(String.prototype, "endsWith", stringEndsWith);
        if (!isSupported91()) define(String, "fromCodePoint", stringFromCodePoint);
        if (!isSupported92()) define(String.prototype, "includes", stringIncludes);
        if (!isSupported93()) define(String.prototype, "isWellFormed", stringIsWellFormed);
        if (!isSupported94()) {
            define(String.prototype, "match", stringMatch);
            installRegExpMatch();
        }
        if (!isSupported95()) install22();
        if (!isSupported96()) define(String.prototype, "padEnd", stringPadEnd);
        if (!isSupported97()) define(String.prototype, "padStart", stringPadStart);
        if (!isSupported98()) define(String, "raw", stringRaw);
        if (!isSupported99()) define(String.prototype, "repeat", stringRepeat);
        if (!isSupported100()) {
            define(String.prototype, "replace", stringReplace);
            installRegExpReplace();
        }
        if (!isSupported101()) define(String.prototype, "replaceAll", stringReplaceAll);
        if (!isSupported102()) {
            define(String.prototype, "search", stringSearch);
            installRegExpSearch();
        }
        if (!isSupported103()) {
            define(String.prototype, "split", stringSplit);
            installRegExpSplit();
        }
        if (!isSupported104()) define(String.prototype, "startsWith", stringStartsWith);
        if (!isSupported105()) define(String.prototype, "toWellFormed", stringToWellFormed);
        if (!isSupported106()) define(String.prototype, "trim", stringTrim);
        if (!isSupported107()) define(String.prototype, "trimEnd", stringTrimEnd);
        if (!isSupported108()) define(String.prototype, "trimStart", stringTrimStart);
        if (!isSupported109()) install23();
        if (!isSupported110()) install24();
        if (!isSupported111()) installArrayBuffer();
        if (!isSupported112()) installFloat16();
        installTypedArray();
        if (!isSupported113()) installUint8Array();
        if (!isSupported114()) define(Date.prototype, "toISOString", dateToISOString);
        if (!isSupported115()) define(Date.prototype, "toJSON", dateToJSON);
        if (!isSupported116()) install25();
        if (!isSupported117()) install26();
        if (!isSupported118()) define(Math, "acosh", mathAcosh);
        if (!isSupported119()) define(Math, "asinh", mathAsinh);
        if (!isSupported120()) define(Math, "atanh", mathAtanh);
        if (!isSupported121()) define(Math, "cbrt", mathCbrt);
        if (!isSupported122()) define(Math, "clz32", mathClz32);
        if (!isSupported123()) define(Math, "cosh", mathCosh);
        if (!isSupported124()) define(Math, "expm1", mathExpm1);
        if (!isSupported125()) define(Math, "fround", mathFround);
        if (!isSupported126()) define(Math, "hypot", mathHypot);
        if (!isSupported127()) define(Math, "imul", mathImul);
        if (!isSupported128()) define(Math, "log10", mathLog10);
        if (!isSupported129()) define(Math, "log1p", mathLog1p);
        if (!isSupported130()) define(Math, "log2", mathLog2);
        if (!isSupported131()) define(Math, "sign", mathSign);
        if (!isSupported132()) define(Math, "sinh", mathSinh);
        if (!isSupported133()) define(Math, "sumPrecise", mathSumPrecise);
        if (!isSupported134()) define(Math, "tanh", mathTanh);
        if (!isSupported135()) install27();
        if (!isSupported136()) define(Math, "trunc", mathTrunc);
        if (!isSupported137()) install28();
        if (!isSupported138()) install29();
        if (!isSupported139()) define(Number, "isFinite", numberIsFinite);
        if (!isSupported140()) define(Number, "isInteger", numberIsInteger);
        if (!isSupported141()) define(Number, "isNaN", numberIsNaN);
        if (!isSupported142()) define(Number, "isSafeInteger", numberIsSafeInteger);
        if (!isSupported143()) install30();
        if (!isSupported144()) install31();
        if (!isSupported145()) define(Number, "parseFloat", numberParseFloat);
        if (!isSupported146()) define(Number, "parseInt", numberParseInt);
        if (!isSupported147()) define(Number.prototype, "toExponential", numberToExponential);
        if (!isSupported148()) define(Number.prototype, "toFixed", numberToFixed);
        if (!isSupported149()) define(Number.prototype, "toPrecision", numberToPrecision);
        if (!isSupported150()) define(window, "parseFloat", numberParseFloat2);
        if (!isSupported151()) define(window, "parseInt", numberParseInt2);
        if (typeof Promise !== "undefined" && !isSupported152()) define(Promise, "allSettled", promiseAllSettled);
        if (typeof Promise !== "undefined" && !isSupported153()) define(Promise, "any", promiseAny);
        if (typeof Promise !== "undefined" && !isSupported154()) define(Promise.prototype, "finally", promiseFinally);
        if (typeof Promise !== "undefined" && !isSupported155()) define(Promise, "try", promiseTry);
        if (typeof Promise !== "undefined" && !isSupported156()) define(Promise, "withResolvers", promiseWithResolvers);
        install37();
        install38();
        installIterator();
        if (!isSupported157()) installDomException();
        if (!isSupported158()) installSetImmediate();
        if (typeof window !== "undefined" && !isSupported159()) define(window, "atob", atobPolyfill);
        if (!isSupported161()) install32();
        if (!isSupported2()) define(window, "structuredClone", structuredClone);
        if (!isSupported162()) install33();
        if (!isSupported163()) install34();
        if (!isSupported164()) install35();
        if (typeof URL !== "undefined" && !isSupported165()) define(URL, "canParse", urlCanParse);
        if (typeof URL !== "undefined" && !isSupported166()) define(URL, "parse", urlParse);
        if (typeof URL !== "undefined" && URL.prototype && !isSupported167()) define(URL.prototype, "toJSON", urlToJSON);
        try {
            applySymbolKeyFilters();
        } catch (e) {}
    };
    // src/index.ts
    installPolyfills();
}();
