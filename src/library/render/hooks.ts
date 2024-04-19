const checkScope = () => {
  // ? 检查是否在作用域内, 需要在原型链上查找对应属性
  // if (not in scope) {
  //   throw new Error("需要在 react 对象内调用钩子");
  // }
};

/** 创建发射器, 在发生变更时, 推送patch */
const createEmiter = () => {
  return () => {};
};

/** 创建深拷贝代理 */
const createDeepProxy = <T extends Object>(obj: T, proxy: ProxyHandler<T>) => {
  // TODO 这里省略
};

/** 挂载时触发的狗子 */
export const useMount = () => {

};

/** 响应性
 * 
 * ahooks的好像是
 */
export const useReactive = <S extends { [key: string]: any }>(state: S): S => {
  // 1. 检查作用域
  checkScope();
  // 2. 创建发射器
  const emiter = createEmiter();
  // 2. 创建深层代理
  const proxyObj = createDeepProxy(state, {
    set(t, p, v, r) {
      // > 更新对象用的值
       
      // > 创建一个patch
      return Reflect.set(t, p, v, r);
    },
  });

  return state;
};

/** 引用 */
export const useRef = (o: any) => {
    // > 这个要从原型链查找.
};

/** 计算属性 */
export const useComputed = (calc: () => any) => {};

/** 监听变化 */
export const useWatch = () => {};

/** 执行重新渲染 */
export const useUpdate = () => {};
