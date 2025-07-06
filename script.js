// script.js - Cleaned and Rearranged Version by ChatGPT & Manika 💛

window.onload = function () {
  // ===== DOM ELEMENTS =====
  const container = document.getElementById('countries-container');
  const searchInput = document.getElementById('searchInput');
  const mainHeading = document.getElementById('mainHeading');
  const subHeading = document.getElementById('subHeading');
  const backToTopBtn = document.getElementById('backToTop');
  const themeToggle = document.getElementById('themeToggle');
  const themeIcon = document.getElementById('themeIcon');

  // ===== STATE VARIABLES =====
  let allCountries = [];
  let currentCountries = [];
  let sortOrder = {
    name: 'asc',
    capital: 'asc',
    population: 'desc'
  };

  // ===== FETCH & INITIAL RENDER =====
  fetch('https://restcountries.com/v3.1/all?fields=name,capital,languages,population,flags')
    .then(response => response.json())
    .then(countries => {
      allCountries = countries;
      currentCountries = [...allCountries];
      mainHeading.textContent = `Currently, we have ${allCountries.length} countries`;
      renderCountries(currentCountries);
      drawPopulationGraph(currentCountries, 'population');
    })
    .catch(error => console.error('Error fetching countries:', error));

  // ===== RENDER COUNTRIES =====
  function renderCountries(countries) {
    container.innerHTML = '';
    countries.forEach(country => {
      const card = document.createElement('div');
      card.className = 'country-card';

      const name = country.name.common;
      const capital = country.capital ? country.capital[0] : 'N/A';
      const languages = country.languages ? Object.values(country.languages).join(', ') : 'N/A';
      const population = country.population.toLocaleString();
      const flag = country.flags?.png || '';

      card.innerHTML = `
        <img src="${flag}" alt="Flag of ${name}" />
        <h2>${name}</h2>
        <p><strong>Capital:</strong> ${capital}</p>
        <p><strong>Languages:</strong> ${languages}</p>
        <p><strong>Population:</strong> ${population}</p>
      `;

      container.appendChild(card);
    });
  }

  // ===== SEARCH BAR =====
  searchInput.addEventListener('input', (event) => {
    const searchText = event.target.value.toLowerCase();

    currentCountries = allCountries.filter(country => {
      const name = country.name.common.toLowerCase();
      const capital = Array.isArray(country.capital) && country.capital[0] ? country.capital[0].toLowerCase() : '';
      const languages = country.languages ? Object.values(country.languages).join(', ').toLowerCase() : '';

      return name.includes(searchText) || capital.includes(searchText) || languages.includes(searchText);
    });

    renderCountries(currentCountries);
    drawPopulationGraph(currentCountries, 'population');

    if (searchText === '') subHeading.textContent = '';
    else if (currentCountries.length === 0) subHeading.textContent = `No countries matched your search.`;
    else if (currentCountries.length === 1) subHeading.textContent = `1 country matched your search.`;
    else subHeading.textContent = `${currentCountries.length} countries matched your search.`;
  });

  // ===== SORTING =====
document.getElementById('sortName').addEventListener('click', () => {
  const direction = sortOrder.name;

  currentCountries.sort((a, b) => {
    if (direction === 'asc') {
      return a.name.common.localeCompare(b.name.common);
    } else {
      return b.name.common.localeCompare(a.name.common);
    }
  });

  if (direction === 'asc') {
    sortOrder.name = 'desc';
  } else {
    sortOrder.name = 'asc';
  }

  updateSortArrows('name', sortOrder.name);
  renderCountries(currentCountries);
  drawPopulationGraph(currentCountries, 'population');
});

  document.getElementById('sortCapital').addEventListener('click', () => {
    const direction = sortOrder.capital;
    currentCountries.sort((a, b) => {
      const capA = (a.capital && a.capital[0]) ? a.capital[0].toLowerCase() : '';
      const capB = (b.capital && b.capital[0]) ? b.capital[0].toLowerCase() : '';
      return direction === 'asc' ? capA.localeCompare(capB) : capB.localeCompare(capA);
    });
    sortOrder.capital = direction === 'asc' ? 'desc' : 'asc';
    updateSortArrows('capital', sortOrder.capital);
    renderCountries(currentCountries);
    drawPopulationGraph(currentCountries, 'population');
  });

  document.getElementById('sortPopulation').addEventListener('click', () => {
    const direction = sortOrder.population;
    currentCountries.sort((a, b) => direction === 'asc' ? a.population - b.population : b.population - a.population);
    sortOrder.population = direction === 'asc' ? 'desc' : 'asc';
    updateSortArrows('population', sortOrder.population);
    renderCountries(currentCountries);
    drawPopulationGraph(currentCountries, 'population');
  });

  // ===== GRAPH SECTION =====
  document.getElementById('btnPopulation').addEventListener('click', () => {
    drawPopulationGraph(currentCountries, 'population');
  });

  document.getElementById('btnLanguages').addEventListener('click', () => {
    drawPopulationGraph(currentCountries, 'languages');
  });

  document.getElementById('showGraphBtn').addEventListener('click', () => {
    document.getElementById('population-graph').scrollIntoView({ behavior: 'smooth' });
  });

  function drawPopulationGraph(countriesToShow, type = 'population') {
    const graphBars = document.getElementById('graph-bars');
    graphBars.innerHTML = '';

    if (type === 'population') {
      const total = allCountries.reduce((sum, c) => sum + c.population, 0);
      graphBars.innerHTML += createBar('🌍 World', total, total);

      [...countriesToShow]
        .sort((a, b) => b.population - a.population)
        .slice(0, 10)
        .forEach(c => graphBars.innerHTML += createBar(c.name.common, c.population, total));
    } else if (type === 'languages') {
      const langMap = {};
      allCountries.forEach(c => {
        if (c.languages) {
          Object.values(c.languages).forEach(lang => langMap[lang] = (langMap[lang] || 0) + 1);
        }
      });
      const sorted = Object.entries(langMap).map(([lang, count]) => ({ lang, count })).sort((a, b) => b.count - a.count).slice(0, 10);
      const max = sorted[0].count;
      sorted.forEach(item => graphBars.innerHTML += createBar(item.lang, item.count, max));
    }
  }

  function createBar(label, value, max) {
    const percent = (value / max) * 100;
    return `
      <div style="display:flex; align-items:center; margin:10px 0;">
        <div style="width:150px;">${label}</div>
        <div style="flex:1; background:#ccc; height:30px; position:relative; border-radius:4px;">
          <div style="width:${percent}%; height:100%; background:gold; border-radius:4px;"></div>
        </div>
        <div style="width:120px; text-align:right;">${value.toLocaleString()}</div>
      </div>
    `;
  }

  // ===== SCROLL TO TOP =====
  window.addEventListener('scroll', () => {
    backToTopBtn.style.display = window.scrollY > 300 ? 'block' : 'none';
  });

  backToTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // ===== SORT ARROW ICONS =====
  function updateSortArrows(activeKey, direction) {
    const buttons = {
      name: document.querySelector('#sortName .arrow'),
      capital: document.querySelector('#sortCapital .arrow'),
      population: document.querySelector('#sortPopulation .arrow')
    };

    for (let key in buttons) buttons[key].textContent = '';
    buttons[activeKey].innerHTML = direction === 'asc' 
      ? '<i class="fas fa-chevron-up"></i>' 
      : '<i class="fas fa-chevron-down"></i>';
  }

  // ===== THEME TOGGLE =====
  themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    themeIcon.classList.toggle('fa-toggle-off', !isDark);
    themeIcon.classList.toggle('fa-toggle-on', isDark);
  });
};
