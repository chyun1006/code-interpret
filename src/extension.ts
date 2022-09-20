import * as vscode from "vscode";
import {
  getSign,
  joinParams,
  getHumpNamedVar,
  firstLetterUpperCase,
  isChinese,
} from "./utils";
import api from "./config";
const http = require("http");

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerTextEditorCommand(
    "translate-helper",
    async (textEditor, edit) => {
      const document: vscode.TextDocument = textEditor.document;
      const { start, end } = textEditor.selection;
      const range = new vscode.Range(start, end);

      const selectContent = document.getText(range);
      if (!selectContent) {
        vscode.window.showInformationMessage(`请划取要翻译的词`);
        return;
      }

      try {
        const target = isChinese(selectContent) ? "en" : "zh";
        const res: any = await _getTranslate(selectContent, target);
        const options = res["trans_result"].map((item: any) => item.dst);

        const items = Array.from(new Set(_generateOptions(options)));
        const result: any = await vscode.window.showQuickPick(items);
        // 此处有坑：不要使用edit上的replace方法，会报错: Edit is only valid while callback runs
        // 解决办法： https://github.com/stkb/Rewrap/issues/324
        if (result) {
          textEditor.edit((editbuilder) => {
            editbuilder.replace(range, result);
          });
        }
      } catch (error: any) {
        vscode.window.showInformationMessage(error.message);
      }
    }
  );
  context.subscriptions.push(disposable);
}

/**
 * 接口请求
 * @param source 翻译内容
 * @param target 目标语言
 * @returns
 */
function _getTranslate(source: string, target: string = "en") {
  const randomNum = +new Date();
  const key = joinParams(source, randomNum);
  const sign = getSign(key);
  const baiduApi = api[0];
  const url = baiduApi.api(source, randomNum, sign, target);
  return new Promise((resolve, reject) => {
    try {
      http.get(url, (res: any) => {
        if (res.statusCode !== 200) {
          vscode.window.showInformationMessage(`请求错误：${res.statusCode}`);
          return;
        }

        let data = "";
        res.on("data", (chunk: any) => (data += chunk));
        res.on("end", () => {
          const parsedData = JSON.parse(data);
          resolve(parsedData);
        });
      });
    } catch (error) {
      reject(null);
    }
  });
}

function _generateOptions(options: Array<any>): Array<string> {
  let res: Array<string> = [];
  options.forEach((item) => {
    const words = item.split(" ");
    if (words.length === 1) {
      const word = words[0];
      res.push(firstLetterUpperCase(word)); // 首字母大写
      res.push(word.toLowerCase()); // 全小写
    } else {
      res.push(...getHumpNamedVar(words)); // 驼峰
    }
  });

  return res;
}

// this method is called when your extension is deactivated
export function deactivate() {}
