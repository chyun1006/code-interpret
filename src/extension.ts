// import { http } from 'http';
const http = require("http");
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { getSign, joinParams } from "./utils";
import api from "./config";

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerTextEditorCommand(
    "code-interpret.spellhelper",
    (textEditor, edit) => {
      const document: vscode.TextDocument = textEditor.document;
      const { start, end } = textEditor.selection;
      const range = new vscode.Range(start, end);
      const selectContent = document.getText(range);
      if (selectContent) {
        vscode.window.showInformationMessage(`请划取要翻译的词`);
        return;
      }

      const randomNum = +new Date();
      const key = joinParams(selectContent, randomNum);
      const sign = getSign(key);
      const url = api[0].api(selectContent, randomNum, sign);

      http.get(url, (res: any) => {
        if (res.statusCode !== 200) {
          console.log(`statusCode ${res.statusCode}`);
          return;
        }

        let data = "";
        res.on("data", (chunk: any) => (data += chunk));
        res.on("end", () => {
          const parsedData = JSON.parse(data);
          console.log("data", parsedData);

          const translateRes = parsedData.trans_result[0].dst;
          vscode.window.showInformationMessage(`翻译结果：${translateRes}`);
        });
      });
    }
  );
  context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
