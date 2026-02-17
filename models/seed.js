/**
 * Seed script – populates the database with sample children's books.
 * Run with: npm run seed
 */

'use strict';

require('dotenv').config();
const db   = require('./database');
const Book = require('./Book');

const sampleBooks = [
  {
    title: 'The Whispering Woods',
    slug: 'the-whispering-woods',
    author: 'Aida',
    description: 'A magical tale of friendship between a shy fox and a brave little girl who discover that the forest speaks to those who listen.',
    long_description: 'Deep in a forest where the trees hum lullabies and the streams tell stories, a shy fox named Ember meets a courageous girl named Lily. Together they embark on a journey to find the legendary Whispering Tree—the oldest tree in the woods that holds the secret to true friendship. Along the way they learn that courage is not about being fearless, but about being kind even when you are afraid. Beautifully illustrated, this tale will captivate young readers and remind them of the magic hidden in everyday kindness.',
    price: 14.99,
    cover_image: '/images/book-whispering-woods.jpg',
    age_range: '4–8',
    pages: 32,
    isbn: '978-0-0000-0001-1',
    featured: true
  },
  {
    title: 'Captain Stardust and the Moon Pirates',
    slug: 'captain-stardust-moon-pirates',
    author: 'Aida',
    description: 'Blast off on an interstellar adventure with Captain Stardust as she outwits the mischievous Moon Pirates!',
    long_description: 'When seven-year-old Mia puts on her grandmother\'s old astronaut helmet, she transforms into Captain Stardust—the bravest space explorer in the galaxy. On a routine mission to deliver star-cookies to the International Space Station she encounters the Moon Pirates, a ragtag crew who have been stealing moonbeams. With clever thinking and a little help from her robot cat, Pixel, Captain Stardust must outsmart the pirates and return the moonlight before Earth\'s nighttime goes dark forever.',
    price: 15.99,
    cover_image: '/images/book-captain-stardust.jpg',
    age_range: '5–9',
    pages: 40,
    isbn: '978-0-0000-0002-8',
    featured: true
  },
  {
    title: 'The Garden of Words',
    slug: 'the-garden-of-words',
    author: 'Aida',
    description: 'In a world where words grow on trees, one child discovers the power of language to change everything.',
    long_description: 'Oliver has always had trouble finding the right words. Then one morning he stumbles upon a hidden garden where letters sprout from the soil and sentences hang from branches like fruit. The garden\'s wise old gardener teaches Oliver that words, like plants, must be tended with care—kind words bloom into beautiful flowers, while harsh words grow into thorny weeds. A lyrical, heartfelt story about empathy, communication, and the incredible impact our words have on the people around us.',
    price: 13.99,
    cover_image: '/images/book-garden-of-words.jpg',
    age_range: '4–7',
    pages: 28,
    isbn: '978-0-0000-0003-5',
    featured: true
  },
  {
    title: 'Bubbles the Brave Little Fish',
    slug: 'bubbles-the-brave-little-fish',
    author: 'Aida',
    description: 'Bubbles, the tiniest fish in the reef, proves that even the smallest among us can make the biggest difference.',
    long_description: 'Bubbles is the smallest fish on Rainbow Reef, and the bigger fish never let him forget it. But when a terrible storm threatens to destroy the coral homes, Bubbles discovers a hidden underwater cave that could shelter everyone. The only problem? The entrance is so small that only he can swim through it to open the passage from the other side. An uplifting story about self-worth, bravery, and the strength found in our differences.',
    price: 12.99,
    cover_image: '/images/book-bubbles-fish.jpg',
    age_range: '3–6',
    pages: 24,
    isbn: '978-0-0000-0004-2',
    featured: false
  },
  {
    title: 'The Color Thief',
    slug: 'the-color-thief',
    author: 'Aida',
    description: 'When all the colors vanish from the town, twins Maya and Max must find the mysterious Color Thief before it's too late.',
    long_description: 'One grey morning Maya and Max wake up to find that every color in their town of Paintville has disappeared. Flowers are grey, the sky is white, and even the rainbow is gone. Following a trail of faint color drops, the twins track down the Color Thief—a lonely cloud named Nimbus who just wanted to feel vibrant for once. Instead of punishing him, the twins teach Nimbus that sharing color makes the world brighter for everyone, including him. A touching lesson in generosity and inclusion.',
    price: 14.49,
    cover_image: '/images/book-color-thief.jpg',
    age_range: '4–8',
    pages: 36,
    isbn: '978-0-0000-0005-9',
    featured: false
  },
  {
    title: 'My Teacher Is a Dragon',
    slug: 'my-teacher-is-a-dragon',
    author: 'Aida',
    description: 'What happens when the new substitute teacher is a real, fire-breathing dragon?',
    long_description: 'When Ms. Fernandez goes on maternity leave, Oakwood Elementary gets the most unusual substitute teacher ever—Mr. Drake, a ten-foot-tall, wing-flapping, fire-breathing dragon. At first the children are terrified, but Mr. Drake turns every lesson into an adventure: math becomes treasure counting, science is potion mixing, and P.E. involves flying laps around the school. By the time Ms. Fernandez returns, the kids don\'t want Mr. Drake to leave. A hilarious and warm story about accepting those who are different.',
    price: 15.49,
    cover_image: '/images/book-teacher-dragon.jpg',
    age_range: '5–9',
    pages: 44,
    isbn: '978-0-0000-0006-6',
    featured: true
  }
];

// Clear existing books and re-seed
const deleteAll = db.prepare('DELETE FROM books');
const insertBook = db.prepare(`
  INSERT INTO books (title, slug, author, description, long_description, price, cover_image, age_range, pages, isbn, featured)
  VALUES (@title, @slug, @author, @description, @long_description, @price, @cover_image, @age_range, @pages, @isbn, @featured)
`);

const seedAll = db.transaction(() => {
  deleteAll.run();
  for (const book of sampleBooks) {
    insertBook.run({ ...book, featured: book.featured ? 1 : 0 });
  }
});

seedAll();

console.log(`✓ Seeded ${sampleBooks.length} books into the database.`);
process.exit(0);
