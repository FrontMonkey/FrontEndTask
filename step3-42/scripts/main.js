/*
* @Author: Mertens
* @Date:   2016-04-29 15:27:42
* @Last Modified time: 2016-05-03 10:52:53
*/

'use strict';

require.config({
    paths: {
        'jquery': ['jquery-2.2.3.min']
    }
});
require(['jquery', 'calendar'], function($, Calendar){
    var calendar1 = new Calendar();
});

