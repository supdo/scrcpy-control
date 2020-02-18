<template>
    <div id="home">
        <a-tabs :defaultActiveKey="tabKey">
            <a-tab-pane tab="参数管理" key="param">
                <Config></Config>
            </a-tab-pane>
            <a-tab-pane tab="投屏" key="control" forceRender>
                <Control></Control>
            </a-tab-pane>
        </a-tabs>
    </div>
</template>

<script>
    import Control from "@/components/Control";
    import Config from "@/components/Config";
    export default {
        name: "Home",
        components: {
            Control, Config,
        },
        data: function () {
            return {
                tabKey: "control",
            }
        },
        mounted() {
            this.init();
        },
        methods: {
            init: function () {
                let that = this;
                eventBus.$on('changeTab', function(tabName){
                    that.tabKey = tabName;
                })
            }
        }
    }
</script>

<style>
    body {
        overflow-y: hidden;
    }
    #home {

    }

</style>
