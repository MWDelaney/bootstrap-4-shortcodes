/*! tether 1.3.7 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(factory);
  } else if (typeof exports === 'object') {
    module.exports = factory(require, exports, module);
  } else {
    root.Tether = factory();
  }
}(this, function(require, exports, module) {

'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var TetherBase = undefined;
if (typeof TetherBase === 'undefined') {
  TetherBase = { modules: [] };
}

var zeroElement = null;

// Same as native getBoundingClientRect, except it takes into account parent <frame> offsets
// if the element lies within a nested document (<frame> or <iframe>-like).
function getActualBoundingClientRect(node) {
  var boundingRect = node.getBoundingClientRect();

  // The original object returned by getBoundingClientRect is immutable, so we clone it
  // We can't use extend because the properties are not considered part of the object by hasOwnProperty in IE9
  var rect = {};
  for (var k in boundingRect) {
    rect[k] = boundingRect[k];
  }

  if (node.ownerDocument !== document) {
    var _frameElement = node.ownerDocument.defaultView.frameElement;
    if (_frameElement) {
      var frameRect = getActualBoundingClientRect(_frameElement);
      rect.top += frameRect.top;
      rect.bottom += frameRect.top;
      rect.left += frameRect.left;
      rect.right += frameRect.left;
    }
  }

  return rect;
}

function getScrollParents(el) {
  // In firefox if the el is inside an iframe with display: none; window.getComputedStyle() will return null;
  // https://bugzilla.mozilla.org/show_bug.cgi?id=548397
  var computedStyle = getComputedStyle(el) || {};
  var position = computedStyle.position;
  var parents = [];

  if (position === 'fixed') {
    return [el];
  }

  var parent = el;
  while ((parent = parent.parentNode) && parent && parent.nodeType === 1) {
    var style = undefined;
    try {
      style = getComputedStyle(parent);
    } catch (err) {}

    if (typeof style === 'undefined' || style === null) {
      parents.push(parent);
      return parents;
    }

    var _style = style;
    var overflow = _style.overflow;
    var overflowX = _style.overflowX;
    var overflowY = _style.overflowY;

    if (/(auto|scroll)/.test(overflow + overflowY + overflowX)) {
      if (position !== 'absolute' || ['relative', 'absolute', 'fixed'].indexOf(style.position) >= 0) {
        parents.push(parent);
      }
    }
  }

  parents.push(el.ownerDocument.body);

  // If the node is within a frame, account for the parent window scroll
  if (el.ownerDocument !== document) {
    parents.push(el.ownerDocument.defaultView);
  }

  return parents;
}

var uniqueId = (function () {
  var id = 0;
  return function () {
    return ++id;
  };
})();

var zeroPosCache = {};
var getOrigin = function getOrigin() {
  // getBoundingClientRect is unfortunately too accurate.  It introduces a pixel or two of
  // jitter as the user scrolls that messes with our ability to detect if two positions
  // are equivilant or not.  We place an element at the top left of the page that will
  // get the same jitter, so we can cancel the two out.
  var node = zeroElement;
  if (!node) {
    node = document.createElement('div');
    node.setAttribute('data-tether-id', uniqueId());
    extend(node.style, {
      top: 0,
      left: 0,
      position: 'absolute'
    });

    document.body.appendChild(node);

    zeroElement = node;
  }

  var id = node.getAttribute('data-tether-id');
  if (typeof zeroPosCache[id] === 'undefined') {
    zeroPosCache[id] = getActualBoundingClientRect(node);

    // Clear the cache when this position call is done
    defer(function () {
      delete zeroPosCache[id];
    });
  }

  return zeroPosCache[id];
};

function removeUtilElements() {
  if (zeroElement) {
    document.body.removeChild(zeroElement);
  }
  zeroElement = null;
};

function getBounds(el) {
  var doc = undefined;
  if (el === document) {
    doc = document;
    el = document.documentElement;
  } else {
    doc = el.ownerDocument;
  }

  var docEl = doc.documentElement;

  var box = getActualBoundingClientRect(el);

  var origin = getOrigin();

  box.top -= origin.top;
  box.left -= origin.left;

  if (typeof box.width === 'undefined') {
    box.width = document.body.scrollWidth - box.left - box.right;
  }
  if (typeof box.height === 'undefined') {
    box.height = document.body.scrollHeight - box.top - box.bottom;
  }

  box.top = box.top - docEl.clientTop;
  box.left = box.left - docEl.clientLeft;
  box.right = doc.body.clientWidth - box.width - box.left;
  box.bottom = doc.body.clientHeight - box.height - box.top;

  return box;
}

function getOffsetParent(el) {
  return el.offsetParent || document.documentElement;
}

var _scrollBarSize = null;
function getScrollBarSize() {
  if (_scrollBarSize) {
    return _scrollBarSize;
  }
  var inner = document.createElement('div');
  inner.style.width = '100%';
  inner.style.height = '200px';

  var outer = document.createElement('div');
  extend(outer.style, {
    position: 'absolute',
    top: 0,
    left: 0,
    pointerEvents: 'none',
    visibility: 'hidden',
    width: '200px',
    height: '150px',
    overflow: 'hidden'
  });

  outer.appendChild(inner);

  document.body.appendChild(outer);

  var widthContained = inner.offsetWidth;
  outer.style.overflow = 'scroll';
  var widthScroll = inner.offsetWidth;

  if (widthContained === widthScroll) {
    widthScroll = outer.clientWidth;
  }

  document.body.removeChild(outer);

  var width = widthContained - widthScroll;

  _scrollBarSize = { width: width, height: width };
  return _scrollBarSize;
}

function extend() {
  var out = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

  var args = [];

  Array.prototype.push.apply(args, arguments);

  args.slice(1).forEach(function (obj) {
    if (obj) {
      for (var key in obj) {
        if (({}).hasOwnProperty.call(obj, key)) {
          out[key] = obj[key];
        }
      }
    }
  });

  return out;
}

function removeClass(el, name) {
  if (typeof el.classList !== 'undefined') {
    name.split(' ').forEach(function (cls) {
      if (cls.trim()) {
        el.classList.remove(cls);
      }
    });
  } else {
    var regex = new RegExp('(^| )' + name.split(' ').join('|') + '( |$)', 'gi');
    var className = getClassName(el).replace(regex, ' ');
    setClassName(el, className);
  }
}

function addClass(el, name) {
  if (typeof el.classList !== 'undefined') {
    name.split(' ').forEach(function (cls) {
      if (cls.trim()) {
        el.classList.add(cls);
      }
    });
  } else {
    removeClass(el, name);
    var cls = getClassName(el) + (' ' + name);
    setClassName(el, cls);
  }
}

function hasClass(el, name) {
  if (typeof el.classList !== 'undefined') {
    return el.classList.contains(name);
  }
  var className = getClassName(el);
  return new RegExp('(^| )' + name + '( |$)', 'gi').test(className);
}

function getClassName(el) {
  // Can't use just SVGAnimatedString here since nodes within a Frame in IE have
  // completely separately SVGAnimatedString base classes
  if (el.className instanceof el.ownerDocument.defaultView.SVGAnimatedString) {
    return el.className.baseVal;
  }
  return el.className;
}

function setClassName(el, className) {
  el.setAttribute('class', className);
}

function updateClasses(el, add, all) {
  // Of the set of 'all' classes, we need the 'add' classes, and only the
  // 'add' classes to be set.
  all.forEach(function (cls) {
    if (add.indexOf(cls) === -1 && hasClass(el, cls)) {
      removeClass(el, cls);
    }
  });

  add.forEach(function (cls) {
    if (!hasClass(el, cls)) {
      addClass(el, cls);
    }
  });
}

var deferred = [];

var defer = function defer(fn) {
  deferred.push(fn);
};

var flush = function flush() {
  var fn = undefined;
  while (fn = deferred.pop()) {
    fn();
  }
};

var Evented = (function () {
  function Evented() {
    _classCallCheck(this, Evented);
  }

  _createClass(Evented, [{
    key: 'on',
    value: function on(event, handler, ctx) {
      var once = arguments.length <= 3 || arguments[3] === undefined ? false : arguments[3];

      if (typeof this.bindings === 'undefined') {
        this.bindings = {};
      }
      if (typeof this.bindings[event] === 'undefined') {
        this.bindings[event] = [];
      }
      this.bindings[event].push({ handler: handler, ctx: ctx, once: once });
    }
  }, {
    key: 'once',
    value: function once(event, handler, ctx) {
      this.on(event, handler, ctx, true);
    }
  }, {
    key: 'off',
    value: function off(event, handler) {
      if (typeof this.bindings === 'undefined' || typeof this.bindings[event] === 'undefined') {
        return;
      }

      if (typeof handler === 'undefined') {
        delete this.bindings[event];
      } else {
        var i = 0;
        while (i < this.bindings[event].length) {
          if (this.bindings[event][i].handler === handler) {
            this.bindings[event].splice(i, 1);
          } else {
            ++i;
          }
        }
      }
    }
  }, {
    key: 'trigger',
    value: function trigger(event) {
      if (typeof this.bindings !== 'undefined' && this.bindings[event]) {
        var i = 0;

        for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
          args[_key - 1] = arguments[_key];
        }

        while (i < this.bindings[event].length) {
          var _bindings$event$i = this.bindings[event][i];
          var handler = _bindings$event$i.handler;
          var ctx = _bindings$event$i.ctx;
          var once = _bindings$event$i.once;

          var context = ctx;
          if (typeof context === 'undefined') {
            context = this;
          }

          handler.apply(context, args);

          if (once) {
            this.bindings[event].splice(i, 1);
          } else {
            ++i;
          }
        }
      }
    }
  }]);

  return Evented;
})();

TetherBase.Utils = {
  getActualBoundingClientRect: getActualBoundingClientRect,
  getScrollParents: getScrollParents,
  getBounds: getBounds,
  getOffsetParent: getOffsetParent,
  extend: extend,
  addClass: addClass,
  removeClass: removeClass,
  hasClass: hasClass,
  updateClasses: updateClasses,
  defer: defer,
  flush: flush,
  uniqueId: uniqueId,
  Evented: Evented,
  getScrollBarSize: getScrollBarSize,
  removeUtilElements: removeUtilElements
};
/* globals TetherBase, performance */

'use strict';

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x6, _x7, _x8) { var _again = true; _function: while (_again) { var object = _x6, property = _x7, receiver = _x8; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x6 = parent; _x7 = property; _x8 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

if (typeof TetherBase === 'undefined') {
  throw new Error('You must include the utils.js file before tether.js');
}

var _TetherBase$Utils = TetherBase.Utils;
var getScrollParents = _TetherBase$Utils.getScrollParents;
var getBounds = _TetherBase$Utils.getBounds;
var getOffsetParent = _TetherBase$Utils.getOffsetParent;
var extend = _TetherBase$Utils.extend;
var addClass = _TetherBase$Utils.addClass;
var removeClass = _TetherBase$Utils.removeClass;
var updateClasses = _TetherBase$Utils.updateClasses;
var defer = _TetherBase$Utils.defer;
var flush = _TetherBase$Utils.flush;
var getScrollBarSize = _TetherBase$Utils.getScrollBarSize;
var removeUtilElements = _TetherBase$Utils.removeUtilElements;

function within(a, b) {
  var diff = arguments.length <= 2 || arguments[2] === undefined ? 1 : arguments[2];

  return a + diff >= b && b >= a - diff;
}

var transformKey = (function () {
  if (typeof document === 'undefined') {
    return '';
  }
  var el = document.createElement('div');

  var transforms = ['transform', 'WebkitTransform', 'OTransform', 'MozTransform', 'msTransform'];
  for (var i = 0; i < transforms.length; ++i) {
    var key = transforms[i];
    if (el.style[key] !== undefined) {
      return key;
    }
  }
})();

var tethers = [];

var position = function position() {
  tethers.forEach(function (tether) {
    tether.position(false);
  });
  flush();
};

function now() {
  if (typeof performance !== 'undefined' && typeof performance.now !== 'undefined') {
    return performance.now();
  }
  return +new Date();
}

(function () {
  var lastCall = null;
  var lastDuration = null;
  var pendingTimeout = null;

  var tick = function tick() {
    if (typeof lastDuration !== 'undefined' && lastDuration > 16) {
      // We voluntarily throttle ourselves if we can't manage 60fps
      lastDuration = Math.min(lastDuration - 16, 250);

      // Just in case this is the last event, remember to position just once more
      pendingTimeout = setTimeout(tick, 250);
      return;
    }

    if (typeof lastCall !== 'undefined' && now() - lastCall < 10) {
      // Some browsers call events a little too frequently, refuse to run more than is reasonable
      return;
    }

    if (pendingTimeout != null) {
      clearTimeout(pendingTimeout);
      pendingTimeout = null;
    }

    lastCall = now();
    position();
    lastDuration = now() - lastCall;
  };

  if (typeof window !== 'undefined' && typeof window.addEventListener !== 'undefined') {
    ['resize', 'scroll', 'touchmove'].forEach(function (event) {
      window.addEventListener(event, tick);
    });
  }
})();

var MIRROR_LR = {
  center: 'center',
  left: 'right',
  right: 'left'
};

var MIRROR_TB = {
  middle: 'middle',
  top: 'bottom',
  bottom: 'top'
};

var OFFSET_MAP = {
  top: 0,
  left: 0,
  middle: '50%',
  center: '50%',
  bottom: '100%',
  right: '100%'
};

var autoToFixedAttachment = function autoToFixedAttachment(attachment, relativeToAttachment) {
  var left = attachment.left;
  var top = attachment.top;

  if (left === 'auto') {
    left = MIRROR_LR[relativeToAttachment.left];
  }

  if (top === 'auto') {
    top = MIRROR_TB[relativeToAttachment.top];
  }

  return { left: left, top: top };
};

var attachmentToOffset = function attachmentToOffset(attachment) {
  var left = attachment.left;
  var top = attachment.top;

  if (typeof OFFSET_MAP[attachment.left] !== 'undefined') {
    left = OFFSET_MAP[attachment.left];
  }

  if (typeof OFFSET_MAP[attachment.top] !== 'undefined') {
    top = OFFSET_MAP[attachment.top];
  }

  return { left: left, top: top };
};

function addOffset() {
  var out = { top: 0, left: 0 };

  for (var _len = arguments.length, offsets = Array(_len), _key = 0; _key < _len; _key++) {
    offsets[_key] = arguments[_key];
  }

  offsets.forEach(function (_ref) {
    var top = _ref.top;
    var left = _ref.left;

    if (typeof top === 'string') {
      top = parseFloat(top, 10);
    }
    if (typeof left === 'string') {
      left = parseFloat(left, 10);
    }

    out.top += top;
    out.left += left;
  });

  return out;
}

function offsetToPx(offset, size) {
  if (typeof offset.left === 'string' && offset.left.indexOf('%') !== -1) {
    offset.left = parseFloat(offset.left, 10) / 100 * size.width;
  }
  if (typeof offset.top === 'string' && offset.top.indexOf('%') !== -1) {
    offset.top = parseFloat(offset.top, 10) / 100 * size.height;
  }

  return offset;
}

var parseOffset = function parseOffset(value) {
  var _value$split = value.split(' ');

  var _value$split2 = _slicedToArray(_value$split, 2);

  var top = _value$split2[0];
  var left = _value$split2[1];

  return { top: top, left: left };
};
var parseAttachment = parseOffset;

var TetherClass = (function (_Evented) {
  _inherits(TetherClass, _Evented);

  function TetherClass(options) {
    var _this = this;

    _classCallCheck(this, TetherClass);

    _get(Object.getPrototypeOf(TetherClass.prototype), 'constructor', this).call(this);
    this.position = this.position.bind(this);

    tethers.push(this);

    this.history = [];

    this.setOptions(options, false);

    TetherBase.modules.forEach(function (module) {
      if (typeof module.initialize !== 'undefined') {
        module.initialize.call(_this);
      }
    });

    this.position();
  }

  _createClass(TetherClass, [{
    key: 'getClass',
    value: function getClass() {
      var key = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];
      var classes = this.options.classes;

      if (typeof classes !== 'undefined' && classes[key]) {
        return this.options.classes[key];
      } else if (this.options.classPrefix) {
        return this.options.classPrefix + '-' + key;
      } else {
        return key;
      }
    }
  }, {
    key: 'setOptions',
    value: function setOptions(options) {
      var _this2 = this;

      var pos = arguments.length <= 1 || arguments[1] === undefined ? true : arguments[1];

      var defaults = {
        offset: '0 0',
        targetOffset: '0 0',
        targetAttachment: 'auto auto',
        classPrefix: 'tether'
      };

      this.options = extend(defaults, options);

      var _options = this.options;
      var element = _options.element;
      var target = _options.target;
      var targetModifier = _options.targetModifier;

      this.element = element;
      this.target = target;
      this.targetModifier = targetModifier;

      if (this.target === 'viewport') {
        this.target = document.body;
        this.targetModifier = 'visible';
      } else if (this.target === 'scroll-handle') {
        this.target = document.body;
        this.targetModifier = 'scroll-handle';
      }

      ['element', 'target'].forEach(function (key) {
        if (typeof _this2[key] === 'undefined') {
          throw new Error('Tether Error: Both element and target must be defined');
        }

        if (typeof _this2[key].jquery !== 'undefined') {
          _this2[key] = _this2[key][0];
        } else if (typeof _this2[key] === 'string') {
          _this2[key] = document.querySelector(_this2[key]);
        }
      });

      addClass(this.element, this.getClass('element'));
      if (!(this.options.addTargetClasses === false)) {
        addClass(this.target, this.getClass('target'));
      }

      if (!this.options.attachment) {
        throw new Error('Tether Error: You must provide an attachment');
      }

      this.targetAttachment = parseAttachment(this.options.targetAttachment);
      this.attachment = parseAttachment(this.options.attachment);
      this.offset = parseOffset(this.options.offset);
      this.targetOffset = parseOffset(this.options.targetOffset);

      if (typeof this.scrollParents !== 'undefined') {
        this.disable();
      }

      if (this.targetModifier === 'scroll-handle') {
        this.scrollParents = [this.target];
      } else {
        this.scrollParents = getScrollParents(this.target);
      }

      if (!(this.options.enabled === false)) {
        this.enable(pos);
      }
    }
  }, {
    key: 'getTargetBounds',
    value: function getTargetBounds() {
      if (typeof this.targetModifier !== 'undefined') {
        if (this.targetModifier === 'visible') {
          if (this.target === document.body) {
            return { top: pageYOffset, left: pageXOffset, height: innerHeight, width: innerWidth };
          } else {
            var bounds = getBounds(this.target);

            var out = {
              height: bounds.height,
              width: bounds.width,
              top: bounds.top,
              left: bounds.left
            };

            out.height = Math.min(out.height, bounds.height - (pageYOffset - bounds.top));
            out.height = Math.min(out.height, bounds.height - (bounds.top + bounds.height - (pageYOffset + innerHeight)));
            out.height = Math.min(innerHeight, out.height);
            out.height -= 2;

            out.width = Math.min(out.width, bounds.width - (pageXOffset - bounds.left));
            out.width = Math.min(out.width, bounds.width - (bounds.left + bounds.width - (pageXOffset + innerWidth)));
            out.width = Math.min(innerWidth, out.width);
            out.width -= 2;

            if (out.top < pageYOffset) {
              out.top = pageYOffset;
            }
            if (out.left < pageXOffset) {
              out.left = pageXOffset;
            }

            return out;
          }
        } else if (this.targetModifier === 'scroll-handle') {
          var bounds = undefined;
          var target = this.target;
          if (target === document.body) {
            target = document.documentElement;

            bounds = {
              left: pageXOffset,
              top: pageYOffset,
              height: innerHeight,
              width: innerWidth
            };
          } else {
            bounds = getBounds(target);
          }

          var style = getComputedStyle(target);

          var hasBottomScroll = target.scrollWidth > target.clientWidth || [style.overflow, style.overflowX].indexOf('scroll') >= 0 || this.target !== document.body;

          var scrollBottom = 0;
          if (hasBottomScroll) {
            scrollBottom = 15;
          }

          var height = bounds.height - parseFloat(style.borderTopWidth) - parseFloat(style.borderBottomWidth) - scrollBottom;

          var out = {
            width: 15,
            height: height * 0.975 * (height / target.scrollHeight),
            left: bounds.left + bounds.width - parseFloat(style.borderLeftWidth) - 15
          };

          var fitAdj = 0;
          if (height < 408 && this.target === document.body) {
            fitAdj = -0.00011 * Math.pow(height, 2) - 0.00727 * height + 22.58;
          }

          if (this.target !== document.body) {
            out.height = Math.max(out.height, 24);
          }

          var scrollPercentage = this.target.scrollTop / (target.scrollHeight - height);
          out.top = scrollPercentage * (height - out.height - fitAdj) + bounds.top + parseFloat(style.borderTopWidth);

          if (this.target === document.body) {
            out.height = Math.max(out.height, 24);
          }

          return out;
        }
      } else {
        return getBounds(this.target);
      }
    }
  }, {
    key: 'clearCache',
    value: function clearCache() {
      this._cache = {};
    }
  }, {
    key: 'cache',
    value: function cache(k, getter) {
      // More than one module will often need the same DOM info, so
      // we keep a cache which is cleared on each position call
      if (typeof this._cache === 'undefined') {
        this._cache = {};
      }

      if (typeof this._cache[k] === 'undefined') {
        this._cache[k] = getter.call(this);
      }

      return this._cache[k];
    }
  }, {
    key: 'enable',
    value: function enable() {
      var _this3 = this;

      var pos = arguments.length <= 0 || arguments[0] === undefined ? true : arguments[0];

      if (!(this.options.addTargetClasses === false)) {
        addClass(this.target, this.getClass('enabled'));
      }
      addClass(this.element, this.getClass('enabled'));
      this.enabled = true;

      this.scrollParents.forEach(function (parent) {
        if (parent !== _this3.target.ownerDocument) {
          parent.addEventListener('scroll', _this3.position);
        }
      });

      if (pos) {
        this.position();
      }
    }
  }, {
    key: 'disable',
    value: function disable() {
      var _this4 = this;

      removeClass(this.target, this.getClass('enabled'));
      removeClass(this.element, this.getClass('enabled'));
      this.enabled = false;

      if (typeof this.scrollParents !== 'undefined') {
        this.scrollParents.forEach(function (parent) {
          parent.removeEventListener('scroll', _this4.position);
        });
      }
    }
  }, {
    key: 'destroy',
    value: function destroy() {
      var _this5 = this;

      this.disable();

      tethers.forEach(function (tether, i) {
        if (tether === _this5) {
          tethers.splice(i, 1);
        }
      });

      // Remove any elements we were using for convenience from the DOM
      if (tethers.length === 0) {
        removeUtilElements();
      }
    }
  }, {
    key: 'updateAttachClasses',
    value: function updateAttachClasses(elementAttach, targetAttach) {
      var _this6 = this;

      elementAttach = elementAttach || this.attachment;
      targetAttach = targetAttach || this.targetAttachment;
      var sides = ['left', 'top', 'bottom', 'right', 'middle', 'center'];

      if (typeof this._addAttachClasses !== 'undefined' && this._addAttachClasses.length) {
        // updateAttachClasses can be called more than once in a position call, so
        // we need to clean up after ourselves such that when the last defer gets
        // ran it doesn't add any extra classes from previous calls.
        this._addAttachClasses.splice(0, this._addAttachClasses.length);
      }

      if (typeof this._addAttachClasses === 'undefined') {
        this._addAttachClasses = [];
      }
      var add = this._addAttachClasses;

      if (elementAttach.top) {
        add.push(this.getClass('element-attached') + '-' + elementAttach.top);
      }
      if (elementAttach.left) {
        add.push(this.getClass('element-attached') + '-' + elementAttach.left);
      }
      if (targetAttach.top) {
        add.push(this.getClass('target-attached') + '-' + targetAttach.top);
      }
      if (targetAttach.left) {
        add.push(this.getClass('target-attached') + '-' + targetAttach.left);
      }

      var all = [];
      sides.forEach(function (side) {
        all.push(_this6.getClass('element-attached') + '-' + side);
        all.push(_this6.getClass('target-attached') + '-' + side);
      });

      defer(function () {
        if (!(typeof _this6._addAttachClasses !== 'undefined')) {
          return;
        }

        updateClasses(_this6.element, _this6._addAttachClasses, all);
        if (!(_this6.options.addTargetClasses === false)) {
          updateClasses(_this6.target, _this6._addAttachClasses, all);
        }

        delete _this6._addAttachClasses;
      });
    }
  }, {
    key: 'position',
    value: function position() {
      var _this7 = this;

      var flushChanges = arguments.length <= 0 || arguments[0] === undefined ? true : arguments[0];

      // flushChanges commits the changes immediately, leave true unless you are positioning multiple
      // tethers (in which case call Tether.Utils.flush yourself when you're done)

      if (!this.enabled) {
        return;
      }

      this.clearCache();

      // Turn 'auto' attachments into the appropriate corner or edge
      var targetAttachment = autoToFixedAttachment(this.targetAttachment, this.attachment);

      this.updateAttachClasses(this.attachment, targetAttachment);

      var elementPos = this.cache('element-bounds', function () {
        return getBounds(_this7.element);
      });

      var width = elementPos.width;
      var height = elementPos.height;

      if (width === 0 && height === 0 && typeof this.lastSize !== 'undefined') {
        var _lastSize = this.lastSize;

        // We cache the height and width to make it possible to position elements that are
        // getting hidden.
        width = _lastSize.width;
        height = _lastSize.height;
      } else {
        this.lastSize = { width: width, height: height };
      }

      var targetPos = this.cache('target-bounds', function () {
        return _this7.getTargetBounds();
      });
      var targetSize = targetPos;

      // Get an actual px offset from the attachment
      var offset = offsetToPx(attachmentToOffset(this.attachment), { width: width, height: height });
      var targetOffset = offsetToPx(attachmentToOffset(targetAttachment), targetSize);

      var manualOffset = offsetToPx(this.offset, { width: width, height: height });
      var manualTargetOffset = offsetToPx(this.targetOffset, targetSize);

      // Add the manually provided offset
      offset = addOffset(offset, manualOffset);
      targetOffset = addOffset(targetOffset, manualTargetOffset);

      // It's now our goal to make (element position + offset) == (target position + target offset)
      var left = targetPos.left + targetOffset.left - offset.left;
      var top = targetPos.top + targetOffset.top - offset.top;

      for (var i = 0; i < TetherBase.modules.length; ++i) {
        var _module2 = TetherBase.modules[i];
        var ret = _module2.position.call(this, {
          left: left,
          top: top,
          targetAttachment: targetAttachment,
          targetPos: targetPos,
          elementPos: elementPos,
          offset: offset,
          targetOffset: targetOffset,
          manualOffset: manualOffset,
          manualTargetOffset: manualTargetOffset,
          scrollbarSize: scrollbarSize,
          attachment: this.attachment
        });

        if (ret === false) {
          return false;
        } else if (typeof ret === 'undefined' || typeof ret !== 'object') {
          continue;
        } else {
          top = ret.top;
          left = ret.left;
        }
      }

      // We describe the position three different ways to give the optimizer
      // a chance to decide the best possible way to position the element
      // with the fewest repaints.
      var next = {
        // It's position relative to the page (absolute positioning when
        // the element is a child of the body)
        page: {
          top: top,
          left: left
        },

        // It's position relative to the viewport (fixed positioning)
        viewport: {
          top: top - pageYOffset,
          bottom: pageYOffset - top - height + innerHeight,
          left: left - pageXOffset,
          right: pageXOffset - left - width + innerWidth
        }
      };

      var doc = this.target.ownerDocument;
      var win = doc.defaultView;

      var scrollbarSize = undefined;
      if (win.innerHeight > doc.documentElement.clientHeight) {
        scrollbarSize = this.cache('scrollbar-size', getScrollBarSize);
        next.viewport.bottom -= scrollbarSize.height;
      }

      if (win.innerWidth > doc.documentElement.clientWidth) {
        scrollbarSize = this.cache('scrollbar-size', getScrollBarSize);
        next.viewport.right -= scrollbarSize.width;
      }

      if (['', 'static'].indexOf(doc.body.style.position) === -1 || ['', 'static'].indexOf(doc.body.parentElement.style.position) === -1) {
        // Absolute positioning in the body will be relative to the page, not the 'initial containing block'
        next.page.bottom = doc.body.scrollHeight - top - height;
        next.page.right = doc.body.scrollWidth - left - width;
      }

      if (typeof this.options.optimizations !== 'undefined' && this.options.optimizations.moveElement !== false && !(typeof this.targetModifier !== 'undefined')) {
        (function () {
          var offsetParent = _this7.cache('target-offsetparent', function () {
            return getOffsetParent(_this7.target);
          });
          var offsetPosition = _this7.cache('target-offsetparent-bounds', function () {
            return getBounds(offsetParent);
          });
          var offsetParentStyle = getComputedStyle(offsetParent);
          var offsetParentSize = offsetPosition;

          var offsetBorder = {};
          ['Top', 'Left', 'Bottom', 'Right'].forEach(function (side) {
            offsetBorder[side.toLowerCase()] = parseFloat(offsetParentStyle['border' + side + 'Width']);
          });

          offsetPosition.right = doc.body.scrollWidth - offsetPosition.left - offsetParentSize.width + offsetBorder.right;
          offsetPosition.bottom = doc.body.scrollHeight - offsetPosition.top - offsetParentSize.height + offsetBorder.bottom;

          if (next.page.top >= offsetPosition.top + offsetBorder.top && next.page.bottom >= offsetPosition.bottom) {
            if (next.page.left >= offsetPosition.left + offsetBorder.left && next.page.right >= offsetPosition.right) {
              // We're within the visible part of the target's scroll parent
              var scrollTop = offsetParent.scrollTop;
              var scrollLeft = offsetParent.scrollLeft;

              // It's position relative to the target's offset parent (absolute positioning when
              // the element is moved to be a child of the target's offset parent).
              next.offset = {
                top: next.page.top - offsetPosition.top + scrollTop - offsetBorder.top,
                left: next.page.left - offsetPosition.left + scrollLeft - offsetBorder.left
              };
            }
          }
        })();
      }

      // We could also travel up the DOM and try each containing context, rather than only
      // looking at the body, but we're gonna get diminishing returns.

      this.move(next);

      this.history.unshift(next);

      if (this.history.length > 3) {
        this.history.pop();
      }

      if (flushChanges) {
        flush();
      }

      return true;
    }

    // THE ISSUE
  }, {
    key: 'move',
    value: function move(pos) {
      var _this8 = this;

      if (!(typeof this.element.parentNode !== 'undefined')) {
        return;
      }

      var same = {};

      for (var type in pos) {
        same[type] = {};

        for (var key in pos[type]) {
          var found = false;

          for (var i = 0; i < this.history.length; ++i) {
            var point = this.history[i];
            if (typeof point[type] !== 'undefined' && !within(point[type][key], pos[type][key])) {
              found = true;
              break;
            }
          }

          if (!found) {
            same[type][key] = true;
          }
        }
      }

      var css = { top: '', left: '', right: '', bottom: '' };

      var transcribe = function transcribe(_same, _pos) {
        var hasOptimizations = typeof _this8.options.optimizations !== 'undefined';
        var gpu = hasOptimizations ? _this8.options.optimizations.gpu : null;
        if (gpu !== false) {
          var yPos = undefined,
              xPos = undefined;
          if (_same.top) {
            css.top = 0;
            yPos = _pos.top;
          } else {
            css.bottom = 0;
            yPos = -_pos.bottom;
          }

          if (_same.left) {
            css.left = 0;
            xPos = _pos.left;
          } else {
            css.right = 0;
            xPos = -_pos.right;
          }

          if (window.matchMedia) {
            // HubSpot/tether#207
            var retina = window.matchMedia('only screen and (min-resolution: 1.3dppx)').matches || window.matchMedia('only screen and (-webkit-min-device-pixel-ratio: 1.3)').matches;
            if (!retina) {
              xPos = Math.round(xPos);
              yPos = Math.round(yPos);
            }
          }

          css[transformKey] = 'translateX(' + xPos + 'px) translateY(' + yPos + 'px)';

          if (transformKey !== 'msTransform') {
            // The Z transform will keep this in the GPU (faster, and prevents artifacts),
            // but IE9 doesn't support 3d transforms and will choke.
            css[transformKey] += " translateZ(0)";
          }
        } else {
          if (_same.top) {
            css.top = _pos.top + 'px';
          } else {
            css.bottom = _pos.bottom + 'px';
          }

          if (_same.left) {
            css.left = _pos.left + 'px';
          } else {
            css.right = _pos.right + 'px';
          }
        }
      };

      var moved = false;
      if ((same.page.top || same.page.bottom) && (same.page.left || same.page.right)) {
        css.position = 'absolute';
        transcribe(same.page, pos.page);
      } else if ((same.viewport.top || same.viewport.bottom) && (same.viewport.left || same.viewport.right)) {
        css.position = 'fixed';
        transcribe(same.viewport, pos.viewport);
      } else if (typeof same.offset !== 'undefined' && same.offset.top && same.offset.left) {
        (function () {
          css.position = 'absolute';
          var offsetParent = _this8.cache('target-offsetparent', function () {
            return getOffsetParent(_this8.target);
          });

          if (getOffsetParent(_this8.element) !== offsetParent) {
            defer(function () {
              _this8.element.parentNode.removeChild(_this8.element);
              offsetParent.appendChild(_this8.element);
            });
          }

          transcribe(same.offset, pos.offset);
          moved = true;
        })();
      } else {
        css.position = 'absolute';
        transcribe({ top: true, left: true }, pos.page);
      }

      if (!moved) {
        var offsetParentIsBody = true;
        var currentNode = this.element.parentNode;
        while (currentNode && currentNode.nodeType === 1 && currentNode.tagName !== 'BODY') {
          if (getComputedStyle(currentNode).position !== 'static') {
            offsetParentIsBody = false;
            break;
          }

          currentNode = currentNode.parentNode;
        }

        if (!offsetParentIsBody) {
          this.element.parentNode.removeChild(this.element);
          this.element.ownerDocument.body.appendChild(this.element);
        }
      }

      // Any css change will trigger a repaint, so let's avoid one if nothing changed
      var writeCSS = {};
      var write = false;
      for (var key in css) {
        var val = css[key];
        var elVal = this.element.style[key];

        if (elVal !== val) {
          write = true;
          writeCSS[key] = val;
        }
      }

      if (write) {
        defer(function () {
          extend(_this8.element.style, writeCSS);
          _this8.trigger('repositioned');
        });
      }
    }
  }]);

  return TetherClass;
})(Evented);

TetherClass.modules = [];

TetherBase.position = position;

var Tether = extend(TetherClass, TetherBase);
/* globals TetherBase */

'use strict';

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

var _TetherBase$Utils = TetherBase.Utils;
var getBounds = _TetherBase$Utils.getBounds;
var extend = _TetherBase$Utils.extend;
var updateClasses = _TetherBase$Utils.updateClasses;
var defer = _TetherBase$Utils.defer;

var BOUNDS_FORMAT = ['left', 'top', 'right', 'bottom'];

function getBoundingRect(tether, to) {
  if (to === 'scrollParent') {
    to = tether.scrollParents[0];
  } else if (to === 'window') {
    to = [pageXOffset, pageYOffset, innerWidth + pageXOffset, innerHeight + pageYOffset];
  }

  if (to === document) {
    to = to.documentElement;
  }

  if (typeof to.nodeType !== 'undefined') {
    (function () {
      var node = to;
      var size = getBounds(to);
      var pos = size;
      var style = getComputedStyle(to);

      to = [pos.left, pos.top, size.width + pos.left, size.height + pos.top];

      // Account any parent Frames scroll offset
      if (node.ownerDocument !== document) {
        var win = node.ownerDocument.defaultView;
        to[0] += win.pageXOffset;
        to[1] += win.pageYOffset;
        to[2] += win.pageXOffset;
        to[3] += win.pageYOffset;
      }

      BOUNDS_FORMAT.forEach(function (side, i) {
        side = side[0].toUpperCase() + side.substr(1);
        if (side === 'Top' || side === 'Left') {
          to[i] += parseFloat(style['border' + side + 'Width']);
        } else {
          to[i] -= parseFloat(style['border' + side + 'Width']);
        }
      });
    })();
  }

  return to;
}

TetherBase.modules.push({
  position: function position(_ref) {
    var _this = this;

    var top = _ref.top;
    var left = _ref.left;
    var targetAttachment = _ref.targetAttachment;

    if (!this.options.constraints) {
      return true;
    }

    var _cache = this.cache('element-bounds', function () {
      return getBounds(_this.element);
    });

    var height = _cache.height;
    var width = _cache.width;

    if (width === 0 && height === 0 && typeof this.lastSize !== 'undefined') {
      var _lastSize = this.lastSize;

      // Handle the item getting hidden as a result of our positioning without glitching
      // the classes in and out
      width = _lastSize.width;
      height = _lastSize.height;
    }

    var targetSize = this.cache('target-bounds', function () {
      return _this.getTargetBounds();
    });

    var targetHeight = targetSize.height;
    var targetWidth = targetSize.width;

    var allClasses = [this.getClass('pinned'), this.getClass('out-of-bounds')];

    this.options.constraints.forEach(function (constraint) {
      var outOfBoundsClass = constraint.outOfBoundsClass;
      var pinnedClass = constraint.pinnedClass;

      if (outOfBoundsClass) {
        allClasses.push(outOfBoundsClass);
      }
      if (pinnedClass) {
        allClasses.push(pinnedClass);
      }
    });

    allClasses.forEach(function (cls) {
      ['left', 'top', 'right', 'bottom'].forEach(function (side) {
        allClasses.push(cls + '-' + side);
      });
    });

    var addClasses = [];

    var tAttachment = extend({}, targetAttachment);
    var eAttachment = extend({}, this.attachment);

    this.options.constraints.forEach(function (constraint) {
      var to = constraint.to;
      var attachment = constraint.attachment;
      var pin = constraint.pin;

      if (typeof attachment === 'undefined') {
        attachment = '';
      }

      var changeAttachX = undefined,
          changeAttachY = undefined;
      if (attachment.indexOf(' ') >= 0) {
        var _attachment$split = attachment.split(' ');

        var _attachment$split2 = _slicedToArray(_attachment$split, 2);

        changeAttachY = _attachment$split2[0];
        changeAttachX = _attachment$split2[1];
      } else {
        changeAttachX = changeAttachY = attachment;
      }

      var bounds = getBoundingRect(_this, to);

      if (changeAttachY === 'target' || changeAttachY === 'both') {
        if (top < bounds[1] && tAttachment.top === 'top') {
          top += targetHeight;
          tAttachment.top = 'bottom';
        }

        if (top + height > bounds[3] && tAttachment.top === 'bottom') {
          top -= targetHeight;
          tAttachment.top = 'top';
        }
      }

      if (changeAttachY === 'together') {
        if (tAttachment.top === 'top') {
          if (eAttachment.top === 'bottom' && top < bounds[1]) {
            top += targetHeight;
            tAttachment.top = 'bottom';

            top += height;
            eAttachment.top = 'top';
          } else if (eAttachment.top === 'top' && top + height > bounds[3] && top - (height - targetHeight) >= bounds[1]) {
            top -= height - targetHeight;
            tAttachment.top = 'bottom';

            eAttachment.top = 'bottom';
          }
        }

        if (tAttachment.top === 'bottom') {
          if (eAttachment.top === 'top' && top + height > bounds[3]) {
            top -= targetHeight;
            tAttachment.top = 'top';

            top -= height;
            eAttachment.top = 'bottom';
          } else if (eAttachment.top === 'bottom' && top < bounds[1] && top + (height * 2 - targetHeight) <= bounds[3]) {
            top += height - targetHeight;
            tAttachment.top = 'top';

            eAttachment.top = 'top';
          }
        }

        if (tAttachment.top === 'middle') {
          if (top + height > bounds[3] && eAttachment.top === 'top') {
            top -= height;
            eAttachment.top = 'bottom';
          } else if (top < bounds[1] && eAttachment.top === 'bottom') {
            top += height;
            eAttachment.top = 'top';
          }
        }
      }

      if (changeAttachX === 'target' || changeAttachX === 'both') {
        if (left < bounds[0] && tAttachment.left === 'left') {
          left += targetWidth;
          tAttachment.left = 'right';
        }

        if (left + width > bounds[2] && tAttachment.left === 'right') {
          left -= targetWidth;
          tAttachment.left = 'left';
        }
      }

      if (changeAttachX === 'together') {
        if (left < bounds[0] && tAttachment.left === 'left') {
          if (eAttachment.left === 'right') {
            left += targetWidth;
            tAttachment.left = 'right';

            left += width;
            eAttachment.left = 'left';
          } else if (eAttachment.left === 'left') {
            left += targetWidth;
            tAttachment.left = 'right';

            left -= width;
            eAttachment.left = 'right';
          }
        } else if (left + width > bounds[2] && tAttachment.left === 'right') {
          if (eAttachment.left === 'left') {
            left -= targetWidth;
            tAttachment.left = 'left';

            left -= width;
            eAttachment.left = 'right';
          } else if (eAttachment.left === 'right') {
            left -= targetWidth;
            tAttachment.left = 'left';

            left += width;
            eAttachment.left = 'left';
          }
        } else if (tAttachment.left === 'center') {
          if (left + width > bounds[2] && eAttachment.left === 'left') {
            left -= width;
            eAttachment.left = 'right';
          } else if (left < bounds[0] && eAttachment.left === 'right') {
            left += width;
            eAttachment.left = 'left';
          }
        }
      }

      if (changeAttachY === 'element' || changeAttachY === 'both') {
        if (top < bounds[1] && eAttachment.top === 'bottom') {
          top += height;
          eAttachment.top = 'top';
        }

        if (top + height > bounds[3] && eAttachment.top === 'top') {
          top -= height;
          eAttachment.top = 'bottom';
        }
      }

      if (changeAttachX === 'element' || changeAttachX === 'both') {
        if (left < bounds[0]) {
          if (eAttachment.left === 'right') {
            left += width;
            eAttachment.left = 'left';
          } else if (eAttachment.left === 'center') {
            left += width / 2;
            eAttachment.left = 'left';
          }
        }

        if (left + width > bounds[2]) {
          if (eAttachment.left === 'left') {
            left -= width;
            eAttachment.left = 'right';
          } else if (eAttachment.left === 'center') {
            left -= width / 2;
            eAttachment.left = 'right';
          }
        }
      }

      if (typeof pin === 'string') {
        pin = pin.split(',').map(function (p) {
          return p.trim();
        });
      } else if (pin === true) {
        pin = ['top', 'left', 'right', 'bottom'];
      }

      pin = pin || [];

      var pinned = [];
      var oob = [];

      if (top < bounds[1]) {
        if (pin.indexOf('top') >= 0) {
          top = bounds[1];
          pinned.push('top');
        } else {
          oob.push('top');
        }
      }

      if (top + height > bounds[3]) {
        if (pin.indexOf('bottom') >= 0) {
          top = bounds[3] - height;
          pinned.push('bottom');
        } else {
          oob.push('bottom');
        }
      }

      if (left < bounds[0]) {
        if (pin.indexOf('left') >= 0) {
          left = bounds[0];
          pinned.push('left');
        } else {
          oob.push('left');
        }
      }

      if (left + width > bounds[2]) {
        if (pin.indexOf('right') >= 0) {
          left = bounds[2] - width;
          pinned.push('right');
        } else {
          oob.push('right');
        }
      }

      if (pinned.length) {
        (function () {
          var pinnedClass = undefined;
          if (typeof _this.options.pinnedClass !== 'undefined') {
            pinnedClass = _this.options.pinnedClass;
          } else {
            pinnedClass = _this.getClass('pinned');
          }

          addClasses.push(pinnedClass);
          pinned.forEach(function (side) {
            addClasses.push(pinnedClass + '-' + side);
          });
        })();
      }

      if (oob.length) {
        (function () {
          var oobClass = undefined;
          if (typeof _this.options.outOfBoundsClass !== 'undefined') {
            oobClass = _this.options.outOfBoundsClass;
          } else {
            oobClass = _this.getClass('out-of-bounds');
          }

          addClasses.push(oobClass);
          oob.forEach(function (side) {
            addClasses.push(oobClass + '-' + side);
          });
        })();
      }

      if (pinned.indexOf('left') >= 0 || pinned.indexOf('right') >= 0) {
        eAttachment.left = tAttachment.left = false;
      }
      if (pinned.indexOf('top') >= 0 || pinned.indexOf('bottom') >= 0) {
        eAttachment.top = tAttachment.top = false;
      }

      if (tAttachment.top !== targetAttachment.top || tAttachment.left !== targetAttachment.left || eAttachment.top !== _this.attachment.top || eAttachment.left !== _this.attachment.left) {
        _this.updateAttachClasses(eAttachment, tAttachment);
        _this.trigger('update', {
          attachment: eAttachment,
          targetAttachment: tAttachment
        });
      }
    });

    defer(function () {
      if (!(_this.options.addTargetClasses === false)) {
        updateClasses(_this.target, addClasses, allClasses);
      }
      updateClasses(_this.element, addClasses, allClasses);
    });

    return { top: top, left: left };
  }
});
/* globals TetherBase */

'use strict';

var _TetherBase$Utils = TetherBase.Utils;
var getBounds = _TetherBase$Utils.getBounds;
var updateClasses = _TetherBase$Utils.updateClasses;
var defer = _TetherBase$Utils.defer;

TetherBase.modules.push({
  position: function position(_ref) {
    var _this = this;

    var top = _ref.top;
    var left = _ref.left;

    var _cache = this.cache('element-bounds', function () {
      return getBounds(_this.element);
    });

    var height = _cache.height;
    var width = _cache.width;

    var targetPos = this.getTargetBounds();

    var bottom = top + height;
    var right = left + width;

    var abutted = [];
    if (top <= targetPos.bottom && bottom >= targetPos.top) {
      ['left', 'right'].forEach(function (side) {
        var targetPosSide = targetPos[side];
        if (targetPosSide === left || targetPosSide === right) {
          abutted.push(side);
        }
      });
    }

    if (left <= targetPos.right && right >= targetPos.left) {
      ['top', 'bottom'].forEach(function (side) {
        var targetPosSide = targetPos[side];
        if (targetPosSide === top || targetPosSide === bottom) {
          abutted.push(side);
        }
      });
    }

    var allClasses = [];
    var addClasses = [];

    var sides = ['left', 'top', 'right', 'bottom'];
    allClasses.push(this.getClass('abutted'));
    sides.forEach(function (side) {
      allClasses.push(_this.getClass('abutted') + '-' + side);
    });

    if (abutted.length) {
      addClasses.push(this.getClass('abutted'));
    }

    abutted.forEach(function (side) {
      addClasses.push(_this.getClass('abutted') + '-' + side);
    });

    defer(function () {
      if (!(_this.options.addTargetClasses === false)) {
        updateClasses(_this.target, addClasses, allClasses);
      }
      updateClasses(_this.element, addClasses, allClasses);
    });

    return true;
  }
});
/* globals TetherBase */

'use strict';

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

TetherBase.modules.push({
  position: function position(_ref) {
    var top = _ref.top;
    var left = _ref.left;

    if (!this.options.shift) {
      return;
    }

    var shift = this.options.shift;
    if (typeof this.options.shift === 'function') {
      shift = this.options.shift.call(this, { top: top, left: left });
    }

    var shiftTop = undefined,
        shiftLeft = undefined;
    if (typeof shift === 'string') {
      shift = shift.split(' ');
      shift[1] = shift[1] || shift[0];

      var _shift = shift;

      var _shift2 = _slicedToArray(_shift, 2);

      shiftTop = _shift2[0];
      shiftLeft = _shift2[1];

      shiftTop = parseFloat(shiftTop, 10);
      shiftLeft = parseFloat(shiftLeft, 10);
    } else {
      shiftTop = shift.top;
      shiftLeft = shift.left;
    }

    top += shiftTop;
    left += shiftLeft;

    return { top: top, left: left };
  }
});
return Tether;

}));

/*!
 * Bootstrap v4.0.0-alpha.4 (http://getbootstrap.com)
 * Copyright 2011-2016 The Bootstrap Authors (https://github.com/twbs/bootstrap/graphs/contributors)
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 */
if("undefined"==typeof jQuery)throw new Error("Bootstrap's JavaScript requires jQuery");+function(a){var b=a.fn.jquery.split(" ")[0].split(".");if(b[0]<2&&b[1]<9||1==b[0]&&9==b[1]&&b[2]<1||b[0]>=4)throw new Error("Bootstrap's JavaScript requires at least jQuery v1.9.1 but less than v4.0.0")}(jQuery),+function(a){"use strict";function b(a,b){if("function"!=typeof b&&null!==b)throw new TypeError("Super expression must either be null or a function, not "+typeof b);a.prototype=Object.create(b&&b.prototype,{constructor:{value:a,enumerable:!1,writable:!0,configurable:!0}}),b&&(Object.setPrototypeOf?Object.setPrototypeOf(a,b):a.__proto__=b)}function c(a,b){if(!(a instanceof b))throw new TypeError("Cannot call a class as a function")}var d=function(a,b,c){for(var d=!0;d;){var e=a,f=b,g=c;d=!1,null===e&&(e=Function.prototype);var h=Object.getOwnPropertyDescriptor(e,f);if(void 0!==h){if("value"in h)return h.value;var i=h.get;if(void 0===i)return;return i.call(g)}var j=Object.getPrototypeOf(e);if(null===j)return;a=j,b=f,c=g,d=!0,h=j=void 0}},e=function(){function a(a,b){for(var c=0;c<b.length;c++){var d=b[c];d.enumerable=d.enumerable||!1,d.configurable=!0,"value"in d&&(d.writable=!0),Object.defineProperty(a,d.key,d)}}return function(b,c,d){return c&&a(b.prototype,c),d&&a(b,d),b}}(),f=function(a){function b(a){return{}.toString.call(a).match(/\s([a-zA-Z]+)/)[1].toLowerCase()}function c(a){return(a[0]||a).nodeType}function d(){return{bindType:h.end,delegateType:h.end,handle:function(b){if(a(b.target).is(this))return b.handleObj.handler.apply(this,arguments)}}}function e(){if(window.QUnit)return!1;var a=document.createElement("bootstrap");for(var b in j)if(void 0!==a.style[b])return{end:j[b]};return!1}function f(b){var c=this,d=!1;return a(this).one(k.TRANSITION_END,function(){d=!0}),setTimeout(function(){d||k.triggerTransitionEnd(c)},b),this}function g(){h=e(),a.fn.emulateTransitionEnd=f,k.supportsTransitionEnd()&&(a.event.special[k.TRANSITION_END]=d())}var h=!1,i=1e6,j={WebkitTransition:"webkitTransitionEnd",MozTransition:"transitionend",OTransition:"oTransitionEnd otransitionend",transition:"transitionend"},k={TRANSITION_END:"bsTransitionEnd",getUID:function(a){do a+=~~(Math.random()*i);while(document.getElementById(a));return a},getSelectorFromElement:function(a){var b=a.getAttribute("data-target");return b||(b=a.getAttribute("href")||"",b=/^#[a-z]/i.test(b)?b:null),b},reflow:function(a){new Function("bs","return bs")(a.offsetHeight)},triggerTransitionEnd:function(b){a(b).trigger(h.end)},supportsTransitionEnd:function(){return Boolean(h)},typeCheckConfig:function(a,d,e){for(var f in e)if(e.hasOwnProperty(f)){var g=e[f],h=d[f],i=void 0;if(i=h&&c(h)?"element":b(h),!new RegExp(g).test(i))throw new Error(a.toUpperCase()+": "+('Option "'+f+'" provided type "'+i+'" ')+('but expected type "'+g+'".'))}}};return g(),k}(jQuery),g=(function(a){var b="alert",d="4.0.0-alpha.4",g="bs.alert",h="."+g,i=".data-api",j=a.fn[b],k=150,l={DISMISS:'[data-dismiss="alert"]'},m={CLOSE:"close"+h,CLOSED:"closed"+h,CLICK_DATA_API:"click"+h+i},n={ALERT:"alert",FADE:"fade",IN:"in"},o=function(){function b(a){c(this,b),this._element=a}return e(b,[{key:"close",value:function(a){a=a||this._element;var b=this._getRootElement(a),c=this._triggerCloseEvent(b);c.isDefaultPrevented()||this._removeElement(b)}},{key:"dispose",value:function(){a.removeData(this._element,g),this._element=null}},{key:"_getRootElement",value:function(b){var c=f.getSelectorFromElement(b),d=!1;return c&&(d=a(c)[0]),d||(d=a(b).closest("."+n.ALERT)[0]),d}},{key:"_triggerCloseEvent",value:function(b){var c=a.Event(m.CLOSE);return a(b).trigger(c),c}},{key:"_removeElement",value:function(b){return a(b).removeClass(n.IN),f.supportsTransitionEnd()&&a(b).hasClass(n.FADE)?void a(b).one(f.TRANSITION_END,a.proxy(this._destroyElement,this,b)).emulateTransitionEnd(k):void this._destroyElement(b)}},{key:"_destroyElement",value:function(b){a(b).detach().trigger(m.CLOSED).remove()}}],[{key:"_jQueryInterface",value:function(c){return this.each(function(){var d=a(this),e=d.data(g);e||(e=new b(this),d.data(g,e)),"close"===c&&e[c](this)})}},{key:"_handleDismiss",value:function(a){return function(b){b&&b.preventDefault(),a.close(this)}}},{key:"VERSION",get:function(){return d}}]),b}();return a(document).on(m.CLICK_DATA_API,l.DISMISS,o._handleDismiss(new o)),a.fn[b]=o._jQueryInterface,a.fn[b].Constructor=o,a.fn[b].noConflict=function(){return a.fn[b]=j,o._jQueryInterface},o}(jQuery),function(a){var b="button",d="4.0.0-alpha.4",f="bs.button",g="."+f,h=".data-api",i=a.fn[b],j={ACTIVE:"active",BUTTON:"btn",FOCUS:"focus"},k={DATA_TOGGLE_CARROT:'[data-toggle^="button"]',DATA_TOGGLE:'[data-toggle="buttons"]',INPUT:"input",ACTIVE:".active",BUTTON:".btn"},l={CLICK_DATA_API:"click"+g+h,FOCUS_BLUR_DATA_API:"focus"+g+h+" "+("blur"+g+h)},m=function(){function b(a){c(this,b),this._element=a}return e(b,[{key:"toggle",value:function(){var b=!0,c=a(this._element).closest(k.DATA_TOGGLE)[0];if(c){var d=a(this._element).find(k.INPUT)[0];if(d){if("radio"===d.type)if(d.checked&&a(this._element).hasClass(j.ACTIVE))b=!1;else{var e=a(c).find(k.ACTIVE)[0];e&&a(e).removeClass(j.ACTIVE)}b&&(d.checked=!a(this._element).hasClass(j.ACTIVE),a(this._element).trigger("change")),d.focus()}}else this._element.setAttribute("aria-pressed",!a(this._element).hasClass(j.ACTIVE));b&&a(this._element).toggleClass(j.ACTIVE)}},{key:"dispose",value:function(){a.removeData(this._element,f),this._element=null}}],[{key:"_jQueryInterface",value:function(c){return this.each(function(){var d=a(this).data(f);d||(d=new b(this),a(this).data(f,d)),"toggle"===c&&d[c]()})}},{key:"VERSION",get:function(){return d}}]),b}();return a(document).on(l.CLICK_DATA_API,k.DATA_TOGGLE_CARROT,function(b){b.preventDefault();var c=b.target;a(c).hasClass(j.BUTTON)||(c=a(c).closest(k.BUTTON)),m._jQueryInterface.call(a(c),"toggle")}).on(l.FOCUS_BLUR_DATA_API,k.DATA_TOGGLE_CARROT,function(b){var c=a(b.target).closest(k.BUTTON)[0];a(c).toggleClass(j.FOCUS,/^focus(in)?$/.test(b.type))}),a.fn[b]=m._jQueryInterface,a.fn[b].Constructor=m,a.fn[b].noConflict=function(){return a.fn[b]=i,m._jQueryInterface},m}(jQuery),function(a){var b="carousel",d="4.0.0-alpha.4",g="bs.carousel",h="."+g,i=".data-api",j=a.fn[b],k=600,l=37,m=39,n={interval:5e3,keyboard:!0,slide:!1,pause:"hover",wrap:!0},o={interval:"(number|boolean)",keyboard:"boolean",slide:"(boolean|string)",pause:"(string|boolean)",wrap:"boolean"},p={NEXT:"next",PREVIOUS:"prev"},q={SLIDE:"slide"+h,SLID:"slid"+h,KEYDOWN:"keydown"+h,MOUSEENTER:"mouseenter"+h,MOUSELEAVE:"mouseleave"+h,LOAD_DATA_API:"load"+h+i,CLICK_DATA_API:"click"+h+i},r={CAROUSEL:"carousel",ACTIVE:"active",SLIDE:"slide",RIGHT:"right",LEFT:"left",ITEM:"carousel-item"},s={ACTIVE:".active",ACTIVE_ITEM:".active.carousel-item",ITEM:".carousel-item",NEXT_PREV:".next, .prev",INDICATORS:".carousel-indicators",DATA_SLIDE:"[data-slide], [data-slide-to]",DATA_RIDE:'[data-ride="carousel"]'},t=function(){function i(b,d){c(this,i),this._items=null,this._interval=null,this._activeElement=null,this._isPaused=!1,this._isSliding=!1,this._config=this._getConfig(d),this._element=a(b)[0],this._indicatorsElement=a(this._element).find(s.INDICATORS)[0],this._addEventListeners()}return e(i,[{key:"next",value:function(){this._isSliding||this._slide(p.NEXT)}},{key:"nextWhenVisible",value:function(){document.hidden||this.next()}},{key:"prev",value:function(){this._isSliding||this._slide(p.PREVIOUS)}},{key:"pause",value:function(b){b||(this._isPaused=!0),a(this._element).find(s.NEXT_PREV)[0]&&f.supportsTransitionEnd()&&(f.triggerTransitionEnd(this._element),this.cycle(!0)),clearInterval(this._interval),this._interval=null}},{key:"cycle",value:function(b){b||(this._isPaused=!1),this._interval&&(clearInterval(this._interval),this._interval=null),this._config.interval&&!this._isPaused&&(this._interval=setInterval(a.proxy(document.visibilityState?this.nextWhenVisible:this.next,this),this._config.interval))}},{key:"to",value:function(b){var c=this;this._activeElement=a(this._element).find(s.ACTIVE_ITEM)[0];var d=this._getItemIndex(this._activeElement);if(!(b>this._items.length-1||b<0)){if(this._isSliding)return void a(this._element).one(q.SLID,function(){return c.to(b)});if(d===b)return this.pause(),void this.cycle();var e=b>d?p.NEXT:p.PREVIOUS;this._slide(e,this._items[b])}}},{key:"dispose",value:function(){a(this._element).off(h),a.removeData(this._element,g),this._items=null,this._config=null,this._element=null,this._interval=null,this._isPaused=null,this._isSliding=null,this._activeElement=null,this._indicatorsElement=null}},{key:"_getConfig",value:function(c){return c=a.extend({},n,c),f.typeCheckConfig(b,c,o),c}},{key:"_addEventListeners",value:function(){this._config.keyboard&&a(this._element).on(q.KEYDOWN,a.proxy(this._keydown,this)),"hover"!==this._config.pause||"ontouchstart"in document.documentElement||a(this._element).on(q.MOUSEENTER,a.proxy(this.pause,this)).on(q.MOUSELEAVE,a.proxy(this.cycle,this))}},{key:"_keydown",value:function(a){if(a.preventDefault(),!/input|textarea/i.test(a.target.tagName))switch(a.which){case l:this.prev();break;case m:this.next();break;default:return}}},{key:"_getItemIndex",value:function(b){return this._items=a.makeArray(a(b).parent().find(s.ITEM)),this._items.indexOf(b)}},{key:"_getItemByDirection",value:function(a,b){var c=a===p.NEXT,d=a===p.PREVIOUS,e=this._getItemIndex(b),f=this._items.length-1,g=d&&0===e||c&&e===f;if(g&&!this._config.wrap)return b;var h=a===p.PREVIOUS?-1:1,i=(e+h)%this._items.length;return i===-1?this._items[this._items.length-1]:this._items[i]}},{key:"_triggerSlideEvent",value:function(b,c){var d=a.Event(q.SLIDE,{relatedTarget:b,direction:c});return a(this._element).trigger(d),d}},{key:"_setActiveIndicatorElement",value:function(b){if(this._indicatorsElement){a(this._indicatorsElement).find(s.ACTIVE).removeClass(r.ACTIVE);var c=this._indicatorsElement.children[this._getItemIndex(b)];c&&a(c).addClass(r.ACTIVE)}}},{key:"_slide",value:function(b,c){var d=this,e=a(this._element).find(s.ACTIVE_ITEM)[0],g=c||e&&this._getItemByDirection(b,e),h=Boolean(this._interval),i=b===p.NEXT?r.LEFT:r.RIGHT;if(g&&a(g).hasClass(r.ACTIVE))return void(this._isSliding=!1);var j=this._triggerSlideEvent(g,i);if(!j.isDefaultPrevented()&&e&&g){this._isSliding=!0,h&&this.pause(),this._setActiveIndicatorElement(g);var l=a.Event(q.SLID,{relatedTarget:g,direction:i});f.supportsTransitionEnd()&&a(this._element).hasClass(r.SLIDE)?(a(g).addClass(b),f.reflow(g),a(e).addClass(i),a(g).addClass(i),a(e).one(f.TRANSITION_END,function(){a(g).removeClass(i).removeClass(b),a(g).addClass(r.ACTIVE),a(e).removeClass(r.ACTIVE).removeClass(b).removeClass(i),d._isSliding=!1,setTimeout(function(){return a(d._element).trigger(l)},0)}).emulateTransitionEnd(k)):(a(e).removeClass(r.ACTIVE),a(g).addClass(r.ACTIVE),this._isSliding=!1,a(this._element).trigger(l)),h&&this.cycle()}}}],[{key:"_jQueryInterface",value:function(b){return this.each(function(){var c=a(this).data(g),d=a.extend({},n,a(this).data());"object"==typeof b&&a.extend(d,b);var e="string"==typeof b?b:d.slide;if(c||(c=new i(this,d),a(this).data(g,c)),"number"==typeof b)c.to(b);else if("string"==typeof e){if(void 0===c[e])throw new Error('No method named "'+e+'"');c[e]()}else d.interval&&(c.pause(),c.cycle())})}},{key:"_dataApiClickHandler",value:function(b){var c=f.getSelectorFromElement(this);if(c){var d=a(c)[0];if(d&&a(d).hasClass(r.CAROUSEL)){var e=a.extend({},a(d).data(),a(this).data()),h=this.getAttribute("data-slide-to");h&&(e.interval=!1),i._jQueryInterface.call(a(d),e),h&&a(d).data(g).to(h),b.preventDefault()}}}},{key:"VERSION",get:function(){return d}},{key:"Default",get:function(){return n}}]),i}();return a(document).on(q.CLICK_DATA_API,s.DATA_SLIDE,t._dataApiClickHandler),a(window).on(q.LOAD_DATA_API,function(){a(s.DATA_RIDE).each(function(){var b=a(this);t._jQueryInterface.call(b,b.data())})}),a.fn[b]=t._jQueryInterface,a.fn[b].Constructor=t,a.fn[b].noConflict=function(){return a.fn[b]=j,t._jQueryInterface},t}(jQuery),function(a){var b="collapse",d="4.0.0-alpha.4",g="bs.collapse",h="."+g,i=".data-api",j=a.fn[b],k=600,l={toggle:!0,parent:""},m={toggle:"boolean",parent:"string"},n={SHOW:"show"+h,SHOWN:"shown"+h,HIDE:"hide"+h,HIDDEN:"hidden"+h,CLICK_DATA_API:"click"+h+i},o={IN:"in",COLLAPSE:"collapse",COLLAPSING:"collapsing",COLLAPSED:"collapsed"},p={WIDTH:"width",HEIGHT:"height"},q={ACTIVES:".panel > .in, .panel > .collapsing",DATA_TOGGLE:'[data-toggle="collapse"]'},r=function(){function h(b,d){c(this,h),this._isTransitioning=!1,this._element=b,this._config=this._getConfig(d),this._triggerArray=a.makeArray(a('[data-toggle="collapse"][href="#'+b.id+'"],'+('[data-toggle="collapse"][data-target="#'+b.id+'"]'))),this._parent=this._config.parent?this._getParent():null,this._config.parent||this._addAriaAndCollapsedClass(this._element,this._triggerArray),this._config.toggle&&this.toggle()}return e(h,[{key:"toggle",value:function(){a(this._element).hasClass(o.IN)?this.hide():this.show()}},{key:"show",value:function(){var b=this;if(!this._isTransitioning&&!a(this._element).hasClass(o.IN)){var c=void 0,d=void 0;if(this._parent&&(c=a.makeArray(a(q.ACTIVES)),c.length||(c=null)),!(c&&(d=a(c).data(g),d&&d._isTransitioning))){var e=a.Event(n.SHOW);if(a(this._element).trigger(e),!e.isDefaultPrevented()){c&&(h._jQueryInterface.call(a(c),"hide"),d||a(c).data(g,null));var i=this._getDimension();a(this._element).removeClass(o.COLLAPSE).addClass(o.COLLAPSING),this._element.style[i]=0,this._element.setAttribute("aria-expanded",!0),this._triggerArray.length&&a(this._triggerArray).removeClass(o.COLLAPSED).attr("aria-expanded",!0),this.setTransitioning(!0);var j=function(){a(b._element).removeClass(o.COLLAPSING).addClass(o.COLLAPSE).addClass(o.IN),b._element.style[i]="",b.setTransitioning(!1),a(b._element).trigger(n.SHOWN)};if(!f.supportsTransitionEnd())return void j();var l=i[0].toUpperCase()+i.slice(1),m="scroll"+l;a(this._element).one(f.TRANSITION_END,j).emulateTransitionEnd(k),this._element.style[i]=this._element[m]+"px"}}}}},{key:"hide",value:function(){var b=this;if(!this._isTransitioning&&a(this._element).hasClass(o.IN)){var c=a.Event(n.HIDE);if(a(this._element).trigger(c),!c.isDefaultPrevented()){var d=this._getDimension(),e=d===p.WIDTH?"offsetWidth":"offsetHeight";this._element.style[d]=this._element[e]+"px",f.reflow(this._element),a(this._element).addClass(o.COLLAPSING).removeClass(o.COLLAPSE).removeClass(o.IN),this._element.setAttribute("aria-expanded",!1),this._triggerArray.length&&a(this._triggerArray).addClass(o.COLLAPSED).attr("aria-expanded",!1),this.setTransitioning(!0);var g=function(){b.setTransitioning(!1),a(b._element).removeClass(o.COLLAPSING).addClass(o.COLLAPSE).trigger(n.HIDDEN)};return this._element.style[d]=0,f.supportsTransitionEnd()?void a(this._element).one(f.TRANSITION_END,g).emulateTransitionEnd(k):void g()}}}},{key:"setTransitioning",value:function(a){this._isTransitioning=a}},{key:"dispose",value:function(){a.removeData(this._element,g),this._config=null,this._parent=null,this._element=null,this._triggerArray=null,this._isTransitioning=null}},{key:"_getConfig",value:function(c){return c=a.extend({},l,c),c.toggle=Boolean(c.toggle),f.typeCheckConfig(b,c,m),c}},{key:"_getDimension",value:function(){var b=a(this._element).hasClass(p.WIDTH);return b?p.WIDTH:p.HEIGHT}},{key:"_getParent",value:function(){var b=this,c=a(this._config.parent)[0],d='[data-toggle="collapse"][data-parent="'+this._config.parent+'"]';return a(c).find(d).each(function(a,c){b._addAriaAndCollapsedClass(h._getTargetFromElement(c),[c])}),c}},{key:"_addAriaAndCollapsedClass",value:function(b,c){if(b){var d=a(b).hasClass(o.IN);b.setAttribute("aria-expanded",d),c.length&&a(c).toggleClass(o.COLLAPSED,!d).attr("aria-expanded",d)}}}],[{key:"_getTargetFromElement",value:function(b){var c=f.getSelectorFromElement(b);return c?a(c)[0]:null}},{key:"_jQueryInterface",value:function(b){return this.each(function(){var c=a(this),d=c.data(g),e=a.extend({},l,c.data(),"object"==typeof b&&b);if(!d&&e.toggle&&/show|hide/.test(b)&&(e.toggle=!1),d||(d=new h(this,e),c.data(g,d)),"string"==typeof b){if(void 0===d[b])throw new Error('No method named "'+b+'"');d[b]()}})}},{key:"VERSION",get:function(){return d}},{key:"Default",get:function(){return l}}]),h}();return a(document).on(n.CLICK_DATA_API,q.DATA_TOGGLE,function(b){b.preventDefault();var c=r._getTargetFromElement(this),d=a(c).data(g),e=d?"toggle":a(this).data();r._jQueryInterface.call(a(c),e)}),a.fn[b]=r._jQueryInterface,a.fn[b].Constructor=r,a.fn[b].noConflict=function(){return a.fn[b]=j,r._jQueryInterface},r}(jQuery),function(a){var b="dropdown",d="4.0.0-alpha.4",g="bs.dropdown",h="."+g,i=".data-api",j=a.fn[b],k=27,l=38,m=40,n=3,o={HIDE:"hide"+h,HIDDEN:"hidden"+h,SHOW:"show"+h,SHOWN:"shown"+h,CLICK:"click"+h,CLICK_DATA_API:"click"+h+i,KEYDOWN_DATA_API:"keydown"+h+i},p={BACKDROP:"dropdown-backdrop",DISABLED:"disabled",OPEN:"open"},q={BACKDROP:".dropdown-backdrop",DATA_TOGGLE:'[data-toggle="dropdown"]',FORM_CHILD:".dropdown form",ROLE_MENU:'[role="menu"]',ROLE_LISTBOX:'[role="listbox"]',NAVBAR_NAV:".navbar-nav",VISIBLE_ITEMS:'[role="menu"] li:not(.disabled) a, [role="listbox"] li:not(.disabled) a'},r=function(){function b(a){c(this,b),this._element=a,this._addEventListeners()}return e(b,[{key:"toggle",value:function(){if(this.disabled||a(this).hasClass(p.DISABLED))return!1;var c=b._getParentFromElement(this),d=a(c).hasClass(p.OPEN);if(b._clearMenus(),d)return!1;if("ontouchstart"in document.documentElement&&!a(c).closest(q.NAVBAR_NAV).length){var e=document.createElement("div");e.className=p.BACKDROP,a(e).insertBefore(this),a(e).on("click",b._clearMenus)}var f={relatedTarget:this},g=a.Event(o.SHOW,f);return a(c).trigger(g),!g.isDefaultPrevented()&&(this.focus(),this.setAttribute("aria-expanded","true"),a(c).toggleClass(p.OPEN),a(c).trigger(a.Event(o.SHOWN,f)),!1)}},{key:"dispose",value:function(){a.removeData(this._element,g),a(this._element).off(h),this._element=null}},{key:"_addEventListeners",value:function(){a(this._element).on(o.CLICK,this.toggle)}}],[{key:"_jQueryInterface",value:function(c){return this.each(function(){var d=a(this).data(g);if(d||a(this).data(g,d=new b(this)),"string"==typeof c){if(void 0===d[c])throw new Error('No method named "'+c+'"');d[c].call(this)}})}},{key:"_clearMenus",value:function(c){if(!c||c.which!==n){var d=a(q.BACKDROP)[0];d&&d.parentNode.removeChild(d);for(var e=a.makeArray(a(q.DATA_TOGGLE)),f=0;f<e.length;f++){var g=b._getParentFromElement(e[f]),h={relatedTarget:e[f]};if(a(g).hasClass(p.OPEN)&&!(c&&"click"===c.type&&/input|textarea/i.test(c.target.tagName)&&a.contains(g,c.target))){var i=a.Event(o.HIDE,h);a(g).trigger(i),i.isDefaultPrevented()||(e[f].setAttribute("aria-expanded","false"),a(g).removeClass(p.OPEN).trigger(a.Event(o.HIDDEN,h)))}}}}},{key:"_getParentFromElement",value:function(b){var c=void 0,d=f.getSelectorFromElement(b);return d&&(c=a(d)[0]),c||b.parentNode}},{key:"_dataApiKeydownHandler",value:function(c){if(/(38|40|27|32)/.test(c.which)&&!/input|textarea/i.test(c.target.tagName)&&(c.preventDefault(),c.stopPropagation(),!this.disabled&&!a(this).hasClass(p.DISABLED))){var d=b._getParentFromElement(this),e=a(d).hasClass(p.OPEN);if(!e&&c.which!==k||e&&c.which===k){if(c.which===k){var f=a(d).find(q.DATA_TOGGLE)[0];a(f).trigger("focus")}return void a(this).trigger("click")}var g=a.makeArray(a(q.VISIBLE_ITEMS));if(g=g.filter(function(a){return a.offsetWidth||a.offsetHeight}),g.length){var h=g.indexOf(c.target);c.which===l&&h>0&&h--,c.which===m&&h<g.length-1&&h++,h<0&&(h=0),g[h].focus()}}}},{key:"VERSION",get:function(){return d}}]),b}();return a(document).on(o.KEYDOWN_DATA_API,q.DATA_TOGGLE,r._dataApiKeydownHandler).on(o.KEYDOWN_DATA_API,q.ROLE_MENU,r._dataApiKeydownHandler).on(o.KEYDOWN_DATA_API,q.ROLE_LISTBOX,r._dataApiKeydownHandler).on(o.CLICK_DATA_API,r._clearMenus).on(o.CLICK_DATA_API,q.DATA_TOGGLE,r.prototype.toggle).on(o.CLICK_DATA_API,q.FORM_CHILD,function(a){a.stopPropagation()}),a.fn[b]=r._jQueryInterface,a.fn[b].Constructor=r,a.fn[b].noConflict=function(){return a.fn[b]=j,r._jQueryInterface},r}(jQuery),function(a){var b="modal",d="4.0.0-alpha.4",g="bs.modal",h="."+g,i=".data-api",j=a.fn[b],k=300,l=150,m=27,n={backdrop:!0,keyboard:!0,focus:!0,show:!0},o={backdrop:"(boolean|string)",keyboard:"boolean",focus:"boolean",show:"boolean"},p={HIDE:"hide"+h,HIDDEN:"hidden"+h,SHOW:"show"+h,SHOWN:"shown"+h,FOCUSIN:"focusin"+h,RESIZE:"resize"+h,CLICK_DISMISS:"click.dismiss"+h,KEYDOWN_DISMISS:"keydown.dismiss"+h,MOUSEUP_DISMISS:"mouseup.dismiss"+h,MOUSEDOWN_DISMISS:"mousedown.dismiss"+h,CLICK_DATA_API:"click"+h+i},q={SCROLLBAR_MEASURER:"modal-scrollbar-measure",BACKDROP:"modal-backdrop",OPEN:"modal-open",FADE:"fade",IN:"in"},r={DIALOG:".modal-dialog",DATA_TOGGLE:'[data-toggle="modal"]',DATA_DISMISS:'[data-dismiss="modal"]',FIXED_CONTENT:".navbar-fixed-top, .navbar-fixed-bottom, .is-fixed"},s=function(){function i(b,d){c(this,i),this._config=this._getConfig(d),this._element=b,this._dialog=a(b).find(r.DIALOG)[0],this._backdrop=null,this._isShown=!1,this._isBodyOverflowing=!1,this._ignoreBackdropClick=!1,this._originalBodyPadding=0,this._scrollbarWidth=0}return e(i,[{key:"toggle",value:function(a){return this._isShown?this.hide():this.show(a)}},{key:"show",value:function(b){var c=this,d=a.Event(p.SHOW,{relatedTarget:b});a(this._element).trigger(d),this._isShown||d.isDefaultPrevented()||(this._isShown=!0,this._checkScrollbar(),this._setScrollbar(),a(document.body).addClass(q.OPEN),this._setEscapeEvent(),this._setResizeEvent(),a(this._element).on(p.CLICK_DISMISS,r.DATA_DISMISS,a.proxy(this.hide,this)),a(this._dialog).on(p.MOUSEDOWN_DISMISS,function(){a(c._element).one(p.MOUSEUP_DISMISS,function(b){a(b.target).is(c._element)&&(c._ignoreBackdropClick=!0)})}),this._showBackdrop(a.proxy(this._showElement,this,b)))}},{key:"hide",value:function(b){b&&b.preventDefault();var c=a.Event(p.HIDE);a(this._element).trigger(c),this._isShown&&!c.isDefaultPrevented()&&(this._isShown=!1,this._setEscapeEvent(),this._setResizeEvent(),a(document).off(p.FOCUSIN),a(this._element).removeClass(q.IN),a(this._element).off(p.CLICK_DISMISS),a(this._dialog).off(p.MOUSEDOWN_DISMISS),f.supportsTransitionEnd()&&a(this._element).hasClass(q.FADE)?a(this._element).one(f.TRANSITION_END,a.proxy(this._hideModal,this)).emulateTransitionEnd(k):this._hideModal())}},{key:"dispose",value:function(){a.removeData(this._element,g),a(window).off(h),a(document).off(h),a(this._element).off(h),a(this._backdrop).off(h),this._config=null,this._element=null,this._dialog=null,this._backdrop=null,this._isShown=null,this._isBodyOverflowing=null,this._ignoreBackdropClick=null,this._originalBodyPadding=null,this._scrollbarWidth=null}},{key:"_getConfig",value:function(c){return c=a.extend({},n,c),f.typeCheckConfig(b,c,o),c}},{key:"_showElement",value:function(b){var c=this,d=f.supportsTransitionEnd()&&a(this._element).hasClass(q.FADE);this._element.parentNode&&this._element.parentNode.nodeType===Node.ELEMENT_NODE||document.body.appendChild(this._element),this._element.style.display="block",this._element.removeAttribute("aria-hidden"),this._element.scrollTop=0,d&&f.reflow(this._element),a(this._element).addClass(q.IN),this._config.focus&&this._enforceFocus();var e=a.Event(p.SHOWN,{relatedTarget:b}),g=function(){c._config.focus&&c._element.focus(),a(c._element).trigger(e)};d?a(this._dialog).one(f.TRANSITION_END,g).emulateTransitionEnd(k):g()}},{key:"_enforceFocus",value:function(){var b=this;a(document).off(p.FOCUSIN).on(p.FOCUSIN,function(c){document===c.target||b._element===c.target||a(b._element).has(c.target).length||b._element.focus()})}},{key:"_setEscapeEvent",value:function(){var b=this;this._isShown&&this._config.keyboard?a(this._element).on(p.KEYDOWN_DISMISS,function(a){a.which===m&&b.hide()}):this._isShown||a(this._element).off(p.KEYDOWN_DISMISS)}},{key:"_setResizeEvent",value:function(){this._isShown?a(window).on(p.RESIZE,a.proxy(this._handleUpdate,this)):a(window).off(p.RESIZE)}},{key:"_hideModal",value:function(){var b=this;this._element.style.display="none",this._element.setAttribute("aria-hidden","true"),this._showBackdrop(function(){a(document.body).removeClass(q.OPEN),b._resetAdjustments(),b._resetScrollbar(),a(b._element).trigger(p.HIDDEN)})}},{key:"_removeBackdrop",value:function(){this._backdrop&&(a(this._backdrop).remove(),this._backdrop=null)}},{key:"_showBackdrop",value:function(b){var c=this,d=a(this._element).hasClass(q.FADE)?q.FADE:"";if(this._isShown&&this._config.backdrop){var e=f.supportsTransitionEnd()&&d;if(this._backdrop=document.createElement("div"),this._backdrop.className=q.BACKDROP,d&&a(this._backdrop).addClass(d),a(this._backdrop).appendTo(document.body),a(this._element).on(p.CLICK_DISMISS,function(a){return c._ignoreBackdropClick?void(c._ignoreBackdropClick=!1):void(a.target===a.currentTarget&&("static"===c._config.backdrop?c._element.focus():c.hide()))}),e&&f.reflow(this._backdrop),a(this._backdrop).addClass(q.IN),!b)return;if(!e)return void b();a(this._backdrop).one(f.TRANSITION_END,b).emulateTransitionEnd(l)}else if(!this._isShown&&this._backdrop){a(this._backdrop).removeClass(q.IN);var g=function(){c._removeBackdrop(),b&&b()};f.supportsTransitionEnd()&&a(this._element).hasClass(q.FADE)?a(this._backdrop).one(f.TRANSITION_END,g).emulateTransitionEnd(l):g()}else b&&b()}},{key:"_handleUpdate",value:function(){this._adjustDialog()}},{key:"_adjustDialog",value:function(){var a=this._element.scrollHeight>document.documentElement.clientHeight;!this._isBodyOverflowing&&a&&(this._element.style.paddingLeft=this._scrollbarWidth+"px"),this._isBodyOverflowing&&!a&&(this._element.style.paddingRight=this._scrollbarWidth+"px")}},{key:"_resetAdjustments",value:function(){this._element.style.paddingLeft="",this._element.style.paddingRight=""}},{key:"_checkScrollbar",value:function(){this._isBodyOverflowing=document.body.clientWidth<window.innerWidth,this._scrollbarWidth=this._getScrollbarWidth()}},{key:"_setScrollbar",value:function(){var b=parseInt(a(r.FIXED_CONTENT).css("padding-right")||0,10);this._originalBodyPadding=document.body.style.paddingRight||"",this._isBodyOverflowing&&(document.body.style.paddingRight=b+this._scrollbarWidth+"px")}},{key:"_resetScrollbar",value:function(){document.body.style.paddingRight=this._originalBodyPadding}},{key:"_getScrollbarWidth",value:function(){var a=document.createElement("div");a.className=q.SCROLLBAR_MEASURER,document.body.appendChild(a);var b=a.offsetWidth-a.clientWidth;return document.body.removeChild(a),b}}],[{key:"_jQueryInterface",value:function(b,c){return this.each(function(){var d=a(this).data(g),e=a.extend({},i.Default,a(this).data(),"object"==typeof b&&b);if(d||(d=new i(this,e),a(this).data(g,d)),"string"==typeof b){if(void 0===d[b])throw new Error('No method named "'+b+'"');d[b](c)}else e.show&&d.show(c)})}},{key:"VERSION",get:function(){return d}},{key:"Default",get:function(){return n}}]),i}();return a(document).on(p.CLICK_DATA_API,r.DATA_TOGGLE,function(b){var c=this,d=void 0,e=f.getSelectorFromElement(this);e&&(d=a(e)[0]);var h=a(d).data(g)?"toggle":a.extend({},a(d).data(),a(this).data());"A"===this.tagName&&b.preventDefault();var i=a(d).one(p.SHOW,function(b){b.isDefaultPrevented()||i.one(p.HIDDEN,function(){a(c).is(":visible")&&c.focus()})});s._jQueryInterface.call(a(d),h,this)}),a.fn[b]=s._jQueryInterface,a.fn[b].Constructor=s,a.fn[b].noConflict=function(){return a.fn[b]=j,s._jQueryInterface},s}(jQuery),function(a){var b="scrollspy",d="4.0.0-alpha.4",g="bs.scrollspy",h="."+g,i=".data-api",j=a.fn[b],k={offset:10,method:"auto",target:""},l={offset:"number",method:"string",target:"(string|element)"},m={ACTIVATE:"activate"+h,SCROLL:"scroll"+h,LOAD_DATA_API:"load"+h+i},n={DROPDOWN_ITEM:"dropdown-item",DROPDOWN_MENU:"dropdown-menu",NAV_LINK:"nav-link",NAV:"nav",ACTIVE:"active"},o={DATA_SPY:'[data-spy="scroll"]',ACTIVE:".active",LIST_ITEM:".list-item",LI:"li",LI_DROPDOWN:"li.dropdown",NAV_LINKS:".nav-link",DROPDOWN:".dropdown",DROPDOWN_ITEMS:".dropdown-item",DROPDOWN_TOGGLE:".dropdown-toggle"},p={OFFSET:"offset",POSITION:"position"},q=function(){function i(b,d){c(this,i),this._element=b,this._scrollElement="BODY"===b.tagName?window:b,this._config=this._getConfig(d),this._selector=this._config.target+" "+o.NAV_LINKS+","+(this._config.target+" "+o.DROPDOWN_ITEMS),this._offsets=[],this._targets=[],this._activeTarget=null,this._scrollHeight=0,a(this._scrollElement).on(m.SCROLL,a.proxy(this._process,this)),this.refresh(),this._process()}return e(i,[{key:"refresh",value:function(){var b=this,c=this._scrollElement!==this._scrollElement.window?p.POSITION:p.OFFSET,d="auto"===this._config.method?c:this._config.method,e=d===p.POSITION?this._getScrollTop():0;this._offsets=[],this._targets=[],this._scrollHeight=this._getScrollHeight();var g=a.makeArray(a(this._selector));g.map(function(b){var c=void 0,g=f.getSelectorFromElement(b);return g&&(c=a(g)[0]),c&&(c.offsetWidth||c.offsetHeight)?[a(c)[d]().top+e,g]:null}).filter(function(a){return a}).sort(function(a,b){return a[0]-b[0]}).forEach(function(a){b._offsets.push(a[0]),b._targets.push(a[1])})}},{key:"dispose",value:function(){a.removeData(this._element,g),a(this._scrollElement).off(h),this._element=null,this._scrollElement=null,this._config=null,this._selector=null,this._offsets=null,this._targets=null,this._activeTarget=null,this._scrollHeight=null}},{key:"_getConfig",value:function(c){if(c=a.extend({},k,c),"string"!=typeof c.target){var d=a(c.target).attr("id");d||(d=f.getUID(b),a(c.target).attr("id",d)),c.target="#"+d}return f.typeCheckConfig(b,c,l),c}},{key:"_getScrollTop",value:function(){return this._scrollElement===window?this._scrollElement.scrollY:this._scrollElement.scrollTop}},{key:"_getScrollHeight",value:function(){return this._scrollElement.scrollHeight||Math.max(document.body.scrollHeight,document.documentElement.scrollHeight)}},{key:"_process",value:function(){var a=this._getScrollTop()+this._config.offset,b=this._getScrollHeight(),c=this._config.offset+b-this._scrollElement.offsetHeight;if(this._scrollHeight!==b&&this.refresh(),a>=c){var d=this._targets[this._targets.length-1];this._activeTarget!==d&&this._activate(d)}if(this._activeTarget&&a<this._offsets[0])return this._activeTarget=null,void this._clear();for(var e=this._offsets.length;e--;){var f=this._activeTarget!==this._targets[e]&&a>=this._offsets[e]&&(void 0===this._offsets[e+1]||a<this._offsets[e+1]);f&&this._activate(this._targets[e])}}},{key:"_activate",value:function(b){this._activeTarget=b,this._clear();var c=this._selector.split(",");c=c.map(function(a){return a+'[data-target="'+b+'"],'+(a+'[href="'+b+'"]')});var d=a(c.join(","));d.hasClass(n.DROPDOWN_ITEM)?(d.closest(o.DROPDOWN).find(o.DROPDOWN_TOGGLE).addClass(n.ACTIVE),d.addClass(n.ACTIVE)):d.parents(o.LI).find(o.NAV_LINKS).addClass(n.ACTIVE),a(this._scrollElement).trigger(m.ACTIVATE,{relatedTarget:b})}},{key:"_clear",value:function(){a(this._selector).filter(o.ACTIVE).removeClass(n.ACTIVE)}}],[{key:"_jQueryInterface",value:function(b){return this.each(function(){var c=a(this).data(g),d="object"==typeof b&&b||null;if(c||(c=new i(this,d),a(this).data(g,c)),"string"==typeof b){if(void 0===c[b])throw new Error('No method named "'+b+'"');c[b]()}})}},{key:"VERSION",get:function(){return d}},{key:"Default",get:function(){return k}}]),i}();return a(window).on(m.LOAD_DATA_API,function(){for(var b=a.makeArray(a(o.DATA_SPY)),c=b.length;c--;){var d=a(b[c]);q._jQueryInterface.call(d,d.data())}}),a.fn[b]=q._jQueryInterface,a.fn[b].Constructor=q,a.fn[b].noConflict=function(){return a.fn[b]=j,q._jQueryInterface},q}(jQuery),function(a){var b="tab",d="4.0.0-alpha.4",g="bs.tab",h="."+g,i=".data-api",j=a.fn[b],k=150,l={HIDE:"hide"+h,HIDDEN:"hidden"+h,SHOW:"show"+h,SHOWN:"shown"+h,CLICK_DATA_API:"click"+h+i},m={DROPDOWN_MENU:"dropdown-menu",ACTIVE:"active",FADE:"fade",IN:"in"},n={A:"a",LI:"li",DROPDOWN:".dropdown",UL:"ul:not(.dropdown-menu)",FADE_CHILD:"> .nav-item .fade, > .fade",
ACTIVE:".active",ACTIVE_CHILD:"> .nav-item > .active, > .active",DATA_TOGGLE:'[data-toggle="tab"], [data-toggle="pill"]',DROPDOWN_TOGGLE:".dropdown-toggle",DROPDOWN_ACTIVE_CHILD:"> .dropdown-menu .active"},o=function(){function b(a){c(this,b),this._element=a}return e(b,[{key:"show",value:function(){var b=this;if(!this._element.parentNode||this._element.parentNode.nodeType!==Node.ELEMENT_NODE||!a(this._element).hasClass(m.ACTIVE)){var c=void 0,d=void 0,e=a(this._element).closest(n.UL)[0],g=f.getSelectorFromElement(this._element);e&&(d=a.makeArray(a(e).find(n.ACTIVE)),d=d[d.length-1]);var h=a.Event(l.HIDE,{relatedTarget:this._element}),i=a.Event(l.SHOW,{relatedTarget:d});if(d&&a(d).trigger(h),a(this._element).trigger(i),!i.isDefaultPrevented()&&!h.isDefaultPrevented()){g&&(c=a(g)[0]),this._activate(this._element,e);var j=function(){var c=a.Event(l.HIDDEN,{relatedTarget:b._element}),e=a.Event(l.SHOWN,{relatedTarget:d});a(d).trigger(c),a(b._element).trigger(e)};c?this._activate(c,c.parentNode,j):j()}}}},{key:"dispose",value:function(){a.removeClass(this._element,g),this._element=null}},{key:"_activate",value:function(b,c,d){var e=a(c).find(n.ACTIVE_CHILD)[0],g=d&&f.supportsTransitionEnd()&&(e&&a(e).hasClass(m.FADE)||Boolean(a(c).find(n.FADE_CHILD)[0])),h=a.proxy(this._transitionComplete,this,b,e,g,d);e&&g?a(e).one(f.TRANSITION_END,h).emulateTransitionEnd(k):h(),e&&a(e).removeClass(m.IN)}},{key:"_transitionComplete",value:function(b,c,d,e){if(c){a(c).removeClass(m.ACTIVE);var g=a(c).find(n.DROPDOWN_ACTIVE_CHILD)[0];g&&a(g).removeClass(m.ACTIVE),c.setAttribute("aria-expanded",!1)}if(a(b).addClass(m.ACTIVE),b.setAttribute("aria-expanded",!0),d?(f.reflow(b),a(b).addClass(m.IN)):a(b).removeClass(m.FADE),b.parentNode&&a(b.parentNode).hasClass(m.DROPDOWN_MENU)){var h=a(b).closest(n.DROPDOWN)[0];h&&a(h).find(n.DROPDOWN_TOGGLE).addClass(m.ACTIVE),b.setAttribute("aria-expanded",!0)}e&&e()}}],[{key:"_jQueryInterface",value:function(c){return this.each(function(){var d=a(this),e=d.data(g);if(e||(e=e=new b(this),d.data(g,e)),"string"==typeof c){if(void 0===e[c])throw new Error('No method named "'+c+'"');e[c]()}})}},{key:"VERSION",get:function(){return d}}]),b}();return a(document).on(l.CLICK_DATA_API,n.DATA_TOGGLE,function(b){b.preventDefault(),o._jQueryInterface.call(a(this),"show")}),a.fn[b]=o._jQueryInterface,a.fn[b].Constructor=o,a.fn[b].noConflict=function(){return a.fn[b]=j,o._jQueryInterface},o}(jQuery),function(a){if(void 0===window.Tether)throw new Error("Bootstrap tooltips require Tether (http://github.hubspot.com/tether/)");var b="tooltip",d="4.0.0-alpha.4",g="bs.tooltip",h="."+g,i=a.fn[b],j=150,k="bs-tether",l={animation:!0,template:'<div class="tooltip" role="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>',trigger:"hover focus",title:"",delay:0,html:!1,selector:!1,placement:"top",offset:"0 0",constraints:[]},m={animation:"boolean",template:"string",title:"(string|element|function)",trigger:"string",delay:"(number|object)",html:"boolean",selector:"(string|boolean)",placement:"(string|function)",offset:"string",constraints:"array"},n={TOP:"bottom center",RIGHT:"middle left",BOTTOM:"top center",LEFT:"middle right"},o={IN:"in",OUT:"out"},p={HIDE:"hide"+h,HIDDEN:"hidden"+h,SHOW:"show"+h,SHOWN:"shown"+h,INSERTED:"inserted"+h,CLICK:"click"+h,FOCUSIN:"focusin"+h,FOCUSOUT:"focusout"+h,MOUSEENTER:"mouseenter"+h,MOUSELEAVE:"mouseleave"+h},q={FADE:"fade",IN:"in"},r={TOOLTIP:".tooltip",TOOLTIP_INNER:".tooltip-inner"},s={element:!1,enabled:!1},t={HOVER:"hover",FOCUS:"focus",CLICK:"click",MANUAL:"manual"},u=function(){function i(a,b){c(this,i),this._isEnabled=!0,this._timeout=0,this._hoverState="",this._activeTrigger={},this._tether=null,this.element=a,this.config=this._getConfig(b),this.tip=null,this._setListeners()}return e(i,[{key:"enable",value:function(){this._isEnabled=!0}},{key:"disable",value:function(){this._isEnabled=!1}},{key:"toggleEnabled",value:function(){this._isEnabled=!this._isEnabled}},{key:"toggle",value:function(b){if(b){var c=this.constructor.DATA_KEY,d=a(b.currentTarget).data(c);d||(d=new this.constructor(b.currentTarget,this._getDelegateConfig()),a(b.currentTarget).data(c,d)),d._activeTrigger.click=!d._activeTrigger.click,d._isWithActiveTrigger()?d._enter(null,d):d._leave(null,d)}else{if(a(this.getTipElement()).hasClass(q.IN))return void this._leave(null,this);this._enter(null,this)}}},{key:"dispose",value:function(){clearTimeout(this._timeout),this.cleanupTether(),a.removeData(this.element,this.constructor.DATA_KEY),a(this.element).off(this.constructor.EVENT_KEY),this.tip&&a(this.tip).remove(),this._isEnabled=null,this._timeout=null,this._hoverState=null,this._activeTrigger=null,this._tether=null,this.element=null,this.config=null,this.tip=null}},{key:"show",value:function(){var b=this,c=a.Event(this.constructor.Event.SHOW);if(this.isWithContent()&&this._isEnabled){a(this.element).trigger(c);var d=a.contains(this.element.ownerDocument.documentElement,this.element);if(c.isDefaultPrevented()||!d)return;var e=this.getTipElement(),g=f.getUID(this.constructor.NAME);e.setAttribute("id",g),this.element.setAttribute("aria-describedby",g),this.setContent(),this.config.animation&&a(e).addClass(q.FADE);var h="function"==typeof this.config.placement?this.config.placement.call(this,e,this.element):this.config.placement,j=this._getAttachment(h);a(e).data(this.constructor.DATA_KEY,this).appendTo(document.body),a(this.element).trigger(this.constructor.Event.INSERTED),this._tether=new Tether({attachment:j,element:e,target:this.element,classes:s,classPrefix:k,offset:this.config.offset,constraints:this.config.constraints,addTargetClasses:!1}),f.reflow(e),this._tether.position(),a(e).addClass(q.IN);var l=function(){var c=b._hoverState;b._hoverState=null,a(b.element).trigger(b.constructor.Event.SHOWN),c===o.OUT&&b._leave(null,b)};if(f.supportsTransitionEnd()&&a(this.tip).hasClass(q.FADE))return void a(this.tip).one(f.TRANSITION_END,l).emulateTransitionEnd(i._TRANSITION_DURATION);l()}}},{key:"hide",value:function(b){var c=this,d=this.getTipElement(),e=a.Event(this.constructor.Event.HIDE),g=function(){c._hoverState!==o.IN&&d.parentNode&&d.parentNode.removeChild(d),c.element.removeAttribute("aria-describedby"),a(c.element).trigger(c.constructor.Event.HIDDEN),c.cleanupTether(),b&&b()};a(this.element).trigger(e),e.isDefaultPrevented()||(a(d).removeClass(q.IN),f.supportsTransitionEnd()&&a(this.tip).hasClass(q.FADE)?a(d).one(f.TRANSITION_END,g).emulateTransitionEnd(j):g(),this._hoverState="")}},{key:"isWithContent",value:function(){return Boolean(this.getTitle())}},{key:"getTipElement",value:function(){return this.tip=this.tip||a(this.config.template)[0]}},{key:"setContent",value:function(){var b=a(this.getTipElement());this.setElementContent(b.find(r.TOOLTIP_INNER),this.getTitle()),b.removeClass(q.FADE).removeClass(q.IN),this.cleanupTether()}},{key:"setElementContent",value:function(b,c){var d=this.config.html;"object"==typeof c&&(c.nodeType||c.jquery)?d?a(c).parent().is(b)||b.empty().append(c):b.text(a(c).text()):b[d?"html":"text"](c)}},{key:"getTitle",value:function(){var a=this.element.getAttribute("data-original-title");return a||(a="function"==typeof this.config.title?this.config.title.call(this.element):this.config.title),a}},{key:"cleanupTether",value:function(){this._tether&&this._tether.destroy()}},{key:"_getAttachment",value:function(a){return n[a.toUpperCase()]}},{key:"_setListeners",value:function(){var b=this,c=this.config.trigger.split(" ");c.forEach(function(c){if("click"===c)a(b.element).on(b.constructor.Event.CLICK,b.config.selector,a.proxy(b.toggle,b));else if(c!==t.MANUAL){var d=c===t.HOVER?b.constructor.Event.MOUSEENTER:b.constructor.Event.FOCUSIN,e=c===t.HOVER?b.constructor.Event.MOUSELEAVE:b.constructor.Event.FOCUSOUT;a(b.element).on(d,b.config.selector,a.proxy(b._enter,b)).on(e,b.config.selector,a.proxy(b._leave,b))}}),this.config.selector?this.config=a.extend({},this.config,{trigger:"manual",selector:""}):this._fixTitle()}},{key:"_fixTitle",value:function(){var a=typeof this.element.getAttribute("data-original-title");(this.element.getAttribute("title")||"string"!==a)&&(this.element.setAttribute("data-original-title",this.element.getAttribute("title")||""),this.element.setAttribute("title",""))}},{key:"_enter",value:function(b,c){var d=this.constructor.DATA_KEY;return c=c||a(b.currentTarget).data(d),c||(c=new this.constructor(b.currentTarget,this._getDelegateConfig()),a(b.currentTarget).data(d,c)),b&&(c._activeTrigger["focusin"===b.type?t.FOCUS:t.HOVER]=!0),a(c.getTipElement()).hasClass(q.IN)||c._hoverState===o.IN?void(c._hoverState=o.IN):(clearTimeout(c._timeout),c._hoverState=o.IN,c.config.delay&&c.config.delay.show?void(c._timeout=setTimeout(function(){c._hoverState===o.IN&&c.show()},c.config.delay.show)):void c.show())}},{key:"_leave",value:function(b,c){var d=this.constructor.DATA_KEY;if(c=c||a(b.currentTarget).data(d),c||(c=new this.constructor(b.currentTarget,this._getDelegateConfig()),a(b.currentTarget).data(d,c)),b&&(c._activeTrigger["focusout"===b.type?t.FOCUS:t.HOVER]=!1),!c._isWithActiveTrigger())return clearTimeout(c._timeout),c._hoverState=o.OUT,c.config.delay&&c.config.delay.hide?void(c._timeout=setTimeout(function(){c._hoverState===o.OUT&&c.hide()},c.config.delay.hide)):void c.hide()}},{key:"_isWithActiveTrigger",value:function(){for(var a in this._activeTrigger)if(this._activeTrigger[a])return!0;return!1}},{key:"_getConfig",value:function(c){return c=a.extend({},this.constructor.Default,a(this.element).data(),c),c.delay&&"number"==typeof c.delay&&(c.delay={show:c.delay,hide:c.delay}),f.typeCheckConfig(b,c,this.constructor.DefaultType),c}},{key:"_getDelegateConfig",value:function(){var a={};if(this.config)for(var b in this.config)this.constructor.Default[b]!==this.config[b]&&(a[b]=this.config[b]);return a}}],[{key:"_jQueryInterface",value:function(b){return this.each(function(){var c=a(this).data(g),d="object"==typeof b?b:null;if((c||!/destroy|hide/.test(b))&&(c||(c=new i(this,d),a(this).data(g,c)),"string"==typeof b)){if(void 0===c[b])throw new Error('No method named "'+b+'"');c[b]()}})}},{key:"VERSION",get:function(){return d}},{key:"Default",get:function(){return l}},{key:"NAME",get:function(){return b}},{key:"DATA_KEY",get:function(){return g}},{key:"Event",get:function(){return p}},{key:"EVENT_KEY",get:function(){return h}},{key:"DefaultType",get:function(){return m}}]),i}();return a.fn[b]=u._jQueryInterface,a.fn[b].Constructor=u,a.fn[b].noConflict=function(){return a.fn[b]=i,u._jQueryInterface},u}(jQuery));(function(a){var f="popover",h="4.0.0-alpha.4",i="bs.popover",j="."+i,k=a.fn[f],l=a.extend({},g.Default,{placement:"right",trigger:"click",content:"",template:'<div class="popover" role="tooltip"><div class="popover-arrow"></div><h3 class="popover-title"></h3><div class="popover-content"></div></div>'}),m=a.extend({},g.DefaultType,{content:"(string|element|function)"}),n={FADE:"fade",IN:"in"},o={TITLE:".popover-title",CONTENT:".popover-content",ARROW:".popover-arrow"},p={HIDE:"hide"+j,HIDDEN:"hidden"+j,SHOW:"show"+j,SHOWN:"shown"+j,INSERTED:"inserted"+j,CLICK:"click"+j,FOCUSIN:"focusin"+j,FOCUSOUT:"focusout"+j,MOUSEENTER:"mouseenter"+j,MOUSELEAVE:"mouseleave"+j},q=function(g){function k(){c(this,k),d(Object.getPrototypeOf(k.prototype),"constructor",this).apply(this,arguments)}return b(k,g),e(k,[{key:"isWithContent",value:function(){return this.getTitle()||this._getContent()}},{key:"getTipElement",value:function(){return this.tip=this.tip||a(this.config.template)[0]}},{key:"setContent",value:function(){var b=a(this.getTipElement());this.setElementContent(b.find(o.TITLE),this.getTitle()),this.setElementContent(b.find(o.CONTENT),this._getContent()),b.removeClass(n.FADE).removeClass(n.IN),this.cleanupTether()}},{key:"_getContent",value:function(){return this.element.getAttribute("data-content")||("function"==typeof this.config.content?this.config.content.call(this.element):this.config.content)}}],[{key:"_jQueryInterface",value:function(b){return this.each(function(){var c=a(this).data(i),d="object"==typeof b?b:null;if((c||!/destroy|hide/.test(b))&&(c||(c=new k(this,d),a(this).data(i,c)),"string"==typeof b)){if(void 0===c[b])throw new Error('No method named "'+b+'"');c[b]()}})}},{key:"VERSION",get:function(){return h}},{key:"Default",get:function(){return l}},{key:"NAME",get:function(){return f}},{key:"DATA_KEY",get:function(){return i}},{key:"Event",get:function(){return p}},{key:"EVENT_KEY",get:function(){return j}},{key:"DefaultType",get:function(){return m}}]),k}(g);return a.fn[f]=q._jQueryInterface,a.fn[f].Constructor=q,a.fn[f].noConflict=function(){return a.fn[f]=k,q._jQueryInterface},q})(jQuery)}(jQuery);