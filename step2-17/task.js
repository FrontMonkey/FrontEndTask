/*
 * @Author: Administrator
 * @Date:   2016-04-05 22:40:39
 * @Last Modified by:   Administrator
 * @Last Modified time: 2016-04-06 22:20:27
 */

'use strict';

/* 数据格式演示
var aqiSourceData = {
  "北京": {
    "2016-01-01": 10,
    "2016-01-02": 10,
    "2016-01-03": 10,
    "2016-01-04": 10
  }
};
*/

// 以下两个函数用于随机模拟生成测试数据
function getDateStr(dat) {
	var y = dat.getFullYear();
	var m = dat.getMonth() + 1;
	m = m < 10 ? '0' + m : m;
	var d = dat.getDate();
	d = d < 10 ? '0' + d : d;
	return y + '-' + m + '-' + d;
}

function randomBuildData(seed) {
	var returnData = {};
	var dat = new Date("2016-01-01");
	var datStr = ''
	for (var i = 1; i < 92; i++) {
		datStr = getDateStr(dat);
		returnData[datStr] = Math.ceil(Math.random() * seed);
		dat.setDate(dat.getDate() + 1);
	}
	return returnData;
}

var aqiSourceData = {
	"北京": randomBuildData(500),
	"上海": randomBuildData(300),
	"广州": randomBuildData(200),
	"深圳": randomBuildData(100),
	"成都": randomBuildData(300),
	"西安": randomBuildData(500),
	"福州": randomBuildData(100),
	"厦门": randomBuildData(100),
	"沈阳": randomBuildData(500)
};

// 用于渲染图表的数据
var chartData = aqiSourceData['北京'];

// 记录当前页面的表单选项
var pageState = {
	nowSelectCity: -1,
	nowGraTime: "day"
}

/**
 * 渲染图表
 */
function renderChart(graTime, data) {
	var list = document.createElement('ul');
	var chartWrap = document.querySelector('.aqi-chart-wrap');
	chartWrap.innerHTML = '';
	var show = (function() {
		var index = 0;
		var showDailyData = function(data, root) {
			for (var name in data) {
				list.appendChild(createItem('sm', data[name], graTime, name));
			}
			root.appendChild(list);
		};
		var showWeeklyData = function(data, root) {
			var flag = 0;
			var total = 0;
			var referent = 1;
			var average = 0;
			var item = null;
			for (name in data) {
				total += data[name];
				flag++;
				total++;
				referent++;
				if (flag === 7 || referent === 93) {
					average = total / flag;
					flag = 0;
					total = 0;
					item = list.appendChild(createItem('md', average, graTime, name));
				}
			}
			root.appendChild(list);
		};
		var showMonthlyData = function(data, root) {
			var flag = 1;
			var current = 0;
			var next = 0;
			var total = 0;
			var average = 0;
			var item = null;
			for (var name in data) {
				next = parseInt(name.slice(5, 7));
				flag++;
				total += data[name];
				if (current < next || flag === 92) {
					average = total / flag;
					flag = 0;
					total = 0;
					list.appendChild(createItem('lg', average, graTime, name));
				}
				current = next;
			}
			root.appendChild(list);
		};

		function createItem(className, data, graTime, name) {
			var item = null;
			var link = null;
			var titleMsg = {
				'week': ['第一周', '第二周', '第三周', '第四周', '第五周', '第六周', '第七周',
					'第八周', '第九周', '第十周', '第十一周', '第十二周', '第十三周', '第十四周'
				],
				'month': ['一月', '二月', '三月']
			}
			var titleStr = '';
			var styleStr = 'height:' + (data / 500) * 100 + '%;' + 'background-color:' + selectColor(data / 500);
			if (titleMsg[graTime]) {
				titleStr = titleMsg[graTime][index] + ' : ' + parseInt(data);
				index++;
			} else {
				titleStr = name + ' 的空气质量指数 : ' + parseInt(data);
			}
			item = document.createElement('li');
			link = document.createElement('a');
			link.setAttribute('class', className);
			link.setAttribute('style', styleStr);
			link.setAttribute('title', titleStr);
			item.appendChild(link);
			list.appendChild(item);

			function selectColor(data) {
				var colors = ['#81D7BA', '#F6F599', '#F0CB82', '#EAB394'];
				if (data < .25 && data >= 0) {
					return colors[0];
				} else if (data >= .25 && data < .5) {
					return colors[1];
				} else if (data >= .5 && data < .75) {
					return colors[2];
				} else if (data >= .75 && data <= 1) {
					return colors[3];
				}
			}
			return item;
		}
		return {
			day: showDailyData,
			week: showWeeklyData,
			month: showMonthlyData
		}
	})();
	show[graTime](data, chartWrap);
}

/**
 * 初始化日、周、月的radio事件，当点击时，调用函数graTimeChange
 */
function initGraTimeForm() {
	var formGraTime = document.getElementById('form-gra-time');

	formGraTime.addEventListener('click', function(e) {
		graTimeChange(e);
	});
	/**
	 * 日、周、月的radio事件点击时的处理函数
	 */
	function graTimeChange(e) {
		// 确定是否选项发生了变化 
		console.log(e.target.value);
		if (e.target.value === pageState.nowGraTime) {
			return;
		}
		// 设置对应数据
		else if (!!e.target.value) {
			pageState.nowGraTime = e.target.value;
		}
		// 调用图表渲染函数
		renderChart(pageState.nowGraTime, chartData)
	}
}

/**
 * 初始化城市Select下拉选择框中的选项
 */
function initCitySelector(data) {
	// 读取aqiSourceData中的城市，然后设置id为city-select的下拉列表中的选项
	var selectCity = document.getElementById('city-select');
	var newOption = null;
	for (var name in data) {
		newOption = new Option(name, name);
		selectCity.add(newOption);
	}
	// 给select设置事件，当选项发生变化时调用函数citySelectChange
	selectCity.addEventListener('change', citySelectChange);
	/**
	 * select发生变化时的处理函数
	 */
	function citySelectChange() {
		// 确定是否选项发生了变化 
		if (this.value === pageState.nowSelectCity) {
			return;
		}
		// 设置对应数据
		pageState.nowSelectCity = this.value;
		initAqiChartData(data, this.value);
		// 调用图表渲染函数
		renderChart(pageState.nowGraTime, chartData);
	}
}

/**
 * 初始化图表需要的数据格式
 */
function initAqiChartData(data, city) {
	// 将原始的源数据处理成图表需要的数据格式
	// 处理好的数据存到 chartData 中
	chartData = data[city];
}

/**
 * 初始化函数
 */
function init() {
	renderChart(pageState.nowGraTime, chartData);
	initGraTimeForm();
	initCitySelector(aqiSourceData);
}

init();