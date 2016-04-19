/*
 * @Author: Mertens
 * @Date:   2016-04-17 13:40:39
 * @Last Modified time: 2016-04-19 15:43:23
 */

'use strict';

(function($) {
    // 存放每个飞船的数据
    var arrElements = [];
    var prevElement = null;
    var $universe = $('.universe');
    var $controlPanel = $('.control');


    // 默认参数
    var defaults = {
        order: 0,
        status: 'stop',
        time: 5000,
        angularVelocity: 30
    }

    /**
     * 根据操作创建飞船、操作飞船
     *
     * @param {object}  options{
                            time: 控制飞船飞行的时间
                            angularVelocity: 飞船飞行每秒旋转的角度
                        }
     */
    $.fn.spaceShipRotate = function(options) {
        options = $.extend({}, defaults, options || {});

        // 飞船的构造函数
        var Spaceship = function(order) {
            this.order = order; // 飞船的序号
            this.energy = 100; // 飞船的能量
            this.status = 'stop'; // 飞船的状态
            this.angle = 0; // 飞船已经飞行的角度
            this.isFlying = false; // 表示该飞船是否正在飞行
            this.element = this.createELement(order).get(0); // 飞船代表的元素
            this.element.originNode = this;
            this.control = this.createControl(order).get(0); // 飞船的控制条
            this.control.originNode = this;
        };

        /**
         * 创建一个飞船
         *
         * @param {number} order 飞船的序号
         */
        Spaceship.prototype.createELement = function(order) {
            var tempHTML = '';
            tempHTML += '<div class="spaceship num' + order + '">';
            tempHTML += '<span class="energy" style="width: ' + this.energy + '%"></span>';
            tempHTML += '<span class="number">' + order + '号-' + this.energy + '%</span>';
            tempHTML += '</div>';
            var $temp = $(tempHTML);
            return $temp;
        };

        /**
         * 创建一个飞船的控制条
         *
         * @param {number} order 飞船的序号
         */
        Spaceship.prototype.createControl = function(order) {
            var tempHTML = '';
            tempHTML += '<dl class="clearfix">';
            tempHTML += '<dt>对' + order + '号飞船下达指令</dt>';
            tempHTML += '<dd id="start">开始飞行</dd>';
            tempHTML += '<dd id="stop">停止飞行</dd>';
            tempHTML += '<dd id="destory">销毁</dd>';
            tempHTML += '</dl>';
            var $temp = $(tempHTML);
            $temp.id = 'ship' + order;
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
        function launchShip() {
            // 找出要发射飞船的序号
            var order = queryOrder(arrElements);
            if (order > 4) {
                alert('最多只能发射 4 艘飞船！');
                return;
            }
            // 创建新的飞船
            var data = new Spaceship(order);
            // 将飞船的数据存入到数组中储存
            arrElements[order - 1] = data;
            // 将飞船和控制条加入到文档（发射）
            data.addToDoc();

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
         *      order: 当前选中飞船的序号,
         *      status: 对当前飞船的操作动作,
         *      time: 控制飞船飞行的时间,
         *      angularVelocity: 飞船飞行每秒旋转的角度
         *  }
         */
        function handler(options) {
            // 储存当前选中飞船的节点
            var node = arrElements[options.order - 1];
            // 当前选中的飞船
            var element = node.element;
            // 选中飞船的控制条
            var control = node.control;
            // 刷新一帧的时间间隔
            var RATE = 16;
            // 刷新一次减少的能量
            var decrement = 100 / (options.time / RATE);
            // 刷新一次旋转的角度
            var angularVelocity = options.angularVelocity / (1000 / RATE);

            // 对飞船的操作
            var handlers = (function() {
                function start() {
                    if (!node.isFlying) {
                        // 每一次开始分型都从上一次结束的终点开始
                        $(element).css({
                            transform: 'rotate(' + node.angle + 'deg)'
                        });
                        animate();
                        node.isFlying = true;
                    }

                    /*
                     * 运动函数
                     * 
                     * 飞船飞行
                     * 能源变化
                     * 能源百分数变化
                     */
                    function animate() {
                        var step = function() {
                            node.angle += angularVelocity;
                            // 有能量才飞行
                            if (node.energy > 0) {
                                node.energy -= decrement;
                                $(element).css({
                                    transform: 'rotate(' + node.angle + 'deg)'
                                });
                                $(element).children('.energy').css({
                                    width: node.energy + '%'
                                });
                                $(element).children('.number').text(node.order + '号 - ' + Math.floor(node.energy) + ' %');
                            }
                            // 能量耗尽，停止飞行动画 
                            else {
                                $(element).css({
                                    transform: 'rotate(' + node.angle + 'deg)'
                                });
                                $(element).children('.energy').css({
                                    width: '0%'
                                });
                                $(element).children('.number').text(node.order + '号 - 0 %');
                                clearInterval(node.intervalID);
                                node.isFlying = false;
                                node.energy = 100;
                            }
                        };
                        node.intervalID = setInterval(step, RATE);
                    };
                };

                function stop() {
                    clearInterval(node.intervalID);
                    node.isFlying = false;
                };

                function destory() {
                    arrElements[options.order - 1] = null;
                    $(control).remove();
                    $(element).remove();
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



        function clickHandler(event) {
            var target = event.target;
            var parent = target.parentNode;
            var data = parent.originNode;
            // 点击发射飞船
            if (target.id === 'new_ship') {
                launchShip();
            }
            // 选中飞船
            else if (target.tagName === 'DT' && parent.tagName === 'DL') {
                options.order = data.order;
                if (prevElement !== null) {
                    $(prevElement).removeClass('is-crt');
                }
                $(parent).addClass('is-crt');
                prevElement = parent;
            }
            // 选择飞船的状态
            else if (target.tagName === 'DD' && parent.tagName === 'DL') {
                if (options.order === data.order) {
                    options.status = target.id;
                    handler(options);
                }
            }
        }

        $(this).click(clickHandler);
    };
})(jQuery);

$('.control').spaceShipRotate({
    time: 20000,
    angularVelocity: 30
});