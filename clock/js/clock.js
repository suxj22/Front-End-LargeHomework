setInterval(() => {
    let hh_elem = document.getElementById('hh');
    let mm_elem = document.getElementById('mm');
    let ss_elem = document.getElementById('ss');

    let s_dot_elem = document.querySelector('.second_dot');
    let m_dot_elem = document.querySelector('.minute_dot');
    let h_dot_elem = document.querySelector('.hour_dot');
    var current_time = new Date();

    let curr_hour = current_time.getHours();
    let curr_min = current_time.getMinutes();
    let curr_sec = current_time.getSeconds();


    let sc_needle_elem = document.getElementById('sc');
    let mn_needle_elem = document.getElementById('mn');
    let hr_needle_elem = document.getElementById('hr');


    hh_elem.style.strokeDashoffset = 510 * (1 - curr_hour / 24);
    mm_elem.style.strokeDashoffset = 630 * (1 - curr_min / 60);
    ss_elem.style.strokeDashoffset = 760 * (1 - curr_sec / 60);

    h_dot_elem.style.transform = `rotateZ(${curr_hour*15}deg)`;
    m_dot_elem.style.transform = `rotateZ(${curr_min*6}deg)`;
    s_dot_elem.style.transform = `rotateZ(${curr_sec*6}deg)`;

    // 设置时针位置
    hr_needle_elem.style.transform = `rotate(${curr_hour * 30 + curr_min / 2}deg)`;
    mn_needle_elem.style.transform = `rotateZ(${curr_min*6}deg)`;
    sc_needle_elem.style.transform = `rotateZ(${curr_sec*6}deg)`;


}, 1000)

// 存储用户自定义的时间
var customHour, customMinute, customSecond;
var customedTime = false;

// 填充时间，确保时间总是以两位数显示
function fillTime(x) {
    return x < 10 ? '0' + x : '' + x;
}

// 更新时间显示的函数
// 在updateTime函数中，确保时钟显示为12小时制
function updateTime(hour, minute, second, to_animate) {
    var timeStr;
    if (hour === 0 || hour === 12) {
        timeStr = "12:" + fillTime(minute) + ":" + fillTime(second);
    } else {
        timeStr = fillTime(hour % 12) + ":" + fillTime(minute) + ":" + fillTime(second);
    }
    var time_list = document.querySelectorAll('text');
    time_list.forEach((item, i) => {
        item.textContent = timeStr;
    });
}
// 为设置时间按钮添加事件监听器
document.getElementById('setTime').addEventListener('click', function () {
    // 读取用户输入的时间并存储
    customHour = parseInt(document.getElementById('customHours').value);
    customMinute = parseInt(document.getElementById('customMinutes').value);
    customSecond = parseInt(document.getElementById('customSeconds').value);

    // 调用updateTime函数，使用用户输入的时间
    updateTime(customHour, customMinute, customSecond, true);
    // TODO:这个时间添加数字渐变效果,.time-animation已经在css中实现


    customedTime = true;
    // 开始自定义时间的计时
    startCustomTimer();
});

// 开始自定义时间的计时
function startCustomTimer() {
    clearInterval(intervalId); // 清除现有的定时器
    intervalId = setInterval(function () {
        // 递增秒数
        customSecond++;
        if (customSecond >= 60) {
            customSecond = 0;
            customMinute++;
            if (customMinute >= 60) {
                customMinute = 0;
                customHour = (customHour + 1) % 12; // 12小时制，循环

                // 如果是12小时，设置为1（即AM/PM切换）
                if (customHour === 0) {
                    customHour = 1;
                }
            }
        }
        // 更新时间显示
        updateTime(customHour, customMinute, customSecond, false);
    }, 1000);
}

// 定义一个全局变量来存储定时器的ID
var intervalId;

// 初始设置定时器，使用当前时间
intervalId = setInterval(() => {
    var currentTime = getTime();
    updateTime(currentTime.hour, currentTime.minute, currentTime.second, false);
}, 1000);

// 获取当前时间，如果用户自定义了时间，则使用自定义的时间
function getTime() {
    if (!customedTime) {
        var now_time = new Date();
        return {
            hour: now_time.getHours(),
            minute: now_time.getMinutes(),
            second: now_time.getSeconds()
        };
    }
    return {
        hour: customHour,
        minute: customMinute,
        second: customSecond
    }; // 返回用户自定义的时间
}


let draggingElement = null;
let lastX, lastY;
let center = {
    x: 0,
    y: 0
};
let clockRadius = 0;

// 初始化时钟中心和半径
function initClock() {
    const clockDiv = document.querySelector('.clock');
    const clockRect = clockDiv.getBoundingClientRect();
    center.x = clockRect.left + clockRect.width / 2;
    center.y = clockRect.top + clockRect.height / 2;
    clockRadius = Math.min(clockRect.width, clockRect.height) / 2;

    // 初始化时钟指针位置
    initNeedlePositions();
}

// 初始化时钟指针位置的函数
function initNeedlePositions() {
    var current_time = new Date();
    let curr_hour = current_time.getHours();
    let curr_min = current_time.getMinutes();
    let curr_sec = current_time.getSeconds();

    let sc_needle_elem = document.getElementById('sc');
    let mn_needle_elem = document.getElementById('mn');
    let hr_needle_elem = document.getElementById('hr');

    // 设置秒针位置
    sc_needle_elem.style.transform = `rotate(${curr_sec * 6}deg)`;
    // 设置分针位置
    mn_needle_elem.style.transform = `rotate(${curr_min * 6 + curr_sec / 10}deg)`;
    // 设置时针位置
    hr_needle_elem.style.transform = `rotate(${curr_hour * 30 + curr_min / 2}deg)`;
}


document.addEventListener("DOMContentLoaded", function () {
    const circles = document.querySelectorAll('.circle');
    const needles = document.querySelectorAll('.needles');

    // 遍历每一个指针
    needles.forEach((needle, index) => {
        const circle = circles[index];
        const svgCircle = circle.querySelector('circle');
        const radius = parseFloat(window.getComputedStyle(svgCircle).getPropertyValue('r'));
        const centerX = parseFloat(window.getComputedStyle(circle).getPropertyValue('left')) + radius;
        const centerY = parseFloat(window.getComputedStyle(circle).getPropertyValue('top')) + radius;

        let currentRotation = parseFloat(needle.style.transform.split('(')[1].split('deg')[0]);

        interact(needle)
            .draggable({
                // 拖动开始
                onstart: function (event) {
                    event.preventDefault();
                },
                // 拖动中
                onmove: function (event) {
                    const x = event.pageX - (circle.getBoundingClientRect().left + window.scrollX);
                    const y = event.pageY - (circle.getBoundingClientRect().top + window.scrollY);
                    const angle = calculateAngle(x, y, centerX, centerY);
                    needle.style.transform = `rotate(${angle}deg)`;

                    // 更新时间显示
                    updateTimeFromNeedles(needle, angle);
                },
                // 拖动结束
                onend: function (event) {
                    // 可以在这里更新数据或者执行其他动作
                }
            });
    });

    // 计算角度
    function calculateAngle(x, y, centerX, centerY) {
        let angle = Math.atan2(y - centerY, x - centerX) * (180 / Math.PI);
        if (angle < 0) {
            angle += 360;
        }
        return angle;
    }

    // 更新时间显示
    function updateTimeFromNeedles(needle, angle) {
        const id = needle.id;
        let timeValue;

        // 将角度转换为时间值
        switch (id) {
            case 'sc': // 秒针
                timeValue = Math.round(angle / 6) % 60;
                break;
            case 'mn': // 分针
                timeValue = Math.round(angle / 6) % 60;
                break;
            case 'hr': // 时针
                timeValue = Math.floor(angle / 30) % 12;
                break;
        }


        // 更新自定义时间输入框和电子显示屏
        switch (id) {
            case 'sc':
                document.getElementById('customSeconds').value = timeValue.toString().padStart(2, '0');
                break;
            case 'mn':
                document.getElementById('customMinutes').value = timeValue.toString().padStart(2, '0');
                break;
            case 'hr':
                document.getElementById('customHours').value = timeValue.toString().padStart(2, '0');
                break;
        }

        // 更新电子显示屏
        updateTime(parseInt(document.getElementById('customHours').value),
            parseInt(document.getElementById('customMinutes').value),
            parseInt(document.getElementById('customSeconds').value), false);
        lastMinuteAngle = angle;
    }
});