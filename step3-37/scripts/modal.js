/*
 * @Author: Mertens
 * @Date:   2016-04-25 06:51:17
 * @Last Modified time: 2016-04-26 22:42:06
 */

'use strict';

// 定义一个模块，依赖于 jQuery
define(['jquery'], function() {
    (function() {

        var Modal = (function() {
            function Modal($ele, opts) {
                // 合并参数
                this.settings = $.extend(true, $.fn.modal.defaults, opts || {});
                this.$ele = $ele;
                this.init();
            }
            Modal.prototype = {
                init: function() {
                    this.selectors = this.settings.selectors;

                    // 获取模态框的结构
                    this.$mask = $(this.selectors.mask); // 模态框
                    this.$dialog = $(this.selectors.dialog); // 对话框
                    // 检测是否使用动画过渡效果
                    if (this.settings.transtion) {
                        this.$dialog.addClass('fade');
                    }
                    this._initEvent();
                },
                _initEvent: function() {
                    var that = this;
                    var callback = this.settings.callback;

                    /*点击显示对话框*/
                    this.$ele.on('click', function() {
                        that.$mask.addClass('show');
                        that.$dialog.addClass('show');
                    });
                    /*点击确认关闭对话框，运行回调函数*/
                    this.$dialog.on('click', this.selectors.confirm, function() {
                        that.$mask.removeClass('show');
                        that.$dialog.removeClass('show');
                        if (callback && $.type(callback) === 'function') {
                            callback();
                        }
                    });
                    /*点击取消关闭对话框*/
                    this.$dialog.on('click', this.selectors.cancel, function() {
                        that.$mask.removeClass('show');
                        that.$dialog.removeClass('show');
                    });
                    /*点击遮罩层关闭对话框*/
                    this.$mask.on('click', function() {
                        that.$mask.removeClass('show');
                        that.$dialog.removeClass('show');
                    });
                }
            }
            return Modal;
        })();


        $.fn.modal = function(opts) {
            // 单例模式
            return this.each(function() {
                var $this = $(this);
                // 获取实例的数据
                var instance = $this.data('Modal');
                // 如果实例的数据不存在
                if (!instance) {
                    // 则创建实例
                    instance = new Modal($this, opts);
                    // 缓存实例数据到当前节点上
                    $this.data('Modal', instance);
                }
            });
        };
        // 组件的默认配置参数
        $.fn.modal.defaults = {
            // 选择符的参数，用于获取页面上的元素
            selectors: {
                mask: '.modal-mask', // 遮罩层
                dialog: '.modal-dialog', // 对话框
                confirm: '.confirm', // 确认按钮
                cancel: '.cancel' // 取消按钮
            },
            callback: null // 点击确认按钮运行的函数
        };
    })(jQuery);
});