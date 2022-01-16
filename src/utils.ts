import { ref, Ref, watch } from "vue"

export const debounce = (func: Function, delay = 500) => {
    let timer: number | null = null
    return (...params: any) => {
        timer && window.clearTimeout(timer)
        timer = window.setTimeout(() => {
            func(...params)
            timer = null
        }, delay)
    }
}

export function getUrlParam(param: string): string | undefined {
    const dict = location.search.substring(1).split('&').map(x => x.split('=', 2))
    const res = dict.find(kv => kv[0] === param)
    return res ? res[1] : undefined
}

let refOfVariables = new Map()
export function localStorageVariable(name: string, defaultValue: string): Ref<string> {
    if (refOfVariables.has(name)) return refOfVariables.get(name)
    const res = ref(localStorage.getItem(name) ?? defaultValue)
    watch(res, (value) => value === null ? localStorage.removeItem(name) : localStorage.setItem(name, value))
    refOfVariables.set(name, res)
    return res
}

export function invokeDownload(url: string, filename: string | null = null) {
    var a = document.createElement('a');
    a.href = url;
    if (typeof filename === 'string')
        a.download = filename;
    a.click();
}
