const fs = require('fs');
const path = require('path');
const handlebars = require('handlebars');

const assetsDir = path.join(__dirname, '../assets');
const templateMap = {
    'custom_start_valheim.sh.hbs': 'custom_start_valheim.sh',
    'stop_backup_start.sh.hbs': 'stop_backup_start.sh'
};

const renderDowntimeCron = (userConfig) => {
    if (!userConfig.downtime) {
        return;
    }
    const { sleepHour } = userConfig.downtime;

    // Set backup hour an hour before
    const backupHour = (sleepHour === 0 || sleepHour === 24) ? 23 : sleepHour - 1;

    // Render
    const templatePath = path.join(__dirname, '../templates/downtime_cron.sh.hbs');
    const src = fs.readFileSync(templatePath, 'utf8');
    const result = handlebars.compile(src)({ backupHour });

    // Write
    fs.writeFileSync(path.join(assetsDir, 'downtime_cron.sh'), result);
}

const renderAssetFromTemplate = (templateName, parameters, destinationFileName) => {
    const templatePath = path.join(__dirname, '../templates/', templateName);
    const src = fs.readFileSync(templatePath, 'utf8');
    const result = handlebars.compile(src)(parameters);

    fs.writeFileSync(path.join(assetsDir, destinationFileName), result);
};

const renderAll = () => {
    const userConfigPath = path.join(__dirname, '../user-config.json');
    const userConfig = JSON.parse(fs.readFileSync(userConfigPath, 'utf8'));

    Object.keys(templateMap).forEach(key => renderAssetFromTemplate(key, userConfig, templateMap[key]));

    renderDowntimeCron(userConfig);
}

module.exports = {
    renderAll: renderAll
};
