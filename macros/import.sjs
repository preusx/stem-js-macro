macroclass $__importAlias {
  pattern {
    rule { $from:ident as $to:ident }
  }
  pattern {
    rule { $from:ident }
    with $to = #{ $from };
  }
}

macro $__importPath {
  case { _ $modPath:lit } => {
    var here = #{ $modPath };
    var path = unwrapSyntax(#{ $modPath });
    var matches = /\/([a-z0-9_-]+)(\/index|\/|)(\.[a-z]+|)$/ig.exec(path);
    var name = matches != null ? matches[1] : path;

    // Transforms the name of the module from hyphenated to camelCase.
    name = name.replace(/-([a-z])/g, function (match) {
      return match[1].toUpperCase();
    });

    if(matches) {
      // If there are `/` characters in the path, then we are requiring
      // `js` file.
      if(!matches[3] && /[\/]/g.test(path)) {
        // If path ends with the `/` character then require index.js file.
        if(/\/$/g.test(path)) {
          path += 'index';
        }

        path += '.js';
      }
    }

    return [
      makeIdent(name, here),
      makeValue(path, here)
    ]
  }
}

/**
 * Import macro.
 *
 * @example
 *   import { a, b as c, d } from 'foo'
 *   // Transforms to:
 *   var __module = require('foo');
 *   var a = __module.a;
 *   var c = __module.b;
 *   var d = __module.d;
 */
macro import {
  case { _ { $import:$__importAlias (,) ... } from $mod:$__importPath ;... } => {
    letstx $mpath = [#{ $mod }[1]];
    return #{
      var __module = require($mpath);
      $(var $import$to = __module.$import$from;) ...
    }
  }
  case { _ $default:ident from $mod:$__importPath ;... } => {
    letstx $mpath = [#{ $mod }[1]];
    return #{
      var $default = require($mpath);
    }
  }
  case { _ $mod:$__importPath ;... } => {
    letstx $mname = [#{ $mod }[0]];
    letstx $mpath = [#{ $mod }[1]];
    return #{
      var $mname = require($mpath);
    }
  }
}

export import