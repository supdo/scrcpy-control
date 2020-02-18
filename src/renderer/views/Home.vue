<template>
    <div id="home">
        <a-tabs defaultActiveKey="control2">
            <a-tab-pane tab="参数管理" key="param">Content of Tab Pane 1</a-tab-pane>
            <a-tab-pane tab="投屏" key="control" forceRender>
                <div class="main-control">
                    <a-button type="primary" shape="round" size="large" class="main-btn" @click="startScrcpy" v-if="!running">
                        <a-icon type="play-circle" class="main-btn-icon" />启动
                    </a-button>
                    <a-button type="primary" shape="round" size="large" class="main-btn main-btn-running" @click="stopScrcpy" v-if="running">
                        <a-icon type="close-circle" class="main-btn-icon" />停止
                    </a-button>
                    <a-button icon="setting" size="small" style="float: left; margin-top: 5px;">系统配置</a-button>
                    <a-button :icon="showParams ? 'up' : 'down' " size="small" style="float: right; margin-top: 5px;" @click="showParams=!showParams">启动参数</a-button>
                </div>
                <div class="more-control" v-if="showParams">
                    <div>
                        <a-divider orientation="left" class="btn-divider">启动参数</a-divider>
                        <a-tooltip title="码率越大越清晰，但是延迟也会增加。"><span class="btn-title-first">码率:</span></a-tooltip>
                        <a-radio-group buttonStyle="solid" size="small" v-model="execParams.bitRate">
                            <a-radio-button value="16M">16M</a-radio-button>
                            <a-radio-button value="12M">12M</a-radio-button>
                            <a-radio-button value="8M">8M</a-radio-button>
                            <a-radio-button value="4M">4M</a-radio-button>
                            <a-radio-button value="2M">2M</a-radio-button>
                        </a-radio-group>
                        <a-tooltip title=""><span class="btn-title">最大帧数:</span></a-tooltip>
                        <a-input style="width: 50px;" size="small" :value="execParams.maxFps" />
                    </div>
                    <div>
                        <a-tooltip title="息屏：Ctrl+o；解锁：Ctrl+p"><span class="btn-title-first">允许息屏:</span></a-tooltip>
                        <a-switch :defaultChecked="execParams.turnScreenOff" size="small" class="btn-switch" @change="(checked) => {execParams.turnScreenOff=checked}" />
                        <a-tooltip title="息屏：Ctrl+o；解锁：Ctrl+p"><span class="btn-title">无线连接:</span></a-tooltip>
                        <a-switch :defaultChecked="wireless" size="small" class="btn-switch" @change="(checked) => {if(checked){scanWifi();} wireless=checked;}" />
                        <a-select style="width: 150px" placeholder="IP地址" showSearch :filterOption="true" size="small" v-if="wireless">
                            <a-select-option v-for="ip in ipList" :key="ip" value="ip">{{ip}}</a-select-option>
                        </a-select>
                    </div>
                </div>
                <div class="main-log">
                    <a-list class="log-list" :class="{'log-list-less': showParams}" size="small" bordered :dataSource="logList">
                        <a-list-item slot="renderItem" slot-scope="log">
                            <span :class="'log-' + log.kind">{{log.time}} - {{log.data}}</span>
                        </a-list-item>
                    </a-list>
                </div>
            </a-tab-pane>
            <a-tab-pane tab="投屏2" key="control2" forceRender>
                <Control></Control>
            </a-tab-pane>
        </a-tabs>
    </div>
</template>

<script>

    import adb from "@/plugins/adb.js"
    import Control from "@/components/Control";
    const { spawn } = require('child_process')
    const os = require('os')
    const net = require('net')
    const paramLabel = {
        bitRate: {
            param: '-b', type: 'string'
        },
        maxFps: {
            param: '--max-fps', type: 'string'
        },
        turnScreenOff: {
            param: '-S', type: 'boolean'
        },
    }
    export default {
        name: "Home",
        components: {
            Control,
        },
        data: function () {
            return {
                cmdPath: "E:\\MyFiles\\scrcpy-win64-v1.10\\",
                cmdStr: "scrcpy.exe",
                cmdArgs: [],
                running: false,
                workerProcess: {killed: true},
                logList: [],
                showParams: false,
                execParams: {
                    bitRate: "8M",
                    // maxFps: "15",
                    turnScreenOff: false,
                },
                wireless: false,
                ipList: ["扫描中..."],
            }
        },
        watch: {
            workerProcess: {
                handler(newVal, oldVal) {
                    this.running = oldVal.killed == newVal.killed ? this.running : !newVal.killed;
                    // if(newVal.killed != oldVal.killed){
                    //     this.running = !newVal.killed;
                    // }
                },
                deep: true
            },
        },
        mounted() {

        },
        methods: {
            startScrcpy: function () {
                this.cmdArgs = [];
                for (let key in this.execParams) {
                    let paramInfo = paramLabel[key];
                    if(paramInfo.type == 'string'){
                        this.cmdArgs.push(paramInfo.param)
                        this.cmdArgs.push(this.execParams[key])
                        // this.cmdStr += " {0} {1}".format(paramInfo.param, this.execParams[key])
                    }else if(paramInfo.type == 'boolean'){
                        if(this.execParams[key]){
                            this.cmdArgs.push(paramInfo.param)
                        }
                        // this.cmdStr += " {0}".format(paramInfo.param)
                    }
                }
                this.runExec();
            },
            stopScrcpy: function () {
                this.closeExec();
            },
            runExec: function () {
                let that = this;
                // 执行命令行，如果命令不需要路径，或就是项目根目录，则不需要cwd参数：
                this.workerProcess = spawn(this.cmdStr, this.cmdArgs, {cwd: this.cmdPath})
                // 不受child_process默认的缓冲区大小的使用方法，没参数也要写上{}：workerProcess = exec(cmdStr, {})
                that.logList.unshift({
                    data: "启动",
                    time: (new Date()).Format("yyyy-MM-dd hh:mm:ss"),
                    kind: "start"
                });

                // 打印正常的后台可执行程序输出
                this.workerProcess.stdout.on('data', function (data) {
                    that.running = true;
                    that.logList.unshift({
                        data: data,
                        time: (new Date()).Format("yyyy-MM-dd hh:mm:ss"),
                        kind: "out"
                    });
                })

                // 打印错误的后台可执行程序输出
                this.workerProcess.stderr.on('data', function (data) {
                    data = data.toString()
                    let ePos = data.indexOf("Exception");
                    if(ePos > -1) {
                        data = data.substring(0, ePos);
                    }
                    that.running = true;
                    that.logList.unshift({
                        data: data,
                        time: (new Date()).Format("yyyy-MM-dd hh:mm:ss"),
                        kind: "error"
                    });
                })

                // 退出之后的输出
                this.workerProcess.on('close', function (code) {
                    that.running = false;
                    that.logList.unshift({
                        data: "关闭 : " + code,
                        time: (new Date()).Format("yyyy-MM-dd hh:mm:ss"),
                        kind: "close"
                    });
                })

                this.workerProcess.on('exit', function (code) {
                    that.running = false;
                    that.logList.unshift({
                        data: "退出 : " + code,
                        time: (new Date()).Format("yyyy-MM-dd hh:mm:ss"),
                        kind: "close"
                    });
                })
            },
            closeExec: function () {
                if(this.workerProcess.killed){
                    this.running = false;
                }else {
                    this.workerProcess.kill('SIGTERM');
                }
            },
            scanWifi: function () {
                let that = this;
                let Socket = net.Socket
                let port  = 5555
                let scan = function(host, cb) {
                    var socket = new Socket()
                    var status = null
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
                let myIpList = this.getIpAddress()
                for(let ipIndex = 0; ipIndex< myIpList.length; ipIndex++) {
                    let myIp = myIpList[ipIndex]
                    let ip = myIp.split(".").slice(0, 3).join(".")
                    for (let i = 1; i < 255; i++) {
                        scan(ip + '.' + i, function (err, host) {
                            if (err) {
                                that.logList.unshift({
                                    data: host + ": " + err.message,
                                    time: (new Date()).Format("yyyy-MM-dd hh:mm:ss"),
                                    kind: "error"
                                });
                            } else {
                                that.logList.unshift({
                                    data: "找到ip: " + host,
                                    time: (new Date()).Format("yyyy-MM-dd hh:mm:ss"),
                                    kind: "success"
                                });
                                myipList.push(host);
                            }
                            cnt += 1;
                            console.log('cnt: ' + cnt);
                            if (cnt >= 254 * myIpList.length) {
                                that.ipList = myipList;
                            }
                        })
                    }
                }
            },
            getIpAddress: function () {
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
        }
    }
</script>

<style>
    #home {
    }

    #home .ant-tabs-bar {
        margin: 0;
    }

    #home .main-control {
        text-align: center;
    }

    #home .main-control .main-btn {

    }
    #home .main-control .main-btn-icon {
    }

    #home .main-control .main-btn-running {
        background-color: crimson;
        border-color: lightcoral;
    }

    #home .more-control {

    }
    #home .more-control > div {
        padding: 5px 0px;
    }
    #home .more-control .btn-title{
        margin-left: 10px;
        font-size: 14px;
    }
    #home .more-control .btn-switch {
        margin-top: -4px;
    }

    #home .more-control .btn-divider {
        margin: 2px 0 10px 0;
        font-size: 13px;
    }

    #home .log-list {
        margin-top: 10px;
        height: 690px;
        overflow-y: auto;
        font-size: 12px;
    }

    #home .log-list .ant-list-item {
        border-bottom: 1px solid #F5F5F5;
        padding: 3px 5px;
    }
    #home .log-list-less {
        height: 635px;
    }

    #home .log-list .log-start,
    #home .log-list .log-success {
        color: #42b983;
    }

    #home .log-list .log-error {
        color: crimson;
    }

    #home .log-list .log-close {
        color: goldenrod;
    }
</style>
