/*
 * @Author: Mertens
 * @Date:   2016-04-21 00:13:36
 * @Last Modified time: 2016-04-24 10:31:51
 */

(function($) {
    // 存放每个飞船的数据
    var arrElements = [];
    var prevElement = null;
    var crtShipOrder = null;
    var SYSTEM = {
        dynamicSystem: {
            slow: {
                speed: 30,
                decrement: 5
            },
            medium: {
                speed: 50,
                decrement: 7
            },
            fast: {
                speed: 70,
                decrement: 9
            }
        },
        energySystem: {
            slow: {
                increment: 2
            },
            medium: {
                increment: 3
            },
            fast: {
                increment: 4
            }
        }
    };

    var globalOptions = {
        // 默认的设置飞船特定的参数
        defaults: {
            order: 1, // 设置序号
            status: 'stop', // 设置状态
            energy: 100, // 设置能量 %
            decrement: 5, // 设置能源每秒消耗量 %
            increment: 2, // 设置能源每秒增量 %
            speed: 30, // 设置飞行速度 px
            radius: 220 // 设置飞行半径 px
        },
        universe: '.universe', // 获取宇宙的选择器
        shipControl: '.control', // 获取控制面板的选择器
        flightLog: '#flight_log' // 获取飞行日志的选择器
    };

    /**
     * 根据操作创建飞船、操作飞船
     *
     * @param {object}  
     */
    $.fn.spaceShipSystem = function(opts) {

        opts = $.extend({}, globalOptions.defaults, globalOptions.defaults || {});
        var $universe = $(globalOptions.universe);
        var $shipControl = $(globalOptions.shipControl);
        var flightLog = $(globalOptions.flightLog).get(0);

        var BUS = function(data) {
            this.data = data;
            this.adapter = function() {
                switch (this.data) {
                    case 0001:
                        return 'start';
                    case 0010:
                        return 'stop';
                    case 1100:
                        return 'destory';
                    case 'start':
                        return 0001;
                    case 'stop':
                        return 0010;
                    case 'destory':
                        return 1100;
                }
            };
            this.send = function(handler, handleOpts) {
                var i = 0;
                var status = handleOpts.status;
                var msg = {
                    '1': '飞行',
                    '8': '停止飞行',
                    '1100': '销毁'
                }
                handleOpts.status = this.adapter();
                (function recurse() {
                    flightLog.innerHTML += '对 ' + handleOpts.order + ' 号飞船发送 ' + msg[handleOpts.status] + ' 命令<br>';
                    if (Math.random() > .9) {
                        flightLog.innerHTML += '命令丢包，重新发送 ' + msg[handleOpts.status] + ' 命令<br>';
                        setTimeout(function() {
                            recurse();
                        }, 500);

                    } else {
                        setTimeout(function() {
                            flightLog.innerHTML += '对 ' + handleOpts.order + ' 号飞船发送 ' + msg[handleOpts.status+''] + ' 命令成功<br>';
                            handler(handleOpts);
                        }, 500);
                    }
                })();
            };
        };

        /**
         * 飞船的构造函数
         */
        var Spaceship = function(shipOpts) {
            // 飞船的序号
            this.order = shipOpts.order;

            // 飞船的能量
            this.energy = shipOpts.energy;

            // 飞船的状态 
            this.status = shipOpts.status;

            // 能源每秒消耗量
            this.decrement = shipOpts.decrement;

            // 能源每秒增量
            this.increment = shipOpts.increment;

            // 飞船的飞行速度
            this.speed = shipOpts.speed;

            // 飞船的飞行半径
            this.radius = shipOpts.radius;

            // 飞船已经飞行的角度
            this.angle = 0;

            // 表示该飞船是否正在飞行
            this.isFlying = false;

            // 飞船代表的元素
            this.ship = this.createShip().get(0);
            this.ship.originNode = this;

            // 飞船的控制条 .elements
            this.control = this.createControl().get(0);
            this.control.originNode = this;
        };

        /**
         * 创建一艘飞船
         */
        Spaceship.prototype.createShip = function() {
            var tempHTML = '';
            tempHTML += '<div class="spaceship">';
            tempHTML += '<span class="energy"></span>';
            tempHTML += '<a href="javascript:;" class="msg">' + this.order + ' 号 - ' + this.energy + '%</a>';
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
            tempHTML += '<dl>';
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
            $universe.append(this.ship);
            // 添加该飞船的控制条到控制面板
            $shipControl.append(this.control);
        };

        function clickHandler(event) {
            var target = event.target;
            var bus = new BUS(target.id);
            var parent = target.parentNode;
            // 储存飞船信息的节点
            var node = parent.originNode;
            // 点击发射飞船
            if (target.id === 'launch') {
                var systemOpts = _getOpts(document.forms['controlForm']);
                opts = $.extend({}, opts, SYSTEM.dynamicSystem[systemOpts.dynamicSystem]);
                opts = $.extend({}, opts, SYSTEM.energySystem[systemOpts.energySystem]);
                _launchShip(opts);
            }
            // 传递指令，控制飞船
            else if (target.tagName === 'DD' && parent.tagName === 'DL') {
                opts.order = node.order;
                bus.send(_handler, opts);
            }

            function _getOpts(form) {
                var len = form.elements.length;
                var i;
                var field = null;
                var tmpOpts = {};

                for (i = 0; i < len; i++) {
                    field = form.elements[i];
                    switch (field.type) {
                        case 'radio':
                            if (!field.checked) {
                                break;
                            }
                        default:
                            tmpOpts[field.name] = field.value;
                    }
                }
                return tmpOpts;
            }
            /**
             * 发射一艘飞船
             */
            function _launchShip(newShipOpts) {
                // 找出要发射飞船的序号
                var order = _queryOrder(arrElements);
                if (order > 4) {
                    alert('最多只能发射 4 艘飞船！');
                    return;
                } else {
                    newShipOpts.order = order;
                }
                // 创建新的飞船
                var tempShip = new Spaceship(newShipOpts);

                // 将飞船和控制条加入到文档（发射）
                tempShip.addToDoc();

                // 将飞船的数据存入到数组中储存
                arrElements[newShipOpts.order - 1] = tempShip;

                flightLog.innerHTML += newShipOpts.order + '号飞船发射成功~~！<br>';

                /**
                 * 查询要发射飞船的序号，遍历数组中的每一项
                 * 如果当前项的值是 undefined 或者 null
                 * 返回当前项的索引 + 1
                 * 
                 * @param {array} arr 存放飞船的数组
                 */
                function _queryOrder(arr) {
                    for (var i = 0; i < arr.length; i++) {
                        if (arr[i] === undefined || arr[i] === null) {
                            return i + 1;
                        }
                    }
                    return i + 1;
                };
            };

            /**
             * 点击控制条的处理函数
             *
             * @param {object} handleOpts 操控当前选中飞船的参数
             *  handleOpts {
             *      order: {number},
             *      status: {string},
             *      decrement: {number},
             *      increment: {number},
             *      speed: {number}
             *  }
             */
            function _handler(handleOpts) {

                var bus = new BUS(handleOpts.status);

                // 储存当前选中飞船的节点
                var node = arrElements[handleOpts.order - 1];

                // 更改飞船的状态
                node.status = bus.adapter();

                // 对飞船的操作
                var handlers = (function() {

                    function start() {
                        if (!node.isFlying) {
                            // 每一次开始分型都从上一次结束的终点开始
                            $(node.ship).css({
                                transform: 'rotate(' + node.angle + 'deg)'
                            });
                            node.status = 'start';

                            clearInterval(node.intervalID);
                            _animate(node);
                        }
                        /*
                         * 运动函数
                         * 
                         * 飞船飞行
                         * 能源变化
                         * 能源百分数变化
                         */
                        function _animate(node) {

                            // 刷新一帧的时间间隔
                            var RATE = 16;

                            // 刷新一次减少的能量
                            var decrement = (node.decrement / (1000 / RATE));

                            // 刷新一次补充的能量
                            var increment = (node.increment / (1000 / RATE));

                            // 刷新飞行的距离
                            var len = node.speed / (1000 / RATE);

                            // 刷新一次旋转的角度
                            var angle = (180 * len) / (Math.PI * (node.radius));

                            var step = function() {

                                // 不在飞行状态，当前状态为飞行，有能量才飞行
                                if (node.status === 'start' && node.energy > 0) {
                                    node.isFlying = true;
                                    node.energy -= decrement;
                                    node.angle += angle;
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
                                $(node.ship).css({
                                    transform: 'rotate(' + node.angle + 'deg)'
                                });
                                $(node.ship).children('.energy').css({
                                    width: node.energy + '%'
                                });
                                $(node.ship).children('.msg').text(node.order + '号 - ' + Math.floor(node.energy) + ' %');
                            };
                            node.intervalID = setInterval(step, RATE);
                        };
                    };

                    function stop() {
                        node.isFlying = false;
                        node.status = 'stop';
                    };

                    function destory() {
                        arrElements[handleOpts.order - 1] = null;
                        $(node.control).remove();
                        $(node.ship).remove();
                    };
                    return {
                        start: start,
                        stop: stop,
                        destory: destory
                    };
                }());

                // 操控飞船
                handlers[node.status]();
            }
        }

        $(this).click(clickHandler);
    };
})(jQuery);

$('#controlPanel').spaceShipSystem();
