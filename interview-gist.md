# 高频面试考点

## 类型判断与类型转换

## this

## new都做了哪些事情/手写new

## 浏览器中的事件机制与React事件机制

> `SyntheticEvent` 实例将被传递给你的事件处理函数，`它是浏览器的原生事件的跨浏览器包装器`。除兼容所有浏览器外，它还拥有和浏览器原生事件相同的接口，包括 stopPropagation() 和 preventDefault()。

> 合成事件与浏览器的原生事件不同，也不会直接映射到原生事件。

> `实际上合成事件的意思就是使用原生事件合成一个 React 事件`， 例如使用原生click事件合成了onClick事件，使用原生mouseout事件合成了onMouseLeave事件，原生事件和合成事件类型大部分都是一一对应，只有涉及到兼容性问题时我们才需要使用不对应的事件合成。

### React事件机制工作原理

#### 事件绑定



#### 事件触发


### 手写call/apply/bind

## 深拷贝与浅拷贝，手写深拷贝函数

## 原型与原型链

## 继承方式（原型链继承、借用构造函数继承、组合继承、寄生组合式继承等）

## 变量提升/暂时性死区

## 模块化（AMD、CMD、CommonJS、UMD、ES Module）

### AMD VS CMD
AMD：依赖前置，提前加载并初始化
CMD：依赖就近，引用时才初始化

### CommonJS vs ESM

CommonJS：主要用于服务端，同步加载，返回值的拷贝；
ESM：主要用于客户端，异步加载，返回值的引用；


## Generator函数

## 手写Promise

## 浏览器与Node中的Event Loop
### Node中的Event Loop
- `timer`: 执行setTimeout及setInterval回调，并且是受poll阶段控制的
- `pending callbacks`：执行上一轮循环中的poll 阶段被延迟执行的 `I/O 回调`
- `Idle/prepare`：这个阶段内部使用；
- `poll`：队列不为空时执行回调队列，直至队列为空；然后检查是否有setImmediate需要执行，存在则结束poll阶段并进入check阶段；
- `check`: 执行setImmediate
- `close callbacks`：执行关闭操作，如关闭socket等；
![](./assets/Node-EventLoop.awebp)


## 跨域

> 跨域定义；同源策略；跨域方法（JSONP/CORS/document.domain/postMessage）；预检请求；

## 存储

> cookie/ localStorage / sessionStorage / indexDB

> cookie相关字段：`http-only`、`secure`、`same-site`

## 浏览器缓存机制

> 强缓存与协商缓存


## 浏览器渲染原理


## 浏览器安全防范（XSS、CSRF、点击劫持、中间人攻击）


## 性能优化

- 图片（css代替、雪碧图、小图base64、合适的尺寸裁剪、合适的格式、CDN）
- 加载（http2、gzip、DNS预解析、预加载、预渲染、懒加载、CDN、节流与防抖）
- webpack
    1. 减少打包时间（优化loader（搜索范围、缓存已编译文件）、HappyPack多线程loader、DllPlugin将特定的类库提前打包然后引入并用DllReferencePlugin引入、`webpack-parallel-uglify-plugin`并行运行 `UglifyJS`、`module.noParse`及`resolve.alias`）
    2. 减小打包体积（按需加载、`Scope Hoisting`——开启`optimization.concatenateModules`、`Tree Shaking`、开启gzip压缩）
- 首屏（）


## 输入 URL 到页面渲染的整个流程

参考github[这篇文章](https://github.com/alex/what-happens-when)


---
# React相关


## React事件系统

### 为什么自定义事件系统

- 抹平浏览器间的兼容性差异
- 自定义高级事件（React的onChange事件等）
- 性能优化：比如利用事件委托机制，大部分事件都绑定到了Document，而不是DOM结点本身，简化DOM事件处理逻辑，减少了内存开销；
- 干预事件的分发：React Fiber为优化用户体验，高优先级的事件会中断低优先级的事件

### React事件机制工作原理

包括`事件绑定`和`事件触发`

#### React 是如何绑定事件的 ?



#### React 是如何触发事件的?

### React 17中事件系统有哪些新特性

## Preact与react差异

1. Preact裁剪了事件机制，直接在DOM元素上进行事件绑定的




---

# 手写代码


## instanceof

```js
function _instanceof(obj, constructor) {
    if (obj === null || typeof constructor !== 'function') return false;
    let proto = obj.__proto__;
    const prototype = constructor.prototype;

    while (proto) {
        if (proto === prototype) {
            return true;
        }

        proto = proto.__proto__;
    }

    return false;
}

```

## 深拷贝

```js
let map = new WeakMap();

function deepClone(obj) {
    if (obj instanceof Object) {
        if (map.has(obj)) {
            return map.get(obj);
        }

        let newObj;

        if (obj instanceof Array) {
            newObj = [];
        } else if (obj instanceof Function) {
            newObj = function() {
                return obj.apply(this, arguments);
            }
        } else if (obj instanceof RegExp) {
            newObj = new RegExp(obj.source, obj.flags);
        } else if (obj instanceof Date) {
            newObj = new Date(obj);
        } else {
            newObj = {}
        }

        let desc = Object.getOwnPropertyDescriptors(obj);
        let clone = Object.create(Object.getPrototypeOf(obj), desc);

        map.set(obj, clone);

        for (let key in obj) {
            if (obj.hasOwnProperty(key)) {
                newObj[key] = deepClone(obj[key]);
            }
        }

        return newObj;
    }

    // 原始类型直接返回
    return obj;
}
```

以上代码解决了常见类型的 copy 及`循环引用`的问题


## 手写new

在调用 new 的过程中会发生以上四件事情：
- 新生成了一个对象
- 链接到原型
- 绑定this
- 返回新对象

```js
function create() {
    let obj = {};
    let Con = [].shift.call(arguments);

    obj.__proto__ = Con.prototype; // obj = Object.create(Con.prototype);
    let result = Con.apply(obj, arguments);

    return result instanceof Object ? result : obj;
}
```


## 手写call/apply/bind

```js
// 
Function.prototype.myCall = function(context) {
    if (typeof context === undefined || typeof context === null) {
        context = window;
    }

    const symbol = Symbol();
    context[symbol] = this;
    const args = [...arguments].slice(1);
    const res = context[symbol](...args);

    delete context[symbol];

    return res;
}

Function.prototype.myApply = function (context) {
    if (typeof context === undefined || typeof context === null) {
        context = window;
    }

    const symbol = Symbol();
    context[symbol] = this;
    let res;

    if (arguments[1]) {
        res = context[symbol](...arguments[1]);
    } else {
        res = context[symbol]();
    }

    delete context[symbol];

    return res;
}

Function.prototype.myBind = function (context) {
    if (typeof context === undefined || typeof context === null) {
        context = window;
    }

    const self = this;
    const args = [...arguments].slice(1);

    return function F() {
        // 因为返回了一个函数，我们可以 new F()，所以需要判断
        if (this instanceof F) {
            return new _this(...args, ...arguments);
        }

        return self.apply(context, args.concat(...arguments));
    }
}
```


## Generator原理及实现

```js
// demo
function* test() {
    let a = 1 + 2;
    yield 2;
    yield 3;
}

var b = test(); // 获取生成器对象
console.log(b.next()) // { value: 2, done: false }
console.log(b.next()) // { value: 3, done: false }
console.log(b.next()) // { value: undefined, done: true }

// generator函数简单实现
// 这里cb也就是编译过的 test 函数
function generator(cb) {
    return (function() {
        var object = {
            next: 0,
            stop: function() {},
        }

        return {
            next: function() {
                let ret = cb(object);

                if (ret === undefined) {
                    return {
                        value: undefined,
                        done: true,
                    }
                }

                return {
                    value: ret,
                    done: false,
                }
            }
        }
    })();
}


// 如果你使用 babel 编译后可以发现 test 函数变成了这样
function test() {
    var a;
    return generator(_context) {
        while (1) {
            switch (_context.prev = _context.next) {
                case 0:
                    a = 1 + 2;
                    _context.next = 3;
                    return 2;
                case 3:
                    _context.next = 5;
                    return 3;
                case 5:
                case 'end':
                    return _context.stop();
            }
        }
    }
}

```


## 双向数据绑定


## 手写Promise

```js
const PENDING = 'pending'
const RESOLVED = 'resolved'
const REJECTED = 'rejected'

// promise接收一个函数，该函数会立即执行
function MyPromise (fn) {
    let _this = this;
    _this.currentState = PENDING;
    _this.value = undefined;
    // 用于保存then中的回调，只有当promise状态为pending时才会缓存，并且每个实例至多缓存一个
    _this.resolvedCallback = [];
    _this.rejectedCallback = [];
    
    _this.resolve = function (value) {
        if (value instanceof MyPromise) {
            // 如果value是个Promise，递归执行
            return value.then(_this.resolve, _this.reject);
        }

        setTimeout(() => { // 异步执行，保证执行顺序
            if (_this.currentState === PENDING) {
                _this.currentState = RESOLVED;
                _this.value = value;
                _this.resolvedCallback.forEach(cb => cb());
            }
        })
    }

    _this.reject = function (reason) {
        setTimeout(() => { // 异步执行，保证执行顺序
            if (_this.currentState === PENDING) {
                _this.currentState = REJECTED;
                _this.value = reason;
                _this.rejectedCallback.forEach(cb => cb());
            }
        })
    }

    // 用于解决以下问题
    // new Promise(() => throw Error('error))
    try {
        fn(_this.resolve, _this.reject);
    } catch (e) {
        _this.reject(e);
    }
}

MyPromise.prototype.then = function (onResolved, onRejected) {
    var self = this;
    // 规范 2.2.7，then 必须返回一个新的 promise
    var promise2;
    // 规范 2.2.onResolved 和 onRejected 都为可选参数
    // 如果类型不是函数需要忽略，同时也实现了透传
    // Promise.resolve(4).then().then((value) => console.log(value))
    onResolved = typeof onResolved === 'function' ? onResolved : v => v;
    onRejected = typeof onRejected === 'function' ? onRejected : r => throw r;

    if (self.currentState === RESOLVED) {
        return (promise2 = new MyPromise(function(resolve, reject) {
            // 规范 2.2.4，保证 onFulfilled，onRjected 异步执行
            // 所以用了 setTimeout 包裹下
            setTimeout(function() {
                try {
                    x = onResolved(self.value);
                    resolutionProcedure(promise2, x, resolve, reject);
                } catch (reason) {
                    reject(reason)
                }
            })
        }));
    }

    if (self.currentState === REJECTED) {
        return (promise2 = new MyPromise(function (resolve, reject) {
            setTimeout(function () {
            // 异步执行onRejected
                try {
                    var x = onRejected(self.value);
                    resolutionProcedure(promise2, x, resolve, reject);
                } catch (reason) {
                    reject(reason);
                }
            });
        }));
    }

    if (self.currentState === PENDING) {
        return (promise2 = new MyPromise(function (resolve, reject) {
            self.resolvedCallbacks.push(function () {
                // 考虑到可能会有报错，所以使用 try/catch 包裹
                try {
                    var x = onResolved(self.value);
                    resolutionProcedure(promise2, x, resolve, reject);
                } catch (r) {
                    reject(r);
                }
            });

            self.rejectedCallbacks.push(function () {
                try {
                    var x = onRejected(self.value);
                    resolutionProcedure(promise2, x, resolve, reject);
                } catch (r) {
                    reject(r);
                }
            });
        }));
    }

    function resolutionProcedure(promise2, x, resolve, reject) {
        // 规范 2.3.1，x 不能和 promise2 相同，避免循环引用
        if (promise2 === x) {
            return reject(new TypeError('error'));
        }

        // 如果 x 为 Promise，状态为 pending 需要继续等待否则执行
        if (x instanceof MyPromise) {
            if (x.currentState === PENDING) {
                x.then(function (value) {
                    // 再次调用该函数是为了确认 x resolve 的
                    // 参数是什么类型，如果是基本类型就再次 resolve
                    // 把值传给下个 then
                    resolutionProcedure(promise2, value, resolve, reject);
                }, reject);
            } else {
                x.then(resolve, reject);
            }
            return;
        }

        // reject 或者 resolve 其中一个执行过得话，忽略其他的
        let called = false;
        // 判断 x 是否为对象或者函数
        if (x !== null && (typeof x === 'object' || typeof x === 'function')) {
            try {
                let then = x.then;
                if (typeof then === 'function') {
                    then.call(
                        x,
                        y => {
                            if (called) return;
                            called = true;
                            resolutionProcedure(promise2, y, resolve, reject);
                        },
                        e => {
                            if (called) return;
                            called = true;
                            reject(e);
                        }
                    );
                } else {
                    resolve(x);
                }
            } catch (e) {
                if (called) return;
                called = true;
                reject(e);
            }
        } else {
            // 规范 2.3.4，x 为基本类型
            resolve(x);
        }
    }
}

```