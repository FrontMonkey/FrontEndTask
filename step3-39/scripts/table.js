/*
 * @Author: Mertens
 * @Date:   2016-04-28 15:46:10
 * @Last Modified time: 2016-04-29 12:23:01
 */

'use strict';

define(['jquery'], function() {
    /*
     * 这个类的实例可以根据传入的数据生成表格，对表格进行排序
     * 
     * @class
     */
    function Table($ele, opts) {
        // 合并参数
        this.settings = $.extend(false, defaults, opts || {});
        this.$element = $ele; // 存放 table 的根节点
        this.$table = null; // 表格的对象
        this.$tHeader = null; // 表头的对象
        this.$tBody = null; // 表格内容的对象
        this.headerFixed = false; // 表头是否已经固定
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
            });
            // 如果固定表头开启
            if (this.settings.fixHeader) {
                /**
                 * 监听 window 的滚动事件
                 */
                $(window).on('scroll', function() {
                    that.fixHeader();
                });
            };
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
                htmlStr += '<thead>' + this._gTr(tHeadData, 'th') + '</thead>'
                htmlStr += '<tbody>' + this._gTr(tBodyData, 'td') + '</tbody>';
                htmlStr += '</table>';
                this.$table = $(htmlStr); // 生成表格，并将表格储存到 Table 的实例中
                this.$tHeader = this.$table.find('thead'); // 表头
                this.$tBody = this.$table.find('tbody'); // 内容
                this.$table.appendTo(this.$element) // 将表格添加到根节点下
                    .addClass(this.settings.tableClass); // 给 table 添加类名
                // 给具有点击排序功能的表头添加类名，以显示特殊的样式
                this.$tHeader.find('th + th').addClass(this.settings.sortClass);
            }
            // 如果已经生成表格
            else {
                // 则根据数据重新修改表格的内容区，不修改表头
                this.$tBody.html(this._gTr(tBodyData, 'td'));
            }
        },
        /**
         * 根据传入的数据生成行的 html 字符串(generate <tr>)
         * 
         * @param {array} arrData 表格的数据
         * @param {array} tagName 表格单元的标签，td 或者 th
         */
        _gTr: function(arrData, tagName) {
            var arrStr = '<tr>'; // 存放处理一维数组生成的字符串
            var MultiStr = ''; // 存放处理多维数组生成的字符串
            for (var i = 0; i < arrData.length; i++) {
                // 如果传入的数据是一维数组
                if ($.type(arrData[i]) !== 'array') {
                    // 生成一行的字符串
                    arrStr += '<' + tagName + '>' + arrData[i] + '</' + tagName + '>';
                }
                // 如果传入的数据是多维数组
                else {
                    // 生成多行的字符串
                    MultiStr += this._gTr(arrData[i], tagName);
                }
            }
            arrStr += '</tr>';
            if (MultiStr !== '') {
                return MultiStr;
            }
            return arrStr;
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
        },
        /**
         * 固定表头
         */
        fixHeader: function() {
            var offset = this.$table.offset(); // 表格相对于文档的偏移
            var scrollTop = $(window).scrollTop();
            var scrollLeft = $(window).scrollLeft();
            var tableHeight = this.$table.innerHeight(); // 表格本身的高度
            if (scrollTop > offset.top && scrollTop < (offset.top + tableHeight)) {
                if (!this.headerFixed) {
                    this.headerFixed = true;
                    // 新建另一个临时表头，填充视觉效果
                    this.$tempHeader = $(this._gTr(this.settings.data.head, 'th'));
                    // 将原来的表头设置绝对定位
                    this.$fixedHeader = this.$tHeader.find('tr').eq(0);
                    this.$tHeader.addClass('fixed').append(this.$tempHeader);
                    // 将设置绝对定位的表头的样式更改为和原来一样，这样就可以自适应宽度
                    _adaptWidth(this.$tempHeader.find('th'), this.$fixedHeader.find('th'));
                }
                // 应对出现横向滚动条的情况
                this.$fixedHeader.css({
                    left: offset.left - scrollLeft
                });
            } else {
                this.$tHeader.removeClass('fixed');
                if(this.$tempHeader){
                    this.$tempHeader.remove();
                }
                this.headerFixed = false;
            }

            /**
             * 根据参照元素的宽度给当前元素设置宽度
             * 
             * @param {jq对象} arrData 参照元素的集合
             * @param {jq对象} tagName 当前元素的集合
             */
            function _adaptWidth($refer, $crt) {
                for (var i = 0; i < $crt.length; i++) {
                    $crt.eq(i).width($refer.eq(i).width() + 1);
                }
            }
        }
    };
    /*
     * 默认配置参数
     */
    var defaults = {
        // 表格的数据
        data: {},
        tableClass: 'custom-table', // 给表格添加的类名
        sortClass: 'sort', // 给具有点击排序功能的表头单元格添加的类名
        fixHeader: false // 设置是否固定表头
    };

    return Table;
});