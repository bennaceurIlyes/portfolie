document.addEventListener('DOMContentLoaded', () => {
    const menuBtn = document.querySelector('.menu-btn');
    const navLinks = document.querySelector('.links');
    const menuIcon = menuBtn?.querySelector('i');

    const toggleMenu = () => {
        if (!menuBtn || !navLinks) return;
        const isOpen = navLinks.classList.toggle('active');
        menuBtn.classList.toggle('active', isOpen);
        menuBtn.setAttribute('aria-expanded', String(isOpen));

        if (menuIcon) {
            menuIcon.classList.toggle('fa-bars', !isOpen);
            menuIcon.classList.toggle('fa-times', isOpen);
        }
    };

    if (menuBtn && navLinks) {
        menuBtn.addEventListener('click', (event) => {
            event.stopPropagation();
            toggleMenu();
        });

        document.addEventListener('click', (event) => {
            if (!navLinks.contains(event.target) && !menuBtn.contains(event.target)) {
                if (navLinks.classList.contains('active')) {
                    toggleMenu();
                }
            }
        });

        navLinks.querySelectorAll('a').forEach((link) => {
            link.addEventListener('click', () => {
                if (navLinks.classList.contains('active')) {
                    toggleMenu();
                }
            });
        });

        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && navLinks.classList.contains('active')) {
                toggleMenu();
            }
        });
    }

    const yearEl = document.getElementById('current-year');
    if (yearEl) {
        yearEl.textContent = new Date().getFullYear();
    }

    const isProjectPage = document.body.classList.contains('project-page');
    const githubUsername = document.body.dataset.githubUsername || 'BennaceurIlyes';

    const featuredContainer = document.getElementById('featured-projects');
    const projectGrid = document.getElementById('project-grid');
    const emptyState = document.querySelector('.empty-state');
    const filterInput = document.querySelector('[data-filter-input]');
    const navSearchInputs = document.querySelectorAll('.search');
    const languageChips = document.querySelectorAll('[data-filter]');

    let repositories = [];
    let activeLanguage = 'all';

    const formatDate = (value) => {
        try {
            return new Intl.DateTimeFormat('en', { month: 'short', year: 'numeric' }).format(new Date(value));
        } catch (error) {
            return '';
        }
    };

    const createProjectCard = (repo) => {
        const card = document.createElement('article');
        card.className = 'project-card';

        const title = document.createElement('h3');
        title.textContent = repo.name.replace(/[-_]/g, ' ');
        card.appendChild(title);

        if (repo.description) {
            const description = document.createElement('p');
            description.textContent = repo.description;
            card.appendChild(description);
        }

        const meta = document.createElement('div');
        meta.className = 'project-meta';

        const left = document.createElement('div');
        left.className = 'tag';
        left.innerHTML = `<i class="fa-solid fa-code"></i> ${repo.language || 'Other'}`;

        const right = document.createElement('div');
        right.className = 'project-links';

        const repoLink = document.createElement('a');
        repoLink.href = repo.html_url;
        repoLink.target = '_blank';
        repoLink.rel = 'noreferrer noopener';
        repoLink.innerHTML = '<i class="fa-brands fa-github"></i> View code';
        right.appendChild(repoLink);

        if (repo.homepage) {
            const liveLink = document.createElement('a');
            liveLink.href = repo.homepage;
            liveLink.target = '_blank';
            liveLink.rel = 'noreferrer noopener';
            liveLink.innerHTML = '<i class="fa-solid fa-arrow-up-right-from-square"></i> Live demo';
            right.appendChild(liveLink);
        }

        meta.appendChild(left);

        const stats = document.createElement('span');
        stats.className = 'tag';
        stats.innerHTML = `<i class="fa-solid fa-star"></i> ${repo.stargazers_count}`;
        meta.appendChild(stats);

        meta.appendChild(right);
        card.appendChild(meta);

        const updated = document.createElement('span');
        updated.className = 'tag';
        updated.innerHTML = `<i class="fa-regular fa-clock"></i> Updated ${formatDate(repo.pushed_at)}`;
        card.appendChild(updated);

        return card;
    };

    const renderFeaturedProjects = (repos) => {
        if (!featuredContainer) return;
        featuredContainer.innerHTML = '';

        if (!repos.length) {
            const info = document.createElement('p');
            info.textContent = 'No public projects found yet. Check back soon!';
            info.className = 'section-subtitle';
            featuredContainer.appendChild(info);
            return;
        }

        repos.slice(0, 3).forEach((repo) => {
            featuredContainer.appendChild(createProjectCard(repo));
        });
    };

    const renderProjectArchive = (repos) => {
        if (!projectGrid) return;
        projectGrid.innerHTML = '';

        if (!repos.length) {
            emptyState?.removeAttribute('hidden');
            return;
        }

        emptyState?.setAttribute('hidden', 'hidden');
        repos.forEach((repo) => {
            projectGrid.appendChild(createProjectCard(repo));
        });
    };

    const getActiveSearchTerm = () => {
        const activeInputs = Array.from(navSearchInputs).filter((input) => input.matches('[data-project-search], [data-filter-input]'));
        const values = activeInputs.map((input) => input.value.trim().toLowerCase()).filter(Boolean);

        const mainFilter = filterInput?.value?.trim().toLowerCase();
        if (mainFilter && !values.includes(mainFilter)) {
            values.push(mainFilter);
        }

        return values.join(' ');
    };

    const applyFilters = () => {
        if (!isProjectPage) return;
        const searchTerm = getActiveSearchTerm();

        const filtered = repositories.filter((repo) => {
            if (activeLanguage !== 'all') {
                if (activeLanguage === 'other') {
                    const supported = ['javascript', 'typescript', 'python'];
                    if (repo.language && supported.includes(repo.language.toLowerCase())) {
                        return false;
                    }
                } else if (!repo.language || repo.language.toLowerCase() !== activeLanguage) {
                    return false;
                }
            }

            if (!searchTerm) {
                return true;
            }

            const content = `${repo.name} ${repo.description || ''}`.toLowerCase();
            return content.includes(searchTerm);
        });

        renderProjectArchive(filtered);
    };

    const hydrateSearchFromQuery = () => {
        if (!isProjectPage) return;
        const params = new URLSearchParams(window.location.search);
        const term = params.get('search');
        if (term && filterInput) {
            filterInput.value = term;
        }
    };

    const initialiseSearchInputs = () => {
        navSearchInputs.forEach((input) => {
            input.addEventListener('keydown', (event) => {
                if (event.key === 'Enter') {
                    const value = input.value.trim();
                    if (!value) return;

                    if (input.hasAttribute('data-project-search') || isProjectPage) {
                        if (filterInput) {
                            filterInput.value = value;
                            applyFilters();
                        }
                    } else {
                        window.location.href = `project.html?search=${encodeURIComponent(value)}`;
                    }
                }
            });

            if (input.hasAttribute('data-project-search')) {
                input.addEventListener('input', () => {
                    if (filterInput) {
                        filterInput.value = input.value;
                        applyFilters();
                    }
                });
            }
        });

        filterInput?.addEventListener('input', applyFilters);
    };

    const initialiseLanguageChips = () => {
        languageChips.forEach((chip) => {
            chip.addEventListener('click', () => {
                activeLanguage = chip.dataset.filter || 'all';
                languageChips.forEach((c) => c.classList.toggle('is-active', c === chip));
                applyFilters();
            });
        });
    };

    const fetchRepositories = async () => {
        try {
            const response = await fetch(`https://api.github.com/users/${githubUsername}/repos?per_page=100&sort=updated`, {
                headers: {
                    Accept: 'application/vnd.github+json'
                }
            });

            if (!response.ok) {
                throw new Error(`GitHub API responded with ${response.status}`);
            }

            const data = await response.json();
            const publicRepos = data
                .filter((repo) => !repo.private && !repo.fork)
                .sort((a, b) => b.stargazers_count - a.stargazers_count || new Date(b.pushed_at) - new Date(a.pushed_at));

            repositories = publicRepos;

            if (featuredContainer) {
                renderFeaturedProjects(publicRepos);
            }

            if (isProjectPage) {
                hydrateSearchFromQuery();
                applyFilters();
            }
        } catch (error) {
            console.error('Unable to fetch repositories', error);
            const message = document.createElement('p');
            message.className = 'section-subtitle';
            message.textContent = 'Unable to load projects from GitHub at the moment. Please try again later.';

            if (featuredContainer) {
                featuredContainer.innerHTML = '';
                featuredContainer.appendChild(message.cloneNode(true));
            }

            if (projectGrid) {
                projectGrid.innerHTML = '';
                projectGrid.appendChild(message);
            }
        }
    };

    initialiseSearchInputs();
    initialiseLanguageChips();
    fetchRepositories();
});
