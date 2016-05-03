/*
 * @Author: Mertens
 * @Date:   2016-04-29 15:27:42
 * @Last Modified time: 2016-05-03 11:23:58
 */

'use strict';
define(['jquery'], function() {

    /* 默认设置参数 */
    var defaults = (function() {
        var now = new Date();
        var year = now.getFullYear();
        var month = now.getMonth() + 1;
        var settings = {
            selectors: {
                root: '#_calendar'
            },
            legend: 'Calendar', // 日期选择框的标题
            month: month,
            year: year,
            selectDuration: true, // 是否选择一个时间段
            min: 2, // 选择的最小时间间隔
            max: 7, // 选择的最大时间间隔
            // 处理一个日期对象或者多个日期对象的函数
            callback: function(arr){
                console.dir(arr);
            }
        }
        return settings;
    })();

    // 自定义属性的命名空间
    var NAMESPACE = 'data-calendar-';

    // 日期选择框的 html
    var INPUT_BOX_HTML =
        '<p>' +
            '<label for="selectDate">' + defaults.legend +
                '<input type="text" id="selectDate" class="input-box">' +
            '</label>' +
        '</p>';

    // 生成日历模态框头部的 html
    var MODAL_HD_HTML = 
        '<div class="calendar-hd">' +
            /*选择年份、月份 start*/
            '<div class="select-fix">' +
                '<div class="select">' +
                    '<div class="select-month">' +
                        '<input type="text" value="' + defaults.month + '月">' +
                        '<div class="btn-wrap">' +
                            '<div class="sub-btn-prev" ' + NAMESPACE + 'prevMon' + '></div>' +
                            '<div class="sub-btn-next" ' + NAMESPACE + 'nextMon' + '></div>' +
                        '</div>' +
                    '</div>' +
                    '<div class="select-year">' +
                        '<input type="text" value="' + defaults.year + '">' +
                        '<div class="btn-wrap">' +
                            '<div class="sub-btn-prev"' + NAMESPACE + 'prevYear' + '></div>' +
                            '<div class="sub-btn-next"' + NAMESPACE + 'nextYear' + '></div>' +
                        '</div>' +
                    '</div>' +
                '</div>' + // select
            '</div>' + // select-fix
            /*选择年份、月份 end*/
            '<div class="prev btn" ' + NAMESPACE + 'prevMon' + '></div>' +
            '<div class="next btn" ' + NAMESPACE + 'nextMon' + '></div>' +
        '</div>'; // calendar-hd

    // 日期表格的 html
    var DATE_ITEM_HTML = (function() {
        var tempHtml = '<li>';
        tempHtml += '<ol class="days">';
        for (var i = 0; i < 42; i++) {
            tempHtml += '<li></li>';
        }
        tempHtml += '</ol>';
        tempHtml += '</li>';
        return tempHtml;
    })();

    // 星期显示文字
    var WEEK = ['日', '一', '二', '三', '四', '五', '六'];

    // 一天的毫秒数
    var MS_PER_DAY = 1000 * 60 * 60 * 24;

    var Calendar = function(options){
        this.settings = $.extend({}, defaults, options || {});
        this.$calendarElement = $(this.settings.selectors.root);
        this.year = this.settings.year;
        this.month = this.settings.month - 1;

        this.$calendarModal = null;
        this.$modalContent = null;
        this.$monthSelected = null;
        this.$yearSelected = null;
        this.$dateItems = null;

        /*点击选择日期的时候用到的对象*/
        this.$prevSelectedDate = null; // (选择一天)上一个选中的日期对象

        this.$startDateItem = null; // (选择时间段)第一个选中日期的 jq 对象
        this.$endDateItem = null; // (选择时间段)第二个选中日期的 jq 对象
        this.dateItemsArr = []; // (选择时间段)选中所有日期的 jq 对象(jQElement)
        this.startTime; // (选择时间段)开始时间
        this.endTime; // (选择时间段)结束时间

        this.init();
    }
    Calendar.prototype = {
        /**
        * 计算当前月份的天数 
        */
        getDayNums: function (y, m) {
            switch (m) {
                case 2:
                    return isLeapYear(y) ? 29 : 28;
                case 4:
                case 6:
                case 9:
                case 11:
                    return 30;
                default:
                    return 31;
            }
            /* 判断是否为闰年 */
            function isLeapYear() {
                if ((y % 4 === 0 && y % 400 !== 0) || y % 400 === 0) {
                    return true;
                } else {
                    return false;
                }
            }
        },
        /**
        * 绘制日历
        */
        drawCalendar: function () {
            var _this = this;
            drawInputBox();
            drawCalendarModal();

            /*绘制日期选择框*/
            function drawInputBox() {
                _this.$calendarElement.append(INPUT_BOX_HTML);
            }

            /*绘制日期模态框*/
            function drawCalendarModal() {
                _this.$calendarModal = $('<div class="calendar-modal hidden"></div>');
                _this.$modalContent = $('<div class="calendar-ct"></div>');
                drawHeader();
                drawWeek();
                drawDate();
                _this.$calendarModal.append(_this.$modalContent);
                _this.$calendarElement.append(_this.$calendarModal);
                _this.$monthSelected = _this.$calendarElement.find('.select-month input');
                _this.$yearSelected = _this.$calendarElement.find('.select-year input');
                // 绘制头部
                function drawHeader() {
                    _this.$calendarModal.append(MODAL_HD_HTML);
                }

                // 绘制星期
                function drawWeek() {
                    var weekHtml = '<ul class="week">';
                    for (var i = 0; i < WEEK.length; i++) {
                        weekHtml += '<li>' + WEEK[i] + '</li>';
                    }
                    weekHtml += '<ul>';
                    _this.$modalContent.append(weekHtml);
                }

                // 绘制日期区域
                function drawDate() {
                    // 绘制日期部分
                    /*
                     * 日期部分绘制三个表格，用于小时动画效果
                     */
                    var dateItemsHtml = '<ul class="date-items">';
                    var tempHtml = DATE_ITEM_HTML;
                    // 绘制三个日期表格
                    tempHtml += tempHtml + tempHtml;
                    dateItemsHtml += tempHtml;
                    dateItemsHtml += '</ul>';
                    _this.$modalContent.append(dateItemsHtml);
                }
            }
        },
        /**
        * 填充日期表格
        * 
        * param {jqELement} $days 当前日期表格的对象
        */
        fillDate: function ($days, y, m) {
            // 取得这个月一共有多少天
            var dayNums = this.getDayNums(y, m + 1);
            // 这个月的一号是星期几
            // 然后确定填充日期开始的位置
            var dateIndex = new Date(y, m).getDay();
            if (dateIndex === 0) {
                dateIndex = 7;
            }
            var crtMonDays = $days.find('li');
            var i = 0;
            while (i < dayNums) {
                crtMonDays.eq(dateIndex).addClass('is-crt').html(i + 1);
                i++;
                dateIndex++;
            }
        },
        /**
        * 渲染日历
        * 1. 先绘制日历
        * 2. 再根据默认的参数和以后的操作，填充日期列表的数据
        */
        render: function () {
            var $dateItems;
            this.drawCalendar();
            // 取得日历的表格，之后就填充
            $dateItems = this.$calendarElement.find('.days');
            this.fillDate($dateItems.eq(0), this.year, this.month - 1);
            this.fillDate($dateItems.eq(1), this.year, this.month);
            this.fillDate($dateItems.eq(2), this.year, this.month + 1);
        },
        /*
        * 初始化事件
        */
        event: function () {
            var _this = this;
            /*
            * 点击输入框显示/隐藏模态框
            */
            this.$calendarElement.on('click', '.input-box', function(){
                _this.$calendarModal.toggleClass('hidden');
            });

            /**
            * 前一个月份的点击事件
            */
            this.$calendarElement.on('click', '[data-calendar-prevmon]', function() {
                // 切换日期表格，实现滑动动画
                $dateItems.addClass('slide').css('margin-left', 0);
                month--;
                if (month === -1) {
                    month = 11;
                    year--;
                }
                clickMonHandler(month, year, true);
            });
            /**
            * 下一个月份的点击事件
            */
            this.$calendarElement.on('click', '[data-calendar-nextmon]', function() {
                // 切换日期表格，实现滑动动画
                $dateItems.addClass('slide').css('margin-left', '-200%');
                month++;
                if (month === 12) {
                    month = 0;
                    year++;
                }
                clickMonHandler(month, year, false);
            });
            /**
            * 前一个年份的点击事件
            */
            this.$calendarElement.on('click', '[data-calendar-prevYear]', function() {
                year--;
                clickYearHandler(month, year, true);
            });
            /**
            * 下一个年份的点击事件
            */
            this.$calendarElement.on('click', '[data-calendar-nextYear]', function() {
                year++;
                clickYearHandler(month, year, false);
            });
            /**
            * 日期的点击事件
            */
            this.$calendarElement.on('click', 'li.is-crt', function() {
                var $this = $(this);
                // 选择时间段模式还是时间点模式
                if (!_this.settings.selectDuration) {
                    clickDateHandler($this);
                } else {
                    clickDurationHandler($this);
                }   
            });

            /*
            * 实现思路：
            *
            * 有三个月份的日期表格
            * 1. 点击前一个，就加上实现动画的 class 向左边切换（反之向右边）
            * 2. 把最后（选择下一个就删除最前的）一个日期表格删除，prepend（选择下一个 append） 一个日期表格
            * 3. 移除实现动画的 class， 瞬间复位
            */
            function clickMonHandler(month, year, prev) {
                this.$monthSelected.val(month + 1 + '月');
                $yearSelected.val(year);
                setTimeout(function() {
                    var $dateItem = $(DATE_ITEM_HTML);
                    if (prev) {
                        this.fillDate($dateItem, year, month - 1);
                        $dateItems.children('li:last').remove();
                        $dateItems.prepend($dateItem);
                    } else {
                        this.fillDate($dateItem, year, month + 1);
                        $dateItems.children('li:first').remove();
                        $dateItems.append($dateItem);
                    }
                    $dateItems.removeClass('slide').css('margin-left', '-100%');
                }, 300);
            }

            /*
            * 实现思路：
            *
            * 如果是选择前一个年份
            * 1. 删掉第一个日期表格
            * 2. 根据最新的数据生成一个新的日期表格
            * 3. 添加动画 class，切换表格
            * 4. 删掉其余的两个旧的表格
            * 5. 在当前日期表格前后添加新的日期表格
            * 6. 移除动画 class，瞬间复位
            */
            function clickYearHandler(month, year, prev) {
                this.$monthSelected.val(month + 1 + '月');
                $yearSelected.val(year);
                var $dateItem;
                var $prevDateItem;
                var $nextDateItem;
                $dateItem = $(DATE_ITEM_HTML);
                this.fillDate($dateItem, year, month);
                $prevDateItem = $(DATE_ITEM_HTML);
                this.fillDate($prevDateItem, year, month - 1);
                $nextDateItem = $(DATE_ITEM_HTML);
                this.fillDate($nextDateItem, year, month + 1);
                if (prev) {
                    $dateItems.children('li:first').remove();
                    $dateItems.prepend($dateItem);
                    $dateItems.addClass('slide').css('margin-left', '0');
                    $dateItems.children('li:last').remove();
                    $dateItems.children('li:last').remove();
                } else {
                    $dateItems.children('li:last').remove();
                    $dateItems.append($dateItem);
                    $dateItems.addClass('slide').css('margin-left', '-200%');
                    $dateItems.children('li:first').remove();
                    $dateItems.children('li:first').remove();
                }
                $dateItems.prepend($prevDateItem);
                $dateItems.append($nextDateItem);
                setTimeout(function() {
                    $dateItems.removeClass('slide').css('margin-left', '-100%');
                }, 300);
            }

            /*
            * 选择单个日期的模式
            *
            * param {jqElement} $crtElement 当前选中 li 的 jq 对象
            */
            function clickDateHandler($crtElement){
                var dateNum = parseInt($crtElement.html());
                var callback = this.settings.callback;
                if (_this.$prevSelectedDate) {
                    _this.$prevSelectedDate.removeClass('selected');
                }
                _this.$prevSelectedDate = $crtElement;
                $crtElement.addClass('selected')
                           .data('dateObj', new Date(year, month, dateNum));
                callback($crtElement.data('dateObj'));
            }
            /*
            * 选择一个时间段的模式
            *
            * param {jqElement} $crtElement 当前选中 li 的 jq 对象
            */
            function clickDurationHandler($crtElement) {
                var dateNum = parseInt($crtElement.html());
                var callback = _this.settings.callback;
                var days;
                /*
                * 点击一个日期，会给当前的 jq 元素设置以下数据
                * {
                *   dateObj: new Date(year, month, dateNum),
                *   month: month + 1,
                *   year: year,
                *   date: dateNum，
                *   status:'selected',
                *   flag: 'start'
                * }
                *
                */
                $crtElement.data({
                                dateObj: new Date(_this.year, _this.month, dateNum),
                                month: _this.month + 1,
                                year: _this.year,
                                date: dateNum
                            });
                // 如果没有选择开始日期
                if (!_this.$startDateItem) {
                    _this.$startDateItem = $crtElement;
                    _this.$startDateItem.data({
                            status:'selected',
                            flag: 'start'
                        })
                        .addClass('selected');
                    _this.startTime = _this.$startDateItem.data('dateObj').getTime();
                } 
                // 如果已经选择了开始日期
                else if (!_this.$endDateItem) {
                    // 如果点击开始日期，则取消之前的点击操作
                    if($crtElement.data('status') === 'selected'){
                        $crtElement.data({
                                        flag: '',
                                        status: ''
                                    })
                                   .removeClass('selected');
                        _this.$startDateItem = null;
                    } else {
                        _this.endTime = $crtElement.data('dateObj').getTime();
                        // 计算日期跨度
                        days = Math.abs((_this.endTime - _this.startTime) / MS_PER_DAY) + 1;

                        // 如果满足日期跨度限制，则运行回调函数
                        if (days <= _this.settings.max && days >= _this.settings.min) {
                            _this.$endDateItem = $crtElement;
                            _this.$startDateItem.data('flag', 'start');
                            _this.$endDateItem.data({
                                            status:'selected',
                                            flag: 'end'
                                        })
                                        .addClass('selected');
                            selectDuration(days);
                        } else if (days < _this.settings.min) {
                            alert('最少要选择 ' + _this.settings.min + ' 天！');
                        } else if (days > _this.settings.max) {
                            alert('最多只能选择 ' + _this.settings.max + ' 天！');
                        }
                    }  
                } 
                // 已经选择了开始日期和结束日期
                else {
                    // 如果点击的不是之前选中的开始和结束日期，则重新选择日期
                    if ($crtElement.data('status') !== 'selected') {

                        // 移除给选中日期设定的特殊样式
                        for (var i = 0; i < _this.dateItemsArr.length; i++) {
                            _this.dateItemsArr[i].removeClass('selected duration');
                        }
                        _this.dateItemsArr = [];

                        _this.$startDateItem.data('status', '');
                        _this.$endDateItem.data('status', '');
                        _this.$startDateItem = $crtElement;
                        _this.$startDateItem.data('status', 'selected')
                                      .addClass('selected');
                        _this.startTime = _this.$startDateItem.data('dateObj').getTime();
                        _this.$endDateItem = null;
                    }
                    // 如果点击的是之前选中的开始和结束日期
                    // 1. 如果是点击开始日期，则将结束日期作为开始日期
                    // 2. 重新选择结束日期
                    // 3. 如果是点击结束，则重新选择结束日期
                    else {
                        if($crtElement.data('flag') === 'start') {
                            // 移除给选中日期设定的特殊样式
                            for (var i = 0; i < _this.dateItemsArr.length; i++) {
                                if(_this.dateItemsArr[i].data('flag') !== 'end') {
                                    _this.dateItemsArr[i].removeClass('selected duration');
                                }
                            }
                            _this.$startDateItem = _this.$endDateItem;
                            _this.$startDateItem.data('flag', 'start');
                            _this.$endDateItem = null;
                        } else {
                            // 移除给选中日期设定的特殊样式
                            for (var i = 0; i < _this.dateItemsArr.length; i++) {
                                if(_this.dateItemsArr[i].data('flag') !== 'start') {
                                    _this.dateItemsArr[i].removeClass('selected duration');
                                }
                            }
                            _this.$endDateItem.data({
                                status: '',
                                flag: ''
                            });
                            _this.$endDateItem = null;
                        }
                        $crtElement.data('status', '');
                        _this.dateItemsArr = [];
                    }
                } 

                /*
                * 选择一个时间段
                */
                function selectDuration(nums) {

                    var $startDate = _this.$startDateItem.data('month') < _this.$endDateItem.data('month') ?
                        _this.$startDateItem : _this.$startDateItem.data('date') < _this.$endDateItem.data('date') ? _this.$startDateItem : _this.$endDateItem;
                    var $endDate = _this.$startDateItem === $startDate ? _this.$endDateItem : _this.$startDateItem;
                    var tempArr = [];
                    var dateArr = [];
                    var year;
                    var month;
                    var i;
                    var len;

                    year = $startDate.data('year');
                    dateArr.push($startDate.data('dateObj'));
                    _this.dateItemsArr.push($startDate);
                    if ($startDate.data('month') === $endDate.data('month')) {
                        month = $startDate.data('month');
                        tempArr = $startDate.nextAll('.is-crt');
                        i = 0;
                        len = nums - 2;
                        while (i < len) {
                            _this.dateItemsArr.push($(tempArr[i]).addClass('duration'));
                            dateArr.push(new Date(year, month, tempArr[i].innerHTML));
                            i++;
                        }
                    } else {
                        month = $startDate.data('month');
                        tempArr = $startDate.nextAll('.is-crt');
                        i = 0;
                        len = tempArr.length;
                        while(i < len){
                            _this.dateItemsArr.push($(tempArr[i]).addClass('duration'));
                            dateArr.push(new Date(year, month, tempArr[i].innerHTML));
                            i++
                        }
                        tempArr = $endDate.prevAll('.is-crt');
                        len = tempArr.length;
                        i = 0;
                        while(i < len){
                            _this.dateItemsArr.push($(tempArr[i]).addClass('duration'));
                            dateArr.push(new Date(year, month, tempArr[i].innerHTML));
                            i++
                        }
                    }
                    _this.dateItemsArr.push($endDate);
                    dateArr.push($endDate.data('dateObj'));
                    callback(dateArr);
                }
            }
        },
        init: function(){
            this.render();
            this.event();
        }
    };
    return Calendar;
});