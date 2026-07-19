import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
import https from 'https';
import { IncomingMessage, ServerResponse } from 'http';

// 辅助函数：读取 HTTP 请求体
function getRequestBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
    });
    req.on('end', () => resolve(body));
    req.on('error', err => reject(err));
  });
}

// 辅助函数：发送 HTTPS 请求
function makeHttpsRequest(urlStr: string, options: any, bodyData?: string): Promise<{ statusCode: number | undefined; body: any }> {
  return new Promise((resolve, reject) => {
    const req = https.request(urlStr, options, (res) => {
      let data = '';
      res.on('data', chunk => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          resolve({ statusCode: res.statusCode, body: JSON.parse(data) });
        } catch (e) {
          resolve({ statusCode: res.statusCode, body: data });
        }
      });
    });
    req.on('error', err => reject(err));
    if (bodyData) {
      req.write(bodyData);
    }
    req.end();
  });
}

// 辅助函数：延时
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export default defineConfig(({ mode }) => {
  // 加载当前环境变量
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      vue(),
      {
        name: 'local-api-proxy',
        configureServer(server) {
          server.middlewares.use(async (req, res, next) => {
            // 仅处理本地测试生成 API
            if (req.url && req.url.startsWith('/api/local/generate')) {
              if (req.method !== 'POST') {
                res.writeHead(405, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Method Not Allowed' }));
                return;
              }

              try {
                const bodyStr = await getRequestBody(req);
                const { taskType, prompt, style } = JSON.parse(bodyStr);

                res.writeHead(200, {
                  'Content-Type': 'application/json; charset=utf-8',
                  'Cache-Control': 'no-cache'
                });

                // 1. 图像/多模态生成任务 -> 调用通义万相/通义千问 (DashScope)
                if (taskType === 'image') {
                  const apiKey = env.DASHSCOPE_API_KEY;
                  if (!apiKey || apiKey === 'your_api_key_here') {
                    res.end(JSON.stringify({ error: '本地缺少 DASHSCOPE_API_KEY 配置，请检查子项目 .env 文件。' }));
                    return;
                  }

                  // 提交异步生图任务到通义万相
                  const submitUrl = 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text2image/image-synthesis';
                  const submitHeaders = {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                    'X-DashScope-Async': 'enable'
                  };
                  const submitBody = JSON.stringify({
                    model: 'wanxiang-v2.1',
                    input: {
                      prompt: prompt
                    },
                    parameters: {
                      style: style || '<photography>',
                      size: '1024*1024'
                    }
                  });

                  const submitRes = await makeHttpsRequest(submitUrl, { method: 'POST', headers: submitHeaders }, submitBody);

                  if (submitRes.statusCode !== 200 || !submitRes.body?.output?.task_id) {
                    res.end(JSON.stringify({ error: '提交万相画图任务失败', detail: submitRes.body }));
                    return;
                  }

                  const taskId = submitRes.body.output.task_id;
                  let taskStatus = 'PENDING';
                  let imageUrl = '';
                  let attempts = 0;

                  // 轮询任务结果 (最长等待 30 秒)
                  while (taskStatus !== 'SUCCEEDED' && taskStatus !== 'FAILED' && attempts < 15) {
                    await sleep(2000);
                    attempts++;

                    const queryUrl = `https://dashscope.aliyuncs.com/api/v1/tasks/${taskId}`;
                    const queryHeaders = {
                      'Authorization': `Bearer ${apiKey}`
                    };

                    const queryRes = await makeHttpsRequest(queryUrl, { method: 'GET', headers: queryHeaders });
                    if (queryRes.statusCode === 200 && queryRes.body?.output) {
                      taskStatus = queryRes.body.output.task_status;
                      if (taskStatus === 'SUCCEEDED') {
                        imageUrl = queryRes.body.output.results?.[0]?.url || '';
                        break;
                      }
                    }
                  }

                  if (taskStatus === 'SUCCEEDED' && imageUrl) {
                    res.end(JSON.stringify({ result: imageUrl }));
                  } else {
                    res.end(JSON.stringify({ error: '生图任务超时或失败', status: taskStatus }));
                  }
                  return;
                }

                // 2. 文本生成任务 -> 调用 DeepSeek API
                const apiKey = env.DEEPSEEK_API_KEY;
                if (!apiKey || apiKey === 'your_api_key_here') {
                  res.end(JSON.stringify({ error: '本地缺少 DEEPSEEK_API_KEY 配置，请检查子项目 .env 文件。' }));
                  return;
                }

                const dsUrl = 'https://api.deepseek.com/v1/chat/completions';
                const dsHeaders = {
                  'Authorization': `Bearer ${apiKey}`,
                  'Content-Type': 'application/json'
                };
                const dsBody = JSON.stringify({
                  model: 'deepseek-chat',
                  messages: [
                    { role: 'system', content: '你是一个专业的创作助手。根据用户的要求提供精炼的文案。' },
                    { role: 'user', content: prompt }
                  ],
                  stream: false
                });

                const dsRes = await makeHttpsRequest(dsUrl, { method: 'POST', headers: dsHeaders }, dsBody);
                if (dsRes.statusCode === 200 && dsRes.body?.choices?.[0]?.message?.content) {
                  res.end(JSON.stringify({ result: dsRes.body.choices[0].message.content }));
                } else {
                  res.end(JSON.stringify({ error: '调用 DeepSeek API 失败', detail: dsRes.body }));
                }
              } catch (e: any) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Internal Server Error', message: e.message }));
              }
              return;
            }
            next();
          });
        }
      }
    ]
  };
});
