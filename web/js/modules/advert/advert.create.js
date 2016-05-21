/**
 * Модуль
 * @constructor
 */
var AdvertCreate = function() {
    var self = this;
    this.form = $('form#create-advert');
    console.log(this.form);

    /**
     * После загрузки дома
     */
    this.onLoad = function () {
        this.form = $('form#create-advert');
        this.initHandlers();
    };

    /**
     * Установка обработчиков
     */
    this.initHandlers = function() {
        this.initSteps();
        this.initForm();
    };

    /**
     * Инициализация формы
     */
    this.initForm = function() {
        this.form.on('submit', function() {
            //return false;
        });

        this.form.find('#saveButton').on('click', function() {
            var action = self.form.attr('action');

            $.ajax(action, {
                method: 'post',
                data: self.form.serialize(),
                dataType: 'json',
                beforeSend: function() {
                    App.ajaxLoading();
                },
                success: function (response) {
                    if (response.status == 'success') {
                        location.href = '/adverts';
                    }

                    App.hideOverlayAndLoader();
                }
            });
        });
    };

    /**
     * Инициализация пошагового конструктора
     */
    this.initSteps = function() {
        //var wizard = $('.bs-wizard');

        //$('.nextStep').on('click', function() {
        //    var cur = wizard.find('.active');
        //    cur.removeClass('active').addClass('complete');
        //    $('.step_' + cur.data('step')).addClass('hidden');
        //    var next = cur.next();
        //    if (next.length) {
        //        next.removeClass('disabled').addClass('active');
        //        $('.step_' + next.data('step')).removeClass('hidden');
        //        $('.prevStep').removeClass('hidden');
        //    } else {
        //        $('.saveButton').removeClass('hidden');
        //        $('.nextStep').addClass('hidden');
        //    }
        //});
        //
        //$('.prevStep').on('click', function() {
        //    var cur = wizard.find('.active');
        //    cur.removeClass('active').addClass('disabled');
        //    $('.step_' + cur.data('step')).addClass('hidden');
        //    var prev = cur.prev();
        //    prev.removeClass('complete').addClass('active');
        //    $('.step_' + prev.data('step')).removeClass('hidden');
        //    if (prev.data('step') == 'main') {
        //        $('.prevStep').addClass('hidden');
        //    }
        //});
    };
};

Mods.loadModule('AdvertCreate');