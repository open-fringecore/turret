export const projects: {
    [hostname: string]: {
        dockerLocations: string[],
        host: string,
        port: number,
    }
} = {
    "192.168.0.156": {
        dockerLocations: [
            "./projects/test1"
        ],
        host: "bleh",
        port: 5000
    },
    "127.0.0.1": {
        dockerLocations: [
            "./projects/test2"
        ],
        host: "meow",
        port: 5000
    }
}