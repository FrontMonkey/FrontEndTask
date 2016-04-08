/*
 * @Author: Mertens
 * @Date:   2016-04-05 22:40:39
 * @Last Modified time: 2016-04-07 15:48:04
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

console.dir(aqiSourceData['北京']);
var i = 0;
for(var name in aqiSourceData['北京']){
	i++;
}
console.dir(i);

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

		/**
		* 根据天数显示数据
		* 
		* @param {object} data 具体哪个城市 aqi 的数据
		* @param {object} root 包裹数据的那个元素
		*/
		var showDailyData = function(data, root) {
			// 遍历数据
			for (var name in data) {
				// 把每天的数据都创建一个 li 标签
				list.appendChild(createItem('sm', data[name], graTime, name));
			}
			// 把创建好的数据添加到页面上
			root.appendChild(list);
		};

		/**
		* 根据星期显示数据
		* 
		* @param {object} data 具体哪个城市 aqi 的数据
		* @param {object} root 包裹数据的那个元素
		*/
		var showWeeklyData = function(data, root) {
			var totalDays = 0; // 计算一周的天数
			var total = 0; // 一周七天的 aqi 总和
			var average = 0; // 一周七天的 aqi 平均数值
			var referent = 0; // 判断是遍历完所有数据
			var item = null; // 存放新创建的 li 标签
			// 遍历数据
			for (name in data) {
				var date = new Date(name);
				var weekDay = date.getDay();
				total += data[name];
				totalDays++;
				referent++;
				// 周六为一个星期的结束
				// 如果累加了周六的数据，或者遍历到了数据的末尾
				if (weekDay === 6 || referent === 91) {
					// 计算平均数值，重置 totalDays 和 total
					average = total / totalDays;
					totalDays = 0;
					total = 0;
					// 创建一个 li 标签，添加到 ul 里面
					item = list.appendChild(createItem('md', average, graTime, name));
				}
			}
			// 把创建好的数据添加到页面上
			root.appendChild(list);
		};

		/**
		* 根据月份显示数据
		* 
		* @param {object} data 具体哪个城市 aqi 的数据
		* @param {object} root 包裹数据的那个元素
		*/
		var showMonthlyData = function(data, root) {
			var referent = 0; // 判断是遍历完所有数据
			var prev = 1; // 前一个数据的月份
			var current = 1; // 当前数据的月份
			var total = 0; // 一个月的 aqi 数值总和
			var totalDays = 0; // 这个月的总天数
			var average = 0; // 一个月的 aqi 数值平均数
			var item = null; // 存放新创建的 li 标签
			// 遍历数据
			for (var name in data) {
				current = parseInt(name.slice(5, 7)); // 获取当前数据的月份
				referent++;
				totalDays ++;
				// 如果当前数据的月份大于前一个数据的月份 或者 数据已经遍历完
				if (prev < current || referent === 91) {
					average = total / totalDays;
					totalDays = 0;
					total = 0;
					list.appendChild(createItem('lg', average, graTime, name));
				}
				total += data[name];
				prev = current;
			}
			root.appendChild(list);
		};

		/**
		* 创建一个<li>元素，包含一个子元素<a>元素
		* 
		* @param {string} className 要给<a>元素设置的类名
		* @param {number} data      aqi的值
		* @param {string} graTime   选择填充数据的方式 day week month
		* @param {string} time      可选参数，当前 aqi 数值的时间
		*/
		function createItem(className, data, graTime, time) {
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
				titleStr = time + ' 的空气质量指数 : ' + parseInt(data);
			}
			item = document.createElement('li');
			link = document.createElement('a');
			link.setAttribute('class', className);
			link.setAttribute('style', styleStr);
			link.setAttribute('title', titleStr);
			item.appendChild(link);
			list.appendChild(item);

			/**
			* 判断传入的数值返回特定的表示颜色值的字符串
			* 
			* @param {number} data 一个 0 - 1 之间的数值
			* @return {string} 返回表示颜色值的字符串
			*/
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