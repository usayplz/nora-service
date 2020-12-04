import 'reflect-metadata';

import * as functions from 'firebase-functions';
import * as http from 'http';
import * as https from 'https';
import * as process from 'process';
import { serviceSockets } from './config';
import { container } from './container';
import { app } from './http/app';
import { initWebSocketListener } from './socket';
// import { PostgressService } from './services/postgress.service';

const  fireBaseExports: any = {};
export = fireBaseExports;

if (typeof process.env.FIREBASE_CONFIG === 'undefined') {
  serviceSockets.forEach(srv => {
    const server = srv.tls ? https.createServer(srv.tls, app) : http.createServer(app);
    initWebSocketListener(server, container);
    server.listen({
      port: srv.port,
      address: srv.address
    }, () =>
      console.log(`listening ${srv.tls ? 'https' : 'http'} on ${srv.address ? '[' + srv.address + '] ' : ''}${srv.port}`)
    );
  });
} else {
  console.log('FireBase-Mode');
  // // Start writing Firebase Functions
  // // https://firebase.google.com/docs/functions/typescript
  //
  fireBaseExports.nora  = functions.https.onRequest((request, response) => {
    console.log('fireBaseRequest:', request.path);
    app(request, response);
//    response.send(`Hello from nora!
//                  <code>${JSON.stringify(process.env, null, 2)}</code>
//                  <code>${request}</code>
//                  `);
  });
}


// (async function () {
//     console.log("creating table...");
//     const service = new PostgressService();
//     await service.query(`
//         CREATE TABLE IF NOT EXISTS appuser (
//             uid VARCHAR(30) CONSTRAINT pk PRIMARY KEY,
//             linked boolean DEFAULT false
//         )`
//     );
// 
//     await service.query('ALTER TABLE appuser ADD COLUMN noderedversion integer DEFAULT 1');
//     await service.query('ALTER TABLE appuser ADD COLUMN refreshToken integer DEFAULT 1');
//     const repo = new UserRepository(service);
//     await repo.incrementNoderedTokenVersion('ARcEql2ileYghxMOstan2bOsSEj1');
//     const users = await service.query('select * from appuser');
// 
//     console.log(await repo.getUser('ARcEql2ileYghxMOstan2bOsSEj1'));
// 
// })().catch(err => {
//     console.error(err);
// }).then(() => {
//     console.log('done');
// });