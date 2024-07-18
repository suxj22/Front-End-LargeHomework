
        setInterval(()=>{
                let hh_elem = document.getElementById('hh');
                let mm_elem = document.getElementById('mm');
                let ss_elem = document.getElementById('ss');

                let s_dot_elem = document.querySelector('.second_dot');
                let m_dot_elem = document.querySelector('.minute_dot');
                let h_dot_elem = document.querySelector('.hour_dot');
                var current_time = new Date();

                let curr_hour = getTime().hour;
                let curr_min = getTime().minute;
                let curr_sec = getTime().second;

            //处理闹钟事件
            if (curr_hour == customAlarmHour && curr_min == customAlarmMin && curr_sec == customAlarmSec) {
                // 发出闹钟提示声音并且弹出弹窗
                playsound();
                alert("闹钟时间到！");
            }
            
                let sc_needle_elem = document.getElementById('sc');
                let mn_needle_elem = document.getElementById('mn');
                let hr_needle_elem = document.getElementById('hr');


                hh_elem.style.strokeDashoffset = 510 * (1 - curr_hour / 12);
                mm_elem.style.strokeDashoffset = 630 * (1 - curr_min / 60);
                ss_elem.style.strokeDashoffset = 760 * (1 - curr_sec / 60);

                h_dot_elem.style.transform = `rotateZ(${curr_hour*30}deg)`;
                m_dot_elem.style.transform = `rotateZ(${curr_min*6}deg)`;
                s_dot_elem.style.transform = `rotateZ(${curr_sec*6}deg)`;

                hr_needle_elem.style.transform = `rotateZ(${curr_hour*30}deg)`;
                mn_needle_elem.style.transform = `rotateZ(${curr_min*6}deg)`;
                sc_needle_elem.style.transform = `rotateZ(${curr_sec*6}deg)`;


},1000)
        
// 存储用户自定义的时间
var customHour, customMinute, customSecond;
var customAlarmHour, customAlarmMin, customAlarmSec;
var customedTime = false;

// 填充时间，确保时间总是以两位数显示
function fillTime(x) {
    return x < 10 ? '0' + x : '' + x;
}

// 更新时间显示的函数
function updateTime(hour, minute, second,to_animate) {
    var timeStr = fillTime(hour) + ":" + fillTime(minute) + ":" + fillTime(second);
    var time_list = document.querySelectorAll('text');
    time_list.forEach((item, i) => {
        item.textContent = timeStr;
    });
}

// 为设置时间按钮添加事件监听器
document.getElementById('setTime').addEventListener('click', function() {
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

// 开始自定义时间的计时
function startCustomTimer() {
    clearInterval(intervalId); // 清除现有的定时器
    intervalId = setInterval(function() {
        // 递增秒数
        customSecond++;
        if (customSecond >= 60) {
            customSecond = 0;
            customMinute++;
            if (customMinute >= 60) {
                customMinute = 0;
                customHour = (customHour + 1) % 24; // 24小时制，循环
            }
        }
        // 更新时间显示
        updateTime(customHour, customMinute, customSecond,false);
    }, 1000);
}

// 定义一个全局变量来存储定时器的ID
var intervalId;

// 初始设置定时器，使用当前时间
intervalId = setInterval(() => {
    var currentTime = getTime();
    updateTime(currentTime.hour, currentTime.minute, currentTime.second,false);
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
    return { hour: customHour, minute: customMinute, second: customSecond }; // 返回用户自定义的时间
}

//添加闹钟的事件监听器

// 为设置闹钟按钮添加事件监听器
document.getElementById('setAlarm').addEventListener('click', function() {
    // 读取用户输入的时间并存储
    customAlarmHour = parseInt(document.getElementById('customHours').value);
    customAlarmMin = parseInt(document.getElementById('customMinutes').value);
    customAlarmSec = parseInt(document.getElementById('customSeconds').value);

});

//播放闹钟音频函数
// 播放闹钟音频函数
function playsound() {
    var alarmSound = new Audio("../clock_sound.mp3");
    alarmSound.play().catch(function(error) {
        console.error('无法播放音频:', error);
    });
}
