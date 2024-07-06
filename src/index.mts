import express from 'express';
import cors from 'cors';
import fs from "fs";
import { projects } from './projects.mjs';
import { exec as callbackExec } from 'child_process';
import { promisify } from 'util';
import httpProxy from 'http-proxy';
import { handleRequest } from './handleRequest.mjs';
import { processYamlFile } from './processYamlFiles.mjs';

const delay = promisify(setTimeout);

const proxy = httpProxy.createProxyServer({
});

const exec = promisify(callbackExec);

if (!fs.existsSync('./projects')) {
    fs.mkdirSync('./projects');
}

const app = express();

app.use(cors());

const checkInterval = Number(process.env.INTERVAL_TO_CHECK) ?? 1000;
const duration = Number(process.env.TIME_OUT) ?? 60000;

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

    const dockerLocations = currProject.dockerLocations;

    await Promise.all(dockerLocations.map(async (dockerLocation) => {
        const { stdout, stderr } = await exec(`cd ${dockerLocation} && docker compose up -d`);
        console.log({ stdout, stderr });
    }));

    const isServerOn: boolean = await handleRequest(currProject.host, currProject.port, checkInterval, duration);

    if (isServerOn) {
        proxy.web(req, res, { target: `http://${currProject.host}:${currProject.port}` });
    } else {
        res.json({
            hostname: hostname,
            message: "Server is down",
            time: new Date().toISOString(),
        });
    };
});

// processYamlFile('./projects/test1/docker-compose.yaml');

app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});