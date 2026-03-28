import * as fs from 'fs';
import * as path from 'path';

const manifestPath = path.resolve(__dirname, '../../../../web/manifest.json');
let manifest: Record<string, unknown>;

beforeAll(() => {
  const raw = fs.readFileSync(manifestPath, 'utf-8');
  manifest = JSON.parse(raw);
});

describe('web/manifest.json', () => {
  it('parses as valid JSON', () => {
    expect(manifest).toBeDefined();
    expect(typeof manifest).toBe('object');
  });

  it('has required installability fields', () => {
    expect(manifest).toHaveProperty('name');
    expect(manifest).toHaveProperty('short_name');
    expect(manifest).toHaveProperty('start_url');
    expect(manifest).toHaveProperty('display');
    expect(manifest).toHaveProperty('icons');
  });

  it('has display set to standalone', () => {
    expect(manifest.display).toBe('standalone');
  });

  it('includes 192px and 512px icons', () => {
    const icons = manifest.icons as Array<{ sizes: string; src: string; type: string }>;
    expect(Array.isArray(icons)).toBe(true);
    const has192 = icons.some((icon) => icon.sizes === '192x192');
    const has512 = icons.some((icon) => icon.sizes === '512x512');
    expect(has192).toBe(true);
    expect(has512).toBe(true);
  });

  it('includes at least one maskable icon', () => {
    const icons = manifest.icons as Array<{ purpose?: string }>;
    const hasMaskable = icons.some((icon) => icon.purpose === 'maskable');
    expect(hasMaskable).toBe(true);
  });

  it('has dir set to auto for RTL support', () => {
    expect(manifest.dir).toBe('auto');
  });
});
