
// 初始化全局变量
let customHour, customMinute, customSecond, customMillisecond;
let customAlarmHour, customAlarmMin, customAlarmSec;
let customedTime = false;
let intervalId;
let lastTimestamp = null;

// 计时器相关变量
let timerHour, timerMinute, timerSecond, timerMillisecond;
let timerRunning = false;
let timerIntervalId;
let dragging = false;

function updateClock(timestamp) {
    if(dragging) {
        return;
    }

    let hh_elem = document.getElementById('hh');
    let mm_elem = document.getElementById('mm');
    let ss_elem = document.getElementById('ss');

    let s_dot_elem = document.querySelector('.second_dot');
    let m_dot_elem = document.querySelector('.minute_dot');
    let h_dot_elem = document.querySelector('.hour_dot');


    let sc_needle_elem = document.getElementById('sc');
    let mn_needle_elem = document.getElementById('mn');
    let hr_needle_elem = document.getElementById('hr');


    if (!lastTimestamp) lastTimestamp = timestamp;
    let elapsed = timestamp - lastTimestamp;
    lastTimestamp = timestamp;

    if (customedTime) {
        customMillisecond += elapsed;
        if (customMillisecond >= 1000) {
            customMillisecond -= 1000;
            customSecond++;
            if (customSecond >= 60) {
                customSecond = 0;
                customMinute++;
                if (customMinute >= 60) {
                    customMinute = 0;
                    customHour = (customHour + 1) % 24;
                }
            }
        }
        updateTime(customHour, customMinute, customSecond, false);
    } else if (timerRunning) {
        timerMillisecond -= elapsed;
        if (timerMillisecond <= 0) {
            timerMillisecond += 1000;
            timerSecond--;
            if (timerSecond < 0) {
                timerSecond = 59;
                timerMinute--;
                if (timerMinute < 0) {
                    timerMinute = 59;
                    timerHour--;
                    if (timerHour < 0) {
                        // 计时器到时间
                        clearInterval(timerIntervalId);
                        alert("计时器到时间了！");
                        timerRunning = false;
                        timerHour = 0;
                        timerMinute = 0;
                        timerSecond = 0;
                        timerMillisecond = 0;
                    }
                }
            }
        }
        updateTime(timerHour, timerMinute, timerSecond, false);
    } else {
        var current_time = new Date();
        customHour = current_time.getHours();
        customMinute = current_time.getMinutes();
        customSecond = current_time.getSeconds();
        customMillisecond = current_time.getMilliseconds();
        updateTime(customHour, customMinute, customSecond, false);
    }

    // 计算当前时间的小数部分
    let precise_sec = (timerRunning ? timerSecond : customSecond) + (timerRunning ? timerMillisecond : customMillisecond) / 1000;
    let precise_min = (timerRunning ? timerMinute : customMinute) + precise_sec / 60;
    let precise_hour = (timerRunning ? timerHour : customHour) + precise_min / 60;

    // 准备更新秒表的数字部分
    // 更新 watchDisplay 显示
    if (customedTime) {
        let watchMinutes = Math.floor(precise_min);
        let watchSeconds = Math.floor(precise_sec % 60);
        let watchMilliseconds = Math.floor((precise_sec % 1) * 1000);
    
        // 格式化为字符串，确保分钟、秒、毫秒始终显示两位数
        let displayText = `${watchMinutes.toString().padStart(2, '0')}:${watchSeconds.toString().padStart(2, '0')}:${watchMilliseconds.toString().padStart(3, '0')}`;
    
        // 将更新的文本显示在 watchDisplay 元素上
        document.getElementById('watchDisplay').innerText = displayText;
    }


    // // 更新秒针、分针和时针的平滑位置
    hh_elem.style.strokeDashoffset = 510 * (1 - precise_hour / 12);
    mm_elem.style.strokeDashoffset = 630 * (1 - precise_min / 60);
    ss_elem.style.strokeDashoffset = 760 * (1 - precise_sec / 60);

    h_dot_elem.style.transform = `rotateZ(${precise_hour * 30}deg)`;
    m_dot_elem.style.transform = `rotateZ(${precise_min * 6}deg)`;
    s_dot_elem.style.transform = `rotateZ(${precise_sec * 6}deg)`;

    hr_needle_elem.style.transform = `rotateZ(${precise_hour * 30}deg)`;
    mn_needle_elem.style.transform = `rotateZ(${precise_min * 6}deg)`;
    sc_needle_elem.style.transform = `rotateZ(${precise_sec * 6}deg)`;


    requestAnimationFrame(updateClock);
}

// 初始化时钟更新
requestAnimationFrame(updateClock);

// 填充时间，确保时间总是以两位数显示
function fillTime(x) {
    return x < 10 ? '0' + x : '' + x;
}

// 更新时间显示的函数

function updateTime(hour, minute, second, to_animate) {
    var timeStr = fillTime(hour) + ":" + fillTime(minute) + ":" + fillTime(second);
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
    customMillisecond = 0;

    // 调用updateTime函数，使用用户输入的时间
    updateTime(customHour, customMinute, customSecond, true);

    customedTime = true;
});

// 为回到系统时间按钮添加事件监听器
document.getElementById('reTime').addEventListener('click', function () {
    customedTime = false;
});

// 为设置闹钟按钮添加事件监听器
document.getElementById('setAlarm').addEventListener('click', function () {
    // 读取用户输入的时间并存储
    customAlarmHour = parseInt(document.getElementById('alarmHours').value);
    customAlarmMin = parseInt(document.getElementById('alarmMinutes').value);
    customAlarmSec = parseInt(document.getElementById('alarmSeconds').value);

    // 提示用户可见的闹钟设置成功弹窗
    alert("闹钟设置成功，时间" + fillTime(customAlarmHour) + ":" + fillTime(customAlarmMin) + ":" + fillTime(customAlarmSec));
});


// 播放闹钟音频函数
function playsound() {
    var alarmSound = new Audio("../clock_sound.mp3");
    alarmSound.play().catch(function (error) {
        console.error('无法播放音频:', error);
    });
}

// 为设置秒表按钮添加事件监听器
document.getElementById('startWatch').addEventListener('click', function () {
    // 清空时间从0开始计时
    customedTime = true;
    customHour = 0;
    customMinute = 0;
    customSecond = 0;
    customMillisecond = 0;

    updateTime(customHour, customMinute, customSecond, true);
});


// 为停止秒表按钮添加事件监听器
document.getElementById('stopWatch').addEventListener('click', function () {
    // 清空时间从0开始计时
    alert("一共计时了" + getTime().hour + "小时" + getTime().minute + "分钟" + getTime().second + "秒");
    customedTime = false;
});

// 获取当前时间，如果用户自定义了时间，则使用自定义的时间
function getTime() {
    if (!customedTime) {
        var now_time = new Date();
        return {
            hour: now_time.getHours(),
            minute: now_time.getMinutes(),
            second: now_time.getSeconds(),
            millisecond: now_time.getMilliseconds()
        };
    }
      return { hour: customHour, minute: customMinute, second: customSecond, millisecond: customMillisecond }; // 返回用户自定义的时间
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
        let DragHour;
        let DragMinute;
        let DragSecond;

        interact(needle)
            .draggable({
                // 拖动开始
                onstart: function (event) {
                    event.preventDefault();
                    dragging = true;
                    var current_time = new Date();
                    DragHour = current_time.getHours();
                    DragMinute = current_time.getMinutes();
                    DragSecond = current_time.getSeconds();
                },
                // 拖动中
                onmove: function (event) {
                    const x = event.pageX - (circle.getBoundingClientRect().left + radius);
                    const y = event.pageY - (circle.getBoundingClientRect().top + radius);
                    const angle = calculateAngle(x, y, centerX, centerY);
                    needle.style.transform = `rotate(${angle}deg)`;

                    // 更新时间显示
                    updateTimeFromNeedles(needle, angle, DragHour, DragMinute, DragSecond);
                },
                // 拖动结束
                onend: function (event) {
                    // TODO 结束时先不恢复计时，而是出现一个按钮，等按下才恢复
                    dragging = false;
                    requestAnimationFrame(updateClock);
                }
            });
    });

    // 计算角度
    function calculateAngle(x, y, centerX, centerY) {
        let angle = Math.atan2(y - centerY, x - centerX) * (180 / Math.PI) + 90;
        if (angle < 0) {
            angle += 360;
        }
        return angle;
    }

    // 更新时间显示
    function updateTimeFromNeedles(needle, angle, DragHour, DragMinute, DragSecond) {
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
                // document.getElementById('customSeconds').value = timeValue.toString().padStart(2, '0');
                DragSecond = timeValue
                break;
            case 'mn':
                // document.getElementById('customMinutes').value = timeValue.toString().padStart(2, '0');
                DragMinute = timeValue
                break;
            case 'hr':
                // document.getElementById('customHours').value = timeValue.toString().padStart(2, '0');
                DragHour = timeValue
                break;
        }

        // 更新电子显示屏
        // updateTime(parseInt(document.getElementById('customHours').value),
        //     parseInt(document.getElementById('customMinutes').value),
        //     parseInt(document.getElementById('customSeconds').value), false);
        updateTime(DragHour, DragMinute, DragSecond, false)
        lastMinuteAngle = angle;
    }
});

// 为设置计时器按钮添加事件监听器
document.getElementById('setTimer').addEventListener('click', function () {
    // 读取用户输入的时间并存储
    timerHour = parseInt(document.getElementById('timerHours').value);
    timerMinute = parseInt(document.getElementById('timerMinutes').value);
    timerSecond = parseInt(document.getElementById('timerSeconds').value);
    timerMillisecond = 0;

    // 调用updateTime函数，使用用户输入的时间
    updateTime(timerHour, timerMinute, timerSecond, true);
    timerRunning = true;
    startTimer();
});

// 获取停止计时按钮并添加事件监听器
document.getElementById('stopTimer').addEventListener('click', function () {
    timerRunning = false;
    startTimer();
});

function $(selector){
    return document.querySelectorAll(selector);
}

var li = $(".usercm ul li");
var menu = $(".usercm")[0];

//右键菜单单击
document.oncontextmenu = function(event){
    var ev = event || window.event;
    var mX = event.clientX;
    var mY = event.clientY;
    menu.style.display = "block";
    menu.style.left = mX + "px";
    menu.style.top = mY + "px";
    return false;   //取消window自带的菜单弹出来
}

//点击页面菜单消失
document.onclick = function(){
    menu.style.display = "none";
}

//阻止点击li冒泡
for(var i = 0, len = li.length; i < len; i++ ){
    li.item(i).onclick = function(event){
        var ev = event || window.event;
        console.log(this.innerText);
        if(ev.stopPropagation()){
            ev.stopPropagation();
        }else{
            ev.cancelBubble = false;
        }
    }
}

//目前以下的响应全部和点击按钮相同
//TODO：优化响应并增加快捷键
document.getElementById('setWatchHook').addEventListener('click', function() {
    // 清空时间从0开始计时
    customedTime = true;
    customHour = 0;
    customMinute = 0;
    customSecond = 0;
    updateTime(customHour, customMinute, customSecond, true);
    //启用自定义的计时器
    startCustomTimer();
});

document.getElementById('setStopHook').addEventListener('click', function() {
    // 清空时间从0开始计时
    alert("一共计时了" + getTime().hour + "小时" + getTime().minute + "分钟" + getTime().second + "秒");
    customedTime = false;
});

// 为设置闹钟按钮添加事件监听器
document.getElementById('setAlarmHook').addEventListener('click', function() {
    // 读取用户输入的时间并存储
    customAlarmHour = parseInt(document.getElementById('customHours').value);
    customAlarmMin = parseInt(document.getElementById('customMinutes').value);
    customAlarmSec = parseInt(document.getElementById('customSeconds').value);

});

document.getElementById('setTimeHook').addEventListener('click', function() {
    // 读取用户输入的时间并存储
    customHour = parseInt(document.getElementById('customHours').value);
    customMinute = parseInt(document.getElementById('customMinutes').value);
    customSecond = parseInt(document.getElementById('customSeconds').value);

    // 调用updateTime函数，使用用户输入的时间
    updateTime(customHour, customMinute, customSecond,true);
    // TODO:这个时间添加数字渐变效果,.time-animation已经在css中实现
    customedTime = true;
    // 开始自定义时间的计时
    startCustomTimer();
});

// 为回到系统时间按钮添加事件监听器
document.getElementById('setSystemTimeHook').addEventListener('click', function () {
    customedTime = false;
});

// 为设置计时器按钮添加事件监听器
document.getElementById('setTimerHook').addEventListener('click', function () {
    // 读取用户输入的时间并存储
    timerHour = parseInt(document.getElementById('timerHours').value);
    timerMinute = parseInt(document.getElementById('timerMinutes').value);
    timerSecond = parseInt(document.getElementById('timerSeconds').value);
    timerMillisecond = 0;

    // 调用updateTime函数，使用用户输入的时间
    updateTime(timerHour, timerMinute, timerSecond, true);
    timerRunning = true;
    startTimer();
});

// 获取停止计时按钮并添加事件监听器
document.getElementById('stopTimerHook').addEventListener('click', function () {
    timerRunning = false;
    startTimer();
});
