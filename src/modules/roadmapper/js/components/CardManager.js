import { store } from '../store.js';
import { NodeCard } from './cards/NodeCard.js';
import { CourseCard } from './cards/CourseCard.js';
import { CollegeProfileCard } from './cards/CollegeProfileCard.js';
import { CourseRepository } from '../data/repositories/CourseRepository.js';
import { CollegeRepository } from '../data/repositories/CollegeRepository.js';

export class CardManager {
    constructor(container) {
        this.container = container;
        store.subscribe(() => this.render());
    }

    async render() {
        const { activeCard, nodes } = store.getState();
        if (activeCard.displayState === 'hidden') {
            this.container.innerHTML = '';
            return;
        }

        const node = nodes.find(n => n.id === activeCard.nodeId);
        if (!node) return;

        let subCardHtml = '';
        if (activeCard.activeSubCard) {
            let cardData;
            if (activeCard.activeSubCard.type === 'course') {
                cardData = CourseRepository.getById(activeCard.activeSubCard.source);
                subCardHtml = new CourseCard(cardData).render();
            } else if (activeCard.activeSubCard.type === 'college') {
                cardData = CollegeRepository.getById(activeCard.activeSubCard.source);
                subCardHtml = new CollegeProfileCard(cardData).render();
            }
        }

        const nodeCard = new NodeCard(node, activeCard.displayState);
        this.container.innerHTML = nodeCard.render(subCardHtml);
        this.addEventListeners();
    }

    addEventListeners() {
        this.container.querySelectorAll('.card-action-button').forEach(button => {
            button.addEventListener('click', (e) => {
                const type = e.target.dataset.cardType;
                const source = e.target.dataset.cardSource;
                store.setCardDisplayState('docked');
                store.setActiveSubCard({ type, source });
            });
        });

        this.container.querySelector('.close-card')?.addEventListener('click', () => {
            store.setCardDisplayState('hidden');
            store.setActiveSubCard(null);
        });

        this.container.querySelector('.expand-card')?.addEventListener('click', () => {
            store.setCardDisplayState('fullscreen');
        });

        this.container.querySelector('.shrink-card')?.addEventListener('click', () => {
            store.setCardDisplayState('docked');
        });
    }
}
