import net from 'net';

export async function handleRequest(host: string, port: number, interval: number, duration: number): Promise<boolean> {
    console.log(`Checking http://${host}:${port} every ${interval} milliseconds for ${duration} milliseconds`);

    return new Promise((resolve) => {
        const endTime = Date.now() + duration;
        const intervalId = setInterval(() => {
            if (Date.now() > endTime) {
                clearInterval(intervalId);
                console.log(`Stopped checking port ${port} after ${duration} milliseconds`);
                resolve(false);
            }

            const socket = new net.Socket();
            socket.setTimeout(5000);  // Set a timeout of 5 seconds

            socket.connect(port, host, () => {
                console.log(`Port ${port} is open`);
                socket.destroy();
                clearInterval(intervalId);
                resolve(true);
            });

            socket.on('error', (err) => {
                console.log(`Port ${port} is closed or unreachable:`, err.message);
                socket.destroy();
            });

            socket.on('timeout', () => {
                console.log(`Connection to port ${port} timed out`);
                socket.destroy();
            });
        }, interval);
    });
}