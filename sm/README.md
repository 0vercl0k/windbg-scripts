# sm.js

`sm.js` is a [JavaScript](https://docs.microsoft.com/en-us/windows-hardware/drivers/debugger/javascript-debugger-scripting) debugger extension for WinDbg that allows to dump both `js::Value` and `JSObject` [Spidermonkey](https://github.com/mozilla/gecko-dev/tree/master/js) objects. It works on crash-dumps, live debugging, and TTD traces.

The extension detects automatically if it is running from the [Javascript shell](https://github.com/mozilla/gecko-dev/tree/master/js/src/shell) (in which case `js.exe` is the module hosting the JavaScript engine code) or from Firefox directly (in which case `xul.dll` is the module hosting the JavaScript engine code). Private symbol information for the module hosting the JavaScript engine code is required. It only supports x64 version of spidermonkey.

It has been used and tested against spidermonkey during end of 2018 - but should work fine on newer versions assuming core data-structures haven't changed a whole lot (and if they do, it should be fairly easy to adapt anyway).

## Usage

Run `.scriptload sm.js` to load the script. You can dump `js::Value` with `!smdump_jsvalue` and `JSObject` with `!smdump_jsobject`. You can insert a software breakpoint in a JIT buffer with `!ion_insertbp` and `!in_nursery` to figure out if an object lives inside the Nursery heap.

## Examples

* Dumping the `js::Value` associated to the following JavaScript object `['short', 13.37, new Map([[ 1, 'one' ],[ 2, 'two' ]]), ['loooooooooooooooooooooooooooooong', [0x1337, {doare:'in d4 place'}]], false, null, undefined, true, Math.atan2, Math]`:

```text
0:000> !smdump_jsvalue vp[2].asBits_
1e5f10024c0: js!js::ArrayObject:   Length: 10
1e5f10024c0: js!js::ArrayObject: Capacity: 10
1e5f10024c0: js!js::ArrayObject:  Content: ['short', 13.37, new Map(...), ['loooooooooooooooooooooooooooooong', [0x1337, {'doare' : 'in d4 place'}]], false, null, undefined, true, atan2(), Math]
@$smdump_jsvalue(vp[2].asBits_)
```

* Setting a breakpoint in code being JIT'd by IonMonkey:

```text
0:008> g
Breakpoint 0 hit
js!js::jit::CodeGenerator::visitBoundsCheck:
00007ff7`87d9e1a0 4156            push    r14

0:000> !ion_insertbp
unsigned char 0xcc ''
unsigned int64 0x5b
@$ion_insertbp()

0:000> g
(1a60.f58): Break instruction exception - code 80000003 (first chance)
000003d9`ca67991b cc              int     3

0:000> u . l2
000003d9`ca67991b cc              int     3
000003d9`ca67991c 3bd8            cmp     ebx,eax
```

* Figure out if an object lives in the Nursery heap:

```text
0:008> !in_nursery 0x19767e00df8
Using previously cached JSContext @0x000001fe17318000
0x000001fe1731cde8: js::Nursery
 ChunkCountLimit: 0x0000000000000010 (16 MB)
        Capacity: 0x0000000000fffe80 bytes
    CurrentChunk: 0x0000019767e00000
        Position: 0x0000019767e00eb0
          Chunks:
            00: [0x0000019767e00000 - 0x0000019767efffff]
            01: [0x00001fa2aee00000 - 0x00001fa2aeefffff]
            02: [0x0000115905000000 - 0x00001159050fffff]
            03: [0x00002fc505200000 - 0x00002fc5052fffff]
            04: [0x000020d078700000 - 0x000020d0787fffff]
            05: [0x0000238217200000 - 0x00002382172fffff]
            06: [0x00003ff041f00000 - 0x00003ff041ffffff]
            07: [0x00001a5458700000 - 0x00001a54587fffff]
-------
0x19767e00df8 has been found in the js::NurseryChunk @0x19767e00000!

0:008> !in_nursery 0x00001fe174be810
Using previously cached JSContext @0x000001fe17318000
0x000001fe1731cde8: js::Nursery
 ChunkCountLimit: 0x0000000000000010 (16 MB)
        Capacity: 0x0000000000fffe80 bytes
    CurrentChunk: 0x0000019767e00000
        Position: 0x0000019767e00eb0
          Chunks:
            00: [0x0000019767e00000 - 0x0000019767efffff]
            01: [0x00001fa2aee00000 - 0x00001fa2aeefffff]
            02: [0x0000115905000000 - 0x00001159050fffff]
            03: [0x00002fc505200000 - 0x00002fc5052fffff]
            04: [0x000020d078700000 - 0x000020d0787fffff]
            05: [0x0000238217200000 - 0x00002382172fffff]
            06: [0x00003ff041f00000 - 0x00003ff041ffffff]
            07: [0x00001a5458700000 - 0x00001a54587fffff]
-------
0x1fe174be810 hasn't been found be in any Nursery js::NurseryChunk.
```
