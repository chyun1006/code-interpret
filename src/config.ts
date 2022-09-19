export default [
  {
    title: "百度翻译",
    appid: "20220918001346569",
    secretKey: "oYdYv3qzrQxH9TzXbSIv",
    api: (query: string, salt: number, sign: string, target: string) =>
      `http://api.fanyi.baidu.com/api/trans/vip/translate?q=${query}&from=auto&to=${target}&appid=20220918001346569&salt=${salt}&sign=${sign}`,
  },
];
