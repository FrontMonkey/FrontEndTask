/*
 * @Author: Mertens
 * @Date:   2016-04-25 06:49:02
 * @Last Modified time: 2016-04-26 22:41:34
 */

'use strict';
require.config({
    paths: {
        'jquery': ['jquery-2.2.3']
    }
});
require(['jquery', 'modal'], function($) {
    $('.modal-btn').modal({
        callback: function(){
            alert('已经确认要运行回调函数!');
        }
    });
});

/**
* 这个插件基于 jQuery 开发
* 使用了 RequireJS 工具
* 
* 使用方法：
* 
* 通过 jquery 获取一个元素，调用该 jquery 实例上的 modal() 方法
* 即可初始化该插件，点击该元素即可弹出对话框
* 可以给该方法传入以下参数，自定义配置插件

    {
        // 选择符的参数，用于获取页面上的元素
        selectors: {
            mask: '.modal-mask', // 遮罩层
            dialog: '.modal-dialog', // 对话框
            confirm: '.confirm', // 确认按钮
            cancel: '.cancel' // 取消按钮
        },
        callback: null // 点击确认按钮运行的函数
    };
*/