import { DataSource } from 'typeorm';
import { Local } from './entities/local.entity';

const AppDataSource = new DataSource({
  type: 'mariadb',
  host: '51.15.231.248',
  port: 3306,
  username: 'eric',
  password: 'eric2024_2025',
  database: 'projet',
  entities: [Local],
  synchronize: true,
});

const seedLocals = [
  {
    city: 'Paris',
    address: '110 Rue de Flandre, 75019 Paris',
    latitude: 48.890055,
    longitude: 2.379440,
    capacity: 100,
    active: true,
  },
  {
    city: 'Marseille',
    address: 'Gare Saint-Charles, Marseille',
    latitude: 43.303014,
    longitude: 5.380046,
    capacity: 80,
    active: true,
  },
  {
    city: 'Lyon',
    address: '18 Rue du Dauphiné, 69003 Lyon',
    latitude: 45.756492,
    longitude: 4.870785,
    capacity: 75,
    active: true,
  },
  {
    city: 'Lille',
    address: '1 Boulevard de la Liberté, 59800 Lille',
    latitude: 50.632175,
    longitude: 3.058491,
    capacity: 60,
    active: true,
  },
  {
    city: 'Montpellier',
    address: '121 Rue de la Galéra, 34090 Montpellier',
    latitude: 43.630712,
    longitude: 3.862996,
    capacity: 50,
    active: true,
  },
  {
    city: 'Rennes',
    address: "4 Rue de l'Alma, 35000 Rennes",
    latitude: 48.106481,
    longitude: -1.674621,
    capacity: 55,
    active: true,
  },
];

AppDataSource.initialize()
  .then(async () => {
    const repo = AppDataSource.getRepository(Local);
    for (const data of seedLocals) {
      const exists = await repo.findOneBy({ city: data.city });
      if (!exists) {
        const local = repo.create(data);
        await repo.save(local);
        console.log(`✔ Inserted: ${data.city}`);
      } else {
        console.log(`↪ Skipped (already exists): ${data.city}`);
      }
    }
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  });
