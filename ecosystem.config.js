module.exports = {
    apps: [
        {
            name: "AdeMentally",
            exec_mode: "cluster",
            instances: "max",
            script: "./.output/server/index.mjs",
        },
    ],
};
