const { spawn } = require('child_process')

const projection = function(deviceCode, cb){
    const scrcpyProcess = spawn('scrcpy', ['-s', deviceCode])

    // 打印正常的后台可执行程序输出
    scrcpyProcess.stdout.on('data', function (data) {
        cb && cb("data", data)
    })

    // 打印错误的后台可执行程序输出
    scrcpyProcess.on('error', function (data) {
        cb && cb("error", data)
    })

    // 关闭之后的输出
    scrcpyProcess.on('close', function (data) {
        cb && cb("close", data)
    })

    // 退出
    scrcpyProcess.on('exit', function (data) {
        cb && cb("exit", data)
    })

    return scrcpyProcess;
}

const stopProjection = function(scrcpyProcess){
    scrcpyProcess.kill('SIGTERM');
}

export default {
    projection,
    stopProjection,
}
