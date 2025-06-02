import { defineAsyncComponent } from 'vue'

export function loadOptionalComponent(path: string) {
  return defineAsyncComponent(async () => {
    try {
      return await import(/* @vite-ignore */ path)
    } catch (e) {
      console.warn(`Компонент по пути "${path}" не найден, будет использована заглушка.`)
      return {
        template: '<div style="display: none"></div>',
      }
    }
  })
}
