// Axel '0vercl0k' Souchet - 2 Feb 2018
//
// Example:
//   0:000> !codecov "kernel"
//   Looking for *kernel*..
//   Found 2 hits
//   Found 7815 unique addresses in C:\WINDOWS\System32\KERNELBASE.dll
//   Found 1260 unique addresses in C:\WINDOWS\System32\KERNEL32.DLL
//   Writing C:\work\codes\tmp\js01.run.kernel.json...
//   0:000> !codecov "kernel"
//   Looking for *kernel*..
//   The output file C:\work\codes\tmp\js01.run.kernel.json already exists, exiting.
//   @$codecov("kernel")
//

'use strict';

const log = host.diagnostics.debugLog;
const logln = p => host.diagnostics.debugLog(p + '\n');
const hex = p => p.toString(16);

function CodeCoverageModule(Module) {
    const CurrentSession = host.currentSession;
    const BaseAddress = Module.BaseAddress;
    const Size = Module.Size;

    const CoverageLines = CurrentSession.TTD.Memory(
        BaseAddress,
        BaseAddress.add(Size),
        'EC'
    );

    const CodeBlocks = [];
    for(const CoverageLine of CoverageLines) {
        const Address = CoverageLine.Address.subtract(BaseAddress).toString(16);
        CodeBlocks.push([
            Address,
            CoverageLine.Size.asNumber()
        ]);
    }

    return {
        'Name' : Module.Name.toLowerCase(),
        'Base' : hex(BaseAddress),
        'Size' : hex(Size),
        'CodeBlocks' : CodeBlocks
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
    const FilePath = TraceDir + '\\' + TraceName + '.' + ModulePattern + '.json';
    if(Utility.FileSystem.FileExists(FilePath)) {
        logln('The output file ' + FilePath + ' already exists, exiting.');
        return;
    }

    const CoverageReport =  {
        'TracePath' : TracePath, 
        'Modules' : []
    };

    logln('Found ' + Modules.Count() + ' hits');
    for(const Module of Modules) {
        const ModuleCoverage = CodeCoverageModule(Module);
        logln('Found ' + ModuleCoverage.CodeBlocks.length + ' unique addresses in ' + Module.Name);
        CoverageReport.Modules.push(ModuleCoverage);
    }

    logln('Writing ' + FilePath + '...');
    const FileHandle = Utility.FileSystem.CreateFile(FilePath, 'CreateAlways');
    const Writer = Utility.FileSystem.CreateTextWriter(FileHandle);
    Writer.WriteLine(JSON.stringify(CoverageReport));
    FileHandle.Close();
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
