import SelectFilter from '@/components/SelectFilter.vue';
import SelectProject from '@/components/SelectProject.vue';
import SelectSort from '@/components/SelectSort.vue';
import { IonInput, IonModal } from '@ionic/vue';
import { shallowMount } from '@vue/test-utils';
import { describe, expect, test, vi } from 'vitest';

const { tt } = vi.hoisted(() => ({
  tt: {
    filter: undefined,
    getFilterWithLabel: vi.fn(),
    meta: undefined,
    project: undefined,
    projection: {},
    sortBy: undefined,
  },
}));

vi.mock('@/stores/ttStore', () => ({
  useTtStore: () => tt,
}));

vi.mock('vue-i18n', () => ({
  useI18n: () => ({ t: (key: string) => key }),
}));

describe.each([
  ['project', SelectProject],
  ['filter', SelectFilter],
  ['sort', SelectSort],
])('%s selector', (_name, component) => {
  test('opens only after an explicit user action', async () => {
    const wrapper = shallowMount(component, {
      global: {
        mocks: { $t: (key: string) => key },
      },
    });
    const input = wrapper.findComponent(IonInput);
    const modal = wrapper.findComponent(IonModal);

    await input.vm.$emit('ionFocus');
    expect(modal.props('isOpen')).toBe(false);

    await input.vm.$emit('click');
    expect(modal.props('isOpen')).toBe(true);
  });
});
