// Axel '0vercl0k' Souchet - 2 Feb 2018
//
// Example:
//   0:000> !codecov "kernel"
//   Looking for *kernel*..
//   Found 2 hits
//   Found 7815 unique addresses in C:\WINDOWS\System32\KERNELBASE.dll
//   Found 1260 unique addresses in C:\WINDOWS\System32\KERNEL32.DLL
//   Writing C:\work\codes\tmp\js01.run.kernel.text...
//   Done!
//   @$codecov("kernel")
//   0:000> !codecov "kernel"
//   Looking for *kernel*..
//   The output file C:\work\codes\tmp\js01.run.kernel.text already exists, exiting.
//   @$codecov("kernel")
//

'use strict';

const log = host.diagnostics.debugLog;
const logln = p => host.diagnostics.debugLog(p + '\n');
const hex = p => p.toString(16);

function ExtractModuleName(ModulePath) {
    return ModulePath.slice(
        ModulePath.lastIndexOf('\\') + 1
    );
}

function CodeCoverageModule(Module) {
    const CurrentSession = host.currentSession;
    const BaseAddress = Module.BaseAddress;
    const Size = Module.Size;

    const CoverageLines = CurrentSession.TTD.Memory(
        BaseAddress,
        BaseAddress.add(Size),
        'EC'
    );

    const Offsets = Array.from(CoverageLines).map(
        p => hex(
            p.Address.subtract(BaseAddress)
        )
    );

    return {
        'Path' : Module.Name.toLowerCase(),
        'Base' : BaseAddress,
        'Size' : Size,
        'Offsets' : Offsets
    };
}

function CodeCov(ModulePattern) {
    const CurrentSession = host.currentSession;
    const CurrentProcess = host.currentProcess;
    const Utility = host.namespace.Debugger.Utility;

    if(!CurrentSession.Attributes.Target.IsTTDTarget) {
        logln('!codecov expects a TTD trace');
        return;
    }

    if(ModulePattern == undefined) {
        logln('!codecov "pattern"');
        return;
    }

    ModulePattern = ModulePattern.toLowerCase();
    logln('Looking for *' + ModulePattern + '*..');
    const Modules = CurrentProcess.Modules.Where(
        p => p.Name.toLowerCase().indexOf(ModulePattern) != -1
    );

    if(Modules.Count() == 0) {
        logln('Could not find any matching module, exiting');
        return;
    }

    const TracePath = CurrentSession.Attributes.Target.Details.DumpFileName;
    const TraceDir = TracePath.slice(
        0,
        TracePath.lastIndexOf('\\')
    );
    const TraceName = TracePath.slice(
        TracePath.lastIndexOf('\\') + 1
    );
    const FilePath = TraceDir + '\\' + TraceName + '.' + ModulePattern + '.txt';
    if(Utility.FileSystem.FileExists(FilePath)) {
        logln('The output file ' + FilePath + ' already exists, exiting.');
        return;
    }

    const Metadata = {
        'TracePath' : TracePath
    };

    const CoverageModules = [];
    logln('Found ' + Modules.Count() + ' hits');
    for(const Module of Modules) {
        const ModuleCoverage = CodeCoverageModule(Module);
        logln('Found ' + ModuleCoverage.Offsets.length + ' unique addresses in ' + Module.Name);
        CoverageModules.push(ModuleCoverage);
    }

    logln('Writing ' + FilePath + '...');
    const FileHandle = Utility.FileSystem.CreateFile(FilePath, 'CreateAlways');
    const Writer = Utility.FileSystem.CreateTextWriter(FileHandle);
    for(const [Name, Value] of Object.entries(Metadata)) {
        Writer.WriteLine('; ' + Name + ': ' + Value);
    }

    for(const Module of CoverageModules) {

        //
        // First write the metadata that is module specific.
        //

        Writer.WriteLine('; ' + Module.Path + ', ' + hex(Module.Base) + ', ' + hex(Module.Size));

        //
        // Write down the offsets.
        //

        const ModuleName = ExtractModuleName(Module.Path);
        for(const Offset of Module.Offsets) {
            Writer.WriteLine(ModuleName + '+' + hex(Offset));
        }
    }

    FileHandle.Close();
    logln('Done!');
}

function initializeScript() {
    return [
        new host.apiVersionSupport(1, 2),
        new host.functionAlias(
            CodeCov,
            'codecov'
        )
    ];
}
