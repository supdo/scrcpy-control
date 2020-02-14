<template>
    <div id="home">
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
            <a-divider orientation="left" class="btn-divider">启动参数</a-divider>
            <a-tooltip title="码率越大越清晰，但是延迟也会增加。"><span class="btn-title">码率:</span></a-tooltip>
            <a-radio-group buttonStyle="solid" size="small" v-model="execParams.bitRate">
                <a-radio-button value="16M">16M</a-radio-button>
                <a-radio-button value="8M">8M</a-radio-button>
                <a-radio-button value="4M">4M</a-radio-button>
                <a-radio-button value="2M">2M</a-radio-button>
            </a-radio-group>
            <a-tooltip title=""><span class="btn-title">最大帧数:</span></a-tooltip>
            <a-input style="width: 50px;" size="small" :value="execParams.maxFps" />
            <a-tooltip title="息屏：Ctrl+o；解锁：Ctrl+p"><span class="btn-title">允许息屏:</span></a-tooltip>
            <a-switch :defaultChecked="execParams.turnScreenOff" size="small" @change="(checked) => {execParams.turnScreenOff=checked}" />
        </div>
        <div class="main-log">
            <a-list class="log-list" :class="{'log-list-less': showParams}" size="small" bordered :dataSource="logList">
                <a-list-item slot="renderItem" slot-scope="log">
                    <span :class="'log-' + log.kind">{{log.time}} - {{log.data}}</span>
                </a-list-item>
            </a-list>
        </div>
    </div>
</template>

<script>
    const { spawn } = require('child_process')
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
            }
        },
        watch: {
            workerProcess: {
                handler(newVal, oldVal) {
                    this.running = !newVal.killed;
                    // if(newVal.killed != oldVal.killed){
                    //     this.running = !newVal.killed;
                    // }
                },
                deep: true
            },
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
                    let ePos = data.indexOf("Exception");
                    data = data.substring(0, ePos);
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
                        data: "退出 : " + code,
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
                this.workerProcess.kill('SIGTERM');
            }
        }
    }
</script>

<style scoped>
    #home {
        padding: 10px;
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
    #home .more-control .btn-title{
        margin-left: 10px;
        font-size: 13px;
    }

    #home .more-control .btn-divider {
        margin: 2px 0 10px 0;
        font-size: 14px;
    }

    #home .log-list {
        margin-top: 10px;
        height: 690px;
        overflow-y: auto;
    }
    #home .log-list-less {
        height: 635px;
    }

    #home .log-list .log-start {
        color: #42b983;
    }

    #home .log-list .log-error {
        color: crimson;
    }

    #home .log-list .log-close {
        color: goldenrod;
    }
</style>
