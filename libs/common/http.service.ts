/*
 * @Email: chen.hu@zealcomm.cn
 * @Author: hc
 * @Date: 2023-05-13 11:10:17
 * @Description:
 */
import axios from 'axios';
import { v4 } from 'uuid';
// import { getLogger } from './logger';
const instance = axios.create();
// const logger = getLogger('HttpClient');

function generateRequestId() {
  return v4().slice(-12);
}

instance.interceptors.request.use(function (config) {
  const requestId = generateRequestId();
  config['requestId'] = requestId;
  config['startAt'] = Date.now();
  console.info(`<= ${requestId} ${config.url}`, {
    params: config.params,
    body: config.data,
    headers: config.headers,
  });
  return config;
});
instance.interceptors.response.use(
  function (response) {
    const duration = `${Date.now() - response.config?.['startAt']}ms`;
    console.info(
      `=> ${response.config?.['requestId']} ${response?.status} ${duration}`,
      {
        data: response?.data,
      },
    );
    return response;
  },
  function (error) {
    const duration = `${Date.now() - error.config['startAt']}ms`;
    console.info(
      `=> ${error.config?.['requestId']} ${error.response?.status} ${duration}`,
      {
        url: error.config?.url,
        msg: error.message,
        response: error.response?.data,
      },
    );
    return Promise.reject(error);
  },
);

export const httpClient = instance;
