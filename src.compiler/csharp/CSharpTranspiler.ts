import * as ts from 'typescript';
import emit from './CSharpEmitter';

function createDiagnosticReporter(pretty?: boolean): ts.DiagnosticReporter {
    const host: ts.FormatDiagnosticsHost = {
        getCurrentDirectory: () => ts.sys.getCurrentDirectory(),
        getNewLine: () => ts.sys.newLine,
        getCanonicalFileName: ts.sys.useCaseSensitiveFileNames
            ? x => x
            : x => x.toLowerCase(),
    };

    if (!pretty) {
        return diagnostic => ts.sys.write(ts.formatDiagnostic(diagnostic, host));
    }

    return diagnostic => {
        ts.sys.write(ts.formatDiagnosticsWithColorAndContext([diagnostic], host) + host.getNewLine());
    };
}

const commandLine = ts.parseCommandLine(ts.sys.args);
if (!ts.sys.fileExists(commandLine.options.project!)) {
    ts.sys.exit(ts.ExitStatus.InvalidProject_OutputsSkipped);
}

let reportDiagnostic = createDiagnosticReporter();

const parseConfigFileHost: ts.ParseConfigFileHost = <any>ts.sys;
parseConfigFileHost.onUnRecoverableConfigFileDiagnostic = diagnostic => {
    reportDiagnostic(diagnostic);
    ts.sys.exit(ts.ExitStatus.InvalidProject_OutputsSkipped);
};

const parsedCommandLine = ts.getParsedCommandLineOfConfigFile(commandLine.options.project!, commandLine.options, parseConfigFileHost, /*extendedConfigCache*/ undefined, commandLine.watchOptions)!;
const pretty = !!ts.sys.writeOutputIsTTY && ts.sys.writeOutputIsTTY();
if (pretty) {
    reportDiagnostic = createDiagnosticReporter(true);
}

const program = ts.createProgram({
    rootNames: parsedCommandLine.fileNames,
    options: parsedCommandLine.options,
    projectReferences: parsedCommandLine.projectReferences,
    host: ts.createCompilerHost(parsedCommandLine.options),
});

const allDiagnostics = program.getConfigFileParsingDiagnostics().slice();
const configFileParsingDiagnosticsLength = allDiagnostics.length;
allDiagnostics.push(...program.getSyntacticDiagnostics());

if (allDiagnostics.length === configFileParsingDiagnosticsLength) {
    allDiagnostics.push(...program.getOptionsDiagnostics());
    allDiagnostics.push(...program.getGlobalDiagnostics());
    allDiagnostics.push(...program.getSemanticDiagnostics());
}

const emitDiagnostics = emit(program);
allDiagnostics.push(...emitDiagnostics);

let diagnostics = ts.sortAndDeduplicateDiagnostics(allDiagnostics);
let errorCount = 0;
let warningCount = 0;
diagnostics.forEach(d => {
    switch (d.category) {
        case ts.DiagnosticCategory.Error: errorCount++; break;
        case ts.DiagnosticCategory.Warning: warningCount++; break;
    }
    reportDiagnostic(d);
});

if (pretty) {
    reportDiagnostic({
        file: undefined,
        start: undefined,
        length: undefined,
        code: 6194,
        messageText:`Compilation completed with ${errorCount} errors and ${warningCount} warnings${ts.sys.newLine}`,
        category: errorCount > 0 ? ts.DiagnosticCategory.Error : warningCount > 0 ? ts.DiagnosticCategory.Warning : ts.DiagnosticCategory.Message,
    });
}

if (errorCount > 0) {
    ts.sys.exit(ts.ExitStatus.DiagnosticsPresent_OutputsGenerated);
} else {
    ts.sys.exit(ts.ExitStatus.Success);
}