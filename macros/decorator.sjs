import macro from './utility.sjs'

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
