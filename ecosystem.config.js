module.exports = {
    apps: [{
        name: 'API',
        script: 'npm',
        args : 'start api:prod',
        instances: 1,
        autorestart: true,
        watch: true,
        max_memory_restart: '1G',
    }],
};