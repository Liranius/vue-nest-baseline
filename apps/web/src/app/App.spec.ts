import { mount } from '@vue/test-utils';
import { describe, it, expect } from 'vitest';

import App from '@/app/App.vue';
import router from '@/router';

describe('App', () => {
  it('renders properly', async () => {
    const wrapper = mount(App, { global: { plugins: [router] } });
    await router.isReady();
    expect(wrapper.text()).toContain('Welcome @baseline/web 👋');
  });
});
