# windbg-scripts

`windbg-scripts` is a collection of [JavaScript](https://docs.microsoft.com/en-us/windows-hardware/drivers/debugger/javascript-debugger-scripting) debugger extensions  for WinDbg.

* [basics](basics/): various examples of basic usage of various APIs,
* [parse_eh_win64](parse_eh_win64/): example of extending the data-model with exception handling related information (cf [Debugger data model, Javascript & x64 exception handling](https://doar-e.github.io/blog/2017/12/01/debugger-data-model/)),
* [telescope](telescope/): [telescope](https://gef.readthedocs.io/en/latest/commands/dereference/) like command for WinDbg,
* [sm](sm/): pretty-printing of Spidermonkey `js::Value` and `JSObject` objects,
* [codecov](codecov/): extract code-coverage out of a [TTD](https://docs.microsoft.com/en-us/windows-hardware/drivers/debugger/time-travel-debugging-overview) trace,
* [policybuffer](policybuffer/): disassemble a Chrome policy buffer program,
* [gdt](gdt/): dump the [Global Descriptor Table](https://wiki.osdev.org/Global_Descriptor_Table).

## Installing the script gallery

If you would like to have `telescope` and `sm` loaded every time your debugger starts instead of loading the extensions manually follow the below steps:

1. Clone this GitHub repository,

2. Edit the `Manifest\config.xml` file and update the `LocalCacheRootFolder` path with a value that makes sense,

3. Open the debugger and import the gallery by running `.settings load c:\path\where\cloned\windbg-scripts\Manifest\config.xml` and `.settings save`.

4. Restart the debugger and you should be able to run `!telescope` as well as inspecting the gallery content from the data-model.

   ```text
   0:000> dx -r1 Debugger.State.ExtensionGallery.ExtensionRepositories
   Debugger.State.ExtensionGallery.ExtensionRepositories                
       [0x0]            : overgallery
       [0x1]            : LocalInstalled
   
   0:000> dx -r1 Debugger.State.ExtensionGallery.ExtensionRepositories[0]
   Debugger.State.ExtensionGallery.ExtensionRepositories[0]                 : overgallery
       Name             : overgallery
       ManifestVersion  : 0x1
       URL             
       Enabled          : true
       Packages        
   
   0:000> dx -r1 Debugger.State.ExtensionGallery.ExtensionRepositories[0].Packages
   Debugger.State.ExtensionGallery.ExtensionRepositories[0].Packages                
       [0x0]            : Telescope
   
   0:000> dx -r1 Debugger.State.ExtensionGallery.ExtensionRepositories[0].Packages[0]
   Debugger.State.ExtensionGallery.ExtensionRepositories[0].Packages[0]                 : Telescope
       Name             : Telescope
       Version          : 1.0.0.1
       Description      : Telescope data dereference
       Size             : 0
       IsDownloaded     : true
       Components      
   ```
