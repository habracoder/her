/**
 *
 * @constructor
 */
var Mods = function() {
    /**
     * Базовый путь к модулям
     * @type {string}
     */
    this.basePath = '/js/modules/';

    /**
     * Загруженные модули
     * @type {Array}
     */
    this.modules = [];
};

/*
 * Подготавливает имя модуля
 * @param path
 * @returns {string|XML}
 */
Mods.prototype.prepareModuleName = function(path) {
    return path.replace(/\//g, ' ')
        .replace(/^([A-z])|\s(\w)/g, function(match, p1, p2) {
            if (p2) {
                return p2.toUpperCase()
            }

            return p1.toUpperCase();
        })
        .replace(/\s/, '');
};

/**
 * Подготавливает путь для модуля
 * @param src
 * @returns {string}
 */
Mods.prototype.prepareScriptPath = function(src) {
    src = src.replace(/^\//, '');
    src = src.replace(/\.js$/, '');

    return this.basePath + src + '.js';
};

/**
 * Подгрузка подуля по пути
 * @param src
 * @param load
 * @returns {*}
 */
Mods.prototype.import = function(src, load) {
    load = load != undefined ? load : true;
    var module = this.prepareModuleName(src);
    var script = this.prepareScriptPath(src);

    if (this.isLoaded(module)) {
        return this.modules[module];
    }

    this.appendScript(script);

    var obj = this.loadModule(module);

    if (load) {
        window[module] = obj;
    }

    return obj;
};

/**
 * Загружен ли модуль
 * @param module
 * @returns {boolean}
 */
Mods.prototype.isLoaded = function(module) {
    return this.modules[module] != undefined;
};

/**
 * Загрузка модуля
 * @param module
 * @returns {*}
 */
Mods.prototype.loadModule = function(module) {
    if (typeof window[module] != 'function') {
        throw 'Модуль ' + module + ' не найден';
    }
    var mod = eval('new ' + module);

    $(document).ready(function() {
        if (mod['onLoad'] != undefined) {
            mod.onLoad();
        }
    });

    this.modules[module] = mod;

    return mod;
};

/**
 * Добавление скрипта в дом документ
 * @param script
 */
Mods.prototype.appendScript = function(script) {
    $('head').append($('<script />', {
        src: script,
        type: 'text/javascript'
    }));
};

/**
 * вовзращает модуль, генерит исключение при отсутствии
 * @param name
 * @returns {*}
 */
Mods.prototype.getModule = function(name) {
    if (!this.modules[name]) {
        throw "Undefined module " + name;
    }
    return this.modules[name];
};

Mods = new Mods;