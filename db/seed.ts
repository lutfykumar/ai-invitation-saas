import { db } from './index';
import { category, theme } from './schema';
import { nanoid } from 'nanoid';

const categories = [
  {
    id: nanoid(),
    name: 'Pernikahan',
    description: 'Undangan pernikahan yang elegan dan romantis',
    slug: 'wedding',
  },
  {
    id: nanoid(),
    name: 'Meeting / Reuni',
    description: 'Undangan untuk pertemuan resmi dan reuni',
    slug: 'meeting',
  },
  {
    id: nanoid(),
    name: 'Ulang Tahun / Hari Raya',
    description: 'Undangan untuk perayaan ulang tahun dan hari raya',
    slug: 'celebration',
  },
];

const themes = [
  // Wedding Themes
  {
    id: nanoid(),
    name: 'Elegant Rose Gold',
    description: 'Tema pernikahan elegan dengan aksen rose gold',
    slug: 'elegant-rose-gold',
    cssVariables: JSON.stringify({
      '--primary-color': '#E8B4B8',
      '--secondary-color': '#D4A574',
      '--text-color': '#2C3E50',
      '--background-color': '#FFFBFF',
      '--accent-color': '#C04000',
    }),
    templateHtml: `
      <div class="invitation-container">
        <div class="header">
          <h1>{{title}}</h1>
          <div class="decoration">❦</div>
        </div>
        <div class="content">
          <div class="main-content">{{content}}</div>
          <div class="event-details">
            <p><strong>Tanggal:</strong> {{event_date}}</p>
            <p><strong>Lokasi:</strong> {{event_location}}</p>
          </div>
          <div class="sender">Dari: {{sender_name}}</div>
        </div>
      </div>
    `,
    categoryId: categories[0].id,
  },
  // Meeting Themes
  {
    id: nanoid(),
    name: 'Professional Blue',
    description: 'Tema profesional yang cocok untuk meeting dan reuni',
    slug: 'professional-blue',
    cssVariables: JSON.stringify({
      '--primary-color': '#1E40AF',
      '--secondary-color': '#3B82F6',
      '--text-color': '#1F2937',
      '--background-color': '#F9FAFB',
      '--accent-color': '#059669',
    }),
    templateHtml: `
      <div class="invitation-container">
        <div class="header">
          <h1>{{title}}</h1>
          <div class="divider"></div>
        </div>
        <div class="content">
          <div class="main-content">{{content}}</div>
          <div class="event-details">
            <p><strong>Tanggal:</strong> {{event_date}}</p>
            <p><strong>Lokasi:</strong> {{event_location}}</p>
          </div>
        </div>
      </div>
    `,
    categoryId: categories[1].id,
  },
  // Celebration Themes
  {
    id: nanoid(),
    name: 'Festive Celebration',
    description: 'Tema ceria untuk perayaan ulang tahun dan hari raya',
    slug: 'festive-celebration',
    cssVariables: JSON.stringify({
      '--primary-color': '#F59E0B',
      '--secondary-color': '#EF4444',
      '--text-color': '#1F2937',
      '--background-color': '#FFFEF7',
      '--accent-color': '#10B981',
    }),
    templateHtml: `
      <div class="invitation-container">
        <div class="header">
          <h1>{{title}}</h1>
          <div class="celebration">🎉</div>
        </div>
        <div class="content">
          <div class="main-content">{{content}}</div>
          <div class="event-details">
            <p><strong>Tanggal:</strong> {{event_date}}</p>
            <p><strong>Lokasi:</strong> {{event_location}}</p>
          </div>
          <div class="sender">Dari: {{sender_name}}</div>
        </div>
      </div>
    `,
    categoryId: categories[2].id,
  },
];

async function seed() {
  try {
    console.log('🌱 Starting database seeding...');

    // Insert categories
    console.log('📁 Inserting categories...');
    await db.insert(category).values(categories);
    console.log(`✅ Inserted ${categories.length} categories`);

    // Insert themes
    console.log('🎨 Inserting themes...');
    await db.insert(theme).values(themes);
    console.log(`✅ Inserted ${themes.length} themes`);

    console.log('🎉 Database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

// Run seed if this file is executed directly
if (require.main === module) {
  seed();
}

export { seed };