<template>
    <div id="config">
        <a-form :form="form">
            <a-form-item label="Scrcpy目录" :label-col="{ span: 5 }" :wrapper-col="{ span: 16 }">
                <a-tooltip title="Scrcpy程序的目录，包含scrcpy和adb程序">
                <a-input @click="choiceBinPath" :read-only="true" placeholder="请选择Scrcpy目录" allowClear
                        v-decorator="['binPath', {
                            rules: [{ required: false, message: '请选择程序目录' }],
                            initialValue: myConfig.binPath
                        }]"
                />
                </a-tooltip>
            </a-form-item>
            <a-form-item label="录屏" :label-col="{ span: 5 }" :wrapper-col="{ span: 18 }">
                <a-row>
                    <a-col :span="3">
                        <a-switch @change="recordChange" v-decorator="['record', { valuePropName: 'checked' , initialValue: myConfig.record}]" />
                    </a-col>
                    <a-col :span="10" v-show="myConfig.record">
                        录屏时投屏：<a-switch :checked="myConfig.recordDisplay" />
                    </a-col>
                </a-row>
            </a-form-item>
            <a-form-item label="录屏文件目录" :label-col="{ span: 5 }" :wrapper-col="{ span: 16 }" v-show="myConfig.record">
                <a-tooltip :title="(myConfig.recordPath && myConfig.recordPath.length > 0) ? '已选录屏文件目录：' + myConfig.recordPath : '录屏文件目录'">
                    <a-input @click="choiceRecordPath" :read-only="true" placeholder="请选择录屏文件目录" :value="myConfig.recordPath"/>
                </a-tooltip>
            </a-form-item>
            <a-form-item label="传输码率" :label-col="{ span: 5 }" :wrapper-col="{ span: 18 }">
                <a-row>
                    <a-col :span="12">
                        <a-slider :min="2" :max="20" v-model="myConfig.bitRate" />
                    </a-col>
                    <a-col :span="6">
                        <a-input-number :min="2" :max="20" style="marginLeft: 16px; margin-right: 5px; width: 50px;" v-model="myConfig.bitRate" />M
                    </a-col>
                </a-row>
            </a-form-item>
            <a-form-item label="电脑控制" :label-col="{ span: 5 }" :wrapper-col="{ span: 18 }">
                <a-switch v-decorator="['pcControl', { valuePropName: 'checked' , initialValue: myConfig.pcControl}]" />
            </a-form-item>
            <a-form-item label="显示设备触点" :label-col="{ span: 5 }" :wrapper-col="{ span: 18 }">
                <a-switch v-decorator="['touchPoint', { valuePropName: 'checked' , initialValue: myConfig.touchPoint}]" />
            </a-form-item>
            <a-form-item :wrapper-col="{ span: 12, offset: 5 }">
                <a-button type="primary" @click="saveConfig">
                    保存配置
                </a-button>
            </a-form-item>
        </a-form>
    </div>
</template>

<script>
    import {mapState, mapMutations, mapGetters} from "vuex";
    const {dialog} = require('electron').remote;

    export default {
        name: "Config",
        data: function () {
            return {
                form: this.$form.createForm(this),
                myConfig: {
                    binPath: "",
                    record: false,
                    recordDisplay: true,
                    recordPath: "",
                    bitRate: 8,
                    pcControl: true,
                    touchPoint: false,
                }
            }
        },
        computed: {
            ...mapState("Config", ["config"]),
            ...mapGetters("Config", ["getConfig"]),
        },
        mounted() {
            this.init();
        },
        methods: {
            ...mapMutations("Config", {
                save: "save",
            }),
            init: function () {
                // this.myConfig = this.getConfig;
                this.myConfig = Object.assign(this.myConfig, this.getConfig);
            },
            choiceBinPath: function () {
                let that = this;
                dialog.showOpenDialog({ properties: ['openDirectory']}).then(function (dlg) {
                    if(!dlg.canceled){
                        that.form.setFieldsValue({binPath: dlg.filePaths[0]});
                    }
                });
            },
            recordChange: function(checked){
                this.myConfig.record = checked;
            },
            choiceRecordPath: function(){
                let that = this;
                dialog.showOpenDialog({ properties: ['openDirectory']}).then(function (dlg) {
                    if(!dlg.canceled){
                        that.myConfig.recordPath = dlg.filePaths[0];
                    }
                });
            },
            saveConfig: function () {
                let that = this;
                this.form.validateFields((err, values) => {
                    if (!err) {
                        if(values.record){
                            if(that.myConfig.recordPath.length == 0){
                                that.$notice.error("录屏文件目录没有选择！");
                                return;
                            }
                        }
                        values["recordDisplay"] = that.myConfig.recordDisplay;
                        values["recordPath"] = that.myConfig.recordPath;
                        if(!that.myConfig.bitRate){
                            that.$notice.error("传输码率不能为空！");
                            return;
                        }
                        values["bitRate"] = that.myConfig.bitRate;
                        that.save(values);
                        that.$notice.success("保存成功！");
                        eventBus.$emit("initControl");
                    }
                });
            }
        }
    }
</script>

<style>
    #config {
        padding: 10px;
    }

    #config .ant-form-item {
        margin-bottom: 10px;
    }
</style>
