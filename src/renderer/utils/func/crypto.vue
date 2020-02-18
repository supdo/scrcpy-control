<script type="text/javascript">
import CryptoJS from 'crypto-js';
import b64_sha1 from "../js/sha1";

//加密
const encrypt = function(word, keyStr) {
    keyStr = keyStr ? keyStr : "abcdefgabcdefg12";
    var key = CryptoJS.enc.Utf8.parse(keyStr); //Latin1 w8m31+Yy/Nw6thPsMpO5fg==
    var srcs = CryptoJS.enc.Utf8.parse(word);
    var encrypted = CryptoJS.AES.encrypt(srcs, key, {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7
    });
    return encrypted.toString();
}
//解密
const decrypt = function(word, keyStr) {
    keyStr = keyStr ? keyStr : "abcdefgabcdefg12";
    var key = CryptoJS.enc.Utf8.parse(keyStr); //Latin1 w8m31+Yy/Nw6thPsMpO5fg==
    var decrypt = CryptoJS.AES.decrypt(word, key, {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7
    });
    return CryptoJS.enc.Utf8.stringify(decrypt).toString();
}

//密码加密
const encPassword = function(password) {
    let  hash = b64_sha1(password);
    let words = CryptoJS.enc.Base64.parse(hash);
    let base64 = CryptoJS.enc.Base64.stringify(words);
    return base64;
}

export default {
    encrypt,
    decrypt,
    encPassword
}
</script>