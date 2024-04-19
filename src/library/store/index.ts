import _ from "lodash";
import { useReactive } from "../render";

export interface IPlugin<S> {
  name: string;
  lifecycle?: {
    /** 初始化时触发 */
    init?(initialState: S, store: { state: S }): void;
    /** 状态变更时触发 */
    update?(state: S): void;
  };
}

export interface ICreateStoreOptions<S extends Object, A> {
  /** 具备响应式的属性 */
  state: () => S;
  /**
   * actions
   */
  actions?: A &
    ThisType<A & S & { $set: (newState: Partial<S>) => void; $get(): S }>;
}

export const createStore = <S extends { [key: string]: any }, A>(
  options: ICreateStoreOptions<S, A>
) => {
  const plugins: Array<IPlugin<S>> = [];

  let inited: boolean = false;
  const onInit = (initialState: S, store: { state: any }) => {
    if (inited) return true;
    inited = true;
    for (const plug of plugins) {
      plug.lifecycle ??= {};
      plug.lifecycle.init?.(initialState, store);
    }
  };
  // @ 初始对象
  const initialState = options.state();

  /** 创建的 store 对象 */
  const store = (): S & ICreateStoreOptions<S, A>["actions"] => {
    // ? 通过 响应性钩子, 将state转变为响应式对象. (这个就是使用hooks方法调用可能出现错误的问题点, 因为这个响应式钩子依赖react的作用域, 在作用域外调用获取不到对象肯定要报错了, 不过一般这里会有一个前置的检查操作)
    const reactived: S = useReactive(initialState);
    // > 封装一个对外操作的store对象
    const merged = {
      // 不具备响应式特性的 actions
      ...options.actions,
      $set(newState: S): void | Promise<void> {
        // > 合并对象, 依赖响应式特性触发更新. react 应该没有额外的启发式更新操作吧~
        _.merge(reactived, newState);
      },
      $get(): S {
        return reactived;
      },
    };
    // > 触发初始化事件 (仅触发一次)
    onInit(initialState, { state: reactived });
    // > 合并响应式的state
    Object.assign(merged, reactived);
    // > 一般来说, zustand 和 pinia 采用的是这种, 但是pinia会对actions做个Proxy, 避免修改(猜的, 没实践过..)
    return merged as any;
    // > 注释的这个
    // return new Proxy(merged, {
    //   get(t, p, r) {
    //     return Reflect.get(t, p, r);
    //   },
    //   // > 直接拒绝外部修改响应式
    //   set(t, p, v, r) {
    //     // skip
    //     return false;
    //   },
    // });
  };

  store.plugin = (plug: IPlugin<S>) => {
    if (plugins.some((p) => p.name === plug.name)) {
      return;
    }
    // > add plugin
    plugins.push(plug);
    return store;
  };

  return store;
};

const useUserStore = createStore({
  state: () => {
    return {
      a: 1,
      b: {
        c: 2,
      },
    };
  },
  // Tips: 没有搞 getter, 略麻烦, 还要补充更详细逻辑, 做示例说明没必要搞太复杂
  actions: {
    get c(): number {
      return this.a;
    },
    // >
    d() {
      this.$set({});
    },
  },
});

useUserStore().d;
