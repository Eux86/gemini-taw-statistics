import https from 'https';

export const getPageContent = async (url: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    https.get(url, (resp: any) => {
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
  })
}