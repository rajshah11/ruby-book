# RubyBook

<p align="center">
  <img src="./docs/images/rubybook.png" width="100" height="100"/>
</p>

RubyBook is a VSCode extension that provides a notebook interface for Ruby code. :notebook:

This extension spawns a `pry` process in the background to allow users to create experiences with connected, executable Ruby cells and informational Markdown cells. :tada:

## Features

- Run Ruby code within cells
- Organize multiple cells in a file with data flowing from one cell to the next
- Use Markdown to create human-readable cells documentating the code
- Uses the power of pry to run code and maintain variables and results between multiple cells.

\
![RubyBook Demo](./docs/images/demo.gif)

## Requirements

### [ruby](https://www.ruby-lang.org/en/documentation/installation/)

### [pry](https://github.com/pry/pry)

Note: The extension spawns a process by just running `pry`, so please make sure that `pry` is installed properly and added to the PATH. Easiest way to check is to run `pry` from terminal.

## Extension Settings

**No settings, as of now.** Configuration settings like execution timeouts, polling interval for output, etc. coming soon. Currently, the execution does not timeout and tries to run forever. The `pry` process is polled for output every 500 ms.

## Known Issues

- The extension adopts a little hacky method to poll for completion of a code cell. It checks for the existence of the `pry` prompt (for ex., `[2] pry(main)> `) instead of gracefully inspecting Node.js I/O streams.
- No configuration settings for execution timeouts or polling intervals. Note: You can stop execution of a command through the VSCode UI.
- Window not focused on a newly created RubyBook.

## Feature Ideas

- Short-term

  - Configuration settings
  - Add comments in the extension code
  - Add example `.rubybook` files
  - Add language icon

- Medium-term

  - A custom renderer to colorize and pretty print output and errors for code execution cells

- Long-term
  - Use an existing [Debbugger Adapter Protocol](https://microsoft.github.io/debug-adapter-protocol/) like [byebug-dap](https://gitlab.com/firelizzard/byebug-dap) or work on a new one to potentially add debugging support for the extension

**If you have any issues, bugs or suggestions, please feel free to create a [Github issue](https://github.com/rajshah11/ruby-book/issues)**

**If you are willing contribute, please start a discussion and feel free to create a [pull request](https://github.com/rajshah11/ruby-book/compare)**

## Release Notes

### 1.0.0

Initial release of RubyBook :tada:
