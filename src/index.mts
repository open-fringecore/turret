import express from 'express';
import cors from 'cors';
import fs from "fs";
import { projects } from './projects.mjs';
import { exec as callbackExec } from 'child_process';
import { promisify } from 'util';
import httpProxy from 'http-proxy';

import http from 'http';

// Function to check if the server is running
function checkServerIsRunning(url: string, retryInterval: number = 5000): Promise<void> {
    console.log('Checking: ', url);

    return new Promise((resolve, reject) => {
        const check = () => {
            const req = http.get(url, (res) => {
                if (res.statusCode === 200) {
                    console.log('Server is running');
                    resolve();
                } else {
                    console.log('Server is running but returned a non-OK status:', res.statusCode);
                    // setTimeout(check, retryInterval); // Retry after the specified interval
                }
            }).on('error', (err) => {
                console.log('Server is not running, retrying...');
                setTimeout(check, retryInterval); // Retry after the specified interval
            });

            req.end();
        };

        check(); // Initial check
    });
}

const delay = promisify(setTimeout);

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

    // try {
    //     const { stdout, stderr } = await exec(`systemctl start docker`);
    //     console.log({ stdout, stderr });
    // } catch (error) {
    //     console.log(error);
    // }

    const { stdout, stderr } = await exec(`docker ps -a`);

    console.log(stdout, stderr);

    await Promise.all(dockerLocations.map(async (dockerLocation) => {
        const { stdout, stderr } = await exec(`cd ${dockerLocation} && pnpm install && docker compose up -d`);
    }));

    await checkServerIsRunning(`http://localhost:${currProject.port}`);

    proxy.web(req, res, { target: `http://localhost:${currProject.port}` });

});

app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});