import * as vscode from 'vscode'
import { getSign, joinParams } from './utils'
import api from './config'
const http = require('http')

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerTextEditorCommand(
    'var-named-helper.spellhelper',
    (textEditor, edit) => {
      const selectContent = _getSelectContent(textEditor)
      if (selectContent) {
        vscode.window.showInformationMessage(`请划取要翻译的词`)
        return
      }

      const randomNum = +new Date()
      const key = joinParams(selectContent, randomNum)
      const sign = getSign(key)
      const url = api[0].api(selectContent, randomNum, sign)

      http.get(url, (res: any) => {
        if (res.statusCode !== 200) {
          console.log(`statusCode ${res.statusCode}`)
          return
        }

        let data = ''
        res.on('data', (chunk: any) => (data += chunk))
        res.on('end', () => {
          const parsedData = JSON.parse(data)
          console.log('data', parsedData)

          const translateRes = parsedData.trans_result[0].dst
          vscode.window.showInformationMessage(`翻译结果：${translateRes}`)
        })
      })
    }
  )
  context.subscriptions.push(disposable)
}

function _getSelectContent(textEditor: vscode.TextEditor): string {
  const document: vscode.TextDocument = textEditor.document
  const { start, end } = textEditor.selection
  const range = new vscode.Range(start, end)
  return document.getText(range)
}

// this method is called when your extension is deactivated
export function deactivate() {}
