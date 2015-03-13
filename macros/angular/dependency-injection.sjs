/**
 * Function pattern matcher.
 */
macroclass $__aDIFunction {
    pattern { rule { function $name ($params:ident (,) ...) { $body ...} } }
    pattern { rule { function ($params:ident (,) ...) { $body ...} } with $name = #{}; }
    pattern { rule { $name ($params:ident (,) ...) { $body ...} } }
    pattern { rule { ($params:ident (,) ...) { $body ...} } with $name = #{}; }
}


/**
 * Class, namespace and method patterns are from:
 * https://github.com/joehannes/sweet-at-angular
 */

macroclass $__aDINamespace {
    pattern {
        rule { . $class }
    }
}

macroclass $__aDIClassDef {
     pattern {
         rule { $classdef:($sig... $cname:ident extends $mname $baseclass:$__aDINamespace... ) }
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
macroclass $__aDIMethod {
    pattern {
        rule { $$mname:ident... }
    }
}

/**
 * Class pattern matcher.
 */
macroclass $__aDIClass {
  pattern {
    rule { $$klass:($definition:$__aDIClassDef {
      $methods:(constructor ($cparams(,)...) { $cwhatever ... })
    }) }
  }
  pattern {
    rule { $$klass:($definition:$__aDIClassDef {
      $methods:(
      constructor ($cparams(,)...) { $cwhatever ... }
      $($mname:$__aDIMethod ($mparams ...) {$mwhatever ... }) ...
      )
    }) }
  }
  pattern {
    rule { $$klass:($definition:$__aDIClassDef {
      $methods:(
      $methods_pre:($($mname:$__aDIMethod ($mparams ...) {$mwhatever ... }) ...)
      constructor ($cparams(,)...) { $cwhatever ... }
      )
    }) }
  }
  pattern {
    rule { $$klass:($definition:$__aDIClassDef {
      $methods:(
      $methods_pre:($($mname:$__aDIMethod ($mparams ...) {$mwhatever ... }) ...)
      constructor ($cparams(,)...) { $cwhatever ... }
      $methods_post:($($mname:$method ($mparams ...) {$mwhatever ... }) ...)
      )
    }) }
  }
}


macro aDI {
  case { _ $function:$__aDIFunction } => {
    var tokens = #{$function$params...}.map(function(t) { return makeValue(t.token.value, #{here}) });
    if(tokens.length > 0) {
      letstx $annotations... = tokens;
      return #{
        (function() {
          var diFunction = function $function$name ($function$params ...) {
            $function$body ...
          }

          diFunction.$inject = [ $annotations (,) ... ];

          return diFunction;
        })()
      }
    } else {
      return #{
        function $function$name ($function$params ...) {
          $function$body ...
        }
      }
    }
  }

  case { _ $class:$__aDIClass } => {
    var tokens = #{$class$$klass$methods$cparams...}.map(function(t) { return makeValue(t.token.value, #{here}) });
    if(tokens.length > 0) {
      letstx $annotations... = tokens;
      return #{
        (function() {
          $class$$klass
          $class$$klass$definition$classdef$cname.$inject = [ $annotations (,) ... ];

          return $class$$klass$definition$classdef$cname;
        })()
      }
    } else {
      return #{
        $class$$klass
      }
    }
  }
}

export aDI