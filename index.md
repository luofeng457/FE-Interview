## JS

### 为什么`typeof null === 'object'`?

A: [The history of “typeof null”](https://2ality.com/2013/10/typeof-null.html)
第一版JS是用32位比特来存储值的，且通过低1或3位来识别类型的
 `1:整型`， `000:引用类型（object）`，`010：双精度浮点型（double）`，`100：字符串（string）`，`110：布尔型（boolean）`，`undefined: −2^30`；null也是使用`000`表示的；可以借助`Number.EPSILON`
 
 > 虽然 typeof null 会输出 object，但是这只是 JS 存在的一个悠久 Bug。在 JS 的最初版本中使用的是 32 位系统，为了性能考虑使用低位存储变量的类型信息，000 开头代表是对象，然而 null 表示为全零，所以将它错误的判断为 object 。虽然现在的内部类型判断代码已经改变了，但是对于这个 Bug 却是一直流传下来。



### 数据类型及判断
- 数据类型：基本类型（6种）和引用类型
- 判断： `typeof`/`Object.prototype.toString.call(xx)（返回[object Type）`

### 类型转换
可以参考[类型与语法](https://blog.csdn.net/luofeng457/article/details/88736357)
#### 转Boolean
#### 对象转基本类型
对象转基本类型时首先会调用`valueOf`，不存在则调用`toString`方法；如果存在`Symbol.toPrimitive`，则该方法在转基本类型时最先调用；
```js
a = {
    valueOf() {
        return 0;
    },
    toString() {
        return 1;
    },
    [Symbol.toPrimitive]() {
        return 2;
    }
}

a + 1 // 3
a + '1' // '21'
```

#### 四则运算
 - 加法运算：有一个是字符串类型则都转为字符串类型；`加法运算会触发三种类型转换：将值转换为原始值，转换为数字，转换为字符串`
 - 其他运算：只要有一个为数字则另一个也需要转为数字；

```js
a = {
    valueOf() {
        return [1, 2];
    },
    toString() {
        return '1,2';
    },
}
a + 3 // '1,23' 需要将a转为原始值，`valueOf`返回的是数组不符合，故取`toString`的值

[1, 2] + [2, 1] // '1,22,1'

'a' + + 'b' // -> "aNaN"
// b = '1c'
// +b // 'NaN'
// Number(b) // 'NaN'
// parseInt(b) // 1
```

#### `==`操作符

类型不同时：
1. 分别为`undefined`和`null`时，相等；
2. 分别为`Number`和`String`时，将`String`转为`Number`;
3. 有一个为`Boolean`时，先将`Boolean`转为`Number`再比较；
4. 有一个为`String`或`Number`，另一个为`Object`时，先将对象转为基本类型再比较；

![avatar](./assets/==类型转换.png)

#### 比较运算符
1. 如果是对象，就通过 toPrimitive 转换对象
2. 如果是字符串，就通过 unicode 字符索引来比较


### 原型

`prototype`: 每个函数都有 prototype 属性，除了 Function.prototype.bind()，该属性指向原型。

`__proto__`: 每个对象都有`__proto__`属性，`指向了创建该对象的构造函数的原型`。其实这个属性指向了 `[[prototype]]`，但是 [[prototype]] 是内部属性，我们并不能访问到，所以使用 `__proto__` 来访问。

对象可以通过 `__proto__`来寻找不属于该对象的属性，`__proto__`将对象连接起来组成了原型链。

![avatar](./assets/prototype.png)

![avatar](./assets//__proto__.png)

1. `hasOwnProperty`: `obj.hasOwnProperty`
2. `isPrototypeOf`: `prototypeObj.isPrototypeOf(obj)`
3. `getPrototypeOf`:

```js
function Person(name, age) {
    this.name = name;
    this.age = age;
}

var p = new Person();

p.hasOwnProperty('name') // true
p.hasOwnProperty('type') // false

Person.prototype.isPrototypeOf(p) // true
Object.getPrototypeOf(p) === Person.prototype; // true
```

```js
function Foo() {};
const f = new Foo;
const obj = new Object;

f.constructor === Foo;
f.__proto__ === Foo.prototype;
Foo.prototype.constructor === Foo;
Foo.prototype.__proto__ === Object.prototype;

Function.prototype === Object.__proto__;
Function.prototype === Function.__proto__;

Object.prototype.__proto__ === null;

```


### instanceof

`object` instanceof `constructor`

返回一个boolean，用于判断右边构造函数的`prototype`属性是否出现在左边对象的原型链上

```javascript
function Con() {}

const o = new Con();

o instanceof Con; // true，因 o.__proto__ === Con.prototype;
```

```javascript
// mock instanceof

function instanceof(left, right) {
    let prototype = right.prototype;
    left = left.__proto__;

    if (right instanceof Object) return false;

    while (true) {
        if (left === null) {
            return false;
        }
        if (left === right) {
            return true;
        }
        
        left = left.__proto__;
    }
}
```


### new
1. 创建一个空对象；
2. 链接到原型
3. 绑定this
4. 返回新对象


```js
function create() {
    // 创建一个空对象
    let obj = new Object();
    // 获得构造函数
    let Con = [].shift.call(arguments);
    // 链接到原型
    obj.__proto__ = Con.prototype;
    // 绑定this，执行构造函数
    let res = Con.apply(obj, arguments);
    return typeof res === 'object' ? : res : obj; 
}
```

需要注意`new`运算的优先级: `new Foo()大于new Foo`
```js
function Foo() {
    return this;
}
Foo.getName = function () {
    console.log('1');
};
Foo.prototype.getName = function () {
    console.log('2');
};

new Foo.getName();   // -> 1, new (Foo.getName());
new Foo().getName(); // -> 2, (new Foo()).getName();
```

### this

> 1. 通过`new`构造出的新对象，this总是指向该对象，不会被任何方式修改`this`指向；

> 2. `this`指向依赖于调用函数前的对象;

> 3. `call`/`apply`/`bind`可以改变`this`指向；
·
> 4. 箭头函数中实际上没有`this`，所以箭头函数中的`this`指向同它外层第一个非箭头函数

```javascript
function foo() {
	console.log(this.a)
}
var a = 1
foo() // 1

var obj = {
	a: 2,
	foo: foo
}
obj.foo() // 2

// 以上两者情况 `this` 只依赖于调用函数前的对象，优先级是第二个情况大于第一个情况

// 以下情况是优先级最高的，`this` 只会绑定在 `c` 上，不会被任何方式修改 `this` 指向
var c = new foo()
c.a = 3
console.log(c.a) // 3

// 还有种就是利用 call，apply，bind 改变 this，这个优先级仅次于 new

function a() {
    return () => {
        return () => {
        	console.log(this)
        }
    }
}
console.log(a()()()) // window
```

### 执行上下文

JS有三种执行上下文：
- 全局执行上下文
- 函数执行上下文
- eval执行上下文

每个执行上下文有三个重要属性：
- 变量对象（VO），包含变量、函数声明和函数的形参，`该属性只能在全局上下文中访问`
- 作用域链（JS 采用词法作用域，也就是说变量的作用域是在定义时就决定了）
- this

```javascript
var a = 10;
function foo(i) {
    var b = 20;
}
foo();
```

对于上述代码，执行栈中有两个上下文：全局上下文和函数`foo`上下文

执行栈为
```javascript
stack = [
    globalContext,
    fooContext,
]
```

对于全局上下文，VO大概描述如下
```javacript
globalContext.VO === global
globalContext.VO = {
    a: undefined,
    foo: <Function>,
}
```

对于函数`foo`，由于VO不能访问，只能访问到活动对象AO
```javasscript
fooContext.VO === foo.AO

foo.AO = {
    i: undefined,
    b: undefined,
    arguments: <>,
}
// arguments 是函数独有的对象(箭头函数没有)
// 该对象是一个类数组对象，有 `length` 属性且可以通过下标访问元素
// 该对象中的 `callee` 属性代表函数本身
// `caller` 属性代表函数的调用者
```

> 对于作用域链，可以将其理解为包含自身变量对象和上级变量对象的列表，通过`[[Scope]]`属性查找上级变量

```javascript
fooContext.[[Scope]] = [
    globalContext.VO
]

fooContext.Scope = fooContext.[[Scope]] + fooContext.VO;
                 = [
                     fooContext.VO,
                     globalContext.VO,
                 ]
```

> `在生成执行上下文时，会有两个阶段`。第一个阶段是`创建的阶段`（具体步骤是创建 VO），JS 解释器会找出需要提升的变量和函数，并且给他们提前在内存中开辟好空间，函数的话会将整个函数存入内存中，变量只声明并且赋值为 undefined，所以在第二个阶段，也就是`代码执行阶段`，我们可以直接提前使用。

> `let` 提升了声明但没有赋值，因为临时死区导致了并不能在声明前使用

这也解释了`函数及变量提升`；
```javascript
b() // call b
console.log(a) // undefined

var a = 'Hello world'

function b() {
	console.log('call b')
}
```

##### 非匿名立即执行函数
```javascript
var foo = 1
(function foo() {
    foo = 10
    console.log(foo)
}()) // -> ƒ foo() { foo = 10 ; console.log(foo) }

var foo = 1;
(function() {
    foo = 10
    console.log(foo)
}()) // 10
```

> 当 JS 解释器在遇到非匿名的立即执行函数时，会创建一个`辅助的特定对象，然后将函数名称作为这个对象的属性`，因此`函数内部才可以访问`到 foo，但是`这个值又是只读的，所以对它的赋值并不生效`，所以打印的结果还是这个函数，并且外部的值也没有发生更改


### 闭包
`定义`：函数A返回了一个函数B，并且函数B中使用了函数A的变量，则函数B就被称为闭包；

```
function A() {
  let a = 1
  function B() {
      console.log(a)
  }
  return B
}
```

> 你是否会疑惑，为什么`函数 A 已经弹出调用栈了，为什么函数 B 还能引用到函数 A 中的变量。因为函数 A 中的变量这时候是存储在堆上的`。现在的 JS 引擎可以通过逃逸分析辨别出哪些变量需要存储在堆上，哪些需要存储在栈上。

### 深浅拷贝

##### 浅拷贝
使用`Object.assign`或者`...`

`Object.assign`仅可以拷贝对象自身的可枚举属性到目标对象，如果遇到错误，则报错前添加的属性仍然会改变`target`；

```javascript
if (typeof Object.assign !== 'function') {
    Object.defineProperty(Object, 'assign', {
        value: function(target, args) {
            if (target === null || target === undefined) {
                throw new TypeError('Cannot convert null or undefined to object')
            }

            var to = Object(target);
            for (var i = 1; i < arguments.length; i++) {
                var nextSource = arguments[i];

                if (nextSource !== null && nextSource !== undefined) {
                    for (var key in nextSource) {
                        if (Object.prototype.hasOwnProperty.call(nextSource, key)) {
                            to[key] = nextSource[key];
                        }
                    }
                }
            }

            return to;
        },
        writable: true,
        configurable: true,
    })
}
```

##### 深拷贝

可以使用`JSON.parse(JSON.stringify(object))`，可以解决大部分数据问题，但是存在一定局限性：

- 会忽略undefined
- 会忽略symbol
- 不能序列化函数
- 不能解决循环引用的对象

可以使用`lodash`提供的拷贝方法`cloneDeep`；

如果你所需拷贝的对象含有内置类型并且不包含函数，可以使用 `MessageChannel`；

```javascript
function structuralClone(obj) {
  return new Promise(resolve => {
    const {port1, port2} = new MessageChannel();
    port2.onmessage = ev => resolve(ev.data);
    port1.postMessage(obj);
  });
}

var obj = {a: 1, b: {
    c: b
}}
// 注意该方法是异步的
// 可以处理 undefined 和循环引用对象
(async () => {
  const clone = await structuralClone(obj)
})()
```

```js
// 简单深拷贝
function deepClone(originObj, typedObj) {
    var obj = typedObj || {};
    for (var key in originObj) {
        if (typeof originObj[key] === 'object') {
            obj[key] = Array.isArray(originObj[key]) ? [] : {};
            deepClone(originObj[key], obj[key]);
        } else {
            obj[key] = originObj[key];
        }
    }
    return obj;
}
```

### 模块化
#### ES6模块
在有 Babel 的情况下，我们可以直接使用 ES6 

> ES6 模块的运行机制与 CommonJS 不一样。JS引擎对脚本静态分析时，遇到模块加载命令import，就会生成一个只读引用。等到脚本真正执行时，再根据这个只读引用，到被加载的那个模块里面去取值。ES6 模块中，原始值变了，import 加载的值也会跟着变。因此，ES6 模块是动态引用，并且不会缓存值。

##### ES6模块与CommonJS模块区别
- CommonJS 模块是运行时加载，ES6 模块是编译时输出接口。
- ES6模块输出的是值的引用，输出接口动态绑定，而CommonJS输出的是值的拷贝。


#### CommonJS
> CommonJs 是 Node 独有的规范，浏览器中使用就需要用到 Browserify 解析了

以下面这个demo为例
```js
// a.js
module.exports = {
    a: 1
}
// or
exports.a = 1

// b.js
var module = require('./a.js')
module.a // -> log 1
```

在上述代码中，module.exports 和 exports 很容易混淆，让我们来看看大致内部实现

```js
var module = require('./a.js')
module.a
// 这里其实就是包装了一层立即执行函数，这样就不会污染全局变量了，
// 重要的是 module 这里，module 是 Node 独有的一个变量
module.exports = {
    a: 1
}

// 基本实现
var module = {
    exports = {} // exports就是个空对象
}
// 这个是为什么 exports 和 module.exports 用法相似的原因
var exports = module.exports;

var load = function (module) {
    // 导出的东西
    var a = 1;

    module.exports = a;

    return module.exports;
}
```

> 对于 CommonJS 和 ES6 中的模块化的两者区别是：
 - 前者支持动态导入，也就是 require(${path}/xx.js)，后者目前不支持，但是已有提案
 - 前者是同步导入，因为用于服务端，文件都在本地，同步导入即使卡住主线程影响也不大。而后者是异步导入，因为用于浏览器，需要下载文件，如果也采用同步导入会对渲染有很大影响
 - 前者在导出时都是值拷贝，就算导出的值变了，导入的值也不会改变，所以如果想更新值，必须重新导入一次。但是后者采用实时绑定的方式，导入导出的值都指向同一个内存地址，所以导入值会跟随导出值变化
 - 后者会编译成 require/exports 来执行的

 #### AMD(Asynchronous Module Definition)
AMD由`RequireJS`提出的，用于解决早期JS模块多依赖加载顺序问题；

```js
// AMD 模块定义
define(id?, dependencies?, factory);
define.amd = {};

// 定义无依赖的模块
define({
    add: function(x,y){
        return x + y;
    }
});

// 定义有依赖的模块
define(["alpha"], function(alpha){
    return {
        verb: function(){
            return alpha.verb() + 1;
        }
    }
});
```

AMD也采用`require()`加载模块，但与`CommonJS`不同，有2个入参；第一个是依赖的模块，第二个是加载成功后的回调函数
```js
require([module], callback)

require(['math'], function (math) {
    math.add(2, 3);
});
```

#### CMD(Common Module Definition)
> CMD = Common Module Definition，即通用模块定义。CMD 是 SeaJS 在推广过程中对模块定义的规范化产出。
> CMD 规范和 AMD 规范类似，都主要运行于浏览器端，写法上看起来也很类似。主要区别，在于 `模块初始化时机`

##### AMD 与 CMD 的异同
- AMD 中，只要模块作为依赖时就会加载并进行初始化;
- CMD 中，模块作为依赖且被引用时才会初始化，否则只会加载;
- CMD 推崇依赖就近，可以把依赖写进你的代码中的任意一行。AMD 推崇依赖前置;

#### UMD(Universal Module Definition)
UMD即通用模块定义，兼具AMD与CommonJS的特点；
> `AMD`模块以 浏览器第一的原则 发展，选择异步加载。CommonJS 模块以 服务器第一原则 发展，选择同步加载。由此，迫使人们又想出另一个更通用的模式 `UMD`（Universal Module Definition)，实现跨平台的解决方案。
> UMD 先判断支持 `Node.js 的模块（exports）是否存在`，存在则使用 Node.js 模块模式。再判断支持 AMD（define ）是否存在，存在则使用 AMD 方式加载模块。

```js
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = global || self, global.utilName = factory());
}(this, function () {
    //module ...
}); 
```


### 防抖与节流

> 防抖动和节流本质是不一样的。防抖动是将多次执行变为最后一次执行，节流是将多次执行变成每隔一段时间执行。

`共同点：`防抖和节流的目的都是防止函数的多次调用

`区别：`函数去抖和函数节流都是密集型操作中避免事件频繁出发造成性能损耗的解决方案；函数节流，顾名思义就是节约流量，所以每个时间段内只会执行一次，并在此时间段内屏蔽触发的同类事件；而函数去抖则是在用户连续操作中避免事件处理的处理效率不及时间触发速度，从而导致画面卡顿，操作不畅等不良用户体验，所以在很短的时间段内只响应最近触发的事件；


#### 去抖

##### 定义
函数去抖的含义就是在一定时间段内只有一个同类的事件触发并执行；如果该时间段有同类的事件触发，则重新开始响应该事件；

##### 应用
输入合法性检测、浏览器resize时自身的处理、scroll事件等


```js
// 这个是用来获取当前时间戳的
function now() {
  return +new Date()
}
/**
 * 防抖函数，返回函数连续调用时，空闲时间必须大于或等于 wait，func 才会执行
 *
 * @param  {function} func        回调函数
 * @param  {number}   wait        表示时间窗口的间隔
 * @param  {boolean}  immediate   设置为ture时，是否立即调用函数
 * @return {function}             返回客户调用函数
 */
function debounce (func, wait = 50, immediate = true) {
  let timer, context, args

  // 延迟执行函数
  const later = () => setTimeout(() => {
    // 延迟函数执行完毕，清空缓存的定时器序号
    timer = null
    // 延迟执行的情况下，函数会在延迟函数中执行
    // 使用到之前缓存的参数和上下文
    if (!immediate) {
      func.apply(context, args)
      context = args = null
    }
  }, wait)

  // 这里返回的函数是每次实际调用的函数
  return function(...params) {
    // 如果没有创建延迟执行函数（later），就创建一个
    if (!timer) {
      timer = later()
      // 如果是立即执行，调用函数
      // 否则缓存参数和调用上下文
      if (immediate) {
        func.apply(this, params)
      } else {
        context = this
        args = params
      }
    // 如果已有延迟执行函数（later），调用的时候清除原来的并重新设定一个
    // 这样做延迟函数会重新计时
    } else {
      clearTimeout(timer)
      timer = later()
    }
  }
}
```


#### 节流
##### 定义
函数节流的含义就是在一定的时间段内相应的事件只能被触发一次；如果某段有已经有相应的事件在执行，则在该时间段内不再触发，直到本次事件执行结束；


##### 应用
请求接口的一些提交按钮、翻页器等；


```js
// 简易实现
// 返回函数版本
function throttle(fn, wait) {
    let tid;
    return function (...args) {
        if (tid) {
            return;
        }
        tid = setTimeout(() => {
            fn.apply(this, args);
        }, wait);
    }
}
```


```js
/**
 * underscore 节流函数，返回函数连续调用时，func 执行频率限定为 次 / wait
 *
 * @param  {function}   func      回调函数
 * @param  {number}     wait      表示时间窗口的间隔
 * @param  {object}     options   如果想忽略开始函数的的调用，传入{leading: false}。
 *                                如果想忽略结尾函数的调用，传入{trailing: false}
 *                                两者不能共存，否则函数不能执行
 * @return {function}             返回客户调用函数
 */
_.throttle = function(func, wait, options) {
    var context, args, result;
    var timeout = null;
    // 之前的时间戳
    var previous = 0;
    // 如果 options 没传则设为空对象
    if (!options) options = {};
    // 定时器回调函数
    var later = function() {
      // 如果设置了 leading，就将 previous 设为 0
      // 用于下面函数的第一个 if 判断
      previous = options.leading === false ? 0 : _.now();
      // 置空一是为了防止内存泄漏，二是为了下面的定时器判断
      timeout = null;
      result = func.apply(context, args);
      if (!timeout) context = args = null;
    };
    return function() {
      // 获得当前时间戳
      var now = _.now();
      // 首次进入前者肯定为 true
	  // 如果需要第一次不执行函数
	  // 就将上次时间戳设为当前的
      // 这样在接下来计算 remaining 的值时会大于0
      if (!previous && options.leading === false) previous = now;
      // 计算剩余时间
      var remaining = wait - (now - previous);
      context = this;
      args = arguments;
      // 如果当前调用已经大于上次调用时间 + wait
      // 或者用户手动调了时间
 	  // 如果设置了 trailing，只会进入这个条件
	  // 如果没有设置 leading，那么第一次会进入这个条件
	  // 还有一点，你可能会觉得开启了定时器那么应该不会进入这个 if 条件了
	  // 其实还是会进入的，因为定时器的延时
	  // 并不是准确的时间，很可能你设置了2秒
	  // 但是他需要2.2秒才触发，这时候就会进入这个条件
      if (remaining <= 0 || remaining > wait) {
        // 如果存在定时器就清理掉否则会调用二次回调
        if (timeout) {
          clearTimeout(timeout);
          timeout = null;
        }
        previous = now;
        result = func.apply(context, args);
        if (!timeout) context = args = null;
      } else if (!timeout && options.trailing !== false) {
        // 判断是否设置了定时器和 trailing
	    // 没有的话就开启一个定时器
        // 并且不能同时设置 leading 和 trailing
        timeout = setTimeout(later, remaining);
      }
      return result;
    };
  };
```

### 继承
#### 原型链继承
原型链继承方式的实质是用一个新类型的实例重写原型对象；

##### 缺点
1. 原型中包含引用类型时一个实例对原型的引用类型值改变会影响到其他所有的实例对象；
2. 创建子类实例时无法在不影响其他子类实例的情况下向父类构造函数传递参数；


##### 实例

```js
// 原型链继承
function Person () {
	this.type = 'person';
	this.cans = ['talk', 'eat', 'sleep'];
	this.greet = function () {
		console.log('Hello, I am ' + this.type);
	}
}

function Student () {
	this.type = 'student';
	this.name = 'B';
	this.gender = 'male';
	this.greet = function () {
		console.log('Hello, I am ' + this.type);
	}
}

Student.prototype = new Person();

var person1 = new Person();
var stu1 = new Student();
var stu2 = new Student();

stu1.cans.push('sing');
console.log(stu1.cans);	// [ 'talk', 'eat', 'sleep', 'sing' ]
console.log(stu2.cans);	// [ 'talk', 'eat', 'sleep', 'sing' ]

```


#### 借用构造函数

该方法通过在子类构造函数中通过`call`或`apply`调用父类构造函数；

##### 优点
1. 该方法解决了原型中包含引用类型值的问题；
2. 通过调用call和apply，可以在子类构造函数向父类构造函数传递参数，且不影响其他子类实例；

##### 缺点
构造函数中定义的方法无法复用；
而且在父类原型中定义的方法子类实例无法访问到；

```js
function Person(name, age) {
    this.name = name;
    this.age = age;
    this.cans = ['talk', 'eat', 'sleep'];
}

Person.prototype.greet = function () {
    console.log(`Hello, ${name}`);
}

function Student(name, age) {
    Person.call(this, name, age);
    this.grade = 98;
}

var stu3 = new Student();
console.log(stu3.name); // Neil
console.log(stu3.age); // 20
console.log(stu3.grade); //98
stu3.greet(); // TypeError
console.log(Student.prototype.__proto__)
```

#### 组合式继承
也称作伪经典继承，结合了原型链继承和借用构造函数继承的优点 —— 使用原型链实现对原型属性和方法的继承，使用借用构造函数实现对实例属性的继承；

##### 缺点
组合式继承调用了两次父类构造函数，导致子类实例和子类原型上存在两组同名的属性；


```js
function Person (name) {
    this.name = name;
    this.cans = ['talk', 'eat', 'sleep'];
}

Person.prototype.test = true;
Person.prototype.greet = function () {
    console.log(`Hello, ${this.name}`)
}

function Student (name, grade) {
    // 借用构造函数继承实例属性
    Person.call(this, name);
    this.grade = grade;
}

// 原型链实现原型属性和方法的继承
Student.prototype = new Person();

Student.prototype.getGrade = function() {
    console.log(`${this.name}'s grade is ${this.grade}`);
}

const stu4 = new Student('D', 88);
const stu5 = new Student('E', 96);

stu4.cans.push('learning');
console.log('==========实例属性==========');
console.log(`1: ${stu4.name}`); // 1: D
console.log(`2: ${stu4.cans}`); // 2: talk,eat,sleep,learning
console.log(`3: ${stu5.cans}`); // 3: talk,eat,sleep
console.log('==========原型属性与方法==========');
console.log(`4: ${stu4.test}`) // 4: true
stu4.greet() // Hello, D
console.log('==========自身属性与方法==========');
console.log(`5: ${stu4.grade}`) // 88
stu5.getGrade() // E's grade is 96

```


#### 原型式继承
##### 原理
原型式继承借助已存在的对象创建新对象，实质是对传入其中的对象实现了一次浅拷贝，然后可以根据需求在新对象上进行修改；

##### 实例
```js
var init = {
  name: 'E',
  interests: ['basketball, music']
}

function object(o) {
    function F() {}
    F.prototype = o;
    return new F();
}

var me = object(init);
me.name = "E+"
me.interests.push('movies');
var me2 = object(init);
console.log(me.name); // E+
console.log(me2.name);  // E
console.log(me.interests);  // [ 'basketball, music', 'movies' ]
console.log(me2.interests); // [ 'basketball, music', 'movies' ]
```

> ES5增加了方法可以更加规范地实现原型式继承；它接受两个参数，第一个为创建新对象所依赖的prototype，第二项用于给新对象添加新属性，它的设置与Object.defineProperties()一样采用对象字面量形式；支持该方法的浏览器包括IE 9+、Chrome、Firefox 4+、Safari 5+等；

```js
var init = {
  name: 'E',
  interests: ['basketball, music']
}

var me = Object.create(init, {
    name: {
        value: 'Neil',
        configurable: true,
        enumerable: true,
        writable: false
    },
    age: {
        value: 24,
        writable: true  // 默认为false
    }
})

console.log(me.name); // Neil
console.log(me.interests); // [ 'basketball, music' ]
console.log(init.isPrototypeOf(me)); // true
```

#### 寄生式继承
寄生式继承与原型式继承基本思想类似，具体实现则与工厂模式类似；该方法使用了一个仅用于封装继承过程的函数，`在函数内部对新创建的对象进行改造`；

该方法与构造函数模式类似，也存在函数不可复用的缺点；

```js
function object(o) {
    function F() {}
    F.prototype = o;
    return new F();
}

var o = {
    name: 'F',
    interests: ['basketball', 'movies'],
    greet: function () {
        console.log(this.interests);
    }
}

function createObject(superObj) {
    var copy = object(superObj); // 创建新对象
    copy.interests.push('sports'); // 以某种方式增强新对象
    copy.print = function () {
        console.log(this.interests);
    }

    return copy;
}

var obj = createObject(o);
console.log(obj.name);
obj.print();
obj.greet();
```


#### 寄生组合式继承
寄生组合式继承的目的是为了改善JS最常用的继承方式——组合继承的不足：每次创建子类实例会调用两次父类构造函数；

两次调用会导致在子类实例上和子类原型上同时存在两组同名的属性，两次调用分别是： 1、在子类构造函数内部 2、在创建子类原型时（用于原型属性和方法的继承）；

`但是创建子类原型时其实只需要父类原型的副本即可`；这样仅调用一次构造函数，同时避免在子类原型创建不必要的属性，有效提高了效率；同时，`该方式是引用类型最理想的继承方式`；

> 其本质是使用寄生式继承方式继承父类原型，然后将其赋值给子类原型；

##### 实例
```js
function object(o) {
    function F() {}
    F.prototype = o;
    return new F();
}

function inheritPrototype(subType, superType) {
    var prototype = object(superType.prototype); // 以父类原型创建新对象，相当于创建了父类副本而不是调用父类构造函数
    prototype.constructor = subType; // 增强对象
    subType.prototype = prototype; // 指定对象 (subType.prototype.constructor = subType)
}


function SuperType (name) {
  this.name = name;
  this.interests = ['basketball', 'music'];
}

SuperType.prototype.print = function () {
  console.log(this.interests);
}

function SubType (name, age) {
  SuperType.call(this, name);
  this.age = age;
}

inheritPrototype(SubType, SuperType); // 该行需要在添加属性或方法到SubType.prototype之前，否则属性或方法会被覆盖

SubType.prototype.report = function () {
  console.log('age is ' + this.age);
}

var instance = new SubType('G', 25);
var instance2 = new SubType('H', 27);
console.log(instance.name); // G
console.log(instance.age); // 25
instance.interests.push('chess');
instance.print(); // ['basketball', 'music', 'chess']
instance.report(); // age is 25
console.log('=============================');
instance2.print(); // ['basketball', 'music']

```

> 因为每个实例的原型都只是SuperType.prototype的一个对象副本，各自是独立的，因此instance对引用类型值的改变不会影响到instance2；


使用`Object.create()`简化该过程：
```js
function SuperType (name) {
    this.name = name;
    this.interests = ['basketball', 'music'];
}

SuperType.prototype.print = function () {
  console.log(this.interests);
}

function SubType (name, age) {
  SuperType.call(this, name);
  this.age = age;
}

SubType.prototype = Object.create(SuperType.prototype, {
    constructor: {
        value: SubType,
        configurable: true,
        enumerable: true,
        writable: true,
    }
})

SubType.prototype.report = function () {
    console.log('age is ' + this.age);
}

var instance = new SubType('G', 25);
var instance2 = new SubType('H', 27);
console.log(instance.name);
console.log(instance.age);
instance.interests.push('chess');
instance.print();
instance.report();
console.log('=============================');
instance2.print();

```

### call, apply, bind

#### 模拟call实现

可以从以下几点来考虑如何实现
1. 不传入第一个参数，那么默认为 window
2. 改变了 this 指向，让新的对象可以执行该函数。那么思路是否可以变成给新的对象添加一个函数，然后在执行完以后删除？
```js
Function.prototype.myCall = function (context) {
    var context = context || window;
    // 给context添加一个属性
    // getValue.call(a, 'neil', 22) => a.fn = getValue
    context.fn = this;
    // 将context后的参数取出
    var args = [...arguments].slice(1);
    // getValue.call(a, 'neil', 22) <=> a.fn('neil', 22)
    var result = context.fn(...args);
    // 删除fn
    delete context.fn;
    return result;
}
```

#### apply

```js
Function.prototype.myApply = function (context) {
    var context = context || window;
    context.fn = this;
    var result;
    if (arguments[1]) {
        result = context.fn(...arguments[1]);
    } else {
        result = context.fn();
    }

    delete context.fn;
    return this;
}
```

#### bind
bind 和其他两个方法作用也是一致的，只是该方法会返回一个函数。并且我们可以通过 bind 实现柯里化。

```js
Function.prototype.myBind = function (context) {
  if (typeof this !== 'function') {
    throw new TypeError('Error')
  }
  var _this = this
  var args = [...arguments].slice(1)
  // 返回一个函数
  return function F() {
    // 因为返回了一个函数，我们可以 new F()，所以需要判断
    if (this instanceof F) {
      return new _this(...args, ...arguments)
    }
    return _this.apply(context, args.concat(...arguments))
  }
}
```


### Promise
> Promise 是 ES6 新增的语法，解决了回调地狱的问题。

> 可以把 Promise 看成一个状态机。初始是 pending 状态，可以通过函数 resolve 和 reject ，将状态转变为 resolved 或者 rejected 状态，`状态一旦改变就不能再次变化`。

> `then 函数会返回一个 Promise 实例，并且该返回值是一个新的实例而不是之前的实例`。因为 Promise 规范规定除了 pending 状态，其他状态是不可以改变的，如果返回的是一个相同实例的话，多个 then 调用就失去意义了。

![avatar](./assets/promises.png)

> 对于 then 来说，本质上可以把它看成是 flatMap


```js
// 三种状态
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

### Generator
ES6新增语法，用于异步编程。每个生成器对象都有一个`next`方法，该方法返回一个包含2个属性的对象：value表示当前迭代值；done——布尔类型，表示迭代是否完成；

Generator函数内部的`yield`可以暂停函数执行，而每次调用`next`则可以继续执行被暂定的代码；

> 生成器（generator）对象是由一个generator function 返回的,并且它符合可迭代协议和迭代器协议。

```js
function* test() {
    let a = 1 + 2;
    yield 2;
    yield 3;
}

var b = test(); // 获取生成器对象
console.log(b.next()) // { value: 2, done: false }
console.log(b.next()) // { value: 3, done: false }
console.log(b.next()) // { value: undefined, done:  }

```

#### 生成器委托
```js
function* c1(){
  yield 1;
  yield 2;
}

function* c2(){
  yield 's1';
  yield 's2';
}

function* c3(){
  yield *c1();
  yield *c2();
  yield true
}

let gen = c3();

gen.next(); // { value: 1, done: false }
gen.next(); // { value: 2, done: false }
gen.next(); // { value: 's1', done: false }
gen.next(); // { value: 's2', done: false }
gen.next(); // { value: true, done: false }
gen.next(); // { value: undefined, done: true }

```

#### Generator函数的简单实现
```js
// cb 也就是编译过的 test 函数
function generator(cb) {
    return (function() {
        var object = {
            next: 0,
            stop: function() {}
        };

        return {
            next: function() {
                var ret = cb(object);
                if (ret === undefined) return {
                    value: undefined,
                    done: true,
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
  return generator(function(_context) {
    while (1) {
      switch ((_context.prev = _context.next)) {
        // 可以发现通过 yield 将代码分割成几块
        // 每次执行 next 函数就执行一块代码
        // 并且表明下次需要执行哪块代码
        case 0:
          a = 1 + 2;
          _context.next = 4;
          return 2;
        case 4:
          _context.next = 6;
          return 3;
		// 执行完毕
        case 6:
        case "end":
          return _context.stop();
      }
    }
  });
}
```


### async与await
> 一个函数如果加上 async ，那么该函数就会返回一个 Promise

```js
async function test() {
  return "1";
}
console.log(test()); // -> Promise {<fulfilled>: '1'}
```

> 可以把 async 看成将函数返回值使用 Promise.resolve() 包裹了下

> await 只能在 async 函数中使用

#### demos

```js
// demo1
async function test() {
    console.log(111)
    await 10;
    console.log(222)
    return "1";
}
test()
console.log(333)
```

上述代码打印顺序：111 -> 333 -> 222；aysnc函数执行时遇到await时会返回一个pending状态的Promise对象，暂时返回代码控制权，使得函数外代码可以继续执行


```js
// demo2
function sleep() {
  return new Promise(resolve => {
    setTimeout(() => {
      console.log('finish')
      resolve("sleep");
    }, 2000);
  });
}
async function test() {
  let value = await sleep();
  console.log("object");
}
test()
```

上面代码会先打印 finish 然后再打印 object 。因为 await 会等待 sleep 函数 resolve ，所以即使后面是同步代码，也不会先去执行同步代码再来执行异步代码。

```js
// demo3
var a = 0
var b = async () => {
  a = a + await 10
  console.log('2', a) // -> '2' 10
  a = (await 10) + a
  console.log('3', a) // -> '3' 20
}
b()
a++
console.log('1', a) // -> '1' 1
```

- 首先函数 b 先执行，在执行到 await 10 之前变量 a 还是 0，因为在 `await 内部实现了 generators ，generators 会保留堆栈中东西`，所以这时候 a = 0 被保存了下来
- 因为 await 是异步操作，遇到await就会立即返回一个pending状态的Promise对象，暂时返回执行代码的控制权，使得函数外的代码得以继续执行，所以会先执行 console.log('1', a)
- 这时候同步代码执行完毕，开始执行异步代码，将保存下来的值拿出来使用，这时候 a = 10
- 然后后面就是常规执行代码了



#### 对比Promise的优劣
`优点：`相比Promise的then方法的链式调用，`async/await`可以让用户以同步编码的方式书写代码，更符合思维习惯，方便阅读；

`缺点：`滥用 await 可能会导致性能问题，因为 await 会阻塞代码，也许之后的异步代码并不依赖于前者，但仍然需要等待前者完成，导致代码失去了并发性


### Proxy
#### 定义
> Proxy 对象用于创建一个对象的代理，从而实现基本操作的拦截和自定义（如属性查找、赋值、枚举、函数调用等）。

#### 语法
```js
const p = new Proxy(target, handler)
```

- target：要使用 Proxy 包装的目标对象（可以是任何类型的对象，包括原生数组，函数，甚至另一个代理）
- handler：一个通常以函数作为属性的对象，各属性中的函数分别定义了在执行各种操作时代理 p 的行为。

![avatar](./assets//proxy.png)

#### demos

##### 基础示例
```js
const handler = {
    get: function (obj, prop) {
        return prop in obj ? obj[prop] : 233
    }
}

const p = new Proxy({}, handler)
p.a = 123;
p.b = undefined;

console.log(p.a, p.b); // 123 undefined
console.log(p.c); // 233

```


##### 无操作转发代理

我们使用了一个原生 JavaScript 对象，代理会将所有应用到它的操作转发到这个对象上。

```js
let target = {};
let p = new Proxy(target, {});

p.a = 37; // 操作转发到目标

console.log(target.a); // 37. 操作已经被正确地转发
```

##### 验证
通过代理，你可以轻松地验证向一个对象的传值。下面的代码借此展示了 set handler 的作用

```js
let validator = {
    set: function (obj, prop, value) {
        if (prop === 'age') {
            if (!Number.isInteger(value)) {
                throw new TypeError('The age is not an integer');
            }

            if (value > 200) {
                throw new RangeError('The age is out-of-range')
            }
        }
        // The default behavior to store the value
        obj[prop] = value;

        // 表示成功
        return true;
    }
}

var person = new Proxy({}, validator);

person.age = 100; // Proxy: { age: 100 }

person.age = '123' // Uncaught TypeError: The age is not an integer

person.age = 222 // Uncaught RangeError: The age is out-of-range
```

##### 操作DOM节点
有时，我们可能需要互换两个不同的元素的属性或类名。下面的代码以此为目标，展示了 set handler 的使用场景。

```js
let view = new Proxy({
  selected: null
}, {
  set: function(obj, prop, newval) {
    let oldval = obj[prop];

    if (prop === 'selected') {
      if (oldval) {
        oldval.setAttribute('aria-selected', 'false');
      }
      if (newval) {
        newval.setAttribute('aria-selected', 'true');
      }
    }

    // 默认行为是存储被传入 setter 函数的属性值
    obj[prop] = newval;

    // 表示操作成功
    return true;
  }
});

let i1 = view.selected = document.getElementById('item-1');
console.log(i1.getAttribute('aria-selected')); // 'true'

let i2 = view.selected = document.getElementById('item-2');
console.log(i1.getAttribute('aria-selected')); // 'false'
console.log(i2.getAttribute('aria-selected')); // 'true'
```

##### 值修正及附加属性

以下`products`代理会计算传值并根据需要转换为数组。这个代理对象同时支持一个叫做 `latestBrowser`的附加属性，这个属性可以同时作为 getter 和 setter。

```js
et products = new Proxy({
  browsers: ['Internet Explorer', 'Netscape']
}, {
  get: function(obj, prop) {
    // 附加一个属性
    if (prop === 'latestBrowser') {
      return obj.browsers[obj.browsers.length - 1];
    }

    // 默认行为是返回属性值
    return obj[prop];
  },
  set: function(obj, prop, value) {
    // 附加属性
    if (prop === 'latestBrowser') {
      obj.browsers.push(value);
      return;
    }

    // 如果不是数组，则进行转换
    if (typeof value === 'string') {
      value = [value];
    }

    // 默认行为是保存属性值
    obj[prop] = value;

    // 表示成功
    return true;
  }
});

console.log(products.browsers); // ['Internet Explorer', 'Netscape']
products.browsers = 'Firefox';  // 如果不小心传入了一个字符串
console.log(products.browsers); // ['Firefox'] <- 也没问题，得到的依旧是一个数组

products.latestBrowser = 'Chrome';
console.log(products.browsers);      // ['Firefox', 'Chrome']
console.log(products.latestBrowser); // 'Chrome'
```

##### 数据绑定和监听
```js
let onWatch = (obj, setBind, getLogger) => {
    let handler = {
        get(target, prop, receiver) {
            getLogger(target, prop);
            return Reflect.get(target, prop, receiver);
        },
        set(target, prop, value, receiver) {
            setBind(value);
            return Reflect.set(target, prop, value);
        }
    }

    return new Proxy(obj, handler);
}

let obj = { a: 1 }
let value
let p = onWatch(obj, (v) => {
  value = v
}, (target, property) => {
  console.log(`Get '${property}' = ${target[property]}`);
})
p.a = 2 // bind `value` to `2`
p.a // -> Get 'a' = 2

```

### 为什么 0.1 + 0.2 != 0.3

#### Why

> Computers can only natively store integers, so they need some way of representing decimal numbers. This representation is not perfectly accurate. This is why, more often than not, 0.1 + 0.2 != 0.3.

计算器原本只支持整数的表示，因此需要一些方法来表示小数，但这种方法并不是完全精确，所以导致了一些小数相加的结果出乎意料。

> It’s actually rather interesting. When you have a `base-10 system (like ours), it can only express fractions that use a prime factor of the base.` `The prime factors of 10 are 2 and 5`. So 1/2, 1/4, 1/5, 1/8, and 1/10 can all be expressed cleanly because the denominators all use prime factors of 10. In contrast, `1/3, 1/6, 1/7 and 1/9 are all repeating decimals because their denominators use a prime factor of 3 or 7`.

十进制系统里只能准确表示以`10`的质因子组成的小数，其它的都表示为循环小数

> In binary (or base-2), `the only prime factor is 2, so you can only cleanly express fractions whose denominator has only 2 as a prime factor.` In binary, 1/2, 1/4, 1/8 would all be expressed cleanly as decimals, while 1/5 or 1/10 would be repeating decimals. So 0.1 and 0.2 (1/10 and 1/5), while clean decimals in a base-10 system, are repeating decimals in the base-2 system the computer uses. When you perform math on these repeating decimals, you end up with leftovers which carry over when you convert the computer’s base-2 (binary) number into a more human-readable base-10 representation.

在二进制系统中，只有质因子2，所以`1/4`/`1/8`可以准确表达，其它的如`1/5`/`1/10`都会表示为循环小数，所以尽管`0.1`和`0.2`在十进制中是可以准确表达的小数，但在计算机使用的二进制系统中是循环小数。当你对这些循环小数进行数学运算时，当你把电脑上以2为底(二进制)的数字转换成更容易被人类读懂的以10为底的数字时，你会得到一些剩余的结果。

前面的现象，其它一些语言也可能有同样的问题，归根结底其实和具体的编程语言无关，主要问题还是计算机中到底是如何表示小数以及如何进行小数运算的。

> 与许多其他编程语言不同，JavaScript 并未定义不同类型的数字数据类型，而是始终遵循国际 IEEE 754 标准，将数字存储为双精度浮点数。


#### 推导

因为 JS 采用 IEEE 754 双精度版本（64位），并且只要采用 IEEE 754 的语言都有该问题。

计算器内部的数都是采用二进制表示的，十进制转二进制方法：
- 十进制整数转二进制整数：除2取余，逆向排序；
- 十进制小数转二进制小数：乘2取整，顺序排列；

所以十进制0.1转为二进制的过程是乘2取整过程：
```js
0.1 * 2 = 0.2 // 0
0.2 * 2 = 0.4 // 0
0.4 * 2 = 0.8 // 0
0.8 * 2 = 1.6 // 1
0.6 * 2 = 1.2 // 1
0.2 * 2 = 0.4 // 0
...

```
从上面可以看出0.1的二进制格式为：0.000110011...———— 一个无限循环小数，计算器存储位数有限，我们没办法将其精确表示，因此存在精度问题；

> 为了解决部分小数无法用二进制精确表示的问题，于是有了`IEEE 754规范`；

> 浮点数和小数并不是完全一样的，计算机中小数的表示法，其实有定点和浮点两种。因为在位数相同的情况下，定点数的表示范围要比浮点数小。所以在计算机科学中，使用浮点数来表示实数的近似值。

IEEE 754规定了四种表示浮点数值的方式：单精确度（32位）、双精确度（64位）、延伸单精确度（43比特以上，很少使用）与延伸双精确度（79比特以上，通常以80位实现）。`其中最常用的就是32位单精度浮点数和64位双精度浮点数。`

> IEEE并没有解决小数无法精确表示的问题，只是提出了一种使用近似值表示小数的方式，并且引入了精度的概念。

浮点数是一串0和1构成的位序列(bit sequence)，从逻辑上用三元组{S,E,M}表示一个数N,如下图所示：

![avartar](./assets/floating_2.jpg)

- S(sign)表示N的符号位。对应值s满足：n>0时，s=0; n≤0时，s=1。
- E(exponent)表示N的指数位，位于S和M之间的若干位。对应值e值也可正可负。
- M(mantissa)表示N的尾数位，恰好，它位于N末尾。M也叫有效数字位（significand）、系数位（coefficient）, 甚至被称作"小数"。

一个浮点数实际可以表示为：
![avartar](./assets/floating_formula.jpg)

> 而对于那些无限循环的二进制数来说，计算机采用浮点数的方式保留了一定的有效数字，那么这个值只能是近似值，不可能是真实值。

十进制`0.1`
=> 二进制0.0001100110011001100110011...（循环0011）
=> 尾数为1.1001100110011001100...1100（共52位，除了小数点左边的1）,指数为-4（二进制移码为00000000100）,符号位为0 => 存储为0 00000000100 100110011...11001 => => 因为尾数最多52位，所以实际存储的值为0.00011001100110011001100110011001100110011001100110011001



十进制`0.2`
=> 二进制0.00110011001100110011001100110011001100110011001100110011（循环0011）=> 尾数为1.1001100110011001100...1100（共52位，除了小数点左边的1）,指数为-3（二进制移码为00000000011）,符号位为0 => 存储为0 00000000011 100110011...11001 => => 因为尾数最多52位，所以实际存储的值为0.0011001100110011001100110011001100110011001100110011001

两者相加得：
![avatar](./assets/floating_add.jpg)

0.01001100110011001100110011001100110011001100110011001100转为十进制后得到： 0.30000000000000004



#### 解决方案：
```js
parseFloat((0.1 + 0.2).toFixed(10))
```

### V8 下的垃圾回收机制
V8 实现了准确式 GC，GC 算法采用了分代式垃圾回收机制。因此，V8 将内存（堆）分为新生代和老生代两部分。

#### 新生代算法
新生代中的对象一般`存活时间较短`，使用 Scavenge GC 算法。

在新生代空间中，内存空间分为两部分，分别为 From 空间和 To 空间。在这两个空间中，必定有一个空间是使用的，另一个空间是空闲的。新分配的对象会被放入 From 空间中，当 From 空间被占满时，新生代 GC 就会启动了。算法会检查 From 空间中存活的对象并复制到 To 空间中，如果有失活的对象就会销毁。当复制完成后将 From 空间和 To 空间互换，这样 GC 就结束了。

#### 老生代算法
`老生代中的对象一般`存活时间较长且数量也多，使用了两个算法，分别是`标记清除算法`和`标记压缩算法`

在老生代中，以下情况会先启动标记清除算法：
- 某一个空间没有分块的时候
- 空间中被对象超过一定限制
- 空间不能保证新生代中的对象移动到老生代中

在这个阶段中，会遍历堆中所有的对象，`然后标记活的对象，在标记完成后，销毁所有没有被标记的对象`。在标记大型对内存时，可能需要几百毫秒才能完成一次标记。这就会导致一些性能上的问题。为了解决这个问题，2011 年，V8 从 stop-the-world 标记切换到`增量标志`。在增量标记期间，GC 将标记工作分解为更小的模块，可以让 JS 应用逻辑在模块间隙执行一会，从而不至于让应用出现停顿情况。但在 2018 年，GC 技术又有了一个重大突破，这项技术名为并发标记。该技术可以让 GC 扫描和标记对象时，同时允许 JS 运行。

除对象后会造成堆内存出现碎片的情况，`当碎片超过一定限制后会启动压缩算法`。在压缩过程中，将活的对象像一端移动，直到所有对象都移动完成然后清理掉不需要的内存。

![avatar](./assets/gc.jpg)



___

# 浏览器

## 事件机制
### DOM事件级别
> DOM有4次版本更新，与DOM版本变更，产生了3种不同的DOM事件：`DOM 0级事件处理，DOM 2级事件处理和DOM 3级事件处理`。由于DOM 1级中没有事件的相关内容，所以没有DOM 1级事件。

#### DOM 0级事件

> 同一个元素只能绑定一个函数，否则后面的函数与覆盖之前的函数，非HTML属性类DOM 0级事件解绑时btn.onclick = null即可
1. on-event(HTML属性)
```
<button onclick="alert('xxx')"/>
```

2. on-event(非HTML属性)
```
window.onload = function(){
  document.write("Hello world!");
};

btn.onclick = function () {

}
```

#### DOM 2级事件
> DOM 2级事件通过`addEventListener`定义；同一个元素可以绑定多个事件，按照绑定顺序执行；解绑使用`removeEventListener`；


```js
element.addEventListener(event, function, useCapture)
```

> Dom 2级事件有三个参数：第一个参数是事件名（如click）；第二个参数是事件处理程序函数；`第三个参数如果是true的话表示在捕获阶段调用`，为false的话表示在冒泡阶段调用，默认为冒泡。


```html
<body>
    <div class="wrapper">
        <button id="a">aaa</button>
        <button id="b">bbb</button>
    </div>
    <script>
        window.onload = function () {
            var btn = document.querySelector('#a')
            var btn2 = document.querySelector('#b')
            
            btn.onclick = function () {
                console.log(111)
            }

            btn.onclick = function () {
                console.log(222)
            }

            btn.addEventListener('click', function() {
                console.log(333)
            })

            btn2.addEventListener('click', function() {
                console.log(444)
            })

            btn2.addEventListener('click', function() {
                console.log(555)
            })
        }
    </script>
</body>
```

点击`btn`先输出222，后输出333；点击`btn2`先输出444，后输出555；


#### DOM 3级事件
DOM3级事件在DOM2级事件的基础上添加了更多的事件类型，增加的类型如下：
- UI事件，当用户与页面上的元素交互时触发，如：load、scroll
- 焦点事件，当元素获得或失去焦点时触发，如：blur、focus
- 鼠标事件，当用户通过鼠标在页面执行操作时触发如：dblclick、mouseup
- 滚轮事件，当使用鼠标滚轮或类似设备时触发，如：mousewheel
- 文本事件，当在文档中输入文本时触发，如：textInput
- 键盘事件，当用户通过键盘在页面上执行操作时触发，如：keydown、keypress
- 合成事件，当为IME（输入法编辑器）输入字符时触发，如：compositionstart
- 变动事件，当底层DOM结构发生变化时触发，如：DOMsubtreeModified
同时DOM3级事件也允许使用者自定义一些事件。


### DOM事件流
事件流(Event Flow)指的就是「网页元素接收事件的顺序」。`事件流可以分成两种机制`：
- 事件捕获
- 事件冒泡

当一个事件发生后，会在子元素和父元素之间传播（propagation）。这种`传播分成三个阶段`：

- 捕获阶段：事件从window对象自上而下向目标节点传播的阶段；
- 目标阶段：真正的目标节点正在处理事件的阶段；
- 冒泡阶段：事件从目标节点自下而上向window对象传播的阶段。



![avatar](./assets/eventCapture.png)
![avatar](./assets/eventBubbling.png)


> 一般我们只希望事件触发在目标上，这时可以使用`stopPropagation`来阻止事件的进一步传播。通常我们认为`stopPropagation`是用来阻止事件冒泡的，其实它也可以阻止事件捕获；

> stopImmediatePropagation 同样也能实现阻止事件，但是还能阻止该事件目标执行别的注册事件


### 事件代理
`定义：`如果一个节点中的子节点是动态生成的，那么子节点需要注册事件的话应该注册在父节点上

事件代理有以下优势：
- 节约内存
- 不需要给子节点注销事件


这里需要区分下`target`与`currentTaget`：
- target: 触发事件的元素
- currentTarget: 事件绑定的元素



## 跨域
> `一般我们所说的跨域是指访问非同源的资源的行为`；浏览器通常会允许发送跨域请求，但是会拦截跨域请求的响应；这主要是为了防止恶意网站读取其他网站的可信任信息，以及合理读取其他网站的网页内容；

### 浏览器同源策略
> `同源策略`是一个重要的安全策略，它用于限制一个origin的文档或者它加载的脚本如何能与另一个源的资源进行交互。它能帮助阻隔恶意文档，减少可能被攻击的媒介。

#### 同源定义
> 如果两个 URL 的 protocol、port (en-US) (如果有指定的话) 和 host 都相同的话，则这两个 URL 是同源。

#### 源的更改
> 满足某些限制条件的情况下，页面是可以修改它的源。`脚本可以将 document.domain 的值设置为其当前域或其当前域的父域`。如果将其设置为其当前域的父域，则这个较短的父域将用于后续源检查。

> `端口号是由浏览器另行检查的`。任何对 document.domain 的赋值操作，包括 document.domain = document.domain 都会`导致端口号被重写为 null` 。

#### 跨源网络访问
同源策略控制不同源之间的交互，例如在使用`XMLHttpRequest` 或 `<img>` 标签时则会受到同源策略的约束。这些交互通常分为三类：

- 跨源写操作一般是被允许的；例如链接（links），重定向以及表单提交。特定少数的 HTTP 请求需要添加预检请求。
- 跨源资源嵌入一般是被允许
- 跨源读一般是不被允许的；但常可以通过内嵌资源来巧妙的进行读取访问；

#### 跨源数据存储访问
1. 访问存储在浏览器中的数据，如 `localStorage` 和 `IndexedDB`，是以源进行分割。每个源都拥有自己单独的存储空间，一个源中的 JavaScript 脚本不能对属于其它源的数据进行读写操作。
2. `Cookies` 使用不同的源定义方式。一个页面`可以为本域和其父域设置 cookie`，只要是父域不是公共后缀（public suffix）即可

### 跨域解决方案
#### CORS

![avatar](./assets/cors.png)

##### 定义
> CORS （Cross-Origin Resource Sharing，跨域资源共享）是一个系统，它由一系列传输的HTTP 头组成，`这些 HTTP 头决定浏览器是否阻止前端 JavaScript 代码获取跨域请求的响应`。

> 跨源域资源共享（CORS）机制允许 Web 应用服务器进行跨源访问控制，从而使跨源数据传输得以安全进行。

> 同源安全策略 默认阻止“跨域”获取资源。但是 CORS 给了 web 服务器这样的权限，即服务器可以选择，允许跨域请求访问到它们的资源。

##### 相关的CORS头：
- `Access-Control-Allow-Origin`：响应头，允许的请求域
- `Access-Control-Allow-Credentials`：响应头，Access-Control-Allow-Credentials 标头需要与 `XMLHttpRequest.withCredentials` 或 Fetch API 的 Request() 构造函数中的 credentials 选项结合使用。Credentials 必须在前后端都被配置（即 Access-Control-Allow-Credentials header 和 XHR 或 Fetch request 中都要配置）才能使带 credentials 的 CORS 请求成功。
- `Access-Control-Allow-Headers`：响应头，用在对预请求的响应中，指示实际的请求中可以使用哪些 HTTP 头，包括自定义头
- `Access-Control-Allow-Methods`：指定对预请求的响应中，哪些 HTTP 方法允许访问请求的资源。
- `Access-Control-Max-Age`：指示预请求的结果能被缓存多久
- `Access-Control-Request-Headers`：用于发起一个预请求，告知服务器正式请求会使用哪些 HTTP 头
- `Access-Control-Request-Method`：用于发起一个预请求，告知服务器正式请求会使用哪一种 HTTP 请求方法
- `Origin`：指示获取资源的请求是从什么域发起的

```js
// 允许 credentials:
Access-Control-Allow-Credentials: true

// 使用带 credentials 的 XHR：
var xhr = new XMLHttpRequest();
xhr.open('GET', 'http://example.com', true) // 第三个参数标识是否为异步请求
xhr.withCredentials = true;

// 使用带credentials的Fetch
fetch(url, {
    credentials: 'include'
})
```

##### 什么情况下需要cors
- XHR或者Fetch APIs发起的跨域请求；
- Web字体（css中通过@font-face使用跨域字体资源）；
- 使用 drawImage 将 Images/video 画面绘制到 canvas
- WebGL textures
- image shappes














## 参考文献
1. [前端进阶之道](https://yuchengkai.cn/docs/frontend/)
2. [https://yuchengkai.cn/home/](https://yuchengkai.cn/home/)
3. [Floating Point Math](https://0.30000000000000004.com/)
4. [漫话：如何给女朋友解释为什么计算机中 0.2 + 0.1 不等于 0.3 ？](https://zhuanlan.zhihu.com/p/265281184)
5. [非科班前端人的一道送命题：0.1+0.2 等于 0.3 吗？](https://zhuanlan.zhihu.com/p/363133848)
6. [浏览器的同源策略](https://developer.mozilla.org/zh-CN/docs/Web/Security/Same-origin_policy)
7. [10 种跨域解决方案（附终极方案）](https://zhuanlan.zhihu.com/p/132534931)
8. [CORS](https://developer.mozilla.org/zh-CN/docs/Glossary/CORS)
9. [跨源资源共享（CORS）](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/CORS)