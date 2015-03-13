macro $__classItem {
  rule { static $mname = $mbody } => {
    $mname = $mbody;
  }
  rule { @$mname = $mbody } => {
    $mname = $mbody;
  }
  rule { static $mname $mparams $mbody } => {
    $mname = function $mname $mparams $mbody;
  }
  rule { @$mname $mparams $mbody } => {
    $mname = function $mname $mparams $mbody;
  }
  rule { $mname $mparams $mbody } => {
    prototype.$mname = function $mname $mparams $mbody;
  }
}


macro class {
  /**
  * Simple class with constructor.
  */
  rule {
    $className {
      constructor $cparams $cbody

      $body:$__classItem ...
    }
  } => {
    function $className $cparams $cbody

    $($className.$body) ...
  }

  /**
  * Class that extends other one with constructor.
  */
  rule {
    $className extends $super {
      constructor $cparams { $cbody ... }

      $body:$__classItem ...
    }
  } => {
    function $className $cparams {
      this.super.constructor.apply(this, arguments);

      $cbody ...
    }

    window.$sweetJsMacroRuntime.extends($className, $super);

    $($className.$body) ...
  }

  /**
  * Class that extends other one without constructor.
  */
  rule {
    $className extends $super {
      $body:$__classItem ...
    }
  } => {
    function $className() {
      this.super.constructor.apply(this, arguments);
    }

    window.$sweetJsMacroRuntime.extends($className, $super);

    $($className.$body) ...
  }
}

export class