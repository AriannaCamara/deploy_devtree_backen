import { CorsOptions } from 'cors'

export const corsConfig: CorsOptions = {
    origin: function (origin, callback) {
        const whiteList = [
            process.env.FRONTED_URL,
            'https://devtree-types.netlify.app',
            undefined
        ]

        console.log('🔍 CORS Origin:', origin)
        console.log('📦 FRONTED_URL desde .env:', process.env.FRONTED_URL)

        if (whiteList.includes(origin)) {
            callback(null, true)
        } else {
            callback(new Error('Error de CORS'))
        }
    }
}
