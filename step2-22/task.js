/*
 * @Author: Mertens
 * @Date:   2016-04-09 15:49:33
 * @Last Modified time: 2016-04-14 15:49:17
 */

'use strict';

var TreeWalker = function() {
    this.queue = [];
    this.isWalking = false;
};
TreeWalker.prototype = (function(){
    var _prev = null;
    var _isWalking = false;
    function inOrder(node) {
        if(!(node == null)){
            this.inOrder(node.firstElementChild);
            this.queue.push(_handleNode.bind(null, node, _prev));
            _prev = node;
            this.inOrder(node.lastElementChild);
        }
    };
    function preOrder(node) {
        if(!(node == null)){
            this.queue.push(_handleNode.bind(null, node, _prev));
            _prev = node;
            this.preOrder(node.firstElementChild);
            this.preOrder(node.lastElementChild);
        }
    };
    function postOrder(node) {
        if(!(node == null)){
            this.postOrder(node.firstElementChild);
            this.postOrder(node.lastElementChild);
            this.queue.push(_handleNode.bind(null, node, _prev));
            _prev = node;
        }
    };
    function walk() {
        var i = 0;
        var queue = this.queue;
        var len = queue.length;
        if(!_isWalking){
            var intervalID = setInterval(function() {
                if (i < len) {
                    queue[i]();
                    _isWalking = true;
                    i++;
                } else {
                    clearInterval(intervalID);
                    _isWalking = false;
                    _prev.style.backgroundColor = '#E3DFDF';
                }
            }, 500);
        }   
    };
    function _handleNode(node, _prev) {
        if (!(_prev == null)) {
            _prev.style.backgroundColor = '#E3DFDF';
        }
        node.style.backgroundColor = '#EE6780';
    };
    return {
        constructor: TreeWalker,
        inOrder: inOrder,
        preOrder: preOrder,
        postOrder: postOrder,
        walk: walk
    }
})();

var root = document.getElementById('root');


var optionForm = document.forms['options'];

optionForm['inOrder'].addEventListener('click', function(){
    var treeWalker = new TreeWalker();
    treeWalker.inOrder(root);
    treeWalker.walk();
})
optionForm['preOrder'].addEventListener('click', function(){
    var treeWalker = new TreeWalker();
    treeWalker.preOrder(root);
    treeWalker.walk();
})
optionForm['postOrder'].addEventListener('click', function(){
    var treeWalker = new TreeWalker();
    treeWalker.postOrder(root);
    treeWalker.walk();
});