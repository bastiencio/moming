import { CONFIG } from '../config.js';

export class UI {
  constructor() {
    this.translations = {
      en: {
        title: "Our Venues",
        subtitle: "Discover the locations where you can experience MoMing Kombucha",
        loading: "Loading venues...",
        error: "Failed to load venues. Please try again later.",
        retry: "Retry",
        active: "Active",
        inactive: "Inactive",
        country: "Country",
        city: "City",
        location: "Location",
        description: "Description",
        noVenues: "No venues found"
      },
      zh: {
        title: "我们的场所",
        subtitle: "发现您可以体验 MoMing 康普茶的地点",
        loading: "加载场所...",
        error: "加载场所失败。请稍后再试。",
        retry: "重试",
        active: "活跃",
        inactive: "不活跃",
        country: "国家",
        city: "城市",
        location: "位置",
        description: "描述",
        noVenues: "未找到场所"
      }
    };
  }
  
  showLoading() {
    document.getElementById('loading').classList.remove('hidden');
    document.getElementById('error').classList.add('hidden');
    document.getElementById('venues-container').innerHTML = '';
  }
  
  hideLoading() {
    document.getElementById('loading').classList.add('hidden');
  }
  
  showError() {
    document.getElementById('loading').classList.add('hidden');
    document.getElementById('error').classList.remove('hidden');
  }
  
  updateLanguageButtons(language) {
    const enBtn = document.getElementById('en-btn');
    const zhBtn = document.getElementById('zh-btn');
    
    if (language === 'en') {
      enBtn.classList.remove('bg-amber-800');
      enBtn.classList.add('bg-amber-600');
      zhBtn.classList.remove('bg-amber-600');
      zhBtn.classList.add('bg-amber-800');
    } else {
      zhBtn.classList.remove('bg-amber-800');
      zhBtn.classList.add('bg-amber-600');
      enBtn.classList.remove('bg-amber-600');
      enBtn.classList.add('bg-amber-800');
    }
  }
  
  updateTexts(language) {
    document.getElementById('venues-title').textContent = this.translations[language].title;
    document.getElementById('venues-subtitle').textContent = this.translations[language].subtitle;
    document.getElementById('loading').querySelector('p').textContent = this.translations[language].loading;
    document.getElementById('error').querySelector('p').textContent = this.translations[language].error;
    document.getElementById('retry-btn').textContent = this.translations[language].retry;
  }
  
  renderVenues(venues, language) {
    const container = document.getElementById('venues-container');
    
    if (venues.length === 0) {
      container.innerHTML = `
        <div class="col-span-full text-center py-12">
          <i class="fas fa-store-slash text-4xl text-gray-400 mb-4"></i>
          <p class="text-gray-600 text-lg">${this.translations[language].noVenues}</p>
        </div>
      `;
      return;
    }
    
    container.innerHTML = venues.map(venue => this.createVenueCard(venue, language)).join('');
  }
  
  createVenueCard(venue, language) {
    return `
      <div class="venue-card bg-white rounded-xl overflow-hidden shadow-lg">
        ${venue.picture_url ? `
          <div class="h-48 overflow-hidden">
            <img src="${venue.picture_url}" 
                 alt="${language === 'en' ? venue.name_en : (venue.name_zh || venue.name_en)}" 
                 class="w-full h-full object-cover">
          </div>
        ` : `
          <div class="h-48 bg-amber-100 flex items-center justify-center">
            <i class="fas fa-store text-4xl text-amber-400"></i>
          </div>
        `}
        <div class="p-6">
          <div class="flex justify-between items-start">
            <h3 class="text-xl font-bold text-gray-800 brand-font">
              ${language === 'en' ? venue.name_en : (venue.name_zh || venue.name_en)}
            </h3>
            <span class="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
              ${this.translations[language].active}
            </span>
          </div>
          
          <div class="mt-4 space-y-2">
            <div class="flex items-center text-gray-600">
              <i class="fas fa-map-marker-alt mr-2 text-amber-600"></i>
              <span>${venue.city}, ${venue.country}</span>
            </div>
            
            ${venue.location ? `
              <div class="flex items-start text-gray-600">
                <i class="fas fa-location-arrow mr-2 mt-1 text-amber-600"></i>
                <span>${venue.location}</span>
              </div>
            ` : ''}
            
            ${venue.description_en || venue.description_zh ? `
              <div class="pt-3">
                <p class="text-gray-700 text-sm">
                  ${language === 'en' ? (venue.description_en || venue.description_zh) : (venue.description_zh || venue.description_en)}
                </p>
              </div>
            ` : ''}
          </div>
        </div>
      </div>
    `;
  }
}