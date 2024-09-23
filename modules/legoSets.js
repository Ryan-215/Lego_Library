require('dotenv').config();
const Sequelize = require('sequelize');

// set up sequelize to my database
const sequelize = new Sequelize(
    process.env.DB_DATABASE,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        dialect: 'postgres',
        port: 5432,
        dialectOptions: {
            ssl: { rejectUnauthorized: false },
        },
    }
);

// set up Theme table
const Theme = sequelize.define('Theme',
    {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        name: Sequelize.STRING,
    },
    {
        createdAt: false,
        updatedAt: false,
    }
);

// set up Set table
const Set = sequelize.define('Set',
    {
        set_num: {
            type: Sequelize.STRING,
            primaryKey: true,
        },
        name: Sequelize.STRING,
        year: Sequelize.INTEGER,
        num_parts: Sequelize.INTEGER,
        theme_id: Sequelize.INTEGER,
        img_url: Sequelize.STRING,
    },
    {
        createdAt: false,
        updatedAt: false,
    }
);

// association between tables
Set.belongsTo(Theme, {foreignKey: 'theme_id'});


// sync with database
function initialize() {
    return sequelize.sync();
}

// get all sets 
function getAllSets() { 
     return new Promise ((resolve, reject) => {
        Set.findAll({include: [Theme]})
            .then(result => resolve(result))
            .catch(err => {
                console.log(err);
                reject("Sorry, we're currently meet some issue, please come back later.");
            });
    });
}

// get a 'set' from 'sets' array by 'set_num'
function getSetByNum(setNum) {
    return new Promise ((resolve, reject) => {
        Set.findAll({
            include: [Theme], 
            where: {set_num: setNum}
        })
        .then(result => {
            if (result.length !== 0) {
                resolve(result);
            }
            else 
                reject('Sorry, we cannot find the Lego set you are looking for.');
        })
        .catch(err => console.log(err));
    });
}

// get an array of 'set' by 'theme'
function getSetsByTheme(theme) {
    return new Promise ((resolve, reject) => {
        Set.findAll({
            include: [Theme], 
            where: {
                '$Theme.name$': {[Sequelize.Op.iLike]: `%${theme}%`}
            }
        })
        .then(result => {
            if (result.length !== 0) {
                resolve(result);
            }
            else 
                reject('Sorry, we cannot find the Theme set you are looking for.');
        })
        .catch(err => console.log(err));
    });
}

// add a new set to database
function addSet(setData) {
    return new Promise ((resolve, reject) => {
        Set.create({
            name: setData.name,
            year: setData.year,
            num_parts: setData.num_parts,
            img_url: setData.img_url,
            theme_id: setData.theme_id,
            set_num: setData.set_num,
        })
        .then(() => resolve())
        .catch(err => reject(err.errors[0].message));
    });
}

// get all themes from database
function getAllThemes() {
    return new Promise((resolve, reject) => {
        Theme.findAll()
        .then(found => resolve(found))
        .catch(err => reject("No Data found for Theme"))
    });
}

// edit a set
function editSet(set_num, setData) {
    return new Promise((resolve, reject) => {
        Set.update({
            name: setData.name,
            year: setData.year,
            num_parts: setData.num_parts,
            img_url: setData.img_url,
            theme_id: setData.theme_id,
        },
        {
            where: {set_num : set_num},
        })
        .then(() => resolve())
        .catch(err => reject(err.errors[0].messag));
    });
}

// delete a set
function deleteSet(set_num) {
    return new Promise((resolve, reject) => {
        Set.destroy({where: {set_num : set_num}})
        .then(() => resolve())
        .catch(err => reject(err.errors[0].message))

    });
}

// Exports all functions from this module
module.exports = { initialize, getAllSets, getSetByNum, getSetsByTheme, addSet, getAllThemes, editSet, deleteSet };