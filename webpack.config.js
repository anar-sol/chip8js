import path from "node:path";
import { cwd } from 'node:process';

export default {
  entry: './interface/index.js',
  output: {
    filename: 'main.js',
    path: path.resolve(cwd()),
  },
};