<script type="text/javascript">
    import axios from 'axios';

    function checkStatus(response) {
        if (response.status >= 200 && response.status < 300) {
            return response;
        } else {
            var errorMsg = response.statusText;
            if (response.status === 401) {
                errorMsg = "请先登录系统。";
            }
            var error = new Error(errorMsg);
            error.response = response;
            throw error;
        }
    }

    function isLogin(result, $this) {
        if (result.code == '401' || result.code == '403') {
            $this.$store.commit('account/logout');   //清理本地存储
            $this.$router.push('/login');
            throw new Error(result.msg);
        } else {
            $this.$store.commit('account/updateExpires');
            return result;
        }
    }

    const toFormData = (forms) => {
        var formData = new FormData();
        if (forms) {
            Object.keys(forms).forEach((key) => {
                // if (forms[key] && forms[key] !== 'undefined') {
                //     formData.append(key, forms[key]);
                // }
                formData.append(key, forms[key]);
            });
        }
        return formData;
    }

    const parseResponse = (response) => {
        return response.data;
    }

    //FormData用multipart/form-data是规范。 此处Content-Type修改无效
    const MyAxios = {
        axios: axios,
        get: function (url, params) {
            let $this = this;
            return axios.get(url, {
                params: params,
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json;charset=UTF-8'
                }
            })
                .then(checkStatus)
                .then(parseResponse)
                .then(res => isLogin(res, $this));
        },
        post: function (url, data) {
            let $this = this;
            const formData = toFormData(data);
            return axios.post(url, formData, {
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json;charset=UTF-8'
                }
            })
                .then(checkStatus)
                .then(parseResponse)
                .then(res => isLogin(res, $this));
        }
    };

    export default MyAxios;
</script>
