/*
 * @Author: Mertens
 * @Date:   2016-04-27 06:49:02
 * @Last Modified time: 2016-04-27 23:14:55
 */

'use strict';
require.config({
    paths: {
        'jquery': ['jquery-2.2.3.min']
    }
});

require(['jquery', 'table'], function($){
    $('#demo1').table({
        data: {
            head: ['姓名', '强壮', '速度', '头球' ],
            body: [
                ['基耶利尼', '80', '72', '81'],
                ['保罗·博格巴', '83', '75', '68'],
                ['马尔基西奥', '71', '76', '62'],
                ['博努奇', '75', '71', '76'],
                ['曼朱基奇', '85', '70', '84'],
                ['迪巴拉', '50', '86', '55']
            ]
        }
    });
});

        