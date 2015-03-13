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