/**
 * 导入第三方图标
 * 项目地址；https://www.iconfont.cn/manage/index?manage_type=myprojects&projectId=1345446
 */
"use strict";
/**
 * var str='这是一个测试的字符串：{0} {1}'.format('Hello','world');
 * var str='这是一个测试的字符串：{str0} {str1}'.format({str0:'Hello',str1:'world'});
 */
String.prototype.format = function(args) {
    let result = this;
    if (arguments.length > 0) {
        if (arguments.length == 1 && typeof (args) == "object") {
            for (let key in args) {
                if(args[key]!=undefined){
                    let reg = new RegExp("({" + key + "})", "g");
                    result = result.replace(reg, args[key]);
                }
            }
        }
        else {
            for (let i = 0; i < arguments.length; i++) {
                if (arguments[i] != undefined) {
                    let reg= new RegExp("({)" + i + "(})", "g");
                    result = result.replace(reg, arguments[i]);
                }
            }
        }
    }
    return result;
}

/**
 *对Date的扩展，将 Date 转化为指定格式的String
 *月(M)、日(d)、小时(h)、分(m)、秒(s)、季度(q) 可以用 1-2 个占位符，
 *年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字)
 *例子：
 *(new Date()).Format("yyyy-MM-dd hh:mm:ss.S") ==> 2006-07-02 08:09:04.423
 *(new Date()).Format("yyyy-M-d h:m:s.S")      ==> 2006-7-2 8:9:4.18
 */
Date.prototype.format = function (fmt) {
    var o = {
        "M+": this.getMonth() + 1, //月份
        "d+": this.getDate(), //日
        "h+": this.getHours(), //小时
        "m+": this.getMinutes(), //分
        "s+": this.getSeconds(), //秒
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度
        "S": this.getMilliseconds() //毫秒
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}

String.prototype.toObjectKey = function() {
    let retStr = "";
    let strList = this.toLocaleLowerCase().split("_");
    strList.forEach((str, index) => {
        retStr += index == 0 ? str : (str.substr(0,1).toLocaleUpperCase() + str.substr(1));
    });
    return retStr;
}

String.prototype.getLast = function(size){
    let retStr = "";
    retStr = this.substr(this.length - size, size);
    return retStr;
}

// 对Date的扩展，将 Date 转化为指定格式的String
// 月(M)、日(d)、小时(h)、分(m)、秒(s)、季度(q) 可以用 1-2 个占位符，
// 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字)
// 例子：
// (new Date()).Format("yyyy-MM-dd hh:mm:ss.S") ==> 2006-07-02 08:09:04.423
// (new Date()).Format("yyyy-M-d h:m:s.S")      ==> 2006-7-2 8:9:4.18
Date.prototype.Format = function (fmt) { //author: meizz
    var o = {
        "M+": this.getMonth() + 1, //月份
        "d+": this.getDate(), //日
        "h+": this.getHours(), //小时
        "m+": this.getMinutes(), //分
        "s+": this.getSeconds(), //秒
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度
        "S": this.getMilliseconds() //毫秒
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (let k in o)
    if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}


/**
 * 判断数组中是否存在某个值
 * @param obj
 * @returns {boolean}
 */
Array.prototype.contains = function (obj) {
    var i = this.length;
    while (i--) {
        if (this[i] === obj) {
            return true;
        }
    }
    return false;
}

/**
 * 将list按入参key转换成dict
 * @param key
 */
// Array.prototype.toDict = function (key) {
//     let retDict = {};
//     this.forEach((element, index) => {
//         let objectKey = element[key].toObjectKey();
//         retDict[objectKey] = element;
//     });
//     return retDict;
// }
function formatKey(key){
    return typeof key === "number" ? key : "'{0}'".format(key);
}
function parseToDictConds(conds, element){
    let retFlag = true;
    if(conds == undefined || Object.keys(conds) == 0){
        return retFlag;
    }
    let oper = conds['oper'], vals = conds['val'], elementVal = element[conds['key']];

    if(oper === 'not in'){
        retFlag = !vals.contains(elementVal);
    }else if(oper === 'in'){
        retFlag = vals.contains(elementVal);
    } else {
        let evalStr = "{0} {1} {2}".format(formatKey(elementVal), oper, formatKey(vals));
        retFlag = eval(evalStr);
    }
    return retFlag;
}

/**
 * 将list转object
 * @param keys数组内object的key
 * @param conds 符合条件的行才转换
 * @param resultKey 最终结果形式
 * @param keyFormat 返回的object的key值是是否格式化
 */
Array.prototype.toDict = function (keys, conds, resultKey, keyFormat) {
    let retDict = {};
    this.forEach((element, index) => {
        try {
            if (parseToDictConds(conds, element)) {
                let keyStr = "";
                keys.forEach((key, i) => {
                    let tmpKey = element[key];
                    if (tmpKey == undefined || tmpKey == null) {
                        console.log("key:{0};element:{1}".format(key, JSON.stringify(element)));
                        throw new Error("数组转为Object时发生key值不存在的问题。");
                    }
                    let objectKey = typeof tmpKey === "number" || keyFormat ? tmpKey : tmpKey.toObjectKey();
                    if (i < keys.length - 1) {
                        let hasProStr = "!retDict{0}.hasOwnProperty({1})".format(keyStr, formatKey(objectKey));
                        if (eval(hasProStr)) {
                            eval("retDict{0}[{1}] = ".format(keyStr, formatKey(objectKey)) + "{}");
                        }
                    } else if (i == keys.length - 1 && resultKey == 2) {
                        let hasProStr = "!retDict{0}.hasOwnProperty({1})".format(keyStr, formatKey(objectKey));
                        if (eval(hasProStr)) {
                            eval("retDict{0}[{1}] = []".format(keyStr, formatKey(objectKey)));
                        }
                    }

                    keyStr += "[{0}]".format(formatKey(objectKey));
                });
                let evalStr = "";
                if(resultKey == undefined || resultKey == 1){
                    evalStr = "retDict{0} = element".format(keyStr);
                } else if (resultKey == 0) {
                    evalStr = "retDict{0} = null".format(keyStr);
                } else if (resultKey == 2) {
                    evalStr = "retDict{0}.push(element)".format(keyStr);
                } else {
                    evalStr = "retDict{0} = element[{1}]".format(keyStr, formatKey(resultKey));
                }
                eval(evalStr);
            }
        }catch (error) {
            console.log("keys:{0};element:{1}".format(JSON.stringify(keys), JSON.stringify(element)));
            console.log(error.stack);
            throw new Error(error.message);
        }
    });
    return retDict;
}

