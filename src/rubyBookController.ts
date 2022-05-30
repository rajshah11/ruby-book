import * as vscode from 'vscode';
import { RubyBook } from './rubyBook';

interface RawNotebookCell {
	language: string;
	value: string;
	kind: vscode.NotebookCellKind;
	editable?: boolean;
}

export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(new RubyBookController());
}

class RubyBookController {
	readonly controllerId = 'ruby-book-controller-id';
	readonly notebookType = 'ruby-book';
	readonly label = 'RubyBook';
	readonly supportedLanguages = ['ruby'];

	private readonly _controller: vscode.NotebookController;
	private _executionOrder = 0;
	private rubyBook: RubyBook | undefined;

	constructor() {
		this._controller = vscode.notebooks.createNotebookController(
			this.controllerId,
			this.notebookType,
			this.label
		);

		this._controller.supportedLanguages = this.supportedLanguages;
		this._controller.supportsExecutionOrder = true;
		this._controller.executeHandler = this._execute.bind(this);
		this.rubyBook = new RubyBook();
	}

	dispose() {
		this.rubyBook?.dispose();
		this._controller?.dispose();
	}

	private async _execute(
		cells: vscode.NotebookCell[],
		_notebook: vscode.NotebookDocument,
		_controller: vscode.NotebookController
	): Promise<void> {
		if (!this.rubyBook?.hasStarted()) {
			await this.rubyBook?.startKernel();
		}

		for (let cell of cells) {
			await this._doExecution(cell);
		}
	}

	private async _doExecution(cell: vscode.NotebookCell): Promise<void> {
		if (!this.rubyBook?.hasStarted()) {
			await this.rubyBook?.startKernel();
		}
		
		const execution = this._controller.createNotebookCellExecution(cell);
		execution.executionOrder = ++this._executionOrder;
		execution.start(Date.now()); // Keep track of elapsed time to execute cell.

		/* Do some execution here; not implemented */
		const output = await this.rubyBook!.eval(cell, execution.token);
		this.rubyBook!.postEval();

		execution.replaceOutput([
			new vscode.NotebookCellOutput([
				vscode.NotebookCellOutputItem.text(output[1]),
			])
		]);
		execution.appendOutput(new vscode.NotebookCellOutput([
			vscode.NotebookCellOutputItem.text(output[2]),
		]));
		execution.end(output[0], Date.now());
	}
}