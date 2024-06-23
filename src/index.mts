import express from 'express';
import cors from 'cors';
import fs from "fs";
import { projects } from './projects.mjs';
import { exec as callbackExec } from 'child_process';
import { promisify } from 'util';


import httpProxy from 'http-proxy';

const proxy = httpProxy.createProxyServer({
    timeout: 5000,
});

const exec = promisify(callbackExec);

// making a folder of projects if it doesn't exist
if (!fs.existsSync('./projects')) {
    fs.mkdirSync('./projects');
}

const app = express();

app.use(cors());
app.use(express.json());


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

    await Promise.all(dockerLocations.map(async (dockerLocation) => {
        const { stdout, stderr } = await exec(`cd ${dockerLocation} && docker compose up -d`);
    }));

    proxy.web(req, res, { target: `http://${hostname}:${currProject.port}` });
});

app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});