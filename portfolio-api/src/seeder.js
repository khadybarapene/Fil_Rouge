require('dotenv').config()
const connectDB = require('./config/connectdb')
const Project = require('./models/Project')

const projects = [
  {
    title: 'Dashboard Analytics',
    description: 'Une application de tableau de bord pour visualiser des données en temps réel.',
    technologies: ['React', 'Chart.js', 'Node.js'],
    githubUrl: 'https://github.com/khady-pene/dashboard-analytics',
    status: 'terminé'
  },
  {
    title: 'App E-Commerce Mobile',
    description: 'Application mobile avec panier et paiement sécurisé.',
    technologies: ['Flutter', 'Firebase', 'Stripe'],
    githubUrl: 'https://github.com/khady-pene/ecommerce-mobile',
    status: 'terminé'
  },
  {
    title: 'Portfolio Designer',
    description: 'Portfolio créatif avec galerie animée et mode sombre.',
    technologies: ['Vue.js', 'GSAP', 'Tailwind CSS'],
    githubUrl: 'https://github.com/khady-pene/portfolio-designer',
    status: 'terminé'
  },
  {
    title: 'Application de Gestion RH',
    description: 'Système complet de gestion des ressources humaines.',
    technologies: ['React', 'Spring Boot', 'MySQL'],
    githubUrl: 'https://github.com/khady-pene/gestion-rh',
    status: 'en_cours'
  }
]

const seedDB = async () => {
  try {
    await connectDB()
    await Project.deleteMany()
    await Project.insertMany(projects)
    console.log('✅ Base de données remplie avec succès !')
    process.exit()
  } catch (error) {
    console.log('❌ Erreur : ' + error.message)
    process.exit(1)
  }
}

seedDB()