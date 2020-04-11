import https from 'https';

export const getPageContent = async (url: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const request = https.get(url, (resp: any) => {
      let data = '';
      resp.on('data', (chunk: any) => {
        data += chunk;
      });
      resp.on('end', () => {
        resolve(data);
      });
    }).on("error", (err: any) => {
      reject("Error: " + err.message);
    });
    request.setTimeout(10000, () => {
      reject({ code: 'timeout', message: `Request timeout for url: ${url}` });
    });
  })
}

export const createHash = (str: string): number => {
  let hash = 0, i, chr;
  for (i = 0; i < str.length; i++) {
    chr = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
}