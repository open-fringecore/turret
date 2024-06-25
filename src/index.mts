import express from 'express';
import cors from 'cors';
import fs from "fs";
import { projects } from './projects.mjs';
import { exec as callbackExec } from 'child_process';
import { promisify } from 'util';
import { createConnection } from 'net';
import httpProxy from 'http-proxy';

const delay = promisify(setTimeout);

// Function to check if a port is open
function checkPortOpen(host: string, port: number): Promise<boolean> {
    return new Promise((resolve) => {
        const socket = createConnection(port, host, () => {
            socket.end();
            resolve(true);
        });
        socket.on('error', () => {
            resolve(false);
        });
    });
}

const proxy = httpProxy.createProxyServer({
});

const exec = promisify(callbackExec);

// making a folder of projects if it doesn't exist
if (!fs.existsSync('./projects')) {
    fs.mkdirSync('./projects');
}

const app = express();

app.use(cors());
// app.use(express.json());


app.use(async (req, res) => {
    const { hostname, path } = req;

    const currProject = projects[hostname];

    if (!currProject) {
        res.json({
            hostname: hostname,
            message: "Ei hostname e project nai bhai",
            time: new Date().toISOString(),
        });
        return;
    }

    console.log(currProject);

    const dockerLocations = currProject.dockerLocations;

    const { stdout, stderr } = await exec(`ls -ld /app/projects/test2`);

    console.log(stdout, stderr);


    await Promise.all(dockerLocations.map(async (dockerLocation) => {
        const { stdout, stderr } = await exec(`cd ${dockerLocation} && docker compose up`);
    }));

    while (true) {
        let isConnected = true;

        // Wrap the proxy.web call in a Promise
        const proxyWebPromise = new Promise((resolve, reject) => {
            proxy.web(req, res, { target: `http://${hostname}:${currProject.port}` }, (err) => {
                if (err) {
                    // console.log(err);
                    isConnected = false;
                    reject(err);
                } else {
                    resolve("Success");
                }
            });
        });

        try {
            await proxyWebPromise;
            // console.log(isConnected);
            if (isConnected) {
                break;
            }
        } catch (error) {
            // console.error("Proxy operation failed:", error);
        }

        await delay(500);
    }
});

app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});