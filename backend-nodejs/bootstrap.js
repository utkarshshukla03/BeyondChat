import { File } from 'undici';

if (!global.File) {
  global.File = File;
}
