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