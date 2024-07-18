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

function updateClock(timestamp) {
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

    // 更新秒针、分针和时针的平滑位置
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

// 为设置闹钟按钮添加事件监听器
document.getElementById('setAlarm').addEventListener('click', function () {
    // 读取用户输入的时间并存储
    customAlarmHour = parseInt(document.getElementById('customHours').value);
    customAlarmMin = parseInt(document.getElementById('customMinutes').value);
    customAlarmSec = parseInt(document.getElementById('customSeconds').value);
});

// 播放闹钟音频函数
function playsound() {
    var alarmSound = new Audio("../clock_sound.mp3");
    alarmSound.play().catch(function (error) {
        console.error('无法播放音频:', error);
    });
}

// 为设置计时按钮添加事件监听器
document.getElementById('setWatch').addEventListener('click', function () {
    // 清空时间从0开始计时
    customedTime = true;
    customHour = 0;
    customMinute = 0;
    customSecond = 0;
    customMillisecond = 0;

    updateTime(customHour, customMinute, customSecond, true);
});

// 为停止计时按钮添加事件监听器
document.getElementById('setStop').addEventListener('click', function () {
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
