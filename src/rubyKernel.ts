import * as vscode from 'vscode';
import * as cp from 'child_process';
import * as fs from 'fs';
import * as PATH from 'path';
import * as os from 'os';
import { waitUntil, WAIT_FOREVER } from 'async-wait-until';
const rmdir = require('rimraf');

export class RubyKernel {

	private rubyRuntime: cp.ChildProcess | undefined;
	private outputBuffer = '';	// collect output here
	private errorBuffer = '';
	private commandDone = false;

	private pathToCell: Map<string, vscode.NotebookCell> = new Map();
	private tmpDirectory?: string;
	private pryStarted = false;
	private started = false;

	constructor() {
	}

	public async start() {
		if (!this.started) {
			this.rubyRuntime = cp.exec('pry', (error, stdout, stderr) => {
				console.log(`stdout: ${stdout}`);
				console.log(`stderr: ${stderr}`);
				console.log(`error: ${error}`);
			});

			var pryStarted = new Promise<void>((resolve) => {
				if (this.rubyRuntime?.stdout) {
					this.rubyRuntime?.stdout.on('data', (data: Buffer) => {
						this.outputBuffer += data.toString();
						this.pryStarted = /\[1\] pry\(main\)> /.test(this.outputBuffer);
						if (this.pryStarted) {
							console.log(data);
							resolve();
						}
					});
				}
			});

			var errorFlushed = new Promise<void>((resolve) => {
				if (this.rubyRuntime?.stderr) {
					this.rubyRuntime.stderr?.on('readable', () => {
						let data;
						while (null !== (data = this.rubyRuntime!.stderr?.read())) {
							this.errorBuffer += data.toString();
						}
						console.log(this.errorBuffer);
						resolve();
					});
				}
			});

			await Promise.all([pryStarted, errorFlushed]);

			this.rubyRuntime.stdout?.removeAllListeners();
			this.rubyRuntime.stderr?.removeAllListeners();
			this.clearBuffers();

			if (this.rubyRuntime.stdout) {
				this.rubyRuntime.stdout.on('data', (data: Buffer) => {
					this.outputBuffer += data.toString();
					this.commandDone = /[\n]?\[[0-9]*\] pry\(main\)> /.test(this.outputBuffer);
					if (this.commandDone) {
						this.outputBuffer = this.outputBuffer.replace(/[\n]?\[[0-9]*\] pry\(main\)> /g, '');
					}
				});
			}

			if (this.rubyRuntime.stderr) {
				this.rubyRuntime.stderr.on('data', (data: Buffer) => {
					this.errorBuffer += data.toString();
				});
			}

			this.started = true;
		}
	}

	public async restart() {
		this.stop();
		await this.start();
	}

	public stop() {

		if (this.rubyRuntime) {
			this.rubyRuntime.kill();
			this.rubyRuntime = undefined;
		}

		if (this.tmpDirectory) {
			const t = this.tmpDirectory;
			this.tmpDirectory = undefined;
			rmdir(t, { glob: false }, (err: Error | undefined) => {
				if (err) {
					console.log(err);
				}
			});
		}
	}

	public async eval(cell: vscode.NotebookCell, cancellationToken: vscode.CancellationToken): Promise<[boolean, string, string]> {

		const cellPath = this.dumpCell(cell);
		if (cellPath && this.rubyRuntime && this.rubyRuntime.stdin) {

			this.outputBuffer = '';
			this.errorBuffer = '';
			this.commandDone = false;

			this.rubyRuntime.stdin.write(`Pry.toplevel_binding.eval File.read('${cellPath}')\n`);
			const cancellationPromise = new Promise<void>((resolve) => {
				cancellationToken.onCancellationRequested(() => {
					resolve();
				});
			});

			const waitPromise = waitUntil(() => this.commandDone, WAIT_FOREVER);
			
			await Promise.race([waitPromise, cancellationPromise]);

			if(cancellationToken.isCancellationRequested){
				this.errorBuffer = 'Cancellation Requested!';
			}
			
			return Promise.resolve([!cancellationToken.isCancellationRequested, this.outputBuffer, this.errorBuffer]);
		}
		throw new Error('Evaluation failed');
	}

	public clearBuffers() {
		this.outputBuffer = '';
		this.errorBuffer = '';
	}



	/**
	 * Store cell in temporary file and return its path or undefined if uri does not denote a cell.
	 */
	private dumpCell(cell: vscode.NotebookCell): string | undefined {
		try {
			if (cell) {
				if (!this.tmpDirectory) {
					this.tmpDirectory = fs.mkdtempSync(PATH.join(os.tmpdir(), 'vscode-nodebook-'));
				}
				const cellPath = `${this.tmpDirectory}/nodebook_cell_${cell.document.uri.fragment}.rb`;
				this.pathToCell.set(cellPath, cell);

				let data = cell.document.getText();
				data += `\n# @ sourceURL=${cellPath}`;	// trick to make node.js report the eval's source under this path
				fs.writeFileSync(cellPath, data);

				return cellPath;
			}
		} catch (e) {
		}
		return undefined;
	}
}