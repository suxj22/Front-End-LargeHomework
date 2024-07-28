// 初始化全局变量
let customHour, customMinute, customSecond, customMillisecond;
let customAlarmHour, customAlarmMin, customAlarmSec;
// 闹钟全局变量 内容是设置的闹钟时间
let alarms = [];
let customedTime = false;
let lastTimestamp = null;

// 计时器相关变量
let timerHour, timerMinute, timerSecond, timerMillisecond;
let timerRunning = false;

// 秒表相关变量
let watchHour, watchMinute, watchSecond, watchMillisecond;
let watchRunning = false;

// 拖动变量
let dragging = false;
let DragRememberHour = -1;
let DragRememberMinute = -1;
let DragRememberSecond = -1;
let HourDragged = false;
let MinuteDragged = false;
let SecondDragged = false;
let afterDragging = false;
let afterDraggingInit = true;

let ready_0 = false;
let ready_11 = false;
let ready_12 = false;
let ready_23 = false;
let downhalf = false;
let uphalf = false;


function updateClock(timestamp) {
    if (dragging) {
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

    // 用户自定义时间时，这个时间无论是否被使用上，均需要更新
    if (customedTime && !afterDragging) {
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
    }

    // 计时器
    if (timerRunning) {
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
        updateTime(timerHour, timerMinute, timerSecond);
    } else if (watchRunning) {// 秒表
        watchMillisecond += elapsed;
        if (watchMillisecond >= 1000) {
            watchMillisecond -= 1000;
            watchSecond++;
            if (watchSecond >= 60) {
                watchSecond = 0;
                watchMinute++;
                if (watchMinute >= 60) {
                    watchMinute = 0;
                    watchHour = (watchHour + 1) % 24;
                }
            }
        }
        updateTime(watchHour, watchMinute, watchSecond);
    } else {
        if(afterDragging && afterDraggingInit) {
            customHour = DragRememberHour;
            customMinute = DragRememberMinute;
            customSecond = DragRememberSecond;
            afterDraggingInit = false;
        }
        else if(afterDragging) {
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
            DragRememberHour = customHour;
            DragRememberMinute = customMinute;
            DragRememberSecond = customSecond;
        }
        else if (customedTime) {
            //由于时间在之前已经推移，这个地方仅仅需要更新显示即可
        }
        else {
            // 系统默认时间处理方式
            var current_time = new Date();
            customHour = current_time.getHours();
            if(customHour >= 12) {
                downhalf = true;
                uphalf = false;
            }
            else {
                downhalf = false;
                uphalf = true;
            }
            customMinute = current_time.getMinutes();
            customSecond = current_time.getSeconds();
            customMillisecond = current_time.getMilliseconds();
        }
        updateTime(customHour, customMinute, customSecond);
    }

    // 计算当前时间的小数部分
    let precise_sec = (timerRunning ? timerSecond : (watchRunning ? watchSecond : customSecond)) + (timerRunning ? timerMillisecond : (watchRunning ? watchMillisecond : customMillisecond)) / 1000;
    let precise_min = (timerRunning ? timerMinute : (watchRunning ? watchMinute : customMinute)) + precise_sec / 60;
    let precise_hour = (timerRunning ? timerHour : (watchRunning ? watchHour : customHour)) + precise_min / 60;


    // 获取当前时间的整数部分
    let currentHour = Math.floor(precise_hour);
    let currentMinute = Math.floor(precise_min % 60);
    let currentSecond = Math.floor(precise_sec % 60);


    // 更新 watchDisplay 显示
    if (watchRunning) {
        let watchMinutes = Math.floor(precise_min);
        let watchSeconds = Math.floor(precise_sec % 60);
        let watchMilliseconds = Math.floor((precise_sec % 1) * 1000);

        // 格式化为字符串，确保分钟、秒、毫秒始终显示两位数
        // 将更新的文本显示在 watchDisplay 元素上
        document.getElementById('watchDisplay').innerText = `${watchMinutes.toString().padStart(2, '0')}:${watchSeconds.toString().padStart(2, '0')}:${watchMilliseconds.toString().padStart(3, '0')}`;
    }
    else {
        let watchMinutes = 0;
        let watchSeconds = 0;
        let watchMilliseconds = 0;

        // 格式化为字符串，确保分钟、秒、毫秒始终显示两位数
        // 将更新的文本显示在 watchDisplay 元素上
        document.getElementById('watchDisplay').innerText = `${watchMinutes.toString().padStart(2, '0')}:${watchSeconds.toString().padStart(2, '0')}:${watchMilliseconds.toString().padStart(3, '0')}`;
    }

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
function updateTime(hour, minute, second) {
    var timeStr = fillTime(hour) + ":" + fillTime(minute) + ":" + fillTime(second);
    var time_list = document.querySelectorAll('text');
    time_list.forEach((item) => {
        item.textContent = timeStr;
    });
}

// 验证用户输入的时间
function validateTime(hour, minute, second) {
    const hourRegex = /^([0-1]?[0-9]|2[0-3])$/;
    const minuteSecondRegex = /^([0-5]?[0-9])$/;

    if (!hourRegex.test(hour)) {
        alert("小时数必须在0到23之间");
        return false;
    }
    if (!minuteSecondRegex.test(minute)) {
        alert("分钟数必须在0到59之间");
        return false;
    }
    if (!minuteSecondRegex.test(second)) {
        alert("秒数必须在0到59之间");
        return false;
    }
    return true;
}

// 为设置时间按钮添加事件监听器
document.getElementById('setTime').addEventListener('click', function () {
    // 读取用户输入的时间并存储
    let hour = parseInt(document.getElementById('customHours').value);
    let minute = parseInt(document.getElementById('customMinutes').value);
    let second = parseInt(document.getElementById('customSeconds').value);

    // 验证用户输入的时间
    if (!validateTime(hour, minute, second)) {
        return;
    }

    customHour = hour;
    customMinute = minute;
    customSecond = second;
    customMillisecond = 0;

    // 调用updateTime函数，使用用户输入的时间
    updateTime(customHour, customMinute, customSecond);

    customedTime = true;
});

// 为回到系统时间按钮添加事件监听器
document.getElementById('reTime').addEventListener('click', function () {
    customedTime = false;
    afterDragging = false;
    afterDraggingInit = true;
    DragRememberHour = -1;
    DragRememberMinute = -1;
    DragRememberSecond = -1;
    HourDragged = false;
    MinuteDragged = false;
    SecondDragged = false;
    document.body.style.backgroundImage = null;
});

// 为设置闹钟按钮添加事件监听器
document.getElementById('setAlarm').addEventListener('click', function () {
    // 读取用户输入的时间并存储
    let hour = parseInt(document.getElementById('alarmHours').value);
    let minute = parseInt(document.getElementById('alarmMinutes').value);
    let second = parseInt(document.getElementById('alarmSeconds').value);

    // 验证用户输入的时间
    if (!validateTime(hour, minute, second)) {
        return;
    }
  // 创建新的闹钟对象
    let newAlarm = {
        hour: hour,
        minute: minute,
        second: second
    };

   // 检查闹钟时间是否已经存在于数组之中
    let alarmExists = alarms.some(function(alarm) {
        return alarm.hour === newAlarm.hour && alarm.minute === newAlarm.minute && alarm.second === newAlarm.second;
    });

    if (alarmExists) {
        alert("这个闹钟时间已经存在！");
        return;
    }

    // 将新闹钟添加到闹钟数组中
    alarms.push(newAlarm);

    // 显示闹钟菜单并填充闹钟列表
    showAlarmMenu();

    //TODO:把customedAlarmTime检查修改为遍历闹钟数组
    customAlarmHour = hour;
    customAlarmMin = minute;
    customAlarmSec = second;

    // 提示用户可见的闹钟设置成功弹窗
    alert("闹钟设置成功，时间" + fillTime(customAlarmHour) + ":" + fillTime(customAlarmMin) + ":" + fillTime(customAlarmSec));
});

// 显示闹钟菜单功能
// 显示闹钟菜单并填充闹钟列表
function showAlarmMenu() {
    // 获取闹钟菜单元素
    const alarmMenu = document.getElementById('alarmMenu');
    const alarmList = document.getElementById('alarmList');

   // 检查闹钟数组是否为空
    if (alarms.length === 0) {
        // 如果没有闹钟，则隐藏闹钟菜单
        alarmMenu.style.display = 'none';
        return;
    } else {
        // 如果有闹钟，则显示闹钟菜单
        alarmMenu.style.display = 'block';
    }


    // 清空现有的闹钟列表
    alarmList.innerHTML = '';

    alarms.forEach((alarm, index) => {
        let listItem = document.createElement('li');
        listItem.textContent = `闹钟 ${index + 1}: ${fillTime(alarm.hour)}:${fillTime(alarm.minute)}:${fillTime(alarm.second)}`;

        // 创建删除按钮并添加到列表项中
        let deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        listItem.appendChild(deleteBtn);

        // 将列表项添加到闹钟列表中
        alarmList.appendChild(listItem);

        // 为删除按钮添加点击事件
        deleteBtn.onclick = function() {
            alarms.splice(index, 1);
            showAlarmMenu();
        };
    });
}

// 播放闹钟音频函数
function playsound() {
    let alarmSound = new Audio('ikun.mp3'); // 请确保路径正确
    alarmSound.addEventListener('canplaythrough', function () {
        console.log('Audio loaded successfully, playing sound.');
        alarmSound.play().catch(function (error) {
            console.error('无法播放音频:', error);
        });
    });
    alarmSound.addEventListener('error', function (error) {
        console.error('音频加载失败:', error);
    });
}

// 为秒表开始按钮添加事件监听器
document.getElementById('startWatch').addEventListener('click', function () {
    if (timerRunning) {
        alert("正在使用计时器，请先关闭计时器！");
        return;
    }
    if (!timerRunning) {
        watchHour = 0;
        watchMinute = 0;
        watchSecond = 0;
        watchMillisecond = 0;

        updateTime(watchHour, watchMinute, watchSecond);
        watchRunning = true;
    }
});

// 为秒表停止按钮添加事件监听器
document.getElementById('stopWatch').addEventListener('click', function () {
    if (timerRunning) {
        alert("正在使用计时器，请先关闭计时器！");

    } else {
        alert("一共计时了" + watchHour + "小时" + watchMinute + "分钟" + watchSecond + "秒");
        watchHour = 0;
        watchMinute = 0;
        watchSecond = 0;
        watchMillisecond = 0;
        watchRunning = false;
    }
});


// 拖动
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

        let DragHour;
        let DragMinute;
        let DragSecond;

        interact(needle)
            .draggable({
                // 拖动开始
                onstart: function (event) {
                    if(timerRunning || watchRunning) return;
                    event.preventDefault();
                    dragging = true;
                    var current_time = new Date();
                    if (DragRememberHour !== -1) {
                        DragHour = DragRememberHour;
                    } else {
                        DragHour = current_time.getHours();
                    }

                    if (DragRememberMinute !== -1) {
                        DragMinute = DragRememberMinute;
                    } else {
                        DragMinute = current_time.getMinutes();
                    }

                    if (DragRememberSecond !== -1) {
                        DragSecond = DragRememberSecond;
                    } else {
                        DragSecond = current_time.getSeconds();
                    }
                },
                // 拖动中
                onmove: function (event) {
                    if(timerRunning || watchRunning) return;
                    const x = event.pageX - (circle.getBoundingClientRect().left + radius);
                    const y = event.pageY - (circle.getBoundingClientRect().top + radius);
                    const angle = calculateAngle(x, y, centerX, centerY);
                    needle.style.transform = `rotate(${angle}deg)`;

                    // 更新时间显示
                    updateTimeFromNeedles(needle, angle, DragHour, DragMinute, DragSecond);
                },
                // 拖动结束
                onend: function (event) {
                    if(timerRunning || watchRunning) return;
                    // TODO 结束时先不恢复计时，而是出现一个按钮，等按下才恢复
                    dragging = false;
                    afterDragging = true;
                    afterDraggingInit = true;
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
                if(downhalf) {
                    timeValue += 12;
                }

                if(timeValue === 0) {
                    ready_0 = true;
                }
                else if(timeValue === 11) {
                    ready_11 = true;
                }
                else if(timeValue === 12) {
                    ready_12 = true;
                }
                else if(timeValue === 23) {
                    ready_23 = true;
                }

                if(ready_0 && timeValue === 11) {
                    downhalf = true;
                    uphalf = false;
                    timeValue = 23;
                    ready_0 = false;
                }
                else if(ready_11 && timeValue === 0) {
                    downhalf = true;
                    uphalf = false;
                    timeValue = 12;
                    ready_11 = false;
                }
                else if(ready_12 && timeValue === 23) {
                    downhalf = false;
                    uphalf = true;
                    timeValue = 11;
                    ready_12 = false;
                }
                else if(ready_23 && timeValue === 12) {
                    downhalf = false;
                    uphalf = true;
                    timeValue = 0;
                    ready_23 = false;
                }
                else if(timeValue === 1 || timeValue === 10 || timeValue === 13 || timeValue === 22) {
                    ready_0 = false;
                    ready_11 = false;
                    ready_12 = false;
                    ready_23 = false;
                }

                break;
        }

        // 更新自定义时间输入框和电子显示屏
        switch (id) {
            case 'sc':
                DragSecond = timeValue;
                DragRememberSecond = timeValue;
                SecondDragged = true;
                break;
            case 'mn':
                DragMinute = timeValue;
                DragRememberMinute = timeValue;
                MinuteDragged = true;
                break;
            case 'hr':
                DragHour = timeValue;
                DragRememberHour = timeValue;
                HourDragged = true;
                break;
        }

        // 更新电子显示屏
        updateTime(DragHour, DragMinute, DragSecond)
        if (!HourDragged) {
            DragRememberHour = DragHour;
        }
        if (!MinuteDragged) {
            DragRememberMinute = DragMinute;
        }
        if (!SecondDragged) {
            DragRememberSecond = DragSecond;
        }
        lastMinuteAngle = angle;
    }
});



// 为设置计时器按钮添加事件监听器
document.getElementById('setTimer').addEventListener('click', function () {
    if (watchRunning) {
        alert("正在使用秒表，请先停止秒表！");
        return;
    }
    if (!watchRunning) {
        // 读取用户输入的时间并存储
        let hour = parseInt(document.getElementById('timerHours').value);
        let minute = parseInt(document.getElementById('timerMinutes').value);
        let second = parseInt(document.getElementById('timerSeconds').value);

        // 验证用户输入的时间
        if (!validateTime(hour, minute, second)) {
            return;
        }

        timerHour = hour;
        timerMinute = minute;
        timerSecond = second;
        timerMillisecond = 0;

        // 调用updateTime函数，使用用户输入的时间
        updateTime(timerHour, timerMinute, timerSecond);
        timerRunning = true;
    }
});

// 获取停止计时按钮并添加事件监听器
document.getElementById('stopTimer').addEventListener('click', function () {
    if (watchRunning) {
        alert("正在使用秒表，请先停止秒表！");
        return;
    }
    if (!watchRunning) {
        timerRunning = false;
    }
});

function $(selector) {
    return document.querySelectorAll(selector);
}

let li = $(".usercm ul li");
let menu = $(".usercm")[0];

function showContextMenu(event) {
    var mX = event.clientX;
    var mY = event.clientY;
    menu.style.left = mX + "px";
    menu.style.top = mY + "px";
    menu.style.display = "block"; // 确保菜单显示
    setTimeout(function() {
        menu.classList.remove('hide');
        menu.classList.add('show');
    }, 10); // 延迟添加动画类以确保 display 属性已生效
    return false; // 取消window自带的菜单弹出来
}

// 隐藏右键菜单
function hideContextMenu() {
    menu.classList.remove('show');
    menu.classList.add('hide');
    setTimeout(function() {
        menu.style.display = "none"; // 确保菜单完全隐藏
    }, 300); // 等待动画完成后隐藏
}

// 显示右键菜单
document.oncontextmenu = showContextMenu;

// 隐藏右键菜单
document.onclick = hideContextMenu;

// 阻止点击li冒泡
for (var i = 0, len = li.length; i < len; i++) {
    li.item(i).onclick = function (event) {
        var ev = event || window.event;
        console.log(this.innerText);
        if (ev.stopPropagation) {
            ev.stopPropagation();
        } else {
            ev.cancelBubble = false;
        }
        // 添加点击选项后的淡出效果
        menu.classList.remove('show');
        menu.classList.add('hide');
        setTimeout(function() {
            menu.style.display = "none";
        }, 300); // 等待动画完成后隐藏
    }
}

// 目前以下的响应全部和点击按钮相同
// TODO：优化响应并增加快捷键
document.getElementById('setWatchHook').addEventListener('click', function () {
    if (timerRunning) {
        alert("正在使用计时器，请先关闭计时器！");
        return;
    }
    watchHour = 0;
    watchMinute = 0;
    watchSecond = 0;
    watchMillisecond = 0;

    updateTime(watchHour, watchMinute, watchSecond);
    watchRunning = true;
    hideContextMenu(); // 点击后淡出菜单
});

document.getElementById('stopWatchHook').addEventListener('click', function () {
    if (timerRunning) {
        alert("正在使用计时器，请先关闭计时器！");
        return;
    }
    alert("一共计时了" + watchHour + "小时" + watchMinute + "分钟" + watchSecond + "秒");
    watchHour = 0;
    watchMinute = 0;
    watchSecond = 0;
    watchMillisecond = 0;
    watchRunning = false;
    hideContextMenu(); // 点击后淡出菜单
});

// 为设置闹钟按钮添加事件监听器
document.getElementById('setAlarmHook').addEventListener('click', function () {
    // 读取用户输入的时间并存储
    let hour = parseInt(document.getElementById('customHours').value);
    let minute = parseInt(document.getElementById('customMinutes').value);
    let second = parseInt(document.getElementById('customSeconds').value);

    // 验证用户输入的时间
    if (!validateTime(hour, minute, second)) {
        return;
    }

    customAlarmHour = hour;
    customAlarmMin = minute;
    customAlarmSec = second;
    hideContextMenu(); // 点击后淡出菜单
     // 提示用户可见的闹钟设置成功弹窗
    alert("闹钟设置成功，时间" + fillTime(customAlarmHour) + ":" + fillTime(customAlarmMin) + ":" + fillTime(customAlarmSec));
});

document.getElementById('setTimeHook').addEventListener('click', function () {
    // 读取用户输入的时间并存储
    let hour = parseInt(document.getElementById('customHours').value);
    let minute = parseInt(document.getElementById('customMinutes').value);
    let second = parseInt(document.getElementById('customSeconds').value);

    // 验证用户输入的时间
    if (!validateTime(hour, minute, second)) {
        return;
    }

    customHour = hour;
    customMinute = minute;
    customSecond = second;
    customMillisecond = 0;

    // 调用updateTime函数，使用用户输入的时间
    updateTime(customHour, customMinute, customSecond);

    customedTime = true;
    hideContextMenu(); // 点击后淡出菜单
});

// 为回到系统时间按钮添加事件监听器
document.getElementById('setSystemTimeHook').addEventListener('click', function () {
    customedTime = false;
    afterDragging = false;
    afterDraggingInit = true;
    DragRememberHour = -1;
    DragRememberMinute = -1;
    DragRememberSecond = -1;
    HourDragged = false;
    MinuteDragged = false;
    SecondDragged = false;
    hideContextMenu(); // 点击后淡出菜单
    document.body.style.backgroundImage = null;
});

// 为设置计时器按钮添加事件监听器
document.getElementById('setTimerHook').addEventListener('click', function () {
    if (watchRunning) {
        alert("正在使用秒表，请先停止秒表！");
        return;
    }
    // 读取用户输入的时间并存储
    let hour = parseInt(document.getElementById('timerHours').value);
    let minute = parseInt(document.getElementById('timerMinutes').value);
    let second = parseInt(document.getElementById('timerSeconds').value);

    // 验证用户输入的时间
    if (!validateTime(hour, minute, second)) {
        return;
    }

    timerHour = hour;
    timerMinute = minute;
    timerSecond = second;
    timerMillisecond = 0;

    // 调用updateTime函数，使用用户输入的时间
    updateTime(timerHour, timerMinute, timerSecond);
    timerRunning = true;
    hideContextMenu(); // 点击后淡出菜单
});

// 获取停止计时按钮并添加事件监听器
document.getElementById('stopTimerHook').addEventListener('click', function () {
    if (watchRunning) {
        alert("正在使用秒表，请先停止秒表！");
        return;
    }
    timerRunning = false;
    hideContextMenu(); // 点击后淡出菜单
});
document.getElementById('toggleTimerControls').addEventListener('click', function() {
    var timerControls = document.getElementById('timer-controls');
    if (timerControls.style.display === 'none' || timerControls.style.display === '') {
        timerControls.style.display = 'block';
    } else {
        timerControls.style.display = 'none';
    }
});

document.getElementById('toggleTopLeft').addEventListener('click', function() {
    var controls = document.querySelector('#time-controls .controls');
    if (controls.style.display === 'none' || controls.style.display === '') {
        controls.style.display = 'block';
    } else {
        controls.style.display = 'none';
    }
});
// 同时隐藏闹钟设置和菜单
document.getElementById('toggleTimeClock').addEventListener('click', function() {
    var controls = document.querySelector('#time-clock .controls');
    var alarmMenu = document.getElementById('alarmMenu');

    if (controls.style.display === 'none' || controls.style.display === '') {
        controls.style.display = 'block';
        alarmMenu.style.display = 'block';
    } else {
        controls.style.display = 'none';
        alarmMenu.style.display = 'none';
    }
});
document.getElementById('toggleTimeWatch').addEventListener('click', function() {
    var controls = document.querySelector('#time-watch .controls');
    if (controls.style.display === 'none' || controls.style.display === '') {
        controls.style.display = 'block';
    } else {
        controls.style.display = 'none';
    }
});

// 世界时钟相关函数

function gb(){
    var date = new Date();
    var hour = date.getHours();
    customMinute = date.getMinutes();
    customSecond = date.getSeconds();
    if(hour > 7){
        customHour = hour - 7;
    }
    else{
        customHour = hour + 17;
    }
    customedTime = true;
    document.body.style.backgroundImage="url(img/London.jpeg)"; // 改变背景图片
}

function us(){
    var date = new Date();
    var hour = date.getHours();
    customMinute = date.getMinutes();
    customSecond = date.getSeconds();
    if(hour > 12){
        customHour = hour - 12;
    }
    else{
        customHour = hour + 12;
    }
    customedTime = true;
    document.body.style.backgroundImage="url(img/NY.jpg)"; // 改变背景图片
}

function ru(){
    var date = new Date();
    var hour = date.getHours();
    customMinute = date.getMinutes();
    customSecond = date.getSeconds();
    if(hour > 5){
        customHour = hour - 5;
    }
    else{
        customHour = hour + 19;
    }
    customedTime = true;
    document.body.style.backgroundImage="url(img/Moscow.jpg)"; // 改变背景图片
}

function ind(){
    var date = new Date();
    var hour = date.getHours();
    customMinute = date.getMinutes();
    customSecond = date.getSeconds();
    if(customMinute > 30){
        customMinute -= 30;
    }
    else{
        customMinute += 30;
        hour -= 1;
    }
    if(hour > 2){
        customHour = hour - 2;
    }
    else{
        customHour = hour + 22;
    }
    customedTime = true;
    document.body.style.backgroundImage="url(img/delhi.jpg)"; // 改变背景图片
}

function br(){
    var date = new Date();
    var hour = date.getHours();
    customMinute = date.getMinutes();
    customSecond = date.getSeconds();
    if(hour > 11){
        customHour = hour - 11;
    }
    else{
        customHour = hour + 11;
    }
    customedTime = true;
    document.body.style.backgroundImage="url(img/rio.jpg)"; // 改变背景图片
}

function tu(){
    var date = new Date();
    var hour = date.getHours();
    customMinute = date.getMinutes();
    customSecond = date.getSeconds();
    if(hour > 5){
        customHour = hour - 5;
    }
    else{
        customHour = hour + 5;
    }
    customedTime = true;
    document.body.style.backgroundImage="url(img/ist.png)"; // 改变背景图片
}
