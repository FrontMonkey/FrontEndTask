/*
 * @Author: Mertens
 * @Date:   2016-04-10 23:56:18
 * @Last Modified time: 2016-04-14 15:49:47
 */

'use strict';

/**
 * 创建一个多叉树节点
 * 
 * @param {object} data 存放进一个节点的数据
 */
function Node(data) {
    this.data = data;
    this.parent = null;
    this.children = [];
    // 每个节点都存放着一个 div 的引用
    this.element = document.createElement('div');
}

/**
 * 一棵多叉树的构造函数
 * 
 * @param {object} data 存放进一个实例根节点的数据
 */
function Tree(data) {
    var node = new Node(data);
    node.element.textContent = data;
    node.element.setAttribute('id', 'root'); // 根据 data 设置 element 里面存放的那个 div 的属性
    this._queue = []; // 按顺序依次把遍历到的元素存进 _queue
    this.findIndex = 0; // 如果有指定查找某个元素，把这个元素在 _queue 的索引值存放进这 findIndex 属性
    this.root = node;

    this._walking = false;
    this._last = null; // 遍历到的最后一个节点
}

Tree.prototype = (function(){
    /**
     * 深度优先遍历所有节点
     * 
     * @param {function} callback 回调函数
     */
    var traverseDF = function(callback) {

        // 一个递归立即执行函数
        (function recurse(currentNode) {
            // step 2
            // 如果存在当前节点的子节点
            for (var i = 0, length = currentNode.children.length; i < length; i++) {
                // step 3
                // 就继续对当前节点的子节点执行递归函数
                recurse(currentNode.children[i]);
            }

            // step 4
            // 将当前节点传入回调函数并且执行
            callback(currentNode);

            // step 1
            // 将根节点传入递归函数
        })(this.root);
    };

    /**
     * 广度优先遍历所有节点
     * 
     * @param {function} callback 回调函数
     */
    var traverseBF = function(callback) {
        var queue = [];

        queue.push(this.root);

        var currentTree = queue.shift();

        while (currentTree) {
            for (var i = 0, length = currentTree.children.length; i < length; i++) {
                queue.push(currentTree.children[i]);
            }

            callback(currentTree);
            currentTree = queue.shift();
        }
    };

    /**
     * 找到包含指定数据的一个节点，并将其作为参数调用回调函数
     * 
     * @param {object}        data 指定要搜索的数据
     * @param {function}  callback 对包含数据的节点执行的函数
     * @param {function} traversal 遍历树的方式
     */
    var contains = function(data, callback, traversal) {
        // 遍历多叉树
        traversal.call(this, function(node) {
            // 只对包含指定数据的节点运行函数
            if (node.data === data) {
                callback(node);
            }
        });
    };

    /**
     * 将一个数据作为子元素插入到指定的父元素之下
     * 
     * @param {object}        data 需要储存的数据
     * @param {function}    toData 需要插入节点的父节点包含的数据
     * @param {function} traversal 遍历树的方式
     */
    var add = function(data, toData, traversal) {
        var child = new Node(data);
        var parent = null;
        var callback = function(node) {
            parent = node;
        };

        // 找到待插入节点的父节点
        this.contains(toData, callback, traversal);

        if (parent) {
            parent.children.push(child); // 将待插入节点插入父元素
            child.parent = parent; // 设置插入元素的父节点
            child.element.textContent = data;
            parent.element.appendChild(child.element); // 将子元素的的 div 元素插入文档树
        } else {
            throw new Error('Cannot add node to a non-existent parent.');
        }
    };

    /**
     * 从一个父元素之下删除包含指定数据的节点
     * 
     * @param {object}        data 要删除节点包含的数据
     * @param {function}    toData 要删除节点的父节点包含的数据
     * @param {function} traversal 遍历树的方式
     */
    var remove = function(data, fromData, traversal) {
        var tree = this;
        var parent = null;
        var childToRemove = null;
        var elementToReomve = null;
        var index;

        var callback = function(node) {
            parent = node;
        };

        // 找到要删除节点的父节点
        this.contains(fromData, callback, traversal);

        if (parent) {
            // 找到要删除节点在其父元素 children 集合里面的索引
            index = findIndex(parent.children, data);

            if (index === undefined) {
                throw new Error('Node to remove does not exist.');
            } else {
                // 删除子节点
                childToRemove = parent.children.splice(index, 1);
                // 将存放在该节点的元素从文档树移除
                elementToReomve = parent.element.removeChild(parent.element.children[index]);
            }
        } else {
            throw new Error('Parent does not exist.');
        }

        return childToRemove;
    };

    /**
     * 用动画显示遍历多叉树的运动过程
     * 
     * @param {function} traversal 遍历多叉树的方式
     * @param {object} data 可选，显示查找特定节点的过程
     */
    var walk = function(traversal, data) {
        // 初始化上一次查找的结果
        if (this._last) {
            this._last.element.setAttribute('class', '');
            this._last = null;
        }
        var that = this;
        var indexToFind;
        var callback = function(node) {
            // 将遍历到元素加入队列
            that._queue.push(node);
        };
        // 遍历多叉树，将遍历到的每一个元素依次加入队列
        traversal.call(this, callback);
        // 如果传入了要查找的参数
        if (data !== undefined) {
            indexToFind = findIndex(this._queue, data);
        }
        (function() {
            var queue = [];
            // 如果传入了要查找的参数，但是没找到该节点，抛出一个错误
            if (data !== undefined && indexToFind === undefined) {
                throw new Error('The node to find is not exist.');
            }
            // 如果传入了要查找的参数，也找到了该元素
            else if (data !== undefined) {
                queue = that._queue.slice(0, indexToFind + 1);
            } 
            // 如果没传入查找参数，直接用动画效果遍历所有节点
            else {
                queue = that._queue;
            };
            var len = queue.length;
            var index = 0;

            // 如果不是处于 walking 状态，显示运动效果
            if (!that._walking) {
                that._walking = true;
                var intervalID = setInterval(function() {
                    if (len > index) {
                        if (index > 0) {
                            queue[index - 1].element.setAttribute('class', '');
                        }
                        queue[index].element.setAttribute('class', 'isWalking');
                        index++;
                    } else {
                        clearInterval(intervalID);
                        that._walking = false;
                        that._queue = []; // 重置队列
                        that._last = queue[index - 1];
                    }
                }, 300);
            }
        })();
    };

    /**
     * 找到一个特定元素在数组里面的索引
     * 
     * @param {array}   arr 一个数组
     * @param {object} data 要查找的特定的数据
     * @param {number}      返回一个特定元素的索引
     */
    function findIndex(arr, data) {
        var index;

        for (var i = 0; i < arr.length; i++) {
            if (arr[i].data === data) {
                index = i;
            }
        }

        return index;
    }
    return {
        constructor: Tree,
        traverseDF: traverseDF,
        traverseBF: traverseBF,
        contains: contains,
        add: add,
        remove: remove,
        walk: walk
    }
})();

var tree = new Tree('电子设备');
tree.add('手机', '电子设备', tree.traverseDF);
tree.add('电脑', '电子设备', tree.traverseDF);
tree.add('平板', '电子设备', tree.traverseDF);
tree.add('iphone', '手机', tree.traverseDF);
tree.add('三星', '手机', tree.traverseDF);
tree.add('华为', '手机', tree.traverseDF);
tree.add('mac', '电脑', tree.traverseDF);
tree.add('惠普', '电脑', tree.traverseDF);
tree.add('联想', '电脑', tree.traverseDF);
tree.add('小米', '平板', tree.traverseDF);
tree.add('原道', '平板', tree.traverseDF);
tree.add('ipad', '平板', tree.traverseDF);
tree.add('iphone 5s', 'iphone', tree.traverseDF);
tree.add('iphone 6', 'iphone', tree.traverseDF);
tree.add('iphone 6s', 'iphone', tree.traverseDF);
tree.add('iphone plus', 'iphone', tree.traverseDF);

var wrap = document.getElementById('wrap');
wrap.appendChild(tree.root.element);

var selectForm = document.forms['selectMode'];
selectForm['go'].addEventListener('click', function(){
    var data;
    var method = selectForm['selectMethod'].value;
    if(selectForm['specificData'].value !== ''){
        data = selectForm['specificData'].value;
    };
    tree.walk(tree[method], data);
});