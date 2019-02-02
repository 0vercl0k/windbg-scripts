# codecov.js

`codecov.js` is a [JavaScript](https://docs.microsoft.com/en-us/windows-hardware/drivers/debugger/javascript-debugger-scripting) debugger extension for WinDbg that allows to code-coverage out of a [TTD](https://docs.microsoft.com/en-us/windows-hardware/drivers/debugger/time-travel-debugging-overview) trace. It generates a text file with every offsets in a module that have been executed during the recording.

The file looks like the below:

```text
; TracePath: C:\work\codes\blazefox\js01.run
; c:\windows\system32\kernelbase.dll, 7fffb4ce0000, 293000
kernelbase.dll+5df40
kernelbase.dll+5df43
kernelbase.dll+5df47
kernelbase.dll+5df4b
kernelbase.dll+5df4f
...
; c:\windows\system32\kernel32.dll, 7fffb6460000, b3000
kernel32.dll+1f3a0
kernel32.dll+21bb0
kernel32.dll+1bb90
kernel32.dll+1a280
kernel32.dll+1a284
kernel32.dll+1e640
kernel32.dll+63a0
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
Writing C:\work\codes\tmp\js01.run.kernel.text...
Done!
@$codecov("kernel")

0:000> !codecov "kernel"
Looking for *kernel*..
The output file C:\work\codes\tmp\js01.run.kernel.text already exists, exiting.
@$codecov("kernel")
```

