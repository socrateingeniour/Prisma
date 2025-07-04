
export const initialData = {
    "nodes": [
        {
            "id": "node-1",
            "branchId": "branch-1",
            "type": "parent",
            "position": { "x": 100, "y": 100 },
            "title": "Introduction to Web Development",
            "icon": "nodeDefault",
            "content": {
                "brief": "Start your journey with the fundamental building blocks of the web.",
                "stats": { "Difficulty": "1/5", "Workload": "Low" },
                "cards": [
                    { "type": "course", "data_source": "cs101" }
                ]
            }
        },
        {
            "id": "node-2",
            "branchId": "branch-1",
            "type": "parent",
            "position": { "x": 400, "y": 100 },
            "title": "JavaScript Fundamentals",
            "icon": "nodeDefault",
            "content": {
                "brief": "Learn the language of the web.",
                "stats": { "Difficulty": "2/5", "Workload": "Medium" },
                "cards": []
            }
        },
        {
            "id": "node-3",
            "branchId": "branch-2",
            "type": "parent",
            "position": { "x": 100, "y": 300 },
            "title": "Introduction to University",
            "icon": "nodeDefault",
            "content": {
                "brief": "Explore higher education options.",
                "stats": { "University": "UCLA", "Status": "Applied" },
                "cards": [
                    { "type": "college", "data_source": "ucla" }
                ]
            }
        }
    ],
    "connections": [
        {
            "id": "conn-1",
            "type": "main",
            "source": "node-1",
            "target": "node-2"
        }
    ],
    "branches": [
        {
            "id": "branch-1",
            "title": "Web Development Basics",
            "color": "var(--color-branch-1)"
        },
        {
            "id": "branch-2",
            "title": "Higher Education",
            "color": "var(--color-branch-2)"
        }
    ]
};
