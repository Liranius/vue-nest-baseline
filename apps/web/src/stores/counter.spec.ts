import { mount } from '@vue/test-utils';
import { createPinia, disposePinia, setActivePinia } from 'pinia';
import { it, expect } from 'vitest';
import { defineComponent, h } from 'vue';

import { useCounterStore } from '@/stores/counter';

const CounterButton = defineComponent({
  setup() {
    const counter = useCounterStore();
    return () =>
      h('button', { onClick: counter.increment }, `${counter.count}/${counter.doubleCount}`);
  },
});

it('shares reactive state within an app and isolates separate Pinia instances', async () => {
  const firstPinia = createPinia();
  const secondPinia = createPinia();
  const first = mount(() => h('div', [h(CounterButton), h(CounterButton)]), {
    global: { plugins: [firstPinia] },
  });
  const second = mount(CounterButton, { global: { plugins: [secondPinia] } });

  try {
    expect(first.findAll('button').map((button) => button.text())).toEqual(['0/0', '0/0']);
    await first.get('button').trigger('click');
    expect(first.findAll('button').map((button) => button.text())).toEqual(['1/2', '1/2']);
    expect(second.text()).toBe('0/0');

    await second.trigger('click');
    await first.get('button').trigger('click');
    expect(first.findAll('button').map((button) => button.text())).toEqual(['2/4', '2/4']);
    expect(second.text()).toBe('1/2');
  } finally {
    first.unmount();
    second.unmount();
    disposePinia(firstPinia);
    disposePinia(secondPinia);
    setActivePinia(undefined);
  }
});
