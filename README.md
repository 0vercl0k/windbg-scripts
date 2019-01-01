# windbg-scripts

`windbg-scripts` is a collection of [JavaScript](https://docs.microsoft.com/en-us/windows-hardware/drivers/debugger/javascript-debugger-scripting) debugger extensions  for WinDbg.

* [basics](https://github.com/0vercl0k/windbg-scripts/tree/master/basics): various examples of basic usage of various APIs,
* [parse_eh_win64.js](https://github.com/0vercl0k/windbg-scripts/blob/master/parse_eh_win64/parse_eh_win64.js): example of extending the data-model with exception handling related information (cf [Debugger data model, Javascript & x64 exception handling](https://doar-e.github.io/blog/2017/12/01/debugger-data-model/)),
* [telescope.js](https://github.com/0vercl0k/windbg-scripts/blob/master/telescope/telescope.js): [telescope](https://gef.readthedocs.io/en/latest/commands/dereference/) like command for WinDbg,
* [sm.js](https://github.com/0vercl0k/windbg-scripts/blob/master/sm/sm.js): pretty-printing of Spidermonkey `js::Value` and `JSObject` objects.

