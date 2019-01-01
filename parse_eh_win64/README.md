# parse_eh_win64.js

`parse_eh_win64.js` is a [JavaScript](https://docs.microsoft.com/en-us/windows-hardware/drivers/debugger/javascript-debugger-scripting) debugger extension for WinDbg that shows examples of how to extending the data-model with exception-handling related information for 64 bits executables.

More background is available in this article: [Debugger data model, Javascript & x64 exception handling](https://doar-e.github.io/blog/2017/12/01/debugger-data-model/).

## Usage

Run `.scriptload parse_eh_win64.js` to load the script. The script extends the `Debugger.Models.Process`, `Debugger.Models.Module` models and also exposes the `!ehhandlers` command.

## Examples

* At the process level, dumping `Function` objects and ordering them by the number of exception-handlers they define:

```text
0:002> dx @$curprocess.Functions.OrderByDescending(p => p.ExceptionHandlers.Count())
@$curprocess.Functions.OrderByDescending(p => p.ExceptionHandlers.Count())                
    [0x0]            : RVA:7fffb64bebf0 -> RVA:7fffb64bf022, 12 exception handlers
    [0x1]            : RVA:7fffb8bdff80 -> RVA:7fffb8be0b67, 11 exception handlers
    [0x2]            : RVA:7fffb1df8114 -> RVA:7fffb1df8360, 9 exception handlers
    [0x3]            : RVA:7fffa0111354 -> RVA:7fffa01115a0, 9 exception handlers
    [0x4]            : RVA:7fffb2183044 -> RVA:7fffb2183290, 9 exception handlers
    [0x5]            : RVA:7fffa0d41344 -> RVA:7fffa0d41590, 9 exception handlers
    [0x6]            : RVA:7fffb6573020 -> RVA:7fffb6573356, 6 exception handlers
    [0x7]            : RVA:7fffb4c71f94 -> RVA:7fffb4c720b4, 6 exception handlers
    [0x8]            : RVA:7fffb65e5774 -> RVA:7fffb65e5894, 6 exception handlers
    [0x9]            : RVA:7fffb660c62c -> RVA:7fffb660cf2e, 6 exception handlers
    [0xa]            : RVA:7fffb6c6f014 -> RVA:7fffb6c6f134, 6 exception handlers
    [0xb]            : RVA:7fffb8b9a350 -> RVA:7fffb8b9b39b, 6 exception handlers
    [0xc]            : RVA:7fffb35168a0 -> RVA:7fffb3516efb, 5 exception handlers
```

* Dumping a `Function` object:

```text
0:002> dx -r1 @$curprocess.Functions[0]
@$curprocess.Functions[0]                 : RVA:7ff67025a6d0 -> RVA:7ff67025a738, 1 exception handlers
    EHHandlerRVA     : 0x9b9700
    EHHandler        : 0x7ff6708f9700
    BeginRVA         : 0x31a6d0
    EndRVA           : 0x31a738
    Begin            : 0x7ff67025a6d0
    End              : 0x7ff67025a738
    ExceptionHandlers :   __try {7ff67025a6fb -> 7ff67025a712} __except(EXCEPTION_EXECUTE_HANDLER) {7ff67025a736}
```

* At the module level, dumping `ExceptionHandler` objects:

```text
0:002> dx @$curprocess.Modules[0].ExceptionHandlers
@$curprocess.Modules[0].ExceptionHandlers                 : Exception handlers
    [0x0]            :   __try {7ff67025a6fb -> 7ff67025a712} __except(EXCEPTION_EXECUTE_HANDLER) {7ff67025a736}
    [0x1]            :   __try {7ff6708f80b3 -> 7ff6708f813e} __except(7ff6708f93f2()) {7ff6708f813e}
    [0x2]            :   __try {7ff6708f90fd -> 7ff6708f9202} __except(7ff6708f9425()) {7ff6708f9202}
    [0x3]            :   __try {7ff6708f9236 -> 7ff
```

* Dumping an `ExceptionHandler` object:

```text
0:002> dx @$curprocess.Modules[0].ExceptionHandlers[0]
@$curprocess.Modules[0].ExceptionHandlers[0]                 :   __try {7ff67025a6fb -> 7ff67025a712} __except(EXCEPTION_EXECUTE_HANDLER) {7ff67025a736}
    Begin            : 0x7ff67025a6fb
    End              : 0x7ff67025a712
    HandlerAddress   : 0x1
    JumpTarget       : 0x7ff67025a736
    IsTryFinally     : false
    HasFilter        : false
```

* Dumping the current call-stack with EH information:

```text
0:002> !ehhandlers
5 stack frames, scanning for handlers...
Frame 1: EHHandler: 7fffb8c1fc90: ntdll!_C_specific_handler:
              Except: 7fffb8c5ef1d: ntdll!DbgUiRemoteBreakin+0x4d:
Frame 3: EHHandler: 7fffb8c1fc90: ntdll!_C_specific_handler:
              Except: 7fffb8bfa267: ntdll!RtlUserThreadStart+0x37:
              Filter: 7fffb8c38021: ntdll!RtlUserThreadStart$filt$0:
@$ehhandlers()  
```

