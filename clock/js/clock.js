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
let watchStopped = false;
let savedWatchTime = {
    hour: 0,
    minute: 0,
    second: 0,
    millisecond: 0
}; // 用于保存秒表时间的变量

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
    } else if (watchStopped) {
    }
        else {
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
    let precise_sec = (timerRunning ? timerSecond : (watchRunning ? watchSecond : (watchStopped ? savedWatchTime.second: customSecond))) + (timerRunning ? timerMillisecond : (watchRunning ? watchMillisecond : (watchStopped ? savedWatchTime.millisecond : customMillisecond))) / 1000;
    let precise_min = (timerRunning ? timerMinute : (watchRunning ? watchMinute : (watchStopped ? savedWatchTime.minute : customMinute))) + precise_sec / 60;
    let precise_hour = (timerRunning ? timerHour : (watchRunning ? watchHour : (watchStopped ? savedWatchTime.hour : customHour))) + precise_min / 60;


    // 获取当前时间的整数部分
    let currentHour = Math.floor(precise_hour);
    let currentMinute = Math.floor(precise_min % 60);
    let currentSecond = Math.floor(precise_sec % 60);

    // 检查当前时间与闹钟时间是否匹配
    alarms.forEach((alarm, index) => {
        if (currentHour === alarm.hour && currentMinute === alarm.minute && currentSecond === alarm.second && alarm.enabled) {
            // 播放闹钟音频
            let alarmSound = new Audio('ikun.mp3'); // 请确保路径正确
            alarmSound.loop = true; // 使音频循环播放
            alarmSound.play();

            // 弹窗提示
            Swal.fire({
                title: '闹钟时间到了！',
                text: '选择确定以延时5分钟，取消以关闭闹钟。',
                icon: 'info',
                showCancelButton: false,
                showDenyButton: true,
                confirmButtonText: '延时5分钟',
                denyButtonText: '关闭闹钟'
            }).then((result) => {
                if (result.isConfirmed) {
                    // 延时5分钟
                    alarm.minute += 5;
                    if (alarm.minute >= 60) {
                        alarm.minute -= 60;
                        alarm.hour = (alarm.hour + 1) % 24;
                    }
                    showAlarmMenu();
                } else if (result.isDenied) {
                    // 禁用闹钟
                    alarm.enabled = false;
                    showAlarmMenu();
                }
                alarmSound.pause();
            })
        }
    });

    // 更新 watchDisplay 显示
    if (watchRunning) {
        let watchMinutes = Math.floor(precise_min);
        let watchSeconds = Math.floor(precise_sec % 60);
        let watchMilliseconds = Math.floor((precise_sec % 1) * 1000);

        // 格式化为字符串，确保分钟、秒、毫秒始终显示两位数
        // 将更新的文本显示在 watchDisplay 元素上
        document.getElementById('watchDisplay').innerText = `${watchMinutes.toString().padStart(2, '0')}:${watchSeconds.toString().padStart(2, '0')}:${watchMilliseconds.toString().padStart(3, '0')}`;
    }
    else if (watchStopped) {
        let watchMinutes = savedWatchTime.minute;
        let watchSeconds = savedWatchTime.second;
        let watchMilliseconds = Math.floor(savedWatchTime.millisecond); // 截断小数部分，只保留整数

        // 格式化为字符串，确保分钟、秒、毫秒始终显示两位数
        // 将更新的文本显示在 watchDisplay 元素上
        // 注意：这里不需要对毫秒数使用padStart，因为它已经是整数了
        document.getElementById('watchDisplay').innerText =
            `${watchMinutes.toString().padStart(2, '0')}:${watchSeconds.toString().padStart(2, '0')}:${watchMilliseconds}`; // 直接显示毫秒整数，不使用padStart
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

function playsound() {
    let alarmSound = new Audio('ikun.mp3'); // 请确保路径正确
    alarmSound.loop = true; // 使音频循环播放
    alarmSound.play().catch(function (error) {
        console.error('无法播放音频:', error);
    });

    // 暴露用于停止音频播放的函数
    window.stopAlarmSound = function() {
        alarmSound.pause();
        alarmSound.currentTime = 0;
    }
}

// 为弹窗操作添加事件监听器
function handleAlarmAction(delay) {
    if (delay) {
        customAlarmMin += 5;
        if (customAlarmMin >= 60) {
            customAlarmMin -= 60;
            customAlarmHour = (customAlarmHour + 1) % 24;
        }
    } else {
        stopAlarmSound();
    }
}

// 在HTML中，设置相应的弹窗按钮，确保有功能关闭声音
document.getElementById('snoozeButton').addEventListener('click', function() {
    handleAlarmAction(true);
});
document.getElementById('dismissButton').addEventListener('click', function() {
    handleAlarmAction(false);
});

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
    let name = document.getElementById('alarmName').value || '未命名';
    let hour = parseInt(document.getElementById('alarmHours').value);
    let minute = parseInt(document.getElementById('alarmMinutes').value);
    let second = parseInt(document.getElementById('alarmSeconds').value);

    // 验证用户输入的时间
    if (!validateTime(hour, minute, second)) {
        return;
    }

    // 创建新的闹钟对象
    let newAlarm = {
        name: name,
        hour: hour,
        minute: minute,
        second: second,
        enabled: true
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

    // 提示用户可见的闹钟设置成功弹窗
    alert("闹钟设置成功，时间" + fillTime(hour) + ":" + fillTime(minute) + ":" + fillTime(second));
});

// 显示闹钟菜单功能
// 显示闹钟菜单并填充闹钟列表
function showAlarmMenu() {
    const alarmMenu = document.getElementById('alarmMenu');
    const alarmList = document.getElementById('alarmList');

    if (alarms.length === 0) {
        alarmList.innerHTML = '<li>没有设置闹钟</li>';
        alarmMenu.style.display = 'none';
        return;
    } else {
        alarmMenu.style.display = 'block';
    }

    alarmList.innerHTML = '';

    alarms.forEach((alarm, index) => {
        let listItem = document.createElement('li');
        listItem.innerHTML = `${alarm.name} - ${fillTime(alarm.hour)}:${fillTime(alarm.minute)}:${fillTime(alarm.second)}`;

        listItem.style.opacity = alarm.enabled ? '1' : '0.5';

        let toggleBtn = document.createElement('button');
        toggleBtn.className = 'toggle-btn';
        toggleBtn.textContent = alarm.enabled ? '禁' : '启';
        listItem.appendChild(toggleBtn);

        let deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        listItem.appendChild(deleteBtn);

        alarmList.appendChild(listItem);

        listItem.addEventListener('click', function() {
            Swal.fire({
                title: '编辑闹钟',
                html: `
                    <input type="text" id="swal-input1" class="swal2-input" placeholder="闹钟名称" value="${alarm.name}">
                    <input type="number" id="swal-input2" class="swal2-input" placeholder="小时" value="${alarm.hour}">
                    <input type="number" id="swal-input3" class="swal2-input" placeholder="分钟" value="${alarm.minute}">
                    <input type="number" id="swal-input4" class="swal2-input" placeholder="秒" value="${alarm.second}">
                `,
                focusConfirm: false,
                preConfirm: () => {
                    const name = document.getElementById('swal-input1').value;
                    const hour = parseInt(document.getElementById('swal-input2').value, 10);
                    const minute = parseInt(document.getElementById('swal-input3').value, 10);
                    const second = parseInt(document.getElementById('swal-input4').value, 10);

                    if (!name || !validateTime(hour, minute, second)) {
                        Swal.showValidationMessage('请输入有效的名称和时间');
                        return;
                    }

                    return { name, hour, minute, second };
                }
            }).then((result) => {
                if (result.isConfirmed) {
                    alarm.name = result.value.name;
                    alarm.hour = result.value.hour;
                    alarm.minute = result.value.minute;
                    alarm.second = result.value.second;

                    listItem.innerHTML = `${alarm.name} - ${fillTime(alarm.hour)}:${fillTime(alarm.minute)}:${fillTime(alarm.second)}`;
                    listItem.style.opacity = alarm.enabled ? '1' : '0.5';
                    listItem.appendChild(toggleBtn);
                    listItem.appendChild(deleteBtn);
                }
            });
        });

        toggleBtn.addEventListener('click', function(event) {
            event.stopPropagation();
            alarm.enabled = !alarm.enabled;
            listItem.style.opacity = alarm.enabled ? '1' : '0.5';
            toggleBtn.textContent = alarm.enabled ? '禁' : '启';
        });

        deleteBtn.addEventListener('click', function(event) {
            event.stopPropagation();
            alarms.splice(index, 1);
            showAlarmMenu();
        });
    });
}




// 用于填充时间的辅助函数，确保时间格式为两位数
function fillTime(time) {
    return time.toString().padStart(2, '0');
}

// 用于验证输入的时间是否有效
function validateTime(hour, minute, second) {
    return (hour >= 0 && hour <= 23) && (minute >= 0 && minute <= 59) && (second >= 0 && second <= 59);
}


// 为计次按钮添加事件监听器
document.getElementById('lapWatch').addEventListener('click', function () {
    if (!watchRunning) {
        alert("秒表未启动！");
        return;
    }

        savedWatchTime = {
            hour: watchHour,
            minute: watchMinute,
            second: watchSecond,
            millisecond: Math.floor(watchMillisecond)
        };
        // 格式化时间字符串
        let timeStr = `${savedWatchTime.minute.toString().padStart(2, '0')}:${savedWatchTime.second.toString().padStart(2, '0')}:${savedWatchTime.millisecond.toString().padStart(3, '0')} ms`;
         // 创建新的列表项
        let newItem = document.createElement('li');
        newItem.textContent = timeStr; // 设置列表项的文本内容

        // 将新的列表项添加到 watchMenu 元素中
        document.getElementById('watchMenu').appendChild(newItem);
});


// 为秒表开始按钮添加事件监听器
document.getElementById('startWatch').addEventListener('click', function () {
    if (timerRunning) {
        alert("正在使用计时器，请先关闭计时器！");
        return;
    }
    if (!watchRunning) {
        // 如果秒表之前被暂停过，从保存的时间继续
        if (watchStopped) {
            watchHour = savedWatchTime.hour;
            watchMinute = savedWatchTime.minute;
            watchSecond = savedWatchTime.second;
            watchMillisecond = savedWatchTime.millisecond;
        } else {
            // 如果秒表没有被暂停过，从零开始
            watchHour = 0;
            watchMinute = 0;
            watchSecond = 0;
            watchMillisecond = 0;
        }

        updateTime(watchHour, watchMinute, watchSecond);
        watchRunning = true;
        watchPaused = false; // 清除暂停标记
    }
});
// 为秒表暂停按钮添加事件监听器
document.getElementById('stopWatch').addEventListener('click', function () {
    if (timerRunning) {
        alert("正在使用计时器，请先关闭计时器！");
        return;
    }
    watchStopped = true;
    watchRunning = false;
});

// 为秒表重置按钮添加事件监听器
function restartWatch() {
    // 清空秒表菜单中的所有列表项
    const watchMenu = document.getElementById('watchMenu');
    watchMenu.innerHTML = '秒表菜单'; // 清空列表

    // 重置秒表时间
    watchHour = 0;
    watchMinute = 0;
    watchSecond = 0;
    watchMillisecond = 0;

    // 重置保存的秒表时间
    savedWatchTime = {
        hour: 0,
        minute: 0,
        second: 0,
        millisecond: 0
    };
    document.getElementById('watchDisplay').innerText = '00:00:000';
    // 重置秒表状态
    watchRunning = false;
    watchStopped = false;
}
// 为 restartWatch 按钮添加点击事件监听器
document.getElementById('restartWatch').addEventListener('click', restartWatch);

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
    var watchMenu = document.querySelector('#watchMenu');
    if (controls.style.display === 'none' || controls.style.display === '') {
        controls.style.display = 'block';
        watchMenu.style.display = 'block';
    } else {
        controls.style.display = 'none';
        watchMenu.style.display = 'none';
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
