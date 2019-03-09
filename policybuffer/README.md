# policybuffer.js

`policybuffer.js` is a [JavaScript](https://docs.microsoft.com/en-us/windows-hardware/drivers/debugger/javascript-debugger-scripting) debugger extension for WinDbg that disassembles Policy buffer programs used by the Chromium sandbox. Those programs are used to evaluate policy decision.

## Usage

Run `.scriptload policybuffer.js` to load the script. You can invoke the disassembler feature with `!disasspolicy <addr>`.

## Examples

* Dumping the File System policy of Firefox:

```text
0:017> !disasspolicy 0x00000131`d2142208
!OP_NUMBER_AND_MATCH<Param1, 0x1>
!OP_WSTRING_MATCH<Param0, "\??\", Length(0x4), Offset(0x0), CASE_SENSITIVE>
OP_ACTION<ASK_BROKER>

!OP_NUMBER_AND_MATCH<Param1, 0x1>
OP_WSTRING_MATCH<Param0, "~", Length(0x1), Offset(0xffffffff), CASE_SENSITIVE>
OP_ACTION<ASK_BROKER>

OP_WSTRING_MATCH<Param0, "\??\C:\Users\over\AppData\LocalLow\Mozilla\Temp-{8aca3358-7266-42d0-a521-805394768d86}\", Length(0x57), Offset(0x0), CASE_INSENSITIVE>
OP_ACTION<ASK_BROKER>

!OP_NUMBER_AND_MATCH<Param2, 0x5fedff56>
OP_NUMBER_MATCH<Param3, UINT32_TYPE(0x1)>
OP_WSTRING_MATCH<Param0, "\??\C:\Users\over\AppData\Local\Microsoft\Windows\Fonts\", Length(0x38), Offset(0x0), CASE_INSENSITIVE>
OP_ACTION<ASK_BROKER>

!OP_NUMBER_AND_MATCH<Param2, 0x5fedff56>
OP_NUMBER_MATCH<Param3, UINT32_TYPE(0x1)>
OP_WSTRING_MATCH<Param0, "\??\C:\work\firefox-66.0a1.en-US.win64\firefox\", Length(0x2f), Offset(0x0), CASE_INSENSITIVE>
OP_ACTION<ASK_BROKER>

!OP_NUMBER_AND_MATCH<Param2, 0x5fedff56>
OP_NUMBER_MATCH<Param3, UINT32_TYPE(0x1)>
OP_WSTRING_MATCH<Param0, "\??\C:\Users\over\AppData\Roaming\Mozilla\Firefox\Profiles\rbo6kdsb.default-nightly\chrome\", Length(0x5b), Offset(0x0), CASE_INSENSITIVE>
OP_ACTION<ASK_BROKER>

!OP_NUMBER_AND_MATCH<Param2, 0x5fedff56>
OP_NUMBER_MATCH<Param3, UINT32_TYPE(0x1)>
OP_WSTRING_MATCH<Param0, "\??\C:\Users\over\AppData\Roaming\Mozilla\Firefox\Profiles\rbo6kdsb.default-nightly\extensions\", Length(0x5f), Offset(0x0), CASE_INSENSITIVE>
OP_ACTION<ASK_BROKER>

!OP_NUMBER_AND_MATCH<Param2, 0x5fedff56>
OP_NUMBER_MATCH<Param3, UINT32_TYPE(0x1)>
OP_WSTRING_MATCH<Param0, "\??\C:\Users\over\AppData\Roaming\Mozilla\SystemExtensionsDev\", Length(0x3e), Offset(0x0), CASE_INSENSITIVE>
OP_ACTION<ASK_BROKER>

!OP_NUMBER_AND_MATCH<Param2, 0x5fedff56>
OP_NUMBER_MATCH<Param3, UINT32_TYPE(0x1)>
OP_WSTRING_MATCH<Param0, "\??\C:\Users\over\AppData\Roaming\Mozilla\Extensions\", Length(0x35), Offset(0x0), CASE_INSENSITIVE>
OP_ACTION<ASK_BROKER>

OP_WSTRING_MATCH<Param0, "\??\pipe\chrome.", Length(0x10), Offset(0x0), CASE_INSENSITIVE>
OP_ACTION<ASK_BROKER>

OP_WSTRING_MATCH<Param0, "\??\pipe\gecko-crash-server-pipe.", Length(0x21), Offset(0x0), CASE_INSENSITIVE>
OP_ACTION<ASK_BROKER>

@$disasspolicy(0x00000131`d2142208)
```
