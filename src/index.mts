import { exec as callbackExec } from 'child_process';
import cors from 'cors';
import express from 'express';
import fs from "fs";
import httpProxy from 'http-proxy';
import { promisify } from 'util';
import { projects } from './projects.mjs';
import { checkServer } from './utils/checkServer.mjs';

const delay = promisify(setTimeout);

const proxy = httpProxy.createProxyServer({
});

const exec = promisify(callbackExec);

if (!fs.existsSync('./projects')) {
    fs.mkdirSync('./projects');
}

const app = express();

app.use(cors());
app.use(express.json());

const checkInterval = Number(process.env.INTERVAL_TO_CHECK) ?? 1000;
const duration = Number(process.env.TIME_OUT) ?? 60000;

app.use(async (req, res, next) => {
    const { hostname, path } = req;

    const currProject = projects[hostname];

    if (!currProject) {
        return next();
    }

    const dockerLocations = currProject.dockerLocations;

    await Promise.all(dockerLocations.map(async (dockerLocation) => {
        const { stdout, stderr } = await exec(`cd ${dockerLocation} && docker compose up -d`);
        console.log({ stdout, stderr });
    }));

    const isServerOn: boolean = await checkServer(currProject.host, currProject.port, checkInterval, duration);

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

app.post('/git', async (req, res) => {
    // console.log(req.body);

    const { repo_name } = req.body;

    console.log({ repo_name });

    if (!repo_name) {
        res.status(400).json({
            message: "Repo name missing",
            time: new Date().toISOString(),
        });
        return;
    }

    const repoPath = `./projects/${repo_name}.git`;

    if (fs.existsSync(repoPath)) {
        res.status(409).json({
            message: "Repo already exists",
            time: new Date().toISOString(),
        });
        return;
    }

    fs.mkdirSync(repoPath);
    await exec(`cd ${repoPath} && git init --bare`);

    return res.status(201).json({
        message: "Created the repo",
        time: new Date().toISOString(),
    });
});

// processYamlFile('./projects/test1/docker-compose.yaml');

app.listen(8000, () => {
    console.log('Server is running on http://localhost:8000');
});