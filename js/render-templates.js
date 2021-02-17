const fs = require('fs');
const path = require('path');
const handlebars = require('handlebars');

const assetsDir = path.join(__dirname, '../assets');
const templateMap = {
    'custom_start_valheim.sh.hbs': 'custom_start_valheim.sh',
    'stop_backup_start.sh.hbs': 'stop_backup_start.sh'
};

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
}

module.exports = {
    renderAll: renderAll
};
