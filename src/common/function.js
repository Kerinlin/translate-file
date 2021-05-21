export default {
  install(Vue) {
    Vue.directive("clickoutside", {
      bind: function(el, binding) {
        function documentHandler(e) {
          if (el.contains(e.target)) {
            return false;
          }
          if (binding.expression) {
            binding.value(e);
          }
        }
        el.__vueClickOutSide__ = documentHandler;
        document.addEventListener("click", documentHandler);
      },
      unbind: function(el) {
        document.removeEventListener("click", el.__vueClickOutSide__);
        delete el.__vueClickOutSide__;
      }
    });
  }
};
