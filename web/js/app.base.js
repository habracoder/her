$(function() {
    App.onLoad();
});

/**
 * Глобальный объект с различными механизмами и обработчиками
 * @type {Object}
 */
var AppBase = {

    /**
     * список модулей
     */
    modules: {},

    /**
     * Обработчик, который вызывается при загрузке страницы
     */
    onLoad: function() {
        for (var key in this.modules) {
            if (this.modules[key].onLoad) {
                this.modules[key].onLoad();
            }
        }
        $(window).resize(function(event) {
            for (var key in App.modules) {
                if (App.modules[key].onResize) {
                    App.modules[key].onResize(event);
                }
            }
        });
    },

    /**
     * Регистрирует модуль
     * @param name название модуля
     * @param module объект модуля
     */
    registerModule: function(name, module) {
        this.modules[name] = module;
    },

    /**
     * вовзращает модуль, генерит исключение при отсутствии
     * @param name название модуля
     * @throw
     */
    getModule: function(name) {
        if (!this.modules[name]) {
            throw "Undefined module " + name;
        }
        return this.modules[name];
    },

    /**
     * Отвечает за хранение пользовательских данных
     */
    storage: {
        /**
         * Хранилище пользовательских данных на время сессии
         */
        session: {
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
        },

        /**
         * Постоянное хранилище пользовательских данных
         */
        local: {
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
        },

        /**
         * Работа с куками
         */
        cookie: {
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
        }
    },

    /**
     * Отвечает за js-шаблонизацию
     */
    view: {
        
        /**
         * данные для видов
         */
        data: {},

        /**
         * пост-обработчики видов
         */
        postRenderer: {},

        /**
         * шаблоны видов
         */
        template: {},

        /**
         * обработчики событий
         */
        handler: {},

        /**
         * Рендерит шаблон с помощью шаблонизатора (сейчас - doT)
         * @param template шаблон
         * @param data объект для подстановки в шаблон
         * @return string
         */
        render: function(template, data) {
            var renderer = doT.template(template);
            return renderer(data);
        },

        /**
         * Функция пост-обработки данных
         * @param name название вида
         * @param html отрендеренные данные
         * @param object данные
         */
        postRender: function(name, html, object) {
            if (this.postRenderer[name]) {
                this.postRenderer[name](html, object);
            } else {
                if (html) {
                    this.defaultPostRenderer(name, html, object);
                } else {
                    throw "No post-renderer for " + name;
                }
            }
        },

        /**
         * Рендерит данные. Если не задана data - берет все имеющиеся. Если задано - то список для обхода берет из него,
         * сами данные - из общего хранилища
         * @param data
         */
        renderData: function(data) {
            sort.preInit();
            // Обходим все данные, которые нужно обойти
            for (var key in data) {
                // Если есть шаблон для данных - сначала рендерим его, иначе вызываем пост-обработку
                if (this.template[key]) {
                    this.postRender(key, this.render(this.template[key], data[key]), data[key]);
                } else {
                    this.postRender(key, '', data[key]);
                }
            }

        },

        /**
         * рендерит все имеющиеся данные
         */
        renderAll: function() {
            this.renderData(this.data);
        },

        /**
         * Загружает данные (с шаблоном, если нету), рендерит их.
         * Перед запросом вызывает функцию, если задана
         * @param url
         * @param settings {Object} afterReceive - функция, которая вызывается в конце success
         */
        loadData: function(url, settings) {
            if (!settings) {
                settings = {};
            }
            settings.dataType = 'json';
            settings.url = url;
            settings.success = function(result) {
                var data = result.data;
                var toRender = {};
                for (var key in data) {
                    if (!App.view.template[key] && data[key].template) {
                        App.view.setTemplate(key, data[key].template);
                    }
                    App.view.data[key] = toRender[key] = data[key].data;
                }
                App.view.renderData(toRender);
                if (settings.afterReceive) {
                    settings.afterReceive();
                }
            };

            App.jsend(settings);
        },

        /**
         * Функция устанавливает обработчик события получение данных
         * @param name
         * @param handler
         */
        onDataReceived: function(name, handler) {
            this.handler[name] = {onDataReceived: handler};
        },

        /**
         * Функция когда данные уже получены
         * @returns {AppBase}
         */
        dataReceived: function() {
            for (var name in this.data) {
                if (App.view.handler[name] && App.view.handler[name].onDataReceived) {
                    App.view.handler[name].onDataReceived();
                }
            }

            return this;
        },

        /**
         * Стандартная функция пост-обработки
         * Устанавливает отрендеренные данные в DOM, по селектору одноименному с названием вида
         * @param name
         * @param html
         * @param object
         */
        defaultPostRenderer: function(name, html, object) {
            $('#' + name).html(html);
            if (typeof tooltip !== 'undefined') {
                tooltip.init();
            }
        },

        /**
         * устанаваливает пост-обработчик для вида
         * @param name
         * @param renderer
         */
        setPostRenderer: function(name, renderer) {
            this.postRenderer[name] = renderer;
        },

        /**
         * устанавливает шаблон вида
         * @param name
         * @param template
         */
        setTemplate: function(name, template) {
            this.template[name] = template;
        },

        /**
         * устанавливает данные для вида
         * @param name
         * @param data
         */
        setData: function(name, data) {
            this.data[name] = data;
        }
    },

    /**
     * Делает ajax-запрос, обрабатывает формат jsend, success вызывает только когда статус success
     * @param options
     */
    jsend: function(options) {
        // описываем базовые, накладываем то что пришло в функцию
        var baseOptions = $.extend({
            selector: 'body', /* Селектор, определяющий элемент для обновления.
             Также, внутри него снимается класс incorrect со всех элементов */
            success: function(result) {},
            error: function(result) {
                switch (result.status) {
                    case 403:
                        App.error(_('[ACCESS_DENIED]'), true);
                        break;
                    default:
                        App.error(_('[WAS_SOME_ERROR]'), true);
                        break;
                }
            },
            fail: function(result) {
                App.mapErrors(result);
                App.hideOverlayAndLoader(false);
            }
        }, options);

        // на базовое и полученое накладываем обязательное и переопределенное
        var finalOptions = $.extend(options, {
            dataType: 'json',
            success: function(result) {
                App.hideOverlayAndLoader(false);
                if (result.status == 'success') {
                    baseOptions.success(result);
                } else if (result.status == 'error') {
                    baseOptions.error(result);
                } else if (result.status == 'fail') {
                    baseOptions.fail(result);
                }
            },
            error: function(result) {
                baseOptions.error(result);
                App.hideOverlayAndLoader(false);
            },
            beforeSend: function() {
                $('.incorrect', baseOptions.selector).removeClass('incorrect');
                if (baseOptions.beforeSend) {
                    baseOptions.beforeSend();
                } else {
                    App.ajaxLoading(baseOptions.selector);
                }
            }
        });
        $.ajax(finalOptions);
    },

    /**
     * Отображение иконки загрузки
     * @param selector
     * @param type - класс, префикс класса, который будет у оверлея и лоадера
     */
    ajaxLoading: function(selector, type) {
        if (typeof selector == 'undefined') {
            selector = $('table.table').parent();
        }
        if (typeof type == 'undefined') {
            type = '';
        }
        if (!$('.ajaxOverlay' + type).length) {
            $(selector).append('<div class="ajaxOverlay' + type + '"></div>');
        }
        $('.ajaxOverlay' + type).css('height', $(document).height()).css('width', $(document).width());
        $(selector).append('<img src="' + Config.jsend.loaderImg + '" id="loaderGif" class="ajaxLoader' + type + '"/>');
    },

    hideOverlayAndLoader: function(popup) {
        if ($('.ajaxOverlayPopup').length && popup) {
            $('.ajaxOverlayPopup').remove();
        }

        if ($('.ajaxOverlay').length && !popup) {
            $('.ajaxOverlay').remove();
        }

        if ($('#loaderGif').length) {
            $('#loaderGif').remove();
        }

        if ($('.ajaxLoaderPopup').length) {
            $('.ajaxLoaderPopup').remove();
        }
    },

    /**
     * Добавление наложения на стараницу для вывода попапа
     */
    addAjaxOverlay: function() {
        $('body').append('<div class="ajaxOverlay"></div>');
    },

    format: {
        int: function(value) {
            return accounting.formatNumber(value, 0, '&nbsp;');
        },
        float: function(value, precision) {
            if (!precision) {
                precision = 2;
            }
            if (App.lang == 'ru') {
                return accounting.formatNumber(value, precision, '&nbsp;', ',');
            }
            return accounting.formatNumber(value, precision, '&nbsp;');
        },
        currency: function(value, isCent, showSymbol) {
            if (typeof showSymbol == 'undefined') {
                showSymbol = false;
            }

            if (isCent) {
                if (App.lang == 'ru') {
                    return accounting.formatNumber(value, 1, '&nbsp;', ',') + (showSymbol ? '&cent;' : '');
                }
                return accounting.formatNumber(value, 1, '&nbsp;') + (showSymbol ? '&cent;' : '');
            } else {
                return (showSymbol ? '&#36;' : '') + this.float(value);
            }
        },

        /**
         * Вывод числа и текста в правильном склонении
         */
        plural: function(int, key) {
            var rest100 = int%100;
            var rest10 = int%10;
            var pluralNumber = 1;
            if (App.lang == 'ru') {
                if ((rest100 < 10 || rest100 > 19) && rest10 == 1) {
                    pluralNumber = 1;
                } else if ((rest100 < 10 || rest100 > 19) && [2, 3, 4].indexOf(rest10) != -1) {
                    pluralNumber = 2;
                } else if ((rest100 >= 10 && rest100 <= 19) || [5, 6, 7, 8, 9, 0].indexOf(rest10) != -1) {
                    pluralNumber = 3;
                }
            } else {
                pluralNumber = int == 1 ? 1 : 2;
            }
            return int + ' ' + jsTranslates[key.replace(/\{C\}/g, App.lang.toUpperCase()).replace(/\{N\}/g, pluralNumber)];
        },

        date: function(value) {
            if (App.lang == 'ru') {
                var date, format = "DD.MM.YYYY";
            } else {
                var date, format = "DD/MM/YYYY";
            }
            if (value instanceof Date) {
                date = value;
            } else {
                if (navigator.userAgent.indexOf("Firefox") != -1) {
                    dParts = value.split(" ")
                    if (dParts.length == 1) {
                        dateParts1 = dParts[0].split("-")
                        var date = new Date(
                            dateParts1[0],
                            dateParts1[1] - 1,
                            dateParts1[2]
                        )
                    } else {
                        dateParts1 = dParts[0].split("-")
                        dateParts2 = dParts[1].split(":")
                        var date = new Date(
                            dateParts1[0],
                            dateParts1[1] - 1,
                            dateParts1[2],
                            dateParts2[0],
                            dateParts2[1],
                            dateParts2[2]
                        )
                    }

                } else {
                    var dateObj = value.split('-');
                    date = (value instanceof Date) ? value : new Date(dateObj[0], dateObj[1] - 1, dateObj[2]);
                }

            }
            format = format.replace("DD", (date.getDate() < 10 ? '0' : '') + date.getDate());
            format = format.replace("MM", (date.getMonth() < 9 ? '0' : '') + (date.getMonth() + 1));
            format = format.replace("YYYY", date.getFullYear());
            return format;
        },

        /**
         * Для форматирования строк с инофрмацией о дате и времени, которые получены с БД - "DD-MM-YY hh:mm:ss"
         * @param value строка формата - "DD-MM-YY hh:mm:ss"
         * @return
         */
        datetime: function(value) {
            if (App.lang == 'ru') {
                var format = "DD.MM.YYYY hh:mm:ss";
            } else {
                var format = "DD/MM/YYYY hh:mm:ss";
            }
            if (navigator.userAgent.indexOf("Firefox") != -1) {
                dParts = value.split(" ")
                if (dParts.length == 1) {
                    dateParts1 = dParts[0].split("-")
                    var date = new Date(
                        dateParts1[0],
                        dateParts1[1] - 1,
                        dateParts1[2]
                    )
                } else {
                    dateParts1 = dParts[0].split("-")
                    dateParts2 = dParts[1].split(":")
                    var date = new Date(
                        dateParts1[0],
                        dateParts1[1] - 1,
                        dateParts1[2],
                        dateParts2[0],
                        dateParts2[1],
                        dateParts2[2]
                    )
                }
            } else {
                var date = new Date(value.replace(/-/g, ' '));
            }
            format = format.replace("DD", (date.getDate() < 10 ? '0' : '') + date.getDate());
            format = format.replace("MM", (date.getMonth() < 9 ? '0' : '') + (date.getMonth() + 1));
            format = format.replace("YYYY", date.getFullYear())
            format = format.replace("hh", (date.getHours() < 10 ? '0' : '') + date.getHours());
            format = format.replace("mm", (date.getMinutes() < 10 ? '0' : '') + date.getMinutes());
            format = format.replace("ss", (date.getSeconds() < 10 ? '0' : '') + date.getSeconds());
            return format;
        },

        /**
         * Получение процентарного соотношения чисел
         *
         * @param part
         * @param base
         * @returns {number}
         */
        percent: function(part, base) {
            var percent = base ? 100 * part / base : 0;
            return App.format.float(percent);
        },

        /**
         * Деление a на b, с учетом 0
         *
         * @param a
         * @param b
         * @returns {number}
         */
        division: function(a, b) {
            return b ? App.format.float(a / b) : 0;
        },

        /**
         * Если длинна строки больше, чем необходимо (length), она обрезается и дописывается "..."
         * @param string
         * @param length
         * @returns {string}
         */
        cutString: function(string, length) {
            if (string.length > length) {
                return string.substr(0, length) + '...';
            }
            return string;
        }

    },

    /**
     * Date module
     */
    date: {

        /**
         * Parse Date object from string by format
         *
         * App.date.parse('06.21.2010', 'mm.dd.yyyy');
         * App.date.parse('21.06.2010', 'dd.mm.yyyy');
         * App.date.parse('2010/06/21', 'yyyy/mm/dd');
         * App.date.parse('2010-06-21');
         *
         * @param input
         * @param format
         * @returns {Date}
         */
        parse: function(input, format) {
            format = format || 'yyyy-mm-dd'; // default format
            var parts = input.match(/(\d+)/g),
                i = 0, fmt = {};
            // extract date-part indexes from the format
            format.replace(/(yyyy|dd|mm)/g, function(part) { fmt[part] = i++; });
            return new Date(parts[fmt['yyyy']], parts[fmt['mm']] - 1, parts[fmt['dd']]);
        }
    }
};