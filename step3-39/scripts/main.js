/*
 * @Author: Mertens
 * @Date:   2016-04-28 15:46:10
 * @Last Modified time: 2016-04-29 11:52:33
 */

'use strict';

require.config({
    paths: {
        'jquery': ['jquery-2.2.3.min']
    }
});

require(['jquery', 'table'], function($, Table) {
    var table1 = new Table($('#demo1'), {
        data: {
            head: ['姓名', '强壮', '速度', '头球'],
            body: [
                ['基耶利尼', '80', '72', '81'],
                ['保罗·博格巴', '83', '75', '68'],
                ['马尔基西奥', '71', '76', '62'],
                ['博努奇', '75', '71', '76'],
                ['曼朱基奇', '85', '70', '84'],
                ['迪巴拉', '50', '86', '55']
            ]
        },
        fixHeader: true
    });
    var table2 = new Table($('#demo2'), {
        data: {
            // 表头的数据
            head: ['姓名', '语文', '数学', '英语', '总分'],
            // 表格内容的数据
            body: [
                ['小明', '80', '90', '70', '240'],
                ['小红', '90', '60', '90', '240'],
                ['小亮', '60', '100', '70', '230']
            ]
        },
        fixHeader: true
    });
});