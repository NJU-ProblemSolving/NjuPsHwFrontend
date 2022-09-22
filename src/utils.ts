import { ref, Ref, watch } from "vue"

// eslint-disable-next-line
export const debounce = (func: (...params: any[]) => void, delay = 500) => {
    let timer: number | null = null
    // eslint-disable-next-line
    return (...params: any[]) => {
        timer && window.clearTimeout(timer)
        timer = window.setTimeout(() => {
            func(...params)
            timer = null
        }, delay)
    }
}

export function zeroPadding (x: number, length: number) : string {
  const res = x.toString();
  const diff = length - res.length;
  if (diff > 0)
    return "0".repeat(diff) + res;
  return res;
}

export function getUrlParam(param: string): string | undefined {
    const dict = location.search.substring(1).split('&').map(x => x.split('=', 2))
    const res = dict.find(kv => kv[0] === param)
    return res ? res[1] : undefined
}

const refOfVariables = new Map()
export function localStorageVariable(name: string, defaultValue: string): Ref<string> {
    if (refOfVariables.has(name)) return refOfVariables.get(name)
    const res = ref(localStorage.getItem(name) ?? defaultValue)
    watch(res, (value) => value === null ? localStorage.removeItem(name) : localStorage.setItem(name, value))
    refOfVariables.set(name, res)
    return res
}

export function invokeDownload(url: string, filename: string | null = null) {
    const a = document.createElement('a');
    a.href = url;
    if (typeof filename === 'string')
        a.download = filename;
    a.click();
}

export class Lock {
    locked: boolean;
    queue: Array<() => void>;

    constructor() {
        this.locked = false;
        this.queue = [];
    }

    lock(): Promise<void> {
        // eslint-disable-next-line
        return new Promise<void>((res, _) => {
            if (!this.locked) {
                this.locked = true;
                res();
                return;
            }
            this.queue.push(res);
        });
    }

    unlock(): void {
        const next = this.queue.shift();
        if (typeof next !== 'undefined') {
            next();
        } else {
            this.locked = false;
        }
    }
}
