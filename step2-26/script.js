/*
 * @Author: Mertens
 * @Date:   2016-04-17 13:40:39
 * @Last Modified time: 2016-04-20 11:04:15
 */

'use strict';

(function($) {
    // 存放每个飞船的数据
    var arrElements = [];
    var prevElement = null;
    var crtShipOrder = null;
    var $universe = $('.universe');
    var $controlPanel = $('.control'); 


    // 默认参数
    var defaults = {
        order: 1,
        status: 'stop',
        energy: 100,
        decrement: 5, // 能源每秒消耗量
        increment: 2, // 能源每秒增量
        angularVelocity: 30 // 飞船飞行每秒旋转的角度
    }

    /**
     * 根据操作创建飞船、操作飞船
     *
     * @param {object}  
     */
    $.fn.spaceShipRotate = function(opts) {

        opts = $.extend({}, defaults, opts || {});

        /**
         * 飞船的构造函数
         */
        var Spaceship = function(options) {
            // 飞船的序号
            this.order = options.order;
            // 飞船的能量
            this.energy = options.energy;
            // 飞船的状态 
            this.status = options.status;
            // 能源每秒消耗量
            this.decrement = options.decrement;
            // 能源每秒增量
            this.increment = options.increment;
            // 飞船飞行每秒旋转的角度
            this.angularVelocity = options.angularVelocity;
            // 飞船已经飞行的角度
            this.angle = 0;
            // 表示该飞船是否正在飞行
            this.isFlying = false;
            // 飞船代表的元素
            this.element = this.createELement().get(0);
            this.element.originNode = this;
            // 飞船的控制条
            this.control = this.createControl().get(0);
            this.control.originNode = this;
        };

        /**
         * 创建一个飞船
         */
        Spaceship.prototype.createELement = function() {
            var tempHTML = '';
            tempHTML += '<div class="spaceship num' + this.order + '">';
            tempHTML += '<span class="energy" style="width: ' + this.energy + '%"></span>';
            tempHTML += '<span class="number">' + this.order + '号-' + this.energy + '%</span>';
            tempHTML += '</div>';
            var $temp = $(tempHTML);
            return $temp;
        };

        /**
         * 创建一个飞船的控制条
         *
         * @param {number} order 飞船的序号
         */
        Spaceship.prototype.createControl = function() {
            var tempHTML = '';
            tempHTML += '<dl class="clearfix">';
            tempHTML += '<dt>对' + this.order + '号飞船下达指令</dt>';
            tempHTML += '<dd id="start">开始飞行</dd>';
            tempHTML += '<dd id="stop">停止飞行</dd>';
            tempHTML += '<dd id="destory">销毁</dd>';
            tempHTML += '</dl>';
            var $temp = $(tempHTML);
            return $temp;
        };

        /**
         * 把飞船和控制条添加到文档
         */
        Spaceship.prototype.addToDoc = function() {
            // 将飞船加入到宇宙
            $universe.append(this.element);
            // 添加该飞船的控制条到控制面板
            $controlPanel.append(this.control);
        };

        /**
         * 发射一艘飞船
         */
        function launchShip(options) {
            // 找出要发射飞船的序号
            options.order = queryOrder(arrElements);
            if (options.order > 4) {
                alert('最多只能发射 4 艘飞船！');
                return;
            }
            // 创建新的飞船
            var tempShip = new Spaceship(options);
            // 将飞船的数据存入到数组中储存
            arrElements[options.order - 1] = tempShip;
            // 将飞船和控制条加入到文档（发射）
            arrElements[options.order - 1].addToDoc();

            /**
             * 查询要发射飞船的序号，遍历数组中的每一项
             * 如果当前项的值是 undefined 或者 null
             * 返回当前项的索引 + 1
             * 
             * @param {array} arr 存放飞船的数组
             */
            function queryOrder(arr) {
                for (var i = 0; i < arr.length; i++) {
                    if (arr[i] === undefined || arr[i] === null) {
                        return i + 1;
                    }
                }
                return i + 1;
            };
        };

        /**
         * 控制条的处理函数
         *
         * @param {object} options 操控当前选中飞船的参数
         *  options {
         *      order: {number},
         *      status: {string},
         *      decrement: {number},
         *      increment: {number},
         *      angularVelocity: {number}
         *  }
         */
        function handler(options) {

            // 储存当前选中飞船的节点
            var node = arrElements[options.order - 1];

            // 更改飞船的状态
            node.status = options.status;



            // 对飞船的操作
            var handlers = (function() {

                function start() {
                    if (!node.isFlying) {
                        // 每一次开始分型都从上一次结束的终点开始
                        $(node.element).css({
                            transform: 'rotate(' + node.angle + 'deg)'
                        });
                        node.status = 'start';
                        clearInterval(node.intervalID);
                        animate(node);
                    }

                };

                function stop() {
                    node.isFlying = false;
                    node.status = 'stop';
                };

                function destory() {
                    arrElements[options.order - 1] = null;
                    $(node.control).remove();
                    $(node.element).remove();
                };
                return {
                    start: start,
                    stop: stop,
                    destory: destory
                };
            }());

            // 操控飞船
            handlers[options.status]();
        }

        /*
         * 运动函数
         * 
         * 飞船飞行
         * 能源变化
         * 能源百分数变化
         */
        function animate(node) {

            // 刷新一帧的时间间隔
            var RATE = 16;

            // 刷新一次减少的能量
            var decrement = (node.decrement / (1000 / RATE));

            // 刷新一次补充的能量
            var increment = (node.increment / (1000 / RATE));

            // 刷新一次旋转的角度
            var angularVelocity = node.angularVelocity / (1000 / RATE);

            var step = function() {

                // 不在飞行状态，当前状态为飞行，有能量才飞行
                if (node.status === 'start' && node.energy > 0) {
                    node.isFlying = true;
                    node.energy -= decrement;
                    node.angle += angularVelocity;
                }
                // 能量耗尽，将状态设置为停止 
                else if (node.energy < 0) {
                    node.energy = 0;
                    node.isFlying = false;
                    node.status = 'stop';
                }
                // 不在飞行状态，且当前状态为停止
                else if (!node.isFlying && node.status === 'stop' && node.energy > 100) {
                    node.energy = 100;
                    clearInterval(node.intervalID);
                }
                node.energy += increment;
                $(node.element).css({
                    transform: 'rotate(' + node.angle + 'deg)'
                });
                $(node.element).children('.energy').css({
                    width: node.energy + '%'
                });
                $(node.element).children('.number').text(node.order + '号 - ' + Math.floor(node.energy) + ' %');
            };
            node.intervalID = setInterval(step, RATE);
        };

        function clickHandler(event) {
            var target = event.target;
            var parent = target.parentNode;
            // 储存飞船信息的节点
            var node = parent.originNode;
            // 点击发射飞船
            if (target.id === 'new_ship') {
                launchShip(opts);
            }
            // 选中飞船
            else if (target.tagName === 'DT' && parent.tagName === 'DL') {
                crtShipOrder = node.order;
                opts.order = crtShipOrder;
                if (prevElement !== null) {
                    $(prevElement).removeClass('is-crt');
                }
                $(parent).addClass('is-crt');
                prevElement = parent;
            }
            // 选择飞船的状态
            else if (target.tagName === 'DD' && parent.tagName === 'DL') {
                if (crtShipOrder === node.order && crtShipOrder === opts.order) {
                    opts.status = target.id;
                    handler(opts);
                }
            }
        }

        $(this).click(clickHandler);
    };
})(jQuery);

$('.control').spaceShipRotate();