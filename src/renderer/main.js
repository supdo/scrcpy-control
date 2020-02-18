import Vue from 'vue'
import axios from 'axios'
import "./utils/common.js"
import App from './App'
import router from './router'
import store from './store'
import config from "./utils/config"
import common from '@/utils/common.vue'
import * as myAntd from 'ant-design-vue'

function initAntd () {
  Vue.use(myAntd.Row)
  Vue.use(myAntd.Col)
  Vue.use(myAntd.message)
  Vue.use(myAntd.Table)
  Vue.use(myAntd.List)
  Vue.use(myAntd.Form)
  Vue.use(myAntd.Button)
  Vue.use(myAntd.Input)
  Vue.use(myAntd.InputNumber)
  Vue.use(myAntd.Select)
  Vue.use(myAntd.Checkbox)
  Vue.use(myAntd.Radio)
  Vue.use(myAntd.Switch)
  Vue.use(myAntd.Modal)
  Vue.use(myAntd.Card)
  Vue.use(myAntd.Icon)
  Vue.use(myAntd.Tag)
  Vue.use(myAntd.Spin)
  Vue.use(myAntd.Drawer)
  Vue.use(myAntd.Tabs)
  Vue.use(myAntd.Avatar)
  Vue.use(myAntd.Tooltip)
  Vue.use(myAntd.Skeleton)
  Vue.use(myAntd.Divider)
  Vue.use(myAntd.Rate)
  Vue.use(myAntd.Progress)
  Vue.use(myAntd.Layout)
  Vue.use(myAntd.Menu)
  Vue.use(myAntd.Dropdown)
  Vue.use(myAntd.Badge)
  Vue.use(myAntd.Tabs)
  Vue.use(myAntd.Breadcrumb)
  Vue.use(myAntd.LocaleProvider)
  Vue.use(myAntd.Upload)
  Vue.use(myAntd.Steps)
  Vue.use(myAntd.Popconfirm)

  Vue.prototype.$message = myAntd.message

  Vue.prototype.$cfg = config;

  Vue.prototype.$notice = common.notice;
}


initAntd()

if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
Vue.http = Vue.prototype.$http = axios
Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  components: { App },
  router,
  store,
  template: '<App/>'
}).$mount('#app')
