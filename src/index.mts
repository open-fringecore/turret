import express from 'express';
import cors from 'cors';
import fs from "fs";
import { projects } from './projects.mjs';
import { exec as callbackExec } from 'child_process';
import { promisify } from 'util';
import httpProxy from 'http-proxy';
import net from 'net';

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

function checkPort(host: string, port: number, interval: number) {
    console.log(`Checking port ${port} every ${interval} milliseconds`);

    setInterval(() => {
        const socket = new net.Socket();

        socket.setTimeout(5000);  // Set a timeout of 5 seconds

        socket.connect(port, host, () => {
            console.log(`Port ${port} is open`);
            socket.destroy();
        });

        socket.on('error', (err) => {
            console.log(`Port ${port} is closed or unreachable:`, err.message);
        });

        socket.on('timeout', () => {
            console.log(`Connection to port ${port} timed out`);
            socket.destroy();
        });
    }, interval);
}

// Usage
const host = 'localhost';
const port = 5000;
const checkInterval = 1000;  // Check every 60 seconds

checkPort(host, port, checkInterval);


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

});

app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});