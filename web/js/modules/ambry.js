var Ambry = function() {
    /**
     * Хранилище пользовательских данных на время сессии
     * @type {{emptyValue: string, isSupported: Ambry.session.isSupported, set: Ambry.session.set, get: Ambry.session.get, unset: Ambry.session.unset, clear: Ambry.session.clear}}
     */
    this.session = {
        emptyValue: '',
            isSupported: function() {
            return typeof(Storage) !== "undefined";
        },
        set: function(key, value) {
            if (this.isSupported()) {
                sessionStorage[key] = value;
            }
        },
        get: function(key) {
            if (this.isSupported()) {
                return sessionStorage[key];
            }
            return this.emptyValue;
        },
        unset: function(key) {
            sessionStorage[key] = this.emptyValue;
        },
        /**
         * Очищает все ключи
         */
        clear: function() {
            for (var key in sessionStorage) {
                App.storage.session.unset(key);
            }
        }
    };

    /**
     * Постоянное хранилище пользовательских данных
     * @type {{emptyValue: string, isSupported: Ambry.local.isSupported, set: Ambry.local.set, get: Ambry.local.get, unset: Ambry.local.unset, clear: Ambry.local.clear}}
     */
    this.local = {
        emptyValue: '',
        isSupported: function() {
            return typeof(Storage) !== "undefined";
        },
        set: function(key, value) {
            if (this.isSupported()) {
                localStorage[key] = value;
            }
        },
        get: function(key) {
            if (this.isSupported()) {
                return localStorage[key];
            }
            return this.emptyValue;
        },
        unset: function(key) {
            localStorage[key] = this.emptyValue;
        },
        /**
         * Очищает все ключи
         */
        clear: function() {
            for (var key in localStorage) {
                App.storage.local.unset(key);
            }
        }
    };

    /**
     * Работа с куками
     * @type {{set: Ambry.cookie.set, get: Ambry.cookie.get}}
     */
    this.cookie = {
        /**
         * Установить куку
         * @param name имя куки
         * @param value ёё значение
         * @param exminutes срок хранения
         */
        set: function(name, value, exminutes) {
            var exdate = new Date();
            exdate.setTime(exdate.getTime() + (exminutes * 60 * 1000));
            var c_value = escape(value) + ((exminutes == null) ? "" : "; expires=" + exdate.toUTCString());
            document.cookie = name + "=" + c_value;
        },

        /**
         * Заюбрать куку
         * @param name
         * @returns {*}
         */
        get: function(name) {
            var value = "; " + document.cookie;
            var parts = value.split("; " + name + "=");
            if (parts.length == 2) {
                return parts.pop().split(";").shift();
            }
            return null;
        }
    };
};