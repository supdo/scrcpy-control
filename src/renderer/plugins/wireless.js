/**
 *
 */

const os = require('os')
const net = require('net')

const scanWifi = function (callback) {
    let Socket = net.Socket
    let port  = 5555
    let scan = function(host, cb) {
        let socket = new Socket()
        // var status = null
        socket.setTimeout(1500)
        socket.on('connect', function() {
            socket.end()
            cb && cb(null, host)
        })
        socket.on('timeout', function() {
            socket.destroy()
            cb && cb(new Error('timeout'), host)
        })
        socket.on('error', function(err) {
            cb && cb(err, host)
        })
        socket.on('close', function(err) {
        })
        socket.connect(port, host)
    }
    let cnt = 0;
    let myipList = [];
    //待扫描的开始网段，可换成192.168.0
    let myIpList = getIpAddress()
    for(let ipIndex = 0; ipIndex< myIpList.length; ipIndex++) {
        let myIp = myIpList[ipIndex]
        let ip = myIp.split(".").slice(0, 3).join(".")
        for (let i = 1; i < 255; i++) {
            scan(ip + '.' + i, function (err, host) {
                if (err) {
                    console.warn('{0} -- {1}: {2}'.format((new Date()).Format("yyyy-MM-dd hh:mm:ss"), host, err.message))
                } else {
                    console.info('{0} -- {1}: {2}'.format((new Date()).Format("yyyy-MM-dd hh:mm:ss"), host, "找到服务"))
                    myipList.push(host);
                }
                cnt += 1;
                if (cnt >= 254 * myIpList.length) {
                    callback && callback(myipList)
                }
            })
        }
    }
}

const getIpAddress = function () {
    let interfaces = os.networkInterfaces();
    let ipList = []
    for (var devName in interfaces) {
        var iface = interfaces[devName];
        for (var i = 0; i < iface.length; i++) {
            var alias = iface[i];
            if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) {
                ipList.push(alias.address);
            }
        }
    }
    return ipList;
}

export default {
    scanWifi,
}
