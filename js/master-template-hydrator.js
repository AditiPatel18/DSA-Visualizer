(function () {
    const ALGO_DATA_MAP = {
        'validparentheses': {
            name: 'Valid Parentheses',
            category: 'Stack',
            difficulty: 'Easy',
            time: 'O(N)',
            space: 'O(N)',
            advantages: ['O(N) single-pass linear time complexity', 'Ideal for parsing expressions and nested syntax'],
            disadvantages: ['Requires auxiliary stack space proportional to input depth'],
            interviewQuestions: [
                { q: 'How do you handle invalid closing brackets when the stack is empty?', a: 'Return false immediately as there is no matching opening bracket.' },
                { q: 'Can this be solved in O(1) space if only one type of parenthesis is present?', a: 'Yes, using a counter incremented on "(" and decremented on ")".' }
            ],
            commonMistakes: ['Forgetting to check if stack is empty before popping.', 'Not checking if stack is empty at the end of loop.'],
            practiceProblems: [
                { title: 'Valid Parentheses (LeetCode 20)', level: 'Easy', url: 'https://leetcode.com/problems/valid-parentheses/' },
                { title: 'Minimum Add to Make Parentheses Valid', level: 'Medium', url: 'https://leetcode.com/problems/minimum-add-to-make-parentheses-valid/' }
            ],
            prev: { name: 'Stack Implementation', url: 'queuealgo.html' },
            next: { name: 'Min Stack', url: 'minstack.html' }
        },
        'minstack': {
            name: 'Min Stack',
            category: 'Stack',
            difficulty: 'Medium',
            time: 'O(1) All Ops',
            space: 'O(N)',
            advantages: ['O(1) time retrieval of minimum element', 'Simple implementation using paired stack or 2*val - min trick'],
            disadvantages: ['Extra O(N) memory overhead for storing minimum history'],
            interviewQuestions: [
                { q: 'How do you get O(1) min without using an extra stack?', a: 'Store encoded values like 2*val - minVal when pushing a new minimum.' }
            ],
            commonMistakes: ['Updating min value on pop incorrectly when using encoding.'],
            practiceProblems: [
                { title: 'Min Stack (LeetCode 155)', level: 'Medium', url: 'https://leetcode.com/problems/min-stack/' }
            ],
            prev: { name: 'Valid Parentheses', url: 'validparentheses.html' },
            next: { name: 'Next Greater Element', url: 'nextgreaterelement.html' }
        }
    };

    function hydrateMasterTemplate() {
        const path = window.location.pathname.toLowerCase();
        const filename = path.split('/').pop().replace('.html', '');
        const mainEl = document.querySelector('.detail-main');
        if (!mainEl) return;

        const data = ALGO_DATA_MAP[filename] || {
            name: document.querySelector('.header-content h2, .logo h1')?.textContent?.trim() || 'Algorithm Detail',
            category: 'DSA',
            difficulty: 'Medium',
            time: 'O(N)',
            space: 'O(1)',
            advantages: ['Optimal time complexity for target input size.', 'Clean, maintainable implementation.'],
            disadvantages: ['Requires careful boundary condition checks.'],
            interviewQuestions: [
                { q: 'What is the primary trade-off of this algorithm?', a: 'Trading space complexity for improved execution time.' }
            ],
            commonMistakes: ['Off-by-one errors in index boundaries.'],
            practiceProblems: [
                { title: 'Practice Problem 1', level: 'Medium', url: '#' }
            ],
            prev: { name: 'Back to Category', url: '../algorithms/sorting.html' },
            next: { name: 'Next Algorithm', url: '../algorithms/sorting.html' }
        };

        // Render Advantages & Disadvantages ONLY if non-empty
        if (!document.querySelector('.adv-disadv-section') && data.advantages && data.advantages.length > 0) {
            const section = document.createElement('section');
            section.className = 'explanation-section adv-disadv-section';
            section.innerHTML = `
                <h2><i class="fas fa-balance-scale"></i> Advantages & Disadvantages</h2>
                <div class="complexity-grid" style="grid-template-columns: 1fr 1fr; gap: 1rem;">
                    <div class="complexity-card" style="border-left: 4px solid #4CAF50;">
                        <h3 style="color:#2E7D32;"><i class="fas fa-check-circle"></i> Advantages</h3>
                        <ul style="padding-left:1.2rem; margin-top:0.5rem;">
                            ${data.advantages.map(adv => `<li style="margin-bottom:0.4rem;">${adv}</li>`).join('')}
                        </ul>
                    </div>
                    <div class="complexity-card" style="border-left: 4px solid #f44336;">
                        <h3 style="color:#c62828;"><i class="fas fa-times-circle"></i> Disadvantages</h3>
                        <ul style="padding-left:1.2rem; margin-top:0.5rem;">
                            ${data.disadvantages.map(dis => `<li style="margin-bottom:0.4rem;">${dis}</li>`).join('')}
                        </ul>
                    </div>
                </div>
            `;
            mainEl.appendChild(section);
        }

        // Render Top Interview Questions ONLY if non-empty
        if (!document.querySelector('.interview-section') && data.interviewQuestions && data.interviewQuestions.length > 0) {
            const section = document.createElement('section');
            section.className = 'explanation-section interview-section';
            section.innerHTML = `
                <h2><i class="fas fa-question-circle"></i> Top Interview Questions</h2>
                <div style="display:flex; flex-direction:column; gap:0.8rem; margin-top:1rem;">
                    ${data.interviewQuestions.map((iq, idx) => `
                        <div class="card" style="padding:1rem; border-left:3px solid #1a237e; background:#f8f9fa;">
                            <h4 style="color:#1a237e; margin-bottom:0.3rem;">Q${idx + 1}: ${iq.q}</h4>
                            <p style="color:#444; font-size:0.95rem;"><strong>Answer:</strong> ${iq.a}</p>
                        </div>
                    `).join('')}
                </div>
            `;
            mainEl.appendChild(section);
        }

        // Render Common Mistakes ONLY if non-empty
        if (!document.querySelector('.mistakes-section') && data.commonMistakes && data.commonMistakes.length > 0) {
            const section = document.createElement('section');
            section.className = 'explanation-section mistakes-section';
            section.innerHTML = `
                <h2><i class="fas fa-exclamation-triangle"></i> Common Mistakes & Gotchas</h2>
                <div class="card" style="padding:1rem; border-left:4px solid #ff9800; background:#fffde7;">
                    <ul style="padding-left:1.2rem; margin:0;">
                        ${data.commonMistakes.map(m => `<li style="margin-bottom:0.3rem; color:#5d4037;">${m}</li>`).join('')}
                    </ul>
                </div>
            `;
            mainEl.appendChild(section);
        }

        // Render Practice Problems ONLY if non-empty
        if (!document.querySelector('.practice-problems-section') && data.practiceProblems && data.practiceProblems.length > 0) {
            const section = document.createElement('section');
            section.className = 'explanation-section practice-problems-section';
            section.innerHTML = `
                <h2><i class="fas fa-code"></i> Practice Problems</h2>
                <div style="display:flex; flex-direction:column; gap:0.5rem; margin-top:1rem;">
                    ${data.practiceProblems.map(p => `
                        <div class="card" style="padding:0.8rem 1.2rem; display:flex; justify-content:space-between; align-items:center; background:#fff;">
                            <span><i class="fas fa-external-link-alt" style="color:#1a237e; margin-right:8px;"></i> <strong>${p.title}</strong></span>
                            <span class="tag-${(p.level || 'medium').toLowerCase()}" style="padding:0.2rem 0.6rem; border-radius:4px; font-weight:bold; font-size:0.85rem;">${p.level}</span>
                        </div>
                    `).join('')}
                </div>
            `;
            mainEl.appendChild(section);
        }

        // Render Navigation Footer ONLY if non-empty
        if (!document.querySelector('.algo-nav-footer') && (data.prev || data.next)) {
            const footerNav = document.createElement('div');
            footerNav.className = 'algo-nav-footer';
            footerNav.style.cssText = 'display:flex; justify-content:space-between; margin-top:2.5rem; padding-top:1.5rem; border-top:2px solid #e0e0e0;';
            footerNav.innerHTML = `
                <a href="${data.prev?.url || '#'}" class="action-btn" style="text-decoration:none;"><i class="fas fa-arrow-left"></i> Previous: ${data.prev?.name || 'Algorithm'}</a>
                <a href="${data.next?.url || '#'}" class="action-btn" style="text-decoration:none;">Next: ${data.next?.name || 'Algorithm'} <i class="fas fa-arrow-right"></i></a>
            `;
            mainEl.appendChild(footerNav);
        }
    }

    document.addEventListener('DOMContentLoaded', hydrateMasterTemplate);
})();
