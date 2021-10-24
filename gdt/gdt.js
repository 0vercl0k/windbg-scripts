// Axel '0vercl0k' Souchet - October 8 2021

'use strict';

//
// Small reminders from the manual intels on segments in x64:
//   - Because ES, DS, and SS segment registers are not used in 64-bit mode, their fields (base, limit, and attribute) in
//   segment descriptor registers are ignored.
//   - Selector.Index selects one of 8192 descriptors in the GDT or LDT. The processor multiplies
//   the index value by 8 (the number of bytes in a segment descriptor) and adds the result to the base
//   address of the GDT or LDT (from the GDTR or LDTR register, respectively).
//   - The first entry of the GDT is not used by the processor.
//   - The hidden descriptor register fields for FS.base and GS.base are physically mapped to MSRs in order to load all
//   address bits supported by a 64-bit implementation. Software with CPL = 0 (privileged software) can load all
//   supported linear-address bits into FS.base or GS.base using WRMSR.
//

const log = host.diagnostics.debugLog;
const logln = p => log(`${p}\n`);
const hex = p => `0x${p.toString(16)}`;

const GdtSystemEntryTypes = new Map([
    [0, 'Reserved'],
    [1, 'Reserved'],
    [2, 'LDT'],
    [3, 'Reserved'],
    [4, 'Reserved'],
    [5, 'Reserved'],
    [6, 'Reserved'],
    [7, 'Reserved'],
    [8, 'Reserved'],
    [9, 'TSS64 Available'],
    [10, 'Reserved'],
    [11, 'TSS64 Busy'],
    [12, 'CallGate64'],
    [13, 'Reserved'],
    [14, 'InterruptGate64'],
    [15, 'TrapGate64'],
]);

const GdtNonSystemEntryTypes = new Map([
    [0, 'Data Read-Only'],
    [1, 'Data Read-Only Accessed'],
    [2, 'Data Read/Write'],
    [3, 'Data Read/Write Accessed'],
    [4, 'Data Read-Only Expand-Down'],
    [5, 'Data Read-Only Expand-Down Accessed'],
    [6, 'Data Read/Write Expand-Down'],
    [7, 'Data Read/Write Expand-Down Accessed'],
    [8, 'Code Execute-Only'],
    [9, 'Code Execute-Only Accessed'],
    [10, 'Code Execute/Read'],
    [11, 'Code Execute/Read Accessed'],
    [12, 'Code Execute-Only Conforming'],
    [13, 'Code Execute-Only Conforming Accessed'],
    [14, 'Code Execute/Read Conforming'],
    [15, 'Code Execute/Read Conforming Accessed'],
]);

const GdtEntryTypes = new Map([
    [0, GdtSystemEntryTypes],
    [1, GdtNonSystemEntryTypes]
]);

class GdtEntry {
    constructor(Addr) {
        this._Addr = Addr;
        const Entry = host.createPointerObject(Addr, 'nt', '_KGDTENTRY64*');
        const LimitHigh = Entry.Bits.LimitHigh.bitwiseShiftLeft(16);
        const LimitLow = Entry.LimitLow;
        this._Limit = LimitHigh.add(LimitLow);
        // For whatever reason _KGDTENTRY64 is 5 bits long. The intel manuals describes
        // it as 4bits and the 'Descriptor type' bit.
        // We grab the lower 4 bits as the type, and the MSB as the 'Descriptor type'.
        this._Type = Entry.Bits.Type & 15;
        this._NonSystem = (Entry.Bits.Type >> 4) & 1;
        this._TypeS = GdtEntryTypes.get(this._NonSystem).get(this._Type);
        // Note that system descriptors in IA-32e mode are 16 bytes instead
        // of 8 bytes.
        this._Size = 8;
        if (!this._NonSystem && this._TypeS != 'Reserved') {
            this._Size = 16;
        }
        this._Dpl = Entry.Bits.Dpl;
        this._Granularity = Entry.Bits.Granularity;
        this._Present = Entry.Bits.Present;
        this._LongMode = Entry.Bits.LongMode;
        this._DefaultBig = Entry.Bits.DefaultBig;
        const BaseUpper = this._Size == 8 ? 0 : Entry.BaseUpper.bitwiseShiftLeft(32);
        const BaseHigh = Entry.Bytes.BaseHigh.bitwiseShiftLeft(24);
        const BaseMiddle = Entry.Bytes.BaseMiddle.bitwiseShiftLeft(16);
        const BaseLow = Entry.BaseLow;
        this._Base = BaseUpper.add(BaseHigh).add(BaseMiddle).add(BaseLow);
    }

    toString() {
        const Increments = this._Granularity == 1 ? 1024 * 4 : 1;
        // For example, when the granularity flag is set, a limit of 0 results in
        // valid offsets from 0 to 4095.
        const Size = this._Limit * Increments + (this._Granularity ? 0xfff : 0);
        let S = `dt nt!_KGDTENTRY64 ${hex(this._Addr)}
   Base: [${hex(this._Base)} -> ${hex(this._Base.add(Size))}]
   Type: ${this._TypeS} (${hex(this._Type)})
    DPL: ${hex(this._Dpl)}
Present: ${hex(this._Present)}`;
       if (this._TypeS.startsWith('Code')) {
           S += `
   Mode: ${this._LongMode ? '64b' : (this._DefaultBig ? '32b Compat' : '16b Compat')}`
       }
       return S;
    }
}

function DumpGdtEntry(Addr) {
    return new GdtEntry(Addr);
}

function DumpAllGdt() {
    const Registers = host.currentThread.Registers;
    const GdtBase = Registers.Kernel.gdtr;
    const GdtEnd = GdtBase.add(Registers.Kernel.gdtl);
    logln(`Dumping the GDT from ${hex(GdtBase)} to ${hex(GdtEnd)}..`);
    for (let CurrentEntry = GdtBase, Idx = 0;
        CurrentEntry.compareTo(GdtEnd) < 0;
        Idx++) {
        const Entry = DumpGdtEntry(CurrentEntry);
        logln(`[${Idx}]: ${Entry}`);
        CurrentEntry = CurrentEntry.add(Entry._Size);
    }
}

function DumpGdt(Selector) {
    const Registers = host.currentThread.Registers;
    const GdtBase = Registers.Kernel.gdtr;
    const Index = Selector.bitwiseShiftRight(3);
    const Offset = Index.multiply(8);
    const EntryAddress = GdtBase.add(Offset);
    const Entry = DumpGdtEntry(EntryAddress);
    logln(Entry);
}

function Gdt(Selector) {
    const Attributes = host.currentSession.Attributes;
    const IsKernel = Attributes.Target.IsKernelTarget;
    //
    // XXX: Not sure how to do this better?
    // Attributes.Machine.PointerSize is 4 when running in a Wow64 thread :-/.
    //
    let Is64Bit = true;
    try { host.createPointerObject(0, 'nt', '_KGDTENTRY64*'); } catch(e) { Is64Bit = false; }
    if (!IsKernel || !Is64Bit) {
        logln('The running session is not a kernel session or it is not running a 64-bit OS, so exiting');
        return;
    }

    if (Selector == undefined) {
        DumpAllGdt();
    } else {
        DumpGdt(Selector);
    }
}

function initializeScript() {
    return [
        new host.apiVersionSupport(1, 3),
        new host.functionAlias(
            Gdt,
            'gdt'
        ),
    ];
}
