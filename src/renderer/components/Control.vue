<template>
    <div id="control">
        <a-spin :spinning="spinning" :tip="spinningTip">
            <div class="control-bar">
                <a-form layout="inline" :form="form">
                    <a-form-item>
                        IP地址：
                        <a-input style="width: 140px;"
                                 v-decorator="['ip', {
                                    rules: [{ required: true, message: '请输入您的手机IP!' }],
                                    initialValue: '192.168.31.'
                            }]"
                                 placeholder="IP地址"
                        >
                        </a-input>
                    </a-form-item>
                    <a-form-item>
                        <a-button type="primary" @click="connect">连接</a-button>
                    </a-form-item>
                    <a-form-item style="float: right; margin-right: 0px">
                        <a-button type="primary" @click="getDeviceList">刷新设备</a-button>
                    </a-form-item>
                </a-form>
            </div>
            <a-divider orientation="left">设备列表</a-divider>
            <a-table
                    :columns="columns"
                    :rowKey="record => record.deviceCode"
                    :dataSource="deviceList"
                    size="small"
                    :bordered="true"
                    :rowClassName="rowClassName"
                    :pagination="false"
            >
                <template slot="running" slot-scope="text, record">
                    <span style="font-size: 16px; font-weight: bold;">{{devices[record.deviceCode].running ? "是" : "否"}}</span>
                </template>
                <template slot="action" slot-scope="text, record, index">
                    <div class="table-row-action">
                        <a-button type="primary" @click="projection(record)" size="small"
                                  v-if="!devices[record.deviceCode].running">投屏
                        </a-button>
                        <a-button type="danger" @click="stopProjection(record)" size="small"
                                  v-if="devices[record.deviceCode].running">停止
                        </a-button>
                        <a-popconfirm v-if="record.linkType == $cfg.linkType.wireless"
                                title="确认要删除这个设备?" @confirm="deleteDevice(record)"
                                      @visibleChange="handleVisibleChange(record, index)"
                                      @cancel="confirmCancel(record, index)"
                                      okText="确认" cancelText="取消"
                        >
                            <a-button type="danger" size="small">删除</a-button>
                        </a-popconfirm>
                    </div>
                </template>
            </a-table>

            <a-button v-show="false" type="primary" @click="scanWIfi">扫描无线网络</a-button>
            <a-divider orientation="left">日志</a-divider>
        </a-spin>
        <div class="log-list">
            <div class="log-info" v-for="(log, index) in logList" :key="index" :class="'log-info-' + log.kind">
                {{log.time}} - {{log.kind}} - {{log.data}}
            </div>
        </div>
    </div>
</template>

<script>
    import {mapGetters, mapState} from "vuex";
    import adb from "@/plugins/adb.js"
    import scrcpy from "@/plugins/scrcpy";
    import wireless from "@/plugins/wireless"

    const columns = [
        {
            title: "设备编码",
            dataIndex: "deviceCode",
        }, {
            title: "IP",
            dataIndex: "ip",
        }, {
            title: "连接类型",
            dataIndex: "linkType",
        }, {
            title: "投屏中",
            dataIndex: "running",
            scopedSlots: {customRender: 'running'},
        }, {
            title: '操作',
            width: "120px",
            key: 'action',
            scopedSlots: {customRender: 'action'},
        }
    ];
    const tip = "loading...";
    export default {
        name: "Control",
        data: function () {
            return {
                spinning: false,
                spinningTip: tip,
                form: this.$form.createForm(this),
                columns,
                deviceList: [],
                deleteIndex: -1,
                devices: {},
                logList: [],
                myConfig: {},
                isTrackDevices: false,
            }
        },
        computed: {
            ...mapGetters("Config", ["getConfig"]),
        },
        mounted() {
            let that = this;
            eventBus.$on('initControl', function(){
                that.init();
            });
            this.init();
        },
        methods: {
            init: function(){
                this.myConfig = this.getConfig;
                if(this.myConfig.binPath.length > 0){
                    if(!this.isTrackDevices){
                        adb.createClient(this.myConfig.binPath);

                        this.trackDevices();
                        this.isTrackDevices = true;
                    }
                    this.spinning = false;
                    this.spinningTip = tip;
                }else{
                    this.spinning = true;
                    this.spinningTip = "核心参数配置中...";
                    eventBus.$emit("changeTab", this.$cfg.tabName.param);
                }
            },
            connect: function () {
                var that = this;
                this.form.validateFields((err, values) => {
                    if (!err) {
                        if (!values.ip.isType("ip")) {
                            that.$notice.error("输入的ip格式不正确！");
                            that.addLog("输入的ip格式不正确！", that.$cfg.logType.error);
                            return;
                        }
                        if (that.deviceList.findIndex(item => values.ip === item.deviceCode.split(":")[0]) > -1) {
                            that.$notice.error("ip为{0}的设备已存在！".format(values.ip));
                            that.addLog("ip为{0}的设备已存在！".format(values.ip), that.$cfg.logType.error);
                            return;
                        }

                        let index = that.deviceList.findIndex(item => that.$cfg.linkType.wired === item.linkType);
                        let deviceCode = index > -1 ? that.deviceList[index].deviceCode : "";
                        values["deviceCode"] = deviceCode;

                        that.spinning = true;
                        that.spinningTip = "连接中..."
                        adb.connect(values, function (action, info) {
                            console.log('action:{0}, info: {1}'.format(action, info ? info : ""))
                            that.spinning = false;
                            that.spinningTip = tip;
                            if(action == that.$cfg.adbConnect.connected){
                                that.getDeviceList();
                            }else if(action == that.$cfg.adbConnect.error){
                                that.$notice.error(info);
                                that.addLog(info, that.$cfg.logType.error);
                            }
                        })

                        setTimeout(() => {
                            if (that.deviceList.findIndex(item => values.ip === item.deviceCode.split(":")[0]) > -1) {
                                that.$notice.success("设备{0}连接成功！".format(values.ip));
                                that.addLog("设备{0}连接成功！".format(values.ip), that.$cfg.logType.success);
                            } else {
                                this.$notice.error("连接失败！")
                                that.addLog("连接失败!", that.$cfg.logType.error);
                            }
                            that.spinning = false;
                            that.spinningTip = tip;
                        }, 1000)
                    }
                });
            },
            trackDevices: function () {
                let that = this;
                adb.trackDevices(that, function (action, info) {
                    if (action == that.$cfg.adbAction.add) {
                        let linkType = info.id.split(":")[0].isType("ip") ? that.$cfg.linkType.wireless : that.$cfg.linkType.wired;
                        let deviceCode = info.id;
                        that.deviceList.push({
                            deviceCode, linkType,
                            running: false,
                        });
                        that.devices[deviceCode] = {}
                        that.$notice.success("设备{0}加入。".format(deviceCode));
                        that.addLog("设备{0}加入。".format(deviceCode), that.$cfg.logType.success);
                    } else if (action == that.$cfg.adbAction.remove) {
                        let deviceCode = info.id;
                        let dataSource = [...that.deviceList];
                        let index = dataSource.findIndex(item => deviceCode === item.deviceCode);
                        if (index > -1) {
                            dataSource.splice(index, 1);
                        }
                        that.deviceList = dataSource;
                        that.$notice.warn("设备{0}退出。".format(deviceCode));
                        that.addLog("设备{0}退出。".format(deviceCode), that.$cfg.logType.warning);
                    }
                    that.$forceUpdate();
                });
            },
            getDeviceList: function () {
                let that = this;
                adb.getDeviceList(function (devices) {
                    that.deviceList = [];
                    devices.forEach((info) => {
                        let linkType = info.id.split(":")[0].isType("ip") ? that.$cfg.linkType.wireless : that.$cfg.linkType.wired;
                        let deviceCode = info.id;
                        that.deviceList.push({
                            deviceCode, linkType,
                            running: false,
                        });
                        that.devices[deviceCode] = {}
                    });
                });
            },
            scanWIfi: function () {
                let myIpList = wireless.scanWifi(function (ipList) {
                    ipList.forEach((ip) => {

                    });
                })
            },
            // 投屏
            projection: function (device) {
                let that = this;
                let scrcpyProcess = scrcpy.projection(that.myConfig, device.deviceCode, function (action, data) {
                    console.log('{0}: {1}'.format(action, data == null ? "null" : data.toString()))
                    that.addLog(data == null ? "null" : data.toString(), action);
                    if (action == that.$cfg.processAction.data) {
                        that.updateDeviceRunning(device.deviceCode, true);
                    } else if (action == that.$cfg.processAction.error) {

                    } else if (action == that.$cfg.processAction.close) {

                    } else if (action == that.$cfg.processAction.exit) {
                        that.updateDeviceRunning(device.deviceCode, false);
                    }
                });
                that.devices[device.deviceCode].scrcpyProcess = scrcpyProcess;
            },
            stopProjection: function (device) {
                let that = this;
                let myDevice = that.devices[device.deviceCode];
                let scrcpyProcess = myDevice.scrcpyProcess;
                if (scrcpyProcess.killed) {
                    that.updateDeviceRunning(device.deviceCode, false);
                } else {
                    scrcpy.stopProjection(myDevice.scrcpyProcess);
                }
            },
            updateDeviceRunning: function (deviceCode, running) {
                let that = this;
                that.devices[deviceCode]['running'] = running;
                that.$forceUpdate();
            },
            deleteDevice: function (device) {
                let that = this;
                let ip = device.deviceCode.split(":")[0]
                if(ip.isType("ip")) {
                    this.devices[device.deviceCode] = {}
                    adb.disConnect({"ip": ip}, function (action, info) {
                        if(action == 'error'){
                            that.$notice.error("删除失败！"+info);
                            that.addLog("删除失败", that.$cfg.logType.error);
                        }else{

                        }
                    });
                }else{
                    that.$notice.error("ip格式不正确！");
                    that.addLog("ip格式不正确!", that.$cfg.logType.error);
                }
            },
            handleVisibleChange: function (index) {
                this.deleteIndex = index;
            },
            confirmCancel: function () {
                this.deleteIndex = -1;
            },
            rowClassName: function (record, index) {
                if (index == this.deleteIndex) {
                    return "table-delete-row";
                } else if (index % 2 == 1) {
                    return "table-odd-row";
                }
                return "";
            },
            getDevice: function (deviceCode, key) {
                let that = this;
                let dataSource = [...that.deviceList];
                let index = dataSource.findIndex(item => deviceCode === item.deviceCode);
                return dataSource[index]
            },
            setDeviceInfo: function (deviceCode, key, obj) {
                let that = this;
                let dataSource = [...that.deviceList];
                let index = dataSource.findIndex(item => deviceCode === item.deviceCode);
                dataSource[index][key] = obj;
                that.deviceList = dataSource;
            },
            addLog: function (msg, type) {
                type = type || "info";
                this.logList.unshift({
                    data: msg,
                    time: (new Date()).Format("yyyy-MM-dd hh:mm:ss"),
                    kind: type
                });
            }
        }
    }
</script>

<style>
    #control {
        padding: 10px 16px;
    }

    #control .control-bar {
        padding: 2px 5px;
    }

    #control .ant-divider-with-text-left {
        margin: 10px 0 2px 0;
        font-size: 13px;
    }

    .ant-notification {
        width: 200px;
        margin-right: 5px;
    }

    #control .ant-table-body {
        margin: 0 1px;
    }

    #control .ant-table-body .ant-table-thead {
        background-color: #F6F6F6;
    }

    #control .ant-table-body .ant-table-thead th div {
        font-weight: bold;
    }

    #control .ant-table-body .table-odd-row {
        background-color: #FCFCFC;
    }

    #control .ant-table-body .table-delete-row {
        background-color: #FF3300;
    }

    #control .log-list {
        height: 1440px;
        overflow-y: hidden;
    }
    #control .log-list .log-info{
        font-size: 12px;
        line-height: 20px;
    }

    #control .log-list .log-info-success{
        color: #42b983;
    }

    #control .log-list .log-info-warning{
        color: goldenrod;
    }

    #control .log-list .log-info-error{
        color: crimson;
    }
</style>
