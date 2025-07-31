import express from 'express' // ESM Ecmascript modules
import cors from 'cors'
import 'dotenv/config'
import router from './router'
import { connectDB } from './config/db'
import { corsConfig } from './config/cors'

const app = express()
connectDB()

// CORS
app.use(cors(corsConfig))

// LEER DATOS DE FORMULARIO
app.use(express.json())

app.use('/', router)



export default app