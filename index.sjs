/**
 * Pattern matchers
 * ======================================================================== */

/**
 * Function pattern matcher.
 */
macroclass $__function {
    pattern { rule { function $name ($params:ident (,) ...) { $body ...} } }
    pattern { rule { function ($params:ident (,) ...) { $body ...} } with $name = #{}; }
    pattern { rule { $name ($params:ident (,) ...) { $body ...} } }
    pattern { rule { ($params:ident (,) ...) { $body ...} } with $name = #{}; }
}

export $__function


/**
 * Class, namespace and method patterns are from:
 * https://github.com/joehannes/sweet-at-angular
 */

macroclass $__namespace {
    pattern {
        rule { . $class }
    }
}

macroclass $__classDef {
     pattern {
         rule { $classdef:($sig... $cname:ident extends $mname $baseclass:$__namespace... ) }
     }
     pattern {
         rule { $classdef:($sig... $cname:ident extends $bname) }
     }
     pattern {
         rule { $classdef:($sig... $cname:ident) }
     }
}

/**
 * Method pattern matcher.
 */
macroclass $__method {
    pattern {
        rule { $$mname:ident... }
    }
}

/**
 * Class pattern matcher.
 */
macroclass $__class {
  pattern {
    rule { $$klass:($definition:$__classDef {
      $methods:(constructor ($cparams(,)...) { $cwhatever ... })
    }) }
  }
  pattern {
    rule { $$klass:($definition:$__classDef {
      $methods:(
      constructor ($cparams(,)...) { $cwhatever ... }
      $($mname:$__method ($mparams ...) {$mwhatever ... }) ...
      )
    }) }
  }
  pattern {
    rule { $$klass:($definition:$__classDef {
      $methods:(
      $methods_pre:($($mname:$__method ($mparams ...) {$mwhatever ... }) ...)
      constructor ($cparams(,)...) { $cwhatever ... }
      )
    }) }
  }
  pattern {
    rule { $$klass:($definition:$__classDef {
      $methods:(
      $methods_pre:($($mname:$__method ($mparams ...) {$mwhatever ... }) ...)
      constructor ($cparams(,)...) { $cwhatever ... }
      $methods_post:($($mname:$method ($mparams ...) {$mwhatever ... }) ...)
      )
    }) }
  }
}

export $__class
/**
 * Power function operator.
 *
 * @example
 *   a = b ** 2
 *   // Transforms to:
 *   a = Math.pow(b, 2)
 */
operator (**) 14 right
  { $base, $exp } => #{ Math.pow($base, $exp) }

export (**)


/**
 * Shorthand operator for the prototype function.
 *
 * @example
 *   String::concat = function() {}
 *   // Transforms to:
 *   String.prototype.concat = function() {}
 */
macro (::) {
  rule infix { $class | $object } => { $class.prototype.$object }
}
export (::)

/**
 * Catch macro
 *
 * @example
 *   var some = functionThatCanTrowAnError() catch function(e){ console.log(e); }
 *   // or
 *   var some = functionThatCanTrowAnError() catch (e) { console.log(e); }
 *   // Transforms to:
 *   var some = function () {
 *     try {
 *         return functionThatCanTrowAnError();
 *     } catch (e) {
 *         return function (e$2) {
 *             console.log(e$2);
 *         }(e);
 *     }
 *   }();
 */

let catch = macro {
  rule infix { try { $l ... } | } => {
    try {
      $l ...
    } catch
  }
  rule infix { $l:expr | ($r) { $body ... } } => {
    (function(){
      try {
        return $l
      } catch (e) {
        return function ($r) {
          $($body) ...
        }(e)
      }
    }())
  }
  rule infix { $l:expr | $r:expr } => {
    (function(){
      try {
        return $l
      } catch (e) {
        return $r(e)
      }
    }())
  }
}

export catch
/**
 * Arrow function operator.
 *
 * @example
 *   var square = (a) -> {
 *     return a ** a;
 *   }
 *   // Transforms to:
 *   var square = function (a) {
 *     return Math.pow(a, a);
 *   }
 */
macro (->) {
  rule infix { $param:ident | { $body ... }  } => {
    function ($param) { $body ... }
  }
  rule infix { $name:ident ($params ...) | { $body ... } } => {
    function $name ($params ...) { $body ... }
  }
  rule infix { $name:ident ($params ...) | $body:expr } => {
    function $name ($params ...) { return $body }
  }
  rule infix { ($params ...) | { $body ... } } => {
    function ($params ...) { $body ... }
  }
  rule infix { ($params ...) | $body:expr  } => {
    function ($params ...) { return $body }
  }
  rule infix { $param:ident | $body:expr  } => {
    function ($param) { return $body }
  }
  rule { { $body ... } } => {
    function () { $body ... }
  }
}

export (->)
// Old one
// macroclass $__decotaratorTypeName {
//   pattern {
//     rule { class }
//     with $name = #{ class };
//   }
//   pattern {
//     rule { function }
//     with $name = #{ function };
//   }
// }

macro @ {
  /**
   * `this` nickname `@` macro for functions.
   * semicolon is required
   *
   * @example
   *   @method('something');
   *   // Transforms to:
   *   this.method('something');
   */
  rule { $exp($params ... ); } => { this.$exp($params ... ); }

  /**
   * `@Decotarator` syntax
   * Don't use semicolon at the end.
   *
   * @example
   *   @Decotarator({
   *     type: 'string'
   *   })
   *   @Injector({
   *     template: 'tempate.html'
   *   })
   *   function some() {
   *     var varialble;
   *   }
   *   // Transforms to:
   *   function some() {
   *     var varialble;
   *   }
   *   Decotarator({
   *     type: 'string'
   *   })(some);
   *   Injector({
   *     template: 'tempate.html'
   *   })(some);
   */

  case { _ // Function decorator
      $name:ident($params...)
      $any:( @$name:ident($params...) ) ...
      $function:$__function
    } => {
      var result = [];

      result = result.concat(#{
        function $function$name ($function$params ...) {
          $function$body ...
        }
      });

      result = result.concat(#{
        $name($params ...)($function$name)
      }); // Applying current annotation

      try { // Checking if there is some other. If so - applying those too.
        result = result.concat(#{
          $($any$name($any$params ...)($function$name)) ...
        });
      } catch (e) {}

      return result;
    }

  case { _ // Class decorator
      $name:ident($params...)
      $any:( @$name:ident($params...) ) ...
      $class:$__class
    } => {
      var result = [];

      result = result.concat(#{
        $class$$klass
      });

      result = result.concat(#{
        $name($params ...)($class$$klass$definition$classdef$cname)
      }); // Applying current annotation

      try { // Checking if there is some other. If so - applying those too.
        result = result.concat(#{
          $($any$name($any$params ...)($class$$klass$definition$classdef$cname)) ...
        });
      } catch (e) {}

      return result;
    }

  // Old one
  // case { _
  //     $name:ident($params...)
  //     $any:( @$name:ident($params...) ) ...
  //     $type:$__decotaratorTypeName $fname:ident
  //   } => {
  //     var result = [];

  //     result = result.concat(#{ $type$name $fname });

  //     result = result.concat(#{ $name($params ...)($fname) }); // Applying current annotation
  //     try { // Checking if there is some other. If so - applying those too.
  //       result = result.concat(#{ $($any$name($any$params ...)($fname)) ... });
  //     } catch (e) {}

  //     return result;
  //   }

  /**
   * `this` nickname `@` macro
   *
   * @example
   *   @variable = 'something';
   *   // Transforms to:
   *   this.variable = 'something';
   */
  rule { . $exp } => { this.$exp }
  rule { $exp } => { this.$exp }
  rule { ; } => { this; }
  rule { , } => { this, }
  rule { } => { this }
}

export @

/**
 * Some `for` extensions.
 */
let for = macro {
  rule { (var $some isin $any) { $fbody ... } } => {
    for (var $some in $any) {
      if(!$any.hasOwnProperty($some)) continue;

      $fbody ...
    }
  }
  rule { ($some isin $any) { $fbody ... } } => {
    for (var $some in $any) {
      if(!$any.hasOwnProperty($some)) continue;

      $fbody ...
    }
  }
  rule { (var $some of $any) { $fbody ... } } => {
    for (var _i = 0, _l = $any.length; _i < _l; _i++) {
      var $some = $any[_i];

      $fbody ...
    }
  }
  rule { ($some of $any) { $fbody ... } } => {
    for (var _i = 0, _l = $any.length; _i < _l; _i++) {
      var $some = $any[_i];

      $fbody ...
    }
  }
  rule { $fparams $fbody } => {
    for $fparams $fbody
  }
}

export for
macro $__enumValue {
  case { _ $value:ident } => {
    return [makeValue(unwrapSyntax(#{$value}), #{ $value })]
  }
  rule { $value } => { $value }
}

macroclass $__enumPartial {
  pattern {
    rule { $key = $value }
  }
  pattern {
    rule { $key }
    with $value = #{ $__enumValue $key }
  }
}

/**
 * Enum macro.
 */
macro enum {
  rule {
    $enumName {
      $body:$__enumPartial (,) ...
    }
  } => {
    var $enumName = {
      $("$body$key": $body$value) (,) ...
    }
  }
}

export enum