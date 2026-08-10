import SelectFilter from '@/components/SelectFilter.vue';
import SelectProject from '@/components/SelectProject.vue';
import SelectSort from '@/components/SelectSort.vue';
import { IonInput, IonModal } from '@ionic/vue';
import { shallowMount } from '@vue/test-utils';
import { beforeEach, describe, expect, test, vi } from 'vitest';

const { tt } = vi.hoisted(() => ({
  tt: {
    filter: undefined as FilterWithLabel | undefined,
    getFilterWithLabel: vi.fn(),
    meta: undefined as Meta | undefined,
    project: undefined as Project | undefined,
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

beforeEach(() => {
  tt.filter = undefined;
  tt.getFilterWithLabel.mockReset();
  tt.meta = undefined;
  tt.project = undefined;
  tt.projection = {};
  tt.sortBy = undefined;
});

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

test('applies a filter only after its modal has closed', async () => {
  const currentFilter = { filter: 'all', label: 'All' } as FilterWithLabel;
  const nextFilter = { filter: 'active', label: 'Active' } as FilterWithLabel;
  tt.filter = currentFilter;
  tt.project = {
    filters: [{ filter: 'active' }],
  } as Project;
  tt.getFilterWithLabel.mockReturnValue(nextFilter);

  const wrapper = shallowMount(SelectFilter, {
    global: {
      mocks: { $t: (key: string) => key },
    },
  });
  const input = wrapper.findComponent(IonInput);
  const modal = wrapper.findComponent(IonModal);

  await input.vm.$emit('click');
  wrapper.vm.$.setupState.handleSelect(nextFilter);
  await wrapper.vm.$nextTick();

  expect(modal.props('isOpen')).toBe(false);
  expect(tt.filter).toBe(currentFilter);

  await modal.vm.$emit('didDismiss');
  expect(tt.filter).toEqual(nextFilter);
});

test('applies a project only after its modal has closed', async () => {
  const currentProject = { project: 'Current' } as Project;
  const nextProject = { project: 'Next' } as Project;
  tt.project = currentProject;
  tt.meta = { projects: [nextProject] } as Meta;

  const wrapper = shallowMount(SelectProject, {
    global: {
      mocks: { $t: (key: string) => key },
    },
  });
  const input = wrapper.findComponent(IonInput);
  const modal = wrapper.findComponent(IonModal);

  await input.vm.$emit('click');
  wrapper.vm.$.setupState.handler(nextProject);
  await wrapper.vm.$nextTick();

  expect(modal.props('isOpen')).toBe(false);
  expect(tt.project).toBe(currentProject);

  await modal.vm.$emit('didDismiss');
  expect(tt.project).toEqual(nextProject);
});
