/*
 * @Email: chen.hu@zealcomm.cn
 * @Author: hc
 * @Date: 2023-05-15 14:54:09
 * @Description:
 */
/**
 * @name getConfig
 * @description 读取 config.yml全局配置文件
 */

import { readFileSync } from 'fs';
import { resolve } from 'path';
import { parse } from 'yaml';

export const getConfig = () => {
  console.log('配置文件路径：', resolve(process.cwd(), './config/config.yml'));
  const file = readFileSync(
    resolve(process.cwd(), './config/config.yml'),
    'utf8',
  );
  return parse(file);
};
