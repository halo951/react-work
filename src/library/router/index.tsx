import { useComputed, useUpdate } from "../render";

export interface IRoute {
  path: string;
  component: React.ReactElement;
  /** 自定义匹配路由方法 (但要注意的是, 只能从上到下匹配) */
  onMatch?: (path: string) => boolean;
  /** 进入组件前触发 */
  onBeforeEnter?: () => void;
}

export interface IRouter {
  /** 路由表 */
  routes: Array<IRoute>;
  /** 绑定的路由组件对象 */
  component: React.ReactElement;
  /** 当前路由 */
  currentRoute: IRoute | undefined;
  /** 销毁路由方法 */
  destory: () => void;
}

declare global {
  interface Window {
    /** 允许多个路由实例存在, 虽然没啥卵用~ */
    __router__: Array<IRouter>;
  }
}

/** 匹配当前路由是哪个组件 */
const match = (routes: Array<IRoute>): IRoute | undefined => {
  const { pathname } = location;
  for (const route of routes) {
    if (pathname.includes(route.path)) {
      return route;
    }
  }
};

export const createRouter = (routes: Array<IRoute>): IRouter => {
  // 1. 创建路由对象
  const router: IRouter = {
    routes,
    /** 路由组件 */
    get component() {
      return {} as any;
    },
    /** 当前路由 */
    get currentRoute() {
      return match(routes);
    },

    /** 销毁路由组件 */
    destory() {
      // 从window上移除对象
      const index = window["__router__"].indexOf(router);
      window["__router__"] = window["__router__"].splice(index, 1);
      // 移除事件监听
      window.removeEventListener("popstate", onPopstate);
    },
  };

  // 2. 绑定到 window
  window["__router__"] ??= [];
  window["__router__"].push(router);

  // history 监听
  const onPopstate = (): void => {
    // > 当路由发生变化时, 直接触发当前组件的强制更新函数, 使其重新计算计算属性.
    useUpdate();
  };

  // 监听history变化
  window.addEventListener("popstate", onPopstate);

  // 默认浏览器关闭时销毁对象
  window.addEventListener("unload", () => {
    router.destory();
  });

  return router;
};

/** 路由组件 */
export const RouterComponent: React.FC<{ router?: IRouter }> = (props) => {
  let router!: IRouter;
  if (props.router) router = props.router;
  else if (window["__router__"]?.length > 0) router = window["__router__"][0];

  if (!router) {
    throw new Error("缺少路由对象");
  }
  /** 通过计算属性获取当前路由 */
  const currentRoute = useComputed(() => {
    return router;
  });
  // > 将当前匹配到的路由渲染出来
  return (
    <>
      {/** TODO */}
      {/* <Component is={currentRoute} /> */}
    </>
  );
};

/**
 * 获取路由实例
 *
 * @description 注意: 这不是正经钩子, 当全局存在多个router实例将报错.
 */
export const useRouter = () => {
  if (!window["__router__"] || window["__router__"].length === 0) {
    throw new Error("未创建路由或路由组件已销毁");
  }
  if (window["__router__"].length > 1) {
    throw new Error("当前存在多个路由组件实例, 请");
  }
  // > 返回挂载到window上的第一个路由实例. (如果按react的说法, 应该遵循原型链向上查找 Provider, 但那种实现方式太麻烦了~)
  return window["__router__"][0];
};

/** 获取当前所在的路由
 *
 * @returns 匹配到返回当前路由, 匹配不到返回undefined
 */
export const useRoute = (): IRoute | undefined => {
  return useRouter().currentRoute;
};

/**
 * 页面跳转
 *
 * @description 这里没搞带参数的, 得另外写处理逻辑, 太麻烦
 */
export const useGo = (path: string): void => {
  history.pushState({}, "", path);
};
