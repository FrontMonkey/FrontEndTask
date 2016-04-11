/*
 * @Author: Administrator
 * @Date:   2016-04-11 16:36:42
 * @Last Modified by:   Administrator
 * @Last Modified time: 2016-04-11 19:32:20
 */

'use strict';

/*
 * @Author: Administrator
 * @Date:   2016-04-10 23:56:18
 * @Last Modified by:   Administrator
 * @Last Modified time: 2016-04-11 16:10:33
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

	this.selectedNode = null; // 选中的节点
	this.prevNode = null;
}

Tree.prototype = (function() {
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
	 * @param {object}    toData 要删除节点的父节点
	 * @param {function} traversal 遍历树的方式
	 */
	var remove = function(node, parent) {
		var tree = this;
		var childToRemove = null;
		var elementToReomve = null;
		var index;

		// 找到要删除节点的父节点
		// this.contains(fromData, callback, traversal);

		if (parent) {
			// 找到要删除节点在其父元素 children 集合里面的索引
			index = findIndex(parent.children, node.data);
			// 删除子节点
			childToRemove = parent.children.splice(index, 1);
			// 将存放在该节点的元素从文档树移除
			elementToReomve = parent.element.removeChild(parent.element.children[index + 1]);
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
	return {
		constructor: Tree,
		traverseDF: traverseDF,
		traverseBF: traverseBF,
		contains: contains,
		add: add,
		remove: remove
	}
})();

var tree = new Tree('电子设备');
tree.add('手机', tree.root, tree.traverseDF);
tree.add('电脑', tree.root, tree.traverseDF);
tree.add('平板', tree.root, tree.traverseDF);

var wrap = document.getElementById('wrap');
wrap.appendChild(tree.root.element);

wrap.addEventListener('click', function(e) {
	var target = e.target;
	var current = null;
	if (target.tagName === 'DT') {
		current = target.parentNode;
		if(tree.prevNode){
			tree.prevNode.element.setAttribute('class', '');
		}
		tree.selectedNode = current.originNode;
		tree.prevNode = current.originNode;
		current.setAttribute('class', 'is-crt');
	}
});

var dataTree = document.getElementById('root');

var selectForm = document.forms['selectMode'];

selectForm['remove'].addEventListener('click', function(){
	tree.remove(tree.selectedNode, tree.selectedNode.parent);
});

selectForm['add'].addEventListener('click', function(){
	var value;
	if(selectForm['nodeContent'].value !== ''){
		value = selectForm['nodeContent'].value;
	}
	if(value !== undefined){
		tree.add(value, tree.selectedNode);
	}
});