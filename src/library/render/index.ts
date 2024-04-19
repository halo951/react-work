/**
 * 渲染管道顺序的核心逻辑:
 *  还没看, 但从效果上看是自上而下的渲染过程, 大概流程如下
 *  1. 判断当前节点为 react 组件节点还是html节点
 *  2. 渲染
 *  2.1 如果为react节点, 进创建 child 并挂载到当前节点的children数组下,
 *  2.2 如果html节点, 检查 el 是否在当前vdom.el的子节点存在, 不存在则渲染, 否则忽略 (这也就是)
 *  3. 递归向下查找react节点, 重复步骤2的渲染操作.
 * 响应式
 *  1. react-dom 不具备响应式特性, 只是个渲染器
 *  2. 理论上, 应该是在react中集成了一套响应式行为依赖收集机制. 从hooks的角度出发, 就是逐级递归找到react的根节点, 添加一个emit, 当发生变更时 (react都是setState, vue的话是ProxyHandler.set 补货)
 *     向根节点发送一个update事件, 然后暂存变更. 并创建一个下一时间片刷新渲染的任务
 *  3. 在下时间片渲染以达到响应式特性.
 * hooks 实现逻辑
 *  1. 在 组件内调用钩子时, 通过原型链, 找到hooksd的寄存器, 将handler添加进去
 *  2. 钩子内操作vdom的原始对象, 通过洋葱圈包裹方式, 注入自己的生命周期事件
 *  3. 渲染时, 触发对应的生命周期事件渲染
 */
export const createRender = (vnode: React.ReactElement) => {
  // > 将 react 节点树转化为node对象
  const node = createNode(vnode);
  // vnode.props
  return {
    // > 挂载, 并触发渲染
    mount: (el: HTMLElement) => {
      // > 将绑定的组件渲染到这个节点内
      // > deep render
      deepRender(node, el);
    },
  };
};

const createNode = (vnode: React.ReactElement) => {
  const node = {
    // > 监听的需要具备
    state: {},
    // ? 绑定的钩子
    hooks: {
      state: [],
      mount: [],
      // 调用钩子时, 将钩子handler传进来, 然后在触发时机链式触发 ...
    },
    // > 创建dom节点
    el: document.createElement(vnode.type as string),
    // > 当前节点的子节点
    children: [],
  };
  return node;
};

const deepRender = (node: any, parent: HTMLElement) => {
  // TODO
};
