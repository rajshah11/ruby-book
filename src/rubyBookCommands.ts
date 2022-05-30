import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(vscode.commands.registerCommand('ruby-book.newNotebook', async () => {
    const newNotebook = await vscode.workspace.openNotebookDocument('ruby-book',
      new vscode.NotebookData([
        new vscode.NotebookCellData(vscode.NotebookCellKind.Code, "puts 'Hello World'", 'ruby-book')
      ]));
  }));
}