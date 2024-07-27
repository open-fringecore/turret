import fs from 'fs/promises';
import yaml from 'js-yaml';
import path from 'path';

interface Traefik {
    http: {
        routers: {
            [key: string]: {
                service: string,
                rules: string,
                entryPoint: string,
                tls?: {
                    certResolver: string,
                    options: string,
                }
            }
        }
    };
}

function yamlToKeyValue(yamlContent: string): Record<string, any> {
    function recurse(data: any, parentKey: string = ''): [string, any][] {
        let items: [string, any][] = [];
        for (const [key, value] of Object.entries(data)) {
            const newKey = (parentKey ? `${parentKey}/${key}` : key).toLowerCase();
            if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                items = items.concat(recurse(value, newKey));
            } else if (Array.isArray(value)) {
                value.forEach((element, index) => {
                    const arrayKey = `${newKey}/${index}`;
                    items.push([arrayKey, String(element)]);
                });
            } else {
                items.push([newKey, value]);
            }
        }
        return items;
    }

    const yamlDict = yaml.load(yamlContent);
    const keyValuePairs = recurse(yamlDict);
    // Add the traefik/ prefix to each key
    return Object.fromEntries(
        keyValuePairs
            .map(([key, value]) => key.endsWith('service') ? [`traefik/${key}`, 'turret']: [`traefik/${key}`, value])
            .filter(([key, _]) => key.startsWith('traefik/http/routers/'))
    );
}

export async function processTraefikFiles(filePath: string): Promise<void> {
    try {
        const fileContents = await fs.readFile(filePath, 'utf8');

        const obj = yamlToKeyValue(fileContents);
        console.log(obj);

        const doc = yaml.load(fileContents) as Traefik;

        // const obj = yamlToKeyValue(doc);

        // for (const router in doc.http.routers) {
        //     console.log(router)
        //     console.log(doc.http.routers[router]);
        // }

        // Convert object back to YAML
        const newYaml = yaml.dump(doc);
        // Write modified YAML to a new file
        // await fs.writeFile('modified-docker-compose.yml', newYaml, 'utf8');
        console.log('Traefik file processed successfully.');
    } catch (error) {
        console.error('Error processing Traefik file:', error);
    }
}