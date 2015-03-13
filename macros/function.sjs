/**
 * Function default parameters macro.
 * Doesent work with class macro.
 *
 * WARNING: Buggy!
 */
macro $functionDefaults {
  case { $cname $name $args {$body ...} } => {
    var here = #{ $name }; // [#{ $args }[0]];
    var name = unwrapSyntax(#{ $name });
    var args = #{ $args }[0].token.inner;
    var body = #{ $body ... };

    var argues = [], arggs = [], defaults = {}, defaultsPrepend = [];

    var now = #{ here }[0], last = #{ here };

    while(now.context) {
      if(now.id) {
        last = now.id;
      }
      now = now.context;
    }

    for(var i = 0, l = args.length; i < l; i++) {
      var partial = args[i].token.value;

      if(partial != ',') {
        if(partial == '=') {
          defaults[arggs[arggs.length - 1]] = makeIdent(args[i+1].token.value, here);
          i++;
        } else {
          arggs.push(partial);
          argues.push(makeIdent(partial, here));
        }
      }
    }

    for(var i in defaults) {
      // letstx $tname = makeIdent(i, here);
      // letstx $tval = defaults[i];

      // defaultsPrepend = defaultsPrepend.concat(#{
      //   if(typeof $tname === 'undefined') {
      //     $tname = $tval;
      //   }
      // });
      defaultsPrepend.push(makeKeyword('if', here));
      defaultsPrepend.push(makeDelim('()', [
            // makePunc('!', here),
            // makeIdent(i, here)
            makeIdent('typeof', here),
            makeDelim('()', [
                makeIdent(i, here),
              ], here),
            makePunc('===', here),
            makeValue('undefined', here)
          ], here));
      defaultsPrepend.push(makeDelim('{}', [
            makeIdent(i, here),
            makePunc('=', here),
            defaults[i]
          ], here));
    }

    var result = [];

    return [
      makeKeyword('function', null),
      makeIdent(name, here),
      makeDelim('()', argues, null),
      makeDelim('{}', defaultsPrepend.concat(body), null)
    ];
  }
}


let function = macro {
  rule { $name $args {$body ...} } => {
    $functionDefaults $name $args {$body ...}
  }

  rule { $args {$body ...} } => {
    $functionDefaults '' $args {$body ...}
  }
}

export function