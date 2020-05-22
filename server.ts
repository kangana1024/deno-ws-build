import { listenAndServe } from 'https://deno.land/std/http/server.ts';
import { acceptWebSocket, acceptable } from 'https://deno.land/std/ws/mod.ts';

import chat from './chat.ts';

listenAndServe({ port: 3000 }, async (req) => {
  if (acceptable(req)) {
    acceptWebSocket({
      conn: req.conn,
      bufReader: req.r,
      bufWriter: req.w,
      headers: req.headers
    }).then(chat);
  }
});
console.log("Server start on port 3000")
