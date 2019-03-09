// Axel '0vercl0k' Souchet - 5 March 2019
// sandbox::PolicyBase::EvalPolicy

'use strict';

//
// Utility functions.
//

const Log = host.diagnostics.debugLog;
const Logln = p => host.diagnostics.debugLog(p + '\n');
const Hex = p => '0x' + p.toString(16);
const ReadWstring = p => host.memory.readWideString(p);

function ReadShort(Address) {
    let Value = null;
    try {
        Value = host.memory.readMemoryValues(
           Address, 1, 2
        )[0];
    } catch(e) {
    }

    return Value;
}

function ReadDword(Address) {
    let Value = null;
    try {
        Value = host.memory.readMemoryValues(
           Address, 1, 4
        )[0];
    } catch(e) {
    }

    return Value;
}

function ReadQword(Address) {
    let Value = null;
    try {
        Value = host.memory.readMemoryValues(
           Address, 1, 8
        )[0];
    } catch(e) {
    }

    return Value;
}

function initializeScript() {
    return [
        new host.apiVersionSupport(1, 3)
    ];
}

//
// Constants.
//

// The low-level policy is implemented using the concept of policy 'opcodes'.
// An opcode is a structure that contains enough information to perform one
// comparison against one single input parameter. For example, an opcode can
// encode just one of the following comparison:
//
// - Is input parameter 3 not equal to NULL?
// - Does input parameter 2 start with L"c:\\"?
// - Is input parameter 5, bit 3 is equal 1?
//
// Each opcode is in fact equivalent to a function invocation where all
// the parameters are known by the opcode except one. So say you have a
// function of this form:
//      bool fn(a, b, c, d)  with 4 arguments
//
// Then an opcode is:
//      op(fn, b, c, d)
// Which stores the function to call and its 3 last arguments
//
// Then and opcode evaluation is:
//      op.eval(a)  ------------------------> fn(a,b,c,d)
//                        internally calls
//
// The idea is that complex policy rules can be split into streams of
// opcodes which are evaluated in sequence. The evaluation is done in
// groups of opcodes that have N comparison opcodes plus 1 action opcode:
//
// [comparison 1][comparison 2]...[comparison N][action][comparison 1]...
//    ----- evaluation order----------->
//
// Each opcode group encodes one high-level policy rule. The rule applies
// only if all the conditions on the group evaluate to true. The action
// opcode contains the policy outcome for that particular rule.

// https://dxr.mozilla.org/mozilla-central/source/security/sandbox/chromium/sandbox/win/src/policy_engine_opcodes.h#77
// The following are the implemented opcodes.
// enum OpcodeID {
// OP_ALWAYS_FALSE,  // Evaluates to false (EVAL_FALSE).
// OP_ALWAYS_TRUE,  // Evaluates to true (EVAL_TRUE).
// OP_NUMBER_MATCH,  // Match a 32-bit integer as n == a.
// OP_NUMBER_MATCH_RANGE,  // Match a 32-bit integer as a <= n <= b.
// OP_NUMBER_AND_MATCH,  // Match using bitwise AND; as in: n & a != 0.
// OP_WSTRING_MATCH,  // Match a string for equality.
// OP_ACTION  // Evaluates to an action opcode.
// };

const OP_ALWAYS_FALSE = 0;
const OP_ALWAYS_TRUE = 1;
const OP_NUMBER_MATCH = 2;
const OP_NUMBER_MATCH_RANGE = 3;
const OP_NUMBER_AND_MATCH = 4;
const OP_WSTRING_MATCH = 5;
const OP_ACTION = 6;

const Opcodes = {
    [OP_ALWAYS_FALSE] : 'OP_ALWAYS_FALSE',
    [OP_ALWAYS_TRUE] : 'OP_ALWAYS_TRUE',
    [OP_NUMBER_MATCH] : 'OP_NUMBER_MATCH',
    [OP_NUMBER_MATCH_RANGE] : 'OP_NUMBER_MATCH_RANGE',
    [OP_NUMBER_AND_MATCH] : 'OP_NUMBER_AND_MATCH',
    [OP_WSTRING_MATCH] : 'OP_WSTRING_MATCH',
    [OP_ACTION] : 'OP_ACTION'
};

// https://dxr.mozilla.org/mozilla-central/source/security/sandbox/chromium/sandbox/win/src/policy_engine_opcodes.h
// enum StringMatchOptions {
//  CASE_SENSITIVE = 0,      // Pay or Not attention to the case as defined by
//  CASE_INSENSITIVE = 1,    // RtlCompareUnicodeString windows API.
//  EXACT_LENGHT = 2         // Don't do substring match. Do full string match.
// };

const MatchingOptions = {
    0 : 'CASE_SENSITIVE',
    1 : 'CASE_INSENSITIVE',
    2 : 'EXACT_LENGTH',
    3 : 'EXACT_LENGTH | CASE_INSENSITIVE'
};

// These are the possible policy outcomes. Note that some of them might
// not apply and can be removed. Also note that The following values only
// specify what to do, not how to do it and it is acceptable given specific
// cases to ignore the policy outcome.
// enum EvalResult {
//   // Comparison opcode values:
//   EVAL_TRUE,   // Opcode condition evaluated true.
//   EVAL_FALSE,  // Opcode condition evaluated false.
//   EVAL_ERROR,  // Opcode condition generated an error while evaluating.
//   // Action opcode values:
//   ASK_BROKER,  // The target must generate an IPC to the broker. On the broker
//                // side, this means grant access to the resource.
//   DENY_ACCESS,   // No access granted to the resource.
//   GIVE_READONLY,  // Give readonly access to the resource.
//   GIVE_ALLACCESS,  // Give full access to the resource.
//   GIVE_CACHED,  // IPC is not required. Target can return a cached handle.
//   GIVE_FIRST,  // TODO(cpu)
//   SIGNAL_ALARM,  // Unusual activity. Generate an alarm.
//   FAKE_SUCCESS,  // Do not call original function. Just return 'success'.
//   FAKE_ACCESS_DENIED,  // Do not call original function. Just return 'denied'
//                        // and do not do IPC.
//   TERMINATE_PROCESS,  // Destroy target process. Do IPC as well.
// };

const Actions = {
    3 : 'ASK_BROKER',
    4 : 'DENY_ACCESS',
    5 : 'GIVE_READONLY',
    6 : 'GIVE_ALLACCESS',
    7 : 'GIVE_CACHED',
    8 : 'GIVE_FIRST',
    9 : 'SIGNAL_ALARM',
    10 : 'FAKE_SUCCESS',
    11 : 'FACE_ACCESS_DENIED',
    12 : 'TERMINATE_PROCESS'
};

// https://dxr.mozilla.org/mozilla-central/source/security/sandbox/chromium/sandbox/win/src/internal_types.h#19
// enum ArgType {
//   INVALID_TYPE = 0,
//   WCHAR_TYPE,
//   UINT32_TYPE,
//   UNISTR_TYPE,
//   VOIDPTR_TYPE,
//   INPTR_TYPE,
//   INOUTPTR_TYPE,
//   LAST_TYPE
// };

const ArgTypes = {
    0 : 'INVALID_TYPE',
    1 : 'WCHAR_TYPE',
    2 : 'UINT32_TYPE',
    3 : 'UNISTR_TYPE',
    4 : 'VOIDPTR_TYPE',
    5 : 'INPTR_TYPE',
    6 : 'INOUTPTR_TYPE',
    7 : 'LAST_TYPE'
};

// Options that apply to every opcode. They are specified when creating
// each opcode using OpcodeFactory::MakeOpXXXXX() family of functions
// Do nothing special.
const kPolNone = 0;

// Convert EVAL_TRUE into EVAL_FALSE and vice-versa. This allows to express
// negated conditions such as if ( a && !b).
const kPolNegateEval = 1;

// Zero the MatchContext context structure. This happens after the opcode
// is evaluated.
const kPolClearContext = 2;

// Use OR when evaluating this set of opcodes. The policy evaluator by default
// uses AND when evaluating. Very helpful when
// used with kPolNegateEval. For example if you have a condition best expressed
// as if(! (a && b && c)), the use of this flags allows it to be expressed as
// if ((!a) || (!b) || (!c)).
const kPolUseOREval = 4;

// https://dxr.mozilla.org/mozilla-central/source/security/sandbox/chromium/sandbox/win/src/policy_params.h#36
const ParameterNames = {
    'OpenFile' : [
        'NAME', 'BROKER', 'ACCESS', 'DISPOSITION', 'OPTIONS'
    ],
};

//
// Code.
//

function DisassPolicyBuffer(PolicyBufferAddress, PolicyType) {
    let Ptr = PolicyBufferAddress;
    const PolicyBufferOpcodeCount = ReadQword(Ptr);
    Ptr += 8;
    for(let Idx = 0; Idx < PolicyBufferOpcodeCount; ++Idx) {

        //
        // Save off the current pointer as it is useful to compute
        // where the stored string is in memory for the OP_WSTRING_MATCH
        // opcode.
        //

        const OpcodePtr = Ptr;

        //
        // Unpack the opcode structure.
        //

        const OpcodeId = ReadDword(Ptr);
        Ptr += 4;
        const SelectedParameter = ReadShort(Ptr);
        Ptr += 2;
        const Options = ReadShort(Ptr);
        Ptr += 2;
        const Parameters = [];
        for(let InnerIdx = 0; InnerIdx < 4; ++InnerIdx) {
            Parameters.push(ReadQword(Ptr));
            Ptr += 8;
        }

        //
        // Once we dumped the opcode, let's prettify its parameters.
        //

        const Operands = [];
        let FirstOperand = 'Param' + SelectedParameter;
        if(ParameterNames[PolicyType] != undefined) {
            FirstOperand = PolicyType + '::' + ParameterNames[PolicyType][SelectedParameter];
        }

        Operands.push(FirstOperand);
        if(OpcodeId == OP_ALWAYS_TRUE || OpcodeId == OP_ALWAYS_FALSE) {
        } else if(OpcodeId == OP_NUMBER_MATCH) {
            const ArgType = ArgTypes[Parameters[1].asNumber()];
            Operands.push(ArgType + '(' + Hex(Parameters[0]) + ')');
        } else if(OpcodeId == OP_NUMBER_MATCH_RANGE) {
            Operands.push('LowerBound(' + Hex(Parameters[0]) + ')');
            Operands.push('UpperBound(' + Hex(Parameters[1]) + ')');
        } else if(OpcodeId == OP_NUMBER_AND_MATCH) {
            Operands.push(Hex(Parameters[0]));
        }else if(OpcodeId == OP_WSTRING_MATCH) {
            const Displacement = Parameters[0];
            const StringAddress = OpcodePtr.add(Displacement);
            Operands.push('"' + ReadWstring(StringAddress) + '"');
            Operands.push('Length(' + Hex(Parameters[1]) + ')');
            Operands.push('Offset(' + Hex(Parameters[2]) + ')');
            const MatchingOption = Parameters[3].asNumber();
            Operands.push(MatchingOptions[MatchingOption]);
        } else if(OpcodeId == OP_ACTION) {

            //
            // The OP_ACTION is the only opcode that does not need a selected
            // parameter.
            //

            const Action = Actions[Parameters[0].asNumber()];
            Operands[0] = Action;
        }

        //
        // Display the opcode and its operands.
        //

        const OpcodeIdStr = Opcodes[OpcodeId];
        if(Options.bitwiseAnd(kPolNegateEval).compareTo(0) != 0) {
            Logln('!' + OpcodeIdStr + '<' + Operands.join(', ')  + '>');
        } else {
            Logln(OpcodeIdStr + '<' + Operands.join(', ')  + '>');
        }

        if(OpcodeId == OP_ACTION) {
            Logln('');
        }
    }
}

function initializeScript() {
    return [
        new host.apiVersionSupport(1, 3),
        new host.functionAlias(
            DisassPolicyBuffer,
            'disasspolicy'
        )
    ];
}

