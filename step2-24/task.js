/*
 * @Author: Mertens
 * @Date:   2016-04-11 16:36:42
 * @Last Modified time: 2016-04-14 15:50:24
 */

'use strict';

/**
 * 创建一个多叉树节点
 * 
 * @param {string} data 存放进一个节点的数据
 */
function Node(data) {
    this.data = data;
    this.parent = null;
    this.children = [];
    this.clickTimes = 0;
    this.visibility = true;

    // 每个节点都存放着一个 dl 的引用
    this.element = (function() {
        var temp = document.createElement('dl');
        var tempTitle = document.createElement('dt');
        tempTitle.textContent = data;
        temp.appendChild(tempTitle);
        return temp;
    }());
    this.element.originNode = this;
}

/**
 * 一棵多叉树的构造函数
 * 
 * @param {string} data 存放进一个实例根节点的数据
 */
function Tree(data) {
    var node = new Node(data);
    node.element.setAttribute('id', 'root'); // 根据 data 设置 element 里面存放的那个 div 的属性
    this.root = node;

    this.seletedNode = null; // 选中的节点
    this.prevNode = null;
}

Tree.prototype = (function() {

    /**
     * 深度优先遍历所有节点
     * 
     * @param {function} callback 回调函数
     * @param {object} root 遍历开始的根节点
     */
    var traverseDF = function(callback, root) {
        root = root || this.root;

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
        })(root);
    };

    /**
     * 广度优先遍历所有节点
     * 
     * @param {function} callback 回调函数
     * @param {object} root 遍历开始的根节点
     */
    var traverseBF = function(callback, root) {
        root = root || this.root;
        var queue = [];

        queue.push(root);

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
     * @param {object}    parentNode 需要插入节点的父节点
     * @param {function} traversal 遍历树的方式
     */
    var add = function(data, parentNode, traversal) {
        var child = new Node(data);

        if (parentNode) {
            parentNode.children.push(child); // 将待插入节点插入父元素
            child.parent = parentNode; // 设置插入元素的父节点

            var temp = document.createElement('dd');
            temp.appendChild(child.element);
            parentNode.element.appendChild(temp); // 将子元素的的 div 元素插入文档树
        } else {
            throw new Error('Cannot add node to a non-existent parent.');
        }
    };

    /**
     * 从一个父元素之下删除包含指定数据的节点
     * 
     * @param {object}        node 要删除节点
     * @param {object}  parentNode 要删除节点的父节点
     * @param {function} traversal 遍历树的方式
     */
    var remove = function(node, parentNode) {
        var tree = this;
        var childToRemove = null;
        var elementToReomve = null;
        var index;

        // 找到要删除节点的父节点
        // this.contains(fromData, callback, traversal);

        if (parentNode) {
            // 找到要删除节点在其父元素 children 集合里面的索引
            index = findIndex(parentNode.children, node.data);
            // 删除子节点
            childToRemove = parentNode.children.splice(index, 1);
            // 将存放在该节点的元素从文档树移除
            elementToReomve = parentNode.element.removeChild(parentNode.element.children[index + 1]);
        } else {
            throw new Error('Parent does not exist.');
        }

        return childToRemove;
    };

    /**
     * 找到一个特定元素在数组里面的索引
     * 
     * @param {array}   arr 一个数组
     * @param {string} data 要查找的特定的数据
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

    /**
     * 从根节点开始折叠或者展开
     * 
     * @param {boolean}       flag 一个布尔值，表示折叠或者展开
     * @param {object}        root 折叠或者展开的根节点
     * @param {function} traversal 遍历树的方式
     */
    var collapse = function(flag, root, traversal) {
        // 折叠
        if (flag) {
            // 遍历根节点以下的所有节点
            traversal.call(this, function(node) {
                node.element.style.display = 'none'; // 设置 css 属性隐藏节点
                node.visibility = false; // 设置 visibility 属性表示不可见
            }, root);
            root.element.style.display = ''; // 设置 css 属性显示根节点
            root.visibility = true; // 设置 visibility 属性表示根节点可见
        }
        // 展开 
        else {
            traversal.call(this, function(node) {
                node.element.style.display = '';
                node.visibility = true;
            }, root);
        }
    };
    return {
        constructor: Tree,
        traverseDF: traverseDF,
        traverseBF: traverseBF,
        contains: contains,
        add: add,
        remove: remove,
        collapse: collapse
    }
})();

// 创建一棵树的实例
var tree = new Tree('电子设备');
tree.add('手机', tree.root, tree.traverseDF);
tree.add('电脑', tree.root, tree.traverseDF);
tree.add('平板', tree.root, tree.traverseDF);

var wrap = document.getElementById('wrap');
wrap.appendChild(tree.root.element);

// 点击节点，被选中样式或者折叠展开
wrap.addEventListener('click', function(e) {
    var target = e.target; // 获取触发事件的目标
    var current = null; // 用 current 保存当前的 dl 节点
    if (target.tagName === 'DT') {
        current = target.parentNode; 
        // 点击元素，切换样式
        (function() {
            // 如果上一个被选中元素存在
            if (tree.prevNode) {
                // 设置 class 清除特殊样式
                tree.prevNode.element.setAttribute('class', '');
            }
            // 设置当前被选中元素的特殊样式
            current.setAttribute('class', 'is-crt');
            // 设置当前选中的树节点为当前 dl 元素的 originNode
            tree.seletedNode = current.originNode;
        }());
        // 点击元素，折叠节点
        (function() {
            var flag = false;
            // 点击一次，点击次数加 1
            tree.seletedNode.clickTimes++;
            // 如果上一个被选中元素存在，且当前选中的不是上一个点击的元素
            if(tree.prevNode && tree.seletedNode !== tree.prevNode){
                // 将前一个选中元素的点击次数设置为 0
                tree.prevNode.clickTimes = 0;
            }
            // 折叠
            if (tree.seletedNode.clickTimes === 2) {
                tree.seletedNode.clickTimes = 0;
                flag = true;
            }
            // 展开
            else {
                flag = false;
            }
            tree.collapse(flag, tree.seletedNode, tree.traverseBF);
        }());
        // 设置上一个选中元素为当前元素
        tree.prevNode = tree.seletedNode;
    }
});

var selectForm = document.forms['selectMode'];

selectForm['remove'].addEventListener('click', function() {
    tree.remove(tree.seletedNode, tree.seletedNode.parent);
});

selectForm['add'].addEventListener('click', function() {
    var value;
    if (selectForm['nodeContent'].value !== '') {
        value = selectForm['nodeContent'].value;
    }
    if (value !== undefined) {
        tree.add(value, tree.seletedNode);
    }
});

// 搜索节点
selectForm['search'].addEventListener('click', function() {
    if (selectForm['searchContent'].value !== '') {
        var data = selectForm['searchContent'].value;
        // 搜索节点
        tree.contains(data, function(node) {
            if (tree.prevNode) {
                // 去除上一个选中节点的样式
                tree.prevNode.element.setAttribute('class', '');
            }
            // 设置当前选中节点的样式
            node.element.setAttribute('class', 'is-crt');
            tree.prevNode = node;

            var callback = function(node) {
                tree.collapse(false, node, tree.traverseBF);
            };
            // 检查当前搜索到的节点的父元素是被折叠，如果是，就展开
            checkVisibility(node, callback);
        }, tree.traverseBF);
    }

    function checkVisibility(node, callback) {
        var current = node.parent;
        if (!current.visibility) {
            checkVisibility(current, callback);
        } else {
            callback(current);
        }
    };
});