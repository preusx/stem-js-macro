macroclass $__exportPatterns {
  pattern {
    rule { $name:ident { $body ... } }
  }
  pattern {
    rule { $name:ident ($parameters ...) { $body ... } }
  }
  pattern {
    rule { $name:ident extends $ext:ident { $body ... } }
  }
}

macroclass $__exportTypeName {
  pattern {
    rule { class }
    with $name = #{ class };
  }
  pattern {
    rule { function }
    with $name = #{ function };
  }
}


let export = macro {
  // https://github.com/mozilla/sweet.js/issues/288
  case { $export export ; } => { return #{export $export;} }

  rule { var $ename:ident = $edef:expr } => {
    var $ename = $edef
    module.exports.$ename = $ename
  }

  /**
   * Multiple export.
   *
   * @example
   *   export {Person, User}
   *   // Transforms to:
   *   module.exports.Person = Person;
   *   module.exports.User = User;
   */
  rule { { $modules:ident (,) ... } } => {
    $(module.exports.$modules = $modules) ...
  }

  /**
   * "Appendable" export.
   *
   * @example
   *   export Person
   *   // Transforms to:
   *   module.exports.Person = Person;
   */
  rule { $module:ident } => { module.exports.$module = $module; }

  rule infix { module. | } => { module.exports } // module.exports fix

  /**
   * Exports for some struct types as classes enumerables and functions.
   *
   * @example
   *   export class Person {}
   *   // Transforms to:
   *   class Person() {
   *   }
   *   module.exports.Person = Person;
   */
  case { _ $etype:$__exportTypeName $eall:$__exportPatterns } => {
    var here = #{ here }, parameters = false;
    var ext = unwrapSyntax(#{ $eall$ext });

    try {
      parameters = unwrapSyntax(#{ $eall$parameters ... });
    } catch (e) {}
    try {
      parameters = unwrapSyntax(#{ $eall$parameters });
    } catch (e) {}

    result = [
      #{ $etype }[0],
      #{ $eall$name }[0]
    ];

    if(ext != '$eall$ext') {
      result.push(makeIdent('extends', here))
      result.push(#{ $eall$ext }[0]);
    }
    if(parameters == false) result.push(makeDelim('()',[], here));
    if(parameters && parameters !== '$eall$parameters') result.push(makeDelim('()', #{ $eall$parameters ... }, here));

    result.push(makeDelim('{}', #{ $eall$body ... }, here));
    return result.concat(#{
      module.exports.$eall$name = $eall$name;
    });
  }

  /**
   * Exports for some struct types as classes enumerables and functions.
   *
   * @example
   *   export default class Person {}
   *   // Transforms to:
   *   class Person() {
   *   }
   *   module.exports = Person;
   */
  case { _ default $etype:$__exportTypeName $eall:$__exportPatterns } => {
    var here = #{ here }, parameters = false;
    var ext = unwrapSyntax(#{ $eall$ext });

    try {
      parameters = unwrapSyntax(#{ $eall$parameters ... });
    } catch (e) {}
    try {
      parameters = unwrapSyntax(#{ $eall$parameters });
    } catch (e) {}

    result = [
      #{ $etype }[0],
      #{ $eall$name }[0]
    ];

    if(ext != '$eall$ext') {
      result.push(makeIdent('extends', here))
      result.push(#{ $eall$ext }[0]);
    }
    if(parameters == false) result.push(makeDelim('()',[], here));
    if(parameters && parameters !== '$eall$parameters') result.push(makeDelim('()', #{ $eall$parameters ... }, here));

    result.push(makeDelim('{}', #{ $eall$body ... }, here));

    return result.concat(#{
      module.exports = $eall$name;
    });
  }

  rule { = } => { module.exports = }

  rule { . } => { module.exports. }
}

export export;