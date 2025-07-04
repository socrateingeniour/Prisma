export class CollegeProfileCard {
    constructor(data) {
        this.data = data;
    }

    render() {
        return `
            <div class="sub-card college-profile-card">
                <h4>${this.data.name}</h4>
                <p>Rank: ${this.data.rank}</p>
                <div>
                    <h5>Heritage & Identity</h5>
                    <p>${this.data.heritage_identity_md}</p>
                </div>
                <div>
                    <h5>Global Positioning</h5>
                    <p>${this.data.global_positioning_md}</p>
                </div>
                <div>
                    <h5>Academic Ecosystem</h5>
                    <p>${this.data.academic_ecosystem_md}</p>
                </div>
                <div>
                    <h5>Gateway Info</h5>
                    <p>${this.data.gateway_info_md}</p>
                </div>
            </div>
        `;
    }
}
