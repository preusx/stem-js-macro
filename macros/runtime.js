window.$sweetJsMacroRuntime = {
  /**
   * Class extender.
   * @param  {function} child  - Child class
   * @param  {function} parent - Parent class
   * @return {function}        - Extended child class
   */
  extends: function (child, parent) {
    for(var p in parent) {
      if(parent.hasOwnProperty(p)) {
        child[p] = parent[p];
      }
    }

    function ctor() {
        this.constructor = child;
    }

    ctor.prototype = parent.prototype;
    child.prototype = new ctor();
    child.super = parent.prototype;

    return child;
  },
};