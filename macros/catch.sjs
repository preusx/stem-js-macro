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