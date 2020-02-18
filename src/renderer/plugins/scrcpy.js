const { spawn } = require('child_process')

const initArgs = function (config) {
    let args = []

    if (config.bitRate !== 8) {
        args.push('--bit-rate')
        args.push(`${config.bitRate}M`)
    }

    if (config.record) {
        if (!config.recordDisplay) {
            args.push('--no-display')
        }
        args.push('--record')
        args.push("{0}\\record-{1}.mkv".format(config.recordPath, (new Date()).Format("yyyyMMddhhmmss")))
    }

    if (config.pcControl) {
        args.push('--no-control')
    }

    if (config.touchPoint) {
        args.push('--show-touches')
    }

    return args;
}

const projection = function(config, deviceCode, cb){
    let args = initArgs(config);

    const scrcpyProcess = spawn('scrcpy', [...args, '-s', deviceCode], {cwd: config.binPath})

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
