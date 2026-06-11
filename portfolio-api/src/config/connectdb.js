const mongoose = require('mongoose')

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI)
    console.log('✅ MongoDB connecté : ' + conn.connection.host)
  } catch (error) {
    console.log('❌ Erreur : ' + error.message)
    if (process.env.NODE_ENV !== 'test') process.exit(1)
  }
}

module.exports = connectDB