import { describe, it, expect, beforeEach } from 'vitest';
import { VirtualFileSystem } from '../src';

describe('VirtualFileSystem (VFS)', () => {
  let vfs: VirtualFileSystem;

  beforeEach(() => {
    vfs = new VirtualFileSystem('TEST_VFS');
  });

  it('initializes standard directories and seed files', async () => {
    await vfs.init(true);

    expect(await vfs.exists('IBP://SYSTEM')).toBe(true);
    expect(await vfs.exists('IBP://USERS/guest/projects')).toBe(true);
    expect(await vfs.exists('IBP://USERS/guest/projects/welcome.ibp')).toBe(true);
  });

  it('writes and reads files under IBP://', async () => {
    const filePath = 'IBP://USERS/guest/projects/test.ibp';
    await vfs.writeFile(filePath, 'say "Testing VFS"');

    expect(await vfs.exists(filePath)).toBe(true);
    const content = await vfs.readFile(filePath);
    expect(content).toBe('say "Testing VFS"');
  });

  it('lists files inside a folder', async () => {
    await vfs.writeFile('IBP://USERS/guest/projects/a.ibp', 'say 1');
    await vfs.writeFile('IBP://USERS/guest/projects/b.ibp', 'say 2');

    const list = await vfs.listFolder('IBP://USERS/guest/projects');
    const names = list.map((f) => f.name);
    expect(names).toContain('a.ibp');
    expect(names).toContain('b.ibp');
  });

  it('renames and moves files', async () => {
    const oldPath = 'IBP://USERS/guest/projects/old.ibp';
    const newPath = 'IBP://USERS/guest/projects/renamed.ibp';
    await vfs.writeFile(oldPath, 'say "hello"');
    await vfs.rename(oldPath, newPath);

    expect(await vfs.exists(oldPath)).toBe(false);
    expect(await vfs.exists(newPath)).toBe(true);
    expect(await vfs.readFile(newPath)).toBe('say "hello"');
  });

  it('deletes files', async () => {
    const filePath = 'IBP://USERS/guest/projects/delete_me.ibp';
    await vfs.writeFile(filePath, 'say "bye"');
    expect(await vfs.exists(filePath)).toBe(true);

    await vfs.deleteFile(filePath);
    expect(await vfs.exists(filePath)).toBe(false);
  });
});
