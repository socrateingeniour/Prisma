export class CourseCard {
    constructor(data) {
        this.data = data;
    }

    render() {
        return `
            <div class="sub-card course-card">
                <h4>${this.data.title}</h4>
                <p>${this.data.description_md}</p>
                <span>Credits: ${this.data.credits}</span>
            </div>
        `;
    }
}
