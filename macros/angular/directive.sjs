/**
 * Angular directive link function.
 *
 * Binds `this` keyword to the angular $scope.
 */
macro aLink {
  rule infix { , | } => {
    , link : aLink
  }
  rule { ($attrs ...) { $body ... } } => {
    function(s) {
      (function ($attrs ...) {
        $($body) ...
      }.apply(s, Array.prototype.slice.call(arguments, 1)));
    }
  }
  rule { $name:ident ($attrs ...) { $body ... } } => {
    function $name (s) {
      (function ($attrs ...) {
        $($body) ...
      }.apply(s, Array.prototype.slice.call(arguments, 1)));
    }
  }
}

/**
 * Small shorthand for the directive definition function.
 */
macro aDirective {
  rule { ($attrs ...) { $body ... } } => {
    aDI ($attrs ...) {
      return {
        $body ...
      }
    }
  }

  rule { $name ($attrs ...) { $body ... } } => {
    aDI $name ($attrs ...) {
      return {
        $body ...
      }
    }
  }
}


export aDirective
export aLink