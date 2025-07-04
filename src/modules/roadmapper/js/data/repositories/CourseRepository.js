import { JsonDataSource } from '../sources/JsonDataSource.js';

let coursesById = null; // Private in-memory cache

async function initialize() {
    if (coursesById) return;

    const dbTable = await JsonDataSource.fetchTable('courses');

    const columns = dbTable.columns;
    coursesById = {}; 
    for (const record of dbTable.records) {
        const courseObject = {};
        for (let i = 0; i < columns.length; i++) {
            courseObject[columns[i]] = record[i];
        }
        coursesById[courseObject.id] = courseObject;
    }
}

function getById(id) {
    return coursesById ? coursesById[id] : null;
}

function findAll() {
    return coursesById ? Object.values(coursesById) : [];
}

export const CourseRepository = {
    initialize,
    getById,
    findAll,
};
