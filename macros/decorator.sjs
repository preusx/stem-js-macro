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