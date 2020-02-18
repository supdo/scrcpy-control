
const configPrefix = "scrcpy"
const configKey = "{0}/config".format(configPrefix);

const state = {
    config: {
        binPath: "",
        record: false,
        noDisplay: false,
        recordPath: "",
        bitRate: 8,
        pcControl: true,
        touchPoint: false,
    }
}

const getters = {
    getConfig: (state) => {
        let myConfig = state.config;
        if (localStorage.getItem(configKey)) {
            // state.config = JSON.parse(localStorage.getItem(configKey))
            myConfig = JSON.parse(localStorage.getItem(configKey))
        }
        return myConfig;
    }
}

const mutations = {
    save(state, config){
        state.config = config;
        localStorage.setItem(configKey, JSON.stringify(config));
    },

}

export default {
    namespaced: true,
    state,
    getters,
    mutations,
}
