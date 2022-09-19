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
        const res: any = await _getTranslate(selectContent);
        const options = res["trans_result"].map((item: any) => ({
          label: item.dst,
        }));
        const result: any = await vscode.window.showQuickPick(options);
        // 此处有坑：不要使用edit上的replace方法，会报错: Edit is only valid while callback runs
        // 解决办法： https://github.com/stkb/Rewrap/issues/324
        textEditor.edit((editbuilder) => {
          editbuilder.replace(range, result.label);
        });
      } catch (error: any) {
        vscode.window.showInformationMessage(error);
      }
    }
  );
  context.subscriptions.push(disposable);
}

function _getTranslate(selectContent: string) {
  const randomNum = +new Date();
  const key = joinParams(selectContent, randomNum);
  const sign = getSign(key);
  const url = api[0].api(selectContent, randomNum, sign);
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

// this method is called when your extension is deactivated
export function deactivate() {}
