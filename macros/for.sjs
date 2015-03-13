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