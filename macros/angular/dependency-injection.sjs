import macro from './utility.sjs'

macro aDI {
  case { _ $function:$__function } => {
    var tokens = #{$function$params...}.map(function(t) {
        return makeValue(t.token.value, #{here});
      });

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

  case { _ $class:$__class } => {
    var tokens = #{$class$$klass$methods$cparams...}.map(function(t) {
        return makeValue(t.token.value, #{here});
      });

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