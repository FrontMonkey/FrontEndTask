/*
* @Author: Mertens
* @Date:   2016-04-29 15:27:42
* @Last Modified time: 2016-05-01 00:03:18
*/

'use strict';

require.config({
    paths: {
        'jquery': ['jquery-2.2.3.min']
    }
});
require(['jquery', 'calendar'], function($){
    $('#_calendar').calendar();
});
