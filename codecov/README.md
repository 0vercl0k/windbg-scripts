# codecov.js

`codecov.js` is a [JavaScript](https://docs.microsoft.com/en-us/windows-hardware/drivers/debugger/javascript-debugger-scripting) debugger extension for WinDbg that allows to code-coverage out of a [TTD](https://docs.microsoft.com/en-us/windows-hardware/drivers/debugger/time-travel-debugging-overview) trace. It generates a JSON file with every offsets (as well as the instruction size) in a module that have been executed during the recording.

The JSON file looks like the below:

```json
{
  "TracePath":"C:\\work\\codes\\tmp\\js01.run",
  "Modules":[
    {
      "Name":"c:\\windows\\system32\\kernelbase.dll",
      "Base":"7fffb4ce0000",
      "Size":"293000",
      "CodeBlocks":[
        ["25620",2],
        ["25622",4],
        ["25626",2],
        ["25628",5],
        ["25734",5],
        ["25739",5],
        ...
      ]
    },
    {
      "Name":"c:\\windows\\system32\\kernel32.dll",
      "Base":"7fffb6460000",
      "Size":"b3000",
      "CodeBlocks":[
        ["1f3a0",7],
        ["21bb0",6],
        ["1bb90",7],
        ...
      ]
    }
  ]
}
```

## Usage

Run `.scriptload codecov.js` to load the script. You can extract code-coverage using `!codecov "foo"`.

## Examples

Extract the code-coverage for every modules matching `kernel32`:

```text
0:000> !codecov "kernel"
Looking for *kernel*..
Found 2 hits
Found 7815 unique addresses in C:\WINDOWS\System32\KERNELBASE.dll
Found 1260 unique addresses in C:\WINDOWS\System32\KERNEL32.DLL
Writing C:\work\codes\tmp\js01.run.kernel.json...

0:000> !codecov "kernel"
Looking for *kernel*..
The output file C:\work\codes\tmp\js01.run.kernel.json already exists, exiting.
@$codecov("kernel")
```

