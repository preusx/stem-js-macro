macro $__enumValue {
  case { _ $value:ident } => {
    return [makeValue(unwrapSyntax(#{$value}), #{ $value })]
  }
  rule { $value } => { $value }
}

macroclass $__enumPartial {
  pattern {
    rule { $key = $value }
  }
  pattern {
    rule { $key }
    with $value = #{ $__enumValue $key }
  }
}

/**
 * Enum macro.
 */
macro enum {
  rule {
    $enumName {
      $body:$__enumPartial (,) ...
    }
  } => {
    var $enumName = {
      $("$body$key": $body$value) (,) ...
    }
  }
}

export enum