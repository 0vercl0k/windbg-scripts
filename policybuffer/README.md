# policybuffer.js

`policybuffer.js` is a [JavaScript](https://docs.microsoft.com/en-us/windows-hardware/drivers/debugger/javascript-debugger-scripting) debugger extension for WinDbg that disassembles Policy buffer programs used by the Chromium sandbox. Those programs are used to evaluate policy decision.

## Usage

Run `.scriptload policybuffer.js` to load the script. You can invoke the disassembler feature with `!disasspolicy <addr>`.

## Examples

* Dumping the File System policy of Firefox:

```text
0:052> !disasspolicy 0x1ac63e547d8 
!OP_NUMBER_AND_MATCH<OpenFile::BROKER, 0x1>
!OP_WSTRING_MATCH<OpenFile::NAME, "\??\", Length(0x4), Offset(0x0), CASE_SENSITIVE>
OP_ACTION<ASK_BROKER>

!OP_NUMBER_AND_MATCH<OpenFile::BROKER, 0x1>
OP_WSTRING_MATCH<OpenFile::NAME, "~", Length(0x1), Offset(0xffffffff), CASE_SENSITIVE>
OP_ACTION<ASK_BROKER>

OP_WSTRING_MATCH<OpenFile::NAME, "\??\C:\Users\over\AppData\LocalLow\Mozilla\Temp-{4a0a0cab-4636-4262-b8a9-b67fc1495a1a}\", Length(0x57), Offset(0x0), CASE_INSENSITIVE>
OP_ACTION<ASK_BROKER>

!OP_NUMBER_AND_MATCH<OpenFile::ACCESS, 0x5fedff56>
OP_NUMBER_MATCH<OpenFile::DISPOSITION, UINT32_TYPE(0x1)>
OP_WSTRING_MATCH<OpenFile::NAME, "\??\C:\Users\over\AppData\Local\Microsoft\Windows\Fonts\", Length(0x38), Offset(0x0), CASE_INSENSITIVE>
OP_ACTION<ASK_BROKER>

!OP_NUMBER_AND_MATCH<OpenFile::ACCESS, 0x5fedff56>
OP_NUMBER_MATCH<OpenFile::DISPOSITION, UINT32_TYPE(0x1)>
OP_WSTRING_MATCH<OpenFile::NAME, "\??\C:\work\codes\firefox\sandbox\win64\firefox-66.0a1.en-US.win64\firefox\", Length(0x4b), Offset(0x0), CASE_INSENSITIVE>
OP_ACTION<ASK_BROKER>

!OP_NUMBER_AND_MATCH<OpenFile::ACCESS, 0x5fedff56>
OP_NUMBER_MATCH<OpenFile::DISPOSITION, UINT32_TYPE(0x1)>
OP_WSTRING_MATCH<OpenFile::NAME, "\??\C:\work\codes\firefox\sandbox\win64\profile\chrome\", Length(0x37), Offset(0x0), CASE_INSENSITIVE>
OP_ACTION<ASK_BROKER>

!OP_NUMBER_AND_MATCH<OpenFile::ACCESS, 0x5fedff56>
OP_NUMBER_MATCH<OpenFile::DISPOSITION, UINT32_TYPE(0x1)>
OP_WSTRING_MATCH<OpenFile::NAME, "\??\C:\work\codes\firefox\sandbox\win64\profile\extensions\", Length(0x3b), Offset(0x0), CASE_INSENSITIVE>
OP_ACTION<ASK_BROKER>

!OP_NUMBER_AND_MATCH<OpenFile::ACCESS, 0x5fedff56>
OP_NUMBER_MATCH<OpenFile::DISPOSITION, UINT32_TYPE(0x1)>
OP_WSTRING_MATCH<OpenFile::NAME, "\??\C:\Users\over\AppData\Roaming\Mozilla\SystemExtensionsDev\", Length(0x3e), Offset(0x0), CASE_INSENSITIVE>
OP_ACTION<ASK_BROKER>

!OP_NUMBER_AND_MATCH<OpenFile::ACCESS, 0x5fedff56>
OP_NUMBER_MATCH<OpenFile::DISPOSITION, UINT32_TYPE(0x1)>
OP_WSTRING_MATCH<OpenFile::NAME, "\??\C:\Users\over\AppData\Roaming\Mozilla\Extensions\", Length(0x35), Offset(0x0), CASE_INSENSITIVE>
OP_ACTION<ASK_BROKER>

OP_WSTRING_MATCH<OpenFile::NAME, "\??\pipe\chrome.", Length(0x10), Offset(0x0), CASE_INSENSITIVE>
OP_ACTION<ASK_BROKER>

OP_WSTRING_MATCH<OpenFile::NAME, "\??\pipe\gecko-crash-server-pipe.", Length(0x21), Offset(0x0), CASE_INSENSITIVE>
OP_ACTION<ASK_BROKER>

@$disasspolicy(0x1ac63e547d8)
```
