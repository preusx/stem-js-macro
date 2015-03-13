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
