## UI归一化工具包
### 定义及实现

是一种`三端同构`、`支持原生渲染`的UI工具包，通过模拟html元素与css模块化方式，底层通过封装的UI组件实现在`Android`和`IOS`端的UI统一（分别映射`Android View`和`IOS UIView`），默认使用`flex`布局；定义了一系列生命周期相关的事件与bundle加载的事件；

开发完成后构建为bundle，然后上传到LDS（发布系统），客户端加载时通过`数据+模板服务端直出`的方式布局和渲染输出；C端同时下发`bundle`与业务数据，通过`Leo key`配置请求对应的`bundle`，LDS相当于一个node服务，同时会在服务端请求业务后端数据；


###