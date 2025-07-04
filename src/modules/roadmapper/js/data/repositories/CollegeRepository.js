import { JsonDataSource } from '../sources/JsonDataSource.js';

let collegesById = null; // Private in-memory cache

async function initialize() {
    if (collegesById) return;

    // Use the data source to get the raw table
    const dbTable = await JsonDataSource.fetchTable('colleges');

    // --- The key transformation step ---
    const columns = dbTable.columns;
    collegesById = {}; 
    for (const record of dbTable.records) {
        const collegeObject = {};
        for (let i = 0; i < columns.length; i++) {
            collegeObject[columns[i]] = record[i];
        }
        collegesById[collegeObject.id] = collegeObject;
    }
}

function getById(id) {
    return collegesById ? collegesById[id] : null;
}

function findAll() {
    return collegesById ? Object.values(collegesById) : [];
}

// Export the clean API
export const CollegeRepository = {
    initialize,
    getById,
    findAll,
};
