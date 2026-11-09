import { mount } from '@vue/test-utils';
import { createPinia, disposePinia, setActivePinia } from 'pinia';
import { describe, it, expect } from 'vitest';

import App from '@/app/App.vue';
import router from '@/router';

describe('App', () => {
  it('renders properly', async () => {
    const pinia = createPinia();
    const wrapper = mount(App, { global: { plugins: [pinia, router] } });
    try {
      await router.isReady();
      expect(wrapper.text()).toContain('Welcome @baseline/web 👋');
    } finally {
      wrapper.unmount();
      disposePinia(pinia);
      setActivePinia(undefined);
    }
  });
});
