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
      reject(`Request timeout for url: ${url}`);
    })
  })
}