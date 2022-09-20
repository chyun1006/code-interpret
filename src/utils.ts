const cypto = require("crypto");
import api from "./config";

/**
 * 获取百度翻译签名
 * @param str
 * @returns
 */
export function getSign(str: string) {
  const md5 = cypto.createHash("md5");
  md5.update(str);
  const res = md5.digest("hex");
  return res.toLowerCase();
}

/**
 * 百度翻译接口参数拼接
 * @param query
 * @param randomNum
 * @returns
 */
export function joinParams(query: string, randomNum: number) {
  const baiduApi = api[0];
  const res = baiduApi.appid + query + randomNum + baiduApi.secretKey;
  return res;
}

/**
 * 首字母大写
 * @param words
 * @returns
 */
export function firstLetterUpperCase(words: string) {
  return words.slice(0, 1).toUpperCase() + words.slice(1).toLowerCase();
}

/**
 * 代码命名
 * @param words
 * @returns
 */
export function getHumpNamedVar(words: Array<string>) {
  let bigHump = ""; // 大驼峰
  let smallHump = ""; // 小驼峰
  words.forEach((item: string, index: number) => {
    if (index === 0) {
      smallHump += item.toLowerCase();
    } else {
      smallHump += firstLetterUpperCase(item);
    }
    bigHump += firstLetterUpperCase(item);
  });

  return [bigHump, smallHump];
}

export function isChinese(word: string) {
  const pattern = new RegExp("[\u4E00-\u9FA5]+");
  const isChinese = pattern.test(word);
  return isChinese;
}
