import { IPlugin } from "..";

export interface IPersistOptions<S, U extends S> {
  /** 在 storage 中保存的名称 */
  name: string;
  /** 可选版本号 */
  version?: string;
  /** 持久化存储空间 */
  storage?: Storage;
  /** 那些字段需要进行持久化 */
  includes?: Array<string> | ((state: S) => U);
  /** 序列化方法 */
  stringify?(o: { version?: string; state: U }): string;
  /** 反序列化方法 */
  parse?(str: string): { version?: string; state: U };
}

/** 持久化插件 */
export const persist = <S extends Object, U extends S>(
  options: IPersistOptions<S, U>
): IPlugin<S> => {
  options = {
    storage: sessionStorage,
    includes: [],
    stringify(o: { version?: string; state: U }): string {
      return JSON.stringify(o);
    },
    parse: (str: string): { version?: string; state: U } => {
      return JSON.parse(str);
    },
    ...options,
  };
  return {
    name: "store-plugin:persist",
    lifecycle: {
      init(initialState: S, store: { state: S }) {
        const str = options.storage!.getItem(options.name) ?? "{}";
        const { version, state } = options.parse!(str);
        // ? check version
        if (version !== options.version) {
          return;
        }
        // > merge
        const merged = _.merge(initialState, state);
        // > update
        store.state = merged;
      },
      /** 每次更新后, 触发持久化操作 */
      update(state: S) {
        const { name, version } = options;
        const persisted: { version?: string; state: U } = {
          version,
          state: {} as U,
        };
        // > filter
        if (options.includes instanceof Array) {
          persisted.state = Object.fromEntries(
            Object.entries(state as Object).filter(([key]) => {
              return (options.includes! as Array<string>).includes(key);
            })
          ) as U;
        } else if (typeof options.includes === "function") {
          persisted.state = options.includes(state);
        }
        // stringify
        const str = options.stringify!(persisted);
        // save
        options.storage!.setItem(name, str);
      },
    },
  };
};
