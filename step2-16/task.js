/**
 * aqiData，存储用户输入的空气指数数据
 * 示例格式：
 * aqiData = {
   "北京": 90,
   "上海": 40
};
 */
var aqiData = {};
/**
 * 从用户输入中获取数据，向aqiData中增加一条数据
 * 然后渲染aqi-list列表，增加新增的数据
 */
function addAqiData() {
    var city = document.getElementById('aqi-city-input'),
        value = document.getElementById('aqi-value-input');
    testCity = function(city) {
            city = city.trim();
            return /^[\u4e00-\u9fa5a-zA-Z]+$/.test(city);
        },
        testValue = function(value) {
            return /^\d+$/.test(value);
        };

    // 验证表单
    if (!testCity(city.value)) {
        alert('城市只能输入中英文字符！');
        return;
    }
    if (!testValue(value.value)) {
        alert('空气质量只能输入整数');
        return;
    }

    aqiData[city.value.trim()] = value.value;

    // 重置输入表单
    city.value = '';
    value.value = '';
}

/**
 * 渲染aqi-table表格
 */

var table = document.getElementById('aqi-table');

function renderAqiList() {
    var city,
        index = 0;
    for (city in aqiData) {
        // 如果该行不存在，创建行和单元格再填充数据
        if (!table.rows[index]) {
            table.insertRow(index);
            table.rows[index].insertCell(0);
            table.rows[index].cells[0].textContent = city;
            table.rows[index].insertCell(1);
            table.rows[index].cells[1].textContent = aqiData[city];
            var delBtn = document.createElement('button');
            delBtn.appendChild(document.createTextNode('删除'));
            delBtn.index = index;
            table.rows[index].insertCell(2);
            table.rows[index].cells[2].appendChild(delBtn);
        }
        // 如果该行已经存在，直接填充数据
        else {
            table.rows[index].cells[0].textContent = city;
            table.rows[index].cells[1].textContent = aqiData[city];
            table.rows[index].cells[2].firstChild.index = index;
        }
        index++;
    }
}

/**
 * 点击add-btn时的处理逻辑
 * 获取用户输入，更新数据，并进行页面呈现的更新
 */
function addBtnHandle() {
    addAqiData();
    renderAqiList();
}

/**
 * 点击各个删除按钮的时候的处理逻辑
 * 获取哪个城市数据被删，删除数据，更新表格显示
 */
function delBtnHandle(index) {
    // 点击的是哪一行的 button，然后删除哪一行
    if (typeof index === 'number') {
        delete aqiData[table.rows[index].cells[0].textContent];
        table.deleteRow(index);
    }
    renderAqiList();
}

function init() {

    // 在这下面给add-btn绑定一个点击事件，点击时触发addBtnHandle函数
    var addBtn = document.getElementById('add-btn');
    addBtn.addEventListener('click', addBtnHandle);

    // 给所有 button 的祖先元素设置一个事件代理
    table.addEventListener('click', function(e) {
        // 将被点击元素的 index 属性传入 delBtnHandle，以确定是哪一个 button 被点击
        delBtnHandle(e.target.index);
    });
}

init();