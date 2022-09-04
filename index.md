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

> 一般而言，对于跨源 XMLHttpRequest 或 Fetch 请求，浏览器 不会 发送身份凭证信息。如果要发送凭证信息，需要设置 `XMLHttpRequest` 的某个特殊标志位。（XMLHttpRequest的`withCredentials = true`或Fetch的`credentials: 'include'`）

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


##### 简单请求
> 使用CORS时，只有非`简单请求`不会触发`预检请求`

满足下列所有条件则可视为简单请求：
1. 使用以下方法之一：
    - GET
    - POST
    - HEAD

2. 人为设置的请求头在以下请求头之内
    - Accept
    - Accept-Language
    - Content-Language
    - Content-Type（值有限制）

3. Content-Type的值仅限以下之一
    - text/plain
    - multipart/form-data
    - application/x-www-form-urlencoded

4. 请求中的任意 XMLHttpRequest 对象均没有注册任何事件监听器；XMLHttpRequest 对象可以使用 XMLHttpRequest.upload 属性访问

5. 请求中没有使用 ReadableStream 对象

##### 预检请求
> 与前述简单请求不同，“需预检的请求”要求必须`首先使用 OPTIONS 方法发起一个预检请求到服务器，以获知服务器是否允许该实际请求`。"预检请求“的使用，`可以避免跨域请求对服务器的用户数据产生未预期的影响`。

```js
// 预检请求示例
const xhr = new XMLHttpRequest();
xhr.open('POST', 'https://bar.other/resources/post-here/');
xhr.setRequestHeader('X-PINGOTHER', 'pingpong');
xhr.setRequestHeader('Content-Type', 'application/xml');
xhr.onreadystatechange = handler;
xhr.send('<person><name>Arun</name></person>');

```

![avatar](./assets/cors_preflight.png)

下面是服务端和客户端完整的信息交互。首次交互是 预检请求/响应：

```
OPTIONS /doc HTTP/1.1
Host: bar.other
User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10.14; rv:71.0) Gecko/20100101 Firefox/71.0
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8
Accept-Language: en-us,en;q=0.5
Accept-Encoding: gzip,deflate
Connection: keep-alive
Origin: https://foo.example
Access-Control-Request-Method: POST
Access-Control-Request-Headers: X-PINGOTHER, Content-Type

HTTP/1.1 204 No Content
Date: Mon, 01 Dec 2008 01:15:39 GMT
Server: Apache/2
Access-Control-Allow-Origin: https://foo.example
Access-Control-Allow-Methods: POST, GET, OPTIONS
Access-Control-Allow-Headers: X-PINGOTHER, Content-Type
Access-Control-Max-Age: 86400
Vary: Accept-Encoding, Origin
Keep-Alive: timeout=2, max=100
Connection: Keep-Alive
```

##### demo
客户端代码：
```html
<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>Page Title</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
</head>

<body>
    <div class="hook"></div>
    <script>
        var target = document.querySelector('.hook');
        var xhr = new XMLHttpRequest();
        xhr.onload = function () {
            if (xhr.readyState == 4) {
                if (xhr.status >= 200 && xhr.status < 300 || xhr.status == 304) {
                    target.innerHTML = xhr.responseText;
                    console.log(xhr.responseText);
                } else {
                    target.innerHTML = 'Reuqest failed:' + xhr.status;
                    console.log("Request failed:", xhr.status);
                }
            }
        }
        // xhr.widthCredientials = true;
        xhr.open('post', 'http://localhost:8080', true);
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        xhr.setRequestHeader('X-Stage-Test', 0);
        xhr.send('name=fn&id=12377');
    </script>
</body>

</html>

```

服务端处理：
```js
var qs = require('querystring');
var http = require('http');
var server = http.createServer();

server.on('request', function(req, res) {
    var _data = '';
    req.on('data', function (chunk) {
        _data += chunk;
    })

    req.on('end', function () {
        res.writeHead(200, 'success', {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type, X-Stage-Test',
            'Access-Control-Allow-Methods': 'GET, GET, POST',
        })

        res.end('message from client: ' + _data)
    })
})

server.listen(8080);
console.log('server is running at port 8080...');
```

![avatar](./assets//cors-preflight-demo.png)
![avatar](./assets//cors-preflight-demo2.png)


#### JSONP

##### 原理
script标签请求的资源不受同源策略限制，但JSONP跨域需要服务器端相应的处理才能支持；

JSONP跨域通常可以动态创建一个script标签，然后在请求的url中带上一些处理参数，一般是一个回调函数；服务端在接收到请求后，从请求中获得处理参数，然后将处理结果返回给客户端；如果返回的是函数调用，那么客户端的回调函数就会被调用执行；

> 除了 script 标签， link、img 等标签的请求也是允许跨域的。

##### 限制
`JSONP只支持GET请求方式`，本质上是因为script标签请求资源的方式就是GET；另外，根据实现过程可以看到，`jsonp的返回是一个函数调用，容易导致XSS攻击等安全问题`；

##### 实现
客户端代码如下，其URL为http://localhost:8001/test/test1.html；请求的服务器地址为：http://localhost:8080/；为了跨域，在请求的url加入一个callback参数指定jsonp回调函数名称；服务端接收到请求后从中提取请求参数及回调函数名，然后将对应的回调函数包裹相应参数返回给客户端handleCallback(id)；这时客户端的handleCallback()函数就会被自动调用。

```html
// 客户端
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>

<body>
    <button onclick="jsonp();">request</button>
    <div id='req_times'></div>
    <script>
        function jsonp() {
            console.log(123)
            var script = document.createElement('script');
            script.type = 'text/javascript';
            script.src = 'http://localhost:8080?callback=handleCallback';
            document.head.appendChild(script);
        }

        // jquery请求方式
        // function ajax() {
        //     $.ajax({
        //         url: 'http://localhost:8080',
        //         type: 'GET',
        //         dataType: 'jsonp',
        //         jsonpCallback: 'handleCallback',
        //     })
        // }

        function handleCallback(id) {
            console.log('handleCallback request times：', id);
            document.querySelector('#req_times').innerHTML = `handleCallback request times：${encodeURI(id)}`
        }
    </script>
</body>

</html>
```

服务端处理：
```js
var qs = require('querystring');
var http = require('http');
var server = http.createServer();

var id = 0;

server.on('request', function (req, res) {
    console.log(req.url);
    console.log(req.url.split('?'));
    var params = qs.parse(req.url.split('?')[1]);
    
    var fn = params.callback;

    res.writeHead(200, {'Content-Type': 'text/javascript'});
    res.write(fn + '(' + id++ + ')');
    res.end();
})

server.listen('8080');
console.log('server is running at port 8080...');	
```


#### postMessage
##### API介绍
```js
targetWindow.postMessage(message, targetOrigin, [transfer]); // 发送消息

window.onmessage = function (e) {
    // console.log(e.data); //e对象下具有data，source及origin属性
}
```

其中，`targetWindow`是想要通信的其他页面的window对象；`targetOrigin`是预通信的其他页面的域名，可以设置为*与任何页面通信，但出于安全考虑不建议；`mesage是要进行通信的数据，已经可以支持字符串、对象等多种数据类型`；transfer是可选参数，表示一个与message同时发送到接收方的Transferable对象，控制权由发送方转移到接收方；

onmessage监听消息，回调函数传入对象e，具有属性data、source、origin；`data`是传递的数据；`source`是对发送方window对象的引用；`origin`是发送方的域名；


##### demo

```html
// index.html 域名localhost:8001
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  <title>Document</title>
</head>
<body>
  <h1>HTML5 postMessage</h1>
  <p></p>
  <iframe src="http://localhost:8888/test/sub.html" frameborder="0" onload="load()"></iframe>
  <script>
    function load() {
      var iframe = document.querySelector('iframe');
      iframe.contentWindow.postMessage('i need some msg from you.', 'http://localhost:8888');
      // window.postMessage({'name': 'post', method: 'cors'}, 'http://localhost:8880/test/sub.html');
      window.onmessage = function (e) {
        console.log(e.data);
      }
    }
  </script>
</body>
</html>

```

```js
// sub.html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  <title>Document</title>
</head>
<body>
  <script>
    window.onmessage = function (e) {
      console.log(e.data);
      e.source.postMessage({'name': 'post', method: 'cors'}, e.origin);
    }  
  </script>
</body>
</html>
```

运行结果：
```js
i need some msg from you. // sub.html输出
{name: "post", method: "cors"}	// index.html输出
```

#### WebSocket

WebSocket是HTML5新增的一种用于客户端和服务端进行`全双工通信`的协议，可以在客户端和服务端建立一个持久化的连接，并且在一个TCP连接中高效双向数据传递；


服务端代码：
```js
const WebSocket = require('ws');

const socket = new WebSocket.Server({ port: 5555 });

socket.on('connection', ws => {
    ws.on('message', (data) => {
        console.log('data from client: ', data);
        ws.send('hello websocket...');
        console.log('server finish sending data...')
    })
})

```

客户端代码：
```html
<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>Page Title</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
</head>

<body>
    <div class="hook"></div>
    <script>
        SocketEvent = () => {

            if (window.WebSocket) {
                console.log('llll')
                var socket = new WebSocket('ws://localhost:5555');

                socket.onopen = function () {
                    console.log('client socket opening...');
                    socket.send(`I'm requesting some data from you...`);
                }
                socket.onmessage = function (e) {
                    console.log('on message', e);
                    console.log('on message data', e.data);
                }
                socket.onclose = function (e) {
                    console.log('client socket closing...');
                }
            }
        }
    </script>
    <button onclick="SocketEvent()">socket</button>
</body>

</html>
```

#### document.domain + iframe

`document.domain跨域的基础是二级域名、协议及端口号要一致，通过document.domain修改页面的域名，从而达到同一顶级域名下的子域名间的跨域`；举个例子：
比如一主页面的域名是sale.game.abc.com，内嵌一个iframe，如下：
```JS
<iframe id="demo" src="http://gamestatic.abc.com/game/test/a.html">
```

由于主页面的域名与嵌入的子页面的二级域名是一致的，都是abc.com，因此可以使用该方法进行跨域；需要在主页面和子页面的脚本中分别使用以下语句将页面的域名置为abc.com；

```JS
document.domain = 'abc.com';

```

这样，`父级页面就可以获取iframe子页面的document对象，并且获取和操作子页面的dom元素了；否则，受跨域限制直接在不同子域名下的两个关联页面也无法操作对方的dom`；


#### window.name + iframe

##### window.name特性
- `window.name`是一个全局变量
- 每个窗口有一个独立的`window.name`与之对应，默认值为空字符串
- `window.name与每个窗口的生命周期相关`，`同一个窗口载入的多个页面同享同一个window.name值`，窗口关闭则对应的window.name也被销毁；
- 不同窗口打开的同一域名的两个页面的`window.name`不能共享；
- window.name数据格式可以自定义，大小一般不超过2M；


#### node正向代理

##### 原理
`同源策略是浏览器端的安全策略；如果把请求通过node服务器代理请求，那么就没有跨域限制了`；`http-proxy-middleware`是node中常用的设置代理的插件库，可以与express、connet等配合使用

##### demo
```js
const http = require('http');
const server = http.createServer();
const qs = require('qs');
const url = require('url');

let count = 0;

server.on('request', (req, res) => {
    count++;
    const query = url.parse(req.url, true).query;
    res.writeHead(200, {
        'Set-Cookie', 'name=fn;Path=/;Domain=localhost:6688;HttpOnly'
    })
    query.count == 1 ? res.write(`Response from Server -- localhost:6688; visit count: ${count}`) : res.write(`Response from Server -- localhost:6688; no tracking...`);
    res.end();
})

server.listen(6688);
console.log('server is running at port 6688...')
```

```js
const express = require('express');
const proxy = require('http-proxy-middleware');
const app = express();

const options = {
    target = 'http://localhost:6688',
    changeOrigin: true,
    onProxyRes: (proxyRes, req, res) => {
        res.header('Access-Control-Allow-Origin', 'http:localhost');
        res.header('Access-Control-Allow-Credentials', true);
        proxyRes.headers['x-self-defined'] = 'node middleware';
    }
}

app.use('./api', proxy(options));

app.listen(8002);
console.log('proxy server is listen at port 8002');

```

访问`http://localhost:6688/api?count=0`后可以看到
![avatar](./assets/forward_proxy.jpg)


#### nginx反向代理
##### 原理
与node中间件的原理一样，都是利用服务端不受同源策略限制的特点，使用同域名的反向代理服务器转发请求，从而进行跨域；

##### 实现

```
# nginx配置

worker_processes 1; // 工作进程数，与CPU相同

events: {
    connections 1024; // 每个进程最大连接数
}

http {
    sendfile on; // 高效文件传输模式
    server {
        listen 80;
        server_name localhost;
        # 负载均衡与反向代理
        location / {
            root html;
            index index.html index.htm;
        }
        location /test.html {
            proxy_pass http:localhost:6688
        }
    }
}
```

```js
// server.js  http://localhost:6688
const http = require('http');
const server = http.createServer();
const qs = require('querystring');
const url = require('url');

let count= 0;

server.on('request', (req, res) => {
  // var params = url.parse(req.url, true);
  var params = qs.parse(req.url.split('?')[1]);
  res.write(JSON.stringify(params));
  res.end(`port: 6688`);
})

server.listen(6688);
console.log('server is running at port 6688...')
```

此时，直接访问`localhost/test.html`域名时`nginx会将请求代理到localhost:6688`域名下，从而实现跨域；

### Event Loop

JS是非阻塞的单线程语言，

#### 宏任务与微任务

- 微任务：`process.nextTick`、`promise`、`Object.observe`、`MutaionObserver`
- 宏任务： `script`、`setTimeout`、`setInterval`、`setImmediate`、`I/O`、`UI rendering`

#### 一次Event Loop的执行顺序

- 执行同步代码，这属于宏任务 
- 执行栈为空，查询是否有微任务需要执行
- 执行所有微任务
- 必要的话渲染UI
- 然后开始下一轮 Event loop

##### demos
```js
async function async1() {
    console.log("async1 start");
    await async2();
    console.log("async1 end");
}

async function async2() {
    console.log("async2");
}

console.log("script start");

setTimeout(function() {
    console.log("setTimeout");
}, 0);

async1();

new Promise(function(resolve) {
    console.log("promise1");
    resolve();
}).then(function() {
    console.log("promise2");
});

console.log("script end");
// script start -> async1 start -> async2 -> promise1 ->
// script end -> async1 end -> promise2 -> setTimeout
```


#### Node中Event Loop
> Node中的Event Loop和浏览器中的不相同


##### 当nodejs启动时，会执行三件事：
- 初始化`Event Loop`;
- 开始执行脚本；
- 进入`Event Loop`；

共有6个阶段，并按顺序反复执行：
![avatar](./assets/eventLoop.png)



##### timers阶段

处理`setTimeout`和`setInterval`中到时的回调函数，对于timers中队列的处理，setTimeout或setInterval中的函数都添加到队列里，同时记下来这些函数什么时间被调用到了调用时间就调用，没到时间就进入下一阶段，然后会停留在poll阶段

##### I/O callback阶段

I/O 阶段会执行除了 close 事件、定时器及setImmediate的其他回调

###### idle, prepare
idle, prepare 阶段内部实现，暂时不深究

##### poll(轮询)
poll 阶段很重要，这一阶段中，系统会做两件事情：
- 执行到点的定时器
- 执行 poll 队列中的事件

并且当 poll 中没有定时器的情况下，会发现以下两件事情
- 如果 poll 队列不为空，会遍历回调队列并同步执行，直到队列为空或者系统限制
- 如果 poll 队列为空，会有两件事发生
    - 如果有 `setImmediate` 需要执行，poll 阶段会停止并且进入到 `check` 阶段执行 `setImmediate`；
    - 如果没有 `setImmediate` 需要执行，会等待回调被加入到队列中并立即执行回调

如果有别的定时器需要被执行，会回到 timer 阶段执行回调

##### check
check 阶段执行 `setImmediate`;

##### close callbacks
close callbacks 阶段执行 close 事件

##### nextTick

> 进入每个阶段前都会执行，也就是当前阶段结束后立马执行nextTick，然后进入下一阶段，包括nodejs启动的时候也会执行

> Node 中的 `process.nextTick` 会先于其他 `microtask` 执行。

```js
setTimeout(() => {
    console.log('timeout')
    process.nextTick(() => {
        console.log('timeout next tick')
    })
})
setImmediate(() => {
    console.log('immediate')
})
process.nextTick(() => {
    console.log('next tick')
})
// next tick -> timeout -> timeout next tick -> immediate
```

```js
var fs = require('fs')

fs.readFile(__filename, () => {
  setTimeout(() => {
    console.log('timeout')
  }, 0)
  setImmediate(() => {
    console.log('immediate')
  })
})
// 因为 readFile 的回调在 poll 中执行
// 发现有 setImmediate ，所以会立即跳到 check 阶段执行回调
// 再去 timer 阶段执行 setTimeout
// 所以以上输出一定是 setImmediate，setTimeout
```

上面介绍的都是 macrotask 的执行情况，microtask 会在以上每个阶段完成后立即执行。
```js
setTimeout(() => {
  console.log('timer1')

  Promise.resolve().then(function() {
    console.log('promise1')
  })
}, 0)

setTimeout(() => {
  console.log('timer2')

  Promise.resolve().then(function() {
    console.log('promise2')
  })
}, 0)

// 以上代码在浏览器和 node 中打印情况是不同的
// 浏览器中一定打印 timer1, promise1, timer2, promise2
// node 中可能打印 timer1, timer2, promise1, promise2
// 也可能打印 timer1, promise1, timer2, promise2
```


### 存储

#### cookie, localStorage, sessionStorage, indexDB对比

|特性|cookie|localStorage|sessionStorage|indexDB|
|-|-|-|-|-|
|数据生命周期|一般由服务器生成，可以设置过期时间|持久存储，除非被清理，否则一直存在|会话级别，页面关闭就清理|除非被清理，否则一直存在|
|数据存储大小|4kb|5M|5M|无限|
|与服务端通信|每次都会携带在 header 中，对于请求性能影响|不参与|不参与|不参与|

#### cookie安全性
|属性|作用|
|-|-|
|value|如果用于保存用户登录态，应该将该值加密，不能使用明文的用户标识|
|http-only|`用于阻止 JavaScript 通过 Document.cookie 属性访问 cookie`。注意，设置了 HttpOnly 的 cookie 在 JavaScript `初始化的请求中仍然会被发送`。减少 XSS 攻击|
|secure|只能在协议为 HTTPS 的请求中携带|
|same-site|规定浏览器不能在跨域请求中携带 Cookie，减少 CSRF 攻击；可选值有`Strict`、`Lax`、`None`|

- Strict: 这意味`浏览器仅对同一站点的请求发送 cookie`，即请求来自设置 cookie 的站点。如果请求来自不同的域或协议（即使是相同域），则携带有 SameSite=Strict 属性的 cookie 将不会被发送。

- Lax：这意味着 `cookie 不会在跨站请求中被发送`，如：加载图像或 frame 的请求。`但 cookie 在用户从外部站点导航到源站时，cookie 也将被发送`（例如，跟随一个链接）。这是 SameSite 属性未被设置时的默认行为。

-None：这意味着`浏览器会在跨站和同站请求中均发送 cookie`。在`设置这一属性值时，必须同时设置 Secure 属性`，就像这样：SameSite=None; Secure。


#### Service Worker
> Service Workder相当于浏览器与web应用程序之间的代理服务器，可以捕获请求事件并做相应处理；目前主要用于`离线应用`以及`消息推送`及`后台同步`等；

##### 特性
- 无法直接访问和操作DOM
- 在长时间不用时会被中止并在下次需要时重启
- 可以访问和操作indexedDB API
- 推荐使用HTTPS
- 内部实现基于Promise

##### 生命周期
![avatar](./assets/service_worker_lifecycle.png)

##### 事件
![avatar](./assets/service_worker_event.png);

##### demo
1. 注册
```js
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js')
            .then(registration => {
                console.log('sw installed: ', registration);
            })
            .catch(err => console.log('sw installed failed: ', err));
    })
}
```

2. 安装Service Worker
```js
// 监听install事件并缓存所需文件
var CACHE_NAME = 'sw-cache';
var CACHE_URLS = ['./index.html', './index.js', './public/equal.png', './public/icon.png'];
self.addEventListener('install', e => {
    self.skipWaiting();  /* 跳过等待状态并尽快替代旧的SW进入活动状态 */
    e.waitUntil(
        caches.open(CACHE_NAME) // 打开缓存
        .then(cache => cache.addAll(CACHE_URLS))
    )
})
```

3. 捕获请求并处理
```js
self.addEventListener('fetch', e => {
    e.responseWith(
        caches.match(e.request)
        .then(res => { // 检测缓存资源和请求资源是否匹配， e.request具有以下属性：url/method/header/body
            if (res) {
                return res;
            }
            console.log('loaded from sw：', res);
        })
    )
})
```

运行结果
![avatar](./assets/serviceWorker.gif)

在`cache Storage`中可以看到名为`sw-cache`的缓存；


### 渲染机制

#### 渲染流程
浏览器的渲染机制一般分为以下几个步骤：
1. 处理HTML并构建DOM树；
2. 处理CSS并构建CSSOM树；
3. 将DOM树和CSSOM树合并为一个渲染树；
4. genj渲染树布局，计算每个节点的位置；
5. 调用GPU绘制，合成图层，并显示在屏幕上；

![avatar](./assets/rendering.png)

> `在构建 CSSOM 树时，会阻塞渲染，直至 CSSOM 树构建完成`。并且`构建 CSSOM 树是一个十分消耗性能的过程，所以应该尽量保证层级扁平，减少过度层叠`，越是具体的 CSS 选择器，执行速度越慢。

>当 HTML 解析到 script 标签时，会暂停构建 DOM，完成后才会从暂停的地方重新开始。也就是说，如果你想首屏渲染的越快，就越不应该在首屏就加载 JS 文件。并且 CSS 也会影响 JS 的执行，只有当解析完样式表才会执行 JS，所以也可以认为这种情况下，CSS 也会暂停构建 DOM。

#### `Load`与`DOMContentLoaded`区别

- Load 事件触发代表页面中的 DOM，CSS，JS，图片已经全部加载完毕。

- DOMContentLoaded 事件触发代表初始的 HTML 被完全加载和解析，不需要等待 CSS，JS，图片加载


#### 图层

一般来说，可以把普通文档流看成一个图层。特定的属性可以生成一个新的图层。`不同的图层渲染互不影响，所以对于某些频繁需要渲染的建议单独生成一个新图层，提高性能`。但也不能生成过多的图层，会引起反作用。

通过以下几个常用属性可以生成新图层
- 3D变换：`translate3d`、`translateZ`
- `will-change`
- `video`、`iframe`标签
- 通过动画实现的`opacity`动画转场
- `position: fixed`

#### 重绘（repaint）和重排/回流（reflow）

- 重绘：节点改变外观但不会影响布局的，比如`color`；
- 回流：节点尺寸、位置等发生变化导致重新布局的称为回流；

> `回流一定伴随着重绘，但重绘不一定引发回流；回流所需的成本比重绘高的多`，改变深层次的节点很可能导致父节点的一系列回流。

以下几个动作可能会触发性能问题：
- 改变window大小
- 改变字体
- 增删样式
- 文字改变
- 定位或者浮动
- 盒模型

很多人不知道的是，重绘和回流其实和 Event loop 有关。

1. 当 Event loop 执行完 Microtasks 后，会判断 document 是否需要更新。因为浏览器是 60Hz 的刷新率，每 16ms 才会更新一次。
2. 然后判断是否有`resize`或者`scroll`，有的话会去触发事件，所以 `resize 和 scroll 事件也是至少 16ms 才会触发一次，并且自带节流功能`。
3. 判断是否触发了`media query`
4. 更新动画并且发送事件
5. 判断是否有全屏操作事件
6. 执行`requestAnimationFrame`回调
7. 执行`IntersectionObserver`回调，该方法用于判断元素是否可见，可以用于懒加载上，但是兼容性不好
8. 更新界面
9. 以上就是一帧中可能会做的事情。如果在一帧中有空闲时间，就会去执行 requestIdleCallback 回调

#### 减少重绘和回流

- 使用 translate 替代 top
- 使用 visibility 替换 display: none ，因为前者只会引起重绘，后者会引发回流（改变了布局）
- 把 DOM 离线后修改，比如：先把 DOM 给 display:none (有一次 Reflow)，然后你修改 100 次，然后再把它显示出来
- 不要把 DOM 结点的属性值放在一个循环里当成循环里的变量
- 不要使用 table 布局，可能很小的一个小改动会造成整个 table 的重新布局
- 动画实现的速度的选择，`动画速度越快，回流次数越多`，也可以选择使用 requestAnimationFrame
- 将频繁运行的动画变为图层，图层能够阻止该节点回流影响别的元素



___

# 性能

## 网络相关
### DNS预解析

DNS预解析将DNS解析的时间点提前，可以节约DNS解析的时间；
```
<link rel="dns-prefetch" href="//yuchengkai.cn" />
```

```js
// 检测是否支持`dns-prefetch`
const link = document.createElement('link');
const relList = link.relList;
if (!relList || relList.supports)
    return false;
return relList.supports('preload');

```

### 使用HTTP/2.0
由于浏览器的并发请求数限制（通常5-8个），每个请求需要进行TCP三次握手和四次挥手的过程，而TCP的连接比较耗时；另外，TCP的`慢启动`的拥塞控制策略（TCP 连接会随着时间的推移自我调节，起初会限制连接的最大速度，如果数据传输成功，会随着时间的推移提高传输速度）也会一定程度影响传输效率

HTTP/2.0支持了多路复用（多个请求复用一个TCP连接）、头部压缩，更够提升传输性能

#### TCP三次握手与四次挥手

TCP是一种面向连接的单播协议，在发送数据前，通信双方必须在彼此间建立一条连接。所谓的“连接”，其实是客户端和服务器的内存里保存的一份关于对方的信息，如ip地址、端口号等。

TCP提供了一种`可靠`、`面向连接`、字节流、`传输层`的服务，采用三次握手建立一个连接。采用四次挥手来关闭一个连接

##### TCP服务模型
一个TCP连接由一个4元组构成，分别是两个`IP地址`和两个`端口号`。

>一个TCP连接通常分为三个阶段：`启动`、`数据传输`、`退出（关闭）`。

当TCP接收到另一端的数据时，它会发送一个确认，但这个确认不会立即发送，一般会延迟一会儿。ACK是累积的，一个确认字节号N的ACK表示所有直到N的字节（不包括N）已经成功被接收了。这样的好处是如果一个ACK丢失，很可能后续的ACK就足以确认前面的报文段了。

> 序列号的作用是使得一个TCP接收端可丢弃重复的报文段，记录以杂乱次序到达的报文段。因为TCP使用IP来传输报文段，而IP不提供重复消除或者保证次序正确的功能。

##### TCP头部
![avatar](./assets/tcp_header.jpg)

![avatar](./assets/tcp_header_2.jpg)
![avatar](./assets/tcp_header_3.jpg)

> 源端口和目的端口在TCP层确定双方进程，`序列号`表示的是报文段数据中的第一个字节号，`ACK`表示确认号，该确认号的发送方期待接收的下一个序列号，即最后被成功接收的数据字节序列号加1，这个字段只有在ACK位被启用的时候才有效。



- ACK：确认，使得确认号有效；
- RST：重置连接（经常看到的reset by peer）就是此字段搞的鬼；
- SYN：用于初始化一个连接的序列号；
- FIN：该报文段的发送方已经结束向对方发送数据。
- 2的16次方等于 65536，所以系统中端口号的限制个数为 65536，`一般1024以下端口被系统占用`；
- seq 序列号，ack 确认序列号，序列号在数据传输时分包用到。`三次握手时 seq 序列号是随机的，没有实际意义`；

当一个连接被建立或被终止时，交换的报文段只包含TCP头部，而没有数据。




##### 状态转移

- `标志位`、`随机序列号`和`确认序列号`是在数据包的 TCP 首部里面；
- 几个状态是指客户端和服务端连接过程中`socket`状态；


![avatar](./assets/tcp_connect_close.jpg)

![avatar](./assets/tcp.jpg)

![avatar](./assets/tcp_connect.jpg)

- 第一次握手，客户端向服务端发送数据包，该数据包中 SYN 标志位为 1，还有随机生成的序列号c_seq，客户端状态改为 `SYN-SENT`；

- 第二次握手，服务端接收到客户端发过来的数据包中 SYN 标志位为 1，就知道客户端想和自己建立连接，服务端会根据自身的情况决定是拒绝连接，或确定连接，还是丢弃该数据包；
    - 拒绝连接，会往客户端发一个数据包，该数据包中 `RST` 标志位为 1，客户端会报 `Connection refused`；
    - 丢弃客户端的数据包，超过一定时间后客户端会报 `Connection timeout`；
    - 确定连接时会往客户端发一个数据包，该数据包中 ACK 标志位为 1，确认序列号 ack=c_seq+1，SYN 标志位为 1，随机序列号 s_seq，状态由 `LISTEN` 改为 `SYN-RCVD`；

- 第三次握手，客户端接收到数据包会做校验，校验ACK标志位和确认序列号 ack=c_seq+1，如果确定是服务端的确认数据包，改自己的状态为 ESTABLISHED，并给服务端发确认数据包；

- 服务端接到客户端数据包，会`校验ACK标志位和确认序列号 ack=s_seq+1`，改自己的状态为 ESTABLISHED，之后就可以进行数据传输了；

- 建立连接时的数据包是没有实际内容的，没有应用层的数据

![avatar](./assets/tcp_close.jpg)

> 服务端会根据自身情况，没有要处理的数据时会把第二次和第三次挥手合并成一次挥手，此时标志位 FIN=1 / ACK=1；

> `MSL`是 `Maximum Segment Lifetime` 缩写，`指数据包在网络中最大生存时间`，RFC 建议是 2分钟；

- 客户端、服务端都可以主动发起断开连接；

- 第一次挥手，客户端向服务端发送含 FIN=1 标志位的数据包，随机序列号 seq=m，此时客户端状态由 ESTABLISHED 变为 FIN_WAIT_1；

- 第二次挥手，服务端收到含 FIN=1 标志位的数据包，就知道客户端要断开连接，服务端会向客户端发送含 ACK=1 标志位的应答数据包，确认序列号 ack=m+1，此时服务端状态由 ESTABLISHED 变为 CLOSE_WAIT；

- 客户端收到含 ACK=1 标志位的应答数据包，知道服务端的可以断开的意思，此时客户端状态由 `FIN_WAIT_1 变为 FIN_WAIT_2`；（第一、二次挥手也只是双方交换一下意见而已）

- 第三次挥手，`服务端处理完剩下的数据后再次向客户端发送含 FIN=1 标志位的数据包`，随机序列号 seq=n，`告诉客户端现在可以真正的断开连接`了，此时服务端状态由 CLOSE_WAIT 变为 `LAST_ACK`；

- 第四次挥手，客户端收到服务端再次发送的含 FIN=1 标志位的数据包，就知道服务端处理好了可以断开连接了，但是`客户端为了慎重起见，不会立马关闭连接，而是改状态`，且向服务端发送含 ACK=1 标志位的应答数据包，确认序列号 ack=n+1，此时客户端状态由 FIN_WAIT_2 变为 `TIME_WAIT`；

- `等待 2 个MSL时间还是未收到服务端发过来的数据，则表明服务端已经关闭连接了，客户端也会关闭连接释放资源`，此时客户端状态由 TIME_WAIT 变为 CLOSED；

> `SYN 洪水攻击（SYN Flood）`：是一种 DoS攻击（拒绝服务攻击），大概`原理是伪造大量的TCP请求，服务端收到大量的第一次握手的数据包，且都会发第二次握手数据包去回应，但是因为 IP 是伪造的，一直都不会有第三次握手数据包，导致服务端存在大量的半连接`，即 SYN_RCVD 状态的连接，导致半连接队列被塞满，且服务端默认会发 5 个第二次握手数据包，耗费大量 CPU 和内存资源，使得正常的连接请求进不来；



##### 为什么要“三次握手，四次挥手”
> 客户端和服务端通信前要进行连接，三次握手的作用就是`双方都能明确自己和对方的收、发能力是正常的`。

##### 为什么建立连接是三次握手，而关闭连接却是四次挥手呢？
> 这是因为服务端在LISTEN状态下，收到建立连接请求的SYN报文后，把ACK和SYN放在一个报文里发送给客户端。而关闭连接时，当收到对方的FIN报文时，仅仅表示对方不再发送数据了但是还能接收数据，`己方是否现在关闭发送数据通道，需要上层应用来决定，因此，己方ACK和FIN一般都会分开发送`。


#### HTTPS

一般http中存在以下问题：
- 窃听风险：请求信息`明文传输`，容易被窃取；（加密）
- 篡改风险：`数据完整性`未校验，容易被篡改；（校验）
- 冒充风险：没有`验证对方身份`，存在冒充危险；（身份认证）

参考：[十分钟搞懂HTTP和HTTPS协议？](https://zhuanlan.zhihu.com/p/72616216)
[HTTPS为什么安全 &分析 HTTPS 连接建立全过程](https://wetest.qq.com/labs/110)

HTTPS(HyperText Transfer Protocol Secure)，是以安全为目标的HTTP通道，是在HTTP的基础上通过`传输加密`和`身份认证`保证了传输过程的安全性，可以理解为是`HTTP + SSL/TLS`

##### https通信过程
使用无SSL/TLS的HTTP协议进行通信时，消息相当于在裸奔，存在被窃取或者篡改的可能性；`SSL/TLS`的提出就是为了解决http通信的安全问题；

> SSL（Secure Socket Layer）即安全套接层，最早由Netscape提出，主要用于数据安全问题，后期逐渐演化为一种标准；TLS（Transport Layer Security）即传输层安全协议，是SSL的继任者，主要的功能包括：`数据加密`、`身份认证`、`消息完备性校验`；是位于传输层和应用层之间的一种协议；

参考阮一峰文章，SSL/TLS的握手过程大概如下：
1. Client发送SSL/TLS`协议的版本号`、一个Client生成的`随机数`及`客户端支持的加密算法`；
    ![avatar](./assets/https_client_hello.jpg)
2. Server确认`SSL/TLS`协议版本（如果浏览器不支持，则关闭加密通信），确认通信的`加密算法`，然后返回一个`Server生成的随机数`及`服务器的数字证书`；
    ![avatar](./assets/https_server_hello.jpg)
3. Client校验数字证书有效性，并`从数字证书中取出服务器公钥`，然后发送一个由数字证书公钥加密的随机数到Server；
    ![avatar](./assets/https_client_key_exchange.jpg)
    - `Client Key Exchange`：基于前面提到的两个随机数（client random+server random），再生成第 3 个随机数 pre-master，然后通过CA证书中的公钥，对 pre-master 加密，得到 pre-master key，发送给服务器；
    - `Change Cipher Spec`：加密通信算法改变通知，表示客户端随后的信息都将用会话秘钥加密通信；
    - `Encrypted handshake message`：这一步对应的是 Cleint 的 Finish 消息，client 将前面握手的消息生成摘要，再用协商好的会话秘钥进行加密，这是客户端发出的第一条加密消息， 服务端接收后会用会话秘钥解密，能解出来说明前面协商的秘钥是一致的，至此客户端的握手完成 
4. Server使用数字证书私钥解密该随机数；
5. 此时，Client和Server都拥有三个相同的随机数；双方按照之前约定的加密算法， `使用这三个随机数生成对话密匙，用于加密后续的数据通信过程`；

> 三个随机数是为了保证对称密匙的可靠性

加密分为`对称加密`和`非对称加密`，对称加密使用同样的秘钥进行加密和解密，非对称加密使用一对秘钥——公钥和私钥，使用其中一个加密，另一个解密；`非对称加密更加安全`，但由于算法复杂度等因素导致其性能开销较大；`对称加密传输速度快`，但是存在一定的安全风险；

> 为了在性能和安全性方面make a trade off，`通常会在对话密匙生成阶段使用非对称加密，在数据传输时使用对话密钥进行对称加密`；

![avatar](./assets/https.jpg)


##### 证书认证过程

https通信过程中服务器为什么不直接把公钥给客户端呢，因为可能会被中间人劫持，通信的可靠性无法保障；

如果通信过程中，在三次握手或者客户端发起HTTP请求过程中，客户端的请求被中间人劫持，那么中间人就可以伪装成“假冒客户端”和服务器通信；中间人又可以伪装成“假冒服务器”和客户端通信。接下来，我们详细阐述中间人获取对称密钥的过程：

中间人在收到服务器发送给客户端的公钥（这里是“正确的公钥”）后，并没有发给客户端，而是中间人将自己的公钥（这里中间人也会有一对公钥和私钥，这里称呼为“伪造公钥”）发给客户端。之后，客户端把对称密钥用这个“伪造公钥”加密后，发送过程中经过了中间人，中间人就可以用自己的私钥解密数据并拿到对称密钥，此时中间人再把对称密钥用“正确的公钥”加密发回给服务器。此时，客户端、中间人、服务器都拥有了一样的对称密钥，后续客户端和服务器的所有加密数据，中间人都可以通过对称密钥解密出来。

![avatar](./assets/https_man_in_the_middle_attacks.webp)


前面提到，`Client`与`Server`间的内容传输采用的是对称加密的方式，使用的是由三个随机数加密生成的密匙；Client向Server发送的第二个随机数是由数字证书公钥加密的；`为了保证数据通信的可靠性，必须要对证书进行认证`；

服务器返回的`站点证书`一般包含了证书的`有效期`、`服务器名称`、`服务器公钥`、`发证机构名称`及`发证机构对证书的签名`、`数字摘要计算方法`以及`证书对应的域名`；发证机构会对证书信息hash得到证书的数字摘要，然后使用发证机构的私钥加密证书摘要；客户端拿到证书后，可以使用`CA的私钥`进行解密得到证书的信息摘要；同时使用数字摘要的方法对证书信息进行计算同样得到一份信息摘要；如果两者一致，则表示证书未被篡改；

一般可以通过`发证机构来保证服务器站点的可靠性`，而服务器站点的可靠性则通过上一级的中间证书商进行认证；这样逐级回溯，最终可以追溯到`根证书机构`；而`根证书机构一般是固定的，并且是被浏览器识别的`，是可信的；因此`证书认证是通过证书信任链确保服务器站点的可靠性`；

> 证书颁发者一般提供两种方式来验证证书的有效性： CRL 和 OCSP

其中`CRL`（Certificate Revocation List）即证书吊销名单，表示发证机构维护的一份失效证书名单，客户端缓存在本地并定期更新，并作为证书有效性查询参考；

`OCSP`（Online Certificate Status Protocol）即在线证书状态协议，是由发证机构提供的一份实时查询某个证书有效性的接口，延时较大；

![avatar](./assets/https_certificate.png)

![avatar](./assets/https_defies_attck.webp.crdownload)

![avatar](./assets/https_encryption.webp)


#### HTTP版本介绍
HTTP(Hyper Text Transfer Protocol)即超文本传输协议，是一种用于客户端与服务端进行信息交换的通信协议，特点为：
- 简单
- 无状态：http本身是无状态协议，通过Http Cookie实现了有状态的会话
- 连接：一般基于TCP连接，请求默认端口号是80（HTTPS默认端口号是443）

##### HTTP/0.9 —— 单行协议

已弃用，具体可以参考W3C网站的介绍[HTTP/0.9](https://www.w3.org/Protocols/HTTP/AsImplemented.html)

特点：
- 请求不包括版本号信息，仅支持`get`请求
- 协议由单行指令构成：`GET /index.html`
- 响应无Header及状态码，仅包括HTML文档本身


##### HTTP/1.0 —— 构建可扩展性
特点：
- 协议版本随GET行发送
- 支持更多的请求方法：GET、HEAD、POST
- 引入HTTP头，请求或响应由多行指令构成；包括：Allow/ Authorization/content-type/content-coding/content-length/Date/Expires/From/If-modified-Since/Last-Modified/Location/Pragma/Referer/Server/User-Agent/WWW-Authenticate等
- 支持更多的资源类型：html、图片、音视频等；
- 引入状态码

缺点：
- 默认不提供keepalive，需要显式声明
- 不支持连接复用：HTTP请求基于TCP连接，HTTP/1.0协议中每次请求均需要建立TCP连接，不可复用；
- 安全性：是一种无状态协议，身份认证需要通过HTTP Cookie，明文传输数据，因此具有被攻击的危险；
- 协议开销大：头部信息过大后，每次请求都会携带这些信息；不仅造成带宽浪费，也会增加服务延时；
- 请求为blocking，即下一个请求的发送必须在收到前一个请求包的响应包后；这些问题造成的一个显著后果是请求延迟大，网络带宽资源不能被充分利用。


##### HTTP/1.1 —— 标准化协议
特点：

- 长连接：`HTTP/1.1默认采用长连接`，即同域名下建立一个TCP连接用于多次通信和数据传输；可以通过`Connection: keep-alive`字段进行指定；是否为长连接可以打开调试控制台查看`connection id`是否一致；
- 管道化：持久化连接中，可以不用等一个请求被响应后再发送请求，可以连续发送多个请求；当然，服务端的响应顺序是与请求顺序保持一致的；
- 分块传输编码：支持`Chunked Transfer Coding`，对响应数据进行分块传输，每个`chunk`包含其大小及数据（均为十六进制），size信息独占一行；可以用于动态处理内容的传输；使用头部`Transfer-Encoding: chunked`标识；最后一个chunk仅包含size信息，用于告知数据传输完成；
- 引入新的缓存机制：`Cache-Control`机制；
- 内容协商机制：客户端与服务端约定请求的方法、语言、编码类型等信息；使用`Accept`/`Accept-Language`/`Accept-Encoding`等；
- 更加丰富的请求方法：`OPTIONS`/`GET`/`HEAD`/`POST`/`PUT`/`DELETE`/`TRACE`/`CONNECT`；
- 新增状态码

HTTP/1.1是目前应用最广泛的版本。引入管道机制一定程度上解决了1.0中请求的blocking问题，但是仍然可能造成队头阻塞，因为服务端的响应是按照请求顺序的；


##### HTTP/2 —— quicker、better、faster
> HTTP/2主要基于SPDY协议，SPDY协议是由google开发的一个应用层协议，可以说SPDY协议是HTTP/2的前身。HTTP/2强制使用TLS协议，也就是说HTTP/2发送的都是加密的数据，关于强制使用TLS协议这一点引起了很多争议，因为有些HTTP服务没必要加密，且TLS会引入一定的开销，特别是TLS握手阶段的非对称加密。

特点
- `头部压缩`：使用`HPACK`算法，减少每次传输不必要的头部信息；它的实质就是一种diff算法；客户端和服务端同时维护一张保存头信息的表，并在每次通信后同步更新；首次请求会保存全部字段；之后只需要传输差别信息即可；
![avatar](./assets/header_pack.png)
- `二进制分帧`：HTTP/2.0的每个请求或响应称为消息，每个消息分为一个或多个帧，`采用效率更高的二进制而不是文本格式进行编码传输`；
- `多路复用`：同域名下建立一个TCP连接，该连接可以用于多个请求的处理；与管道化不同的是每个请求可以单独处理，不会造成HTTP/1.1中的队头阻塞
- `Server Push`：即客户端请求一个页面后，服务端在未接受到后续请求时就返回响应请求，以及通过页面解析发现的客户端后续可能用到的资源，如图片、css、js等；
![avatar](./assets/http2_sever_push.png)

##### HTTP/3

http/3.0以`UDP`而不是`TCP`作为传输协议，UDP不提供可靠和流控服务，所以还需要另外另外一个协议——QUIC。QUIC工作在应用层，位于UDP和HTTP之间。

![avatar](./assets/http3_vs_http2.jpg)

HTTP因为不使用TCP，所以解决了TCP的队头阻塞问题，完整得解决了队头阻塞问题。

- HTTP/3不再需要TCP三次握手，相比HTTP/2进一步降低了请求延迟；
- `解决了连接迁移问题`：以前使用TCP作为传输层协议时，移动网络从4G切换到wifi，因为涉及到IP改变，所以需要重新建立连接，而HTTP/3使用CID（connection id）来标识一条流，改变IP并不会造成影响。

### 预加载
在preload和prefetch之前，我们一般根据编码需求通过link或者script标签引入页面渲染和交互所依赖的js和css等；然后这些资源由浏览器决定优先级进行加载、解析、渲染等。

> preload和prefetch的出现为我们提供了可以更加细粒度地控制浏览器加载资源的方法。

> Chrome有四种缓存：http cache、memory cache、Service Worker cache和Push
cache。在`preload或prefetch的资源加载时，两者均存储在http
cache`。当资源加载完成后，如果资源是可以被缓存的，那么其被存储在http
cache中等待后续使用；`如果资源不可被缓存，那么其在被使用前均存储在memory cache`；

#### preload
link标签的preload是一种声明式的资源获取请求方式，用于提前加载一些需要的依赖，并且`不会影响页面的onload`事件；使用方式如下：
```html
<link rel="preload" as="script" href="test.js" onload="handleOnload()" onerror="handlepreloadError()">
<link rel="preload" as="style" href="test.css" onload="this.rel=stylesheet"> // css加载后立即生效
```

其中，`rel`属性值为preload；`as`属性用于规定资源的类型，并根`据资源类型设置Accep请求头`，以便能够使用正常的策略去请求对应的资源；`href`为资源请求地址；`onload`和`onerror`则分别是资源加载成功和失败后的回调函数；

其中as的值可以取`style、script、image、font、fetch、document、audio、video`等；

> 如果as属性被省略，那么该请求将会当做异步请求处理

另外，在`请求跨域资源时推荐加上crossorigin属性`，否则可能会导致资源的二次加载（尤其是font资源）；
```html
<link rel="preload" as="font" href="www.font.com" crossorigin="anonymous">
<link rel="preload" as="font" href="www.font.com" crossorigin="use-credentials">
```

##### preload特点
- preload加载的资源是在浏览器渲染机制之前进行处理的，并且不会阻塞onload事件；
- preload可以支持加载多种类型的资源，并且可以加载跨域资源；
- `preload加载的js脚本其加载和执行的过程是分离`的。即preload会预加载相应的脚本代码，待到需要时自行调用；


#### prefetch
prefetch是一种`利用浏览器的空闲时间加载页面将来可能用到的资源`的一种机制；通常`可以用于加载非首页的其他页面所需要的资源`，以便加快后续页面的首屏速度；

##### prefetch特点
prefetch加载的资源`可以获取非当前页面所需要的资源`，并且将其放入缓存至少5分钟（`无论资源是否可以缓存`）；并且，当页面跳转时，未完成的prefetch请求不会被中断；

##### 属性支持度检测
```js
const preloadSupported = () => {
    const link = document.createElement('link');
    const relList = link.relList;
    if (!relList || relList.supports)
        return false;
    return relList.supports('preload');
}
```


### 预渲染

> With prerendering, the content is prefetched and then rendered in the background by the browser as if the content had been rendered into an invisible separate tab. When the user navigates to the prerendered content, the current content is replaced by the prerendered content instantly.

使用预渲染时，对应资源会被`prefetch`，然后在浏览器后台进行渲染。当用户浏览到预渲染的内容时，当前内容就会被预渲染内容立即代替。可以使用以下代码开启预渲染

```js
<link rel="prerender" href="http://example.com" />
```

预渲染虽然可以提高页面的加载速度，但是要确保该页面百分百会被用户在之后打开，否则就白白浪费资源去渲染



### 缓存
缓存对于前端性能优化来说是个很重要的点，良好的缓存策略可以降低资源的重复加载提高网页的整体加载速度。



#### Pragma
Pragma是`HTTP1.0`中定义的通用首部字段，与HTTP1.0中的`Expires`标头共同决定HTTP1.0中的缓存策略；`Pragma: no-cache`作用与`Cache-Control: no-cache`作用一致；`现在通常用与对HTTP1.0客户端的兼容`；


#### Expires
Expires是HTTP1.0及HTTP1.1都有的`响应头部字段`，表`示启用缓存并设置资源过期的时间点，包含日期、时间`；设置过去的时间则表示资源过期；同时设置Pragma和Expires则不缓存；这里需要注意的是服务器时间和本地时间的统一问题，否则可能导致合法的资源被当做过期处理，在项目中已采坑。。

```js
// 示例
Expires: Wed, 21 Oct 2015 07:28:00 GMT
```

> 如果响应头部中包含Cache-Control：max-age或Cache-Control：s-max-age字段，则Expires字段会被忽略；


```
Response Headers
access-control-allow-origin: *
cache-control: max-age=604800
content-encoding: gzip
content-md5: JZeM8QtTaNUNZtAn96xplQ==
content-type: text/css; charset=utf-8
date: Thu, 01 Sep 2022 13:16:39 GMT
expires: Tue, 26 Jul 2022 20:33:04 GMT
last-modified: Mon, 27 Aug 2018 07:13:39 GMT
server: AliyunOSS
vary: Accept-Encoding
x-oss-hash-crc64ecma: 14495222281733060606
x-oss-object-type: Normal
x-oss-request-id: 624326AF1567603531317BBA
x-oss-server-time: 18
x-oss-storage-class: Standard
x-ser: BC202_dx-lt-yd-jiangsu-taizhou-4-cache-11, BC9_yd-shan3xi-shangluo-2-cache-1

Request Headers
:authority: csdnimg.cn
:method: GET
:path: /public/sandalstrap/1.4/css/sandalstrap.min.css
:scheme: https
accept: text/css,*/*;q=0.1
accept-encoding: gzip, deflate, br
accept-language: zh-CN,zh;q=0.9
cache-control: no-cache
pragma: no-cache
referer: https://blog.csdn.net/luofeng457/article/details/90373977?ops_request_misc=%257B%2522request%255Fid%2522%253A%2522166203531816781667812271%2522%252C%2522scm%2522%253A%252220140713.130102334.pc%255Fblog.%2522%257D&request_id=166203531816781667812271&biz_id=0&utm_medium=distribute.pc_search_result.none-task-blog-2~blog~first_rank_ecpm_v1~rank_v31_ecpm-1-90373977-null-null.nonecase&utm_term=%E5%8D%8F%E5%95%86%E7%BC%93%E5%AD%98&spm=1018.2226.3001.4450
sec-ch-ua: ".Not/A)Brand";v="99", "Google Chrome";v="103", "Chromium";v="103"
sec-ch-ua-mobile: ?0
sec-ch-ua-platform: "Windows"
sec-fetch-dest: style
sec-fetch-mode: no-cors
sec-fetch-site: cross-site
user-agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.0.0 Safari/537.36
```
#### Cache-Control
`Cache-Control是HTTP1.1中引入的一种通用头部字段，可以用于请求和响应头部`；现代浏览器都支持Cache-Control，主要`用于替代HTTP1.0中定义的一些相应缓存标头，如Expires、Pragma`等；客户端和服务端的请求头有一些差异：

|指令|客户端|服务端|
|-|-|-|
|no-cache|√|√|
|no-store|√|√|
|max-age=<seconds>|√|√|
|no-transform|√|√|
|public|×|√|
|private|×|√|
|max-stale|√|×|
|only-if-cached|√|×|
|must-revalidate|×|√|
|proxy-revalidate|×|√|
|s-maxage=<seconds>|×|√|


`max-age: <seconds>`：从请求时间开始计算的缓存存储的最大有效时长，单位为秒；超过则为过期；

`max-stale[=<seconds>]`：客户端标头，表示客户端可以接受一个过期资源；如果设置了可选的时间参数，则表示过期时间不超过该时长；

`must-revalidate`：服务端标头，使用缓存前需要验证旧资源的状态，过期资源不可用；

##### demo
```js
// 禁止缓存
Cache-Control: no-store

// 缓存静态文件
Cache-Control: public, max-age=31536000

// 需要重新验证
Cache-Control: no-cache // 或
Cache-Control: max-age=0, must-revalidate

// 对于频繁变动的资源，可以使用 Cache-Control: no-cache 并配合 ETag 使用，表示该资源已被缓存，但是每次都会发送请求询问资源是否更新。

```

##### `no-cache`和`no-store`：
`no-store`禁止浏览器及所有的中间件（代理服务器等）缓存任何版本的响应信息，`即我们通常所说的不缓存`，每次请求都需要向服务器发送完整地请求并下载相应的响应；

`no-cache不直接使用缓存，需要先在与服务器确认返回的响应是否发生变化`。即如果存在ETag（如ETag: af47a1d）等验证令牌时，会发送请求（请求带着If-None-Match: af47a1d标头）到服务器检验之前的缓存内容和当前版本有无变化，如果无变化则返回响应状态码304，否则重新请求并下载资源；(`协商缓存验证`)

##### public与private
- `private`：响应仅对单个用户进行缓存，也就是说对于代理服务器、CDN等中间缓存机构不进行缓存；
- `public`：非必须项，表示响应在多数情况下均可以被缓存（包括CDN、代理服务器等）；


下图是MDN推荐的最佳Cache-Control策略：
![avatar](./assets/cache-control.png)




#### 强制缓存与协商缓存

通常浏览器缓存策略分为两种：`强缓存`和`协商缓存`

- 强缓存: 由`expires`与`cache-control: max-age`控制；表示在缓存有效期内不需要重新请求服务端资源，返回的状态码为200

- 协商缓存：由`ETags`与`If-No-Match`、`Last-Modified`与`If-Modified-Since`控制；在`缓存过期时，会用到协商缓存`；协商缓存需要向浏览器发送请求，以确认当前过期的资源是否发生过更新，如果没有更新，即缓存有效则返回304；否则重新获取资源；


#### 缓存校验机制

如果由于服务器时间精度问题；或者如果设置的缓存时间已经过期，并且服务端资源并未发生更新，仅使用max-age等类似的缓存过期判断策略，会重新下载整个并未发生变化的资源，这会造成带宽浪费与服务器负载压力；

##### Last-Modified与If-Modified-Since

1. `Last-Modified`：响应头部字段；表示服务器端资源上次修改的日期和时间，通常与请求字段If-Modified-Since搭配使用；其`精度低于ETag，故常作为备用机制`；

    ```js
    // 用法
    Last-Modified: <day-name>, <day> <month> <year> <hour>:<minute>:<second> GMT

    // 示例
    Last-Modified: Wed, 20 May 2019 11:11:11 GMT
    ```

2. `If-Modified-Since`：请求字段（GET/HEAD方式），如果请求的资源在给定时间后未被修改，那么返回一个不带响应主体的304响应；否则是一个200的请求；同样，`如果同时设置了If-None-Match，If-Modified-Since也会被忽略`；

    ```js
    // 示例
    If-Modified-Since: Wed, 20 May 2019 11:11:11 GMT
    ```


##### ETag与If-None-Match

Last-Modified的精度与服务器的时间精度有关，无法识别一秒内进行多次修改的情况，也就是说资源的修改时间有可能存在一定偏差，而ETag可以精确标识资源的改动；另外，如果资源修改而其内容未发生变化（修改后再恢复）的情况下还是会重新加载资源；

`ETag相当于资源的摘要，值是一段ASCII码组成的字符串，仅在其内容发生变化时对应的ETag值才会改变`；这样就可以避免Last-Modified中资源被修改而内容未发生变化的状况了；`ETag的生成方式不唯一`；

服务器响应资源请求时，可以在响应头部加上ETag指令，如ETag: "33a64df551425fcc55e4d42a148795d9f25f89d4"，客户端可以选择是否缓存该资源及标识并且在下次请求该资源时在请求头中加入一个If-None-Match: "33a64df551425fcc55e4d42a148795d9f25f89d4"的头部字段；服务器将当前版本的ETag与客户端的ETag字段值进行比较，如果两者保持一致则表示资源未被更改，返回304；

需要注意的是，上边已经提到了ETag生成的方式不唯一，可以通过hash散列或者其他算法获得；因此在使用CDN或者其他分布式服务器系统时，需要保障ETag的唯一性，从而避免不必要的资源请求；当然，计算ETag对服务器性能也有一定的影响；

`W/为可选参数，用于标识是否为弱校验`；ETag支持强校验和弱校验：`强校验需要资源每个字节都对应相同，包括Content-Type、Content-Encoding`等；弱校验仅需二者在语义上相同，即可以使用不同的Content-Type值等，尤其是在动态生成内容上弱校验更能发挥作用；

```js
// 示例
ETag: "33a64df551425fcc55e4d42a148795d9f25f89d4"
ETag: W/"0815"

If-None-Match: "33a64df551425fcc55e4d42a148795d9f25f89d4"
```

#### F5与Ctrl+F5

`Ctrl+F5`：会强制不用所有缓存并全部向服务器发送新的请求，请求头中移除了If-Modified-Since及If-none-Match标头，并且加入Cache-Control: no-cache及Pragma: no-cache；

`F5`：F5则会加入请求头If-Modified-Since、If-none-Match及Cache-Control: max-age=0请求头以有效使用缓存；

![avatar](./assets/cache-control-pyramid.png)

结合上图，为了更高效地利用HTTP缓存，应当尽量为可缓存资源设置Expires/Cache-Control及ETag/Last-Modified标头，这样可以能减少304请求造成的性能开销，同时能在资源更新的时候尽可能早的获取新版本的资源，从而使用户体验更好；现在，使用webpack构建项目时，通常会将静态资源的文件名后缀加上md5等，这样可以在资源有新版本时直接更新资源，减少304的开销；









## 优化渲染过程

## 文件优化

## 其他
















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
10. [跨域请求小结](https://blog.csdn.net/luofeng457/article/details/90478106)
11. [关于 async 函数的理解](https://juejin.cn/post/6844903735290757133)
12. [Service Worker简介](https://blog.csdn.net/luofeng457/article/details/102847261)
13. [HTTP各版本简介](https://blog.csdn.net/luofeng457/article/details/102858302)
14. [An overview of HTTP](https://developer.mozilla.org/en-US/docs/Web/HTTP/Overview)
15. [TCP 连接详解](https://zhuanlan.zhihu.com/p/406247432)
16. [十分钟搞懂HTTP和HTTPS协议？](https://zhuanlan.zhihu.com/p/72616216)
17. [HTTPS为什么安全 &分析 HTTPS 连接建立全过程](https://wetest.qq.com/labs/110)




