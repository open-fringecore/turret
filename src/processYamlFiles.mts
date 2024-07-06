import fs from 'fs/promises';
import yaml from 'js-yaml';
import path from 'path';

// Define interfaces for the structure of your YAML document
interface Service {
    ports?: string[];
    volumes?: string[];
    networks?: { [key: string]: { aliases?: string[] } | string[] };
}

interface DockerCompose {
    services: { [serviceName: string]: Service };
    networks?: { [networkName: string]: {} };
}

const ABSOLUTE_PATH = process.env.ABSOLUTE_PATH ?? '/app';

export async function processYamlFile(filePath: string): Promise<void> {
    try {
        const fileContents = await fs.readFile(filePath, 'utf8');

        const doc = yaml.load(fileContents) as DockerCompose;

        doc.networks = { ...doc.networks, 'turret_network': { name: 'turret_network', external: true } };

        // console.log(doc.services);

        for (const service in doc.services) {
            delete doc.services[service].ports;


            if (Array.isArray(doc.services[service].networks)) {
                // If it's an array, convert it to an object
                const networkObj = doc.services[service].networks.reduce((acc, network) => {
                    acc[network] = {};
                    return acc;
                }, {} as { [key: string]: {} });
                doc.services[service].networks = networkObj;
            }


            if (!doc.services[service].networks) {
                doc.services[service].networks = {};
            }

            console.log(doc.services[service].networks);

            if (!doc.services[service].networks['turret_network']) {
                doc.services[service].networks['turret_network'] = { aliases: ['turret-alias'] };
            }


            if (doc.services[service].volumes) {
                doc.services[service].volumes = doc.services[service].volumes.map(volume => {
                    if (volume.startsWith('.')) {

                        return path.resolve(path.dirname(filePath), volume).replace('/app', ABSOLUTE_PATH);
                    }
                    return volume;
                });
            }
        }


        // Convert object back to YAML
        const newYaml = yaml.dump(doc);
        // Write modified YAML to a new file
        await fs.writeFile('modified-docker-compose.yml', newYaml, 'utf8');
        console.log('YAML file processed successfully.');
    } catch (error) {
        console.error('Error processing YAML file:', error);
    }
}