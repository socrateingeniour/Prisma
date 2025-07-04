async function fetchTable(tableName) {
    const response = await fetch(`data/${tableName}.database.json`);
    if (!response.ok) {
        throw new Error(`Failed to load data source: ${tableName}`);
    }
    return await response.json();
}

export const JsonDataSource = {
    fetchTable
};
