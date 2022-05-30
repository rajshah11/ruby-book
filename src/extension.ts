import * as vscode from 'vscode';
import * as rubyBookController from './rubyBookController';
import * as rubyBookSerializer from './rubyBookSerializer';
export function activate(context: vscode.ExtensionContext) {
	console.log('Congratulations, your extension "ruby-book" is now active!');
	let disposable = vscode.commands.registerCommand('ruby-book.helloWorld', () => {
		vscode.window.showInformationMessage('Hello World from RubyBook!');
	});

	context.subscriptions.push(disposable);
	rubyBookSerializer.activate(context);
	rubyBookController.activate(context);
}

export function deactivate() {}
