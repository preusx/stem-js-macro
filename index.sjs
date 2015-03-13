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
macroclass $__decotarator {
  pattern {
    rule { @$name:ident($params...) }
  }
}

macroclass $__decotaratorTypeName {
  pattern {
    rule { class }
    with $name = #{ class };
  }
  pattern {
    rule { function }
    with $name = #{ function };
  }
}

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
   *   Decotarator({
   *     type: 'string'
   *   })(some);
   *   Injector({
   *     template: 'tempate.html'
   *   })(some);
   *   function some() {
   *     var varialble;
   *   }
   */
  case { _
      $name:ident($params...)
      $any:$__decotarator ...
      $type:$__decotaratorTypeName $fname:ident
    } => {
      var result = [];

      result = result.concat(#{ $name($params ...)($fname) }); // Applying current annotation
      try { // Checking if there is some other. If so - applying those too.
        result = result.concat(#{ $($any$name($any$params ...)($fname)) ... });
      } catch (e) {}
      result = result.concat(#{ $type$name $fname });

      return result;
    }

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