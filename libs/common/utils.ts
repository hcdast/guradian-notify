/*
 * @Email: chen.hu@zealcomm.cn
 * @Author: hc
 * @Date: 2023-05-13 11:10:17
 * @Description:
 */
import { createHash } from 'crypto';
import * as process from 'process';
import { readFileSync } from 'fs';
import { v4 } from 'uuid';
import { xml2json } from 'xml-js';
import _ from 'lodash';

export function MD5(str: string) {
  return createHash('md5').update(str).digest('hex');
}

export function isProd() {
  return process.env.NODE_ENV === 'production';
}

export async function sleep(duration: number) {
  return new Promise((resolve) => setTimeout(() => resolve(null), duration));
}

export function loadJsonFile(file: string) {
  const content = readFileSync(file);
  return JSON.parse(content.toString());
}

export function SHA1(str: string) {
  return createHash('sha1').update(str).digest('hex');
}

export function sha256(data: any) {
  return createHash('sha256').update(data).digest('hex');
}

export function getUid() {
  return v4().replace(/-/g, '');
}

export function strToNumber(str: string) {
  if (str !== undefined && str !== null) {
    return Number(str);
  }
  return str;
}

/**
 * @description: xml 转 json
 * @param {string} xml
 * @return {object} obj
 */
export function parserXml2Json(xml: string) {
  const obj: any = {};
  const result: any = JSON.parse(xml2json(xml, { compact: false }));
  for (const item of result.elements) {
    obj[item.name] = {};
    if (!item.elements?.length) break;
    for (const e of item.elements) {
      obj[item.name][e.name] = _.compact(
        _.map(e.elements, 'cdata').concat(_.map(e.elements, 'text')),
      ).join();
    }
  }
  return obj;
}
