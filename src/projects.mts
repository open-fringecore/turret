export const projects: {
    [hostname: string]: {
        dockerLocations: string[],
        port: number,
    }
} = {
    "192.168.0.156": {
        dockerLocations: [
            "./projects/test1"
        ],
        port: 4000
    },
    "127.0.0.1": {
        dockerLocations: [
            "./projects/test2"
        ],
        port: 5000
    }
}