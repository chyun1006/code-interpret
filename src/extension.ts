import * as vscode from "vscode";
import { getSign, joinParams } from "./utils";
import api from "./config";
const http = require("http");

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerTextEditorCommand(
    "var-named-helper.spellhelper",
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
        const pattern = new RegExp("[\u4E00-\u9FA5]+");
        const isChinese = pattern.test(selectContent);
        const target = isChinese ? "en" : "zh";
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

function _getTranslate(selectContent: string, target: string = "en") {
  const randomNum = +new Date();
  const key = joinParams(selectContent, randomNum);
  const sign = getSign(key);
  const url = api[0].api(selectContent, randomNum, sign, target);
  return new Promise((resolve, reject) => {
    try {
      http.get(url, (res: any) => {
        if (res.statusCode !== 200) {
          console.log(`statusCode ${res.statusCode}`);
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
      res.push(word.slice(0, 1).toUpperCase() + word.slice(1).toLowerCase()); // 首字母大写
      res.push(word.toLowerCase()); // 全小写
    } else {
      res.push(..._getHumpOptions(words));
    }
  });

  console.log("----options===", res);
  return res;
}

function _firstLetterUpperCase(words: string) {
  return words.slice(0, 1).toUpperCase() + words.slice(1).toLowerCase();
}

function _getHumpOptions(words: Array<string>) {
  let bigHump = ""; // 大驼峰
  let smallHump = ""; // 小驼峰
  words.forEach((item: string, index: number) => {
    if (index === 0) {
      smallHump += item.toLowerCase();
    } else {
      smallHump += _firstLetterUpperCase(item);
    }
    bigHump += _firstLetterUpperCase(item);
  });

  return [bigHump, smallHump];
}

// this method is called when your extension is deactivated
export function deactivate() {}
