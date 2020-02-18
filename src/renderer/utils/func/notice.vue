<script>
import { notification } from 'ant-design-vue'

const nKey = "fact-web-key";

const initConfig = function(message, description, duration, close){
    let config = {
        key: nKey,
        message: message,
        placement: "bottomRight",
    };
    if(description != undefined && description != null){
        config['description'] = description;
    }
    if(duration != undefined){
        config['duration'] = duration;
    }
    if(close != undefined){
        config['onClose'] = close;
    }
    return config;
}

const info = function(message, description, duration, close) {
    let config = initConfig(message, description, duration, close);
    notification.info(config);
};

const warn = function(message, description, duration) {
    let config = initConfig(message, description, duration);
    notification.warn(config);
};

const success = function(message, description, duration, close) {
    let config = initConfig(message, description, duration, close);
    notification.success(config);
};
const error = function(message, description, duration) {
    let config = initConfig(message, description, duration);
    notification.error(config);
};

export default {
    info,
    warn,
    success,
    error
}
</script>
