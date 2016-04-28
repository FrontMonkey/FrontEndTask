/*
 * @Author: Mertens
 * @Date:   2016-04-27 11:34:14
 * @Last Modified time: 2016-04-28 09:49:09
 */

'use strict';

define(['jquery'], function() {
    (function($) {
        /*
        * 这个类的实例可以根据传入的数据生成表格，对表格进行排序
        * 
        * @class
        */
        function Table($ele, opts) {
            // 合并参数
            this.settings = $.extend(false, $.fn.table.defaults, opts || {});
            this.$element = $ele; // 存放 table 的根节点
            this.init();
        };
        Table.prototype = {
            /**
             * 初始化插件
             */
            init: function() { 
                this.render();
                this.initEvent();
            },
            /**
             * 初始化事件
             */
            initEvent: function() {
                var that = this;
                /**
                 * 点击具有排序功能的表头时触发
                 */
                this.$table.find('.' + this.settings.sortClass).on('click', function() {
                    // 数据重排序
                    that.sort(this, that.settings.data.body, $(this).index());
                    // 重新渲染表格
                    that.render();
                })
            },
            /**
             * 渲染表格
             */
            render: function() {
                var tHeadData = this.settings.data.head; // 表头的数据
                var tBodyData = this.settings.data.body; // 表格内容的数据
                var htmlStr;
                // 如果表格没有生成，就生成表格
                if (!this.$table) {
                    htmlStr = '<table>';
                    htmlStr += '<thead>' + _gTr(tHeadData) + '</thead>'
                    htmlStr += '<tbody>' + _gTr(tBodyData) + '</tbody>';
                    htmlStr += '</table>';
                    this.$table = $(htmlStr); // 生成表格，并将表格储存到 Table 的实例中
                    this.$table.appendTo(this.$element); // 将表格添加到根节点下
                    // 给 table 添加类名
                    this.$table.addClass(this.settings.tableClass);
                    // 给具有点击排序功能的表头添加类名，以显示特殊的样式
                    this.$table.find('thead td + td').addClass(this.settings.sortClass);
                }
                // 如果已经生成表格
                else {
                    // 则根据数据重新修改表格的内容区，不修改表头 
                    this.$table.find('tbody').html(_gTr(tBodyData));
                }

                /**
                 * 根据传入的数据生成行的 html 字符串(generate <tr>)
                 * 
                 * @param {HTMLElement} ele 选中的元素
                 */
                function _gTr(arrData) {
                    var arrStr = '<tr>'; // 存放处理一维数组生成的字符串
                    var MultiStr = ''; // 存放处理多维数组生成的字符串
                    for (var i = 0; i < arrData.length; i++) {
                        // 如果传入的数据是一维数组
                        if ($.type(arrData[i]) !== 'array') {
                            // 生成一行的字符串
                            arrStr += '<td>' + arrData[i] + '</td>';
                        }
                        // 如果传入的数据是多维数组
                        else {
                            // 生成多行的字符串
                            MultiStr += _gTr(arrData[i]);
                        }
                    }
                    arrStr += '</tr>';
                    if (MultiStr !== '') {
                        return MultiStr;
                    }
                    return arrStr;
                };
            },
            /**
             * 给数组排序
             * 
             * @param {HTMLElement} ele 选中的元素
             * @param {array} data      储存数据的数组
             * @param {number} index    选中元素的索引
             */
            sort: function(ele, data, index) {
                // 升序排序数组
                if (ele.ascending) {
                    data.sort(function(a, b) {
                        return a[index] - b[index];
                    });
                    // 下次点击降序排序
                    ele.ascending = false;
                }
                // 降序排序 
                else {
                    data.sort(function(b, a) {
                        return a[index] - b[index];
                    });
                    // 下次升序排序
                    ele.ascending = true;
                }
            }
        };
        $.fn.table = function(opts) {
            return this.each(function(){
                var $this = $(this);
                var instance = $this.data('Table');
                if (!instance) {
                    instance = new Table($this, opts);
                    $this.data('Table', instance);
                }
            });
        };
        /**
        * 默认配置参数
        */
        $.fn.table.defaults = {
            // 表格的数据
            data: {},
            tableClass: 'sort-table', // 给表格添加的类名
            sortClass: 'sort' // 给具有点击排序功能的表头单元格添加的类名
        };
    })(jQuery);
});