/**
 * Doesent Work!!
 */
macro $__moduleHygieneBreak {
    case { _ $name:lit } => {
        return #{ var }.concat([
            makeIdent(unwrapSyntax(#{ $name }), null)
        ])
    }
}

let module = macro {
    case { $emacro $mname:ident  { $mbody ... } } => {
        return #{
            var $mname;
            (function (md) {
                $__moduleHygieneBreak 'module' = { 'exports': md };

                $($mbody) ...

            })($mname || ($mname = {}));
        }
    }
    rule { . } => { module. }
}