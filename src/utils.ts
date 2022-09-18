const cypto = require("crypto");
import api from "./config";

export function getSign(str: string) {
  const md5 = cypto.createHash("md5");
  md5.update(str);
  const res = md5.digest("hex");
  return res.toLowerCase();
}

export function joinParams(query: string, randomNum: number) {
  const baiduApi = api[0];
  const res = baiduApi.appid + query + randomNum + baiduApi.secretKey;
  return res;
}
