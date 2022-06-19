import axios from "axios";
import {ElLoading} from "element-plus";

const request = axios.create();

let loading;

request.interceptors.request.use(function (config) {
    // 在发送请求之前做些什么
    loading = ElLoading.service({
        lock: true,
        text: 'Loading',
        background: 'rgba(0, 0, 0, 0.7)',
    })
    // setTimeout(() => {
    //     loading.close()
    // }, 2000)

    config.headers['Content-Type'] = 'application/json;charset=utf-8';
    return config;
}, function (error) {
    // 对请求错误做些什么
    return Promise.reject(error);
});

request.interceptors.response.use(function (response) {
    // 2xx 范围内的状态码都会触发该函数。
    // 对响应数据做点什么
    loading.close()
    return response;
}, function (error) {
    // 超出 2xx 范围的状态码都会触发该函数。
    // 对响应错误做点什么
    return Promise.reject(error);
});

export default request