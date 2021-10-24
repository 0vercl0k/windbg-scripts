# gdt.js

`gdt.js` is a [JavaScript](https://docs.microsoft.com/en-us/windows-hardware/drivers/debugger/javascript-debugger-scripting) debugger extension for WinDbg that dumps the [Global Descriptor Table](https://wiki.osdev.org/Global_Descriptor_Table) on 64-bit kernels. I wrote this extension because I always find the output of the `dg` command confusing, if not broken.


## Usage

Run `.scriptload gdt.js` to load the script. You can dump a specific entry by passing the segment selector to the `!gdt` command, or it will dump the entire table if nothing is passed. Run `!wow64exts.sw` if you are running the script while being in the context of a [WoW64](https://docs.microsoft.com/en-us/windows/win32/winprog64/wow64-implementation-details) thread.

## Examples

* Dumping the GDT entry that enables [WoW64](https://docs.microsoft.com/en-us/windows/win32/winprog64/wow64-implementation-details):
```
32.kd> !gdt @cs
dt nt!_KGDTENTRY64 0xfffff8045215dfd0
   Base: [0x0 -> 0xffffffff]
   Type: Code Execute/Read Accessed (0xb)
    DPL: 0x3
Present: 0x1
   Mode: 32b Compat
@$gdt(@cs)

32.kd> dg @cs
                                                    P Si Gr Pr Lo
Sel        Base              Limit          Type    l ze an es ng Flags
---- ----------------- ----------------- ---------- - -- -- -- -- --------
0023 00000000`00000000 00000000`ffffffff Code RE Ac 3 Bg Pg P  Nl 00000cfb
```

* Dumping the GDT entry that allows 32-bit code to invoke 64-bit code:
```
32.kd> !gdt 0x33
dt nt!_KGDTENTRY64 0xfffff8045215dfe0
   Base: [0x0 -> 0x0]
   Type: Code Execute/Read Accessed (0xb)
    DPL: 0x3
Present: 0x1
   Mode: 64b
@$gdt(0x33)

32.kd> dg 33
                                                    P Si Gr Pr Lo
Sel        Base              Limit          Type    l ze an es ng Flags
---- ----------------- ----------------- ---------- - -- -- -- -- --------
0033 00000000`00000000 00000000`00000000 Code RE Ac 3 Nb By P  Lo 000002fb
```

* Dumping the [Task State Segment](https://wiki.osdev.org/Task_State_Segment):
```
32.kd> !gdt @tr
dt nt!_KGDTENTRY64 0xfffff8045215dff0
   Base: [0xfffff8045215c000 -> 0xfffff8045215c067]
   Type: TSS64 Busy (0xb)
    DPL: 0x0
Present: 0x1
@$gdt(@tr)

32.kd> dg @tr
                                                    P Si Gr Pr Lo
Sel        Base              Limit          Type    l ze an es ng Flags
---- ----------------- ----------------- ---------- - -- -- -- -- --------
0040 00000000`5215c000 00000000`00000067 TSS32 Busy 0 Nb By P  Nl 0000008b
```

* Dumping the [Thread Environment Block](https://en.wikipedia.org/wiki/Win32_Thread_Information_Block) of a [WoW64](https://docs.microsoft.com/en-us/windows/win32/winprog64/wow64-implementation-details) thread:
```
32.kd> !gdt @fs
dt nt!_KGDTENTRY64 0xfffff8045215e000
   Base: [0x326000 -> 0x329c00]
   Type: Data Read/Write Accessed (0x3)
    DPL: 0x3
Present: 0x1
@$gdt(@fs)

32.kd> !teb
Wow64 TEB32 at 0000000000326000
    ExceptionList:        00000000004ff59c
    StackBase:            0000000000500000
    StackLimit:           00000000004f2000
    SubSystemTib:         0000000000000000
    FiberData:            0000000000001e00
    ArbitraryUserPointer: 0000000000000000
    Self:                 0000000000326000
    EnvironmentPointer:   0000000000000000
    ClientId:             0000000000001ad8 . 0000000000001adc
    RpcHandle:            0000000000000000
    Tls Storage:          0000000000834188
    PEB Address:          0000000000323000
    LastErrorValue:       0
    LastStatusValue:      c000007c
    Count Owned Locks:    0
    HardErrorMode:        0
```
* Dumping the entire GDT on a Windows 10 64-bit Virtual Machine:
```
32.kd> !gdt
Dumping the GDT from 0xfffff8045215dfb0 to 0xfffff8045215e007..
[0]: dt nt!_KGDTENTRY64 0xfffff8045215dfb0
   Base: [0x0 -> 0x0]
   Type: Reserved (0x0)
    DPL: 0x0
Present: 0x0
[1]: dt nt!_KGDTENTRY64 0xfffff8045215dfb8
   Base: [0x0 -> 0x0]
   Type: Reserved (0x0)
    DPL: 0x0
Present: 0x0
[2]: dt nt!_KGDTENTRY64 0xfffff8045215dfc0
   Base: [0x0 -> 0x0]
   Type: Code Execute/Read Accessed (0xb)
    DPL: 0x0
Present: 0x1
   Mode: 64b
[3]: dt nt!_KGDTENTRY64 0xfffff8045215dfc8
   Base: [0x0 -> 0x0]
   Type: Data Read/Write Accessed (0x3)
    DPL: 0x0
Present: 0x1
[4]: dt nt!_KGDTENTRY64 0xfffff8045215dfd0
   Base: [0x0 -> 0xffffffff]
   Type: Code Execute/Read Accessed (0xb)
    DPL: 0x3
Present: 0x1
   Mode: 32b Compat
[5]: dt nt!_KGDTENTRY64 0xfffff8045215dfd8
   Base: [0x0 -> 0xffffffff]
   Type: Data Read/Write Accessed (0x3)
    DPL: 0x3
Present: 0x1
[6]: dt nt!_KGDTENTRY64 0xfffff8045215dfe0
   Base: [0x0 -> 0x0]
   Type: Code Execute/Read Accessed (0xb)
    DPL: 0x3
Present: 0x1
   Mode: 64b
[7]: dt nt!_KGDTENTRY64 0xfffff8045215dfe8
   Base: [0x0 -> 0x0]
   Type: Reserved (0x0)
    DPL: 0x0
Present: 0x0
[8]: dt nt!_KGDTENTRY64 0xfffff8045215dff0
   Base: [0xfffff8045215c000 -> 0xfffff8045215c067]
   Type: TSS64 Busy (0xb)
    DPL: 0x0
Present: 0x1
[9]: dt nt!_KGDTENTRY64 0xfffff8045215e000
   Base: [0x326000 -> 0x329c00]
   Type: Data Read/Write Accessed (0x3)
    DPL: 0x3
Present: 0x1
@$gdt()
```