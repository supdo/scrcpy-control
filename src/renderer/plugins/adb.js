import adb from 'adbkit'

const client = adb.createClient()

const trackDevices = function (that, cb) {
    client.trackDevices()
        .then(function (tracker) {
            tracker.on(that.$cfg.adbAction.add, function (device) {
                console.log('Device %s was plugged in', device.id);
                cb && cb(that.$cfg.adbAction.add, device);
            })
            tracker.on(that.$cfg.adbAction.remove, function (device) {
                console.log('Device %s was unplugged', device.id)
                cb && cb(that.$cfg.adbAction.remove, device);
            })
            tracker.on(that.$cfg.adbAction.end, function () {
                console.log('Tracking stopped')
                cb && cb(that.$cfg.adbAction.end, null);
            })
        })
        .catch(function (err) {
            console.error('Something went wrong:', err.stack)
            cb && cb(that.$cfg.adbAction.error, err);
        })
}

const getDeviceList = function (cb) {
    client.listDevices().then(function (devices) {
        cb && cb(devices);
    })
}

const connect = function (args, cb) {
    if (args.deviceCode.length > 0) {
        client.tcpip(args.deviceCode)
            .then(function (port) {
                console.log("client.tcpip done, port:" + port);
                client.connect(args.ip, port).then(function (data) {
                    if (data == '{0}:{1}'.format(args.ip, port)) {
                        cb && cb("connected",data);
                    } else {
                        cb && cb("error", data);
                    }
                }).catch((error) => {
                    cb && cb("error", error);
                })
            }).catch((error) => {
                console.log("client.tcpip error, error:" + error);
                cb && cb("error", error);
            });
    } else {
        client.connect(args.ip).then(function (data) {
            if (args.ip == data.split(":")[0]) {
                cb && cb("connected", data);
            } else {
                cb && cb("error", data);
            }
        }).catch((error) => {
            cb && cb("error", error);
        })
    }

}

const disConnect = function (args, cb) {
    client.disconnect(args.ip).then(data => {
        console.log("client.tcpip done, error:" + data);
        cb && cb("done", data);
    }).catch(error => {
        console.log("client.tcpip error, error:" + error);
        cb && cb("error", error);
    })
}

export default {
    trackDevices,
    getDeviceList,
    connect,
    disConnect,
}
